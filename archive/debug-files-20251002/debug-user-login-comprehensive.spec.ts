import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Comprehensive User Login and Model Access Test', async ({ page, context }) => {
  console.log('🔐 Testing COMPLETE user authentication flow with model access');
  
  // Enable console and network logging
  page.on('console', msg => {
    console.log(`PAGE: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`❌ NETWORK FAIL: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`❌ HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  // Step 1: Test unauthenticated state
  console.log('📍 Step 1: Testing unauthenticated access to app...');
  await page.goto('https://www.sselfie.ai/app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  const currentUrl1 = page.url();
  console.log(`🔍 URL after /app access: ${currentUrl1}`);
  
  if (currentUrl1.includes('/sign-in') || currentUrl1.includes('/handler/sign-in')) {
    console.log('✅ Properly redirected to authentication');
  } else if (currentUrl1.includes('/app')) {
    console.log('⚠️  Stayed on /app - checking for auth state...');
  }
  
  await page.screenshot({ path: 'debug-app-access-unauth.png', fullPage: true });
  
  // Step 2: Go to sign-in and test OAuth flow
  console.log('📍 Step 2: Testing OAuth sign-in flow...');
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'debug-signin-page.png', fullPage: true });
  
  // Look for Google OAuth button
  const googleButton = await page.locator('button:has-text("Google"), button[data-provider="google"], button:has-text("Continue with Google")').first();
  const googleButtonExists = await googleButton.count() > 0;
  
  if (googleButtonExists) {
    console.log('✅ Google OAuth button found');
    
    // Test what happens when we click (but don't complete OAuth)
    await googleButton.click();
    await page.waitForTimeout(5000);
    
    const oauthUrl = page.url();
    console.log(`🔍 OAuth redirect URL: ${oauthUrl}`);
    
    if (oauthUrl.includes('accounts.google.com')) {
      console.log('✅ Successfully redirected to Google OAuth');
      // Go back to test the callback handling
      await page.goBack();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('❌ No Google OAuth button found');
  }
  
  // Step 3: Test authenticated state simulation
  console.log('📍 Step 3: Testing authentication cookies and session...');
  
  // Check current cookies
  const cookies = await context.cookies();
  console.log('🍪 Current cookies:', cookies.map(c => ({ name: c.name, domain: c.domain })));
  
  // Step 4: Test API endpoints that would be used after auth
  console.log('📍 Step 4: Testing authenticated API endpoints...');
  
  // Test /api/me endpoint
  const meResponse = await page.goto('https://www.sselfie.ai/api/me');
  const meStatus = meResponse?.status();
  console.log(`🔍 /api/me response: ${meStatus}`);
  
  if (meStatus === 200) {
    const meData = await page.textContent('pre') || await page.textContent('body');
    console.log('📝 /api/me data:', meData?.substring(0, 200));
  }
  
  // Test user models endpoint
  const modelsResponse = await page.goto('https://www.sselfie.ai/api/user-models');
  const modelsStatus = modelsResponse?.status();
  console.log(`🔍 /api/user-models response: ${modelsStatus}`);
  
  if (modelsStatus === 200) {
    const modelsData = await page.textContent('pre') || await page.textContent('body');
    console.log('📝 Models data:', modelsData?.substring(0, 200));
  }
  
  // Step 5: Test Stack Auth user state
  console.log('📍 Step 5: Testing Stack Auth user state...');
  await page.goto('https://www.sselfie.ai/');
  
  // Execute JavaScript to check Stack Auth state
  const authState = await page.evaluate(async () => {
    try {
      // Wait a moment for Stack Auth to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const stackAuthResult: any = {
        windowStackAvailable: !!(window as any).stackAuth,
        stackConfig: !!(window as any).__STACK_PROJECT_ID__,
        hasUser: false,
        userInfo: null,
        tokenExists: false,
        errorDetails: null
      };
      
      // Check if Stack Auth is available
      if ((window as any).stackAuth) {
        try {
          const user = await (window as any).stackAuth.getUser();
          stackAuthResult.hasUser = !!user;
          if (user) {
            stackAuthResult.userInfo = {
              id: user.id,
              email: user.primaryEmail,
              displayName: user.displayName
            };
          }
        } catch (error: any) {
          stackAuthResult.errorDetails = error.message;
        }
      }
      
      // Check for auth tokens in cookies or localStorage
      const cookieString = document.cookie;
      stackAuthResult.tokenExists = cookieString.includes('stack-access') || 
                                   cookieString.includes('stack-session') ||
                                   !!localStorage.getItem('stack-auth-token');
      
      return stackAuthResult;
    } catch (error: any) {
      return { error: error.message };
    }
  });
  
  console.log('🔍 Stack Auth State:', JSON.stringify(authState, null, 2));
  
  // Step 6: Test protection routes
  console.log('📍 Step 6: Testing protected routes...');
  
  const protectedRoutes = ['/app', '/app/simple-training', '/app/training'];
  
  for (const route of protectedRoutes) {
    await page.goto(`https://www.sselfie.ai${route}`);
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    const isRedirected = !finalUrl.includes(route);
    
    console.log(`🔍 ${route} -> ${finalUrl} (redirected: ${isRedirected})`);
  }
  
  await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
  
  console.log('✅ Comprehensive authentication test completed');
});