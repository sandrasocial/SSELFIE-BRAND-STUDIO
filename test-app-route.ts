/**
 * Test the /app route loading to see what's failing
 */

import { useAuth } from './client/src/hooks/use-auth.js';

async function testAppRoute() {
  console.log('🧪 === TESTING /app ROUTE ACCESS ===');
  
  try {
    // Test 1: Check if the app layout file exists and can be imported
    console.log('\n📁 Test 1: Check SselfieAppLayout import...');
    
    try {
      const appLayoutModule = await import('./client/src/app_v2/SselfieAppLayout.js');
      console.log('✅ SselfieAppLayout imports successfully');
      console.log('   - Default export:', !!appLayoutModule.default);
    } catch (importError) {
      console.log('❌ SselfieAppLayout import failed:', (importError as Error).message);
    }
    
    // Test 2: Check if related components exist
    console.log('\n📁 Test 2: Check related components...');
    
    const componentsToTest = [
      './client/src/components/ProtectedRoute.js',
      './client/src/components/PageLoader.js',
      './client/src/hooks/use-auth.js'
    ];
    
    for (const component of componentsToTest) {
      try {
        await import(component);
        console.log(`✅ ${component} - OK`);
      } catch (error) {
        console.log(`❌ ${component} - FAILED: ${(error as Error).message}`);
      }
    }
    
    // Test 3: Check if route handler is working
    console.log('\n🛤️  Test 3: Route configuration check...');
    console.log('App route should be: /app → ProtectedRoute → SselfieAppLayout');
    console.log('Looking for potential issues:');
    console.log('- Import path: "./app_v2/SselfieAppLayout.js"');
    console.log('- Component wrapping: ProtectedRoute → Suspense → SselfieAppLayout');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAppRoute().catch(console.error);