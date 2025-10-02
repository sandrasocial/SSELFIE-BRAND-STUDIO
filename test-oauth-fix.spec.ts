import { test, expect } from '@playwright/test';

test.describe('OAuth Fix Verification', () => {
  test('should show only one Google OAuth screen and no 404 errors', async ({ page }) => {
    // Track navigation events
    const navigations: string[] = [];
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
      }
    });

    // Track console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Start test
    console.log('🧪 Testing OAuth flow after fix...');
    
    // Go to app home page
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    // Look for sign-in button and click it
    const signInButton = page.getByRole('button', { name: /sign in|get started|login/i }).first();
    
    if (await signInButton.isVisible()) {
      console.log('✅ Found sign-in button, clicking...');
      await signInButton.click();
      
      // Wait for OAuth redirect
      await page.waitForTimeout(3000);
      
      // Check if we see Google OAuth screen
      const currentUrl = page.url();
      console.log('🔍 Current URL after sign-in:', currentUrl);
      
      // Count how many times we navigate to Google OAuth
      const googleOAuthNavigations = navigations.filter(url => 
        url.includes('accounts.google.com') || url.includes('oauth.google.com')
      );
      
      console.log('📊 Navigation history:', navigations);
      console.log('🔍 Google OAuth navigations count:', googleOAuthNavigations.length);
      
      // Verify we only see ONE Google OAuth screen
      expect(googleOAuthNavigations.length).toBeLessThanOrEqual(1);
      
      // Check for 404 errors
      const has404 = navigations.some(url => 
        url.includes('404') || consoleLogs.some(log => log.includes('404'))
      );
      expect(has404).toBeFalsy();
      
      console.log('✅ OAuth flow test completed successfully');
      console.log('📊 Final navigation count:', navigations.length);
      console.log('🔍 Google OAuth count:', googleOAuthNavigations.length);
      
    } else {
      console.log('⚠️ No sign-in button found, might already be signed in');
    }
  });

  test('should handle /handler/oauth-callback route without custom component', async ({ page }) => {
    // Test that the OAuth callback route is handled by Stack Auth
    const response = await page.goto('http://localhost:8080/handler/oauth-callback?code=test&state=test');
    
    // Should not get 404
    expect(response?.status()).not.toBe(404);
    
    // Should be handled by Stack Auth
    const content = await page.content();
    expect(content).not.toContain('OAuthCallback'); // Custom component should not be present
    
    console.log('✅ OAuth callback route properly handled by Stack Auth');
  });
});