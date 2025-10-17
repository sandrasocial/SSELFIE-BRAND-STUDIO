import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  try {
    console.log('🔍 Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('✅ Page loaded');
    
    // Wait a bit for any JS to execute
    await page.waitForTimeout(3000);
    
    // Get page content
    const content = await page.content();
    console.log('📄 Page title:', await page.title());
    console.log('📄 Page URL:', page.url());
    
    // Check for errors in console
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('📸 Screenshot saved to debug-screenshot.png');
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log(`\n🔘 Found ${buttons.count} buttons`);
    
    // Try to find any error messages
    const errorElements = await page.locator('[class*="error"], [class*="Error"]').all();
    console.log(`\n⚠️ Found ${errorElements.length} error elements`);
    
    // Check network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        status: 'pending'
      });
    });
    
    page.on('response', response => {
      console.log(`📡 ${response.status()} ${response.url()}`);
    });
    
    // Wait for any pending requests
    await page.waitForTimeout(2000);
    
    // Try clicking buttons
    const buttonCount = await page.locator('button').count();
    console.log(`\n🖱️ Attempting to click ${buttonCount} buttons...`);
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      try {
        const button = page.locator('button').nth(i);
        const text = await button.textContent();
        console.log(`  Button ${i}: "${text}"`);
        
        // Don't actually click, just inspect
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        console.log(`    Visible: ${isVisible}, Enabled: ${isEnabled}`);
      } catch (e) {
        console.log(`  Button ${i}: Error - ${e.message}`);
      }
    }
    
    // Check for React errors
    const reactErrors = await page.evaluate(() => {
      return {
        hasReact: typeof window.React !== 'undefined',
        hasReactDOM: typeof window.ReactDOM !== 'undefined',
        hasStackAuth: typeof window.__STACK_PROJECT_ID__ !== 'undefined',
      };
    });
    console.log('\n⚛️ React/Stack Auth status:', reactErrors);
    
    // Get console errors
    console.log('\n📋 Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('Console errors:', consoleErrors.length > 0 ? consoleErrors : 'None');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

