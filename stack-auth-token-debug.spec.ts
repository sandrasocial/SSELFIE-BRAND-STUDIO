import { test, expect } from '@playwright/test';

test('Deep Stack Auth Token Investigation', async ({ page, context }) => {
  console.log('🔍 INVESTIGATING STACK AUTH TOKEN ISSUE\n');

  // Step 1: Start OAuth and get callback
  console.log('📍 Step 1: Triggering OAuth callback...');
  
  // Navigate directly to callback with mock parameters
  const mockCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback?code=mock_auth_code_12345&state=mock_state_67890&scope=openid%20email%20profile';
  
  await page.goto(mockCallbackUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Current URL:', page.url());
  
  // Wait for redirects to complete
  await page.waitForTimeout(5000);
  console.log('🔄 After wait, URL:', page.url());
  
  // Step 2: Deep cookie investigation
  console.log('\n📍 Step 2: Deep cookie analysis...');
  
  const allCookies = await context.cookies();
  console.log('🍪 Total cookies found:', allCookies.length);
  
  const stackCookies = allCookies.filter(c => c.name.includes('stack'));
  console.log('🔍 Stack Auth cookies:', stackCookies.length);
  
  stackCookies.forEach((cookie, index) => {
    console.log(`   ${index + 1}. ${cookie.name}:`);
    console.log(`      Domain: ${cookie.domain}`);
    console.log(`      Path: ${cookie.path}`);
    console.log(`      Value length: ${cookie.value.length}`);
    console.log(`      HttpOnly: ${cookie.httpOnly}`);
    console.log(`      Secure: ${cookie.secure}`);
    console.log(`      SameSite: ${cookie.sameSite}`);
    
    if (cookie.name.includes('oauth') && cookie.value.length > 20) {
      console.log(`      Value preview: ${cookie.value.substring(0, 50)}...`);
    }
  });
  
  // Step 3: Test API endpoints with different approaches
  console.log('\n📍 Step 3: Testing API authentication methods...');
  
  // Test 1: Standard request
  console.log('🧪 Test 1: Standard API request');
  try {
    const response1 = await page.request.get('https://www.sselfie.ai/api/me');
    console.log(`   Status: ${response1.status()}`);
    
    if (response1.ok()) {
      const userData = await response1.json();
      console.log('   ✅ User authenticated:', userData.email || userData.id);
    } else {
      const errorText = await response1.text();
      console.log('   ❌ Error response:', errorText.substring(0, 100));
    }
  } catch (e) {
    console.log('   ❌ Request failed:', e);
  }
  
  // Test 2: Request with explicit cookies
  console.log('\n🧪 Test 2: Request with explicit Stack cookies');
  const cookieHeader = stackCookies.map(c => `${c.name}=${c.value}`).join('; ');
  if (cookieHeader) {
    try {
      const response2 = await page.request.get('https://www.sselfie.ai/api/me', {
        headers: {
          'Cookie': cookieHeader
        }
      });
      console.log(`   Status: ${response2.status()}`);
      
      if (response2.ok()) {
        const userData = await response2.json();
        console.log('   ✅ User authenticated with explicit cookies:', userData.email || userData.id);
      } else {
        const errorText = await response2.text();
        console.log('   ❌ Error with explicit cookies:', errorText.substring(0, 100));
      }
    } catch (e) {
      console.log('   ❌ Explicit cookie request failed:', e);
    }
  } else {
    console.log('   ⚠️ No Stack cookies to test with');
  }
  
  // Test 3: Check Stack Auth endpoints directly
  console.log('\n🧪 Test 3: Stack Auth internal endpoints');
  
  const stackEndpoints = [
    '/api/v1/current-user',
    '/api/v1/users/me',
    '/api/stack-auth/user',
    '/handler/current-user'
  ];
  
  for (const endpoint of stackEndpoints) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
      console.log(`   ${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (response.ok()) {
        const data = await response.json();
        if (data.email || data.id) {
          console.log(`      User: ${data.email || data.id}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: Error`);
    }
  }
  
  // Step 4: Browser-side Stack Auth check
  console.log('\n📍 Step 4: Browser-side Stack Auth investigation...');
  
  await page.goto('https://www.sselfie.ai/');
  await page.waitForLoadState('networkidle');
  
  const browserAuthState = await page.evaluate(async () => {
    console.log('🔍 Browser evaluation starting...');
    
    // Check if Stack Auth is loaded
    const stackAuth = (window as any).stackAuth;
    if (!stackAuth) {
      return { error: 'Stack Auth not available in browser' };
    }
    
    try {
      // Try to get current user
      const user = await stackAuth.getUser();
      return {
        hasUser: !!user,
        userEmail: user?.primaryEmail,
        userId: user?.id,
        stackAuthLoaded: true
      };
    } catch (error) {
      return {
        error: String(error),
        stackAuthLoaded: true,
        hasUser: false
      };
    }
  });
  
  console.log('🔍 Browser auth state:', browserAuthState);
  
  // Step 5: Check specific Stack Auth configuration issues
  console.log('\n📍 Step 5: Stack Auth configuration validation...');
  
  // Check if the OAuth callback actually processed correctly
  const callbackTestUrl = 'https://www.sselfie.ai/handler/oauth-callback';
  const callbackResponse = await page.request.get(callbackTestUrl);
  console.log(`🔄 OAuth callback endpoint status: ${callbackResponse.status()}`);
  
  if (callbackResponse.status() === 200) {
    const callbackText = await callbackResponse.text();
    if (callbackText.includes('Stack') || callbackText.includes('auth')) {
      console.log('✅ OAuth callback endpoint appears to be Stack Auth handler');
    } else {
      console.log('⚠️ OAuth callback endpoint might not be properly configured');
      console.log('   Response preview:', callbackText.substring(0, 200));
    }
  }
  
  console.log('\n🎯 TOKEN INVESTIGATION COMPLETE');
  console.log('This test checks if Stack Auth tokens are properly set and validated.');
});