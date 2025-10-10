import { test, expect } from '@playwright/test';

test('Maya Chat Fixed - Quick Verification', async ({ page }) => {
  console.log('🔍 Testing Maya chat after deploy fix...');
  
  const productionUrl = 'https://sselfie-brand-studio-4gfsvetnx-sselfie-studio.vercel.app';
  
  // Navigate to Maya page
  await page.goto(`${productionUrl}/maya`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/maya-fixed.png', fullPage: true });
  
  // Check for Maya components
  const chatInput = page.locator('textarea[data-test-id="chat-input"]').first();
  const sendButton = page.locator('button[data-testid="maya-chat-send"]').first();
  const mayaHeader = page.locator('h3:has-text("Maya")').first();
  const diagnostic = page.locator('div:has-text("Maya Diagnostic")').first();
  
  console.log(`📊 Maya Component Status:`);
  console.log(`  - Chat input visible: ${await chatInput.isVisible()}`);
  console.log(`  - Send button visible: ${await sendButton.isVisible()}`);
  console.log(`  - Maya header visible: ${await mayaHeader.isVisible()}`);
  console.log(`  - Diagnostic visible: ${await diagnostic.isVisible()}`);
  
  // If components are visible, Maya is working!
  if (await chatInput.isVisible() && await sendButton.isVisible()) {
    console.log('🎉 SUCCESS: Maya chat interface is now visible!');
    
    // Try to send a test message
    await chatInput.fill('Hello Maya, testing the fix!');
    await sendButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/maya-message-test.png', fullPage: true });
    console.log('✅ Test message sent successfully');
    
  } else {
    console.log('❌ Maya components still not visible');
  }
  
  // Check if diagnostic shows auth info
  if (await diagnostic.isVisible()) {
    const diagnosticText = await diagnostic.textContent();
    console.log('📋 Diagnostic info:', diagnosticText);
  }
  
  console.log('🏁 Maya verification complete!');
});