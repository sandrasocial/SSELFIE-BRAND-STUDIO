/**
 * Simple OAuth Flow Test Script
 * 
 * This script tests the critical points of your OAuth flow
 * to identify any remaining issues after the authentication cleanup.
 */

const { test } = require('@playwright/test');

test('OAuth Flow Health Check', async ({ page }) => {
  console.log('🧪 OAUTH FLOW HEALTH CHECK\n');

  // Test 1: Check sign-in page loads
  console.log('📍 Step 1: Testing sign-in page...');
  try {
    await page.goto('http://localhost:5173/handler/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    const title = await page.title();
    console.log(`   ✅ Sign-in page loaded: "${title}"`);
    
    // Check if Google OAuth button exists
    const googleButton = await page.locator('button:has-text("Google"), button:has-text("Continue with Google"), [data-provider="google"]').first();
    const hasGoogleButton = await googleButton.count() > 0;
    
    if (hasGoogleButton) {
      console.log('   ✅ Google OAuth button found');
      
      // Test 2: Check OAuth redirect (without actually signing in)
      console.log('\n📍 Step 2: Testing OAuth redirect URL...');
      
      // Get the OAuth URL without clicking (to avoid actually signing in)
      const oauthUrl = await page.evaluate(() => {
        const button = document.querySelector('button:has-text("Google"), button:has-text("Continue with Google"), [data-provider="google"]');
        if (button) {
          // Try to find href or data attributes that might contain the OAuth URL
          return button.getAttribute('href') || button.getAttribute('data-href') || 'button-found-but-no-url';
        }
        return null;
      });
      
      if (oauthUrl && oauthUrl.includes('accounts.google.com')) {
        console.log('   ✅ OAuth URL is properly configured for Google');
      } else {
        console.log('   ⚠️  OAuth URL not found or not pointing to Google');
      }
    } else {
      console.log('   ❌ Google OAuth button not found');
      console.log('   → This might indicate Stack Auth is not properly initialized');
    }
  } catch (error) {
    console.log(`   ❌ Failed to load sign-in page: ${error.message}`);
    console.log('   → Make sure the development server is running (pnpm dev)');
  }

  // Test 3: Check auth-success page exists
  console.log('\n📍 Step 3: Testing auth-success page...');
  try {
    await page.goto('http://localhost:5173/auth-success', { 
      waitUntil: 'domcontentloaded',
      timeout: 5000 
    });
    
    const content = await page.textContent('body');
    if (content && !content.includes('404') && !content.includes('Not Found')) {
      console.log('   ✅ Auth-success page exists and loads');
    } else {
      console.log('   ❌ Auth-success page shows 404 or error');
    }
  } catch (error) {
    console.log(`   ❌ Auth-success page failed to load: ${error.message}`);
  }

  // Test 4: Check OAuth callback handler
  console.log('\n📍 Step 4: Testing OAuth callback handler...');
  try {
    await page.goto('http://localhost:5173/handler/oauth-callback', { 
      waitUntil: 'domcontentloaded',
      timeout: 5000 
    });
    
    // The callback should either show a Stack Auth handler or redirect
    const url = page.url();
    const content = await page.textContent('body');
    
    if (url.includes('oauth-callback') || content.includes('Stack') || content.includes('callback')) {
      console.log('   ✅ OAuth callback handler is responding');
    } else {
      console.log('   ⚠️  OAuth callback handler might not be properly configured');
    }
  } catch (error) {
    console.log(`   ❌ OAuth callback handler failed: ${error.message}`);
  }

  console.log('\n🎯 OAuth Flow Health Check Results:');
  console.log('\nIf you see mostly ✅ above, your OAuth flow should work correctly.');
  console.log('If you see ❌ or ⚠️, check the specific issues mentioned.');
  console.log('\n📝 To complete testing:');
  console.log('1. Start your dev server: pnpm dev');
  console.log('2. Visit: http://localhost:5173/handler/sign-in');
  console.log('3. Try signing in with Google');
  console.log('4. Verify you get redirected to /auth-success after login');
});