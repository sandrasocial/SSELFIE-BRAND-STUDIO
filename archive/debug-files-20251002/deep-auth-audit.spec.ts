import { test, expect } from '@playwright/test';

/**
 * COMPLETE AUTHENTICATION FLOW AUDIT
 * Following the full user journey to identify where authentication breaks
 */

test('Complete Authentication Flow Deep Audit', async ({ page, context }) => {
  console.log('🕵️ DEEP AUTHENTICATION FLOW AUDIT');
  console.log('🎯 Testing complete user journey from login button to app access\n');

  // Capture all network activity
  const networkLog: any[] = [];
  const errorLog: any[] = [];
  
  // Track OAuth flow stages  
  let oauthCallbackDetected = false;
  let authSuccessDetected = false;
  
  page.on('request', request => {
    networkLog.push({
      type: 'request',
      method: request.method(),
      url: request.url(),
      timestamp: Date.now(),
      headers: request.headers()
    });
  });

  page.on('response', response => {
    networkLog.push({
      type: 'response',
      status: response.status(),
      url: response.url(),
      timestamp: Date.now(),
      ok: response.ok()
    });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errorLog.push({
        type: 'console-error',
        text: msg.text(),
        timestamp: Date.now()
      });
    }
    
    const text = msg.text();
    if (text.includes('🔍') || text.includes('Stack') || text.includes('auth') || text.includes('OAuth')) {
      console.log('🔍 BROWSER:', text);
    }
  });

  // Step 1: Start from homepage
  console.log('📍 Step 1: Loading homepage...');
  await page.goto('https://www.sselfie.ai/');
  await page.waitForLoadState('networkidle');
  
  // Check for login button
  console.log('📍 Step 2: Looking for login mechanism...');
  
  const loginButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")').all();
  
  if (loginButtons.length > 0) {
    console.log(`✅ Found ${loginButtons.length} login options`);
    
    // Click the first login button
    await loginButtons[0].click();
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 After login button click:', page.url());
    
    // Step 3: If we're on a handler page, look for OAuth
    if (page.url().includes('/handler/')) {
      console.log('✅ Correctly redirected to handler page');
      
      // Look for Google OAuth button
      const googleButton = page.locator('button:has-text("Google"), [data-provider="google"]').first();
      
      if (await googleButton.isVisible({ timeout: 5000 })) {
        console.log('✅ Found Google OAuth button');
        
        // Click Google OAuth and monitor the flow
        console.log('🖱️ Clicking Google OAuth button...');
        
        let finalDestination = '';
        
        // Set up page event listeners for navigation
        
        page.on('framenavigated', frame => {
          if (frame === page.mainFrame()) {
            const url = frame.url();
            console.log('🔄 Navigation:', url);
            
            if (url.includes('/handler/oauth-callback')) {
              oauthCallbackDetected = true;
              console.log('✅ OAuth callback detected!');
            }
            
            if (url.includes('/auth-success')) {
              authSuccessDetected = true;
              console.log('✅ Auth success page detected!');
            }
            
            finalDestination = url;
          }
        });
        
        await googleButton.click();
        
        // Wait for OAuth flow to complete
        console.log('⏳ Waiting for OAuth flow to complete...');
        
        // Wait up to 30 seconds for auth flow
        let attempts = 0;
        const maxAttempts = 60; // 30 seconds
        
        while (attempts < maxAttempts) {
          await page.waitForTimeout(500);
          attempts++;
          
          const currentUrl = page.url();
          
          // Check if we're back on our domain
          if (currentUrl.includes('sselfie.ai') && !currentUrl.includes('accounts.google.com')) {
            console.log(`🔄 Back on our domain after ${attempts * 0.5}s: ${currentUrl}`);
            
            // Wait a bit more to see if there are redirects
            await page.waitForTimeout(3000);
            
            const finalUrl = page.url();
            console.log('🎯 Final URL:', finalUrl);
            
            // Check what page we ended up on
            if (finalUrl.includes('/app')) {
              console.log('✅ SUCCESS: Reached /app page');
              break;
            } else if (finalUrl.includes('/simple-training')) {
              console.log('✅ SUCCESS: Reached /simple-training page (new user flow)');
              break;
            } else if (finalUrl.includes('/auth-success')) {
              console.log('⚠️ Stuck on auth-success page');
              
              // Check what's on the auth-success page
              const pageContent = await page.textContent('body');
              console.log('📄 Auth-success page content preview:', pageContent?.substring(0, 200));
              
              // Wait to see if it redirects
              await page.waitForTimeout(5000);
              const afterWaitUrl = page.url();
              console.log('🔍 URL after 5s wait:', afterWaitUrl);
              
              if (afterWaitUrl === finalUrl) {
                console.log('❌ No redirect from auth-success - this is the problem!');
              }
              break;
            } else if (finalUrl === 'https://www.sselfie.ai/' || finalUrl === 'https://www.sselfie.ai') {
              console.log('⚠️ Redirected back to homepage - checking auth state...');
              
              // Check if user is actually authenticated but just redirected to homepage
              try {
                const response = await page.request.get('https://www.sselfie.ai/api/me');
                console.log('🔍 /api/me status:', response.status());
                
                if (response.ok()) {
                  const userData = await response.json();
                  console.log('✅ User is authenticated! Data:', userData.email || userData.id);
                } else {
                  console.log('❌ User is not authenticated');
                }
              } catch (e) {
                console.log('❌ Failed to check auth status:', e);
              }
              break;
            } else {
              console.log('⚠️ Unexpected final destination');
            }
            break;
          }
          
          // If we're still on Google, that's expected during OAuth
          if (currentUrl.includes('accounts.google.com')) {
            // This is normal during OAuth flow
            continue;
          }
        }
        
        if (attempts >= maxAttempts) {
          console.log('❌ OAuth flow timed out after 30 seconds');
        }
        
      } else {
        console.log('❌ No Google OAuth button found on handler page');
      }
    } else {
      console.log('❌ Not redirected to handler page. Current URL:', page.url());
    }
  } else {
    console.log('❌ No login buttons found on homepage');
    
    // Let's check if user is already authenticated
    try {
      const response = await page.request.get('https://www.sselfie.ai/api/me');
      if (response.ok()) {
        console.log('ℹ️ User appears to already be authenticated');
      }
    } catch (e) {
      console.log('ℹ️ User is not authenticated');
    }
  }

  // Step 4: Analyze the network activity
  console.log('\n📊 NETWORK ANALYSIS:');
  
  // Filter important requests
  const authRequests = networkLog.filter(entry => 
    entry.url?.includes('/auth') || 
    entry.url?.includes('stack-auth') || 
    entry.url?.includes('/handler') || 
    entry.url?.includes('/api/me') ||
    entry.url?.includes('oauth')
  );
  
  console.log('🌐 Auth-related network activity:', authRequests.length);
  
  authRequests.forEach((entry, i) => {
    if (entry.type === 'request') {
      console.log(`   ${i + 1}. REQ ${entry.method} ${entry.url}`);
    } else {
      console.log(`   ${i + 1}. RES ${entry.status} ${entry.url} ${entry.ok ? '✅' : '❌'}`);
    }
  });

  // Check for errors
  const failedRequests = networkLog.filter(entry => 
    entry.type === 'response' && entry.status >= 400
  );
  
  if (failedRequests.length > 0) {
    console.log('\n❌ FAILED REQUESTS:');
    failedRequests.forEach(req => {
      console.log(`   ${req.status}: ${req.url}`);
    });
  }

  if (errorLog.length > 0) {
    console.log('\n❌ CONSOLE ERRORS:');
    errorLog.forEach(error => {
      console.log(`   ${error.text}`);
    });
  }

  // Step 5: Check critical endpoints
  console.log('\n📍 Step 5: Testing critical endpoints...');
  
  const criticalEndpoints = [
    '/handler/oauth-callback',
    '/auth-success', 
    '/api/me'
  ];

  for (const endpoint of criticalEndpoints) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
      console.log(`🔍 ${endpoint}: ${response.status()} ${response.ok() ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`🔍 ${endpoint}: Error - ${e}`);
    }
  }

  // Final conclusions
  console.log('\n🎯 AUDIT CONCLUSIONS:');
  console.log('OAuth redirect detected:', authRequests.some(r => r.url?.includes('accounts.google.com')) ? '✅' : '❌');
  console.log('OAuth callback detected:', oauthCallbackDetected ? '✅' : '❌');  
  console.log('Auth success detected:', authSuccessDetected ? '✅' : '❌');
  console.log('Failed requests:', failedRequests.length);
  console.log('Console errors:', errorLog.length);
});