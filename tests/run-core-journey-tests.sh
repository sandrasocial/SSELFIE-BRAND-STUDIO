#!/bin/bash

# SSELFIE Studio - Core User Journey Test Runner
# This script validates that the entire app works end-to-end

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     SSELFIE Studio - Core User Journey Test Suite              ║"
echo "║     Testing: Build → API → UI → User Flow                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test() {
  local test_name=$1
  local status=$2
  
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $test_name"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $test_name"
    ((TESTS_FAILED++))
  fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "PHASE 1: Build Validation"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 1: Check if npm is installed
if command -v npm &> /dev/null; then
  print_test "npm is installed" "PASS"
else
  print_test "npm is installed" "FAIL"
  exit 1
fi

# Test 2: Check if dependencies are installed
if [ -d "node_modules" ]; then
  print_test "node_modules exists" "PASS"
else
  print_test "node_modules exists" "FAIL"
  echo "Installing dependencies..."
  npm install
fi

# Test 3: Build the project
echo ""
echo "Building project..."
if npm run build > /tmp/build.log 2>&1; then
  print_test "npm run build succeeds" "PASS"
else
  print_test "npm run build succeeds" "FAIL"
  echo "Build output:"
  tail -50 /tmp/build.log
fi

# Test 4: Check dist folder
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  print_test "dist/index.html exists" "PASS"
else
  print_test "dist/index.html exists" "FAIL"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "PHASE 2: Type Checking (Non-Blocking)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 5: Type check (non-blocking)
echo ""
echo "Running type-check..."
if npm run type-check > /tmp/type-check.log 2>&1; then
  print_test "npm run type-check passes" "PASS"
else
  ERROR_COUNT=$(grep -c "error TS" /tmp/type-check.log || echo "0")
  echo -e "${YELLOW}⚠️  Type-check has $ERROR_COUNT errors (non-blocking)${NC}"
  echo "First 10 errors:"
  grep "error TS" /tmp/type-check.log | head -10
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "PHASE 3: Runtime Tests (Playwright)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 6: Start dev server in background
echo ""
echo "Starting dev server..."
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!

# Wait for dev server to start
echo "Waiting for dev server to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Dev server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    print_test "Dev server starts" "FAIL"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

print_test "Dev server starts" "PASS"

# Test 7: Run Playwright tests
echo ""
echo "Running Playwright E2E tests..."
if npx playwright test tests/e2e/core-user-journey.spec.ts --reporter=list > /tmp/playwright.log 2>&1; then
  print_test "Playwright E2E tests pass" "PASS"
else
  print_test "Playwright E2E tests pass" "FAIL"
  echo "Test output:"
  tail -50 /tmp/playwright.log
fi

# Cleanup
kill $DEV_PID 2>/dev/null || true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "PHASE 4: Deployment Readiness"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 8: Check vercel.json exists
if [ -f "vercel.json" ]; then
  print_test "vercel.json exists" "PASS"
else
  print_test "vercel.json exists" "FAIL"
fi

# Test 9: Check environment variables
if [ -f ".env.example" ] || [ -f ".env.local" ]; then
  print_test "Environment configuration exists" "PASS"
else
  print_test "Environment configuration exists" "FAIL"
fi

# Test 10: Check critical files exist
CRITICAL_FILES=(
  "client/src/App.tsx"
  "server/[...route].ts"
  "shared/schema.ts"
  "package.json"
)

ALL_CRITICAL_EXIST=true
for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    ALL_CRITICAL_EXIST=false
    break
  fi
done

if [ "$ALL_CRITICAL_EXIST" = true ]; then
  print_test "All critical files exist" "PASS"
else
  print_test "All critical files exist" "FAIL"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "TEST SUMMARY"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo ""
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED - APP IS READY TO DEPLOY!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. npm run dev          # Run locally"
  echo "2. vercel --prod        # Deploy to production"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYING${NC}"
  exit 1
fi

