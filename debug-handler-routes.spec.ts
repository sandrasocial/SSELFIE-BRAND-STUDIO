import { test, expect } from '@playwright/test';

/**
 * TARGETED OAUTH DEBUGGING - Handler Routes & Configuration
 * Testing admin user ssa@ssasocial.com with correct Stack Auth handler paths
 */

test('Debug Stack Auth Handler Routes for Admin User', async ({ page, context }) => {
  console.log('🎯 TARGETED OAUTH DEBUG TEST');
  console.log('👤 Admin user: ssa@ssasocial.com (ID: 42585527)');
  console.log('🔧 Testing correct Stack Auth handler routes\n');

  // Capture all network activity
  const requests: any[] = [];
  const responses: any[] = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('stack-auth') || url.includes('google') || url.includes('oauth') || url.includes('/handler/') || url.includes('auth')) {
      requests.push({
        url,
        method: request.method(),
        timestamp: Date.now()
      });
      console.log('🌐 REQUEST:', request.method(), url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('stack-auth') || url.includes('google') || url.includes('oauth') || url.includes('/handler/') || url.includes('auth')) {
      responses.push({
        url,
        status: response.status(),
        timestamp: Date.now()
      });
      console.log('📥 RESPONSE:', response.status(), url);
    }
  });

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('Stack') || text.includes('auth') || text.includes('OAuth')) {
      console.log('🔍 BROWSER:', text);
    }
  });

  console.log('📍 Step 1: Testing Stack Auth handler routes directly...');

  // Test 1: Check /handler/sign-in route (correct Stack Auth path)
  console.log('\n🔍 Testing /handler/sign-in (correct Stack Auth path)...');
  try {
    await page.goto('https://www.sselfie.ai/handler/sign-in');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const url1 = page.url();
    console.log('✅ /handler/sign-in loaded:', url1);
    
    // Check if we can find OAuth buttons on this page
    const googleButtons1 = await page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"]').count();
    console.log('🔍 Google buttons found:', googleButtons1);
    
    await page.screenshot({ path: 'debug-handler-sign-in.png', fullPage: true });
  } catch (error) {
    console.log('❌ /handler/sign-in failed:', error);
  }

  // Test 2: Check /sign-in route (what we were testing before)
  console.log('\n🔍 Testing /sign-in (incorrect path we tested before)...');
  try {
    await page.goto('https://www.sselfie.ai/sign-in');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const url2 = page.url();
    console.log('✅ /sign-in loaded:', url2);
    
    // Check if we can find OAuth buttons on this page
    const googleButtons2 = await page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"]').count();
    console.log('🔍 Google buttons found:', googleButtons2);
    
    await page.screenshot({ path: 'debug-sign-in.png', fullPage: true });
  } catch (error) {
    console.log('❌ /sign-in failed:', error);
  }

  // Test 3: Now test the correct OAuth flow from handler
  console.log('\n📍 Step 2: Testing OAuth flow from correct handler route...');
  
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  console.log('🔍 Current URL:', page.url());
  
  // Look for Google OAuth button on the handler page
  const googleSelector = 'button:has-text("Google"), a:has-text("Google"), [data-provider="google"]';
  const googleButton = page.locator(googleSelector).first();
  
  if (await googleButton.isVisible({ timeout: 5000 })) {
    console.log('✅ Found Google OAuth button on handler page');
    
    console.log('🖱️ Clicking Google OAuth button...');
    
    // Monitor for URL changes
    const initialUrl = page.url();
    
    await googleButton.click();
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    const newUrl = page.url();
    console.log('🔍 URL after click:', newUrl);
    
    if (newUrl !== initialUrl) {
      console.log('✅ URL changed - redirect detected!');
      
      if (newUrl.includes('google.com') || newUrl.includes('accounts.google.com')) {
        console.log('🎉 SUCCESS: Redirected to Google OAuth!');
        await page.screenshot({ path: 'debug-google-oauth-page.png', fullPage: true });
        
        // This is where real OAuth would happen
        // We can't complete it in automated test, but we've proven the redirect works
        
      } else if (newUrl.includes('stack-auth.com')) {
        console.log('✅ Redirected to Stack Auth OAuth handler');
        await page.screenshot({ path: 'debug-stack-auth-oauth.png', fullPage: true });
        
      } else {
        console.log('⚠️ Redirected to unexpected URL');
        await page.screenshot({ path: 'debug-unexpected-redirect.png', fullPage: true });
      }
    } else {
      console.log('❌ No redirect detected - OAuth button click failed');
      await page.screenshot({ path: 'debug-no-redirect.png', fullPage: true });
      
      // Check for JavaScript errors
      const errors = await page.evaluate(() => {
        return (window as any).jsErrors || [];
      });
      
      if (errors.length > 0) {
        console.log('❌ JavaScript errors detected:', errors);
      }
    }
    
  } else {
    console.log('❌ No Google OAuth button found on handler page');
    
    // Take screenshot to see what's actually on the page
    await page.screenshot({ path: 'debug-no-google-button.png', fullPage: true });
    
    // Check what buttons are available
    const allButtons = await page.locator('button, a[role="button"], .btn').all();
    console.log('🔍 Available buttons/links:', allButtons.length);
    
    for (let i = 0; i < Math.min(5, allButtons.length); i++) {
      const text = await allButtons[i].textContent();
      console.log(`   ${i + 1}. "${text}"`);
    }
  }

  // Test 4: Check Stack Auth configuration via API
  console.log('\n📍 Step 3: Checking Stack Auth API configuration...');
  
  try {
    const projectId = '253d7343-a0d4-43a1-be5c-822f590d40be';
    const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`;
    
    const response = await fetch(jwksUrl);
    console.log('🔑 Stack Auth JWKS endpoint status:', response.status);
    
    if (response.ok) {
      const jwks = await response.json();
      console.log('✅ Stack Auth project is accessible');
      console.log('🔍 JWKS keys count:', jwks.keys?.length || 0);
    }
  } catch (error) {
    console.log('❌ Stack Auth API test failed:', error);
  }

  // Final summary
  console.log('\n📊 ANALYSIS SUMMARY:');
  console.log('🌐 Total auth requests:', requests.length);
  console.log('📥 Total auth responses:', responses.length);
  
  // Show all auth-related network activity
  if (requests.length > 0) {
    console.log('\n🔐 AUTH NETWORK ACTIVITY:');
    requests.forEach((req, i) => {
      const res = responses.find(r => Math.abs(r.timestamp - req.timestamp) < 1000);
      console.log(`   ${i + 1}. ${req.method} ${req.url} → ${res?.status || 'pending'}`);
    });
  }

  // Check for obvious issues
  const failedRequests = responses.filter(r => r.status >= 400);
  if (failedRequests.length > 0) {
    console.log('\n❌ FAILED REQUESTS:');
    failedRequests.forEach(req => {
      console.log(`   ${req.status}: ${req.url}`);
    });
  }
  
  console.log('\n🎯 CONCLUSION:');
  if (requests.some(r => r.url.includes('google.com') || r.url.includes('accounts.google.com'))) {
    console.log('✅ OAuth redirect to Google detected - OAuth flow is working!');
  } else if (requests.some(r => r.url.includes('stack-auth.com'))) {
    console.log('⚠️ Stack Auth requests detected but no Google redirect');
  } else {
    console.log('❌ No OAuth activity detected - configuration issue confirmed');
  }
});