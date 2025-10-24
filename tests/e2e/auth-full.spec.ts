import { test, expect } from '@playwright/test';

// Utilities reused from other e2e
function collectConsole(page: any) {
  const logs: string[] = [];
  const errors: string[] = [];
  page.on('console', (msg: any) => {
    const line = `[${msg.type()}] ${msg.text()}`;
    logs.push(line);
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err: any) => errors.push(`Page Error: ${err.message}`));
  return { logs, errors };
}

function collectNetwork(page: any) {
  const requests: string[] = [];
  const failed: string[] = [];
  page.on('request', (req: any) => requests.push(req.url()));
  page.on('requestfailed', (req: any) => failed.push(req.url()));
  return { requests, failed };
}

// Test user credentials supplied via environment variables
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || '';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '';


// Helpful selectors and actions for Stack Sign In/Up
async function gotoSignIn(page: any) {
  await page.goto('/business', { waitUntil: 'networkidle' });
  // Click LOGIN in navigation (desktop)
  const loginBtn = page.getByRole('button', { name: /login/i }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginBtn.click();
  } else {
    // Fallback: direct route
    await page.goto('/handler/sign-in', { waitUntil: 'domcontentloaded' });
  }
  // Wait for our debug indicators or the form heading (any of them)
  const debugLocator = page.locator('#signin-handler-debug, #sselfie-debug').first();
  const headingLocator = page.getByText(/WELCOME TO SSELFIE/i).first();
  await Promise.race([
    debugLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    headingLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
  ]);
}

async function ensureEmailPasswordMode(page: any) {
  // If there are auth tabs, click the one containing "Password"
  const tabCandidates = [
    page.getByRole('tab', { name: /password/i }).first(),
    page.getByRole('button', { name: /password/i }).first(),
    page.getByText(/email.*password|password/i).first(),
  ];
  for (const el of tabCandidates) {
    try {
      if (await el.isVisible({ timeout: 500 })) {
        await el.click({ delay: 50 }).catch(() => {});
        break;
      }
    } catch {
      // Intentionally ignoring errors
    }
  }
}

async function switchToSignUpIfPresent(page: any) {
  // Many stacks render a switch link to create account
  const switchers = [
    page.getByRole('button', { name: /sign up|create account|register/i }).first(),
    page.getByRole('link', { name: /sign up|create account|register/i }).first(),
    page.getByText(/sign up|create account|register/i).first(),
  ];
  for (const el of switchers) {
    try {
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click({ delay: 50 }).catch(() => {});
        break;
      }
    } catch {
      // Intentionally ignoring errors
    }
  }
}

async function fillEmailPassword(page: any, email: string, password: string) {
  await ensureEmailPasswordMode(page);

  // Prefer direct input locators first
  let emailField = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first();
  if (!(await emailField.count())) {
    emailField = page.getByRole('textbox', { name: /email/i }).first();
  }
  await emailField.fill(email);

  let pwdField = page.locator('input[type="password"], input[name="password"]').first();
  if (!(await pwdField.count())) {
    pwdField = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();
  }
  await pwdField.fill(password);

  // Optional confirm password if present
  const confirmCandidates = [
    page.getByLabel(/confirm password/i),
    page.getByPlaceholder(/confirm password/i),
    page.locator('input[name="passwordConfirm"], input[name="confirmPassword"], input[data-testid="confirm-password"]'),
  ];
  for (const el of confirmCandidates) {
    try {
      if (await el.isVisible({ timeout: 500 })) {
        await el.fill(password);
        break;
      }
    } catch {
      // Intentionally ignoring errors
    }
  }
}

async function submitAuth(page: any) {
  // Try to click a primary submit button
  const submit = page.getByRole('button', { name: /sign in|sign up|continue|create account|log in/i }).first();
  if (await submit.isVisible().catch(() => false)) {
    await submit.click({ delay: 50 });
  } else {
    await page.keyboard.press('Enter');
  }
}

async function expectAuthSuccess(page: any) {
  // Either redirect to /auth-success then to home, or directly to home
  await page.waitForTimeout(500);
  // Wait for any of these conditions
  await Promise.race([
    page.waitForURL(/.*\/auth-success.*/i, { timeout: 15000 }).catch(() => {}),
    page.waitForURL(/^(?!.*(sign|handler)).*$/i, { timeout: 15000 }).catch(() => {}),
  ]);
  // Cookie check
  const cookies = await page.context().cookies();
  const stackCookies = cookies.filter(c => /stack/i.test(c.name));
  expect(stackCookies.length, 'Expected stack auth cookies to be set').toBeGreaterThan(0);
  // API check (must include browser cookies) – use page.evaluate with credentials: 'include'
  const meJson = await page.evaluate(async () => {
    const res = await fetch('/api/me', { credentials: 'include' });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { __raw: text, status: res.status }; }
  });
  const userObj: any = (meJson && (meJson.data?.user || meJson.user || (meJson.id ? meJson : null))) || null;
  const hasId = !!(userObj?.id);
  expect(hasId, 'User id missing in /api/me').toBeTruthy();
}

async function logout(page: any) {
  // Try UI logout if visible
  const logoutBtn = page.getByRole('button', { name: /logout/i }).first();
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
  } else {
    await page.goto('/api/logout');
  }
  await page.waitForTimeout(500);
}

// Run serially to reuse generated credentials across suites
test.describe.configure({ mode: 'serial' });

// Suite A: Existing test user authentication
test.describe('Suite A: Existing test user authentication', () => {
  test('logs in with existing user and gains access', async ({ page }) => {
    const { logs, errors } = collectConsole(page);
    const { requests, failed } = collectNetwork(page);

    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set - skipping auth test');
      return;
    }

    await gotoSignIn(page);
    await fillEmailPassword(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await submitAuth(page);
    await expectAuthSuccess(page);

    const timeoutWarnings = logs.filter(l => /auth check timeout/i.test(l));
    expect(timeoutWarnings.length, `Timeout warnings:\n${logs.join('\n')}`).toBe(0);

    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/app(\/.+)?$/);

    const meJson = await page.evaluate(async () => (await fetch('/api/me', { credentials: 'include' })).json());
    expect(!!(meJson?.data?.user?.id || meJson?.user?.id || meJson?.id)).toBeTruthy();

    void requests; void failed; void errors;
  });
});

// Suite B: Existing User Login Flow
test.describe('Suite B: Existing user login', () => {
  test('logs out then logs back in with existing credentials', async ({ page }) => {
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set - skipping auth test');
      return;
    }

    // Ensure we start in an authenticated state from Suite A
    // If not, try to sign in
    const mePre = await page.request.get('/api/me');
    if (mePre.status() !== 200) {
      await gotoSignIn(page);
      await fillEmailPassword(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await submitAuth(page);
      await expectAuthSuccess(page);
    }

    // Logout
    await logout(page);
    await page.goto('/business', { waitUntil: 'domcontentloaded' });

    // Login with existing credentials
    await gotoSignIn(page);
    await fillEmailPassword(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await submitAuth(page);
    await expectAuthSuccess(page);
  });
});

// Suite C: Authentication State Persistence
test.describe('Suite C: Auth state persistence', () => {
  test('persists auth across reload and direct protected navigation', async ({ page, context }) => {
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set - skipping auth test');
      return;
    }

    // Ensure logged in
    await gotoSignIn(page);
    await fillEmailPassword(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await submitAuth(page);
    await expectAuthSuccess(page);

    // Reload
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Cookies should still include stack
    const cookies = await context.cookies();
    const stackCookies = cookies.filter(c => /stack/i.test(c.name));
    expect(stackCookies.length).toBeGreaterThan(0);

    // Direct to protected route
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    expect(page.url()).toMatch(/\/app(\/.+)?$/);
  });
});

// Suite D: Logout Flow
test.describe('Suite D: Logout flow', () => {
  test('clears auth and protects /app after logout', async ({ page }) => {
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set - skipping auth test');
      return;
    }

    // Ensure logged in first
    await gotoSignIn(page);
    await fillEmailPassword(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await submitAuth(page);
    await expectAuthSuccess(page);

    // Logout
    await logout(page);

    // Cookies should be cleared (most of them) or at least access removed on /app
    // Some providers leave non-auth cookies; we assert access protection instead

    // Try protected route should redirect away from /app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    expect(page.url()).not.toMatch(/\/app(\/.+)?$/);
  });
});

