/**
 * Stack Auth Cookie Debug Test
 * Tests cookie handling and authentication flow
 */

import https from 'https';
import http from 'http';

// Test configuration
const TEST_CONFIG = {
  local: {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:3000',
  },
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
        'User-Agent': 'Stack Auth Cookie Debug Test',
        'Accept': 'application/json',
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

// Test cookie parsing
async function testCookieParsing() {
  console.log('🍪 Testing Stack Auth cookie parsing...\n');
  
  // Test valid stack-access cookie format
  const validCookie = '["token_123", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk4ODAwfQ.signature"]';
  
  try {
    const parsed = JSON.parse(validCookie);
    console.log('✅ Valid cookie format parsed successfully');
    console.log('   Token ID:', parsed[0]);
    console.log('   JWT Token:', parsed[1].substring(0, 50) + '...');
    console.log('   Array length:', parsed.length);
  } catch (error) {
    console.log('❌ Failed to parse valid cookie format:', error.message);
  }
  
  // Test invalid formats
  const invalidFormats = [
    'invalid_json',
    '["only_one_element"]',
    '{"not_an_array": true}',
    'null',
    'undefined'
  ];
  
  for (const invalid of invalidFormats) {
    try {
      const parsed = JSON.parse(invalid);
      if (!Array.isArray(parsed) || parsed.length < 2) {
        console.log('⚠️  Invalid format detected:', invalid);
      }
    } catch (error) {
      console.log('❌ Invalid format (expected):', invalid);
    }
  }
  
  console.log('');
}

// Test API endpoints
async function testAPIEndpoints(environment) {
  const config = TEST_CONFIG[environment];
  console.log(`🔍 Testing ${environment} environment...\n`);
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest(`${config.apiUrl}/api/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response:`, healthResponse.data);
    console.log('');
    
    // Test auth user endpoint (should fail without auth)
    console.log('2. Testing auth user endpoint (no auth)...');
    const authResponse = await makeRequest(`${config.apiUrl}/api/auth/user`);
    console.log(`   Status: ${authResponse.status}`);
    console.log(`   Response:`, authResponse.data);
    console.log('');
    
    // Test gallery endpoint (should fail without auth)
    console.log('3. Testing gallery endpoint (no auth)...');
    const galleryResponse = await makeRequest(`${config.apiUrl}/api/gallery`);
    console.log(`   Status: ${galleryResponse.status}`);
    console.log(`   Response:`, galleryResponse.data);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing ${environment}:`, error.message);
  }
}

// Test frontend routes
async function testFrontendRoutes(environment) {
  const config = TEST_CONFIG[environment];
  console.log(`🌐 Testing ${environment} frontend routes...\n`);
  
  try {
    // Test main page
    console.log('1. Testing main page...');
    const mainResponse = await makeRequest(config.baseUrl);
    console.log(`   Status: ${mainResponse.status}`);
    console.log(`   Content-Type: ${mainResponse.headers['content-type']}`);
    console.log(`   Set-Cookie headers: ${mainResponse.cookies.length}`);
    if (mainResponse.cookies.length > 0) {
      console.log('   Cookies:', mainResponse.cookies);
    }
    console.log('');
    
    // Test handler routes
    console.log('2. Testing handler routes...');
    const handlerResponse = await makeRequest(`${config.baseUrl}/handler/sign-in`);
    console.log(`   Status: ${handlerResponse.status}`);
    console.log(`   Content-Type: ${handlerResponse.headers['content-type']}`);
    console.log(`   Set-Cookie headers: ${handlerResponse.cookies.length}`);
    if (handlerResponse.cookies.length > 0) {
      console.log('   Cookies:', handlerResponse.cookies);
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error testing ${environment} frontend:`, error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Stack Auth Cookie Debug Test\n');
  console.log('=' .repeat(50));
  
  // Test cookie parsing
  await testCookieParsing();
  
  // Test API endpoints
  await testAPIEndpoints('production');
  
  // Test frontend routes
  await testFrontendRoutes('production');
  
  console.log('✅ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check browser console for Stack Auth debugging logs');
  console.log('2. Verify cookies are being set after login');
  console.log('3. Check if cookies are being sent with API requests');
  console.log('4. Verify domain and SameSite cookie settings');
}

// Run the tests
runTests().catch(console.error);

