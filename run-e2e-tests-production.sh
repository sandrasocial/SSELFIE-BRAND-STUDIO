#!/bin/bash

# SSELFIE E2E Test Runner - Production Domain
# This script runs the complete user journey E2E tests against production

set -e

echo "🚀 SSELFIE E2E Test Runner - Production"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production domain
PROD_URL="${1:-https://sselfie-brand-studio-m3viu6517-sselfie-studio.vercel.app}"

echo -e "${BLUE}📋 Production Domain: ${PROD_URL}${NC}"
echo ""

# Check if production domain is reachable
echo -e "${BLUE}🔍 Checking if production domain is reachable...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Production domain is reachable${NC}"
else
  echo -e "${YELLOW}⚠️  Production domain may still be building...${NC}"
  echo "Waiting 30 seconds before retrying..."
  sleep 30
fi

echo ""
echo -e "${BLUE}🧪 Running E2E tests against production...${NC}"
echo ""

# Run the tests against production
PLAYWRIGHT_BASE_URL="$PROD_URL" npx playwright test tests/e2e/core-user-journey.spec.ts \
  --reporter=list \
  --reporter=html \
  --workers=1 \
  2>&1 | tee /tmp/e2e-test-results-prod.txt

TEST_EXIT_CODE=$?

echo ""
echo "========================================"
echo -e "${BLUE}📊 Test Results${NC}"
echo "========================================"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed on production!${NC}"
else
  echo -e "${RED}❌ Some tests failed on production${NC}"
  echo ""
  echo "Test output:"
  cat /tmp/e2e-test-results-prod.txt
fi

echo ""
echo -e "${BLUE}📈 Generating HTML report...${NC}"
npx playwright show-report 2>/dev/null || echo "Report available at: playwright-report/index.html"

echo ""
echo "========================================"
echo -e "${BLUE}📝 Test Summary${NC}"
echo "========================================"
echo ""
echo "Production Domain: $PROD_URL"
echo "Test file: tests/e2e/core-user-journey.spec.ts"
echo "Test phases:"
echo "  - Phase 1: Business Landing Page"
echo "  - Phase 2: Authentication Flow"
echo "  - Phase 3: Checkout Page"
echo "  - Phase 4: Protected Routes"
echo "  - Phase 5: API Health Check"
echo "  - Phase 6: React Query Configuration"
echo "  - Phase 7: Component Rendering"
echo "  - Phase 8: Build Output"
echo "  - Phase 9: TypeScript Runtime"
echo "  - Phase 10: Navigation"
echo "  - Phase 11: API Integration"
echo "  - Phase 12: Stack Auth Integration"
echo "  - Phase 13: Vercel Serverless"
echo "  - Phase 14: Build Readiness"
echo "  - Phase 15: Vite Optimization"
echo "  - Phase 16: Deployment Readiness"
echo ""

exit $TEST_EXIT_CODE

