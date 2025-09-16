import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  // You should store these in environment variables based on your project setup
  projectId: "253d7343-a0d4-43a1-be5c-822f590d40be",
  publishableClientKey: "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg",
  tokenStore: "cookie",
  // Configure cookie settings for proper authentication
  cookieOptions: {
    sameSite: 'lax', // Allow cookies to be sent with same-site requests
    secure: window.location.protocol === 'https:', // Only secure in production
    domain: window.location.hostname === 'localhost' ? undefined : '.sselfie.ai', // Set domain for production, undefined for localhost
    path: '/', // Ensure cookie is available for all paths
  },
  // Configure URLs for proper redirects
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up", 
    afterSignIn: "/app",
    afterSignUp: "/app",
    afterSignOut: "/",
    // Add OAuth callback URL
    oauthCallback: "/oauth-callback",
  },
  // Enable debug mode to see what's happening
  debug: true,
});
