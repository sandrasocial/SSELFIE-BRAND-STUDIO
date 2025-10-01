import { test, expect } from '@playwright/test';

test('Stack Auth Authentication Flow Audit', async ({ page }) => {
  console.log('🔍 STACK AUTH AUDIT - Starting comprehensive flow analysis');
  
  // Capture all console messages and network requests
  const consoleMessages: string[] = [];
  const networkRequests: Array<{url: string, status: number, method: string}> = [];
  const errors: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('request', request => {
    if (request.url().includes('stack') || request.url().includes('auth') || request.url().includes('api')) {
      networkRequests.push({
        url: request.url(),
        status: 0,
        method: request.method()
      });
    }
  });

  page.on('response', response => {
    const req = networkRequests.find(r => r.url === response.url());
    if (req) {
      req.status = response.status();
    }
  });

  // Phase 1: Test homepage load
  console.log('📍 Phase 1: Testing homepage load and Stack Auth initialization');
  await page.goto('https://www.sselfie.ai');
  await page.waitForTimeout(3000);

  console.log('📊 Homepage Analysis:');
  console.log(`   Console messages: ${consoleMessages.length}`);
  console.log(`   Network requests: ${networkRequests.length}`);
  console.log(`   Errors: ${errors.length}`);

  // Check for Stack Auth initialization errors
  const stackAuthErrors = errors.filter(error => 
    error.includes('sign_up_enabled') || 
    error.includes('_clientProjectFromCrud') ||
    error.includes('Stack Auth')
  );

  if (stackAuthErrors.length > 0) {
    console.log('❌ Stack Auth errors on homepage:');
    stackAuthErrors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
  } else {
    console.log('✅ No Stack Auth errors on homepage');
  }

  // Phase 2: Test sign-in page load
  console.log('\n📍 Phase 2: Testing sign-in page load');
  const beforeSignIn = errors.length;
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForTimeout(5000); // Give more time for Stack Auth to initialize

  const newErrors = errors.slice(beforeSignIn);
  console.log('📊 Sign-in page analysis:');
  console.log(`   New errors: ${newErrors.length}`);
  console.log(`   Total console messages: ${consoleMessages.length}`);

  const signInStackAuthErrors = newErrors.filter(error => 
    error.includes('sign_up_enabled') || 
    error.includes('_clientProjectFromCrud') ||
    error.includes('Stack Auth')
  );

  if (signInStackAuthErrors.length > 0) {
    console.log('❌ Stack Auth errors on sign-in page:');
    signInStackAuthErrors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
  } else {
    console.log('✅ No Stack Auth errors on sign-in page');
  }

  // Phase 3: Check Stack Auth API requests
  console.log('\n📍 Phase 3: Analyzing Stack Auth API requests');
  const stackApiRequests = networkRequests.filter(req => 
    req.url.includes('api.stack-auth.com') || req.url.includes('stackframe')
  );

  console.log(`📊 Stack Auth API requests: ${stackApiRequests.length}`);
  stackApiRequests.forEach((req, i) => {
    console.log(`   ${i+1}. ${req.method} ${req.url} → ${req.status}`);
  });

  // Phase 4: Check authentication state
  console.log('\n📍 Phase 4: Checking authentication state');
  
  // Check cookies
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(cookie => 
    cookie.name.includes('stack') || cookie.name.includes('auth')
  );
  
  console.log(`📊 Authentication cookies: ${stackCookies.length}`);
  stackCookies.forEach(cookie => {
    console.log(`   ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
  });

  // Check page content
  const pageContent = await page.content();
  const hasStackAuthForm = pageContent.includes('Sign in') || pageContent.includes('Google');
  const hasErrorBoundary = pageContent.includes('error') || pageContent.includes('Error');

  console.log('📊 Page state:');
  console.log(`   Has Stack Auth form: ${hasStackAuthForm}`);
  console.log(`   Has error boundary: ${hasErrorBoundary}`);

  // Phase 5: Summary and recommendations
  console.log('\n📋 AUDIT SUMMARY');
  console.log('================');
  
  const totalStackAuthErrors = errors.filter(error => 
    error.includes('sign_up_enabled') || 
    error.includes('_clientProjectFromCrud') ||
    error.includes('Stack Auth')
  ).length;

  if (totalStackAuthErrors > 0) {
    console.log(`❌ ISSUE CONFIRMED: ${totalStackAuthErrors} Stack Auth errors detected`);
    console.log('🔍 Root cause appears to be client-side project configuration loading');
    console.log('📋 Next steps: Check Stack Auth dashboard configuration');
  } else {
    console.log('✅ No Stack Auth errors detected in this session');
    console.log('🤔 Issue may be intermittent or configuration-dependent');
  }

  console.log(`\n📊 Final metrics:`);
  console.log(`   Total console messages: ${consoleMessages.length}`);
  console.log(`   Total network requests: ${networkRequests.length}`);
  console.log(`   Stack Auth API calls: ${stackApiRequests.length}`);
  console.log(`   Authentication cookies: ${stackCookies.length}`);

  // Expect that we can load the sign-in page without critical errors
  expect(newErrors.filter(e => e.includes('sign_up_enabled')).length).toBeLessThan(1);
});