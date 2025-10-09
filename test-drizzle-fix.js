#!/usr/bin/env node

/**
 * Test Drizzle ORM after fix
 * Tests if the Drizzle serialization issue is resolved
 */

import { config } from 'dotenv';

// Load environment variables
config();

async function testDrizzleORM() {
  console.log('🔍 Testing Drizzle ORM after fix...\n');

  try {
    // Import Drizzle setup
    const { db } = await import('./server/drizzle.ts');
    const { users, userModels } = await import('./shared/schema.ts');
    const { eq } = await import('drizzle-orm');

    // Test 1: Simple count query
    console.log('📋 Testing simple count query...');
    const userCount = await db.select().from(users);
    console.log('✅ Users query: PASSED');
    console.log('   Total users found:', userCount.length);

    // Test 2: User models count
    console.log('\n🎯 Testing user models query...');
    const modelCount = await db.select().from(userModels);
    console.log('✅ User models query: PASSED');
    console.log('   Total models found:', modelCount.length);

    // Test 3: Parameterized query (this was failing before)
    console.log('\n🔍 Testing parameterized query...');
    const testUserId = '4baecefb-d77a-4221-91cd-26d790a0a917';
    const userQuery = await db.select().from(users).where(eq(users.id, testUserId));
    console.log('✅ Parameterized query: PASSED');
    console.log('   Found user:', userQuery.length > 0 ? 'YES' : 'NO');

    // Test 4: User model lookup
    console.log('\n⚠️ Testing user model lookup...');
    const modelQuery = await db.select().from(userModels).where(eq(userModels.userId, testUserId));
    console.log('✅ User model query: PASSED');
    console.log('   Found model:', modelQuery.length > 0 ? 'YES' : 'NO');

    console.log('\n🎉 All Drizzle ORM tests completed successfully!');
    console.log('💡 Drizzle serialization issue appears to be fixed!');
    
  } catch (error) {
    console.error('\n❌ Drizzle ORM test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('could not parse the HTTP request body')) {
      console.log('\n❌ Still getting serialization error - need to investigate further');
    }
    
    process.exit(1);
  }
}

// Run the test
testDrizzleORM();