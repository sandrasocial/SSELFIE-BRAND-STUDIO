// Tool Enforcement Test File
// Created to verify tool restrictions are working after security fixes

console.log('🔧 Testing Tool Enforcement System...');

// Test 1: Basic function execution
function testBasicFunction() {
  console.log('✅ Basic function execution works');
  return true;
}

// Test 2: Try to access restricted operations (should be blocked)
function testRestrictedOperations() {
  console.log('🚫 Testing restricted operations...');
  
  // These should be blocked by tool enforcement
  const restrictedTests = [
    () => eval('console.log("eval test")'),
    () => new Function('return "Function constructor test"')(),
    () => process?.exit?.(0)
  ];
  
  restrictedTests.forEach((test, index) => {
    try {
      test();
      console.log(`❌ Test ${index + 1}: Restriction bypassed (security issue)`);
    } catch (error) {
      console.log(`✅ Test ${index + 1}: Properly blocked - ${error.message}`);
    }
  });
}

// Test 3: Allowed operations should work
function testAllowedOperations() {
  console.log('✅ Testing allowed operations...');
  
  const allowedTests = [
    () => Math.random(),
    () => new Date().toISOString(),
    () => JSON.stringify({ test: 'data' })
  ];
  
  allowedTests.forEach((test, index) => {
    try {
      const result = test();
      console.log(`✅ Allowed operation ${index + 1} works:`, result);
    } catch (error) {
      console.log(`❌ Allowed operation ${index + 1} failed:`, error.message);
    }
  });
}

// Run all tests
function runTests() {
  console.log('🔍 Starting Tool Enforcement Tests...\n');
  
  testBasicFunction();
  console.log('');
  
  testRestrictedOperations();
  console.log('');
  
  testAllowedOperations();
  console.log('');
  
  console.log('🏁 Tool Enforcement Tests Complete');
}

// Execute tests
runTests();

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testBasicFunction,
    testRestrictedOperations,
    testAllowedOperations,
    runTests
  };
}