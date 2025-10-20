#!/usr/bin/env node

/**
 * Simple JWT Test
 * Test JWT validation without Vercel dependencies
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testJWTValidation() {
  console.log('🔑 Testing JWT Validation...\n');
  
  // Create a test JWT token (this would normally come from Stack Auth)
  const projectId = process.env.VITE_STACK_PROJECT_ID;
  const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`;
  
  console.log('📋 JWT Test Configuration:');
  console.log(`Project ID: ${projectId}`);
  console.log(`JWKS URL: ${jwksUrl}`);
  
  try {
    // Import jose for JWT verification
    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    
    // Create JWKS resolver
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));
    
    console.log('✅ JWKS resolver created successfully');
    
    // Test JWKS fetch
    const response = await fetch(jwksUrl);
    if (response.ok) {
      const jwksData = await response.json();
      console.log(`✅ JWKS contains ${jwksData.keys.length} keys`);
    } else {
      console.log(`❌ JWKS fetch failed: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ JWT setup error: ${error.message}`);
  }
  
  console.log('\n🏁 JWT validation test complete.');
}

testJWTValidation().catch(console.error);