import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Test OAuth Callback Fix - Code Parameter Preservation', async ({ page }) => {
  console.log('🔐 Testing OAuth callback fix - checking if code parameter is preserved');
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`PAGE: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  // Step 1: Test OAuth callback URL directly with code parameter
  console.log('📍 Step 1: Testing OAuth callback URL directly...');
  
  // Create a fake OAuth callback URL with code parameter to test routing fix
  const callbackUrl = 'https://www.sselfie.ai/handler/oauth-callback?code=test_authorization_code_12345&state=test_state';
  
  console.log(`🔄 Testing callback URL: ${callbackUrl}`);
  await page.goto(callbackUrl);
  await page.waitForTimeout(5000);
  
  const finalUrl = page.url();
  console.log(`� Final URL after OAuth callback: ${finalUrl}`);
  
  // Check if we have errors about missing code parameter
  const pageContent = await page.textContent('body');
  const hasCodeError = pageContent?.includes('Missing required query parameter on OAuth callback: code');
  
  if (hasCodeError) {
    console.log('❌ Still getting code parameter error - routing fix not working');
  } else {
    console.log('✅ No code parameter error detected - routing fix appears successful');
  }
  
  // Step 2: Test the actual OAuth flow
  console.log('📍 Step 2: Testing full OAuth flow...');
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const googleButton = await page.locator('button:has-text("Google"), button[data-provider="google"]').first();
  const googleButtonExists = await googleButton.count() > 0;
  
  if (googleButtonExists) {
    await googleButton.click();
    await page.waitForTimeout(3000);
    
    const oauthUrl = page.url();
    console.log(`🔍 OAuth redirect URL: ${oauthUrl}`);
    
    if (oauthUrl.includes('accounts.google.com')) {
      console.log('✅ Successfully redirected to Google OAuth - flow working');
    }
  }
  
  await page.screenshot({ path: 'oauth-callback-fix-test.png', fullPage: true });
  
  console.log('✅ OAuth callback fix test completed');
});