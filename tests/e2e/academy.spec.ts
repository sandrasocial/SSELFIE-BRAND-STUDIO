import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Academy', () => {
  test('navigation cards render and external links work', async ({ page, context }) => {
    await page.goto('/app/academy');

    const cards = page.locator('[data-testid="academy-card"], a:has-text("Lesson"), a:has-text("Course")');
    await expect(cards.first()).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      cards.first().click()
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/http/);
    await newPage.close();
  });
});

