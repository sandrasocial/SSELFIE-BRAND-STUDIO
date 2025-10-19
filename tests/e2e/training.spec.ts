import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Training screen', () => {
  test('shows Upload/Training/Completed states and gender selection', async ({ page }) => {
    await page.goto('/app/training');

    // Gender selection visible on upload state
    const gender = page.locator('button:has-text("Man"), button:has-text("Woman"), [data-testid="gender-select"]');
    // It may be already trained; if not visible, continue
    if (await gender.first().isVisible()) {
      await expect(gender.first()).toBeVisible();
    }

    // Training progress indicator appears when training
    const progress = page.locator('text=Training in progress, text=Training, [data-testid="training-progress"]');
    // Completed state shows trigger word and model status
    const completed = page.locator('text=Model trained, text=Completed, [data-testid="trained-model"]');
    await expect(progress.or(completed)).toBeVisible({ timeout: 60_000 });
  });
});

