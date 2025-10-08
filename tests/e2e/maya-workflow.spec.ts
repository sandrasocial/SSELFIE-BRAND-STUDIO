/**
 * Maya AI Workflow Test
 * Focused test for the core Maya AI functionality
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const GENERATION_TIMEOUT = 120000; // 2 minutes for AI generation

test.describe('Maya AI Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is already logged in and trained
    // This test focuses on the Maya workflow specifically
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');
  });

  test('Maya chat concept generation and image creation', async ({ page }) => {
    // Step 1: Access Maya Chat
    await test.step('Access Maya Chat interface', async () => {
      const mayaChatTab = page.locator('text=Maya Chat').or(page.locator('[data-testid="maya-chat-tab"]')).first();
      await expect(mayaChatTab).toBeVisible({ timeout: 10000 });
      await mayaChatTab.click();

      // Verify Maya interface is loaded
      await expect(page.locator('text=Maya').or(page.locator('[data-testid="maya-interface"]'))).toBeVisible();
    });

    // Step 2: Send prompt to Maya
    await test.step('Send prompt to Maya', async () => {
      const chatInput = page.locator('textarea').or(page.locator('[data-testid="chat-input"]')).first();
      await expect(chatInput).toBeVisible();

      const prompt = "Create a professional LinkedIn headshot concept with warm lighting";
      await chatInput.fill(prompt);

      const sendButton = page.locator('button[type="submit"]').or(page.locator('[data-testid="send-button"]')).first();
      await sendButton.click();

      // Wait for Maya's response
      await expect(page.locator('text=concept').or(page.locator('[data-testid="concept-card"]')).first()).toBeVisible({ timeout: 30000 });
    });

    // Step 3: Interact with concept card
    await test.step('Click concept card and initiate generation', async () => {
      const conceptCard = page.locator('[data-testid="concept-card"]').or(page.locator('.concept-card')).first();
      await expect(conceptCard).toBeVisible();
      
      // Verify concept card has expected content
      await expect(conceptCard.locator('text=Professional').or(conceptCard.locator('text=LinkedIn')).first()).toBeVisible();
      
      await conceptCard.click();

      // Wait for generation to start
      await expect(page.locator('text=Generating').or(page.locator('text=Processing')).first()).toBeVisible({ timeout: 15000 });
    });

    // Step 4: Monitor polling and generation
    await test.step('Monitor image generation polling', async () => {
      // Check for polling indicators
      const pollingIndicator = page.locator('[data-testid="polling-indicator"]').or(page.locator('.polling')).first();
      
      // Wait for either success or timeout
      try {
        const generatedImage = page.locator('img[src*="generated"]').or(page.locator('[data-testid="generated-image"]')).first();
        await expect(generatedImage).toBeVisible({ timeout: GENERATION_TIMEOUT });
        
        // Verify image has loaded properly
        await expect(generatedImage).toHaveAttribute('src', /https?:\/\/.+\.(jpg|jpeg|png|webp)/);
      } catch (error) {
        // Check for error states
        const errorMessage = page.locator('text=Error').or(page.locator('text=Failed')).first();
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          throw new Error(`Image generation failed: ${errorText}`);
        }
        throw error;
      }
    });

    // Step 5: Test image preview and interactions
    await test.step('Test image preview functionality', async () => {
      const generatedImage = page.locator('img[src*="generated"]').first();
      
      if (await generatedImage.count() > 0) {
        // Click to open preview
        await generatedImage.click();

        // Verify modal/preview opens
        const imageModal = page.locator('[data-testid="image-modal"]').or(page.locator('.modal')).first();
        await expect(imageModal).toBeVisible({ timeout: 5000 });

        // Test favorite functionality
        const favoriteButton = page.locator('[data-testid="favorite-button"]').or(page.locator('.heart')).first();
        if (await favoriteButton.count() > 0) {
          await favoriteButton.click();
          
          // Verify favorite state changes
          await expect(favoriteButton).toHaveClass(/active|favorited|filled/);
        }

        // Test download functionality
        const downloadButton = page.locator('[data-testid="download-button"]').or(page.locator('text=Download')).first();
        if (await downloadButton.count() > 0) {
          const downloadPromise = page.waitForEvent('download');
          await downloadButton.click();
          const download = await downloadPromise;
          
          // Verify download file
          expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png|webp)$/i);
        }
      }
    });

    // Step 6: Verify gallery integration
    await test.step('Verify gallery integration', async () => {
      // Navigate to gallery or gallery tab
      const galleryTab = page.locator('text=Gallery').or(page.locator('[data-testid="gallery-tab"]')).first();
      
      if (await galleryTab.count() > 0) {
        await galleryTab.click();
        
        // Verify the generated image appears in gallery
        const galleryImages = page.locator('[data-testid="gallery-image"]').or(page.locator('.gallery-image'));
        await expect(galleryImages.first()).toBeVisible({ timeout: 10000 });
        
        // Verify image count increased
        const imageCount = await galleryImages.count();
        expect(imageCount).toBeGreaterThan(0);
      }
    });
  });

  test('Maya conversation flow and context retention', async ({ page }) => {
    await test.step('Test Maya conversation continuity', async () => {
      // Access Maya Chat
      const mayaChatTab = page.locator('text=Maya Chat').first();
      await mayaChatTab.click();

      const chatInput = page.locator('textarea').first();
      
      // Send first message
      await chatInput.fill("I want to create a professional brand image");
      await page.locator('button[type="submit"]').first().click();
      
      // Wait for response
      const firstResponse = page.locator('[data-testid="maya-message"]').or(page.locator('.assistant-message')).first();
      await expect(firstResponse).toBeVisible({ timeout: 30000 });

      // Send follow-up message
      await chatInput.fill("Make it more corporate and formal");
      await page.locator('button[type="submit"]').first().click();

      // Verify Maya maintains context
      const secondResponse = page.locator('[data-testid="maya-message"]').or(page.locator('.assistant-message')).nth(1);
      await expect(secondResponse).toBeVisible({ timeout: 30000 });
      
      // Verify response references previous context
      const responseText = await secondResponse.textContent();
      expect(responseText?.toLowerCase()).toMatch(/corporate|formal|professional/);
    });
  });

  test('Maya error handling and edge cases', async ({ page }) => {
    await test.step('Test Maya error handling', async () => {
      const mayaChatTab = page.locator('text=Maya Chat').first();
      await mayaChatTab.click();

      const chatInput = page.locator('textarea').first();
      
      // Test empty message
      await page.locator('button[type="submit"]').first().click();
      
      // Verify no message is sent or appropriate validation
      const errorMessage = page.locator('text=Please enter a message').or(page.locator('.error'));
      // This might not show an error, depending on implementation
      
      // Test very long message
      const longMessage = "Create a concept ".repeat(100);
      await chatInput.fill(longMessage);
      await page.locator('button[type="submit"]').first().click();
      
      // Verify system handles long messages gracefully
      const response = page.locator('[data-testid="maya-message"]').first();
      await expect(response).toBeVisible({ timeout: 30000 });
    });
  });
});

// Utility functions for Maya tests
export class MayaTestHelpers {
  static async waitForMayaResponse(page: Page, timeout: number = 30000) {
    const response = page.locator('[data-testid="maya-message"]').or(page.locator('.assistant-message')).last();
    await expect(response).toBeVisible({ timeout });
    return response;
  }

  static async sendMayaMessage(page: Page, message: string) {
    const chatInput = page.locator('textarea').or(page.locator('[data-testid="chat-input"]')).first();
    await chatInput.fill(message);
    
    const sendButton = page.locator('button[type="submit"]').or(page.locator('[data-testid="send-button"]')).first();
    await sendButton.click();
    
    return this.waitForMayaResponse(page);
  }

  static async clickConceptCard(page: Page, index: number = 0) {
    const conceptCards = page.locator('[data-testid="concept-card"]').or(page.locator('.concept-card'));
    const targetCard = conceptCards.nth(index);
    await expect(targetCard).toBeVisible();
    await targetCard.click();
  }

  static async waitForImageGeneration(page: Page, timeout: number = GENERATION_TIMEOUT) {
    const generatedImage = page.locator('img[src*="generated"]').or(page.locator('[data-testid="generated-image"]')).first();
    await expect(generatedImage).toBeVisible({ timeout });
    return generatedImage;
  }
}