import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Maya Chat', () => {
  test('chat send, concept, generation, preview, save to gallery', async ({ page }) => {
    await page.goto('/app/maya');

    // Send message
    const input = page.locator('textarea, [contenteditable="true"], input[placeholder*="message" i]');
    await expect(input.first()).toBeVisible();
    await input.first().fill('Create an editorial portrait in Milan, minimalist backdrop.');
    const send = page.locator('button:has-text("Send"), button:has-text("Generate"), [data-testid="send-message"]');
    await send.first().click();

    // Concept card or generation tile appears
    const concept = page.locator('[data-testid="concept-card"], text=Concept');
    await expect(concept.first()).toBeVisible({ timeout: 60_000 });

    // If preview with heart button appears, save to gallery
    const heart = page.locator('button:has-text("Save"), [data-testid="heart-image"]');
    if (await heart.first().isVisible()) {
      await heart.first().click();
    }
  });
});

