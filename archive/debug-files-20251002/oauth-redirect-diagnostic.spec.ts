import { test, expect } from '@playwright/test';

test('Diagnose Stack Auth Redirect URI Issue', async ({ page }) => {
  console.log('🔍 STACK AUTH REDIRECT URI DIAGNOSTIC TEST\n');
  
  // Step 1: Test if our oauth-callback endpoint works
  console.log('📍 Step 1: Testing /handler/oauth-callback endpoint directly...');
  
  try {
    const response = await page.request.get('https://www.sselfie.ai/handler/oauth-callback');
    console.log(`✅ /handler/oauth-callback status: ${response.status()}`);
    
    if (response.status() === 200) {
      console.log('✅ OAuth callback endpoint is accessible and working');
    } else {
      console.log('❌ OAuth callback endpoint has issues');
    }
  } catch (error) {
    console.log('❌ Error testing oauth-callback:', error);
  }

  // Step 2: Test Stack Auth project API directly
  console.log('\n📍 Step 2: Testing Stack Auth project API...');
  
  const projectId = '253d7343-a0d4-43a1-be5c-822f590d40be';
  
  try {
    const jwksResponse = await page.request.get(`https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`);
    console.log(`✅ Stack Auth JWKS: ${jwksResponse.status()}`);
    
    if (jwksResponse.ok()) {
      const jwks = await jwksResponse.json();
      console.log(`✅ Stack Auth project accessible, keys: ${jwks.keys?.length || 0}`);
    }
  } catch (error) {
    console.log('❌ Error testing Stack Auth API:', error);
  }

  // Step 3: Simulate the exact OAuth request that's failing
  console.log('\n📍 Step 3: Testing OAuth authorize endpoint with our redirect URI...');
  
  const oauthParams = new URLSearchParams({
    client_id: projectId,
    client_secret: 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg',
    redirect_uri: 'https://www.sselfie.ai/handler/oauth-callback',
    scope: 'legacy',
    state: 'test-state',
    grant_type: 'authorization_code',
    code_challenge: 'test-challenge',
    code_challenge_method: 'S256',
    response_type: 'code',
    type: 'authenticate'
  });
  
  const oauthUrl = `https://api.stack-auth.com/api/v1/auth/oauth/authorize/google?${oauthParams.toString()}`;
  
  try {
    const oauthResponse = await page.request.get(oauthUrl);
    console.log(`${oauthResponse.ok() ? '✅' : '❌'} OAuth authorize status: ${oauthResponse.status()}`);
    
    if (oauthResponse.status() === 307) {
      console.log('🚨 CONFIRMED: 307 redirect indicates redirect_uri not whitelisted!');
      console.log('');
      console.log('🎯 SOLUTION: Add these URLs to Stack Auth dashboard:');
      console.log('   • https://www.sselfie.ai/handler/oauth-callback');
      console.log('   • https://sselfie.ai/handler/oauth-callback');
      console.log('');
    } else if (oauthResponse.ok()) {
      console.log('✅ OAuth request accepted - redirect URIs are configured');
    } else {
      console.log('❌ Unexpected OAuth response - check configuration');
    }
    
    // Log the response headers for debugging
    const headers = oauthResponse.headers();
    if (headers.location) {
      console.log('🔄 Redirect location:', headers.location);
    }
    
  } catch (error) {
    console.log('❌ Error testing OAuth endpoint:', error);
  }

  // Step 4: Check if any other URLs might work
  console.log('\n📍 Step 4: Testing alternative redirect URI patterns...');
  
  const alternativeRedirectUris = [
    'https://sselfie.ai/handler/oauth-callback',
    'https://api.sselfie.ai/handler/oauth-callback',
    'https://www.sselfie.ai/auth/callback'
  ];
  
  for (const uri of alternativeRedirectUris) {
    const altParams = new URLSearchParams({
      client_id: projectId,
      client_secret: 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg',
      redirect_uri: uri,
      scope: 'legacy',
      state: 'test-state',
      grant_type: 'authorization_code',
      code_challenge: 'test-challenge',
      code_challenge_method: 'S256',
      response_type: 'code',
      type: 'authenticate'
    });
    
    const altUrl = `https://api.stack-auth.com/api/v1/auth/oauth/authorize/google?${altParams.toString()}`;
    
    try {
      const altResponse = await page.request.get(altUrl);
      console.log(`${altResponse.ok() ? '✅' : '❌'} ${altResponse.status()} ${uri}`);
      
      if (altResponse.ok()) {
        console.log(`🎉 WORKING REDIRECT URI FOUND: ${uri}`);
      }
    } catch (error) {
      console.log(`❌ ${uri}: ${error}`);
    }
  }

  console.log('\n🎯 FINAL DIAGNOSIS:');
  console.log('If all redirect URIs return 307, the issue is Stack Auth dashboard configuration.');
  console.log('You need to add the redirect URLs to the Stack Auth project settings.');
});