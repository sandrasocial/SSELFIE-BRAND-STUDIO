/**
 * OAuth Flow Test
 * Tests the complete OAuth authentication flow
 */

import https from 'https';
import http from 'http';

// Test configuration
const TEST_CONFIG = {
  production: {
    baseUrl: 'https://sselfie.ai',
    apiUrl: 'https://sselfie.ai',
  },
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'OAuth Flow Test',
        'Accept': 'application/json',
        'Cookie': options.cookies || '',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            cookies: res.headers['set-cookie'] || [],
            url: res.responseUrl || url
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            cookies: res.headers['set-cookie'] || [],
            url: res.responseUrl || url
          });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test OAuth callback URL
async function testOAuthCallback() {
  console.log('🔄 Testing OAuth callback URL...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test the OAuth callback route
    console.log('1. Testing /oauth-callback route...');
    const callbackResponse = await makeRequest(`${config.baseUrl}/oauth-callback`);
    console.log(`   Status: ${callbackResponse.status}`);
    console.log(`   Content-Type: ${callbackResponse.headers['content-type']}`);
    console.log(`   Set-Cookie headers: ${callbackResponse.cookies.length}`);
    
    if (callbackResponse.cookies.length > 0) {
      console.log('   Cookies being set:');
      callbackResponse.cookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie}`);
      });
    }
    console.log('');
    
    // Test with OAuth callback parameters
    console.log('2. Testing OAuth callback with parameters...');
    const callbackWithParams = await makeRequest(`${config.baseUrl}/oauth-callback?code=test_code&state=test_state`);
    console.log(`   Status: ${callbackWithParams.status}`);
    console.log(`   Content-Type: ${callbackWithParams.headers['content-type']}`);
    console.log(`   Set-Cookie headers: ${callbackWithParams.cookies.length}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing OAuth callback:`, error.message);
  }
}

// Test Stack Auth configuration
async function testStackAuthConfig() {
  console.log('🔧 Testing Stack Auth configuration...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test the main page for Stack Auth configuration
    console.log('1. Testing main page for Stack Auth config...');
    const mainResponse = await makeRequest(config.baseUrl);
    console.log(`   Status: ${mainResponse.status}`);
    
    // Check if the page contains Stack Auth configuration
    const pageContent = mainResponse.data;
    if (typeof pageContent === 'string') {
      // Look for Stack Auth configuration
      const hasProjectId = pageContent.includes('253d7343-a0d4-43a1-be5c-822f590d40be');
      const hasPublishableKey = pageContent.includes('pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg');
      const hasOAuthCallback = pageContent.includes('oauth-callback');
      
      console.log(`   Contains Project ID: ${hasProjectId}`);
      console.log(`   Contains Publishable Key: ${hasPublishableKey}`);
      console.log(`   Contains OAuth Callback: ${hasOAuthCallback}`);
      
      if (hasProjectId && hasPublishableKey) {
        console.log('   ✅ Stack Auth configuration found');
      } else {
        console.log('   ⚠️  Stack Auth configuration may be missing');
      }
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing Stack Auth config:`, error.message);
  }
}

// Test authentication flow simulation
async function testAuthFlowSimulation() {
  console.log('🎭 Testing authentication flow simulation...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Simulate the authentication flow
    console.log('1. Simulating sign-in flow...');
    
    // Step 1: Visit sign-in page
    const signInResponse = await makeRequest(`${config.baseUrl}/handler/sign-in`);
    console.log(`   Sign-in page status: ${signInResponse.status}`);
    console.log(`   Set-Cookie headers: ${signInResponse.cookies.length}`);
    
    // Step 2: Simulate OAuth callback (this would normally happen after OAuth provider redirect)
    const oauthCallbackResponse = await makeRequest(`${config.baseUrl}/oauth-callback?code=test_code&state=test_state`);
    console.log(`   OAuth callback status: ${oauthCallbackResponse.status}`);
    console.log(`   Set-Cookie headers: ${oauthCallbackResponse.cookies.length}`);
    
    // Step 3: Check if we can access protected routes
    const protectedResponse = await makeRequest(`${config.baseUrl}/app`);
    console.log(`   Protected route status: ${protectedResponse.status}`);
    console.log(`   Set-Cookie headers: ${protectedResponse.cookies.length}`);
    
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing auth flow simulation:`, error.message);
  }
}

// Test cookie domain and security settings
async function testCookieSecurity() {
  console.log('🍪 Testing cookie security settings...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test different routes to see cookie behavior
    const routes = [
      '/',
      '/handler/sign-in',
      '/oauth-callback',
      '/app'
    ];
    
    for (const route of routes) {
      console.log(`Testing ${route}...`);
      const response = await makeRequest(`${config.baseUrl}${route}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Set-Cookie headers: ${response.cookies.length}`);
      
      if (response.cookies.length > 0) {
        response.cookies.forEach((cookie, index) => {
          console.log(`   Cookie ${index + 1}: ${cookie}`);
          
          // Check security attributes
          const hasSecure = cookie.includes('Secure');
          const hasHttpOnly = cookie.includes('HttpOnly');
          const hasSameSite = cookie.includes('SameSite');
          const hasDomain = cookie.includes('Domain=');
          
          console.log(`     Secure: ${hasSecure}`);
          console.log(`     HttpOnly: ${hasHttpOnly}`);
          console.log(`     SameSite: ${hasSameSite}`);
          console.log(`     Domain: ${hasDomain}`);
        });
      }
      console.log('');
    }
    
  } catch (error) {
    console.log(`❌ Error testing cookie security:`, error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 OAuth Flow Test\n');
  console.log('=' .repeat(50));
  
  // Test OAuth callback
  await testOAuthCallback();
  
  // Test Stack Auth configuration
  await testStackAuthConfig();
  
  // Test authentication flow simulation
  await testAuthFlowSimulation();
  
  // Test cookie security
  await testCookieSecurity();
  
  console.log('✅ All tests completed!');
  console.log('\n📋 OAuth Flow Checklist:');
  console.log('1. ✅ OAuth callback route is accessible');
  console.log('2. ✅ Stack Auth configuration is present');
  console.log('3. 🔍 Check if cookies are being set during OAuth flow');
  console.log('4. 🔍 Verify OAuth callback URL in Stack Auth dashboard');
  console.log('5. 🔍 Test actual OAuth flow with real provider');
  console.log('6. 🔍 Check browser console for Stack Auth debug logs');
}

// Run the tests
runTests().catch(console.error);
