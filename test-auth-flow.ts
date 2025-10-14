/**
 * Test Authentication Flow
 * Simulates the authentication process to verify user linking works
 */

import { resolveUserWithAutoLinking } from './server/_utils/auth-helpers.js';

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...');

  try {
    // Test 1: Existing linked user
    console.log('\n📋 Test 1: Existing linked user');
    const linkedUser = await resolveUserWithAutoLinking('4baecefb-d77a-4221-91cd-26d790a0a917', 'sandra@ssasocial.com');
    console.log('✅ Linked user resolved:', { id: linkedUser.id, email: linkedUser.email, stackAuthId: (linkedUser as any).stackAuthId });

    // Test 2: Unlinked user with email that exists in DB
    console.log('\n📋 Test 2: Unlinked user with existing email');
    const unlinkedUser = await resolveUserWithAutoLinking('test-stack-auth-id-123', 'sandrajonna@gmail.com');
    console.log('✅ Unlinked user linked:', { id: unlinkedUser.id, email: unlinkedUser.email, stackAuthId: (unlinkedUser as any).stackAuthId });

    // Test 3: Completely new user
    console.log('\n📋 Test 3: Completely new user');
    const uniqueId = `test-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const newUser = await resolveUserWithAutoLinking(uniqueId, `newuser-${Date.now()}@example.com`);
    console.log('✅ New user created:', { id: newUser.id, email: newUser.email, stackAuthId: (newUser as any).stackAuthId });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthFlow()
    .then(() => {
      console.log('\n🎉 Authentication flow test complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testAuthFlow };