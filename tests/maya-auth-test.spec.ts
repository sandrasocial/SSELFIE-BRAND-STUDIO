import { test, expect } from '@playwright/test';

test.describe('Maya Chat with Authentication', () => {
  
  test('Test Maya with proper authentication flow', async ({ page }) => {
    console.log('🔍 Testing Maya chat with authentication...');
    
    const productionUrl = 'https://sselfie-brand-studio-h92wolspc-sselfie-studio.vercel.app';
    
    // Step 1: Go to landing page
    console.log('📡 Loading production site...');
    await page.goto(productionUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tests/screenshots/maya-auth-landing.png', fullPage: true });
    
    // Step 2: Look for login/sign-in options
    console.log('🔐 Looking for authentication options...');
    
    // Try to find login buttons or links
    const authElements = [
      'button:has-text("Sign In")',
      'button:has-text("Login")', 
      'button:has-text("Get Started")',
      'a:has-text("Sign In")',
      'a:has-text("Login")',
      'a:has-text("Sign Up")',
      'button:has-text("Sign Up")',
      '[data-testid="login"]',
      '[data-testid="sign-in"]',
      '.login-button',
      '.sign-in-button'
    ];
    
    let authButton = null;
    for (const selector of authElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found auth button: ${selector}`);
          authButton = element;
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (authButton) {
      console.log('🔑 Attempting to click auth button...');
      await authButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/maya-auth-clicked.png', fullPage: true });
      
      // Look for email input or other auth forms
      const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      if (await emailInput.isVisible()) {
        console.log('📧 Found email input - this would be where users authenticate');
        await page.screenshot({ path: 'tests/screenshots/maya-auth-form.png', fullPage: true });
      }
    } else {
      console.log('❓ No clear authentication option found');
      
      // Try direct routes to authentication
      console.log('🔄 Trying direct auth routes...');
      const authRoutes = ['/handler/sign-in', '/auth', '/login', '/signin', '/magic-link'];
      
      for (const route of authRoutes) {
        try {
          console.log(`📍 Trying auth route: ${route}`);
          await page.goto(`${productionUrl}${route}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
          
          // Check if this looks like an auth page
          const hasEmailInput = await page.locator('input[type="email"]').first().isVisible();
          const hasPasswordInput = await page.locator('input[type="password"]').first().isVisible();
          const hasAuthForm = await page.locator('form').first().isVisible();
          
          if (hasEmailInput || hasPasswordInput || hasAuthForm) {
            console.log(`✅ Found auth page at ${route}`);
            await page.screenshot({ path: `tests/screenshots/maya-auth-page-${route.replace('/', '-')}.png`, fullPage: true });
            break;
          }
        } catch (error) {
          console.log(`❌ Auth route ${route} failed: ${error}`);
        }
      }
    }
    
    // Step 3: Try to access Maya directly and see what happens
    console.log('🧭 Testing direct Maya access...');
    await page.goto(`${productionUrl}/maya`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/maya-direct-access.png', fullPage: true });
    
    // Check if redirected to auth
    const currentUrl = page.url();
    console.log(`📍 Current URL after Maya access: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in') || currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('✅ Correctly redirected to authentication');
    } else if (currentUrl.includes('/maya')) {
      console.log('🤔 Still on Maya page - checking for auth requirements...');
      
      // Look for Maya elements
      const chatInput = page.locator('textarea[data-test-id="chat-input"]').first();
      const sendButton = page.locator('button[data-testid="maya-chat-send"]').first();
      
      console.log(`Chat input visible: ${await chatInput.isVisible()}`);
      console.log(`Send button visible: ${await sendButton.isVisible()}`);
      
      if (await chatInput.isVisible()) {
        console.log('🎉 Maya chat interface is accessible!');
        
        // Try to send a message
        await chatInput.fill('Hello Maya, this is a test');
        await sendButton.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'tests/screenshots/maya-message-sent.png', fullPage: true });
        
        // Check for any error messages
        const errorMessage = page.locator('.error, .toast-error, [role="alert"]').first();
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          console.log(`❌ Error after sending message: ${errorText}`);
        }
      }
    }
    
    // Step 4: Check browser developer console for clues
    console.log('🔍 Checking for JavaScript errors...');
    
    const consoleLogs: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleLogs.length > 0) {
      console.log('❌ JavaScript errors found:');
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    console.log('🏁 Maya authentication test complete!');
  });
  
});