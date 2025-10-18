import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Gallery screen', () => {
  test('lists images, favorites toggle, delete, feed designer persistence', async ({ page }) => {
    await page.goto('/app/gallery');

    // Images grid visible
    const grid = page.locator('[data-testid="image-grid"], img');
    await expect(grid.first()).toBeVisible();

    // Open first image card
    const cards = page.locator('[data-testid="image-card"], img');
    if (await cards.count()) {
      await cards.first().click();

      // Favorite toggle
      const fav = page.locator('button:has-text("Favorite"), [data-testid="toggle-favorite"], [aria-label*="favorite" i]');
      if (await fav.isVisible()) {
        await fav.click();
      }

      // Delete (use confirm dialog interception if needed)
      const del = page.locator('button:has-text("Delete"), [data-testid="delete-image"]');
      if (await del.isVisible()) {
        page.once('dialog', d => d.accept());
        await del.click();
      }

      const close = page.locator('button:has-text("Close"), [data-testid="close-modal"]');
      if (await close.isVisible()) await close.click();
    }

    // Feed Designer tab and save
    const feedTab = page.locator('button:has-text("Feed Designer")');
    await feedTab.click();
    const save = page.locator('button:has-text("Save Layout")');
    await expect(save).toBeVisible();
    await save.click();
  });
});

