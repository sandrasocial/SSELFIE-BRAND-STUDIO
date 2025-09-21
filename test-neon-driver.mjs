#!/usr/bin/env node

// Test script to verify Neon serverless driver is working
import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

// Test DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
console.log('🔍 Testing Neon serverless driver...');
console.log('📡 Database URL configured:', DATABASE_URL ? '✅ YES' : '❌ NO');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

try {
  // Test HTTP connection
  console.log('\n📊 Testing HTTP connection...');
  const sql = neon(DATABASE_URL, {
    fetchOptions: {
      priority: 'high',
    },
  });

  // Simple test query
  const result = await sql`SELECT 1 as test_value, NOW() as current_time`;
  console.log('✅ HTTP connection successful:', result);

  // Test WebSocket Pool (don't connect, just create)
  console.log('\n🔌 Testing WebSocket Pool creation...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 5000,
  });
  console.log('✅ WebSocket Pool created successfully');

  // Clean up
  await pool.end();
  console.log('✅ Pool cleaned up');

  console.log('\n🎉 All tests passed! Neon serverless driver is working correctly.');
  process.exit(0);

} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}