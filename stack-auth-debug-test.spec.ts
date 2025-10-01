import { test, expect } from '@playwright/test';

test.describe('Stack Auth Debug Test', () => {
  test('Debug authentication flow with comprehensive logging', async ({ page, context }) => {
    console.log('🔍 Starting Stack Auth debug test...');
    
    // Enable detailed logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
      } else if (msg.text().includes('🔍') || msg.text().includes('Stack')) {
        console.log('📝 Debug Log:', msg.text());
      }
    });

    // Track network requests
    const apiRequests: Array<{ url: string; method: string; headers: Record<string, string> }> = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
        console.log(`📡 API Request: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
      }
    });

    // Step 1: Navigate to the app
    console.log('📍 Step 1: Navigating to https://www.sselfie.ai');
    await page.goto('https://www.sselfie.ai');
    await page.waitForLoadState('networkidle');
    
    // Check initial cookies
    const initialCookies = await context.cookies();
    console.log('🍪 Initial cookies count:', initialCookies.length);
    console.log('🍪 Initial Stack cookies:', 
      initialCookies.filter(c => c.name.includes('stack')).map(c => ({ name: c.name, domain: c.domain }))
    );

    // Step 2: Look for sign-in button and click it
    console.log('📍 Step 2: Looking for authentication elements');
    
    // Wait a bit for the page to fully load
    await page.waitForTimeout(3000);
    
    // Try to find sign-in related elements
    const signInSelectors = [
      'button:has-text("Sign In")',
      'a:has-text("Sign In")',
      'button:has-text("Login")',
      'a:has-text("Login")',
      '[data-testid="sign-in"]',
      '.sign-in',
      '#sign-in'
    ];
    
    let signInButton = null;
    for (const selector of signInSelectors) {
      try {
        signInButton = await page.locator(selector).first();
        if (await signInButton.isVisible({ timeout: 1000 })) {
          console.log('✅ Found sign-in button with selector:', selector);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }

    if (!signInButton || !(await signInButton.isVisible())) {
      console.log('⚠️ No sign-in button found, checking page content...');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-no-signin-button.png', fullPage: true });
      
      // Log page title and some content
      console.log('📄 Page title:', await page.title());
      console.log('📄 Page URL:', page.url());
      
      // Check if user is already logged in
      const bodyText = await page.textContent('body');
      console.log('📄 Page contains "dashboard" or "profile":', 
        bodyText?.toLowerCase().includes('dashboard') || bodyText?.toLowerCase().includes('profile')
      );
      
      // Try to call /api/me directly to check authentication
      console.log('📍 Step 3: Testing /api/me endpoint directly');
      try {
        const response = await page.goto('https://www.sselfie.ai/api/me');
        console.log('🔍 /api/me status:', response?.status());
        
        if (response?.status() === 200) {
          const userData = await response.json();
          console.log('✅ User is authenticated! User data:', JSON.stringify(userData, null, 2));
        } else {
          console.log('❌ User not authenticated, /api/me returned:', response?.status());
        }
      } catch (error) {
        console.log('❌ Error calling /api/me:', error instanceof Error ? error.message : String(error));
      }
      
      return; // Exit early if no sign-in button
    }

    // Step 3: Click sign-in and monitor the flow
    console.log('📍 Step 3: Clicking sign-in button');
    await signInButton.click();
    
    // Wait for potential redirect or modal
    await page.waitForTimeout(3000);
    
    console.log('📄 Current URL after sign-in click:', page.url());
    
    // Check if we're on Stack Auth OAuth page
    if (page.url().includes('stack-auth.com') || page.url().includes('oauth')) {
      console.log('✅ Redirected to OAuth provider');
      
      // Take screenshot of OAuth page
      await page.screenshot({ path: 'debug-oauth-page.png', fullPage: true });
      
      // Look for OAuth provider buttons (Google, GitHub, etc.)
      const providerButtons = await page.locator('button, a').all();
      console.log('🔍 Found potential OAuth buttons:', providerButtons.length);
      
      // Try to find Google sign-in (most common)
      const googleButton = page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"]').first();
      if (await googleButton.isVisible({ timeout: 5000 })) {
        console.log('✅ Found Google OAuth button');
        // Note: We won't actually click it to avoid completing OAuth
      } else {
        console.log('⚠️ No Google OAuth button found');
      }
    }

    // Step 4: Check cookies after sign-in attempt
    const postSignInCookies = await context.cookies();
    console.log('🍪 Cookies after sign-in click:', postSignInCookies.length);
    console.log('🍪 Stack cookies after sign-in:', 
      postSignInCookies.filter(c => c.name.includes('stack')).map(c => ({ 
        name: c.name, 
        domain: c.domain,
        value: c.value.substring(0, 20) + '...' // First 20 chars only
      }))
    );

    // Step 5: Test the /api/me endpoint
    console.log('📍 Step 4: Testing /api/me authentication endpoint');
    
    // Go back to main domain first
    if (!page.url().includes('sselfie.ai')) {
      await page.goto('https://www.sselfie.ai');
      await page.waitForLoadState('networkidle');
    }
    
    try {
      const meResponse = await page.goto('https://www.sselfie.ai/api/me');
      console.log('🔍 /api/me response status:', meResponse?.status());
      
      if (meResponse?.status() === 401) {
        console.log('❌ Authentication failed - 401 Unauthorized');
        const errorText = await meResponse.text();
        console.log('🔍 Error response:', errorText);
      } else if (meResponse?.status() === 200) {
        console.log('✅ Authentication successful!');
        try {
          const userData = await meResponse.json();
          console.log('🔍 User data:', JSON.stringify(userData, null, 2));
        } catch (e) {
          console.log('⚠️ Could not parse user data as JSON');
        }
      }
    } catch (error) {
      console.log('❌ Error testing /api/me:', error instanceof Error ? error.message : String(error));
    }

    // Step 6: Final cookie and local storage check
    console.log('📍 Step 5: Final state check');
    
    const finalCookies = await context.cookies();
    console.log('🍪 Final cookie count:', finalCookies.length);
    
    // Check for all Stack Auth related cookies
    const stackCookies = finalCookies.filter(c => 
      c.name.toLowerCase().includes('stack') || 
      c.name.includes('access') || 
      c.name.includes('token') ||
      c.name.includes('auth')
    );
    
    console.log('🍪 All auth-related cookies:');
    stackCookies.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 30)}... (domain: ${cookie.domain})`);
    });

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('stack') || key.includes('auth') || key.includes('token'))) {
          const value = window.localStorage.getItem(key);
          items[key] = (value?.substring(0, 30) || '') + '...';
        }
      }
      return items;
    });
    
    console.log('💾 Auth-related localStorage:', localStorage);

    // Final screenshot
    await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
    
    console.log('🎯 Debug test completed!');
    console.log('📊 Summary:');
    console.log('  - Initial cookies:', initialCookies.length);
    console.log('  - Final cookies:', finalCookies.length);
    console.log('  - Stack cookies found:', stackCookies.length);
    console.log('  - API requests made:', apiRequests.length);
    
    // Print API requests summary
    if (apiRequests.length > 0) {
      console.log('📡 API Requests Summary:');
      apiRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url}`);
      });
    }
  });
});