import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Debug Stack Auth Configuration Error', async ({ page }) => {
  console.log('🔍 Testing Stack Auth configuration and sign_up_enabled error');
  
  // Enable detailed console logging
  page.on('console', msg => {
    console.log(`PAGE: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
    console.log(`❌ ERROR STACK: ${error.stack}`);
  });
  
  // Test sign-in page
  console.log('📍 Testing /sign-in page...');
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Give Stack Auth time to initialize
  
  // Check for the specific error
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  // Look for Stack Auth components
  const stackAuthPresent = await page.evaluate(() => {
    const result: any = {
      windowStackAuth: !!(window as any).stackAuth,
      stackButtons: document.querySelectorAll('[data-stack-auth], .stack-auth, button:contains("Google")').length,
      bodyText: document.body.innerText.includes('sign_up_enabled'),
      hasErrors: false,
      errorDetails: null
    };
    
    // Check console errors
    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args) => {
      errors.push(args.map(a => String(a)).join(' '));
      originalError(...args);
    };
    
    setTimeout(() => {
      result.hasErrors = errors.length > 0;
      result.errorDetails = errors;
    }, 1000);
    
    return result;
  });
  
  console.log('🔍 Stack Auth Status:', JSON.stringify(stackAuthPresent, null, 2));
  
  // Take screenshot
  await page.screenshot({ path: 'stack-auth-error-debug.png', fullPage: true });
  
  // Test direct handler route
  console.log('📍 Testing /handler/sign-in page...');
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'handler-sign-in-debug.png', fullPage: true });
  
  console.log('✅ Stack Auth debug test completed');
});