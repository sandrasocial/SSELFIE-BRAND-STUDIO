/**
 * Test auth-success route specifically in production
 */

async function testAuthSuccessRoute() {
  console.log('🧪 Testing /auth-success route specifically...\n');
  
  const baseUrl = 'https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app';
  
  try {
    // Test 1: Direct GET request to /auth-success
    console.log('📍 Test 1: Direct GET request to /auth-success');
    const response = await fetch(`${baseUrl}/auth-success`);
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.status === 404) {
      console.log('❌ CONFIRMED: /auth-success returns 404!');
      console.log('This is the root cause of the OAuth loop issue.');
    }
    
    if (response.status === 200) {
      const html = await response.text();
      
      // Check if it's the React app
      const hasReactApp = html.includes('id="root"') || html.includes('main.tsx') || html.includes('vite');
      const hasAuthSuccessComponent = html.includes('AuthSuccess') || html.includes('auth-success');
      const hasStackAuth = html.includes('stack-auth') || html.includes('STACK_PROJECT_ID');
      
      console.log('✅ Returns HTML');
      console.log('   React App:', hasReactApp);
      console.log('   AuthSuccess Component:', hasAuthSuccessComponent);
      console.log('   Stack Auth Config:', hasStackAuth);
      
      // Check if the built JS files contain auth-success
      const hasAuthSuccessJS = html.includes('auth-success') || html.includes('AuthSuccess');
      console.log('   Contains auth-success JS:', hasAuthSuccessJS);
    }
    
    // Test 2: Check with different paths
    const testPaths = ['/auth-success/', '/auth-success?code=test', '/auth-success#test'];
    
    for (const path of testPaths) {
      console.log(`\n📍 Testing: ${path}`);
      const testResponse = await fetch(`${baseUrl}${path}`);
      console.log('Status:', testResponse.status);
    }
    
    // Test 3: Compare with other routes
    console.log('\n📍 Comparison - Testing other routes:');
    const otherRoutes = ['/app', '/simple-training', '/sign-in'];
    
    for (const route of otherRoutes) {
      const testResponse = await fetch(`${baseUrl}${route}`);
      console.log(`${route}: ${testResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthSuccessRoute().catch(console.error);