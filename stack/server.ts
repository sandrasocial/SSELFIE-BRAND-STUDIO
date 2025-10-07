/* eslint-disable no-console */
import { StackServerApp } from "@stackframe/react";

// Server-side Stack Auth configuration
const STACK_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || 
  process.env.VITE_STACK_PROJECT_ID || 
  "253d7343-a0d4-43a1-be5c-822f590d40be";

const STACK_PUBLISHABLE_CLIENT_KEY = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 
  "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg";

const STACK_SECRET_SERVER_KEY = process.env.STACK_AUTH_SECRET_KEY;

// Validate server configuration
if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY || !STACK_SECRET_SERVER_KEY) {
  console.error('❌ Stack Auth Server: Missing required configuration');
  console.error('Required env vars: STACK_AUTH_PROJECT_ID, VITE_STACK_PUBLISHABLE_CLIENT_KEY, STACK_SECRET_SERVER_KEY');
  throw new Error('Stack Auth server configuration is incomplete');
}

console.log('🔍 Stack Auth Server Configuration:', {
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  hasSecretKey: !!STACK_SECRET_SERVER_KEY,
  secretKeyPrefix: STACK_SECRET_SERVER_KEY?.substring(0, 10) + '...'
});

let stackServerApp: StackServerApp;

try {
  stackServerApp = new StackServerApp({
    projectId: STACK_PROJECT_ID,
    publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
    secretServerKey: STACK_SECRET_SERVER_KEY,
    // Use appropriate token store for server-side
    tokenStore: "cookie",
    // Configure URLs to match client configuration (MUST be relative for Stack Auth security)
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up", 
      afterSignIn: "/auth-success",  // ✅ FIXED: Must be relative like client
      afterSignUp: "/auth-success",  // ✅ FIXED: Must be relative like client
      afterSignOut: "/",             // ✅ FIXED: Must be relative like client
    },
  });

  console.log('🔍 Stack Auth Server Instance Created:', {
    projectId: stackServerApp.projectId,
    urls: stackServerApp.urls,
    hasServerPermissions: true
  });
} catch (error) {
  console.error('❌ Failed to create Stack Auth Server instance:', error);
  throw error;
}

export { stackServerApp };