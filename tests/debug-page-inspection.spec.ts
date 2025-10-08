import { test, expect } from '@playwright/test';

test('Debug: Inspect landing page elements', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  console.log('Current URL:', page.url());
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons:`);
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const isVisible = await buttons[i].isVisible();
    console.log(`  Button ${i + 1}: "${text}" (visible: ${isVisible})`);
  }
  
  // Find all links
  const links = await page.locator('a').all();
  console.log(`Found ${links.length} links:`);
  for (let i = 0; i < links.length; i++) {
    const text = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    const isVisible = await links[i].isVisible();
    console.log(`  Link ${i + 1}: "${text}" -> ${href} (visible: ${isVisible})`);
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-landing-page.png', fullPage: true });
  
  // Look for text containing signup-related words
  const signupTexts = await page.locator('text=/sign.?up|get.?started|subscribe|join|register/i').all();
  console.log(`Found ${signupTexts.length} signup-related texts:`);
  for (let i = 0; i < signupTexts.length; i++) {
    const text = await signupTexts[i].textContent();
    const isVisible = await signupTexts[i].isVisible();
    console.log(`  Signup text ${i + 1}: "${text}" (visible: ${isVisible})`);
  }
});