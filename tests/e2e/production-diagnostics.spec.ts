import { test, expect } from '@playwright/test';
import type { ConsoleMessage } from '@playwright/test';

/**
 * SSELFIE Studio - Production Diagnostics
 * 
 * Comprehensive test suite to diagnose frontend/backend inconsistencies
 * and authentication flow issues on the production environment.
 */

const PRODUCTION_URL = 'https://sselfie.ai';
const PRODUCTION_API_URL = 'https://sselfie.ai/api';

test.describe('SSELFIE Studio - Production Diagnostics', () => {
  
  let consoleLogs: ConsoleMessage[] = [];
  let networkErrors: string[] = [];
  let apiErrors: { url: string; status: number; error?: string }[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    consoleLogs = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg);
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.text().includes('error') || msg.text().includes('Error')) {
        console.log(`⚠️  Console Warning: ${msg.text()}`);
      }
    });

    // Capture network errors
    networkErrors = [];
    apiErrors = [];
    page.on('requestfailed', (request) => {
      const error = `Failed request: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
      networkErrors.push(error);
      console.log(`🌐 Network Error: ${error}`);
    });

    // Capture API responses
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('/api/') && (status >= 400 || status === 0)) {
        let error: string | undefined;
        try {
          const body = await response.text();
          error = body || `HTTP ${status}`;
        } catch (e) {
          error = `HTTP ${status} - Cannot read response`;
        }
        
        apiErrors.push({ url, status, error });
        console.log(`🔴 API Error: ${status} ${url} - ${error}`);
      } else if (url.includes('/api/')) {
        console.log(`✅ API Success: ${status} ${url}`);
      }
    });
  });

  test.afterEach(async () => {
    // Summary report
    console.log('\n📊 Test Summary:');
    console.log(`Console Logs: ${consoleLogs.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    console.log(`API Errors: ${apiErrors.length}`);
    
    if (apiErrors.length > 0) {
      console.log('\n🔍 API Error Details:');
      apiErrors.forEach(error => {
        console.log(`  - ${error.status} ${error.url}: ${error.error}`);
      });
    }
  });

  test('Production Site Availability', async ({ page }) => {
    console.log('🔍 Testing production site availability...');
    
    // Test main site loads
    const response = await page.goto(PRODUCTION_URL);
    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(400);
    
    // Wait for React to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Check if main content loads
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✅ Site loads with title: ${title}`);
  });

  test('API Health Check', async ({ page }) => {
    console.log('🔍 Testing API health endpoints...');
    
    await page.goto(PRODUCTION_URL);
    
    // Test health endpoints
    const healthEndpoints = [
      '/api/simple-health',
      '/api/health',
      '/api/me'
    ];
    
    for (const endpoint of healthEndpoints) {
      console.log(`Testing ${endpoint}...`);
      
      const response = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url);
          return {
            status: res.status,
            ok: res.ok,
            statusText: res.statusText,
            body: await res.text().catch(() => 'Cannot read body')
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }, `${PRODUCTION_URL}${endpoint}`);
      
      console.log(`  ${endpoint}: ${JSON.stringify(response, null, 2)}`);
    }
  });

  test('Authentication Flow Analysis', async ({ page }) => {
    console.log('🔍 Analyzing authentication flow...');
    
    await page.goto(PRODUCTION_URL);
    
    // Wait for Stack Auth to initialize
    await page.waitForTimeout(3000);
    
    // Check Stack Auth initialization
    const stackAuthStatus = await page.evaluate(() => {
      return {
        stackAuthAvailable: typeof window !== 'undefined' && 'StackAuth' in window,
        authDebugAvailable: typeof window !== 'undefined' && '__authDebug' in window,
        cookies: document.cookie,
        localStorage: Object.keys(localStorage).filter(key => 
          key.includes('stack') || key.includes('auth') || key.includes('token')
        )
      };
    });
    
    console.log('🔐 Stack Auth Status:', JSON.stringify(stackAuthStatus, null, 2));
    
    // Check authentication endpoints
    const authResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/users/me');
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text().catch(() => 'Cannot read body')
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🔐 Auth Endpoint Response:', JSON.stringify(authResponse, null, 2));
  });

  test('User Model Endpoint Analysis', async ({ page }) => {
    console.log('🔍 Analyzing user model endpoints...');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    // Test user model endpoint
    const userModelResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/user-model');
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text().catch(() => 'Cannot read body')
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🤖 User Model Response:', JSON.stringify(userModelResponse, null, 2));
    
    // Test pricing endpoint
    const pricingResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/pricing');
        return {
          status: response.status,
          body: await response.json().catch(() => ({ error: 'Cannot parse JSON' }))
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('💰 Pricing Response:', JSON.stringify(pricingResponse, null, 2));
  });

  test('Console Log Analysis', async ({ page }) => {
    console.log('🔍 Analyzing console logs for errors...');
    
    await page.goto(PRODUCTION_URL);
    
    // Wait for app initialization
    await page.waitForTimeout(5000);
    
    // Categorize console logs
    const errorLogs = consoleLogs.filter(log => log.type() === 'error');
    const warningLogs = consoleLogs.filter(log => log.type() === 'warning');
    const authLogs = consoleLogs.filter(log => log.text().includes('Auth') || log.text().includes('🔐'));
    const stackLogs = consoleLogs.filter(log => log.text().includes('Stack Auth'));
    const apiLogs = consoleLogs.filter(log => log.text().includes('/api/'));
    
    console.log('\n📝 Console Log Analysis:');
    console.log(`Total logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    console.log(`Auth-related: ${authLogs.length}`);
    console.log(`Stack Auth: ${stackLogs.length}`);
    console.log(`API-related: ${apiLogs.length}`);
    
    // Print significant logs
    if (errorLogs.length > 0) {
      console.log('\n❌ Error Logs:');
      errorLogs.slice(0, 10).forEach(log => {
        console.log(`  - ${log.text()}`);
      });
    }
    
    if (authLogs.length > 0) {
      console.log('\n🔐 Auth Logs:');
      authLogs.slice(0, 10).forEach(log => {
        console.log(`  - ${log.text()}`);
      });
    }
  });

  test('Frontend-Backend API Consistency Check', async ({ page }) => {
    console.log('🔍 Testing frontend-backend API consistency...');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    // Test common API endpoints that the frontend calls
    const apiEndpoints = [
      '/api/me',
      '/api/user-model',
      '/api/pricing',
      '/api/gallery',
      '/api/maya/chat',
      '/api/auth/users/me'
    ];
    
    const apiResults = [];
    
    for (const endpoint of apiEndpoints) {
      console.log(`Testing ${endpoint}...`);
      
      const result = await page.evaluate(async (url) => {
        try {
          const response = await fetch(url);
          const contentType = response.headers.get('content-type') || '';
          
          let body;
          if (contentType.includes('application/json')) {
            body = await response.json().catch(() => ({ error: 'Invalid JSON' }));
          } else {
            body = await response.text().catch(() => 'Cannot read body');
          }
          
          return {
            endpoint: url,
            status: response.status,
            ok: response.ok,
            contentType,
            body: typeof body === 'string' ? body.substring(0, 200) : body
          };
        } catch (error) {
          return {
            endpoint: url,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }, endpoint);
      
      apiResults.push(result);
      console.log(`  ${endpoint}: ${result.status || 'ERROR'} - ${result.error || 'OK'}`);
    }
    
    console.log('\n🔗 API Endpoint Summary:');
    apiResults.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.endpoint}: ${result.error}`);
      } else if (result.status >= 400) {
        console.log(`🔴 ${result.endpoint}: ${result.status} ${result.body}`);
      } else {
        console.log(`✅ ${result.endpoint}: ${result.status}`);
      }
    });
  });

  test('Authentication Token Flow', async ({ page }) => {
    console.log('🔍 Testing authentication token flow...');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    // Check token handling
    const tokenStatus = await page.evaluate(() => {
      // Check for tokens in various places
      const cookies = document.cookie.split(';').map(c => c.trim());
      const stackTokens = cookies.filter(c => c.includes('stack'));
      const authTokens = cookies.filter(c => c.includes('auth') || c.includes('token'));
      
      const localStorageTokens = Object.keys(localStorage)
        .filter(key => key.includes('stack') || key.includes('auth') || key.includes('token'))
        .map(key => ({ key, value: localStorage[key]?.substring(0, 50) }));
      
      return {
        allCookies: cookies,
        stackTokens,
        authTokens,
        localStorageTokens,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
    });
    
    console.log('🔑 Token Status:', JSON.stringify(tokenStatus, null, 2));
    
    // Test authenticated request
    const authenticatedRequest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text().catch(() => 'Cannot read body')
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🔒 Authenticated Request Result:', JSON.stringify(authenticatedRequest, null, 2));
  });

  test('Network Timing Analysis', async ({ page }) => {
    console.log('🔍 Analyzing network timing and performance...');
    
    const startTime = Date.now();
    await page.goto(PRODUCTION_URL);
    
    // Wait for key elements to load
    await Promise.race([
      page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 }),
      page.waitForSelector('main', { timeout: 10000 }),
      page.waitForTimeout(10000)
    ]);
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Initial load time: ${loadTime}ms`);
    
    // Get network timing information
    const networkTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        }));
      
      return {
        navigation: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstByte: navigation.responseStart - navigation.navigationStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart
        },
        apiRequests: resources
      };
    });
    
    console.log('⏱️  Network Timing:', JSON.stringify(networkTiming, null, 2));
    
    // Performance analysis
    if (networkTiming.navigation.domContentLoaded > 5000) {
      console.log('⚠️  Warning: DOM content loading is slow (> 5s)');
    }
    
    if (networkTiming.apiRequests.some(req => req.duration > 10000)) {
      console.log('⚠️  Warning: Some API requests are very slow (> 10s)');
    }
  });

  test('Complete User Journey Simulation', async ({ page }) => {
    console.log('🔍 Simulating complete user journey...');
    
    await page.goto(PRODUCTION_URL);
    
    // Step 1: Landing page
    console.log('Step 1: Landing page load');
    await page.waitForTimeout(2000);
    
    // Step 2: Check if login button exists
    console.log('Step 2: Looking for login/auth elements');
    const loginElements = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const links = Array.from(document.querySelectorAll('a'));
      
      const authButtons = [...buttons, ...links].filter(el => 
        el.textContent?.toLowerCase().includes('login') ||
        el.textContent?.toLowerCase().includes('sign in') ||
        el.textContent?.toLowerCase().includes('get started') ||
        el.getAttribute('data-testid')?.includes('auth')
      );
      
      return authButtons.map(btn => ({
        text: btn.textContent?.trim(),
        href: btn.getAttribute('href'),
        testId: btn.getAttribute('data-testid'),
        className: btn.className
      }));
    });
    
    console.log('🔗 Auth Elements Found:', JSON.stringify(loginElements, null, 2));
    
    // Step 3: Check for authenticated state
    console.log('Step 3: Checking authentication state');
    const authState = await page.evaluate(async () => {
      // Try to get user info
      try {
        const meResponse = await fetch('/api/me', { credentials: 'include' });
        const userModelResponse = await fetch('/api/user-model', { credentials: 'include' });
        
        return {
          meStatus: meResponse.status,
          userModelStatus: userModelResponse.status,
          meBody: await meResponse.text().catch(() => 'Cannot read'),
          userModelBody: await userModelResponse.text().catch(() => 'Cannot read')
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('👤 Auth State:', JSON.stringify(authState, null, 2));
    
    // Step 4: Check for app-specific elements
    console.log('Step 4: Looking for app-specific elements');
    const appElements = await page.evaluate(() => {
      const mayaElements = document.querySelectorAll('[data-testid*="maya"], [id*="maya"], [class*="maya"]');
      const galleryElements = document.querySelectorAll('[data-testid*="gallery"], [id*="gallery"], [class*="gallery"]');
      const studioElements = document.querySelectorAll('[data-testid*="studio"], [id*="studio"], [class*="studio"]');
      
      return {
        maya: mayaElements.length,
        gallery: galleryElements.length,
        studio: studioElements.length,
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log('🎨 App Elements:', JSON.stringify(appElements, null, 2));
  });
});