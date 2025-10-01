import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Full Production OAuth Flow Test', async ({ page }) => {
  console.log('🔐 Testing complete OAuth flow on production');
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`PAGE: ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  // Start at sign-in page
  console.log('📍 Navigating to production sign-in page...');
  await page.goto('https://www.sselfie.ai/sign-in');
  await page.waitForLoadState('networkidle');
  
  // Check for Stack Auth sign-in button
  console.log('🔍 Looking for Google OAuth button...');
  
  // Try multiple selectors for Google OAuth button
  const googleSelectors = [
    'button[data-provider="google"]',
    'button:has-text("Google")',
    'button:has-text("Continue with Google")',
    'button:has-text("Sign in with Google")',
    '.google-signin',
    '[data-testid="google-signin"]',
    'button[aria-label*="Google"]'
  ];
  
  let googleButton = null;
  for (const selector of googleSelectors) {
    try {
      const element = await page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        googleButton = element;
        console.log(`✅ Found Google button with selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue trying other selectors
    }
  }
  
  if (!googleButton) {
    console.log('❓ Google button not found with standard selectors, checking all buttons...');
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`Button ${i}: "${buttonText}"`);
      if (buttonText && buttonText.toLowerCase().includes('google')) {
        googleButton = allButtons[i];
        console.log(`✅ Found Google button by text: "${buttonText}"`);
        break;
      }
    }
  }
  
  if (googleButton) {
    console.log('🔄 Attempting to click Google OAuth button...');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'production-before-oauth-click.png', fullPage: true });
    
    try {
      // Click the Google OAuth button
      await googleButton.click();
      
      // Wait for redirect or page change
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`📍 Current URL after OAuth click: ${currentUrl}`);
      
      // Take screenshot after click
      await page.screenshot({ path: 'production-after-oauth-click.png', fullPage: true });
      
      // Check if we're redirected to Google OAuth or Stack Auth
      if (currentUrl.includes('google') || currentUrl.includes('oauth') || currentUrl.includes('accounts.google')) {
        console.log('✅ Successfully redirected to Google OAuth');
      } else if (currentUrl.includes('stack-auth')) {
        console.log('✅ Redirected to Stack Auth OAuth handler');
      } else {
        console.log('⚠️  Unexpected redirect or no redirect occurred');
      }
      
      // Wait a bit more to see if there are additional redirects
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
    } catch (error: any) {
      console.log(`❌ Error clicking OAuth button: ${error?.message || error}`);
    }
  } else {
    console.log('❌ No Google OAuth button found');
    
    // Take screenshot of what we see
    await page.screenshot({ path: 'production-no-oauth-button.png', fullPage: true });
    
    // List all available elements for debugging
    const allText = await page.textContent('body');
    console.log('Page content preview:', allText?.substring(0, 500) || 'No text content');
  }
});