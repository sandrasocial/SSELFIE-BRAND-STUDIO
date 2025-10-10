/**
 * Playwright Test Authentication Helper for Stack Auth
 * 
 * This helper provides authentication utilities for testing protected routes
 * in the SSELFIE Studio application.
 */

import { Page, BrowserContext } from '@playwright/test';

interface TestUser {
  email: string;
  password?: string;
  displayName?: string;
  stackAuthId?: string;
}

// Test user credentials - should match Stack Auth project setup
export const TEST_USERS: Record<string, TestUser> = {
  maya_tester: {
    email: 'maya.test@sselfie.ai',
    displayName: 'Maya Test User',
    stackAuthId: 'test-user-maya-123' // This would be set by Stack Auth
  },
  admin_user: {
    email: 'admin@sselfie.ai', 
    displayName: 'Admin Test User',
    stackAuthId: 'test-admin-456'
  }
};

/**
 * Attempt to authenticate with Stack Auth using the standard flow
 * This simulates the real user authentication process
 */
export async function authenticateWithStackAuth(
  page: Page, 
  testUser: TestUser,
  baseUrl: string
): Promise<boolean> {
  try {
    console.log(`🔐 Attempting to authenticate as ${testUser.email}...`);
    
    // Step 1: Go to sign-in page
    await page.goto(`${baseUrl}/handler/sign-in`, { waitUntil: 'networkidle' });
    
    // Step 2: Look for email input
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      console.log('📧 Found email input, filling...');
      await emailInput.fill(testUser.email);
      
      // Look for sign-in button
      const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Continue"), button[type="submit"]').first();
      
      if (await signInButton.isVisible({ timeout: 2000 })) {
        await signInButton.click();
        
        // Wait for authentication to complete
        await page.waitForTimeout(3000);
        
        // Check if we're now authenticated by trying to access a protected route
        await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' });
        
        const currentUrl = page.url();
        const isAuthSuccess = !currentUrl.includes('sign-in') && !currentUrl.includes('sign-up');
        
        if (isAuthSuccess) {
          console.log('✅ Authentication successful!');
          return true;
        } else {
          console.log('❌ Authentication failed - still on auth page');
          return false;
        }
      } else {
        console.log('❌ No sign-in button found');
        return false;
      }
    } else {
      console.log('❌ No email input found on sign-in page');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return false;
  }
}

/**
 * Set authentication cookies directly (for faster testing)
 * This bypasses the UI flow by setting the Stack Auth cookies directly
 */
export async function setAuthCookies(
  context: BrowserContext,
  testUser: TestUser,
  baseUrl: string
): Promise<void> {
  try {
    console.log(`🍪 Setting auth cookies for ${testUser.email}...`);
    
    // Create a mock JWT token (this would need to be a valid JWT in real tests)
    const mockJWT = createMockJWT(testUser);
    
    // Set Stack Auth cookies
    await context.addCookies([
      {
        name: 'stack-access',
        value: JSON.stringify(['mock-token-id', mockJWT]),
        domain: new URL(baseUrl).hostname,
        path: '/',
        httpOnly: true,
        secure: baseUrl.startsWith('https'),
        sameSite: 'Lax'
      }
    ]);
    
    console.log('✅ Auth cookies set successfully');
  } catch (error) {
    console.error('❌ Error setting auth cookies:', error);
  }
}

/**
 * Create a mock JWT token for testing purposes
 * Note: In real tests, you'd want to use the Stack Auth test API
 */
function createMockJWT(testUser: TestUser): string {
  // This is a mock JWT - in real tests you'd get this from Stack Auth's test API
  const header = btoa(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT'
  }));
  
  const payload = btoa(JSON.stringify({
    sub: testUser.stackAuthId || 'mock-stack-auth-id',
    email: testUser.email,
    displayName: testUser.displayName,
    iss: 'https://api.stack-auth.com/api/v1/projects/253d7343-a0d4-43a1-be5c-822f590d40be',
    aud: '253d7343-a0d4-43a1-be5c-822f590d40be',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000)
  }));
  
  // Mock signature (in real tests, this would be properly signed)
  const signature = 'mock-signature-for-testing';
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(page: Page, baseUrl: string): Promise<boolean> {
  try {
    // Try to access a protected route
    await page.goto(`${baseUrl}/api/user/profile`, { waitUntil: 'networkidle' });
    
    // Check response - if 401, not authenticated
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/user/profile')
    );
    
    return response.status() !== 401;
  } catch {
    return false;
  }
}

/**
 * Clear all authentication cookies and local storage
 */
export async function clearAuth(context: BrowserContext, page: Page): Promise<void> {
  try {
    // Clear cookies
    await context.clearCookies();
    
    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('🧹 Authentication cleared');
  } catch (error) {
    console.error('❌ Error clearing auth:', error);
  }
}

/**
 * Wait for authentication to complete (useful after login flows)
 */
export async function waitForAuthCompletion(page: Page, baseUrl: string, timeout = 10000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url();
    
    // If we're no longer on an auth page, authentication likely succeeded
    if (!currentUrl.includes('sign-in') && !currentUrl.includes('sign-up') && !currentUrl.includes('auth')) {
      return true;
    }
    
    await page.waitForTimeout(500);
  }
  
  return false;
}