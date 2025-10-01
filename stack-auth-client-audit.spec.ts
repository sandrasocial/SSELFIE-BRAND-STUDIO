import { test, expect } from '@playwright/test';

test('Stack Auth Client Configuration Audit', async ({ page }) => {
  console.log('🔍 STACK AUTH CLIENT CONFIG AUDIT');
  
  // Capture network traffic to see Stack Auth API attempts
  const networkLogs: Array<{url: string, method: string, headers: Record<string, string>, status?: number, error?: string}> = [];
  
  page.on('request', request => {
    if (request.url().includes('stack-auth') || request.url().includes('stackframe')) {
      console.log(`📤 Request: ${request.method()} ${request.url()}`);
      networkLogs.push({
        url: request.url(),
        method: request.method(),
        headers: {},
      });
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('stack-auth') || request.url().includes('stackframe')) {
      console.log(`❌ Request failed: ${request.method()} ${request.url()}`);
      const log = networkLogs.find(l => l.url === request.url());
      if (log) {
        log.error = request.failure()?.errorText || 'Unknown error';
      }
    }
  });

  page.on('response', response => {
    if (response.url().includes('stack-auth') || response.url().includes('stackframe')) {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
      const log = networkLogs.find(l => l.url === response.url());
      if (log) {
        log.status = response.status();
      }
    }
  });

  // Check browser console for Stack Auth initialization
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (text.includes('Stack Auth') || text.includes('stackframe')) {
      console.log(`💬 Console: [${msg.type()}] ${text}`);
    }
  });

  // Navigate and capture initialization
  console.log('📍 Loading sign-in page and monitoring Stack Auth initialization...');
  await page.goto('https://www.sselfie.ai/sign-in');
  
  // Wait longer to see if Stack Auth eventually makes API calls
  await page.waitForTimeout(10000);

  console.log('\n📊 AUDIT RESULTS:');
  console.log(`   Network logs captured: ${networkLogs.length}`);
  console.log(`   Console messages: ${consoleMessages.length}`);

  if (networkLogs.length === 0) {
    console.log('❌ CRITICAL: No Stack Auth API requests detected');
    console.log('   This suggests Stack Auth client is not attempting to fetch project configuration');
    console.log('   Possible causes:');
    console.log('   1. Missing API base URL configuration');
    console.log('   2. Network/CORS blocking requests');
    console.log('   3. Stack Auth client not initializing properly');
  } else {
    console.log('✅ Stack Auth API requests detected:');
    networkLogs.forEach((log, i) => {
      console.log(`   ${i+1}. ${log.method} ${log.url}`);
      console.log(`      Status: ${log.status || 'pending'}`);
      if (log.error) {
        console.log(`      Error: ${log.error}`);
      }
      console.log(`      Headers: ${Object.keys(log.headers).join(', ')}`);
    });
  }

  // Check if Stack Auth configuration is accessible in the client
  const stackConfigCheck = await page.evaluate(() => {
    try {
      // Check if Stack Auth globals are available
      const hasStackGlobals = typeof window !== 'undefined' && 
                              (window as any).__STACK_PROJECT_ID__ !== undefined;
      
      // Check if environment variables are accessible
      const envVars = {
        projectId: (globalThis as any).__STACK_PROJECT_ID__,
        publishableKey: (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__,
      };

      return {
        hasStackGlobals,
        envVars,
        origin: window.location.origin
      };
    } catch (error) {
      return { error: error?.toString() };
    }
  });

  console.log('\n🔍 Client-side Stack Auth config:');
  console.log('   Stack globals available:', stackConfigCheck.hasStackGlobals);
  console.log('   Project ID:', stackConfigCheck.envVars?.projectId?.substring(0, 8) + '...');
  console.log('   Publishable key:', stackConfigCheck.envVars?.publishableKey?.substring(0, 10) + '...');
  console.log('   Origin:', stackConfigCheck.origin);

  if (stackConfigCheck.error) {
    console.log('   Error accessing config:', stackConfigCheck.error);
  }

  console.log('\n📋 RECOMMENDATIONS:');
  if (networkLogs.length === 0) {
    console.log('1. Check Stack Auth client initialization in browser dev tools');
    console.log('2. Verify if Stack Auth is trying to make API calls but failing silently');
    console.log('3. Check if additional Stack Auth configuration is needed (e.g., apiUrl)');
  }
});