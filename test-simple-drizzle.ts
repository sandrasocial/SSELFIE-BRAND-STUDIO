#!/usr/bin/env -S tsx

/**
 * Test simple Drizzle SQL query
 * Uses sql`` template to bypass schema issues
 */

import { config } from 'dotenv';
import { db } from './server/drizzle.js';
import { sql } from 'drizzle-orm';

// Load environment variables
config();

async function testSimpleDrizzle() {
  console.log('🔍 Testing simple Drizzle SQL query...\n');

  try {
    // Test 1: Raw SQL query through Drizzle
    console.log('📋 Testing raw SQL through Drizzle...');
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log('✅ Raw SQL query: PASSED');
    console.log('   Result:', result);

    // Test 2: Try a parameterized query
    console.log('\n🔍 Testing parameterized raw SQL...');
    const testUserId = '4baecefb-d77a-4221-91cd-26d790a0a917';
    const userResult = await db.execute(sql`SELECT * FROM users WHERE id = ${testUserId}`);
    console.log('✅ Parameterized query: PASSED');
    console.log('   Found user:', userResult.rows.length > 0 ? 'YES' : 'NO');

    console.log('\n🎉 Simple Drizzle queries work!');
    console.log('💡 Issue is likely with schema definition, not connection');
    
  } catch (error) {
    console.error('\n❌ Simple Drizzle test failed:');
    console.error('Error:', (error as Error).message);
    console.error('Stack:', (error as Error).stack);
    
    process.exit(1);
  }
}

// Run the test
testSimpleDrizzle();