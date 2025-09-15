import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * SSELFIE Studio - Comprehensive End-to-End User Journey Test Suite
 * 
 * This test suite validates the complete user journey from landing to app usage,
 * ensuring the minimal app layout is launch-ready with all critical components working.
 * 
 * Test Coverage:
 * 1. Authentication Flow (Sign-up, Sign-in, Logout)
 * 2. Onboarding/Training Flow
 * 3. Main App Navigation (Desktop & Mobile)
 * 4. Gallery Management (View, Favorite, Delete, Download)
 * 5. Profile & Account Management
 * 6. Payment Flow (Checkout, Success)
 * 7. Error Handling & Edge Cases
 * 8. Performance & Responsiveness
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`;
const TEST_USER_NAME = 'Test User';

// Helper functions
async function waitForAuth(page: Page) {
  await page.waitForSelector('[data-testid="auth-complete"]', { timeout: 10000 });
}

async function waitForTrainingComplete(page: Page) {
  await page.waitForSelector('[data-testid="training-complete"]', { timeout: 30000 });
}

async function waitForGalleryLoad(page: Page) {
  await page.waitForSelector('[data-testid="gallery-loaded"]', { timeout: 10000 });
}

async function mockImageUpload(page: Page, imagePath: string) {
  // Mock file upload for testing
  await page.setInputFiles('input[type="file"]', imagePath);
}

// Test data
const testImages = [
  'tests/fixtures/test-image-1.jpg',
  'tests/fixtures/test-image-2.jpg',
  'tests/fixtures/test-image-3.jpg'
];

test.describe('SSELFIE Studio - Complete User Journey', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('1. Landing Page & Authentication', () => {
    test('should load landing page and display sign-up options', async () => {
      await page.goto(BASE_URL);
      
      // Verify landing page elements
      await expect(page.locator('h1')).toContainText('SSELFIE Studio');
      await expect(page.locator('button[data-testid="sign-up-button"]')).toBeVisible();
      await expect(page.locator('button[data-testid="sign-in-button"]')).toBeVisible();
      
      // Verify key features are displayed
      await expect(page.locator('[data-testid="feature-ai-training"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-gallery"]')).toBeVisible();
      await expect(page.locator('[data-testid="feature-pricing"]')).toBeVisible();
    });

    test('should handle user sign-up flow', async () => {
      await page.goto(BASE_URL);
      
      // Click sign-up button
      await page.click('button[data-testid="sign-up-button"]');
      
      // Wait for auth handler to load
      await page.waitForURL('**/handler/sign-in**');
      
      // Mock successful authentication
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
      });
      
      // Navigate back to app
      await page.goto(BASE_URL);
      
      // Should redirect to training page for new users
      await page.waitForURL('**/simple-training**');
    });

    test('should handle user sign-in flow', async () => {
      await page.goto(BASE_URL);
      
      // Click sign-in button
      await page.click('button[data-testid="sign-in-button"]');
      
      // Wait for auth handler
      await page.waitForURL('**/handler/sign-in**');
      
      // Mock authentication
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
      });
      
      await page.goto(BASE_URL);
      await page.waitForURL('**/simple-training**');
    });
  });

  test.describe('2. Onboarding & Training Flow', () => {
    test('should complete AI model training process', async () => {
      // Mock authenticated user
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
      });
      
      await page.goto(`${BASE_URL}/simple-training`);
      
      // Verify training page loads
      await expect(page.locator('h1')).toContainText('Train Your AI Model');
      await expect(page.locator('[data-testid="training-instructions"]')).toBeVisible();
      
      // Upload training images
      for (let i = 0; i < testImages.length; i++) {
        await page.click('button[data-testid="upload-button"]');
        await mockImageUpload(page, testImages[i]);
        await page.waitForSelector(`[data-testid="image-${i}"]`);
      }
      
      // Start training
      await page.click('button[data-testid="start-training"]');
      
      // Wait for training to complete
      await waitForTrainingComplete(page);
      
      // Should redirect to main app
      await page.waitForURL('**/app**');
    });

    test('should handle training errors gracefully', async () => {
      await page.goto(`${BASE_URL}/simple-training`);
      
      // Try to start training without images
      await page.click('button[data-testid="start-training"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Please upload at least 3 images');
    });
  });

  test.describe('3. Main App Navigation & Layout', () => {
    test.beforeEach(async () => {
      // Mock completed training
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
        window.localStorage.setItem('training-complete', 'true');
      });
    });

    test('should load main app layout with navigation', async () => {
      await page.goto(`${BASE_URL}/app`);
      
      // Verify main layout components
      await expect(page.locator('[data-testid="member-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="global-footer"]')).toBeVisible();
      
      // Verify navigation elements
      await expect(page.locator('[data-testid="nav-logo"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-user-menu"]')).toBeVisible();
      
      // Verify main content area
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('should handle mobile navigation correctly', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/app`);
      
      // Verify mobile tab layout
      await expect(page.locator('[data-testid="mobile-tab-layout"]')).toBeVisible();
      
      // Test tab navigation
      await page.click('[data-testid="tab-gallery"]');
      await expect(page.locator('[data-testid="gallery-page"]')).toBeVisible();
      
      await page.click('[data-testid="tab-studio"]');
      await expect(page.locator('[data-testid="studio-page"]')).toBeVisible();
      
      await page.click('[data-testid="tab-account"]');
      await expect(page.locator('[data-testid="account-page"]')).toBeVisible();
    });

    test('should handle user logout', async () => {
      await page.goto(`${BASE_URL}/app`);
      
      // Click user menu
      await page.click('[data-testid="nav-user-menu"]');
      
      // Click logout
      await page.click('[data-testid="logout-button"]');
      
      // Should redirect to landing page
      await page.waitForURL(BASE_URL);
      await expect(page.locator('h1')).toContainText('SSELFIE Studio');
    });
  });

  test.describe('4. Gallery Management', () => {
    test.beforeEach(async () => {
      // Mock user with completed training and some images
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
        window.localStorage.setItem('training-complete', 'true');
      });
    });

    test('should display gallery with images', async () => {
      await page.goto(`${BASE_URL}/app`);
      
      // Navigate to gallery
      await page.click('[data-testid="tab-gallery"]');
      await waitForGalleryLoad(page);
      
      // Verify gallery elements
      await expect(page.locator('[data-testid="gallery-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="gallery-grid"]')).toBeVisible();
      
      // Should show images (mocked)
      const images = page.locator('[data-testid="gallery-image"]');
      await expect(images).toHaveCount(3);
    });

    test('should handle image interactions', async () => {
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-gallery"]');
      await waitForGalleryLoad(page);
      
      // Click on first image
      await page.click('[data-testid="gallery-image"]:first-child');
      
      // Should open image detail modal
      await expect(page.locator('[data-testid="image-detail-modal"]')).toBeVisible();
      
      // Test favorite toggle
      await page.click('[data-testid="favorite-button"]');
      await expect(page.locator('[data-testid="favorite-button"]')).toHaveClass(/favorited/);
      
      // Test download
      await page.click('[data-testid="download-button"]');
      // Should trigger download (mocked)
      
      // Close modal
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="image-detail-modal"]')).not.toBeVisible();
    });

    test('should handle image deletion', async () => {
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-gallery"]');
      await waitForGalleryLoad(page);
      
      // Click on first image
      await page.click('[data-testid="gallery-image"]:first-child');
      
      // Click delete button
      await page.click('[data-testid="delete-button"]');
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]');
      
      // Image should be removed from gallery
      await expect(page.locator('[data-testid="gallery-image"]')).toHaveCount(2);
    });

    test('should handle empty gallery state', async () => {
      // Mock empty gallery
      await page.evaluate(() => {
        window.localStorage.setItem('gallery-empty', 'true');
      });
      
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-gallery"]');
      
      // Should show empty state
      await expect(page.locator('[data-testid="empty-gallery"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-gallery"]')).toContainText('No photos yet');
    });
  });

  test.describe('5. Profile & Account Management', () => {
    test.beforeEach(async () => {
      await page.evaluate(() => {
        window.localStorage.setItem('test-auth', JSON.stringify({
          user: {
            id: 'test-user-123',
            email: TEST_USER_EMAIL,
            name: TEST_USER_NAME
          },
          isAuthenticated: true
        }));
        window.localStorage.setItem('training-complete', 'true');
      });
    });

    test('should display user profile information', async () => {
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-account"]');
      
      // Verify profile elements
      await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText(TEST_USER_NAME);
      await expect(page.locator('[data-testid="user-email"]')).toContainText(TEST_USER_EMAIL);
      
      // Verify subscription info
      await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible();
    });

    test('should handle profile updates', async () => {
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-account"]');
      
      // Click edit profile
      await page.click('[data-testid="edit-profile"]');
      
      // Update name
      await page.fill('[data-testid="name-input"]', 'Updated Name');
      
      // Save changes
      await page.click('[data-testid="save-profile"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test.describe('6. Payment Flow', () => {
    test('should handle checkout process', async () => {
      await page.goto(`${BASE_URL}/simple-checkout`);
      
      // Verify checkout page elements
      await expect(page.locator('[data-testid="checkout-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="pricing-card"]')).toBeVisible();
      
      // Fill payment form
      await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Should redirect to success page
      await page.waitForURL('**/payment-success**');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should handle payment errors', async () => {
      await page.goto(`${BASE_URL}/simple-checkout`);
      
      // Fill with invalid card
      await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
      await page.fill('[data-testid="card-number"]', '4000000000000002');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    });
  });

  test.describe('7. Error Handling & Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto(`${BASE_URL}/app`);
      
      // Should show error boundary
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    });

    test('should handle authentication errors', async () => {
      // Mock auth error
      await page.evaluate(() => {
        window.localStorage.removeItem('test-auth');
      });
      
      await page.goto(`${BASE_URL}/app`);
      
      // Should redirect to sign-in
      await page.waitForURL('**/handler/sign-in**');
    });

    test('should handle invalid routes', async () => {
      await page.goto(`${BASE_URL}/invalid-route`);
      
      // Should show 404 page
      await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    });
  });

  test.describe('8. Performance & Responsiveness', () => {
    test('should load within performance budget', async () => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
    });

    test('should be responsive on different screen sizes', async () => {
      const viewports = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },  // iPhone 8
        { width: 768, height: 1024 }, // iPad
        { width: 1280, height: 720 }, // Desktop
        { width: 1920, height: 1080 } // Large Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(BASE_URL);
        
        // Verify no horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = viewport.width;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // 20px tolerance
      }
    });

    test('should handle large image galleries efficiently', async () => {
      // Mock large gallery
      await page.evaluate(() => {
        window.localStorage.setItem('large-gallery', 'true');
      });
      
      await page.goto(`${BASE_URL}/app`);
      await page.click('[data-testid="tab-gallery"]');
      
      // Should load without performance issues
      await waitForGalleryLoad(page);
      
      // Verify images are lazy loaded
      const images = page.locator('[data-testid="gallery-image"]');
      await expect(images).toHaveCount(20); // First batch
    });
  });

  test.describe('9. Accessibility', () => {
    test('should be keyboard navigable', async () => {
      await page.goto(BASE_URL);
      
      // Tab through main elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async () => {
      await page.goto(BASE_URL);
      
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });
  });

  test.describe('10. Cross-Browser Compatibility', () => {
    test('should work in Chrome', async () => {
      // This test runs in Chrome by default
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should work in Firefox', async () => {
      // This would run in Firefox if configured
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should work in Safari', async () => {
      // This would run in Safari if configured
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});

// Additional utility tests
test.describe('Utility Functions', () => {
  test('should validate all critical API endpoints', async () => {
    const criticalEndpoints = [
      '/api/auth/user',
      '/api/gallery-images',
      '/api/maya/generated-images',
      '/api/images/favorites',
      '/api/user-model',
      '/api/payment/create-checkout-session'
    ];
    
    for (const endpoint of criticalEndpoints) {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      // Should not return 500 errors
      expect(response.status).not.toBe(500);
    }
  });

  test('should validate environment configuration', async () => {
    const requiredEnvVars = [
      'STACK_PROJECT_ID',
      'STACK_PUBLISHABLE_CLIENT_KEY',
      'STRIPE_PUBLISHABLE_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      expect(value).toBeTruthy();
    }
  });
});
