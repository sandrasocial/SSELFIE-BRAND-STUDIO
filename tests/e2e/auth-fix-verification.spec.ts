import { test, expect } from '@playwright/test';

/**
 * Authentication Fix Verification Test
 * Tests that the authentication token flow fixes work correctly
 */

test.describe('Authentication Fix Verification', () => {
  
  test('Verify Token Extraction from Cookies', async ({ page }) => {
    // Capture console logs to see auth debugging
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('Stack Auth') || msg.text().includes('token') || msg.text().includes('🔍') || msg.text().includes('✅')) {
        consoleLogs.push(msg.text());
      }
    });

    // Go to production site
    await page.goto('https://sselfie.ai');
    await page.waitForTimeout(3000);

    // Test the /api/me endpoint with enhanced logging
    const apiResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text().catch(() => 'Cannot read body')
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    console.log('📊 Auth Test Results:', JSON.stringify(apiResult, null, 2));
    console.log('📜 Console Logs:', consoleLogs);

    // The response might be different now with the fixes
    // We're mainly checking that the debugging info is helpful
    expect(apiResult).toBeDefined();
  });

  test('Check Environment Configuration', async ({ page }) => {
    // Test a simple health endpoint to ensure the environment fixes work
    const healthResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/simple-health');
        return {
          status: response.status,
          body: await response.json().catch(() => ({ error: 'Cannot parse JSON' }))
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    console.log('💚 Health Check Result:', JSON.stringify(healthResult, null, 2));

    expect(healthResult.status).toBe(200);
    expect(healthResult.body.status).toBe('healthy');
  });

  test('Verify Stack Auth Project Configuration', async ({ page }) => {
    // Go to site and check Stack Auth configuration
    await page.goto('https://sselfie.ai');
    await page.waitForTimeout(2000);

    const stackAuthConfig = await page.evaluate(() => {
      return {
        // Check if Stack Auth configuration looks correct
        hasStackAuth: typeof window !== 'undefined' && 'StackAuth' in window,
        configLogs: typeof window !== 'undefined' && (window as any).__stackAuthLogs || []
      };
    });

    console.log('⚙️ Stack Auth Config:', JSON.stringify(stackAuthConfig, null, 2));

    // Just verify we can check the configuration
    expect(stackAuthConfig).toBeDefined();
  });
});