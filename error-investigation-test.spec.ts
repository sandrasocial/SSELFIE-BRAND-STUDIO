import { test, expect } from '@playwright/test';

test.describe('Stack Auth Error Investigation', () => {
  test('Find and analyze the error preventing OAuth', async ({ page }) => {
    console.log('🕵️ Investigating Stack Auth errors...');
    
    // Capture all console messages including errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 BROWSER ERROR:', msg.text());
      } else if (msg.text().includes('error') || msg.text().includes('Error') || msg.text().includes('ERROR')) {
        console.log('⚠️ ERROR LOG:', msg.text());
      }
    });
    
    // Capture network failures
    page.on('requestfailed', request => {
      console.log('🌐 NETWORK FAILURE:', request.url(), request.failure()?.errorText);
    });
    
    // Navigate to sign-in page
    await page.goto('https://www.sselfie.ai');
    await page.waitForLoadState('networkidle');
    
    const signInButton = page.locator('button:has-text("Login")').first();
    await signInButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📍 On sign-in page:', page.url());
    
    // Find and analyze the error element
    const errorElements = await page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-600, :has-text("ERROR")').all();
    
    console.log(`🔍 Found ${errorElements.length} error elements`);
    
    for (let i = 0; i < errorElements.length; i++) {
      const error = errorElements[i];
      try {
        const errorText = await error.textContent();
        const errorClass = await error.getAttribute('class');
        const errorId = await error.getAttribute('id');
        
        console.log(`❌ Error ${i + 1}:`);
        console.log(`  Text: "${errorText}"`);
        console.log(`  Class: "${errorClass}"`);
        console.log(`  ID: "${errorId}"`);
        
        // Check if error is visible and get its location
        const isVisible = await error.isVisible();
        if (isVisible) {
          const box = await error.boundingBox();
          console.log(`  Visible: ${isVisible}, Position:`, box);
        }
      } catch (e) {
        console.log(`❌ Could not analyze error ${i + 1}:`, e instanceof Error ? e.message : String(e));
      }
    }
    
    // Look for Stack Auth specific error patterns
    const pageContent = await page.textContent('body');
    const errorPatterns = [
      'Invalid configuration',
      'Project not found',
      'Invalid client key',
      'CORS',
      'Unauthorized',
      'Failed to load',
      'Network error',
      'OAuth error'
    ];
    
    console.log('🔍 Checking for common error patterns:');
    for (const pattern of errorPatterns) {
      if (pageContent?.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`⚠️ Found pattern: "${pattern}"`);
      }
    }
    
    // Take a screenshot before clicking OAuth
    await page.screenshot({ path: 'before-oauth-click.png', fullPage: true });
    
    // Try to click the Google OAuth button and monitor what happens
    console.log('🔍 Attempting to click Google OAuth button...');
    
    const googleButton = page.locator('button:has-text("Sign in with Google")').first();
    
    if (await googleButton.isVisible()) {
      // Set up listeners before clicking
      let navigationHappened = false;
      let requestsMade: string[] = [];
      
      page.on('request', request => {
        if (request.url().includes('google') || request.url().includes('oauth') || request.url().includes('auth')) {
          requestsMade.push(request.url());
          console.log('🌐 Auth-related request:', request.url());
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('google') || response.url().includes('oauth') || response.url().includes('auth')) {
          console.log('🌐 Auth-related response:', response.status(), response.url());
        }
      });
      
      const navigationPromise = page.waitForURL(/.*/, { timeout: 5000 }).then(() => {
        navigationHappened = true;
      }).catch(() => {
        console.log('⏰ Navigation timeout - no redirect occurred');
      });
      
      // Click the OAuth button
      await googleButton.click();
      
      // Wait a bit to see if anything happens
      await Promise.race([navigationPromise, page.waitForTimeout(5000)]);
      
      console.log('📊 After OAuth click:');
      console.log(`  Navigation happened: ${navigationHappened}`);
      console.log(`  Current URL: ${page.url()}`);
      console.log(`  Auth requests made: ${requestsMade.length}`);
      
      if (requestsMade.length > 0) {
        console.log('📋 Auth requests:');
        requestsMade.forEach((url, i) => {
          console.log(`  ${i + 1}. ${url}`);
        });
      }
      
      // Take screenshot after click
      await page.screenshot({ path: 'after-oauth-click.png', fullPage: true });
      
      // Check if any new errors appeared
      await page.waitForTimeout(2000);
      const newErrors = await page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-600').all();
      
      if (newErrors.length > errorElements.length) {
        console.log(`🆕 New errors appeared: ${newErrors.length - errorElements.length}`);
        for (let i = errorElements.length; i < newErrors.length; i++) {
          try {
            const errorText = await newErrors[i].textContent();
            console.log(`🆕 New error: "${errorText}"`);
          } catch (e) {
            // Skip
          }
        }
      }
    } else {
      console.log('❌ Google OAuth button not found or not visible');
    }
    
    // Final check for any elements that might contain error information
    console.log('🔍 Final error analysis...');
    
    // Check all text content for error keywords
    const allText = await page.textContent('body');
    const errorKeywords = ['error', 'failed', 'invalid', 'unauthorized', 'forbidden', 'not found'];
    
    for (const keyword of errorKeywords) {
      const regex = new RegExp(`[^.]*${keyword}[^.]*`, 'gi');
      const matches = allText?.match(regex);
      if (matches && matches.length > 0) {
        console.log(`🔍 Found "${keyword}" contexts:`);
        matches.slice(0, 3).forEach((match, i) => { // Limit to 3 matches
          console.log(`  ${i + 1}. "${match.trim()}"`);
        });
      }
    }
  });
});