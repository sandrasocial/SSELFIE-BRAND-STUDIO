import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Debug Stack Auth sign_up_enabled Error', async ({ page }) => {
  console.log('🔍 Testing Stack Auth sign_up_enabled error...');
  
  // Enable console and error logging
  page.on('console', msg => {
    console.log(`PAGE: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
    console.log(`❌ STACK: ${error.stack}`);
  });
  
  // Navigate to sign-in page
  console.log('📍 Going to sign-in page...');
  await page.goto('https://www.sselfie.ai/sign-in');
  
  // Wait for page load and errors
  await page.waitForTimeout(5000);
  
  // Check if the page rendered properly or has errors
  const pageContent = await page.textContent('body');
  const hasSignInForm = pageContent?.includes('Sign') || pageContent?.includes('Google');
  
  if (hasSignInForm) {
    console.log('✅ Sign-in page loaded successfully');
  } else {
    console.log('❌ Sign-in page failed to load properly');
    console.log('Page content preview:', pageContent?.substring(0, 300));
  }
  
  // Take screenshot
  await page.screenshot({ path: 'debug-sign-in-error.png', fullPage: true });
  
  // Try to get Stack Auth state
  const stackAuthState = await page.evaluate(() => {
    return {
      hasStackAuth: !!(window as any).stackAuth,
      projectId: (window as any).__STACK_PROJECT_ID__,
      publishableKey: (window as any).__STACK_PUBLISHABLE_CLIENT_KEY__?.substring(0, 20),
      signInAvailable: typeof (window as any).SignIn !== 'undefined'
    };
  });
  
  console.log('🔍 Stack Auth State:', stackAuthState);
  
  console.log('✅ Stack Auth debug test completed');
});