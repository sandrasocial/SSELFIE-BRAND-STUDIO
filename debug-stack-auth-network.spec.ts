import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';

test('Debug Stack Auth Network Activity', async () => {
  const browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  console.log('🔍 STACK AUTH NETWORK DEBUG');
  console.log('📍 Monitoring ALL network activity during Stack Auth initialization...');

  // Capture ALL network requests with detailed logging
  const allRequests: any[] = [];
  page.on('request', request => {
    const requestInfo = {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: new Date().toISOString()
    };
    allRequests.push(requestInfo);
    
    // Log Stack Auth related requests
    if (request.url().includes('stack-auth.com') || 
        request.url().includes('api/v1') ||
        request.headers()['x-stack-access-type']) {
      console.log('🌐 Stack Auth Request:', {
        url: request.url(),
        method: request.method(),
        headers: Object.keys(request.headers()).filter(h => h.includes('stack')).reduce((obj, key) => {
          obj[key] = request.headers()[key];
          return obj;
        }, {} as any)
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('stack-auth.com') || 
        response.url().includes('api/v1')) {
      console.log('🌐 Stack Auth Response:', {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      });
    }
  });

  // Capture console logs to see Stack Auth internal behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const logEntry = `${msg.type()}: ${msg.text()}`;
    consoleLogs.push(logEntry);
    
    // Focus on Stack Auth related logs
    if (msg.text().includes('Stack Auth') || 
        msg.text().includes('stack-auth') ||
        msg.text().includes('sign_up_enabled') ||
        msg.text().includes('project') && msg.text().includes('config')) {
      console.log('💬 Stack Auth Log:', logEntry);
    }
  });

  // Navigate to Stack Auth sign-in page (correct URL)
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  
  // Wait for Stack Auth to initialize and attempt API calls
  console.log('⏳ Waiting for Stack Auth initialization...');
  await page.waitForTimeout(5000);

  // Check if Stack Auth made any API requests
  const stackAuthRequests = allRequests.filter(req => 
    req.url.includes('stack-auth.com') || 
    req.url.includes('api/v1') ||
    req.headers['x-stack-access-type'] ||
    req.headers['x-stack-project-id']
  );

  console.log('\n📊 NETWORK ANALYSIS RESULTS:');
  console.log(`   Total requests: ${allRequests.length}`);
  console.log(`   Stack Auth API requests: ${stackAuthRequests.length}`);
  
  if (stackAuthRequests.length > 0) {
    console.log('\n✅ Stack Auth API requests detected:');
    stackAuthRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.method} ${req.url}`);
      if (req.headers['x-stack-access-type']) {
        console.log(`      x-stack-access-type: ${req.headers['x-stack-access-type']}`);
      }
    });
  } else {
    console.log('\n❌ CRITICAL: No Stack Auth API requests detected');
    console.log('   Stack Auth client is not making expected API calls to fetch project configuration');
    
    // Show some sample requests to see what IS happening
    console.log('\n🔍 Sample of other requests made:');
    allRequests.slice(0, 10).forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.method} ${req.url}`);
    });
  }

  // Check for any Stack Auth related errors
  const stackAuthErrors = consoleLogs.filter(log => 
    log.includes('Stack Auth') && (log.includes('error') || log.includes('Error'))
  );
  
  if (stackAuthErrors.length > 0) {
    console.log('\n🚨 Stack Auth Errors Detected:');
    stackAuthErrors.forEach(error => console.log(`   ${error}`));
  }

  // Evaluate browser state for Stack Auth globals
  const browserState = await page.evaluate(() => {
    return {
      hasGlobalThis: typeof globalThis !== 'undefined',
      hasProcess: typeof globalThis.process !== 'undefined',
      processEnv: globalThis.process?.env ? {
        nextPublicStackProjectId: globalThis.process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        nextPublicStackKey: globalThis.process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
        viteStackProjectId: globalThis.process.env.VITE_STACK_PROJECT_ID,
        viteStackKey: globalThis.process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
      } : null,
      globalStackId: (globalThis as any).__STACK_PROJECT_ID__,
      globalStackKey: (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__,
      windowLocation: window.location.href,
      stackAuthInWindow: typeof (window as any).stackAuth !== 'undefined'
    };
  });

  console.log('\n🔍 Browser Environment Analysis:');
  console.log('   Browser state:', JSON.stringify(browserState, null, 2));

  await browser.close();
});