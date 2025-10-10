import { test, expect } from '@playwright/test';

test('Test Maya route fix', async ({ page }) => {
  const PRODUCTION_URL = 'https://sselfie-brand-studio-6c9pazd2j-sselfie-studio.vercel.app';
  
  console.log('🔍 Testing Maya route fix...');
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`🌐 BROWSER LOG [${msg.type()}]:`, msg.text());
  });
  
  // Navigate directly to Maya
  console.log('🌐 Navigating to /maya...');
  await page.goto(`${PRODUCTION_URL}/maya`, { waitUntil: 'networkidle' });
  
  // Take screenshot
  await page.screenshot({ path: 'maya-route-fix-test.png', fullPage: true });
  console.log('📸 Screenshot saved: maya-route-fix-test.png');
  
  // Check if we're on the Maya interface now
  const mayaHeader = await page.locator('h3:has-text("Maya")').isVisible({ timeout: 10000 }).catch(() => false);
  const chatInput = await page.locator('textarea[data-test-id="chat-input"], textarea[placeholder*="Maya"]').isVisible({ timeout: 5000 }).catch(() => false);
  
  console.log('✅ Maya header visible:', mayaHeader);
  console.log('✅ Chat input visible:', chatInput);
  
  if (mayaHeader && chatInput) {
    console.log('🎉 SUCCESS: Maya route fix working!');
  } else {
    console.log('❌ Maya route still not working properly');
    
    // Check what's actually on the page
    const pageContent = await page.locator('body').textContent();
    console.log('📄 Page content preview:', pageContent?.substring(0, 200));
  }
});