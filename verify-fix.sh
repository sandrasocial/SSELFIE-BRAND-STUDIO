#!/bin/bash

echo "=========================================="
echo "VERIFICATION SCRIPT: Fix for Stuck Loading"
echo "=========================================="
echo ""

# Step 1: Build
echo "Step 1: Building the project..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    tail -5 /tmp/build.log
else
    echo "❌ Build failed"
    tail -20 /tmp/build.log
    exit 1
fi
echo ""

# Step 2: Check for console errors in E2E tests
echo "Step 2: Running E2E tests locally..."
echo "Starting dev server..."
npm run dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
sleep 10

echo "Running tests..."
npx playwright test tests/e2e/landing-page.spec.ts --reporter=list > /tmp/test.log 2>&1
TEST_RESULT=$?

# Kill dev server
kill $DEV_PID 2>/dev/null

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ E2E tests passed"
    # Check for console errors
    if grep -q "CONSOLE ERRORS" /tmp/test.log; then
        echo "Checking for errors in console output..."
        grep -A 5 "CONSOLE ERRORS" /tmp/test.log
    else
        echo "✅ No console errors detected"
    fi
else
    echo "❌ E2E tests failed"
    tail -50 /tmp/test.log
    exit 1
fi
echo ""

# Step 3: Summary
echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
echo "✅ Build: PASSED"
echo "✅ E2E Tests: PASSED"
echo "✅ App is ready for production"
echo ""
echo "Next steps:"
echo "1. git push origin main"
echo "2. Deploy to Vercel"
echo "3. Run production E2E tests"

