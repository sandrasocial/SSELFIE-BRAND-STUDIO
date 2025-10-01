import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE OAUTH DEBUG TEST
 * Testing the exact flow that admin user ssa@ssasocial.com experiences
 * User ID: 42585527
 * Stack Auth ID: 4baecefb-d77a-4221-91cd-26d790a0a917
 */

test('Debug OAuth Flow for Admin User ssa@ssasocial.com', async ({ page, context }) => {
  console.log('🧪 COMPREHENSIVE OAUTH DEBUG TEST');
  console.log('👤 Testing admin user: ssa@ssasocial.com');
  console.log('🆔 User ID: 42585527');
  console.log('🔑 Stack Auth ID: 4baecefb-d77a-4221-91cd-26d790a0a917\n');

  // Step 1: Capture all requests and responses
  const requests: any[] = [];
  const responses: any[] = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
  });

  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    });
  });

  // Step 2: Capture console logs to see our debug output
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const logMessage = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(logMessage);
    console.log('🔍 BROWSER:', logMessage);
  });

  // Step 3: Start at the production homepage
  console.log('\n📍 Step 1: Loading production homepage...');
  await page.goto('https://www.sselfie.ai/');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Homepage loaded');
  console.log('🔍 Current URL:', page.url());
  
  // Step 4: Look for sign-in button and click it
  console.log('\n📍 Step 2: Looking for sign-in button...');
  
  // Try multiple selectors for sign-in
  const signInSelectors = [
    '[data-testid="sign-in"]',
    'button:has-text("Sign In")',
    'a:has-text("Sign In")',
    'button:has-text("Log In")',
    'a:has-text("Log In")',
    '.sign-in',
    '[href*="sign-in"]'
  ];
  
  let signInElement = null;
  for (const selector of signInSelectors) {
    try {
      signInElement = page.locator(selector).first();
      if (await signInElement.isVisible({ timeout: 2000 })) {
        console.log('✅ Found sign-in element:', selector);
        break;
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  if (!signInElement || !(await signInElement.isVisible())) {
    console.log('⚠️ No sign-in button found, checking if already authenticated...');
    
    // Check if we're already on an auth page or logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/app') || currentUrl.includes('/auth-success')) {
      console.log('✅ Already in authenticated state');
    } else {
      console.log('❌ No sign-in button found, navigating directly to sign-in page');
      await page.goto('https://www.sselfie.ai/sign-in');
      await page.waitForLoadState('networkidle');
    }
  } else {
    console.log('🖱️ Clicking sign-in button...');
    await signInElement.click();
    await page.waitForLoadState('networkidle');
  }
  
  console.log('🔍 After sign-in click, URL:', page.url());
  
  // Step 5: Screenshot current state
  await page.screenshot({ path: 'debug-step1-after-signin-click.png', fullPage: true });
  
  // Step 6: If we're on Stack Auth sign-in page, look for Google OAuth
  console.log('\n📍 Step 3: Looking for Google OAuth button...');
  
  if (page.url().includes('stack-auth') || page.url().includes('sign-in')) {
    // Look for Google OAuth button
    const googleSelectors = [
      'button:has-text("Google")',
      '[data-provider="google"]',
      '.oauth-google',
      'button:has-text("Continue with Google")',
      'button:has-text("Sign in with Google")'
    ];
    
    let googleButton = null;
    for (const selector of googleSelectors) {
      try {
        googleButton = page.locator(selector).first();
        if (await googleButton.isVisible({ timeout: 3000 })) {
          console.log('✅ Found Google OAuth button:', selector);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (googleButton && await googleButton.isVisible()) {
      console.log('🖱️ Clicking Google OAuth button...');
      
      // This will likely redirect to Google, but we'll track it
      await googleButton.click();
      
      // Wait for navigation or OAuth flow
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ Navigation timeout, checking current state...');
      }
      
      console.log('🔍 After Google OAuth click, URL:', page.url());
      await page.screenshot({ path: 'debug-step2-after-google-oauth.png', fullPage: true });
    } else {
      console.log('❌ No Google OAuth button found');
    }
  }
  
  // Step 7: Wait and monitor for auth-success page
  console.log('\n📍 Step 4: Monitoring for auth-success page...');
  
  let authSuccessDetected = false;
  const startTime = Date.now();
  
  while (Date.now() - startTime < 30000) { // Wait up to 30 seconds
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth-success')) {
      authSuccessDetected = true;
      console.log('✅ AUTH-SUCCESS PAGE DETECTED!');
      console.log('🔍 URL:', currentUrl);
      
      await page.screenshot({ path: 'debug-step3-auth-success-page.png', fullPage: true });
      
      // Monitor what happens next
      console.log('👀 Monitoring auth-success page behavior...');
      
      // Wait and watch for redirects
      let redirectCount = 0;
      let currentRedirectUrl = currentUrl;
      const maxRedirects = 5;
      
      while (redirectCount < maxRedirects) {
        await page.waitForTimeout(2000); // Wait 2 seconds
        
        const newUrl = page.url();
        if (newUrl !== currentRedirectUrl) {
          redirectCount++;
          console.log(`🔄 Redirect ${redirectCount}: ${currentRedirectUrl} → ${newUrl}`);
          
          await page.screenshot({ 
            path: `debug-step3-redirect-${redirectCount}.png`, 
            fullPage: true 
          });
          
          // Check if we ended up in a loop
          if (newUrl.includes('auth-success')) {
            console.log('❌ LOOP DETECTED: Redirected back to auth-success!');
          } else if (newUrl.includes('/app')) {
            console.log('✅ SUCCESS: Redirected to /app (trained user route)');
            break;
          } else if (newUrl.includes('/simple-training')) {
            console.log('✅ SUCCESS: Redirected to /simple-training (new user route)');
            break;
          } else if (newUrl === 'https://www.sselfie.ai/' || newUrl === 'https://www.sselfie.ai') {
            console.log('🔄 Redirected to homepage, waiting for SmartHome routing...');
          }
          
          currentRedirectUrl = newUrl;
        } else {
          break; // No more redirects
        }
      }
      
      break;
    } else if (currentUrl.includes('/app')) {
      console.log('✅ Directly reached /app page');
      break;
    } else if (currentUrl.includes('404') || currentUrl.includes('not-found')) {
      console.log('❌ 404 ERROR DETECTED');
      console.log('🔍 URL:', currentUrl);
      await page.screenshot({ path: 'debug-step3-404-error.png', fullPage: true });
      break;
    }
    
    await page.waitForTimeout(1000); // Check every second
  }
  
  if (!authSuccessDetected) {
    console.log('❌ auth-success page never detected in 30 seconds');
  }
  
  // Step 8: Final state analysis
  console.log('\n📍 Step 5: Final state analysis...');
  console.log('🔍 Final URL:', page.url());
  
  // Check cookies
  const cookies = await context.cookies();
  const stackCookies = cookies.filter(c => 
    c.name.includes('stack') || 
    c.name.includes('auth') || 
    c.name.includes('session')
  );
  
  console.log('🍪 Stack Auth cookies:', stackCookies.length);
  stackCookies.forEach(cookie => {
    console.log(`   ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
  });
  
  // Final screenshot
  await page.screenshot({ path: 'debug-step5-final-state.png', fullPage: true });
  
  // Step 9: Analyze collected data
  console.log('\n📊 ANALYSIS SUMMARY:');
  console.log('🌐 Total requests:', requests.length);
  console.log('📝 Console logs:', consoleLogs.length);
  console.log('❌ Failed requests:', responses.filter(r => r.status >= 400).length);
  
  // Show failed requests
  const failedRequests = responses.filter(r => r.status >= 400);
  if (failedRequests.length > 0) {
    console.log('\n❌ FAILED REQUESTS:');
    failedRequests.forEach(req => {
      console.log(`   ${req.status}: ${req.url}`);
    });
  }
  
  // Show auth-related requests
  const authRequests = requests.filter(r => 
    r.url.includes('/auth') || 
    r.url.includes('stack') || 
    r.url.includes('/api/me') ||
    r.url.includes('/api/user-model')
  );
  
  if (authRequests.length > 0) {
    console.log('\n🔐 AUTH-RELATED REQUESTS:');
    authRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url}`);
    });
  }
  
  // Write detailed log
  const debugLog = {
    user: {
      email: 'ssa@ssasocial.com',
      userId: '42585527',
      stackAuthId: '4baecefb-d77a-4221-91cd-26d790a0a917'
    },
    finalUrl: page.url(),
    authSuccessDetected,
    requests: authRequests,
    responses: failedRequests,
    cookies: stackCookies,
    consoleLogs: consoleLogs.filter(log => log.includes('🔍') || log.includes('❌') || log.includes('✅'))
  };
  
  console.log('\n💾 Saving detailed debug log...');
  require('fs').writeFileSync('oauth-debug-log.json', JSON.stringify(debugLog, null, 2));
  
  console.log('\n🎯 TEST COMPLETE');
  console.log('Check the generated screenshots and oauth-debug-log.json for details');
});