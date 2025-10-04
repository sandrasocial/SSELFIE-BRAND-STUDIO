// Test production authentication flow
import puppeteer from 'puppeteer';

async function testProductionAuth() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()));
    
    console.log('🌐 Testing production authentication on www.sselfie.ai');
    
    // Go to sign-in page
    console.log('📍 Navigating to sign-in page...');
    await page.goto('https://www.sselfie.ai/sign-in', { waitUntil: 'networkidle0' });
    
    // Wait a moment for page to fully load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'production-signin-page.png', fullPage: true });
    console.log('📸 Screenshot saved: production-signin-page.png');
    
    // Check if Google OAuth button exists
    const googleButton = await page.$('button[aria-label*="Google"], button:contains("Google"), .google-signin, [data-provider="google"]');
    if (googleButton) {
      console.log('✅ Google OAuth button found');
      
      // Click Google OAuth button
      console.log('🔄 Clicking Google OAuth button...');
      await googleButton.click();
      
      // Wait for OAuth redirect or error
      await page.waitForTimeout(5000);
      
      // Take screenshot after click
      await page.screenshot({ path: 'production-oauth-click.png', fullPage: true });
      console.log('📸 Screenshot after OAuth click saved: production-oauth-click.png');
      
    } else {
      console.log('❌ Google OAuth button not found');
      
      // Check what elements are available
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(btn => ({ text: btn.textContent, classes: btn.className }))
      );
      console.log('Available buttons:', buttons);
    }
    
    console.log('Current URL:', page.url());
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testProductionAuth();