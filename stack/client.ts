import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  // You should store these in environment variables based on your project setup
  projectId: "253d7343-a0d4-43a1-be5c-822f590d40be",
  publishableClientKey: "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg",
  tokenStore: "cookie",
  // Ensure cookies are set for the apex domain and are secure
  cookieOptions: {
    // Allow cross-subdomain during callback; keep secure
    domain: typeof window !== 'undefined' && window.location.hostname.endsWith('.sselfie.ai')
      ? '.sselfie.ai'
      : undefined,
    path: "/",
    secure: true,
    sameSite: "none"
  },
  // Configure URLs for proper redirects
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up", 
    afterSignIn: "/app",
    afterSignUp: "/app",
    afterSignOut: "/",
    // Force top-level redirect callback on our domain to avoid third-party cookie scenarios
    oauthCallback: typeof window !== 'undefined' ? `${window.location.origin}/handler/oauth-callback` : "/handler/oauth-callback",
  },
  // Enable automatic OAuth callback processing
  autoProcessOAuthCallback: true,
});
