import { test } from '@playwright/test';

test('Test OAuth Callback Fix', async ({ page }) => {
  console.log('🧪 TESTING OAUTH CALLBACK FIX\n');
  console.log('Testing if full URLs in Stack Auth config fix the OAuth redirect issue.\n');

  // Step 1: Test the new configuration
  console.log('📍 Step 1: Testing updated Stack Auth configuration...');
  
  // Navigate to sign-in to ensure new config is loaded
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Sign-in page loaded with updated configuration');
  
  // Step 2: Simulate the OAuth callback with realistic parameters
  console.log('\n📍 Step 2: Testing OAuth callback with full URL configuration...');
  
  // Simulate what happens when Stack Auth redirects back to our domain
  const testCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback' +
    '?code=4%2F0AeaYSHBqPvx6xK4_realistic_google_auth_code_12345' +
    '&state=stack_auth_state_67890' +
    '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile';
  
  console.log('🔄 Testing callback processing...');
  await page.goto(testCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Current URL after callback:', page.url());
  
  // Monitor for redirects with the new configuration
  let redirectCount = 0;
  let currentUrl = page.url();
  const startTime = Date.now();
  const maxWait = 15000; // 15 seconds
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    
    if (newUrl !== currentUrl) {
      redirectCount++;
      console.log(`🔄 Redirect ${redirectCount}: ${currentUrl} → ${newUrl}`);
      currentUrl = newUrl;
      
      // Check for successful progression
      if (newUrl.includes('/auth-success')) {
        console.log('✅ Successfully reached /auth-success page');
        
        // Wait a bit more to see final redirect
        await page.waitForTimeout(3000);
        const finalUrl = page.url();
        
        if (finalUrl !== newUrl) {
          console.log(`🔄 Final redirect: ${newUrl} → ${finalUrl}`);
          
          if (finalUrl.includes('/app') || finalUrl.includes('/simple-training')) {
            console.log('🎉 SUCCESS: Reached authenticated area!');
          } else if (finalUrl === 'https://www.sselfie.ai/' || finalUrl === 'https://sselfie.ai/') {
            console.log('⚠️ Redirected to homepage - checking if authenticated...');
            
            // Check authentication status
            const authResponse = await page.request.get('https://www.sselfie.ai/api/me');
            if (authResponse.ok()) {
              console.log('🎉 SUCCESS: User is authenticated!');
              const userData = await authResponse.json();
              console.log('👤 User:', userData.email || userData.id);
            } else {
              console.log('❌ User is not authenticated (still getting 401)');
            }
          } else {
            console.log('⚠️ Unexpected final URL:', finalUrl);
          }
        }
        break;
      }
    }
  }
  
  if (redirectCount === 0) {
    console.log('❌ No redirects occurred - callback still stuck');
    console.log('⚠️ This suggests the Stack Auth configuration change did not fix the issue');
  }
  
  // Step 3: Check cookies after the fix
  console.log('\n📍 Step 3: Checking authentication cookies...');
  
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(c => c.name.includes('stack'));
  
  console.log(`🍪 Stack Auth cookies: ${stackCookies.length}`);
  stackCookies.forEach(cookie => {
    console.log(`   ${cookie.name}: ${cookie.value.length} chars`);
    if (cookie.name.includes('token') || cookie.name.includes('session')) {
      console.log(`      ${cookie.secure ? '🔒' : '🔓'} Secure: ${cookie.secure}`);
    }
  });
  
  // Step 4: Test authentication endpoints
  console.log('\n📍 Step 4: Testing authentication after fix...');
  
  const authEndpoints = ['/api/me', '/api/user-model'];
  
  for (const endpoint of authEndpoints) {
    const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
    console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
    
    if (response.ok()) {
      const data = await response.json();
      if (data.email || data.id) {
        console.log(`   👤 User: ${data.email || data.id}`);
      }
    }
  }
  
  console.log('\n🎯 OAUTH CALLBACK FIX TEST RESULTS:');
  console.log('If redirects work now: ✅ Fix successful - OAuth callback redirecting properly');
  console.log('If still stuck: ❌ Need to check Stack Auth dashboard OAuth configuration');
  console.log('If authentication works: 🎉 Complete OAuth flow is now functional');
});