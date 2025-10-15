import { test, expect } from '@playwright/test';

test.describe('Stack Auth Provider Initialization', () => {
  test('should initialize Stack Auth provider', async ({ page }) => {
    // Add console listeners for debugging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log('🔥 Browser Error:', text);
      } else if (text.includes('Stack') || text.includes('Auth')) {
        console.log(`🔐 [${type}] Auth Log:`, text);
      }
    });

    // Load the handler sign-in page directly (bypassing router)
    await page.goto('http://localhost:5173/handler/sign-in');
    await page.waitForLoadState('networkidle');

    // Check for Stack Auth initialization
    const stackAuthState = await page.evaluate(() => {
      return {
        stackClientApp: !!(window as any).stackClientApp,
        stackProvider: !!(window as any).__STACK_AUTH_PROVIDER__,
      };
    });

    // Verify Stack Auth is initialized
    expect(stackAuthState.stackClientApp, 'Stack Auth client app should be initialized').toBe(true);
    expect(stackAuthState.stackProvider, 'Stack Auth provider should be mounted').toBe(true);

    // Check for any provider errors
    const errors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div'))
        .map(el => el.textContent)
        .filter(text => text?.includes('useStackApp must be used within a StackProvider'));
    });

    expect(errors, { message: 'No Stack Auth provider errors should be present' }).toHaveLength(0);

    // Verify Stack Auth handler component is rendered
    const stackHandlerEl = await page.$('[data-stack-auth]');
    expect(stackHandlerEl, 'Stack Auth handler should be rendered').toBeTruthy();
  });
});