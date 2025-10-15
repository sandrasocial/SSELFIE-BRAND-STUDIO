async function globalSetup() {
  // Ensure Stack Auth environment variables are available for tests
  process.env.VITE_STACK_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
  process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY = 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg';

  // Load additional environment variables if needed
  try {
    process.env.STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
    process.env.STACK_SECRET_SERVER_KEY = 'ssk_g65shvyfcc6bep1c6nkr7yhe40qmccxgv7nj5b6ebcb0r';
  } catch (error) {
    console.warn('Failed to load some environment variables:', error);
  }
}

export default globalSetup;