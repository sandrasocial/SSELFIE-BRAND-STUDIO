async function globalSetup() {
  const usingProduction = !!process.env.PLAYWRIGHT_USE_PRODUCTION;

  // In production mode, DO NOT override Stack Auth environment variables.
  // We rely on the production site (sselfie.ai) to be configured correctly.
  if (usingProduction) {
    console.log('[globalSetup] Production mode detected: not overriding Stack Auth env vars.');
    return;
  }

  // In local/dev mode, provide safe defaults only if not already set
  process.env.VITE_STACK_PROJECT_ID = process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
  process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg';

  try {
    process.env.STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
    process.env.STACK_SECRET_SERVER_KEY = process.env.STACK_SECRET_SERVER_KEY || 'ssk_g65shvyfcc6bep1c6nkr7yhe40qmccxgv7nj5b6ebcb0r';
  } catch (error) {
    console.warn('Failed to load some environment variables:', error);
  }
}

export default globalSetup;