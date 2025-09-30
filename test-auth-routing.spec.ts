import { test, expect } from '@playwright/test';

test('Test Stack Auth components are accessible via client-side routing', async ({ page }) => {
  // Navigate to the root page first
  await page.goto('https://sselfie-brand-studio-rjyoipipb-sselfie-studio.vercel.app/');
  
  // Wait for React to load
  await page.waitForTimeout(3000);
  
  console.log('✅ Root page loaded');
  
  // Try to navigate to sign-in via JavaScript (client-side routing)
  await page.evaluate(() => {
    window.history.pushState({}, '', '/sign-in');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  
  // Wait a bit for the route change
  await page.waitForTimeout(2000);
  
  // Check if we're on the sign-in page by looking for specific content
  const pageContent = await page.textContent('body');
  console.log('Current URL:', page.url());
  console.log('Page contains "Sign in to your account":', pageContent?.includes('Sign in to your account'));
  console.log('Page contains "SSELFIE STUDIO":', pageContent?.includes('SSELFIE STUDIO'));
  
  // Take a screenshot to see what's rendered
  await page.screenshot({ path: 'sign-in-test.png', fullPage: true });
  
  // Try direct navigation to sign-up
  await page.goto('https://sselfie-brand-studio-rjyoipipb-sselfie-studio.vercel.app/sign-up');
  
  await page.waitForTimeout(3000);
  
  const signUpContent = await page.textContent('body');
  console.log('Sign-up URL:', page.url());
  console.log('Sign-up page contains "JOIN SSELFIE STUDIO":', signUpContent?.includes('JOIN SSELFIE STUDIO'));
  console.log('Sign-up page contains "Create your account":', signUpContent?.includes('Create your account'));
  
  await page.screenshot({ path: 'sign-up-test.png', fullPage: true });
});