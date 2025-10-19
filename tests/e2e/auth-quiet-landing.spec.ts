import { test, expect } from '@playwright/test';

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

function countMatching(items: string[], substr: string): number {
  return items.filter(l => l.includes(substr)).length;
}

test.describe('Public landing performs no auth on initial load', () => {
  test('Business landing ("/business") does NOT attempt auth or /api/me', async ({ page }) => {
    const { logs, errors } = collectConsole(page);
    const { requests, failed } = collectNetwork(page);

    await page.goto('/business', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // No auth or user probes
    const authHits = requests.filter(u => /\/api\/auth\b/.test(u));
    const meHits = requests.filter(u => /\/api\/me\b/.test(u));

    // Console should not show active auth checks or timeouts
    const checkingAuth = countMatching(logs, 'useAuth: Checking authentication status');
    const authTimeout = countMatching(logs, 'useAuth: Auth check timeout');

    // Allow a single informational skip log at most
    const skipLog = countMatching(logs, 'useAuth: Skipping auth check on public/auth route');

    // Long task warnings should not appear on first paint
    const longTasks = countMatching(logs, 'Long task detected');

    // Expectations
    expect(authHits.length, `Unexpected /api/auth calls: ${authHits.join('\n')}`).toBe(0);
    expect(meHits.length, `Unexpected /api/me calls: ${meHits.join('\n')}`).toBe(0);
    expect(checkingAuth, `Auth checks should not run on public route. Logs: ${logs.join('\n')}`).toBe(0);
    expect(authTimeout, `Auth timeout should not occur on public route. Logs: ${logs.join('\n')}`).toBe(0);
    expect(skipLog).toBeLessThanOrEqual(1);
    expect(longTasks, `Long task warnings on initial load: ${logs.join('\n')}`).toBe(0);
    const authRelatedErrors = errors.filter(e => /stack|auth/i.test(e));
    expect(authRelatedErrors.length, `Auth-related console errors: ${authRelatedErrors.join('\n')}`).toBe(0);
  });

  test('Root route ("/") SmartHome redirect logs at most once', async ({ page }) => {
    const { logs } = collectConsole(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const redirects = countMatching(logs, 'SmartHome: Redirecting to business landing');
    expect(redirects).toBeLessThanOrEqual(1);
  });
});

