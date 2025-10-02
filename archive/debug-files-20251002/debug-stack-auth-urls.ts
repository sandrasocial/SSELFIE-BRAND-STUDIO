#!/usr/bin/env tsx

/**
 * Stack Auth URL Configuration Diagnostic
 * 
 * This script shows the exact URLs that need to be configured in the Stack Auth dashboard
 * to fix the OAuth flow routing issue.
 */

console.log('🔍 Stack Auth URL Configuration Diagnostic');
console.log('==========================================\n');

// Current problematic URL from the user's report
const problematicUrl = 'https://www.sselfie.ai/api/v1/auth/oauth/authorize/google?client_id=253d7343-a0d4-43a1-be5c-822f590d40be&client_secret=pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg';

console.log('❌ CURRENT PROBLEM:');
console.log(`   Stack Auth is generating OAuth URLs pointing to: https://www.sselfie.ai`);
console.log(`   But you're testing on Vercel deployment: https://sselfie-brand-studio-ejoa7qdnf-sselfie-studio.vercel.app`);
console.log();

console.log('🔧 SOLUTION:');
console.log('   Update Stack Auth dashboard to include these REDIRECT URLs:');
console.log();

// URLs that need to be added to Stack Auth dashboard
const domains = [
  'https://www.sselfie.ai',
  'https://sselfie.ai', 
  'https://sselfie-brand-studio-ejoa7qdnf-sselfie-studio.vercel.app',
  'http://localhost:3000', // for local development
];

const endpoints = [
  '/handler/oauth-callback',
  '/auth-success',
  '/api/me',
  '/handler/sign-in',
  '/handler/sign-up'
];

console.log('📋 REQUIRED REDIRECT URLs FOR STACK AUTH DASHBOARD:');
console.log('==================================================');

domains.forEach(domain => {
  endpoints.forEach(endpoint => {
    console.log(`   ✅ ${domain}${endpoint}`);
  });
  console.log(); // spacing between domains
});

console.log('🎯 CRITICAL OAUTH CALLBACK URLS (Priority):');
console.log('===========================================');
domains.forEach(domain => {
  console.log(`   🔥 ${domain}/handler/oauth-callback`);
});

console.log();
console.log('📍 STEPS TO FIX:');
console.log('================');
console.log('1. Go to Stack Auth dashboard');
console.log('2. Navigate to your project: 253d7343-a0d4-43a1-be5c-822f590d40be');
console.log('3. Add ALL the URLs listed above to "Allowed Redirect URLs"');
console.log('4. Save configuration');
console.log('5. Test OAuth flow again');

console.log();
console.log('💡 WHY THIS FIXES IT:');
console.log('=====================');
console.log('Stack Auth generates OAuth URLs based on the redirect URLs configured in the dashboard.');
console.log('Currently it only knows about www.sselfie.ai, so it routes everything there.');
console.log('Adding your Vercel deployment URL will allow Stack Auth to route correctly.');

console.log();
console.log('🔬 TECHNICAL DETAILS:');
console.log('=====================');
console.log('• Project ID: 253d7343-a0d4-43a1-be5c-822f590d40be');
console.log('• Publishable Key: pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg...');
console.log('• Current OAuth URL points to www.sselfie.ai (dashboard config)');
console.log('• Need to add Vercel URL to dashboard to fix routing');