# SSELFIE Studio E2E Tests

Comprehensive end-to-end tests for verifying the complete user journey and critical workflows.

## 🧪 Test Suites

### 1. Comprehensive User Journey (`comprehensive-user-journey.spec.ts`)
Complete end-to-end test covering:
- ✅ Homepage navigation
- ✅ User registration/signup
- ✅ Logout and login flow
- ✅ Onboarding process with selfie uploads
- ✅ AI model training workflow
- ✅ Studio navigation and Maya Chat
- ✅ Concept card generation
- ✅ Image generation with polling
- ✅ Image preview and interactions (favorite, download)
- ✅ Gallery verification

### 2. Maya AI Workflow (`maya-workflow.spec.ts`)
Focused tests for Maya AI functionality:
- 🤖 Maya chat interface
- 💡 Concept card generation
- 🖼️ Image generation and polling
- ❤️ Image interactions (preview, favorite, download)
- 📚 Gallery integration
- 🧠 Conversation context retention
- 🚨 Error handling and edge cases

## 🚀 Quick Start

### Prerequisites
1. **Install Playwright browsers:**
   ```bash
   npm run test:install
   ```

2. **Start development server:**
   ```bash
   npm run dev:client
   ```
   Server should be running on `http://localhost:5173`

3. **Ensure backend is running:**
   ```bash
   npm run dev:server
   ```

### Running Tests

#### Using the Test Runner (Recommended)
```bash
# Run comprehensive user journey test
npm run test:e2e comprehensive

# Run Maya workflow tests
npm run test:e2e maya

# Run all E2E tests
npm run test:e2e all

# Run with visible browser (helpful for debugging)
npm run test:e2e comprehensive --headed

# Run in debug mode (browser dev tools open)
npm run test:e2e debug

# Open Playwright UI for interactive testing
npm run test:e2e ui
```

#### Direct Playwright Commands
```bash
# Run comprehensive test
npm run test:e2e:comprehensive

# Run Maya workflow test
npm run test:e2e:maya

# Run with browser visible
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Open Playwright UI
npm run test:e2e:ui
```

## 📋 Test Configuration

### Timeouts
- **Global test timeout:** 5 minutes (300,000ms)
- **Expect timeout:** 30 seconds (30,000ms)
- **Image generation timeout:** 2 minutes (120,000ms)

### Browser Support
Tests run on:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- 📱 Mobile Chrome (Pixel 5)
- 📱 Mobile Safari (iPhone 12)

### Environment Variables
Set these in your `.env` file for test configuration:
```env
# Test environment (optional)
NODE_ENV=test

# Stack Auth configuration
STACK_AUTH_PROJECT_ID=your-project-id
VITE_STACK_PROJECT_ID=your-project-id

# Database connection
DATABASE_URL=your-test-database-url

# API Keys for testing
ANTHROPIC_API_KEY=your-anthropic-key
REPLICATE_API_TOKEN=your-replicate-token
```

## 🐛 Debugging Tests

### 1. Visual Debugging
```bash
# Run with browser visible
npm run test:e2e comprehensive --headed

# Run in debug mode (pauses execution)
npm run test:e2e debug
```

### 2. Playwright UI Mode
```bash
# Interactive test runner
npm run test:e2e ui
```

### 3. Test Artifacts
- **Screenshots:** Captured on test failure
- **Videos:** Recorded on failure
- **Traces:** Available for failed tests
- **Reports:** HTML report generated after test runs

### 4. Common Issues

#### Test Timeouts
- Increase timeout in `playwright.config.ts`
- Check if development server is running
- Verify database connectivity

#### Authentication Issues
- Verify Stack Auth configuration
- Check environment variables
- Ensure test user cleanup

#### Image Generation Failures
- Check Replicate API connectivity
- Verify user model training status
- Monitor generation polling logic

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── comprehensive-user-journey.spec.ts  # Complete user flow
│   └── maya-workflow.spec.ts               # Maya AI specific tests
├── fixtures/                               # Test data and fixtures
└── utils/                                  # Test helper utilities
```

## 🔧 Configuration Files

- **`playwright.config.ts`** - Main Playwright configuration
- **`scripts/test-runner.mjs`** - Custom test runner with helpful commands

## 📊 Test Reports

After running tests, view reports:
```bash
# Open HTML report
npx playwright show-report
```

Reports include:
- Test execution summary
- Step-by-step screenshots
- Error logs and stack traces
- Performance metrics

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npm run test:install
      
      - name: Run E2E tests
        run: npm run test:e2e:comprehensive
        env:
          CI: true
```

## 🎯 Test Strategy

### What We Test
- ✅ Critical user journeys end-to-end
- ✅ Authentication and authorization flows
- ✅ AI model training and image generation
- ✅ Maya AI conversation and concept generation
- ✅ Image management (save, favorite, download)
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

### What We Don't Test (Unit/Integration Tests)
- ❌ Individual component logic
- ❌ API endpoint functionality (covered by API tests)
- ❌ Database operations (covered by integration tests)
- ❌ Third-party service mocking

## 🤝 Contributing

### Adding New Tests
1. Create test file in `tests/e2e/`
2. Follow existing naming convention: `feature-name.spec.ts`
3. Use helper classes for common operations
4. Add appropriate timeouts for async operations
5. Include cleanup in `afterAll` hooks

### Test Best Practices
- **Isolate tests:** Each test should be independent
- **Use data attributes:** Prefer `[data-testid]` selectors
- **Handle async operations:** Use proper waits and timeouts
- **Clean up:** Remove test data after tests complete
- **Document edge cases:** Add comments for complex scenarios

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)