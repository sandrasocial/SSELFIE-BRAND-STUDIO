import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('Production Authentication Flow Test', async ({ page }) => {
  console.log('🌐 Testing production authentication on www.sselfie.ai');
  
  // Navigate to production sign-in page
  console.log('📍 Navigating to production sign-in page...');
  await page.goto('https://www.sselfie.ai/sign-in');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of sign-in page
  await page.screenshot({ path: 'production-signin-test.png', fullPage: true });
  console.log('📸 Production sign-in page screenshot saved');
  
  // Check if the page loads without errors
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for authentication elements
  const signInButtons = await page.locator('button, a').filter({ hasText: /sign|google|oauth/i }).count();
  console.log(`Found ${signInButtons} sign-in related elements`);
  
  // Check if Stack Auth components are loaded
  const stackAuthElements = await page.locator('[data-stack-auth], .stack-auth, [class*="stack"]').count();
  console.log(`Found ${stackAuthElements} Stack Auth related elements`);
  
  // Test handler routes
  console.log('🔄 Testing handler/sign-in endpoint...');
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'production-handler-signin.png', fullPage: true });
  console.log('📸 Handler sign-in screenshot saved');
  
  console.log('Final URL after handler redirect:', page.url());
  
  // Check if there are any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
});