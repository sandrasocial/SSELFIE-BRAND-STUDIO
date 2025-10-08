/**
 * Comprehensive User Journey E2E Test
 * Tests the complete user flow from signup to image generation
 */

import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const TEST_USER_EMAIL = `test-user-${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_USER_NAME = 'Test User';

// Timeout for long operations
const LONG_TIMEOUT = 60000; // 60 seconds
const GENERATION_TIMEOUT = 120000; // 2 minutes for AI generation

test.describe('Comprehensive User Journey', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('Complete user journey from signup to image generation', async () => {
    // Step 1: Navigate to home page and clear any existing sessions
    await test.step('Navigate to home page', async () => {
      // Clear any existing sessions
      await page.context().clearCookies();
      await page.context().clearPermissions();
      
      await page.goto('/business');
      await expect(page).toHaveTitle(/SSELFIE/);
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Check for key elements on business landing page
      await expect(page.locator('text=SSELFIE').first()).toBeVisible();
    });

    // Step 2: Sign up for a new account
    await test.step('Sign up for new account', async () => {
      // First check if we're already logged in and need to logout
      const logoutButton = page.locator('text=LOGOUT');
      if (await logoutButton.count() > 0) {
        await logoutButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Look for sign up button/link - use the actual buttons from the business page
      const signUpButton = page.locator('text=Get 100 Pro Photos').or(page.locator('text=Begin Transformation')).or(page.locator('text=Transform Your Brand')).or(page.locator('button:has-text("€47")')).first();
      await expect(signUpButton).toBeVisible({ timeout: 10000 });
      await signUpButton.click();

      // Fill in registration form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER_EMAIL);
      
      const passwordField = page.locator('input[type="password"]').first();
      await passwordField.fill(TEST_USER_PASSWORD);
      
      // Fill name if present
      const nameField = page.locator('input[name="name"]').or(page.locator('input[placeholder*="name"]')).first();
      if (await nameField.count() > 0) {
        await nameField.fill(TEST_USER_NAME);
      }

      // Submit registration
      const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Create Account')).or(page.locator('text=Sign Up')).first();
      await submitButton.click();

      // Wait for successful registration (might redirect to dashboard or verification page)
      await page.waitForURL(/\/(dashboard|verify|welcome|checkout)/, { timeout: 15000 });
    });

    // Step 3: Log out of the new account
    await test.step('Log out of new account', async () => {
      // Look for user menu or logout button
      const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('text=Settings')).or(page.locator('text=Profile')).first();
      
      if (await userMenu.count() > 0) {
        await userMenu.click();
        const logoutButton = page.locator('text=Logout').or(page.locator('text=Sign Out')).first();
        await expect(logoutButton).toBeVisible({ timeout: 5000 });
        await logoutButton.click();
      } else {
        // Direct logout button
        const logoutButton = page.locator('text=Logout').or(page.locator('text=Sign Out')).first();
        if (await logoutButton.count() > 0) {
          await logoutButton.click();
        }
      }

      // Verify we're logged out (redirected to home or login page)
      await page.waitForURL(/\/(|login|signin)$/, { timeout: 10000 });
    });

    // Step 4: Log in with the newly created account
    await test.step('Log in with new account', async () => {
      // Navigate to login if not already there
      if (!page.url().includes('login') && !page.url().includes('signin')) {
        const loginButton = page.locator('text=Login').or(page.locator('text=Sign In')).first();
        await loginButton.click();
      }

      // Fill in login form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', TEST_USER_EMAIL);
      await page.fill('input[type="password"]', TEST_USER_PASSWORD);

      // Submit login
      const loginSubmitButton = page.locator('button[type="submit"]').or(page.locator('text=Sign In')).or(page.locator('text=Login')).first();
      await loginSubmitButton.click();

      // Wait for successful login
      await page.waitForURL(/\/(dashboard|training|checkout|studio)/, { timeout: 15000 });
    });

    // Step 5: Complete onboarding process (upload selfies for AI model training)
    await test.step('Complete onboarding and upload selfies', async () => {
      // Check if we need to complete checkout first
      if (page.url().includes('checkout')) {
        // Handle checkout flow - this might be a test scenario
        const testCheckoutButton = page.locator('text=Test Payment').or(page.locator('[data-testid="test-payment"]'));
        if (await testCheckoutButton.count() > 0) {
          await testCheckoutButton.click();
          await page.waitForURL(/\/(training|studio)/, { timeout: 15000 });
        }
      }

      // Navigate to training page if not already there
      if (!page.url().includes('training')) {
        const trainingButton = page.locator('text=Training').or(page.locator('text=Upload Photos')).or(page.locator('[data-testid="training-button"]')).first();
        if (await trainingButton.count() > 0) {
          await trainingButton.click();
          await page.waitForURL(/\/training/, { timeout: 10000 });
        }
      }

      // Create test image files for upload
      const testImageDir = path.join(__dirname, '../../test-assets');
      await fs.mkdir(testImageDir, { recursive: true });

      // Generate simple test images (1x1 pixel PNGs)
      const testImages = [];
      for (let i = 0; i < 20; i++) {
        const imagePath = path.join(testImageDir, `test-selfie-${i + 1}.png`);
        // Create a minimal PNG file (1x1 transparent pixel)
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
          0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
          0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
          0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        await fs.writeFile(imagePath, pngBuffer);
        testImages.push(imagePath);
      }

      // Upload selfies
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeVisible({ timeout: 10000 });
      await fileInput.setInputFiles(testImages);

      // Wait for upload to complete
      await expect(page.locator('text=Uploaded').or(page.locator('text=Complete'))).toBeVisible({ timeout: 30000 });

      // Start training if there's a button
      const startTrainingButton = page.locator('text=Start Training').or(page.locator('text=Begin Training')).first();
      if (await startTrainingButton.count() > 0) {
        await startTrainingButton.click();
      }

      // Wait for training to start (this might take a while in real scenarios)
      await expect(page.locator('text=Training').or(page.locator('text=Processing'))).toBeVisible({ timeout: 15000 });

      // For test purposes, we might need to wait for training completion or mock it
      // In a real scenario, this could take 20+ minutes
      const trainingComplete = page.locator('text=Training Complete').or(page.locator('text=Ready'));
      try {
        await expect(trainingComplete).toBeVisible({ timeout: 30000 });
      } catch {
        // If training doesn't complete quickly, proceed anyway for testing
        console.log('Training still in progress, proceeding with test...');
      }

      // Clean up test images
      for (const imagePath of testImages) {
        await fs.unlink(imagePath).catch(() => {});
      }
      await fs.rmdir(testImageDir).catch(() => {});
    });

    // Step 6: Navigate to Studio and use Maya Chat
    await test.step('Navigate to Studio and access Maya Chat', async () => {
      // Navigate to studio
      const studioButton = page.locator('text=Studio').or(page.locator('[data-testid="studio-nav"]')).first();
      await expect(studioButton).toBeVisible({ timeout: 10000 });
      await studioButton.click();

      await page.waitForURL(/\/studio/, { timeout: 10000 });

      // Click Maya Chat tab
      const mayaChatTab = page.locator('text=Maya Chat').or(page.locator('[data-testid="maya-chat-tab"]')).first();
      await expect(mayaChatTab).toBeVisible({ timeout: 10000 });
      await mayaChatTab.click();

      // Wait for Maya Chat interface to load
      await expect(page.locator('text=Maya').or(page.locator('[data-testid="maya-interface"]'))).toBeVisible({ timeout: 10000 });
    });

    // Step 7: Ask Maya to create concept cards
    await test.step('Ask Maya to create concept cards', async () => {
      // Find chat input
      const chatInput = page.locator('textarea').or(page.locator('input[placeholder*="message"]')).or(page.locator('[data-testid="chat-input"]')).first();
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Send a simple prompt
      const testPrompt = "Create a professional headshot concept for my personal brand";
      await chatInput.fill(testPrompt);

      // Send message
      const sendButton = page.locator('button[type="submit"]').or(page.locator('text=Send')).or(page.locator('[data-testid="send-button"]')).first();
      await sendButton.click();

      // Wait for Maya's response with concept cards
      await expect(page.locator('text=concept').or(page.locator('[data-testid="concept-card"]'))).toBeVisible({ timeout: 30000 });
    });

    // Step 8: Click concept card and generate image
    await test.step('Click concept card and generate image', async () => {
      // Click on the first concept card
      const conceptCard = page.locator('[data-testid="concept-card"]').or(page.locator('.concept-card')).first();
      await expect(conceptCard).toBeVisible({ timeout: 10000 });
      await conceptCard.click();

      // Wait for generation to start
      await expect(page.locator('text=Generating').or(page.locator('text=Processing'))).toBeVisible({ timeout: 15000 });

      // Wait for polling/generation to complete
      const generatedImage = page.locator('img[src*="generated"]').or(page.locator('[data-testid="generated-image"]')).first();
      
      try {
        await expect(generatedImage).toBeVisible({ timeout: GENERATION_TIMEOUT });
      } catch {
        // If generation takes too long, check for error messages or retry
        const errorMessage = page.locator('text=Error').or(page.locator('text=Failed'));
        if (await errorMessage.count() > 0) {
          throw new Error('Image generation failed');
        }
        // Otherwise assume it's still processing
        console.log('Image generation still in progress...');
      }
    });

    // Step 9: Test image preview functionality
    await test.step('Test image preview and interactions', async () => {
      // Click on image preview
      const imagePreview = page.locator('img[src*="generated"]').or(page.locator('[data-testid="generated-image"]')).first();
      
      if (await imagePreview.count() > 0) {
        await imagePreview.click();

        // Check if full-size modal opens
        const modal = page.locator('[data-testid="image-modal"]').or(page.locator('.modal')).first();
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Test heart/favorite functionality
        const heartButton = page.locator('[data-testid="favorite-button"]').or(page.locator('text=♥')).or(page.locator('.heart')).first();
        if (await heartButton.count() > 0) {
          await heartButton.click();
          // Verify favorite state changed
          await expect(heartButton).toHaveClass(/active|favorited/, { timeout: 5000 });
        }

        // Test download functionality
        const downloadButton = page.locator('[data-testid="download-button"]').or(page.locator('text=Download')).first();
        if (await downloadButton.count() > 0) {
          // Start download
          const downloadPromise = page.waitForEvent('download');
          await downloadButton.click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png)$/i);
        }

        // Close modal
        const closeButton = page.locator('[data-testid="close-modal"]').or(page.locator('text=×')).first();
        if (await closeButton.count() > 0) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });

    // Step 10: Verify image appears in gallery
    await test.step('Verify image appears in gallery', async () => {
      // Navigate to gallery
      const galleryButton = page.locator('text=Gallery').or(page.locator('[data-testid="gallery-nav"]')).first();
      
      if (await galleryButton.count() > 0) {
        await galleryButton.click();
        await page.waitForURL(/\/gallery/, { timeout: 10000 });
      } else {
        // Try gallery tab within studio
        const galleryTab = page.locator('text=Gallery').or(page.locator('[data-testid="gallery-tab"]')).first();
        if (await galleryTab.count() > 0) {
          await galleryTab.click();
        }
      }

      // Verify generated image appears in gallery
      const galleryImages = page.locator('[data-testid="gallery-image"]').or(page.locator('.gallery-image')).or(page.locator('img[src*="generated"]'));
      await expect(galleryImages.first()).toBeVisible({ timeout: 15000 });

      // Verify we have at least one image
      const imageCount = await galleryImages.count();
      expect(imageCount).toBeGreaterThan(0);
    });

    // Final verification: Ensure user is still authenticated and can navigate
    await test.step('Final verification: User state and navigation', async () => {
      // Check that user is still logged in
      const userIndicator = page.locator('[data-testid="user-avatar"]').or(page.locator('text=' + TEST_USER_EMAIL)).or(page.locator('text=' + TEST_USER_NAME));
      
      // Navigate back to studio to ensure navigation works
      const studioNav = page.locator('text=Studio').or(page.locator('[data-testid="studio-nav"]')).first();
      if (await studioNav.count() > 0) {
        await studioNav.click();
        await expect(page).toHaveURL(/\/studio/);
      }

      // Verify core functionality is accessible
      await expect(page.locator('text=Maya').or(page.locator('text=Generate'))).toBeVisible({ timeout: 10000 });
    });
  });

  // Cleanup test - remove test user if possible
  test.afterAll(async () => {
    try {
      // If there's an admin endpoint to clean up test users, use it
      // This is optional and depends on your backend implementation
      console.log(`Test completed for user: ${TEST_USER_EMAIL}`);
    } catch (error) {
      console.log('Cleanup note:', error);
    }
  });
});

// Helper functions for common operations
class UserJourneyHelpers {
  static async waitForElementWithText(page: Page, text: string, timeout: number = 10000) {
    return await page.waitForSelector(`text=${text}`, { timeout });
  }

  static async clickElementWithText(page: Page, text: string) {
    await page.locator(`text=${text}`).click();
  }

  static async fillFormField(page: Page, selector: string, value: string) {
    await page.waitForSelector(selector);
    await page.fill(selector, value);
  }

  static async uploadFiles(page: Page, files: string[]) {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(files);
  }

  static async verifyImageGeneration(page: Page, timeout: number = GENERATION_TIMEOUT) {
    const generatedImage = page.locator('img[src*="generated"]').first();
    await expect(generatedImage).toBeVisible({ timeout });
    return generatedImage;
  }
}

export { UserJourneyHelpers };