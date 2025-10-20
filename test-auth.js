#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests Stack Auth configuration and JWT validation
 */

import { config } from 'dotenv';
import { createRequire } from 'module';

// Load environment variables
config({ path: '.env.local' });

const require = createRequire(import.meta.url);

async function testStackAuthConfig() {
  console.log('🔧 Testing Stack Auth Configuration...\n');
  
  // Check environment variables
  const requiredVars = [
    'VITE_STACK_PROJECT_ID',
    'STACK_PROJECT_ID', 
    'STACK_AUTH_PROJECT_ID',
    'STACK_SECRET_SERVER_KEY',
    'STACK_AUTH_SECRET_KEY',
    'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
    'DATABASE_URL'
  ];
  
  console.log('📋 Environment Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value ? `${value.substring(0, 8)}...` : 'MISSING';
    console.log(`${status} ${varName}: ${display}`);
  }
  
  console.log('\n🔍 Stack Auth Configuration:');
  const projectId = process.env.VITE_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID;
  const secretKey = process.env.STACK_SECRET_SERVER_KEY || process.env.STACK_AUTH_SECRET_KEY;
  const publishableKey = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
  
  console.log(`Project ID: ${projectId}`);
  console.log(`Secret Key: ${secretKey ? 'Present' : 'Missing'}`);
  console.log(`Publishable Key: ${publishableKey ? 'Present' : 'Missing'}`);
  
  // Test JWKS URL
  console.log('\n🌐 Testing JWKS URL...');
  const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`;
  console.log(`JWKS URL: ${jwksUrl}`);
  
  try {
    const response = await fetch(jwksUrl, { method: 'GET' });
    
    if (response.ok) {
      const jwks = await response.json();
      console.log('✅ JWKS fetch successful');
      console.log(`   Keys available: ${jwks.keys ? jwks.keys.length : 0}`);
    } else {
      console.log(`❌ JWKS fetch failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ JWKS fetch error: ${error.message}`);
  }
  
  // Test database connection
  console.log('\n💾 Testing Database Connection...');
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
  }
  
  console.log('\n🏁 Authentication test complete.');
}

// Run the test
testStackAuthConfig().catch(console.error);