/**
 * Simple Usage Service Test Script
 * Tests basic functionality without Jest complexity
 */

// Import the usage service
import('../server/usage-service.js').then(async (module) => {
  const { UsageService, isValidPlan, isValidApiResource, PLAN_LIMITS, API_COSTS } = module;

  console.log('🧪 Running Usage Service Tests...\n');

  // Test 1: Type Guards
  console.log('1. Testing Type Guards:');
  console.log(`   isValidPlan('admin'): ${isValidPlan('admin')}`);
  console.log(`   isValidPlan('invalid'): ${isValidPlan('invalid')}`);
  console.log(`   isValidApiResource('replicate_ai'): ${isValidApiResource('replicate_ai')}`);
  console.log(`   isValidApiResource('invalid'): ${isValidApiResource('invalid')}`);

  // Test 2: Plan Limits
  console.log('\n2. Testing Plan Limits:');
  console.log(`   PLAN_LIMITS keys: ${Object.keys(PLAN_LIMITS).join(', ')}`);
  console.log(`   Admin plan: ${JSON.stringify(PLAN_LIMITS.admin)}`);
  console.log(`   Studio plan: ${JSON.stringify(PLAN_LIMITS['sselfie-studio'])}`);

  // Test 3: API Costs
  console.log('\n3. Testing API Costs:');
  console.log(`   API_COSTS keys: ${Object.keys(API_COSTS).join(', ')}`);
  console.log(`   Replicate cost: $${API_COSTS.replicate_ai}`);

  // Test 4: Error Handling
  console.log('\n4. Testing Error Handling:');
  try {
    await UsageService.initializeUserUsage('', 'admin');
    console.log('   ❌ Should have thrown error for empty user ID');
  } catch (error) {
    console.log(`   ✅ Correctly threw error: ${error.message}`);
  }

  try {
    await UsageService.initializeUserUsage('test-user', 'invalid-plan');
    console.log('   ❌ Should have thrown error for invalid plan');
  } catch (error) {
    console.log(`   ✅ Correctly threw error: ${error.message}`);
  }

  // Test 5: Usage Check with Empty User ID
  console.log('\n5. Testing Usage Check:');
  const emptyUserResult = await UsageService.checkUsageLimit('');
  console.log(`   Empty user ID result: ${JSON.stringify(emptyUserResult, null, 2)}`);

  console.log('\n✅ Usage Service Tests Completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});