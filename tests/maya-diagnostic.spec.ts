import { test, expect } from '@playwright/test';

test('Maya Diagnostic Check', async ({ page }) => {
  console.log('🔍 Running Maya diagnostic...');
  
  const productionUrl = 'https://sselfie-brand-studio-33vkrzoge-sselfie-studio.vercel.app';
  
  // Navigate to Maya page
  await page.goto(`${productionUrl}/maya`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Take screenshot to see diagnostic
  await page.screenshot({ path: 'tests/screenshots/maya-diagnostic.png', fullPage: true });
  
  // Check if diagnostic box is visible
  const diagnostic = page.locator('div:has-text("Maya Diagnostic")').first();
  if (await diagnostic.isVisible()) {
    console.log('✅ Diagnostic box found');
    const diagnosticText = await diagnostic.textContent();
    console.log('📊 Diagnostic info:', diagnosticText);
  } else {
    console.log('❌ Diagnostic box not found');
  }
  
  // Check console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    if (msg.text().includes('Maya Diagnostic')) {
      consoleLogs.push(msg.text());
    }
  });
  
  await page.reload();
  await page.waitForTimeout(3000);
  
  console.log('📋 Maya diagnostic console logs:');
  consoleLogs.forEach(log => console.log(log));
  
  console.log('🏁 Diagnostic complete!');
});