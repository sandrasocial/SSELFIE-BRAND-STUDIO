import { test, expect } from '@playwright/test';

test('Debug Stack Auth Sign-In Flow', async ({ page }) => {
  console.log('🔍 DEBUGGING STACK AUTH SIGN-IN FLOW\n');

  // Capture all console messages to see Stack Auth behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const logEntry = `${msg.type()}: ${msg.text()}`;
    consoleLogs.push(logEntry);
    if (msg.text().includes('Stack') || msg.text().includes('sign') || msg.text().includes('auth')) {
      console.log('💬 Auth Log:', logEntry);
    }
  });

  // Step 1: Go to sign-in page
  console.log('📍 Step 1: Loading Stack Auth sign-in page...');
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForTimeout(3000);

  // Take screenshot of the sign-in page
  await page.screenshot({ path: 'debug-signin-page.png', fullPage: true });

  // Step 2: Check what's actually rendered
  const pageContent = await page.evaluate(() => {
    return {
      title: document.title,
      hasEmailInput: !!document.querySelector('input[type="email"], input[name="email"]'),
      hasPasswordInput: !!document.querySelector('input[type="password"], input[name="password"]'),
      hasSignInButton: !!document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).some(btn => btn.textContent?.includes('Sign in')),
      hasGoogleButton: Array.from(document.querySelectorAll('button')).some(btn => btn.textContent?.includes('Google')),
      hasAlreadySignedInMessage: document.body.textContent?.includes('already signed in') || document.body.textContent?.includes('Already signed in'),
      buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text),
      formElements: Array.from(document.querySelectorAll('form, input, button')).length,
      bodyText: document.body.textContent?.substring(0, 500)
    };
  });

  console.log('\n📊 PAGE ANALYSIS:');
  console.log('   Title:', pageContent.title);
  console.log('   Has email input:', pageContent.hasEmailInput);
  console.log('   Has password input:', pageContent.hasPasswordInput);
  console.log('   Has sign-in button:', pageContent.hasSignInButton);
  console.log('   Has Google button:', pageContent.hasGoogleButton);
  console.log('   Has "already signed in" message:', pageContent.hasAlreadySignedInMessage);
  console.log('   Button texts:', pageContent.buttonTexts);
  console.log('   Total form elements:', pageContent.formElements);
  console.log('   Body preview:', pageContent.bodyText?.substring(0, 200) + '...');

  // Step 3: If there are email/password inputs, test the sign-in flow
  if (pageContent.hasEmailInput && pageContent.hasPasswordInput) {
    console.log('\n📍 Step 2: Testing email/password sign-in...');
    
    // Try to fill in test credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const signInButton = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@sselfie.ai');
      console.log('✅ Filled email input');
    }

    if (await passwordInput.isVisible()) {
      await passwordInput.fill('testpassword123');
      console.log('✅ Filled password input');
    }

    if (await signInButton.isVisible()) {
      console.log('🖱️ Clicking sign-in button...');
      await signInButton.click();
      await page.waitForTimeout(5000);
      
      // Check what happens after clicking sign-in
      const afterSignIn = await page.evaluate(() => {
        return {
          url: window.location.href,
          hasAlreadySignedInMessage: document.body.textContent?.includes('already signed in') || document.body.textContent?.includes('Already signed in'),
          hasHomeButton: Array.from(document.querySelectorAll('button')).some(btn => btn.textContent?.toLowerCase().includes('home')),
          buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text),
          bodyText: document.body.textContent?.substring(0, 500)
        };
      });

      console.log('\n📊 AFTER SIGN-IN ATTEMPT:');
      console.log('   URL:', afterSignIn.url);
      console.log('   Has "already signed in" message:', afterSignIn.hasAlreadySignedInMessage);
      console.log('   Has Home button:', afterSignIn.hasHomeButton);
      console.log('   Button texts:', afterSignIn.buttonTexts);
      console.log('   Body preview:', afterSignIn.bodyText?.substring(0, 200) + '...');

      await page.screenshot({ path: 'debug-after-signin.png', fullPage: true });

      // If there's a "Home" button, test if it's clickable
      if (afterSignIn.hasHomeButton) {
        console.log('\n📍 Step 3: Testing Home button functionality...');
        const homeButton = page.locator('button').filter({ hasText: /home/i }).first();
        
        try {
          await homeButton.click({ timeout: 5000 });
          console.log('✅ Home button clicked successfully');
          await page.waitForTimeout(2000);
          
          const afterHomeClick = await page.evaluate(() => window.location.href);
          console.log('🔄 URL after Home click:', afterHomeClick);
        } catch (error) {
          console.log('❌ Home button not clickable:', error);
        }
      }
    }
  }

  // Step 4: Check Stack Auth configuration
  console.log('\n📍 Step 4: Checking Stack Auth configuration...');
  const stackAuthConfig = await page.evaluate(() => {
    return {
      hasStackApp: typeof (window as any).stackAuth !== 'undefined',
      cookies: document.cookie.split(';').filter(c => c.includes('stack')),
      localStorage: Object.keys(localStorage).filter(key => key.includes('stack')),
      sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('stack')),
    };
  });

  console.log('📊 STACK AUTH STATE:');
  console.log('   Has Stack Auth in window:', stackAuthConfig.hasStackApp);
  console.log('   Stack cookies:', stackAuthConfig.cookies);
  console.log('   Stack localStorage:', stackAuthConfig.localStorage);
  console.log('   Stack sessionStorage:', stackAuthConfig.sessionStorage);

  console.log('\n🎯 SIGN-IN FLOW DEBUG COMPLETE');
  console.log('📊 Total console messages:', consoleLogs.length);
});
