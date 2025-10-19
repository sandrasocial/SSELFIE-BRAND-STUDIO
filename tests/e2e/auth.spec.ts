import { test, expect } from '@playwright/test';

const RUN_E2E = !!process.env.PLAYWRIGHT_RUN_E2E;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test-user-e2e@sselfie.studio';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

// Skip whole file unless explicitly enabled
test.skip(!RUN_E2E, 'E2E auth tests disabled unless PLAYWRIGHT_RUN_E2E=1');

test.describe('Authentication flows', () => {
  test('login via Stack Auth and token persists across reloads', async ({ page, context, baseURL }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/sign-in|auth|login/i);

    // Try generic selectors used by Stack Auth UI
    const email = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(email).toBeVisible();
    await email.fill(TEST_EMAIL);

    // Password may not be used if magic-link is enabled
    const pw = page.locator('input[type="password"], input[name="password"]');
    if (await pw.isVisible()) {
      await pw.fill(TEST_PASSWORD);
    }

    // Submit
    const submit = page.locator('button:has-text("Sign in"), button:has-text("Continue"), button[type="submit"]');
    await expect(submit).toBeVisible();
    await submit.click();

    // Expect redirected to /app/studio or main app route after auth
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/app\//);

    // Token persists across reloads
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/app\//);

    // Logout flow (via profile or api/logout)
    const maybeProfile = page.locator('a:has-text("Profile"), [data-testid="nav-profile"], [href*="/app/profile"]');
    if (await maybeProfile.isVisible()) {
      await maybeProfile.click();
      const logout = page.locator('button:has-text("Log out"), button:has-text("Sign out")');
      if (await logout.isVisible()) {
        await logout.click();
      } else {
        await page.goto('/api/logout');
      }
    } else {
      await page.goto('/api/logout');
    }

    await page.goto('/app/studio');
    await expect(page).toHaveURL(/sign|login|auth/i);
  });

  test('protected route redirects when unauthenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/app/maya');
    await expect(page).toHaveURL(/sign|login|auth/i);
  });
});

