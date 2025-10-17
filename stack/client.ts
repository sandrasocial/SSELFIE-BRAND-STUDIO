/* eslint-disable no-console */
import { StackClientApp } from "@stackframe/react";

// 🔥 CRITICAL FIX: Use build-time constants with proper fallback chain
const STACK_PROJECT_ID = (globalThis as any).__STACK_PROJECT_ID__ || 
  import.meta.env?.VITE_STACK_PROJECT_ID || 
  "253d7343-a0d4-43a1-be5c-822f590d40be";

const STACK_PUBLISHABLE_CLIENT_KEY = (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__ || 
  import.meta.env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 
  "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg";

// 🔍 Enhanced debug logging to trace environment variable injection
console.log('🔍 Stack Auth Environment Variables:', {
  globalsProjectId: (globalThis as any).__STACK_PROJECT_ID__,
  globalsKey: (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__?.substring(0, 20) + '...',
  importMetaProjectId: import.meta.env?.VITE_STACK_PROJECT_ID,
  importMetaKey: import.meta.env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  finalProjectId: STACK_PROJECT_ID,
  finalKey: STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  globalThisKeys: Object.keys(globalThis).filter(k => k.includes('STACK')),
});

// Debug logging
console.log('🔍 Stack Auth Configuration:', {
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

let stackClientApp: InstanceType<typeof StackClientApp>;

try {
  // Use custom cookie configuration
  const cookieConfig = {
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };

  // Apply cookie configuration to document.cookie
  if (typeof document !== 'undefined') {
    const cookieStr = Object.entries(cookieConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    document.cookie = cookieStr;
  }

  stackClientApp = new StackClientApp({
    projectId: STACK_PROJECT_ID,
    publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
    tokenStore: "cookie",
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up",
      afterSignIn: "/auth-success",  // ✅ FIXED: Must match App.tsx route and auth-success.tsx
      afterSignUp: "/auth-success",  // ✅ FIXED: Must match App.tsx route and auth-success.tsx
      afterSignOut: "/",
      oauthCallback: "/handler/oauth-callback",
      error: "/handler/sign-in?error=auth_failed",
    },
  });

  // 🔥 CRITICAL FIX: Override token store methods to prevent "undefined" tokens
  const originalTokenStore = (stackClientApp as any).tokenStore;
  if (originalTokenStore) {
    const originalGetItem = originalTokenStore.getItem?.bind(originalTokenStore);
    const originalSetItem = originalTokenStore.setItem?.bind(originalTokenStore);

    if (originalGetItem) {
      originalTokenStore.getItem = (key: string) => {
        const value = originalGetItem(key);
        if (value === 'undefined' || value === undefined || value === null) {
          console.warn(`🚨 Detected invalid token value for key "${key}": ${value}. Clearing.`);
          originalTokenStore.removeItem?.(key);
          return null;
        }
        return value;
      };
    }

    if (originalSetItem) {
      originalTokenStore.setItem = (key: string, value: string) => {
        if (value === 'undefined' || value === undefined || value === null) {
          console.error(`🚨 Attempted to set invalid token value for key "${key}": ${value}. Ignoring.`);
          return;
        }
        originalSetItem(key, value);
      };
    }
  }

  // Debug the Stack Auth instance
  console.log('🔍 Stack Auth Instance Created:', {
    projectId: stackClientApp.projectId,
    urls: stackClientApp.urls,
    tokenStore: 'cookie',
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side'
  });

  //  DEBUG: Check if Stack Auth is working properly
  console.log('🔍 Stack Auth Readiness Check:', {
    hasGetUser: typeof stackClientApp.getUser === 'function',
    hasCurrentUser: 'currentUser' in stackClientApp,
    clientReady: !!stackClientApp
  });

  // 🔥 CRITICAL: Wait for Stack Auth to initialize properly before proceeding
  if (typeof window !== 'undefined') {
    // Give Stack Auth time to fetch project configuration
    setTimeout(async () => {
      try {
        // Test if we can access the project configuration
        const user = await stackClientApp.getUser();
      } catch (error) {
        console.warn('⚠️ Stack Auth project configuration issue:', error);
        // This is expected if no user is signed in, so we don't throw
      }
    }, 1000);
  }
} catch (error) {
  console.error('❌ Failed to create Stack Auth instance:', error);
  throw error;
}

// Note: useUser hook is provided by Stack Auth and should be used within React components only
console.log('✅ Stack Auth client initialized successfully');

export { stackClientApp };
