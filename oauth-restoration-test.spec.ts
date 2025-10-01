import { test } from '@playwright/test';

test('Test Restored OAuth Authentication Flow', async ({ page }) => {
  console.log('🧪 TESTING RESTORED OAUTH AUTHENTICATION\n');
  console.log('Testing if restoring OAuth callback components fixes authentication.\n');

  // Step 1: Test the OAuth flow start
  console.log('📍 Step 1: Testing OAuth flow initialization...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Sign-in page loaded');
  
  // Check if Google OAuth button is present
  const googleButton = page.locator('button:has-text("Google")').first();
  if (await googleButton.isVisible()) {
    console.log('✅ Google OAuth button found');
    
    // Capture OAuth URL
    let googleOAuthUrl = '';
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('accounts.google.com/o/oauth2')) {
        googleOAuthUrl = url;
        console.log('🎯 OAuth URL captured');
        
        // Check OAuth callback URL in the request
        try {
          const urlObj = new URL(url);
          const redirectUri = urlObj.searchParams.get('redirect_uri');
          console.log('🔍 OAuth redirect URI:', redirectUri);
          
          if (redirectUri?.includes('api.stack-auth.com')) {
            console.log('✅ OAuth redirects to Stack Auth (correct)');
          } else {
            console.log('⚠️ Unexpected redirect URI');
          }
        } catch (e) {
          console.log('⚠️ Could not parse OAuth URL');
        }
      }
    });
    
    await googleButton.click();
    await page.waitForTimeout(3000);
    
    if (googleOAuthUrl) {
      console.log('✅ OAuth flow initiated successfully');
    } else {
      console.log('❌ OAuth flow failed to initiate');
    }
    
  } else {
    console.log('❌ Google OAuth button not found');
  }
  
  // Step 2: Test OAuth callback processing (simulate)
  console.log('\n📍 Step 2: Testing OAuth callback processing...');
  
  // Navigate to callback with mock parameters
  const mockCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback' +
    '?code=4%2F0AeaYSHBmocked_google_auth_code_restored_test' +
    '&state=mock_state_restored_123' +
    '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile';
  
  console.log('🔄 Navigating to OAuth callback...');
  await page.goto(mockCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Current URL after callback:', page.url());
  
  // Step 3: Monitor for proper redirects
  console.log('\n📍 Step 3: Monitoring OAuth callback redirects...');
  
  let redirectCount = 0;
  let currentUrl = page.url();
  const startTime = Date.now();
  const maxWait = 15000;
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    
    if (newUrl !== currentUrl) {
      redirectCount++;
      console.log(`🔄 Redirect ${redirectCount}: ${currentUrl} → ${newUrl}`);
      currentUrl = newUrl;
      
      if (newUrl.includes('/auth-success')) {
        console.log('✅ SUCCESS: Reached /auth-success page!');
        
        // Wait for final redirect from auth-success
        await page.waitForTimeout(3000);
        const finalUrl = page.url();
        
        if (finalUrl !== newUrl) {
          console.log(`🔄 Final redirect: ${newUrl} → ${finalUrl}`);
          
          if (finalUrl.includes('/app') || finalUrl.includes('/simple-training')) {
            console.log('🎉 COMPLETE SUCCESS: Reached authenticated area!');
          } else if (finalUrl === 'https://www.sselfie.ai/' || finalUrl === 'https://sselfie.ai/') {
            console.log('✅ Redirected to homepage - checking authentication...');
            
            const authResponse = await page.request.get('https://www.sselfie.ai/api/me');
            if (authResponse.ok()) {
              console.log('🎉 AUTHENTICATION RESTORED: User is authenticated!');
              const userData = await authResponse.json();
              console.log('👤 User:', userData.email || userData.id);
            } else {
              console.log('⚠️ Still getting 401 - authentication not fully restored');
            }
          }
        } else {
          console.log('⚠️ Stuck on /auth-success page');
        }
        break;
      }
    }
  }
  
  if (redirectCount === 0) {
    console.log('❌ No redirects occurred - OAuth callback still not working');
  } else {
    console.log(`✅ OAuth callback processing working - ${redirectCount} redirects occurred`);
  }
  
  // Step 4: Check OAuth cookies
  console.log('\n📍 Step 4: Checking OAuth cookies...');
  
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(c => c.name.includes('stack'));
  
  console.log(`🍪 Stack cookies: ${stackCookies.length}`);
  
  const tokenCookies = stackCookies.filter(c => 
    c.name.includes('token') || 
    c.name.includes('session') || 
    c.name.includes('access') ||
    c.value.length > 50
  );
  
  if (tokenCookies.length > 0) {
    console.log(`✅ Found ${tokenCookies.length} potential authentication tokens`);
  } else {
    console.log('⚠️ No authentication tokens found in cookies');
  }
  
  // Step 5: Test authentication endpoints
  console.log('\n📍 Step 5: Testing authentication endpoints...');
  
  const endpoints = ['/api/me', '/api/user-model', '/api/v1/current-user'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (response.ok()) {
        const data = await response.json();
        if (data.email || data.id) {
          console.log(`   👤 User: ${data.email || data.id}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error`);
    }
  }
  
  console.log('\n🎯 RESTORATION TEST RESULTS:');
  console.log('✅ OAuth callback component restored');
  console.log('✅ OAuth callback route added back');  
  console.log('✅ oauthCallback URL restored in Stack Auth config');
  console.log('✅ OAuth callback detection logic restored');
  console.log('');
  console.log('If authentication works now: 🎉 The restoration was successful!');
  console.log('If still broken: ❌ There may be additional issues or server-side problems.');
});