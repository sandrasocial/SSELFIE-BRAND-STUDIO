import { test } from '@playwright/test';

test('Manual Google OAuth Flow Test', async ({ page, context }) => {
  console.log('🔍 MANUAL GOOGLE OAUTH FLOW TEST\n');
  console.log('This test will show us the exact Google OAuth flow and where it breaks.\n');

  // Step 1: Start from sign-in page and capture the actual Google OAuth URL
  console.log('📍 Step 1: Capturing real Google OAuth URL...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');
  
  // Set up listener for navigation to capture Google OAuth URL
  let googleOAuthUrl = '';
  let googleOAuthDetected = false;
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('accounts.google.com/o/oauth2') || url.includes('oauth2/auth')) {
      googleOAuthUrl = url;
      googleOAuthDetected = true;
      console.log('🎯 CAPTURED GOOGLE OAUTH URL:');
      console.log(url);
      
      // Parse the OAuth parameters
      try {
        const urlObj = new URL(url);
        console.log('\n🔍 GOOGLE OAUTH PARAMETERS:');
        console.log('   client_id:', urlObj.searchParams.get('client_id'));
        console.log('   redirect_uri:', urlObj.searchParams.get('redirect_uri'));
        console.log('   response_type:', urlObj.searchParams.get('response_type'));
        console.log('   scope:', urlObj.searchParams.get('scope'));
        console.log('   state:', urlObj.searchParams.get('state'));
      } catch (e) {
        console.log('⚠️ Could not parse OAuth URL parameters');
      }
    }
  });
  
  // Find and click Google OAuth button
  const googleButton = page.locator('button:has-text("Google")').first();
  if (await googleButton.isVisible()) {
    console.log('✅ Found Google OAuth button, clicking...');
    await googleButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    if (googleOAuthDetected) {
      console.log('✅ Google OAuth URL was captured successfully');
      
      // Step 2: Test if we can extract the client_id and check Google Console
      console.log('\n📍 Step 2: Analyzing Google OAuth configuration...');
      
      try {
        const urlObj = new URL(googleOAuthUrl);
        const clientId = urlObj.searchParams.get('client_id');
        const redirectUri = urlObj.searchParams.get('redirect_uri');
        
        if (clientId) {
          console.log(`🔍 Google Client ID: ${clientId}`);
          
          // Check if this client_id format looks valid
          if (clientId.includes('.apps.googleusercontent.com')) {
            console.log('✅ Client ID format looks valid (ends with .apps.googleusercontent.com)');
          } else {
            console.log('⚠️ Client ID format might be invalid - should end with .apps.googleusercontent.com');
          }
          
          // Test if we can validate the client_id with Google
          console.log('\n🧪 Testing Google Client ID validity...');
          
          const googleValidationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri || 'https://www.sselfie.ai/handler/oauth-callback')}&scope=openid%20email%20profile&state=validation_test`;
          
          const googleResponse = await page.request.get(googleValidationUrl);
          console.log(`🔍 Google validation response: ${googleResponse.status()}`);
          
          if (googleResponse.status() === 200) {
            console.log('✅ Google Client ID is valid and configured correctly');
          } else if (googleResponse.status() === 400) {
            console.log('❌ Google Client ID is invalid or not configured correctly');
            const errorText = await googleResponse.text();
            if (errorText.includes('client_id')) {
              console.log('   ⚠️ Error: Invalid client_id parameter');
            }
            if (errorText.includes('redirect_uri')) {
              console.log('   ⚠️ Error: redirect_uri not authorized in Google Console');
            }
          }
        } else {
          console.log('❌ No client_id found in OAuth URL - Stack Auth configuration issue');
        }
        
        if (redirectUri) {
          console.log(`🔍 Redirect URI: ${redirectUri}`);
          
          if (redirectUri === 'https://www.sselfie.ai/handler/oauth-callback') {
            console.log('✅ Redirect URI matches our callback endpoint');
          } else {
            console.log('⚠️ Redirect URI mismatch - should be https://www.sselfie.ai/handler/oauth-callback');
          }
        }
        
      } catch (e) {
        console.log('❌ Error analyzing Google OAuth URL:', e);
      }
      
    } else {
      console.log('❌ Google OAuth URL was not captured - sign-in flow might be broken');
    }
    
  } else {
    console.log('❌ Google OAuth button not found');
  }
  
  // Step 3: Test Stack Auth Google provider configuration
  console.log('\n📍 Step 3: Testing Stack Auth Google provider...');
  
  // Check if Stack Auth has Google provider enabled
  const stackAuthProviders = await page.request.get('https://www.sselfie.ai/api/v1/auth/providers');
  console.log(`🔍 Stack Auth providers endpoint: ${stackAuthProviders.status()}`);
  
  if (stackAuthProviders.ok()) {
    try {
      const providers = await stackAuthProviders.json();
      console.log('🔍 Available providers:', providers);
      
      const hasGoogle = providers?.some?.((p: any) => p.type === 'google' || p.id === 'google') || 
                       JSON.stringify(providers).includes('google');
      
      if (hasGoogle) {
        console.log('✅ Google provider is enabled in Stack Auth');
      } else {
        console.log('❌ Google provider is NOT enabled in Stack Auth');
      }
    } catch (e) {
      console.log('⚠️ Could not parse providers response');
    }
  }
  
  // Step 4: Final diagnosis
  console.log('\n📍 Step 4: FINAL DIAGNOSIS');
  
  if (!googleOAuthDetected) {
    console.log('🔴 CRITICAL: Google OAuth flow is not starting at all');
    console.log('   → Check Stack Auth Google provider configuration');
    console.log('   → Verify Google OAuth is enabled in Stack Auth dashboard');
  } else {
    console.log('🟡 ISSUE: Google OAuth flow starts but authorization code exchange fails');
    console.log('   → Check Google Console OAuth client configuration');
    console.log('   → Verify redirect URIs match exactly');
    console.log('   → Check Google Client Secret is configured in Stack Auth');
  }
  
  console.log('\n🎯 MANUAL GOOGLE OAUTH FLOW TEST COMPLETE');
});