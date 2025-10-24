import { test, expect } from '@playwright/test';

function yesNo(b: boolean | undefined) { return b ? 'YES' : 'NO'; }

// Collect results across tests
const results: Record<string, string> = {};

// Helper to capture console logs for a page during a step
async function captureConsole(page, arr: string[]) {
  page.on('console', (msg) => {
    const text = msg.text();
    // Only store first ~300 chars per message
    arr.push(text.length > 300 ? text.slice(0, 300) + '…' : text);
  });
}

// 1) OAuth Callback Route Mounting Test
// We expect the component to render and log, or redirect to sign-in when code is fake
// Success signals (any one): console contains 'Processing OAuth callback' OR UI spinner text OR redirect to /handler/sign-in

test('OAuth callback route mounts and logs', async ({ page, baseURL }) => {
  const logs: string[] = [];
  await captureConsole(page, logs);

  const url = new URL('/handler/oauth-callback?code=test&state=test', baseURL).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Wait up to 10s for either spinner text or redirect to sign-in
  let mounted = false;
  try {
    await Promise.race([
      page.waitForSelector('text=Processing authentication...', { timeout: 10000 }),
      page.waitForURL(/\/handler\/sign-in/i, { timeout: 10000 }),
    ]);
    mounted = true;
  } catch {
      // Intentionally ignoring errors
    }

  const loggedProcessing = logs.some(l => /Processing OAuth callback/i.test(l));

  results['OAuth callback mounts'] = yesNo(mounted || loggedProcessing);

  // Attach logs for post-run visibility
  console.log('\n[OAuth Callback Console]\n' + logs.join('\n'));
});

// 2) Sign-In Page Accessibility Test

test('Sign-in page accessible', async ({ page, baseURL }) => {
  const logs: string[] = [];
  await captureConsole(page, logs);

  await page.goto(new URL('/handler/sign-in', baseURL).toString(), { waitUntil: 'domcontentloaded' });

  // Heuristic: page should not be blank or 404; look for common Stack Auth UI text
  const hadContent = await page.waitForSelector('text=/sign in|sign-in|continue with/i', { timeout: 10000 }).then(() => true).catch(() => false);

  results['Sign-in loads'] = yesNo(hadContent);
  console.log('\n[Sign-in Console]\n' + logs.join('\n'));
});

// 3) Sign-Up Page Accessibility Test

test('Sign-up page accessible', async ({ page, baseURL }) => {
  const logs: string[] = [];
  await captureConsole(page, logs);

  await page.goto(new URL('/handler/sign-up', baseURL).toString(), { waitUntil: 'domcontentloaded' });
  const hadContent = await page.waitForSelector('text=/sign up|create account/i', { timeout: 10000 }).then(() => true).catch(() => false);

  results['Sign-up loads'] = yesNo(hadContent);
  console.log('\n[Sign-up Console]\n' + logs.join('\n'));
});

// 4) Environment Variables Verification

test('Environment variables present (debug endpoint)', async ({ request, baseURL }) => {
  const res = await request.get(new URL('/api/debug-env', baseURL).toString(), {
    headers: { 'x-admin-token': 'sandra-admin-2025' },
    timeout: 20000,
  });
  const ok = res.status() === 200;
  let present = false;
  try {
    const data = await res.json();
    const keys = [
      'VITE_STACK_PROJECT_ID',
      'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
      'STACK_PROJECT_ID',
      'STACK_SECRET_SERVER_KEY',
    ];
    present = ok && keys.every(k => data?.[k]?.present === true || typeof data?.[k] === 'boolean');
  } catch {
      // Intentionally ignoring errors
    }
  results['Env vars configured'] = yesNo(present);
});

// 5) Protected Route Behavior Test (Unauthenticated)

test('GET /api/me returns 401 when unauthenticated', async ({ request, baseURL }) => {
  const res = await request.get(new URL('/api/me', baseURL).toString(), { timeout: 20000 });
  results['/api/me 401 unauth'] = yesNo(res.status() === 401);
});

// 6) Logout Endpoint Test

test('GET /api/logout returns JSON with Set-Cookie expirations', async ({ request, baseURL }) => {
  const res = await request.get(new URL('/api/logout', baseURL).toString(), { timeout: 20000 });
  const statusOk = res.status() === 200;
  const headers = res.headers();
  // Playwright flattens multiple Set-Cookie into a single header string separated by commas in some environments
  const setCookie = headers['set-cookie'] || '';
  const clearsStack = /stack|session/i.test(setCookie) && /Expires=|Max-Age=0/i.test(setCookie);
  results['/api/logout clears cookies'] = yesNo(statusOk && clearsStack);
});

// Summary

test.afterAll(async () => {
  console.log('\n===== Auth Probe Summary =====');
  for (const [k, v] of Object.entries(results)) {
    console.log(`${k}: ${v}`);
  }
  console.log('================================');
});

