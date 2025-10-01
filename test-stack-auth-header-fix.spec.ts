import { test, expect } from '@playwright/test';

test('Verify Stack Auth API header fix', async ({ page }) => {
  console.log('🔐 Testing Stack Auth API header fix...');

  // Capture any JavaScript errors
  const jsErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = msg.text();
      jsErrors.push(error);
      if (error.includes('sign_up_enabled') || error.includes('_clientProjectFromCrud')) {
        console.log('❌ Stack Auth error still occurring:', error);
      }
    }
  });

  // Navigate to the sign-in page
  console.log('📍 Navigating to sign-in page...');
  await page.goto('https://www.sselfie.ai/sign-in');
  
  // Wait for the page to load and Stack Auth to initialize
  console.log('⏳ Waiting for Stack Auth initialization...');
  await page.waitForTimeout(5000);

  // Check if the page loads without the sign_up_enabled error
  const pageContent = await page.content();
  const hasStackAuthForm = pageContent.includes('Sign in') || pageContent.includes('Google') || pageContent.includes('stackframe');
  
  console.log('📊 Test Results:');
  console.log(`   Stack Auth form loaded: ${hasStackAuthForm}`);
  console.log(`   JavaScript errors: ${jsErrors.length}`);
  
  // Check for the specific error we're fixing
  const hasSignUpEnabledError = jsErrors.some(error => 
    error.includes('sign_up_enabled') || 
    error.includes('Cannot read properties of undefined') ||
    error.includes('_clientProjectFromCrud')
  );

  if (hasSignUpEnabledError) {
    console.log('❌ Stack Auth sign_up_enabled error still present');
    console.log('   Errors:', jsErrors.filter(e => e.includes('sign_up_enabled') || e.includes('_clientProjectFromCrud')));
  } else {
    console.log('✅ No sign_up_enabled errors detected - API header fix working!');
  }

  // Test Stack Auth API proxy with proper headers
  console.log('🔍 Testing Stack Auth API proxy...');
  const response = await page.request.get('/api/auth/current-user');
  console.log(`   API proxy status: ${response.status()}`);
  
  // A 401 is expected for unauthenticated user, but should not be a 500 server error
  if (response.status() === 500) {
    const errorText = await response.text();
    console.log('❌ API proxy error:', errorText);
  } else {
    console.log('✅ API proxy responding properly (401 expected for unauthenticated user)');
  }

  // Expect no sign_up_enabled errors
  expect(hasSignUpEnabledError).toBe(false);
  
  // Expect Stack Auth form to load
  expect(hasStackAuthForm).toBe(true);
});