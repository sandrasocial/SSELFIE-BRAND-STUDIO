import { test } from '@playwright/test';

test('Google OAuth Configuration Diagnostic', async ({ page }) => {
  console.log('🔍 GOOGLE OAUTH CONFIGURATION DIAGNOSTIC\n');
  console.log('Checking Google OAuth setup and Stack Auth configuration.\n');

  // Step 1: Capture the actual Google OAuth configuration
  console.log('📍 Step 1: Capturing Google OAuth configuration...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  let googleOAuthConfig: any = null;
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('accounts.google.com/o/oauth2/v2/auth')) {
      try {
        const urlObj = new URL(url);
        googleOAuthConfig = {
          client_id: urlObj.searchParams.get('client_id'),
          redirect_uri: urlObj.searchParams.get('redirect_uri'),
          response_type: urlObj.searchParams.get('response_type'),
          scope: urlObj.searchParams.get('scope'),
          state: urlObj.searchParams.get('state'),
          access_type: urlObj.searchParams.get('access_type'),
          prompt: urlObj.searchParams.get('prompt'),
          include_granted_scopes: urlObj.searchParams.get('include_granted_scopes')
        };
        console.log('🎯 GOOGLE OAUTH CONFIGURATION CAPTURED:');
        console.log(JSON.stringify(googleOAuthConfig, null, 2));
      } catch (e) {
        console.log('⚠️ Could not parse Google OAuth URL');
      }
    }
  });
  
  const googleButton = page.locator('button:has-text("Google")').first();
  if (await googleButton.isVisible()) {
    await googleButton.click();
    await page.waitForTimeout(3000);
  }
  
  if (!googleOAuthConfig) {
    console.log('❌ Could not capture Google OAuth configuration');
    return;
  }
  
  // Step 2: Analyze the configuration
  console.log('\n📍 Step 2: Analyzing Google OAuth configuration...');
  
  const clientId = googleOAuthConfig.client_id;
  const redirectUri = googleOAuthConfig.redirect_uri;
  
  console.log('🔍 Analysis:');
  console.log(`   Client ID: ${clientId}`);
  console.log(`   Client ID format valid: ${clientId?.endsWith('.apps.googleusercontent.com')}`);
  console.log(`   Redirect URI: ${redirectUri}`);
  console.log(`   Uses Stack Auth callback: ${redirectUri?.includes('api.stack-auth.com')}`);
  console.log(`   Response type: ${googleOAuthConfig.response_type}`);
  console.log(`   Scopes: ${googleOAuthConfig.scope}`);
  
  // Step 3: Test Google OAuth client validation
  console.log('\n📍 Step 3: Testing Google OAuth client validation...');
  
  if (clientId && redirectUri) {
    try {
      // Test if Google accepts this client_id with this redirect_uri
      const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&state=test&access_type=offline`;
      
      const response = await page.request.get(testUrl);
      console.log(`🔍 Google OAuth validation: ${response.status()}`);
      
      if (response.status() === 200) {
        console.log('✅ Google OAuth client configuration is valid');
      } else if (response.status() === 400) {
        console.log('❌ Google OAuth client configuration error');
        const responseText = await response.text();
        if (responseText.includes('client_id')) {
          console.log('   Issue: Invalid or unrecognized client_id');
          console.log('   Solution: Check Google Console OAuth client configuration');
        }
        if (responseText.includes('redirect_uri')) {
          console.log('   Issue: redirect_uri not authorized');
          console.log('   Solution: Add redirect_uri to Google Console authorized URIs');
        }
      }
    } catch (error) {
      console.log('❌ Error testing Google OAuth configuration:', error);
    }
  }
  
  // Step 4: Check Stack Auth project configuration endpoints
  console.log('\n📍 Step 4: Checking Stack Auth configuration...');
  
  const stackAuthEndpoints = [
    'https://www.sselfie.ai/api/v1/auth/oauth/authorize/google',
    'https://www.sselfie.ai/api/v1/auth/oauth/callback/google',
    'https://www.sselfie.ai/api/v1/current-user',
    'https://api.stack-auth.com/api/v1/auth/oauth/callback/google'
  ];
  
  for (const endpoint of stackAuthEndpoints) {
    try {
      const response = await page.request.get(endpoint);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (endpoint.includes('api.stack-auth.com') && response.status() === 200) {
        console.log('   ✅ Stack Auth OAuth callback endpoint is accessible');
      } else if (endpoint.includes('api.stack-auth.com') && response.status() !== 200) {
        console.log('   ⚠️ Stack Auth OAuth callback may have issues');
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Network error`);
    }
  }
  
  // Step 5: Check for common configuration issues
  console.log('\n📍 Step 5: Configuration issue diagnostics...');
  
  const diagnostics = [];
  
  // Check if redirect_uri matches expected pattern
  if (redirectUri !== 'https://api.stack-auth.com/api/v1/auth/oauth/callback/google') {
    diagnostics.push({
      issue: 'Unexpected redirect_uri',
      current: redirectUri,
      expected: 'https://api.stack-auth.com/api/v1/auth/oauth/callback/google',
      solution: 'Check Stack Auth project configuration'
    });
  }
  
  // Check if client_id looks valid
  if (!clientId?.endsWith('.apps.googleusercontent.com')) {
    diagnostics.push({
      issue: 'Invalid client_id format',
      solution: 'Verify Google Console OAuth client setup'
    });
  }
  
  // Check scopes
  const hasEmailScope = googleOAuthConfig.scope?.includes('userinfo.email');
  const hasProfileScope = googleOAuthConfig.scope?.includes('userinfo.profile');
  
  if (!hasEmailScope || !hasProfileScope) {
    diagnostics.push({
      issue: 'Missing required scopes',
      solution: 'Ensure email and profile scopes are configured in Stack Auth'
    });
  }
  
  console.log('\n🎯 DIAGNOSTIC RESULTS:');
  
  if (diagnostics.length === 0) {
    console.log('✅ Google OAuth configuration appears correct');
    console.log('');
    console.log('🔍 If authentication still fails, check:');
    console.log('   1. Google Console - Client Secret is configured');
    console.log('   2. Stack Auth Dashboard - Google provider enabled with correct client secret');
    console.log('   3. Stack Auth Dashboard - OAuth redirect URLs configured');
    console.log('   4. Domain cookies - ensure cookies are being set correctly');
  } else {
    console.log('❌ Configuration issues found:');
    diagnostics.forEach((diag, index) => {
      console.log(`   ${index + 1}. ${diag.issue}`);
      if (diag.current && diag.expected) {
        console.log(`      Current: ${diag.current}`);
        console.log(`      Expected: ${diag.expected}`);
      }
      console.log(`      Solution: ${diag.solution}`);
    });
  }
});