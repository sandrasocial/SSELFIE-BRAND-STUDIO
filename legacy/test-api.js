/**
 * Simple API route testing script
 */

// Test health check endpoint
async function testHealthCheck() {
  console.log('🧪 Testing health check endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/health-check');
    const data = await response.json();
    
    console.log('✅ Health check response:', data);
    console.log('✅ Status:', response.status);
    console.log('✅ Response time:', response.headers.get('x-response-time') || 'N/A');
    
    return response.status === 200 && data.ok === true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

// Test hair trends endpoint
async function testHairTrends() {
  console.log('🧪 Testing hair trends endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/hair-trends');
    const data = await response.json();
    
    console.log('✅ Hair trends response:', data);
    console.log('✅ Status:', response.status);
    
    return response.status === 200 && data.success === true;
  } catch (error) {
    console.log('❌ Hair trends failed:', error.message);
    return false;
  }
}

// Test Maya chat endpoint
async function testMayaChat() {
  console.log('🧪 Testing Maya chat endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/maya/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
    });
    
    console.log('✅ Maya chat status:', response.status);
    console.log('✅ Content-Type:', response.headers.get('content-type'));
    
    return response.status === 200;
  } catch (error) {
    console.log('❌ Maya chat failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API acceptance tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    hairTrends: await testHairTrends(),
    mayaChat: await testMayaChat()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log('Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
  console.log('Hair Trends:', results.hairTrends ? '✅ PASS' : '❌ FAIL');
  console.log('Maya Chat:', results.mayaChat ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testHealthCheck, testHairTrends, testMayaChat };
