import { test } from '@playwright/test';

test('Deep OAuth Flow Analysis with Multiple Redirect URIs', async ({ page }) => {
  console.log('🔍 DEEP OAUTH FLOW ANALYSIS\n');
  console.log('Analyzing OAuth flow with multiple authorized redirect URIs configured.\n');

  // Step 1: Capture the ACTUAL redirect URI being used
  console.log('📍 Step 1: Capturing actual OAuth redirect URI in use...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  let actualOAuthUrl = '';
  let actualRedirectUri = '';
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('accounts.google.com/o/oauth2/v2/auth')) {
      actualOAuthUrl = url;
      try {
        const urlObj = new URL(url);
        actualRedirectUri = urlObj.searchParams.get('redirect_uri') || '';
        console.log('🎯 ACTUAL REDIRECT URI BEING USED:');
        console.log(`   ${actualRedirectUri}`);
        
        // Determine which configuration is active
        if (actualRedirectUri.includes('api.stack-auth.com')) {
          console.log('✅ Stack Auth is using its own callback URL');
        } else if (actualRedirectUri.includes('www.sselfie.ai/handler/oauth-callback')) {
          console.log('✅ Stack Auth is using our www.sselfie.ai custom callback');
        } else if (actualRedirectUri.includes('sselfie.ai/handler/oauth-callback')) {
          console.log('✅ Stack Auth is using our sselfie.ai custom callback');
        } else {
          console.log('⚠️ Unexpected redirect URI configuration');
        }
      } catch (e) {
        console.log('⚠️ Could not parse OAuth URL');
      }
    }
  });
  
  const googleButton = page.locator('button:has-text("Google")').first();
  if (await googleButton.isVisible()) {
    await googleButton.click();
    await page.waitForTimeout(3000);
  }
  
  if (!actualRedirectUri) {
    console.log('❌ Could not determine actual redirect URI');
    return;
  }
  
  // Step 2: Test OAuth flow to the actual redirect URI
  console.log('\n📍 Step 2: Testing OAuth flow to the actual redirect URI...');
  
  // Simulate what happens when Google calls back to the actual redirect URI
  const mockCallbackUrl = actualRedirectUri + 
    '?code=4%2F0AeaYSHBtest_actual_redirect_flow' +
    '&state=test_state_actual' +
    '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile';
  
  console.log('🔄 Testing callback to actual redirect URI...');
  console.log('🔗 Callback URL:', mockCallbackUrl);
  
  await page.goto(mockCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Current URL after callback:', page.url());
  
  // Step 3: Monitor the complete flow
  console.log('\n📍 Step 3: Monitoring complete OAuth flow...');
  
  let flowSteps = [];
  let currentUrl = page.url();
  flowSteps.push({ step: 'Initial callback', url: currentUrl });
  
  const startTime = Date.now();
  const maxWait = 20000;
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    
    if (newUrl !== currentUrl) {
      flowSteps.push({ step: `Redirect ${flowSteps.length}`, url: newUrl });
      currentUrl = newUrl;
      
      // Check for completion indicators
      if (newUrl.includes('/auth-success')) {
        console.log('✅ Reached /auth-success page');
        break;
      } else if (newUrl.includes('/app') || newUrl.includes('/simple-training')) {
        console.log('🎉 Directly reached authenticated area');
        break;
      } else if (newUrl === 'https://www.sselfie.ai/' || newUrl === 'https://sselfie.ai/') {
        console.log('✅ Returned to homepage');
        break;
      }
    }
  }
  
  console.log('\n🔄 Complete OAuth Flow Steps:');
  flowSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step.step}: ${step.url}`);
  });
  
  // Step 4: Check cookies after the actual flow
  console.log('\n📍 Step 4: Checking cookies after actual OAuth flow...');
  
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(c => c.name.includes('stack'));
  
  console.log(`🍪 Total Stack cookies: ${stackCookies.length}`);
  
  // Categorize cookies more precisely
  const accessCookies = stackCookies.filter(c => c.name.includes('access'));
  const sessionCookies = stackCookies.filter(c => c.name.includes('session'));
  const oauthOuterCookies = stackCookies.filter(c => c.name.includes('oauth-outer'));
  const oauthInnerCookies = stackCookies.filter(c => c.name.includes('oauth-inner'));
  const otherCookies = stackCookies.filter(c => 
    !c.name.includes('access') && 
    !c.name.includes('session') && 
    !c.name.includes('oauth')
  );
  
  console.log('🔍 Detailed cookie analysis:');
  console.log(`   Access tokens: ${accessCookies.length}`);
  accessCookies.forEach(cookie => {
    console.log(`      ${cookie.name}: ${cookie.value.length} chars, domain: ${cookie.domain}`);
  });
  
  console.log(`   Session cookies: ${sessionCookies.length}`);
  sessionCookies.forEach(cookie => {
    console.log(`      ${cookie.name}: ${cookie.value.length} chars, domain: ${cookie.domain}`);
  });
  
  console.log(`   OAuth outer cookies: ${oauthOuterCookies.length}`);
  oauthOuterCookies.forEach(cookie => {
    console.log(`      ${cookie.name}: ${cookie.value.length} chars, domain: ${cookie.domain}`);
  });
  
  console.log(`   OAuth inner cookies: ${oauthInnerCookies.length}`);
  console.log(`   Other Stack cookies: ${otherCookies.length}`);
  
  // Step 5: Test authentication with actual flow
  console.log('\n📍 Step 5: Testing authentication after actual OAuth flow...');
  
  const authTests = [
    { endpoint: '/api/me', description: 'User data endpoint' },
    { endpoint: '/api/user-model', description: 'User model endpoint' },
    { endpoint: '/api/v1/current-user', description: 'Stack Auth endpoint' }
  ];
  
  for (const test of authTests) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${test.endpoint}`);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${test.endpoint} (${test.description})`);
      
      if (response.ok()) {
        const data = await response.json();
        if (data.user?.email || data.user?.id || data.email || data.id) {
          console.log(`   👤 User: ${data.user?.email || data.email || data.user?.id || data.id}`);
          console.log('🎉 AUTHENTICATION IS WORKING!');
        }
      } else if (response.status() === 401) {
        const errorData = await response.text();
        if (errorData.includes('No access token')) {
          console.log('   🔐 Issue: No access token found in cookies');
        } else {
          console.log('   🔐 Issue: Authentication required');
        }
      }
    } catch (error) {
      console.log(`❌ ${test.endpoint}: Request failed`);
    }
  }
  
  // Step 6: Determine the root cause
  console.log('\n🎯 ROOT CAUSE ANALYSIS:');
  
  if (actualRedirectUri.includes('api.stack-auth.com')) {
    console.log('📋 Configuration: Stack Auth handles OAuth callback internally');
    if (accessCookies.length === 0) {
      console.log('❌ Issue: Stack Auth OAuth callback not creating access tokens');
      console.log('💡 Solution: Check Stack Auth dashboard Google provider configuration');
    }
  } else if (actualRedirectUri.includes('sselfie.ai/handler/oauth-callback')) {
    console.log('📋 Configuration: Custom OAuth callback handling');
    if (flowSteps.length === 1) {
      console.log('❌ Issue: Custom OAuth callback not processing (no redirects)');
      console.log('💡 Solution: Check StackHandler or OAuth callback component');
    } else if (accessCookies.length === 0) {
      console.log('❌ Issue: Custom OAuth callback not creating access tokens');
      console.log('💡 Solution: Verify app.callOAuthCallback() or StackHandler processing');
    }
  }
  
  console.log('\n🔍 Next debugging steps:');
  console.log('1. Check which redirect URI is actually being used');
  console.log('2. Verify the callback processing at that specific URI');
  console.log('3. Check token creation and cookie setting process');
});