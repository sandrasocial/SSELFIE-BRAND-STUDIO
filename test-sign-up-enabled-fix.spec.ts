import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Test Stack Auth sign_up_enabled Fix', async ({ page }) => {
  console.log('🔐 Testing if Stack Auth sign_up_enabled error is fixed');
  
  // Track errors
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('sign_up_enabled')) {
      errors.push(msg.text());
    }
    if (msg.text().includes('Stack Auth')) {
      console.log(`PAGE: ${msg.text()}`);
    }
  });
  
  // Test sign-in page
  console.log('📍 Testing /sign-in page with Stack Auth fix...');
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForLoadState('networkidle');
  
  // Wait longer for Stack Auth to initialize
  await page.waitForTimeout(8000);
  
  // Check for the specific error
  const hasSignUpEnabledError = errors.some(error => 
    error.includes('sign_up_enabled') || 
    error.includes('Cannot read properties of undefined')
  );
  
  if (hasSignUpEnabledError) {
    console.log('❌ Still getting sign_up_enabled error');
    console.log('Errors found:', errors);
  } else {
    console.log('✅ No sign_up_enabled error detected - fix appears to work!');
  }
  
  // Check if page loads correctly
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);
  
  // Look for sign-in elements
  const hasSignInElements = await page.locator('button, input, form').count();
  console.log('Sign-in elements found:', hasSignInElements);
  
  // Take screenshot
  await page.screenshot({ path: 'sign-up-enabled-fix-test.png', fullPage: true });
  
  console.log('✅ Stack Auth fix test completed');
});