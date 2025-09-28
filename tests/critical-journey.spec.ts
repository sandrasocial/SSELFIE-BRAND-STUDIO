// Critical User Journey Test Suite
import { test, expect } from '@playwright/test';

// Test the complete user journey in isolation
test.describe('Core User Journey', () => {
  test('new user completes full journey', async ({ page }) => {
    // 1. Landing Page
    await test.step('Business Landing', async () => {
      await page.goto('/business');
      await expect(page).toHaveTitle(/SSELFIE/);
      const getStarted = page.getByRole('button', { name: /get started/i });
      await expect(getStarted).toBeVisible();
    });

    // 2. Checkout Process
    await test.step('Checkout Flow', async () => {
      await page.goto('/simple-checkout');
      await expect(page).toHaveURL(/checkout/);
      await expect(page.getByText(/choose your plan/i)).toBeVisible();
    });

    // 3. Training Flow
    await test.step('Training Process', async () => {
      await page.goto('/simple-training');
      await expect(page.getByText(/upload your photos/i)).toBeVisible();
    });

    // 4. Studio Access
    await test.step('Studio Access', async () => {
      await page.goto('/app');
      await expect(page.getByRole('navigation')).toBeVisible();
    });
  });
});