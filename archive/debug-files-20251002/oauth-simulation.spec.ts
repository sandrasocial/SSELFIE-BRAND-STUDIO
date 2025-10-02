import { test, expect } from '@playwright/test';

test('Simulate Complete OAuth Flow with Mock Callback', async ({ page, context }) => {
  console.log('🎭 SIMULATING COMPLETE OAUTH FLOW\n');

  // Step 1: Start the OAuth flow normally
  console.log('📍 Step 1: Starting OAuth flow...');
  await page.goto('https://www.sselfie.ai/handler/sign-in');
  await page.waitForLoadState('networkidle');

  // Find and click Google OAuth
  const googleButton = page.locator('button:has-text("Google")').first();
  if (await googleButton.isVisible()) {
    console.log('✅ Found Google OAuth button');
    
    // Start listening for navigation events
    let googlePageReached = false;
    
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (url.includes('accounts.google.com')) {
          googlePageReached = true;
          console.log('✅ Successfully redirected to Google OAuth');
        }
      }
    });
    
    await googleButton.click();
    
    // Wait for Google redirect
    await page.waitForTimeout(3000);
    
    if (googlePageReached) {
      console.log('✅ OAuth redirect to Google working');
      
      // Step 2: Simulate Google callback
      console.log('\n📍 Step 2: Simulating Google OAuth callback...');
      
      // Create a mock authorization code callback URL
      const mockCallbackUrl = 'https://www.sselfie.ai/handler/oauth-callback?code=mock_auth_code&state=mock_state';
      
      console.log('🔄 Navigating to mock callback URL...');
      await page.goto(mockCallbackUrl);
      await page.waitForLoadState('networkidle');
      
      console.log('🔍 Current URL after callback:', page.url());
      
      // Step 3: Monitor what happens with the callback
      console.log('\n📍 Step 3: Monitoring callback processing...');
      
      let redirectCount = 0;
      let currentUrl = page.url();
      const maxWait = 10000; // 10 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        await page.waitForTimeout(1000);
        
        const newUrl = page.url();
        if (newUrl !== currentUrl) {
          redirectCount++;
          console.log(`🔄 Redirect ${redirectCount}: ${currentUrl} → ${newUrl}`);
          currentUrl = newUrl;
          
          if (newUrl.includes('/auth-success')) {
            console.log('✅ Reached /auth-success page');
            
            // Check what happens on auth-success
            await page.waitForTimeout(3000);
            const finalUrl = page.url();
            
            if (finalUrl !== newUrl) {
              console.log(`🔄 Final redirect: ${newUrl} → ${finalUrl}`);
              
              if (finalUrl.includes('/app')) {
                console.log('🎉 SUCCESS: Reached /app page!');
              } else if (finalUrl.includes('/simple-training')) {
                console.log('🎉 SUCCESS: Reached /simple-training page!');
              } else {
                console.log('⚠️ Redirected to unexpected page:', finalUrl);
              }
            } else {
              console.log('⚠️ Stuck on /auth-success page');
            }
            break;
          } else if (newUrl.includes('/app')) {
            console.log('🎉 SUCCESS: Directly reached /app page!');
            break;
          } else if (newUrl.includes('/simple-training')) {
            console.log('🎉 SUCCESS: Directly reached /simple-training page!');
            break;
          } else if (newUrl === 'https://www.sselfie.ai/' || newUrl === 'https://sselfie.ai/') {
            console.log('🔄 Redirected to homepage - checking auth state...');
            
            // Check if actually authenticated
            try {
              const apiResponse = await page.request.get('https://www.sselfie.ai/api/me');
              console.log('🔍 /api/me status:', apiResponse.status());
              
              if (apiResponse.ok()) {
                console.log('✅ User is authenticated despite being on homepage');
                const userData = await apiResponse.json();
                console.log('👤 User data:', userData.email || userData.id);
              } else {
                console.log('❌ User is not authenticated');
              }
            } catch (e) {
              console.log('❌ Error checking auth:', e);
            }
            break;
          }
        }
      }
      
      if (Date.now() - startTime >= maxWait) {
        console.log('⏰ Callback processing timeout');
      }
      
    } else {
      console.log('❌ Failed to redirect to Google OAuth');
    }
    
  } else {
    console.log('❌ No Google OAuth button found');
  }
  
  // Step 4: Check authentication cookies
  console.log('\n📍 Step 4: Checking authentication state...');
  
  const cookies = await context.cookies();
  const authCookies = cookies.filter(c => 
    c.name.includes('stack') || 
    c.name.includes('auth') || 
    c.name.includes('session')
  );
  
  console.log('🍪 Authentication cookies found:', authCookies.length);
  authCookies.forEach(cookie => {
    console.log(`   ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
  });
  
  // Step 5: Test the actual authentication endpoints
  console.log('\n📍 Step 5: Testing authentication endpoints...');
  
  const testEndpoints = [
    '/api/me',
    '/api/user-model',
    '/handler/oauth-callback'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await page.request.get(`https://www.sselfie.ai${endpoint}`);
      console.log(`${response.ok() ? '✅' : '❌'} ${response.status()} ${endpoint}`);
      
      if (endpoint === '/api/me' && response.ok()) {
        const userData = await response.json();
        console.log('   User ID:', userData.id);
        console.log('   Email:', userData.email);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error}`);
    }
  }
  
  console.log('\n🎯 SIMULATION RESULTS:');
  console.log('This test simulates what should happen when Google calls back to our app.');
  console.log('If the simulation works but real OAuth fails, the issue is with Google OAuth configuration.');
});