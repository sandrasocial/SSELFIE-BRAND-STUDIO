import { test, expect } from '@playwright/test';

/**
 * Critical User Journey Test Suite
 * Tests the essential user flow from landing to app usage
 */

test.describe('Critical User Journey', () => {
  test('complete user journey', async ({ page }) => {
    // 1. Business Landing
    await test.step('Business Landing Page', async () => {
      await page.goto('/business');
      await expect(page.getByRole('heading', { name: /sselfie/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    });

    // 2. Checkout Flow
    await test.step('Checkout Process', async () => {
      await page.getByRole('button', { name: /get started/i }).click();
      await expect(page).toHaveURL(/checkout/);
      // Add checkout form tests
    });

    // 3. Training Flow
    await test.step('Training Process', async () => {
      await page.goto('/simple-training');
      await expect(page.getByText(/upload your photos/i)).toBeVisible();
      // Add training flow tests
    });

    // 4. App Studio Access
    await test.step('App Studio Access', async () => {
      await page.goto('/app');
      await expect(page.getByRole('navigation')).toBeVisible();
      // Add studio interaction tests
    });

    // 5. Gallery Access
    await test.step('Gallery Access', async () => {
      await page.getByRole('link', { name: /gallery/i }).click();
      await expect(page.getByText(/my photos/i)).toBeVisible();
      // Add gallery interaction tests
    });
  });
});