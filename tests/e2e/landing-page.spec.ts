import { test, expect } from '@playwright/test';

test.describe('Landing Page Load', () => {
  test('should load without React initialization errors', async ({ page }) => {
    // Collect all console messages
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    page.on('requestfailed', request => {
      networkErrors.push(`Failed: ${request.url()}`);
    });

    // Navigate to the landing page
    await page.goto('https://sselfie.ai', { waitUntil: 'domcontentloaded' });

    // Wait for the page to load (longer timeout for lazy loading)
    await page.waitForTimeout(5000);

    // Check for React initialization errors
    const hasReactError = consoleErrors.some(err => 
      err.includes('Cannot read properties of undefined') ||
      err.includes('forwardRef') ||
      err.includes('require is not defined') ||
      err.includes('ReferenceError')
    );

    // Print all console output for debugging
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));

    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(err => console.log(err));

    console.log('\n=== NETWORK ERRORS ===');
    networkErrors.forEach(err => console.log(err));

    // Check if page loaded successfully
    const pageTitle = await page.title();
    console.log(`\nPage Title: ${pageTitle}`);

    // Check if root element is rendered
    const rootElement = await page.locator('#root').isVisible();
    console.log(`Root element visible: ${rootElement}`);

    // Get all script tags and their status
    const scripts = await page.locator('script').all();
    console.log(`\nTotal script tags: ${scripts.length}`);

    // Check for specific error patterns
    expect(hasReactError).toBe(false);
    expect(pageTitle).toContain('SSELFIE');
  });

  test('should load all required chunks', async ({ page }) => {
    const loadedChunks: string[] = [];
    const failedChunks: string[] = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/assets/js/')) {
        if (response.ok()) {
          loadedChunks.push(url.split('/').pop() || url);
        } else {
          failedChunks.push(`${url.split('/').pop()} (${response.status()})`);
        }
      }
    });

    await page.goto('https://sselfie.ai', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== LOADED CHUNKS ===');
    loadedChunks.forEach(chunk => console.log(`✓ ${chunk}`));

    console.log('\n=== FAILED CHUNKS ===');
    failedChunks.forEach(chunk => console.log(`✗ ${chunk}`));

    // Verify critical chunks loaded
    expect(loadedChunks.some(c => c.includes('react-core'))).toBe(true);
    expect(loadedChunks.some(c => c.includes('index'))).toBe(true);
    expect(failedChunks.length).toBe(0);
  });

  test('should have React available globally', async ({ page }) => {
    await page.goto('https://sselfie.ai', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if React is available
    const reactAvailable = await page.evaluate(() => {
      return typeof (window as any).React !== 'undefined';
    });

    console.log(`React available globally: ${reactAvailable}`);

    // Check if ReactDOM is available
    const reactDomAvailable = await page.evaluate(() => {
      return typeof (window as any).ReactDOM !== 'undefined';
    });

    console.log(`ReactDOM available globally: ${reactDomAvailable}`);

    // Try to access React.forwardRef
    const forwardRefAvailable = await page.evaluate(() => {
      try {
        return typeof (window as any).React?.forwardRef === 'function';
      } catch (e) {
        return false;
      }
    });

    console.log(`React.forwardRef available: ${forwardRefAvailable}`);
  });
});

