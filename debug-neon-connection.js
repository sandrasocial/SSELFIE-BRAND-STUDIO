#!/usr/bin/env node

/**
 * Debug NeonDB Connection Issue
 * Tests raw Neon connection to isolate the serialization problem
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config();

async function debugNeonConnection() {
  console.log('🔍 Debugging Neon DB Connection Issue...\n');

  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log(`✅ DATABASE_URL configured: ${dbUrl.substring(0, 30)}...`);

  try {
    // Test 1: Raw Neon connection without Drizzle
    console.log('\n📋 Testing raw Neon connection...');
    const sql = neon(dbUrl);
    
    // Simple query first
    const basicTest = await sql`SELECT 1 as test, NOW() as timestamp`;
    console.log('✅ Basic raw query: PASSED');
    console.log('   Result:', basicTest[0]);

    // Test 2: Query user table with simple select
    console.log('\n👤 Testing users table query...');
    const userCount = await sql`SELECT COUNT(*) as user_count FROM users`;
    console.log('✅ Users table count: PASSED');
    console.log('   User count:', userCount[0]?.user_count || 0);

    // Test 3: Query user_models table
    console.log('\n🎯 Testing user_models table...');
    const modelCount = await sql`SELECT COUNT(*) as model_count FROM user_models`;
    console.log('✅ User models count: PASSED');
    console.log('   Model count:', modelCount[0]?.model_count || 0);

    // Test 4: Query with WHERE clause (this might trigger the serialization issue)
    console.log('\n🔍 Testing parameterized query...');
    const testUserId = '4baecefb-d77a-4221-91cd-26d790a0a917'; // From the logs
    const userQuery = await sql`SELECT * FROM users WHERE id = ${testUserId} LIMIT 1`;
    console.log('✅ Parameterized query: PASSED');
    console.log('   Found user:', userQuery.length > 0 ? 'YES' : 'NO');

    // Test 5: Try to reproduce the exact query that's failing
    console.log('\n⚠️ Testing user model lookup...');
    const modelQuery = await sql`SELECT * FROM user_models WHERE user_id = ${testUserId} LIMIT 1`;
    console.log('✅ User model query: PASSED');
    console.log('   Found model:', modelQuery.length > 0 ? 'YES' : 'NO');
    if (modelQuery.length > 0) {
      console.log('   Training status:', modelQuery[0].training_status);
    }

    console.log('\n🎉 All raw Neon tests completed successfully!');
    console.log('💡 Raw Neon connection is working - issue is likely in Drizzle layer');
    
  } catch (error) {
    console.error('\n❌ Raw Neon connection test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Check if this is the serialization error we're seeing
    if (error.message.includes('could not parse the HTTP request body')) {
      console.log('\n🎯 FOUND THE ISSUE: This is the same serialization error!');
      console.log('🔧 This indicates a problem with:');
      console.log('1. Neon serverless package version compatibility');
      console.log('2. Environment variable format');
      console.log('3. Network/proxy issues with Neon API');
      console.log('4. Invalid characters in query parameters');
    }
    
    process.exit(1);
  }
}

// Run the debug test
debugNeonConnection();