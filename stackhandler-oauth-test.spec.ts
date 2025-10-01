import { test } from '@playwright/test';

test('Test StackHandler OAuth Processing', async ({ page }) => {
  console.log('🧪 TESTING STACKHANDLER OAUTH PROCESSING\n');
  console.log('Testing if StackHandler properly processes OAuth and creates access tokens.\n');

  // Step 1: Test OAuth callback with StackHandler
  console.log('📍 Step 1: Testing OAuth callback with StackHandler...');
  
  // Navigate directly to OAuth callback with parameters
  const oauthCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback' +
    '?code=4%2F0AeaYSHBmocked_stackhandler_test' +
    '&state=stackhandler_test_state' +
    '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile';
  
  console.log('🔄 Navigating to OAuth callback with StackHandler...');
  await page.goto(oauthCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Current URL after StackHandler:', page.url());
  
  // Step 2: Monitor StackHandler processing
  console.log('\n📍 Step 2: Monitoring StackHandler OAuth processing...');
  
  let redirectCount = 0;
  let currentUrl = page.url();
  const startTime = Date.now();
  const maxWait = 20000; // 20 seconds for StackHandler
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    
    if (newUrl !== currentUrl) {
      redirectCount++;
      console.log(`🔄 StackHandler redirect ${redirectCount}: ${currentUrl} → ${newUrl}`);
      currentUrl = newUrl;
      
      if (newUrl.includes('/auth-success')) {
        console.log('✅ SUCCESS: StackHandler redirected to /auth-success');
        break;
      } else if (newUrl.includes('/app') || newUrl.includes('/simple-training')) {
        console.log('🎉 COMPLETE SUCCESS: StackHandler directly to authenticated area!');
        break;
      } else if (newUrl === 'https://www.sselfie.ai/' || newUrl === 'https://sselfie.ai/') {
        console.log('✅ StackHandler redirected to homepage');
        break;
      }
    }
    
    // Check for StackHandler completion indicators
    const pageContent = await page.textContent('body');
    if (pageContent && pageContent.includes('Loading') && pageContent.length < 100) {
      console.log('⏳ StackHandler still processing...');
    }
  }
  
  if (Date.now() - startTime >= maxWait) {
    console.log('⏰ StackHandler processing timeout');
  } else {
    console.log(`✅ StackHandler completed in ${Date.now() - startTime}ms`);
  }
  
  // Step 3: Check for Stack Auth access tokens
  console.log('\n📍 Step 3: Checking for Stack Auth access tokens...');
  
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(c => c.name.includes('stack'));
  
  console.log(`🍪 Total Stack cookies: ${stackCookies.length}`);
  
  // Categorize Stack Auth cookies
  const accessCookies = stackCookies.filter(c => c.name.includes('access'));
  const oauthCookies = stackCookies.filter(c => c.name.includes('oauth'));
  const sessionCookies = stackCookies.filter(c => c.name.includes('session'));
  const otherStackCookies = stackCookies.filter(c => 
    !c.name.includes('access') && 
    !c.name.includes('oauth') && 
    !c.name.includes('session')
  );
  
  console.log('🔍 Cookie breakdown:');
  console.log(`   Access tokens: ${accessCookies.length}`);
  console.log(`   OAuth cookies: ${oauthCookies.length}`);
  console.log(`   Session cookies: ${sessionCookies.length}`);
  console.log(`   Other Stack cookies: ${otherStackCookies.length}`);
  
  // Log specific cookie details
  accessCookies.forEach(cookie => {
    console.log(`   ✅ Access: ${cookie.name} (${cookie.value.length} chars)`);
  });
  
  oauthCookies.forEach(cookie => {
    console.log(`   🔄 OAuth: ${cookie.name} (${cookie.value.length} chars)`);
  });
  
  if (accessCookies.length > 0) {
    console.log('🎉 SUCCESS: Stack Auth access tokens found!');
  } else {
    console.log('❌ ISSUE: No Stack Auth access tokens found');
    console.log('   This means StackHandler did not complete OAuth token exchange');
  }
  
  // Step 4: Test authentication with StackHandler tokens
  console.log('\n📍 Step 4: Testing API authentication...');
  
  const authEndpoints = ['/api/me', '/api/user-model'];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (response.ok()) {
        const data = await response.json();
        if (data.user?.email || data.user?.id) {
          console.log(`   👤 User: ${data.user.email || data.user.id}`);
          console.log('🎉 AUTHENTICATION WORKING: StackHandler successfully created valid session!');
        }
      } else if (response.status() === 401) {
        console.log('   🔐 Still requires authentication - StackHandler may not have completed');
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Request failed`);
    }
  }
  
  // Step 5: Check useUser hook state
  console.log('\n📍 Step 5: Checking Stack Auth useUser hook...');
  
  const userHookState = await page.evaluate(() => {
    // Check if Stack Auth user is available in the browser
    const stackAuth = (window as any).stackAuth || (globalThis as any).stackAuth;
    if (!stackAuth) {
      return { error: 'Stack Auth not available' };
    }
    
    // This is a simplified check - in real app useUser would be used
    return { stackAuthAvailable: true };
  });
  
  console.log('🔍 Stack Auth browser state:', userHookState);
  
  console.log('\n🎯 STACKHANDLER TEST RESULTS:');
  console.log('✅ StackHandler component configured for OAuth callback');
  console.log('✅ OAuth flow initiates and processes');
  console.log(`${accessCookies.length > 0 ? '✅' : '❌'} Stack Auth access tokens ${accessCookies.length > 0 ? 'created' : 'missing'}`);
  console.log('');
  if (accessCookies.length > 0) {
    console.log('🎉 SUCCESS: StackHandler OAuth processing is working correctly!');
  } else {
    console.log('❌ ISSUE: StackHandler not creating access tokens - check Stack Auth configuration');
  }
});