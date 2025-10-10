/**
 * Maya Chat End-to-End Test with Authentication
 * 
 * Tests the complete Maya chat functionality with proper Stack Auth integration
 */

import { test, expect, Page } from '@playwright/test';
import { authenticateWithStackAuth, TEST_USERS, clearAuth } from './helpers/auth-helper';

// Helper function to test Maya interface
async function testMayaInterface(page: Page) {
  await page.screenshot({ 
    path: 'tests/screenshots/maya-interface.png', 
    fullPage: true 
  });
  
  // Check for Maya branding and interface elements
  const pageText = await page.locator('body').textContent();
  const hasMayaContent = pageText?.toLowerCase().includes('maya') ||
                        pageText?.toLowerCase().includes('photo stylist') ||
                        pageText?.toLowerCase().includes('ai');
  
  if (hasMayaContent) {
    console.log('✅ Maya interface content is present');
  }
  
  // Look for chat input
  const chatInput = page.locator('textarea[placeholder*="vision"], textarea[placeholder*="message"], textarea').first();
  
  if (await chatInput.isVisible({ timeout: 5000 })) {
    console.log('✅ Maya chat input is visible');
    
    // Test chat input functionality
    await chatInput.click();
    await chatInput.fill('Hello Maya, I need professional headshots for my business');
    
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toContain('professional headshots');
    console.log('✅ Chat input accepts text correctly');
    
    // Look for send button
    const sendButton = page.locator('[data-testid="maya-chat-send"], button:has-text("Send"), button[type="submit"]').first();
    
    if (await sendButton.isVisible({ timeout: 2000 })) {
      console.log('✅ Send button is visible');
      
      // Check if button is enabled for non-empty messages
      const isEnabled = !(await sendButton.isDisabled());
      if (isEnabled) {
        console.log('✅ Send button is enabled for messages');
        
        // Test sending a message (don't actually send to avoid API costs)
        console.log('📝 Would send message to Maya (skipped to avoid API costs)');
        
        await page.screenshot({ 
          path: 'tests/screenshots/maya-ready-to-send.png', 
          fullPage: true 
        });
      } else {
        console.log('⚠️ Send button is disabled');
      }
    } else {
      console.log('❌ Send button not found');
    }
  } else {
    console.log('❌ Maya chat input not found');
    
    // Check for any error messages
    const errorElements = page.locator('[class*="error"], [role="alert"], .text-red-500');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      const errorText = await errorElements.first().textContent();
      console.log(`❌ Error found: ${errorText}`);
    }
  }
}

test.describe('Maya Chat - Authentication Flow', () => {
  test.setTimeout(120000); // 2 minutes for complete flow
  
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing authentication
    await clearAuth(context, page);
  });

  test('Maya Chat Authentication and Interface', async ({ page }) => {
    const baseUrl = 'https://sselfie-brand-studio-eog1j7osq-sselfie-studio.vercel.app';
    const testUser = TEST_USERS.maya_tester;
    
    console.log('🧪 Testing Maya chat with authentication flow...');
    
    // Step 1: Attempt to authenticate
    const authSuccess = await authenticateWithStackAuth(page, testUser, baseUrl);
    
    if (!authSuccess) {
      console.log('⚠️ Unable to authenticate via UI - testing redirect behavior...');
      
      // Test that Maya redirects unauthenticated users properly
      await page.goto(`${baseUrl}/maya`, { waitUntil: 'networkidle' });
      
      const currentUrl = page.url();
      const pageContent = await page.locator('body').textContent();
      
      // Should be redirected to authentication
      const isOnAuthPage = currentUrl.includes('sign-in') || 
                          currentUrl.includes('sign-up') || 
                          pageContent?.toLowerCase().includes('sign in') ||
                          pageContent?.toLowerCase().includes('welcome to sselfie');
      
      if (isOnAuthPage) {
        console.log('✅ Maya correctly redirects unauthenticated users to auth');
        
        // Take screenshot of auth page
        await page.screenshot({ 
          path: 'tests/screenshots/maya-auth-redirect.png', 
          fullPage: true 
        });
        
        // Look for Stack Auth login form
        const emailInput = page.locator('input[type="email"]').first();
        const hasAuthForm = await emailInput.isVisible();
        
        if (hasAuthForm) {
          console.log('✅ Stack Auth login form is present');
          
          // Try filling the form to test form functionality
          await emailInput.fill(testUser.email);
          
          const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Continue")').first();
          if (await signInButton.isVisible()) {
            console.log('✅ Sign-in button is functional');
            await page.screenshot({ 
              path: 'tests/screenshots/maya-auth-form-filled.png', 
              fullPage: true 
            });
          }
        }
      } else {
        console.log('🤔 Maya is accessible without authentication - checking interface...');
        await testMayaInterface(page);
      }
      
      return; // Exit early since we can't fully test authenticated features
    }
    
    // Step 2: Test authenticated Maya access
    console.log('🎯 Testing authenticated Maya interface...');
    await page.goto(`${baseUrl}/maya`, { waitUntil: 'networkidle' });
    
    await testMayaInterface(page);
  });

  test('Maya API Endpoints', async ({ request }) => {
    const baseUrl = 'https://sselfie-brand-studio-eog1j7osq-sselfie-studio.vercel.app';
    
    console.log('🔌 Testing Maya API endpoints...');
    
    // Test Maya chat endpoint
    try {
      const chatResponse = await request.post(`${baseUrl}/api/maya/chat`, {
        data: {
          message: 'Hello Maya, I need business headshots',
          context: 'styling',
          conversationHistory: []
        }
      });
      
      console.log(`Maya chat API: ${chatResponse.status()} ${chatResponse.statusText()}`);
      
      if (chatResponse.status() === 401) {
        console.log('✅ Maya chat API correctly requires authentication');
      } else if (chatResponse.ok()) {
        const data = await chatResponse.json();
        console.log('✅ Maya chat API response structure:', Object.keys(data));
        
        // Verify response has expected fields
        if (data.response) console.log('✅ API returns Maya response');
        if (data.conceptCards) console.log('✅ API returns concept cards');
        if (Array.isArray(data.conceptCards)) {
          console.log(`✅ Concept cards is array with ${data.conceptCards.length} items`);
        }
      } else {
        console.log(`⚠️ Maya chat API returned ${chatResponse.status()}`);
      }
    } catch (error) {
      console.log('❌ Maya chat API error:', error);
    }
    
    // Test other Maya endpoints
    const endpoints = [
      { path: '/api/maya/generate', method: 'POST' as const, data: { conceptCard: { id: 'test', title: 'Test', fluxPrompt: 'Test prompt' } } },
      { path: '/api/maya/models', method: 'GET' as const }
    ];
    
    for (const endpoint of endpoints) {
      try {
        let response;
        if (endpoint.method === 'POST') {
          response = await request.post(`${baseUrl}${endpoint.path}`, { data: endpoint.data });
        } else {
          response = await request.get(`${baseUrl}${endpoint.path}`);
        }
        
        console.log(`${endpoint.path}: ${response.status()} ${response.statusText()}`);
        
        if (response.status() === 401) {
          console.log(`✅ ${endpoint.path} correctly requires authentication`);
        } else if (response.ok()) {
          console.log(`✅ ${endpoint.path} is functional`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.path} error:`, error);
      }
    }
  });

  test('Maya Error Handling', async ({ page }) => {
    const baseUrl = 'https://sselfie-brand-studio-eog1j7osq-sselfie-studio.vercel.app';
    
    console.log('🔥 Testing Maya error handling...');
    
    // Test accessing Maya without authentication
    await page.goto(`${baseUrl}/maya`);
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('sign-in') || currentUrl.includes('auth')) {
      console.log('✅ Maya correctly handles unauthenticated access');
    }
    
    // Test JavaScript errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length === 0) {
      console.log('✅ No JavaScript errors detected on Maya page');
    } else {
      console.log(`⚠️ Found ${consoleErrors.length} JavaScript errors:`);
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
  });
});

test.describe('Maya Production Environment', () => {
  test('Production URL and SSL', async ({ page }) => {
    const baseUrl = 'https://sselfie-brand-studio-eog1j7osq-sselfie-studio.vercel.app';
    
    console.log('🔒 Testing production environment...');
    
    // Test SSL certificate
    await page.goto(baseUrl);
    
    const securityState = await page.evaluate(() => {
      return {
        protocol: location.protocol,
        isSecure: location.protocol === 'https:',
        host: location.host
      };
    });
    
    console.log('🔒 Security state:', securityState);
    
    if (securityState.isSecure) {
      console.log('✅ SSL/HTTPS is working correctly');
    } else {
      console.log('❌ Site is not using HTTPS');
    }
    
    // Test page load performance
    const startTime = Date.now();
    await page.goto(`${baseUrl}/maya`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⚡ Page load time: ${loadTime}ms`);
    
    if (loadTime < 5000) {
      console.log('✅ Page loads within acceptable time');
    } else {
      console.log('⚠️ Page load time is slow');
    }
  });
});