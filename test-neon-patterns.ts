#!/usr/bin/env -S tsx

/**
 * Test different Neon client patterns to find the working one
 * This will help identify the correct initialization pattern
 */

import { config } from 'dotenv';
import { neon, Pool } from '@neondatabase/serverless';

// Load environment variables
config();

async function testNeonClientPatterns() {
  console.log('🔍 Testing different Neon client patterns...\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ No DATABASE_URL found');
    process.exit(1);
  }

  try {
    // Pattern 1: Standard neon() function
    console.log('📋 Testing Pattern 1: neon() function...');
    const sql1 = neon(dbUrl);
    console.log('   Client type:', typeof sql1);
    console.log('   Is function:', typeof sql1 === 'function');
    console.log('   Constructor:', sql1.constructor.name);
    console.log('   Keys:', Object.keys(sql1));

    // Test if it works
    const result1 = await sql1`SELECT 1 as test`;
    console.log('✅ Pattern 1 works: SQL template literal');
    console.log('   Result:', result1[0]);

    // Pattern 2: Pool client
    console.log('\n🔍 Testing Pattern 2: Pool client...');
    const pool = new Pool({ connectionString: dbUrl });
    console.log('   Pool type:', typeof pool);
    console.log('   Has query method:', typeof pool.query);
    console.log('   Constructor:', pool.constructor.name);

    // Test pool query
    const result2 = await pool.query('SELECT 1 as test');
    console.log('✅ Pattern 2 works: Pool.query()');
    console.log('   Result:', result2.rows[0]);

    console.log('\n🎯 Both patterns work - issue is in Drizzle initialization');
    
  } catch (error) {
    console.error('\n❌ Neon client pattern test failed:');
    console.error('Error:', (error as Error).message);
    console.error('Stack:', (error as Error).stack);
    process.exit(1);
  }
}

// Run the test
testNeonClientPatterns();