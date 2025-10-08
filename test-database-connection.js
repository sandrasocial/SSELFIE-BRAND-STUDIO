#!/usr/bin/env node

/**
 * Database Connection Test
 * Tests Drizzle ORM connection and basic functionality
 */

import { config } from 'dotenv';
import { serverlessQuery } from './server/drizzle.ts';

// Load environment variables
config();

async function testDatabaseConnection() {
  console.log('🔍 Testing SSELFIE Studio Database Connection...\n');

  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log(`✅ DATABASE_URL configured: ${dbUrl.substring(0, 20)}...`);

  try {
    // Test 1: Basic connection - use direct SQL template instead of parameterized query
    console.log('\n📋 Testing basic database connection...');
    const { getSql } = await import('./server/drizzle.ts');
    const sql = getSql();
    const basicTest = await sql`SELECT 1 as test, NOW() as timestamp`;
    console.log('✅ Basic connection test: PASSED');
    console.log('   Result:', basicTest[0]);

    // Test 2: Check for user table
    console.log('\n👤 Testing users table...');
    const userTableTest = await sql`SELECT COUNT(*) as user_count FROM users LIMIT 1`;
    console.log('✅ Users table test: PASSED');
    console.log('   User count:', userTableTest[0]?.user_count || 0);

    // Test 3: Check for Maya-specific tables
    console.log('\n🧠 Testing Maya AI tables...');
    const mayaTablesTest = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%maya%'
      ORDER BY table_name
    `;
    console.log('✅ Maya tables test: PASSED');
    console.log('   Maya tables found:', mayaTablesTest.map(r => r.table_name));

    // Test 4: Check for image generation tables
    console.log('\n🖼️ Testing image generation tables...');
    const imageTablesTest = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%image%' OR table_name LIKE '%generated%')
      ORDER BY table_name
    `;
    console.log('✅ Image generation tables test: PASSED');
    console.log('   Image tables found:', imageTablesTest.map(r => r.table_name));

    console.log('\n🎉 All database tests completed successfully!');
    console.log('💡 Your SSELFIE Studio database is properly connected!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check that your DATABASE_URL is correct');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Run database migrations: npm run db:migrate');
    console.log('4. Check network connectivity to Neon');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();