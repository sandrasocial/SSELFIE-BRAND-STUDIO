/**
 * Test API endpoints to diagnose authentication issues
 */

console.log('🧪 Testing API endpoints...\n');

// Test 1: Health check
async function testHealthEndpoint() {
  try {
    const response = await fetch('https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app/api/health');
    console.log('🏥 Health endpoint status:', response.status);
    const data = await response.text();
    console.log('🏥 Health response:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

// Test 2: /api/me without auth
async function testMeEndpointUnauthenticated() {
  try {
    const response = await fetch('https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app/api/me');
    console.log('👤 /api/me (unauth) status:', response.status);
    const data = await response.json();
    console.log('👤 /api/me (unauth) response:', data);
  } catch (error) {
    console.error('❌ /api/me (unauth) failed:', error);
  }
}

// Test 3: Check if client-side routing works
async function testClientRoutes() {
  const routes = [
    '/',
    '/app',
    '/simple-training', 
    '/auth-success',
    '/sign-in'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(`https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app${route}`);
      console.log(`📍 Route ${route}: ${response.status} ${response.statusText}`);
      
      // Check if it's returning HTML (client-side app) or error
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.log(`   ✅ Returns HTML (client app)`);
      } else {
        console.log(`   ⚠️ Content-Type: ${contentType}`);
      }
      
    } catch (error) {
      console.error(`❌ Route ${route} failed:`, error);
    }
  }
}

// Test 4: Check Stack Auth configuration
async function testStackAuthConfig() {
  const config = {
    projectId: process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be',
    publishableKey: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg'
  };
  
  console.log('🔑 Stack Auth Config:');
  console.log('   Project ID:', config.projectId);
  console.log('   Publishable Key:', config.publishableKey.substring(0, 20) + '...');
  
  // Test JWKS endpoint
  try {
    const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${config.projectId}/.well-known/jwks.json`;
    const response = await fetch(jwksUrl);
    console.log('🔐 JWKS endpoint status:', response.status);
    
    if (response.ok) {
      const jwks = await response.json();
      console.log('🔐 JWKS keys count:', jwks.keys?.length || 0);
    }
  } catch (error) {
    console.error('❌ JWKS test failed:', error);
  }
}

// Run all tests
async function runTests() {
  await testHealthEndpoint();
  console.log('');
  await testMeEndpointUnauthenticated();
  console.log('');
  await testClientRoutes();
  console.log('');
  await testStackAuthConfig();
}

runTests().catch(console.error);