import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Set to false for user journey tests that may conflict
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Global timeout for each test */
  timeout: 5 * 60 * 1000, // 5 minutes for comprehensive tests
  /* Global timeout for each expect */
  expect: { timeout: 30 * 1000 }, // 30 seconds for expect assertions
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording for debugging */
    video: 'retain-on-failure',
    
    /* Ignore HTTPS errors for development */
    ignoreHTTPSErrors: true,
    
    /* Browser viewport */
    viewport: { width: 1280, height: 720 },
  },

  /* Global setup file */
  globalSetup: './tests/setup/auth.ts',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.PLAYWRIGHT_USE_PRODUCTION ? undefined : {
    command: 'pnpm dev:client',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});