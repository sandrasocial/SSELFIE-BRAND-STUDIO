/* eslint-disable no-console */
import { StackClientApp } from "@stackframe/react";

// Use build-time constants with fallbacks
const STACK_PROJECT_ID = (globalThis as any).__STACK_PROJECT_ID__ || 
  import.meta.env?.VITE_STACK_PROJECT_ID || 
  "253d7343-a0d4-43a1-be5c-822f590d40be";

const STACK_PUBLISHABLE_CLIENT_KEY = (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__ || 
  import.meta.env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 
  "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg";

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

let stackClientApp: StackClientApp;

try {
  stackClientApp = new StackClientApp({
    projectId: STACK_PROJECT_ID,
    publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
    // Use cookie storage for better reliability and cross-domain functionality
    tokenStore: "cookie",
    // Configure URLs for proper redirects with relative paths (Stack Auth security requirement)
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up", 
      afterSignIn: "/auth-success",  // ✅ FIXED: Must be relative for Stack Auth security
      afterSignUp: "/auth-success",  // ✅ FIXED: Must be relative for Stack Auth security
      afterSignOut: "/",             // ✅ FIXED: Must be relative for Stack Auth security
    },
    // Enhanced configuration for production stability
    baseUrl: process.env.NODE_ENV === 'production' ? 'https://www.sselfie.ai' : undefined,
  });

  // Debug the Stack Auth instance
  console.log('🔍 Stack Auth Instance Created Successfully:', {
    projectId: stackClientApp.projectId,
    urls: stackClientApp.urls,
    tokenStore: 'cookie'
  });
} catch (error) {
  console.error('❌ Failed to create Stack Auth instance:', error);
  throw error;
}

export { stackClientApp };
