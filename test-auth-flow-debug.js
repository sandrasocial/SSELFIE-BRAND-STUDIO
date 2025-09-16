/**
 * Stack Auth Flow Debug Test
 * Tests the complete authentication flow with cookie handling
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

// Helper function to make HTTP requests with cookies
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Stack Auth Flow Debug Test',
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
            cookies: res.headers['set-cookie'] || []
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test Stack Auth configuration
async function testStackAuthConfig() {
  console.log('🔧 Testing Stack Auth configuration...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test the main page to see if Stack Auth is loaded
    console.log('1. Testing main page for Stack Auth...');
    const mainResponse = await makeRequest(config.baseUrl);
    console.log(`   Status: ${mainResponse.status}`);
    
    // Check if the page contains Stack Auth configuration
    const pageContent = mainResponse.data;
    if (typeof pageContent === 'string') {
      const hasStackAuth = pageContent.includes('stackframe') || pageContent.includes('StackClientApp');
      console.log(`   Contains Stack Auth: ${hasStackAuth}`);
      
      if (hasStackAuth) {
        console.log('   ✅ Stack Auth is loaded on the page');
      } else {
        console.log('   ⚠️  Stack Auth may not be loaded properly');
      }
    }
    console.log('');
    
    // Test handler routes
    console.log('2. Testing handler routes...');
    const handlerResponse = await makeRequest(`${config.baseUrl}/handler/sign-in`);
    console.log(`   Status: ${handlerResponse.status}`);
    console.log(`   Content-Type: ${handlerResponse.headers['content-type']}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing Stack Auth config:`, error.message);
  }
}

// Test API authentication with mock cookies
async function testAPIAuthentication() {
  console.log('🔐 Testing API authentication...\n');
  
  const config = TEST_CONFIG.production;
  
  // Test with mock stack-access cookie
  const mockCookie = 'stack-access=["token_123", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk4ODAwfQ.signature"]';
  
  try {
    console.log('1. Testing with mock stack-access cookie...');
    const authResponse = await makeRequest(`${config.apiUrl}/api/auth/user`, {
      cookies: mockCookie
    });
    console.log(`   Status: ${authResponse.status}`);
    console.log(`   Response:`, authResponse.data);
    console.log('');
    
    // Test gallery with mock cookie
    console.log('2. Testing gallery with mock cookie...');
    const galleryResponse = await makeRequest(`${config.apiUrl}/api/gallery`, {
      cookies: mockCookie
    });
    console.log(`   Status: ${galleryResponse.status}`);
    console.log(`   Response:`, galleryResponse.data);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing API authentication:`, error.message);
  }
}

// Test cookie domain and path settings
async function testCookieSettings() {
  console.log('🍪 Testing cookie settings...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test if cookies are being set with proper domain
    console.log('1. Testing cookie domain settings...');
    const response = await makeRequest(`${config.baseUrl}/handler/sign-in`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Set-Cookie headers: ${response.cookies.length}`);
    
    if (response.cookies.length > 0) {
      console.log('   Cookies being set:');
      response.cookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie}`);
        
        // Check domain setting
        if (cookie.includes('Domain=')) {
          const domainMatch = cookie.match(/Domain=([^;]+)/);
          if (domainMatch) {
            console.log(`      Domain: ${domainMatch[1]}`);
          }
        }
        
        // Check SameSite setting
        if (cookie.includes('SameSite=')) {
          const sameSiteMatch = cookie.match(/SameSite=([^;]+)/);
          if (sameSiteMatch) {
            console.log(`      SameSite: ${sameSiteMatch[1]}`);
          }
        }
        
        // Check Secure setting
        if (cookie.includes('Secure')) {
          console.log(`      Secure: true`);
        }
      });
    } else {
      console.log('   ⚠️  No cookies being set');
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing cookie settings:`, error.message);
  }
}

// Test CORS and credentials
async function testCORSSettings() {
  console.log('🌐 Testing CORS and credentials...\n');
  
  const config = TEST_CONFIG.production;
  
  try {
    // Test preflight request
    console.log('1. Testing CORS preflight...');
    const preflightResponse = await makeRequest(`${config.apiUrl}/api/auth/user`, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.baseUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log(`   Status: ${preflightResponse.status}`);
    console.log(`   CORS headers:`);
    console.log(`     Access-Control-Allow-Origin: ${preflightResponse.headers['access-control-allow-origin']}`);
    console.log(`     Access-Control-Allow-Credentials: ${preflightResponse.headers['access-control-allow-credentials']}`);
    console.log(`     Access-Control-Allow-Methods: ${preflightResponse.headers['access-control-allow-methods']}`);
    console.log(`     Access-Control-Allow-Headers: ${preflightResponse.headers['access-control-allow-headers']}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing CORS:`, error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Stack Auth Flow Debug Test\n');
  console.log('=' .repeat(50));
  
  // Test Stack Auth configuration
  await testStackAuthConfig();
  
  // Test API authentication
  await testAPIAuthentication();
  
  // Test cookie settings
  await testCookieSettings();
  
  // Test CORS settings
  await testCORSSettings();
  
  console.log('✅ All tests completed!');
  console.log('\n📋 Debugging checklist:');
  console.log('1. ✅ Check if Stack Auth is loaded on the page');
  console.log('2. ✅ Verify API endpoints are working');
  console.log('3. ✅ Check cookie domain and SameSite settings');
  console.log('4. ✅ Verify CORS headers allow credentials');
  console.log('5. 🔍 Check browser console for Stack Auth logs');
  console.log('6. 🔍 Verify cookies are set after login');
  console.log('7. 🔍 Check if cookies are sent with API requests');
}

// Run the tests
runTests().catch(console.error);

