import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * SSELFIE Studio - Targeted White Screen Debug Test
 * 
 * This focused test will identify exactly where the white screen issue occurs
 * by testing the basic application loading and JavaScript execution.
 */

// Use the latest successful deployment URL  
const DEPLOYED_URL = 'https://sselfie-brand-studio-224gw8sp0-sselfie-studio.vercel.app';

test.describe('SSELFIE Studio - White Screen Debug', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();

    // Enable console logging to capture JavaScript errors
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
      console.log(`[JAVASCRIPT ERROR]:`, error.message);
      console.log(`[ERROR STACK]:`, error.stack);
    });

    // Capture failed network requests
    page.on('requestfailed', request => {
      console.log(`[REQUEST FAILED]:`, request.url(), request.failure()?.errorText);
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should identify where the white screen occurs', async () => {
    console.log('\n🔍 Starting white screen diagnostic test...');
    console.log('🌐 Testing URL:', DEPLOYED_URL);

    try {
      // Navigate to the deployed app
      console.log('\n📄 Step 1: Loading page...');
      const response = await page.goto(DEPLOYED_URL, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      console.log(`✅ Page response status: ${response?.status()}`);

      // Take initial screenshot
      await page.screenshot({ 
        path: 'debug-step1-initial-load.png',
        fullPage: true 
      });

      // Check if page title loads
      console.log('\n📝 Step 2: Checking page title...');
      const title = await page.title();
      console.log(`📋 Page title: "${title}"`);

      // Look for loading indicator
      console.log('\n⏳ Step 3: Checking for loading indicators...');
      try {
        const loadingElement = await page.waitForSelector('[data-testid="loading"], .loading, text="SSELFIE STUDIIO loading"', { 
          timeout: 5000 
        });
        if (loadingElement) {
          console.log('✅ Loading indicator found');
          await page.screenshot({ 
            path: 'debug-step3-loading-found.png',
            fullPage: true 
          });
        }
      } catch (e) {
        console.log('❌ No loading indicator found');
      }

      // Check for React app mount
      console.log('\n⚛️  Step 4: Checking for React app mount...');
      try {
        const reactRoot = await page.waitForSelector('#root', { timeout: 5000 });
        if (reactRoot) {
          const rootContent = await reactRoot.innerHTML();
          console.log(`📦 React root content length: ${rootContent.length}`);
          console.log(`📝 React root preview: ${rootContent.substring(0, 200)}...`);
        }
      } catch (e) {
        console.log('❌ React root not found or empty');
      }

      // Check for main app components
      console.log('\n🏗️  Step 5: Checking for main app components...');
      const componentSelectors = [
        'h1:has-text("SSELFIE Studio")',
        '[data-testid="sign-up-button"]',
        '[data-testid="sign-in-button"]',
        '.App',
        '[class*="App"]'
      ];

      for (const selector of componentSelectors) {
        try {
          const element = await page.waitForSelector(selector, { timeout: 3000 });
          if (element) {
            console.log(`✅ Found component: ${selector}`);
          }
        } catch (e) {
          console.log(`❌ Missing component: ${selector}`);
        }
      }

      // Check JavaScript execution
      console.log('\n💻 Step 6: Testing JavaScript execution...');
      try {
        const jsResult = await page.evaluate(() => {
          return {
            hasReact: typeof (window as any).React !== 'undefined',
            hasReactDOM: typeof (window as any).ReactDOM !== 'undefined',
            windowKeys: Object.keys(window).filter(key => key.includes('React') || key.includes('Stack')),
            location: window.location.href,
            documentReady: document.readyState,
            bodyContent: document.body.innerHTML.substring(0, 300)
          };
        });
        console.log('✅ JavaScript execution successful:', JSON.stringify(jsResult, null, 2));
      } catch (e) {
        console.log('❌ JavaScript execution failed:', e);
      }

      // Final screenshot
      await page.screenshot({ 
        path: 'debug-final-state.png',
        fullPage: true 
      });

      // Wait a bit more to see if anything loads eventually
      console.log('\n⏱️  Step 7: Waiting for delayed loading (10 seconds)...');
      await page.waitForTimeout(10000);
      
      await page.screenshot({ 
        path: 'debug-after-10s-wait.png',
        fullPage: true 
      });

      console.log('\n📊 Test completed. Check screenshots and console output for details.');

    } catch (error) {
      console.log('\n❌ Test failed with error:', error);
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'debug-error-state.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});