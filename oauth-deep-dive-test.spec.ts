import { test, expect } from '@playwright/test';

test.describe('Stack Auth OAuth Flow Deep Dive', () => {
  test('Analyze the SignIn component and OAuth options', async ({ page }) => {
    console.log('🔍 Starting OAuth flow deep dive...');
    
    // Enable all console logging
    page.on('console', msg => {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Navigate to the app
    await page.goto('https://www.sselfie.ai');
    await page.waitForLoadState('networkidle');
    
    // Click sign-in to get to the handler
    const signInButton = page.locator('button:has-text("Login")').first();
    await signInButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📍 Current URL:', page.url());
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'signin-page-analysis.png', fullPage: true });
    
    // Analyze the page content
    const pageContent = await page.textContent('body');
    console.log('🔍 Page contains OAuth options:', 
      pageContent?.includes('Google') || 
      pageContent?.includes('GitHub') || 
      pageContent?.includes('Continue with')
    );
    
    // Look specifically for OAuth buttons
    const buttons = await page.locator('button, a, [role="button"]').all();
    console.log('🔍 Total interactive elements found:', buttons.length);
    
    let oauthButtons = [];
    for (const button of buttons) {
      try {
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (text && isVisible && (
          text.toLowerCase().includes('google') ||
          text.toLowerCase().includes('github') ||
          text.toLowerCase().includes('continue with') ||
          text.toLowerCase().includes('sign in with')
        )) {
          oauthButtons.push(text.trim());
        }
      } catch (e) {
        // Skip elements that can't be checked
      }
    }
    
    console.log('🎯 OAuth buttons found:', oauthButtons);
    
    // Check if there are any forms for email/password
    const forms = await page.locator('form').all();
    console.log('📝 Forms found:', forms.length);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      try {
        const formText = await form.textContent();
        console.log(`📝 Form ${i + 1} content preview:`, formText?.substring(0, 100) + '...');
        
        // Check for input fields
        const inputs = await form.locator('input').all();
        console.log(`📝 Form ${i + 1} inputs:`, inputs.length);
        
        for (const input of inputs) {
          const type = await input.getAttribute('type');
          const placeholder = await input.getAttribute('placeholder');
          const name = await input.getAttribute('name');
          console.log(`  - Input: type="${type}", placeholder="${placeholder}", name="${name}"`);
        }
      } catch (e) {
        console.log(`📝 Could not analyze form ${i + 1}`);
      }
    }
    
    // Check for any Stack Auth specific elements
    const stackElements = await page.locator('[data-stack], [class*="stack"], [id*="stack"]').all();
    console.log('🏗️ Stack Auth elements found:', stackElements.length);
    
    // Look for any error messages
    const errorElements = await page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-600').all();
    console.log('❌ Error elements found:', errorElements.length);
    
    if (errorElements.length > 0) {
      for (const error of errorElements) {
        try {
          const errorText = await error.textContent();
          if (errorText && errorText.trim()) {
            console.log('❌ Error message:', errorText.trim());
          }
        } catch (e) {
          // Skip
        }
      }
    }
    
    // Try to find and click a Google OAuth button if it exists
    const googleButton = page.locator('button:has-text("Google"), a:has-text("Google"), button:has-text("Continue with Google")').first();
    
    if (await googleButton.isVisible({ timeout: 2000 })) {
      console.log('✅ Found Google OAuth button, attempting to click...');
      
      // Set up navigation listener before clicking
      const navigationPromise = page.waitForURL(/.*/, { timeout: 10000 });
      
      await googleButton.click();
      
      try {
        await navigationPromise;
        console.log('🔄 Navigation detected, new URL:', page.url());
        
        // Check if we're on Google OAuth
        if (page.url().includes('accounts.google.com')) {
          console.log('✅ Successfully redirected to Google OAuth!');
          await page.screenshot({ path: 'google-oauth-page.png', fullPage: true });
        }
      } catch (e) {
        console.log('⚠️ No navigation occurred after clicking OAuth button');
      }
    } else {
      console.log('❌ No Google OAuth button found');
      
      // Check if there are any other clickable auth elements
      const authButtons = await page.locator('button, a').all();
      for (const button of authButtons) {
        try {
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          if (text && isVisible && text.length > 0) {
            console.log('🔍 Available button:', text.trim());
          }
        } catch (e) {
          // Skip
        }
      }
    }
  });
});