import { test, expect } from '@playwright/test';

test.describe('Complete OAuth Flow End-to-End Test', () => {
  test('Follow OAuth from click to token setting', async ({ page, context }) => {
    console.log('🚀 Starting comprehensive OAuth flow test...');
    
    // Enable comprehensive logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('✅') || text.includes('❌') || text.includes('Stack')) {
        console.log(`[CONSOLE] ${text}`);
      }
    });

    // Track all network requests
    const networkLog: Array<{type: string; method?: string; status?: number; url: string; timestamp: number}> = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('stack-auth.com') || url.includes('google') || url.includes('oauth') || url.includes('auth') || url.includes('/handler/') || url.includes('/auth-success')) {
        networkLog.push({
          type: 'request',
          method: request.method(),
          url: url,
          timestamp: Date.now()
        });
        console.log(`📡 REQUEST: ${request.method()} ${url}`);
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('stack-auth.com') || url.includes('google') || url.includes('oauth') || url.includes('auth') || url.includes('/handler/') || url.includes('/auth-success')) {
        networkLog.push({
          type: 'response',
          status: response.status(),
          url: url,
          timestamp: Date.now()
        });
        console.log(`📡 RESPONSE: ${response.status()} ${url}`);
      }
    });

    // Track page navigations
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log(`🔄 NAVIGATION: ${frame.url()}`);
      }
    });

    // Step 1: Start from main page
    console.log('📍 Step 1: Loading main page');
    await page.goto('https://www.sselfie.ai');
    await page.waitForLoadState('networkidle');
    
    let cookies = await context.cookies();
    console.log('🍪 Initial cookies:', cookies.filter(c => c.name.includes('stack')).map(c => ({ name: c.name, domain: c.domain })));
    
    // Step 2: Click sign-in
    console.log('📍 Step 2: Clicking sign-in button');
    const signInButton = page.locator('button:has-text("Login")').first();
    await signInButton.click();
    await page.waitForTimeout(3000);
    
    console.log(`🔄 After sign-in click URL: ${page.url()}`);
    
    // Step 3: Find and click OAuth button
    console.log('📍 Step 3: Looking for OAuth providers');
    await page.screenshot({ path: 'oauth-flow-signin-page.png', fullPage: true });
    
    const googleButton = page.locator('button:has-text("Sign in with Google")').first();
    
    if (!(await googleButton.isVisible({ timeout: 5000 }))) {
      console.log('❌ Google OAuth button not found');
      return;
    }
    
    cookies = await context.cookies();
    console.log('🍪 Before OAuth click:', cookies.filter(c => c.name.includes('stack')).map(c => ({ name: c.name, domain: c.domain })));
    
    // Step 4: Click Google OAuth and monitor closely
    console.log('📍 Step 4: Clicking Google OAuth button');
    
    // Set up promise to wait for navigation or timeout
    const navigationPromise = page.waitForURL(/.*google.*/, { timeout: 15000 }).catch(() => {
      console.log('⏰ Navigation timeout - no redirect to Google occurred');
      return null;
    });
    
    await googleButton.click();
    console.log('✅ Google OAuth button clicked');
    
    // Wait for potential navigation to Google
    const navigationResult = await navigationPromise;
    
    if (navigationResult !== null && page.url().includes('google')) {
      console.log('✅ Successfully redirected to Google OAuth');
      console.log(`🔄 Google OAuth URL: ${page.url()}`);
      
      await page.screenshot({ path: 'oauth-flow-google-page.png', fullPage: true });
      
      // Step 5: Simulate OAuth completion (we won't actually authenticate)
      // Instead, let's manually navigate to what would be the callback URL
      console.log('📍 Step 5: Simulating OAuth callback completion');
      
      // Let's try to construct a callback URL manually to test the handler
      const callbackUrl = 'https://www.sselfie.ai/handler/oauth-callback?code=test_code&state=test_state';
      console.log(`🔄 Testing callback URL: ${callbackUrl}`);
      
      await page.goto(callbackUrl);
      await page.waitForLoadState('networkidle');
      
      console.log(`🔄 After callback URL: ${page.url()}`);
      
      cookies = await context.cookies();
      console.log('🍪 After callback simulation:', cookies.filter(c => c.name.includes('stack')).map(c => ({ name: c.name, domain: c.domain, value: c.value.substring(0, 20) + '...' })));
      
      await page.screenshot({ path: 'oauth-flow-callback-result.png', fullPage: true });
      
    } else {
      console.log('❌ Failed to navigate to Google OAuth');
      console.log(`🔄 Current URL: ${page.url()}`);
      
      // Check if we're stuck on the same page
      const currentContent = await page.textContent('body');
      if (currentContent?.includes('404') || currentContent?.includes('ERROR')) {
        console.log('❌ Ended up on error page instead of Google OAuth');
      }
    }
    
    // Step 6: Test direct OAuth callback handling
    console.log('📍 Step 6: Testing OAuth callback handler directly');
    
    const testCallbacks = [
      'https://www.sselfie.ai/handler/oauth-callback',
      'https://www.sselfie.ai/handler/oauth-callback?code=123&state=456',
    ];
    
    for (const callbackUrl of testCallbacks) {
      console.log(`🔄 Testing: ${callbackUrl}`);
      
      await page.goto(callbackUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const content = await page.textContent('body');
      const has404 = content?.includes('404') || content?.includes('ERROR');
      const hasAuthSuccess = content?.includes('Auth success') || page.url().includes('/auth-success');
      
      console.log(`  - Has 404/ERROR: ${has404}`);
      console.log(`  - Has Auth Success: ${hasAuthSuccess}`);
      console.log(`  - Final URL: ${page.url()}`);
      
      cookies = await context.cookies();
      const stackCookies = cookies.filter(c => c.name.includes('stack'));
      console.log(`  - Stack cookies: ${stackCookies.length}`);
    }
    
    // Step 7: Final network analysis
    console.log('📍 Step 7: Network analysis summary');
    console.log('📊 Network requests made:');
    networkLog.forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.type.toUpperCase()}: ${entry.method || entry.status} ${entry.url}`);
    });
    
    // Step 8: Test auth-success page directly
    console.log('📍 Step 8: Testing auth-success page handling');
    
    await page.goto('https://www.sselfie.ai/auth-success');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const finalContent = await page.textContent('body');
    const authSuccessWorking = !finalContent?.includes('404') && !finalContent?.includes('ERROR');
    
    console.log(`🎯 Auth success page working: ${authSuccessWorking}`);
    console.log(`🔄 Final URL after auth-success: ${page.url()}`);
    
    cookies = await context.cookies();
    console.log('🍪 Final cookie state:', cookies.filter(c => c.name.includes('stack')).map(c => ({ 
      name: c.name, 
      domain: c.domain, 
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly
    })));
    
    await page.screenshot({ path: 'oauth-flow-final-state.png', fullPage: true });
    
    console.log('🏁 OAuth flow test completed');
  });
});