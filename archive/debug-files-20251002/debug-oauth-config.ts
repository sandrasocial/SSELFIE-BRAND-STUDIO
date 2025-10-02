/**
 * Debug Stack Auth URL configuration and OAuth flow
 */

console.log('🔍 Analyzing Stack Auth OAuth Configuration\n');

// Check current production URL
const prodUrl = 'https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app';
console.log('🌐 Production URL:', prodUrl);

// Check OAuth redirect URLs in configuration
const config = {
  afterSignIn: '/auth-success',
  afterSignUp: '/auth-success', 
  afterSignOut: '/',
};

console.log('🔄 OAuth redirect config:', config);

// Test if OAuth redirects are working
async function testOAuthRedirects() {
  const baseUrl = prodUrl;
  
  // Test auth-success page directly
  try {
    console.log('\n📍 Testing /auth-success page...');
    const response = await fetch(`${baseUrl}/auth-success`);
    console.log('Status:', response.status);
    
    const html = await response.text();
    const hasAuthSuccess = html.includes('Auth success') || html.includes('auth-success');
    const hasReactApp = html.includes('react') || html.includes('__STACK_PROJECT_ID__');
    
    console.log('✅ Contains auth-success logic:', hasAuthSuccess);
    console.log('✅ Contains React app:', hasReactApp);
    
    // Check if Stack Auth config is embedded
    const hasStackConfig = html.includes('253d7343-a0d4-43a1-be5c-822f590d40be');
    console.log('✅ Contains Stack Auth project ID:', hasStackConfig);
    
  } catch (error) {
    console.error('❌ auth-success test failed:', error);
  }
}

// Check Stack Auth project configuration
async function checkStackAuthProject() {
  const projectId = '253d7343-a0d4-43a1-be5c-822f590d40be';
  console.log('\n🔑 Stack Auth Project ID:', projectId);
  
  // The redirect URLs that should be configured in Stack Auth dashboard:
  const requiredRedirectUrls = [
    `${prodUrl}/auth-success`,
    'https://www.sselfie.ai/auth-success',
    // Also check for localhost for development
    'http://localhost:5173/auth-success',
    'http://localhost:8080/auth-success'
  ];
  
  console.log('\n📋 Required redirect URLs in Stack Auth project:');
  requiredRedirectUrls.forEach(url => {
    console.log('  -', url);
  });
  
  console.log('\n⚠️ CRITICAL: If these URLs are not configured in Stack Auth dashboard,');
  console.log('   OAuth will fail with "redirect url not trusted" errors.');
}

// Check for common OAuth issues
function checkCommonIssues() {
  console.log('\n🚨 Common OAuth Issues to Check:');
  console.log('1. Stack Auth project redirect URLs must include BOTH:');
  console.log('   - https://sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app/auth-success');
  console.log('   - https://www.sselfie.ai/auth-success');
  console.log('');
  console.log('2. Check if domain is configured in Stack Auth:');
  console.log('   - Production domain: www.sselfie.ai');
  console.log('   - Vercel preview domain: sselfie-brand-studio-lpgmvq177-sselfie-studio.vercel.app');
  console.log('');
  console.log('3. Cookie domain issues:');
  console.log('   - Stack Auth cookies might be set for wrong domain');
  console.log('   - Cross-domain cookie issues between vercel.app and sselfie.ai');
  console.log('');
  console.log('4. OAuth flow timing:');
  console.log('   - auth-success.tsx waits only 1 second before redirect');
  console.log('   - Stack Auth cookies might take longer to propagate');
}

// Run diagnostics
async function runDiagnostics() {
  await testOAuthRedirects();
  await checkStackAuthProject();
  checkCommonIssues();
  
  console.log('\n💡 RECOMMENDED ACTIONS:');
  console.log('1. Check Stack Auth dashboard for configured redirect URLs');
  console.log('2. Verify domain configuration in Stack Auth project');
  console.log('3. Test OAuth flow on BOTH domains (vercel.app AND sselfie.ai)');
  console.log('4. Increase auth-success.tsx timeout from 1s to 3s');
  console.log('5. Add more debug logging to auth-success page');
}

runDiagnostics().catch(console.error);