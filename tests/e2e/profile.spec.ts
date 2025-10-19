import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
test.skip(!RUN_E2E, 'E2E tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Profile & Settings', () => {
  test('profile summary, recent work, settings in-place with back, and logout', async ({ page }) => {
    await page.goto('/app/profile');

    const summary = page.locator('text=Profile Summary, [data-testid="profile-summary"]');
    await expect(summary.first()).toBeVisible();

    const recent = page.locator('text=Recent Work, [data-testid="recent-work"]');
    await expect(recent.first()).toBeVisible();

    // Open Settings in-place
    const settingsBtn = page.locator('button:has-text("Settings"), [data-testid="open-settings"]');
    await settingsBtn.first().click();

    // Back button returns to Profile
    const back = page.locator('button:has-text("Back"), [data-testid="back-from-settings"]');
    await expect(back.first()).toBeVisible();
    await back.first().click();

    // Logout
    const logout = page.locator('button:has-text("Log out"), button:has-text("Sign out")');
    if (await logout.isVisible()) {
      await logout.click();
      await expect(page).toHaveURL(/sign|login|auth/i);
    }
  });
});

