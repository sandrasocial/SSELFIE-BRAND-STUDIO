// tests/global.setup.ts
import { chromium } from '@playwright/test';
import { authenticateWithStackAuth, TEST_USERS } from './helpers/auth-helper';

const authFile = 'storageState.json';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🚀 Starting global setup authentication...');

    // Navigate to the sign-in page
    const signInUrl = 'https://sselfie-brand-studio-j9n47538o-sselfie-studio.vercel.app/handler/sign-in';
    console.log(`📍 Navigating to: ${signInUrl}`);
    await page.goto(signInUrl);

    // Use the test user from our auth helper
    const testUser = TEST_USERS.maya_tester;
    console.log(`👤 Using test user: ${testUser.email}`);

    // Fill in the email for Stack Auth (passwordless flow)
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('📧 Found email input, filling...');
    await emailInput.fill(testUser.email);

    // Click the sign-in button (Stack Auth handles the rest)
    const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Continue"), button[type="submit"]').first();
    await signInButton.waitFor({ state: 'visible', timeout: 2000 });
    console.log('🔘 Found sign-in button, clicking...');
    await signInButton.click();

    // Wait a bit for any redirects or changes
    await page.waitForTimeout(3000);

    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL after sign-in: ${currentUrl}`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/global-setup-auth.png', fullPage: true });

    // Check if we're already on an app page or if authentication succeeded differently
    if (currentUrl.includes('/app') || currentUrl.includes('/maya') || currentUrl.includes('/studio')) {
      console.log('✅ Already on authenticated page');
    } else {
      // Try to navigate to the app manually
      console.log('🔄 Navigating to /app manually...');
      await page.goto('https://sselfie-brand-studio-j9n47538o-sselfie-studio.vercel.app/app');
      await page.waitForTimeout(2000);
    }

    // Verify we're authenticated by checking for a protected element
    // Look for Maya interface or main app elements
    const mayaElement = page.locator('text=Maya').or(page.locator('[data-testid*="maya"]')).first();
    const appElement = page.locator('text=Studio').or(page.locator('text=Gallery')).first();

    try {
      await mayaElement.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Found Maya interface element');
    } catch {
      try {
        await appElement.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Found app interface element');
      } catch {
        console.log('⚠️ No expected interface elements found, but proceeding with auth state save');
        // Take another screenshot
        await page.screenshot({ path: 'tests/screenshots/global-setup-interface.png', fullPage: true });
      }
    }

    // Save the authentication state to the file
    console.log('💾 Saving authentication state...');
    await page.context().storageState({ path: authFile });
    console.log('✅ Authentication state saved successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    // Take a screenshot of the error state
    await page.screenshot({ path: 'tests/screenshots/global-setup-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;