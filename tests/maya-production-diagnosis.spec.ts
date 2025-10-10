import { test, expect } from '@playwright/test';

test.describe('Maya Chat Production Diagnosis', () => {
  
  test('Diagnose Maya chat issue on production', async ({ page }) => {
    console.log('🔍 Starting Maya chat diagnosis on production...');
    
    // Go to production URL
    const productionUrl = 'https://sselfie-brand-studio-h92wolspc-sselfie-studio.vercel.app';
    
    // Step 1: Check if site loads
    console.log('📡 Loading production site...');
    await page.goto(productionUrl, { waitUntil: 'networkidle' });
    
    // Take screenshot of landing page
    await page.screenshot({ path: 'tests/screenshots/maya-diagnosis-landing.png', fullPage: true });
    
    // Step 2: Check for authentication elements
    console.log('🔐 Checking authentication...');
    
    // Look for login buttons or user info
    const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Login")').first();
    const userInfo = page.locator('[data-testid="user-info"], .user-name, .user-email').first();
    
    if (await loginButton.isVisible()) {
      console.log('🔑 Login required - attempting login...');
      await loginButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/maya-diagnosis-login.png', fullPage: true });
    } else if (await userInfo.isVisible()) {
      console.log('✅ User appears to be logged in');
    } else {
      console.log('❓ No clear authentication state visible');
    }
    
    // Step 3: Try to navigate to Maya
    console.log('🧭 Navigating to Maya chat...');
    
    // Try different Maya URLs
    const mayaUrls = ['/maya', '/app/maya', '/#/maya'];
    
    for (const mayaUrl of mayaUrls) {
      console.log(`📍 Trying Maya URL: ${mayaUrl}`);
      
      try {
        await page.goto(`${productionUrl}${mayaUrl}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Take screenshot
        await page.screenshot({ 
          path: `tests/screenshots/maya-diagnosis-${mayaUrl.replace('/', '-')}.png`, 
          fullPage: true 
        });
        
        // Check for Maya chat elements
        const chatInput = page.locator('textarea[data-test-id="chat-input"], input[placeholder*="Maya"], textarea[placeholder*="Maya"]').first();
        const sendButton = page.locator('button[data-testid="maya-chat-send"], button:has-text("Send")').first();
        const mayaHeader = page.locator('h1:has-text("Maya"), h2:has-text("Maya"), h3:has-text("Maya")').first();
        
        console.log(`  - Chat input visible: ${await chatInput.isVisible()}`);
        console.log(`  - Send button visible: ${await sendButton.isVisible()}`);
        console.log(`  - Maya header visible: ${await mayaHeader.isVisible()}`);
        
        // If we find Maya elements, try to interact
        if (await chatInput.isVisible() && await sendButton.isVisible()) {
          console.log('✅ Found Maya chat interface!');
          
          // Try sending a test message
          await chatInput.fill('Hello Maya, this is a test message');
          await page.screenshot({ path: 'tests/screenshots/maya-diagnosis-before-send.png', fullPage: true });
          
          // Monitor network requests
          const apiRequests: any[] = [];
          page.on('request', request => {
            if (request.url().includes('/api/maya') || request.url().includes('maya')) {
              apiRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
              });
            }
          });
          
          page.on('response', response => {
            if (response.url().includes('/api/maya') || response.url().includes('maya')) {
              console.log(`📡 Maya API Response: ${response.status()} - ${response.url()}`);
            }
          });
          
          await sendButton.click();
          await page.waitForTimeout(5000); // Wait for potential response
          
          await page.screenshot({ path: 'tests/screenshots/maya-diagnosis-after-send.png', fullPage: true });
          
          console.log(`📊 API requests made: ${apiRequests.length}`);
          apiRequests.forEach(req => {
            console.log(`  - ${req.method} ${req.url}`);
          });
          
          // Check for Maya response
          const mayaResponse = page.locator('.maya-message, [data-role="maya"], [data-type="maya"]').first();
          const errorMessage = page.locator('.error, .toast-error, [role="alert"]').first();
          
          await page.waitForTimeout(3000);
          
          if (await mayaResponse.isVisible()) {
            console.log('✅ Maya responded!');
            const responseText = await mayaResponse.textContent();
            console.log(`📝 Maya response preview: ${responseText?.substring(0, 100)}...`);
          } else if (await errorMessage.isVisible()) {
            console.log('❌ Error message visible');
            const errorText = await errorMessage.textContent();
            console.log(`📝 Error: ${errorText}`);
          } else {
            console.log('⏳ No visible response yet...');
          }
          
          return; // Found working Maya interface
        }
        
      } catch (error) {
        console.log(`❌ Error accessing ${mayaUrl}: ${error}`);
      }
    }
    
    // Step 4: Check browser console for errors
    console.log('🔍 Checking browser console...');
    
    const consoleLogs: any[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // Reload page to capture console logs
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Log console messages
    console.log(`📋 Console messages (${consoleLogs.length}):`);
    consoleLogs.slice(0, 10).forEach(log => {
      console.log(`  ${log.type}: ${log.text}`);
    });
    
    // Step 5: Check for Stack Auth and API connectivity
    console.log('🔐 Testing Stack Auth API...');
    
    try {
      const response = await page.request.get(`${productionUrl}/api/auth/me`);
      console.log(`📡 Auth API status: ${response.status()}`);
      
      if (response.ok()) {
        const authData = await response.json();
        console.log('✅ Auth API working:', authData);
      }
    } catch (error) {
      console.log('❌ Auth API error:', error);
    }
    
    // Step 6: Test Maya API directly
    console.log('🤖 Testing Maya API directly...');
    
    try {
      const mayaResponse = await page.request.post(`${productionUrl}/api/maya/chat`, {
        data: {
          message: 'Hello Maya test',
          conversationHistory: []
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📡 Maya API status: ${mayaResponse.status()}`);
      
      if (mayaResponse.ok()) {
        const mayaData = await mayaResponse.json();
        console.log('✅ Maya API working:', mayaData);
      } else {
        const errorData = await mayaResponse.json().catch(() => null);
        console.log('❌ Maya API error:', errorData);
      }
    } catch (error) {
      console.log('❌ Maya API request failed:', error);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/maya-diagnosis-final.png', fullPage: true });
    
    console.log('🏁 Maya diagnosis complete! Check screenshots in tests/screenshots/');
  });
  
});