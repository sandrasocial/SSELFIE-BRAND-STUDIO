import { test, expect } from '@playwright/test';

test.describe('OAuth Callback Direct Test', () => {
  test('Test direct navigation to auth-success page', async ({ page }) => {
    console.log('🔍 Testing direct navigation to /auth-success...');
    
    // Capture console messages
    page.on('console', msg => {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Test 1: Navigate directly to /auth-success
    console.log('📍 Test 1: Direct navigation to /auth-success');
    await page.goto('https://www.sselfie.ai/auth-success');
    await page.waitForLoadState('networkidle');
    
    const pageContent = await page.textContent('body');
    console.log('🔍 Page contains "404":', pageContent?.includes('404'));
    console.log('🔍 Page contains "ERROR":', pageContent?.includes('ERROR'));
    console.log('🔍 Page contains "Auth success":', pageContent?.includes('Auth success'));
    
    await page.screenshot({ path: 'direct-auth-success-test.png', fullPage: true });
    
    // Test 2: Try with different variations
    console.log('📍 Test 2: Testing /auth-success with trailing slash');
    await page.goto('https://www.sselfie.ai/auth-success/');
    await page.waitForLoadState('networkidle');
    
    const pageContent2 = await page.textContent('body');
    console.log('🔍 With trailing slash - Page contains "404":', pageContent2?.includes('404'));
    
    // Test 3: Navigate through OAuth flow partially 
    console.log('📍 Test 3: Navigate to sign-in, then manually to auth-success');
    
    // First go to sign-in to initialize Stack Auth
    await page.goto('https://www.sselfie.ai');
    await page.waitForLoadState('networkidle');
    
    const signInButton = page.locator('button:has-text("Login")').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForTimeout(2000);
      
      // Now try to navigate to auth-success manually
      console.log('📍 After Stack Auth initialization, navigating to /auth-success');
      await page.goto('https://www.sselfie.ai/auth-success');
      await page.waitForLoadState('networkidle');
      
      const pageContent3 = await page.textContent('body');
      console.log('🔍 After Stack Auth init - Page contains "404":', pageContent3?.includes('404'));
      console.log('🔍 After Stack Auth init - Page contains "Auth success":', pageContent3?.includes('Auth success'));
      
      await page.screenshot({ path: 'after-stack-init-auth-success.png', fullPage: true });
    }
    
    // Test 4: Check if there are any JavaScript errors preventing route matching
    console.log('📍 Test 4: Checking for JavaScript errors on auth-success page');
    
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('https://www.sselfie.ai/auth-success');
    await page.waitForTimeout(3000);
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:');
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    } else {
      console.log('✅ No JavaScript errors found');
    }
    
    // Test 5: Check if the route is actually being handled by React Router
    const isReactPage = await page.evaluate(() => {
      // Check if React is loaded and handling routing
      return !!(window as any).React || !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    });
    
    console.log('🔍 React detected on page:', isReactPage);
    
    // Check if we can find any Stack Auth elements
    const stackElements = await page.locator('[class*="stack"], [data-stack]').count();
    console.log('🔍 Stack Auth elements found:', stackElements);
    
    // Final test: Check the actual URL structure
    console.log('🔍 Final URL:', page.url());
    console.log('🔍 Page title:', await page.title());
  });
});