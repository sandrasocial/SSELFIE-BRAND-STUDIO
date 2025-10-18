import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Studio Hub', () => {
  test('KPI stats and recent activity render', async ({ page }) => {
    await page.goto('/app/studio');
    // KPI cards
    const kpis = page.locator('section:has-text("Total Images"), [data-testid="kpi-card"]');
    await expect(kpis.first()).toBeVisible();

    // Recent activity
    const activity = page.locator('section:has-text("Recent Activity"), [data-testid="recent-activity"]');
    await expect(activity).toBeVisible();

    // Navigation actions
    const toGallery = page.locator('a:has-text("Gallery"), [href*="/app/gallery"]');
    await toGallery.first().click();
    await expect(page).toHaveURL(/\/app\/gallery/);
  });
});

