import { test } from '@playwright/test';

test('Live OAuth Flow Test - Real Authentication', async ({ page, context }) => {
  console.log('🔴 LIVE OAUTH FLOW TEST\n');
  console.log('Testing REAL Google OAuth flow to see if authentication works end-to-end.\n');

  // Step 1: Start with a fresh browser context
  console.log('📍 Step 1: Starting fresh authentication flow...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Sign-in page loaded');
  
  // Step 2: Click Google OAuth and monitor the full flow
  const googleButton = page.locator('button:has-text("Google")').first();
  
  if (await googleButton.isVisible()) {
    console.log('✅ Google OAuth button found');
    
    // Track navigation events
    let navigationEvents: any[] = [];
    
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        navigationEvents.push({
          timestamp: Date.now(),
          url: url,
          domain: new URL(url).hostname
        });
        console.log(`🔄 Navigation: ${new URL(url).hostname} - ${url.substring(0, 80)}...`);
      }
    });
    
    console.log('🔄 Clicking Google OAuth button...');
    await googleButton.click();
    
    // Wait longer for the OAuth flow
    console.log('⏳ Waiting for OAuth flow to complete (60 seconds)...');
    
    let finalUrl = '';
    let authenticationSuccessful = false;
    const startTime = Date.now();
    const maxWait = 60000; // 60 seconds
    
    while (Date.now() - startTime < maxWait) {
      await page.waitForTimeout(2000);
      finalUrl = page.url();
      
      // Check if we've returned to our domain
      if (finalUrl.includes('sselfie.ai') && !finalUrl.includes('accounts.google.com')) {
        console.log(`🏠 Returned to our domain: ${finalUrl}`);
        
        // Check authentication status
        try {
          const authResponse = await page.request.get('https://www.sselfie.ai/api/me');
          if (authResponse.ok()) {
            const userData = await authResponse.json();
            console.log('🎉 AUTHENTICATION SUCCESS!');
            console.log(`👤 User: ${userData.email || userData.id}`);
            authenticationSuccessful = true;
            break;
          } else {
            console.log(`⚠️ Back on our domain but not authenticated (${authResponse.status()})`);
          }
        } catch (e) {
          console.log('⚠️ Error checking authentication:', e);
        }
        
        // If on auth-success or app page, wait a bit more
        if (finalUrl.includes('/auth-success') || finalUrl.includes('/app')) {
          console.log('⏳ On auth page, waiting for completion...');
          await page.waitForTimeout(5000);
          continue;
        }
        
        // If back on homepage without auth, break
        if (finalUrl === 'https://www.sselfie.ai/' || finalUrl === 'https://sselfie.ai/') {
          console.log('🔴 Returned to homepage without authentication');
          break;
        }
      }
      
      // If still on Google, continue waiting
      if (finalUrl.includes('accounts.google.com')) {
        console.log('⏳ Still on Google OAuth page, waiting for user interaction...');
        continue;
      }
    }
    
    // Step 3: Analyze the results
    console.log('\n📍 Step 3: OAuth Flow Analysis...');
    
    console.log(`🔍 Final URL: ${finalUrl}`);
    console.log(`🔍 Authentication successful: ${authenticationSuccessful}`);
    
    console.log('\n📋 Navigation History:');
    navigationEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.domain} - ${new Date(event.timestamp).toLocaleTimeString()}`);
    });
    
    // Step 4: Check cookies and session state
    console.log('\n📍 Step 4: Session Analysis...');
    
    const cookies = await context.cookies();
    const stackCookies = cookies.filter(c => c.name.includes('stack'));
    
    console.log(`🍪 Total cookies: ${cookies.length}`);
    console.log(`🍪 Stack cookies: ${stackCookies.length}`);
    
    stackCookies.forEach(cookie => {
      console.log(`   ${cookie.name}: ${cookie.value.length} chars (${cookie.domain})`);
    });
    
    // Check specific authentication indicators
    const hasAccessToken = cookies.some(c => c.name.includes('access') || c.name.includes('token'));
    const hasSessionCookie = cookies.some(c => c.name.includes('session') || c.value.length > 100);
    
    console.log(`🔑 Has access token indicators: ${hasAccessToken}`);
    console.log(`🔑 Has session indicators: ${hasSessionCookie}`);
    
    // Step 5: Test all authentication endpoints
    console.log('\n📍 Step 5: Endpoint Testing...');
    
    const endpoints = [
      '/api/me',
      '/api/user-model', 
      '/api/v1/current-user',
      '/api/v1/users/me',
      '/handler/current-user'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
        console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
        
        if (response.ok()) {
          const data = await response.json();
          if (data.email || data.id) {
            console.log(`   👤 User: ${data.email || data.id}`);
          }
        } else if (response.status() === 401) {
          console.log('   🔐 Requires authentication');
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Request failed`);
      }
    }
    
    console.log('\n🎯 LIVE OAUTH FLOW RESULTS:');
    
    if (authenticationSuccessful) {
      console.log('🎉 SUCCESS: OAuth authentication is working correctly!');
      console.log('✅ Users can successfully authenticate via Google OAuth');
    } else {
      console.log('🔴 FAILURE: OAuth authentication is still broken');
      
      if (finalUrl.includes('accounts.google.com')) {
        console.log('❌ Issue: Users get stuck on Google OAuth consent screen');
        console.log('📋 Solution: Check Google OAuth client configuration');
      } else if (finalUrl.includes('sselfie.ai')) {
        console.log('❌ Issue: OAuth callback processing fails - no session created');
        console.log('📋 Solution: Check Stack Auth token exchange configuration');
      } else {
        console.log('❌ Issue: OAuth flow fails completely');
        console.log('📋 Solution: Check Stack Auth project configuration and Google OAuth setup');
      }
    }
    
  } else {
    console.log('❌ Google OAuth button not found');
  }
});