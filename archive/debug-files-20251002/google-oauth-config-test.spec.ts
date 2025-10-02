import { test } from '@playwright/test';

test('Stack Auth Google OAuth Configuration Test', async ({ page }) => {
  console.log('🔍 TESTING STACK AUTH GOOGLE OAUTH CONFIGURATION\n');

  // Step 1: Test Stack Auth project configuration endpoints
  console.log('📍 Step 1: Testing Stack Auth project endpoints...');
  
  const projectId = '253d7343-a0d4-43a1-be5c-822f590d40be';
  const stackEndpoints = [
    `https://api.stack-auth.com/api/v1/projects/${projectId}`,
    `https://api.stack-auth.com/api/v1/projects/${projectId}/config`,
    'https://www.sselfie.ai/api/v1/auth/oauth/callback/google',
    'https://www.sselfie.ai/api/v1/auth/oauth/authorize/google'
  ];
  
  for (const endpoint of stackEndpoints) {
    try {
      const response = await page.request.get(endpoint);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (response.status() === 404) {
        console.log('   ⚠️ Endpoint not found - might be configuration issue');
      } else if (response.status() === 401 || response.status() === 403) {
        console.log('   ⚠️ Authentication required - endpoint exists');
      } else if (response.ok()) {
        console.log('   ✅ Endpoint accessible');
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error}`);
    }
  }
  
  // Step 2: Test the actual OAuth callback with better parameters
  console.log('\n📍 Step 2: Testing OAuth callback with realistic parameters...');
  
  // Simulate a more realistic OAuth callback
  const realisticCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback' +
    '?code=4%2F0AeaYSHBqPvx6xK4_sample_auth_code_from_google' +
    '&state=csrf_token_12345' +
    '&scope=openid%20email%20profile' +
    '&authuser=0' +
    '&prompt=consent';
  
  console.log('🔄 Testing with realistic OAuth parameters...');
  
  await page.goto(realisticCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Current URL after callback:', page.url());
  
  // Wait longer to see if there are any delayed redirects
  let previousUrl = page.url();
  let redirectCount = 0;
  
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    
    if (currentUrl !== previousUrl) {
      redirectCount++;
      console.log(`🔄 Redirect ${redirectCount}: ${previousUrl} → ${currentUrl}`);
      previousUrl = currentUrl;
      
      if (currentUrl.includes('/auth-success')) {
        console.log('✅ Successfully reached /auth-success');
        break;
      }
    }
  }
  
  if (redirectCount === 0) {
    console.log('⚠️ No redirects occurred - callback might be stuck');
  }
  
  // Step 3: Check if the issue is with Google OAuth app configuration
  console.log('\n📍 Step 3: Testing Google OAuth configuration...');
  
  // Try to access the actual Google OAuth endpoint that Stack Auth would use
  const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=test' +
    '&redirect_uri=https://www.sselfie.ai/handler/oauth-callback' +
    '&response_type=code' +
    '&scope=openid%20email%20profile' +
    '&state=test_state';
  
  try {
    const googleResponse = await page.request.get(googleOAuthUrl);
    console.log(`🔍 Google OAuth endpoint status: ${googleResponse.status()}`);
    
    if (googleResponse.ok()) {
      console.log('✅ Google OAuth endpoint accessible');
    } else if (googleResponse.status() === 400) {
      console.log('⚠️ Google OAuth returns 400 - might be client_id configuration issue');
    }
  } catch (error) {
    console.log('❌ Google OAuth test failed:', error);
  }
  
  // Step 4: Check Stack Auth environment variables and configuration
  console.log('\n📍 Step 4: Testing Stack Auth configuration...');
  
  const configCheckUrl = 'https://www.sselfie.ai/api/v1/current-user';
  const configResponse = await page.request.get(configCheckUrl);
  
  console.log(`🔍 Stack Auth config check: ${configResponse.status()}`);
  
  if (configResponse.ok()) {
    const configData = await configResponse.json();
    console.log('🔍 Config data type:', typeof configData);
    console.log('🔍 Config has user:', !!configData.user);
  } else {
    const errorText = await configResponse.text();
    if (errorText.includes('project') || errorText.includes('config')) {
      console.log('⚠️ Configuration error detected');
      console.log('   Error preview:', errorText.substring(0, 200));
    }
  }
  
  console.log('\n🎯 GOOGLE OAUTH CONFIGURATION TEST COMPLETE');
  console.log('Key findings:');
  console.log('- If callback stays on same URL: OAuth code exchange is failing');
  console.log('- If Google endpoints return 400: Client ID not configured correctly'); 
  console.log('- If Stack endpoints fail: Stack Auth project configuration issue');
});