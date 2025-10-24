import { test, expect } from '@playwright/test';

/**
 * Quick Authentication Flow Test
 * Tests the critical authentication issues found in production
 */

test.describe('Authentication Flow - Production Issues', () => {
  
  test('Check Stack Auth Configuration', async ({ page }) => {
    // Go to production site
    await page.goto('https://sselfie.ai');
    await page.waitForTimeout(3000);

    // Check Stack Auth initialization
    const authStatus = await page.evaluate(() => {
      return {
        // Check if Stack Auth is available
        hasStackAuth: typeof window !== 'undefined' && 'StackAuth' in window,
        
        // Check debug tools
        hasAuthDebug: typeof window !== 'undefined' && '__authDebug' in window,
        
        // Check cookies
        cookies: document.cookie,
        
        // Check localStorage for tokens
        localStorageKeys: Object.keys(localStorage).filter(key => 
          key.includes('stack') || key.includes('auth') || key.includes('token')
        ),
        
        // Try to get any Stack Auth state
        stackAuthState: typeof window !== 'undefined' && window.__authDebug ? 
          window.__authDebug : 'Not available'
      };
    });

    console.log('🔐 Stack Auth Status:', JSON.stringify(authStatus, null, 2));

    // Test API endpoints
    const apiTests = await page.evaluate(async () => {
      const results = [];
      
      // Test /api/me
      try {
        const meResponse = await fetch('/api/me', { credentials: 'include' });
        results.push({
          endpoint: '/api/me',
          status: meResponse.status,
          statusText: meResponse.statusText,
          body: await meResponse.text().catch(() => 'Cannot read body')
        });
      } catch (error) {
        results.push({
          endpoint: '/api/me', 
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Test Stack Auth endpoint
      try {
        const authResponse = await fetch('/api/auth/users/me', { credentials: 'include' });
        results.push({
          endpoint: '/api/auth/users/me',
          status: authResponse.status,
          statusText: authResponse.statusText,
          body: await authResponse.text().catch(() => 'Cannot read body')
        });
      } catch (error) {
        results.push({
          endpoint: '/api/auth/users/me',
          error: error instanceof Error ? error.message : String(error)
        });
      }

      return results;
    });

    console.log('🔗 API Test Results:', JSON.stringify(apiTests, null, 2));

    // Verify what we found matches the issues
    expect(authStatus.hasStackAuth).toBe(false); // Stack Auth not available
    expect(authStatus.localStorageKeys).toHaveLength(0); // No tokens in localStorage
    
    // Find the /api/me result
    const meResult = apiTests.find(r => r.endpoint === '/api/me');
    expect(meResult?.status).toBe(401); // Should be unauthorized

    // Find the Stack Auth result  
    const stackResult = apiTests.find(r => r.endpoint === '/api/auth/users/me');
    expect(stackResult?.status).toBe(400); // Should be bad request
  });

  test('Test Assets Loading', async ({ page }) => {
    const networkErrors: string[] = [];
    
    // Capture network failures
    page.on('requestfailed', (request) => {
      if (request.url().includes('assets.sselfie.ai')) {
        networkErrors.push(request.url());
      }
    });

    // Go to site
    await page.goto('https://sselfie.ai');
    await page.waitForTimeout(5000); // Wait for assets to attempt loading

    console.log('📸 Failed Assets:', networkErrors);

    // Should have failures for assets.sselfie.ai
    expect(networkErrors.length).toBeGreaterThan(0);
    expect(networkErrors.some(url => url.includes('assets.sselfie.ai'))).toBe(true);
  });

  test('Verify Basic Site Functionality', async ({ page }) => {
    // Ensure the site itself works despite auth/asset issues
    await page.goto('https://sselfie.ai');
    
    // Should load with proper title
    const title = await page.title();
    expect(title).toContain('SSELFIE');

    // Basic health endpoints should work
    const healthResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/simple-health');
        return {
          status: response.status,
          body: await response.json().catch(() => ({ error: 'Cannot parse JSON' }))
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });

    console.log('💚 Health Check:', JSON.stringify(healthResponse, null, 2));
    expect(healthResponse.status).toBe(200);
  });
});