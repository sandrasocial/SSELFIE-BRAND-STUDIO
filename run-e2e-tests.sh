#!/bin/bash

# SSELFIE E2E Test Runner
# This script runs the complete user journey E2E tests

set -e

echo "🚀 SSELFIE E2E Test Runner"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dev server is running
echo -e "${BLUE}📋 Checking if dev server is running...${NC}"
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Dev server not running. Starting it now...${NC}"
  npm run dev > /tmp/dev-server.log 2>&1 &
  DEV_PID=$!
  echo -e "${BLUE}⏳ Waiting for dev server to start...${NC}"
  sleep 15
  
  # Check again
  if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Dev server failed to start${NC}"
    echo "Dev server log:"
    cat /tmp/dev-server.log
    exit 1
  fi
  echo -e "${GREEN}✅ Dev server started${NC}"
else
  echo -e "${GREEN}✅ Dev server is running${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Running E2E tests...${NC}"
echo ""

# Run the tests
npx playwright test tests/e2e/user-journey-complete.spec.ts \
  --reporter=list \
  --reporter=html \
  --workers=1 \
  2>&1 | tee /tmp/e2e-test-results.txt

TEST_EXIT_CODE=$?

echo ""
echo "=========================="
echo -e "${BLUE}📊 Test Results${NC}"
echo "=========================="
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "Test output:"
  cat /tmp/e2e-test-results.txt
fi

echo ""
echo -e "${BLUE}📈 Generating HTML report...${NC}"
npx playwright show-report 2>/dev/null || echo "Report available at: playwright-report/index.html"

echo ""
echo "=========================="
echo -e "${BLUE}📝 Test Summary${NC}"
echo "=========================="
echo ""
echo "Test file: tests/e2e/user-journey-complete.spec.ts"
echo "Test phases:"
echo "  - Phase 1: Business Landing Page"
echo "  - Phase 2: Simple Checkout Page"
echo "  - Phase 3: Payment Success Page"
echo "  - Phase 4: Simple Training Page"
echo "  - Phase 5: API Endpoints Verification"
echo "  - Phase 6: Environment Variables Verification"
echo "  - Phase 7: Error Handling"
echo ""

# Cleanup
if [ ! -z "$DEV_PID" ]; then
  echo -e "${BLUE}🧹 Cleaning up...${NC}"
  kill $DEV_PID 2>/dev/null || true
fi

exit $TEST_EXIT_CODE

