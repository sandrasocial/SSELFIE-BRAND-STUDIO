import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  // You should store these in environment variables based on your project setup
  projectId: "253d7343-a0d4-43a1-be5c-822f590d40be",
  publishableClientKey: "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg",
  tokenStore: "cookie",
  // Configure cookie settings for proper authentication
  cookieOptions: {
    sameSite: 'lax', // Allow cookies to be sent with same-site requests
    secure: true, // Only send cookies over HTTPS in production
    domain: window.location.hostname === 'localhost' ? 'localhost' : '.sselfie.ai', // Set domain for production
  },
  // Configure URLs for proper redirects
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up", 
    afterSignIn: "/app",
    afterSignUp: "/app",
    afterSignOut: "/",
  },
});
