#!/usr/bin/env node
/**
 * SSELFIE Studio - Authentication Diagnostic Tool
 * 
 * This script checks your Stack Auth configuration and identifies common issues.
 * Run this to diagnose authentication problems after the cleanup.
 */

console.log('🔍 SSELFIE Studio - Authentication Diagnostic Tool\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
const requiredEnvVars = {
  'STACK_AUTH_PROJECT_ID': process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID,
  'VITE_STACK_PUBLISHABLE_CLIENT_KEY': process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  'STACK_SECRET_SERVER_KEY': process.env.STACK_SECRET_SERVER_KEY
};

let envIssues = 0;
for (const [key, value] of Object.entries(requiredEnvVars)) {
  const isSet = !!value;
  const display = isSet ? (value.substring(0, 15) + '...') : 'NOT SET';
  console.log(`   ${isSet ? '✅' : '❌'} ${key}: ${display}`);
  if (!isSet) envIssues++;
}

if (envIssues > 0) {
  console.log(`\n⚠️  ${envIssues} environment variable(s) missing. Check your .env file.`);
} else {
  console.log('\n✅ All required environment variables are set.');
}

// Check Stack Auth configuration consistency
console.log('\n🔧 Stack Auth Configuration Check:');

const projectId = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const publishableKey = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg';

console.log(`   Project ID: ${projectId}`);
console.log(`   Publishable Key: ${publishableKey.substring(0, 20)}...`);
console.log(`   Key Format Valid: ${publishableKey.startsWith('pck_') ? '✅' : '❌'}`);

// Test Stack Auth API accessibility
console.log('\n🌐 Network Connectivity Check:');

async function testStackAuthAPI() {
  try {
    const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`;
    console.log('   Testing JWKS endpoint...');
    
    const response = await fetch(jwksUrl);
    const isSuccess = response.ok;
    
    console.log(`   ${isSuccess ? '✅' : '❌'} JWKS Endpoint (${response.status}): ${jwksUrl}`);
    
    if (isSuccess) {
      const jwks = await response.json();
      console.log(`   ✅ JWKS Keys Available: ${jwks.keys?.length || 0}`);
    } else {
      console.log(`   ❌ JWKS Error: ${response.statusText}`);
      if (response.status === 404) {
        console.log('      → This usually means the Stack Auth project ID is incorrect');
      }
    }
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    console.log('      → Check your internet connection and firewall settings');
  }
}

// Common issues and solutions
console.log('\n🚨 Common Authentication Issues & Solutions:');
console.log('   1. OAuth Redirect URL Mismatch:');
console.log('      → Check Stack Auth dashboard has these URLs:');
console.log('      → https://your-domain.com/handler/oauth-callback');
console.log('      → https://your-domain.com/auth-success');
console.log('');
console.log('   2. Environment Variables Missing:');
console.log('      → Copy .env.example to .env and fill in values');
console.log('      → Get keys from Stack Auth dashboard');
console.log('');
console.log('   3. Client/Server Config Mismatch:');
console.log('      → Ensure both client and server use same project ID');
console.log('      → Check stack/client.ts and stack/server.ts match');
console.log('');
console.log('   4. OAuth Provider Not Enabled:');
console.log('      → Go to Stack Auth dashboard → Settings → OAuth Providers');
console.log('      → Enable Google OAuth if not already enabled');

// Run the test
testStackAuthAPI().then(() => {
  console.log('\n🎯 Diagnostic complete. If issues persist, check the solutions above.');
}).catch((error) => {
  console.log(`\n❌ Diagnostic failed: ${error.message}`);
});