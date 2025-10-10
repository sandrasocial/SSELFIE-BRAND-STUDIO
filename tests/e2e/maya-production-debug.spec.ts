import { test, expect } from '@playwright/test';

test.describe('Maya Chat Production Debugging', () => {
  const PRODUCTION_URL = 'https://sselfie-brand-studio-h92wolspc-sselfie-studio.vercel.app';
  
  test('Debug Maya chat flow on production', async ({ page }) => {
    console.log('🔍 Starting Maya chat debugging on production...');
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`🌐 BROWSER LOG [${msg.type()}]:`, msg.text());
    });
    
    // Capture network requests
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
        console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`📨 RESPONSE: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to production site
    console.log('🌐 Navigating to production site...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    
    // Take screenshot of landing page
    await page.screenshot({ path: 'maya-debug-1-landing.png', fullPage: true });
    console.log('📸 Screenshot saved: maya-debug-1-landing.png');
    
    // Check if user is authenticated
    const authStatus = await page.evaluate(() => {
      return {
        hasAuthCookies: document.cookie.includes('stack'),
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
      };
    });
    console.log('🔑 Auth status:', authStatus);
    
    // Try to find Maya chat access
    console.log('🔍 Looking for Maya chat access...');
    
    // Check for app layout (newer structure)
    const appLayout = await page.locator('[href*="/app/maya"]').first();
    if (await appLayout.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Found Maya app link');
      await appLayout.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Check for direct Maya link
      const mayaLink = await page.locator('[href*="/maya"]').first();
      if (await mayaLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Found Maya direct link');
        await mayaLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Try navigation to Maya directly
        console.log('🔄 Trying direct navigation to Maya...');
        await page.goto(`${PRODUCTION_URL}/app/maya`, { waitUntil: 'networkidle' });
      }
    }
    
    // Take screenshot of Maya page
    await page.screenshot({ path: 'maya-debug-2-maya-page.png', fullPage: true });
    console.log('📸 Screenshot saved: maya-debug-2-maya-page.png');
    
    // Check for Maya chat interface
    const chatInput = page.locator('textarea[data-test-id="chat-input"], textarea[placeholder*="Maya"], input[placeholder*="Maya"]').first();
    const sendButton = page.locator('button[data-testid="maya-chat-send"], button:has-text("Send")').first();
    
    console.log('🔍 Checking for Maya chat interface...');
    
    if (await chatInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log('✅ Found Maya chat input');
      
      // Try to send a test message
      const testMessage = "Hello Maya, this is a test message from Playwright";
      console.log('💬 Sending test message:', testMessage);
      
      await chatInput.fill(testMessage);
      await page.screenshot({ path: 'maya-debug-3-message-entered.png', fullPage: true });
      
      if (await sendButton.isVisible().catch(() => false)) {
        console.log('✅ Found send button, clicking...');
        await sendButton.click();
        
        // Wait for response or error
        await page.waitForTimeout(5000);
        
        // Check for Maya response
        const messages = await page.locator('[data-testid*="message"], .message, [class*="message"]').all();
        console.log(`📝 Found ${messages.length} messages`);
        
        // Check for typing indicator
        const typingIndicator = await page.locator('[class*="typing"], [class*="loading"], .animate-bounce').isVisible().catch(() => false);
        console.log('⏳ Typing indicator visible:', typingIndicator);
        
        // Wait a bit more for response
        await page.waitForTimeout(10000);
        
        // Take final screenshot
        await page.screenshot({ path: 'maya-debug-4-after-message.png', fullPage: true });
        
        // Get final message count
        const finalMessages = await page.locator('[data-testid*="message"], .message, [class*="message"]').all();
        console.log(`📝 Final message count: ${finalMessages.length}`);
        
        // Check for error messages
        const errorMessages = await page.locator('[class*="error"], [class*="toast"], .error').all();
        if (errorMessages.length > 0) {
          console.log('❌ Found error messages:', errorMessages.length);
          for (const error of errorMessages) {
            const errorText = await error.textContent();
            console.log('❌ Error:', errorText);
          }
        }
        
      } else {
        console.log('❌ Send button not found');
        await page.screenshot({ path: 'maya-debug-error-no-send-button.png', fullPage: true });
      }
      
    } else {
      console.log('❌ Maya chat input not found');
      
      // Check what's on the page instead
      const pageContent = await page.locator('body').textContent();
      console.log('📄 Page content preview:', pageContent?.substring(0, 500) || 'No content');
      
      await page.screenshot({ path: 'maya-debug-error-no-chat.png', fullPage: true });
    }
    
    // Log all network activity
    console.log('\n📊 NETWORK SUMMARY:');
    console.log('Requests:', requests.length);
    console.log('Responses:', responses.length);
    
    // Look for Maya API calls specifically
    const mayaRequests = requests.filter(r => r.url.includes('/maya'));
    const mayaResponses = responses.filter(r => r.url.includes('/maya'));
    
    console.log('\n🤖 MAYA API CALLS:');
    console.log('Maya Requests:', mayaRequests.length);
    console.log('Maya Responses:', mayaResponses.length);
    
    mayaRequests.forEach((req, i) => {
      console.log(`Request ${i + 1}:`, {
        method: req.method,
        url: req.url,
        postData: req.postData ? req.postData.substring(0, 200) : 'none'
      });
    });
    
    mayaResponses.forEach((resp, i) => {
      console.log(`Response ${i + 1}:`, {
        status: resp.status,
        url: resp.url,
        statusText: resp.statusText
      });
    });
    
    // Check for authentication errors
    const authErrors = responses.filter(r => r.status === 401 || r.status === 403);
    if (authErrors.length > 0) {
      console.log('\n🚨 AUTHENTICATION ERRORS:');
      authErrors.forEach(err => {
        console.log(`${err.status} ${err.statusText}: ${err.url}`);
      });
    }
    
    // Check for server errors
    const serverErrors = responses.filter(r => r.status >= 500);
    if (serverErrors.length > 0) {
      console.log('\n🚨 SERVER ERRORS:');
      serverErrors.forEach(err => {
        console.log(`${err.status} ${err.statusText}: ${err.url}`);
      });
    }
    
    console.log('\n✅ Maya debugging test completed');
  });
});