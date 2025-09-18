/* eslint-disable no-console */
import { StackClientApp } from "@stackframe/react";

// Get environment variables with fallbacks for production
const STACK_PROJECT_ID = typeof window !== 'undefined' && window.location.hostname === 'sselfie.ai' 
  ? "253d7343-a0d4-43a1-be5c-822f590d40be" // Production fallback
  : ((import.meta as any)?.env?.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be");

const STACK_PUBLISHABLE_CLIENT_KEY = typeof window !== 'undefined' && window.location.hostname === 'sselfie.ai'
  ? "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg" // Production fallback
  : ((import.meta as any)?.env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg");

// Debug logging
console.log('🔍 Stack Auth Config:', {
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  projectIdPresent: !!STACK_PROJECT_ID,
  keyPresent: !!STACK_PUBLISHABLE_CLIENT_KEY,
  keyStartsWith: STACK_PUBLISHABLE_CLIENT_KEY?.startsWith?.('pck_'),
});

// Validate configuration before creating StackClientApp
if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY) {
  console.error('❌ Stack Auth: Missing required configuration');
  throw new Error('Stack Auth configuration is incomplete');
}

if (!STACK_PUBLISHABLE_CLIENT_KEY.startsWith('pck_')) {
  console.error('❌ Stack Auth: Invalid publishable client key format');
  throw new Error('Stack Auth publishable client key is invalid');
}

export const stackClientApp = new StackClientApp({
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
  // Use cookie storage (default)
  tokenStore: "cookie",
  // Configure URLs for proper redirects
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up", 
    afterSignIn: "/auth-success",
    afterSignUp: "/auth-success",
    afterSignOut: "/",
    // Simplified callback URL without dynamic origin
    oauthCallback: "/handler/oauth-callback",
  },
});

// Debug the Stack Auth instance
console.log('🔍 Stack Auth Instance Created:', {
  projectId: stackClientApp.projectId,
  urls: stackClientApp.urls,
  tokenStore: 'cookie'
});
