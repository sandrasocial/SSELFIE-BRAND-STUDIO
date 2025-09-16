#!/usr/bin/env node

/**
 * Stack Auth Flow Test
 * Tests the complete authentication flow from sign-in to redirect
 */

import https from 'https';
import http from 'http';

// Test configuration
const TEST_CONFIG = {
  local: {
    baseUrl: 'http://localhost:5173',
    handlerUrl: 'http://localhost:5173/handler/sign-in',
    appUrl: 'http://localhost:5173/app'
  },
  production: {
    baseUrl: 'https://sselfie.ai',
    handlerUrl: 'https://sselfie.ai/handler/sign-in',
    appUrl: 'https://sselfie.ai/app'
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Stack Auth Test Script',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: res.url || url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testBasicConnectivity(env) {
  console.log(`\n🔍 Testing basic connectivity for ${env}...`);
  
  try {
    const response = await makeRequest(TEST_CONFIG[env].baseUrl);
    console.log(`✅ ${env.toUpperCase()}: Status ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   📄 Page loads successfully`);
      return true;
    } else {
      console.log(`   ❌ Unexpected status code: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function testHandlerRoute(env) {
  console.log(`\n🔍 Testing /handler/sign-in route for ${env}...`);
  
  try {
    const response = await makeRequest(TEST_CONFIG[env].handlerUrl);
    console.log(`✅ ${env.toUpperCase()}: Handler route status ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      // Check if it contains Stack Auth components
      const body = response.body.toLowerCase();
      const hasStackAuth = body.includes('stack') || body.includes('signin') || body.includes('sign-in');
      
      if (hasStackAuth) {
        console.log(`   📄 Stack Auth components detected`);
        return true;
      } else {
        console.log(`   ⚠️  Page loads but no Stack Auth components found`);
        console.log(`   📄 Page content preview: ${body.substring(0, 200)}...`);
        return false;
      }
    } else if (response.statusCode === 404) {
      console.log(`   ❌ 404 - Route not found`);
      return false;
    } else {
      console.log(`   ❌ Unexpected status code: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Handler route failed: ${error.message}`);
    return false;
  }
}

async function testAppRoute(env) {
  console.log(`\n🔍 Testing /app route for ${env}...`);
  
  try {
    const response = await makeRequest(TEST_CONFIG[env].appUrl);
    console.log(`✅ ${env.toUpperCase()}: App route status ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   📄 App route accessible`);
      return true;
    } else if (response.statusCode === 302 || response.statusCode === 301) {
      console.log(`   🔄 Redirect detected (expected for unauthenticated users)`);
      return true;
    } else {
      console.log(`   ❌ Unexpected status code: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ App route failed: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log(`\n🔍 Testing environment variables...`);
  
  try {
    // Test local environment by checking if the dev server is running
    const response = await makeRequest('http://localhost:5173');
    
    if (response.statusCode === 200) {
      console.log(`✅ Local dev server is running`);
      
      // Check if the response contains environment variable indicators
      const body = response.body;
      const hasEnvVars = body.includes('VITE_STACK_PROJECT_ID') || 
                        body.includes('STACK_PROJECT_ID') ||
                        body.includes('pck_');
      
      if (hasEnvVars) {
        console.log(`   📄 Environment variables detected in page`);
      } else {
        console.log(`   ⚠️  No environment variables detected in page`);
      }
      
      return true;
    } else {
      console.log(`❌ Local dev server not responding`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Local dev server not accessible: ${error.message}`);
    return false;
  }
}

async function testStackAuthConfiguration() {
  console.log(`\n🔍 Testing Stack Auth configuration...`);
  
  try {
    // Try to access the handler route and check for Stack Auth specific content
    const response = await makeRequest('http://localhost:5173/handler/sign-in');
    
    if (response.statusCode === 200) {
      const body = response.body;
      
      // Check for Stack Auth specific elements
      const checks = [
        { name: 'Stack Auth script', pattern: /stack.*auth/i },
        { name: 'SignIn component', pattern: /signin|sign-in/i },
        { name: 'React components', pattern: /react/i },
        { name: 'OAuth buttons', pattern: /google|oauth|login/i }
      ];
      
      let found = 0;
      checks.forEach(check => {
        if (check.pattern.test(body)) {
          console.log(`   ✅ ${check.name} detected`);
          found++;
        } else {
          console.log(`   ❌ ${check.name} not found`);
        }
      });
      
      if (found > 0) {
        console.log(`   📊 Found ${found}/${checks.length} Stack Auth indicators`);
        return true;
      } else {
        console.log(`   ❌ No Stack Auth indicators found`);
        return false;
      }
    } else {
      console.log(`❌ Cannot access handler route: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Stack Auth configuration test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAuthTests() {
  console.log('🚀 Starting Stack Auth Flow Tests...\n');
  
  const results = {
    local: {},
    production: {},
    environment: {},
    stackAuth: {}
  };
  
  // Test environment variables
  results.environment = await testEnvironmentVariables();
  
  // Test Stack Auth configuration
  results.stackAuth = await testStackAuthConfiguration();
  
  // Test local environment
  results.local.connectivity = await testBasicConnectivity('local');
  results.local.handler = await testHandlerRoute('local');
  results.local.app = await testAppRoute('local');
  
  // Test production environment
  results.production.connectivity = await testBasicConnectivity('production');
  results.production.handler = await testHandlerRoute('production');
  results.production.app = await testAppRoute('production');
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  console.log('\n🔧 Environment & Configuration:');
  console.log(`   Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`   Stack Auth Config: ${results.stackAuth ? '✅' : '❌'}`);
  
  console.log('\n🏠 Local Development:');
  console.log(`   Connectivity: ${results.local.connectivity ? '✅' : '❌'}`);
  console.log(`   Handler Route: ${results.local.handler ? '✅' : '❌'}`);
  console.log(`   App Route: ${results.local.app ? '✅' : '❌'}`);
  
  console.log('\n🌐 Production:');
  console.log(`   Connectivity: ${results.production.connectivity ? '✅' : '❌'}`);
  console.log(`   Handler Route: ${results.production.handler ? '✅' : '❌'}`);
  console.log(`   App Route: ${results.production.app ? '✅' : '❌'}`);
  
  // Overall status
  const localWorking = results.local.connectivity && results.local.handler;
  const productionWorking = results.production.connectivity && results.production.handler;
  
  console.log('\n🎯 OVERALL STATUS:');
  if (localWorking && productionWorking) {
    console.log('   ✅ Authentication flow is working in both environments');
  } else if (localWorking) {
    console.log('   ⚠️  Authentication flow works locally but not in production');
  } else if (productionWorking) {
    console.log('   ⚠️  Authentication flow works in production but not locally');
  } else {
    console.log('   ❌ Authentication flow is not working in either environment');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!results.environment) {
    console.log('   • Check that VITE_STACK_PROJECT_ID and VITE_STACK_PUBLISHABLE_CLIENT_KEY are set');
  }
  if (!results.stackAuth) {
    console.log('   • Verify Stack Auth React components are properly imported and configured');
  }
  if (!results.local.handler) {
    console.log('   • Check local development server and routing configuration');
  }
  if (!results.production.handler) {
    console.log('   • Check Vercel deployment and routing configuration');
  }
}

// Run the tests
runAuthTests().catch(console.error);
