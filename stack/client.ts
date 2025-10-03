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
console.log('🔍 Stack Auth Environment Variable Analysis:', {
  globalsProjectId: (globalThis as any).__STACK_PROJECT_ID__,
  globalsKey: (globalThis as any).__STACK_PUBLISHABLE_CLIENT_KEY__?.substring(0, 20) + '...',
  importMetaProjectId: import.meta.env?.VITE_STACK_PROJECT_ID,
  importMetaKey: import.meta.env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  finalProjectId: STACK_PROJECT_ID,
  finalKey: STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...',
  globalThisKeys: Object.keys(globalThis).filter(k => k.includes('STACK')),
});

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
    // Configure URLs for proper Stack Auth OAuth flow
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up", 
      afterSignIn: "/auth-success",  // ✅ FIXED: Must match App.tsx route
      afterSignUp: "/auth-success",  // ✅ FIXED: Must match App.tsx route
      afterSignOut: "/",             // ✅ RESTORED: Working configuration
      // 🔥 CRITICAL FIX: Must match the route in App.tsx exactly
      oauthCallback: "/handler/oauth-callback",  // ✅ RESTORED: Stack Auth calls this after OAuth
      // 🔧 LOOP PREVENTION: Explicit error handling
      error: "/handler/sign-in?error=auth_failed",
    },
    // 🔥 CRITICAL FIX: Use consistent domain configuration
  // The deployed app uses www.sselfie.ai, so Stack Auth must use the same domain
  baseUrl: 'https://www.sselfie.ai',
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
  console.log('🔍 Stack Auth Instance Created Successfully:', {
    projectId: stackClientApp.projectId,
    urls: stackClientApp.urls,
    tokenStore: 'cookie',
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side'
  });

  // 🔥 CRITICAL FIX: Override URLs to use correct domain (www.sselfie.ai for deployed app)
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const preferredDomain = 'https://www.sselfie.ai'; // Use www.sselfie.ai to match deployed domain
    const urlKeys = ['signIn', 'signUp', 'afterSignIn', 'afterSignUp', 'afterSignOut', 'oauthCallback', 'error'] as const;

    console.log('🔧 URL Override Debug:', {
      currentOrigin,
      preferredDomain,
      currentHostname: window.location.hostname,
      originalUrls: stackClientApp.urls
    });

    urlKeys.forEach(key => {
      const currentUrl = (stackClientApp.urls as any)[key];
      if (currentUrl) {
        let newUrl = currentUrl;
        // Always use www.sselfie.ai for deployed app
        if (currentUrl.includes('sselfie.ai') && !currentUrl.includes('www.sselfie.ai')) {
          newUrl = currentUrl.replace(/https:\/\/sselfie\.ai/g, 'https://www.sselfie.ai');
        }
        // If URL doesn't match current domain, update it
        else if (!currentUrl.startsWith(currentOrigin) && !currentUrl.startsWith(preferredDomain)) {
          newUrl = currentUrl.replace(/^https:\/\/[^\/]+/, preferredDomain);
        }

        if (newUrl !== currentUrl) {
          (stackClientApp.urls as any)[key] = newUrl;
          console.log(`🔧 Fixed URL ${key}: ${currentUrl} → ${newUrl}`);
        }
      }
    });

    console.log('🔧 Final URLs after override:', stackClientApp.urls);

    // Expose URLs for debugging
    (window as any).__stackAuthUrls = stackClientApp.urls;
  }

  // 🔍 DEBUG: Check if Stack Auth is working properly
  console.log('🔍 Stack Auth Client Methods Available:', {
    hasGetUser: typeof stackClientApp.getUser === 'function',
    hasCurrentUser: 'currentUser' in stackClientApp,
    clientReady: !!stackClientApp
  });

  // 🔥 CRITICAL: Wait for Stack Auth to initialize properly before proceeding
  if (typeof window !== 'undefined') {
    // Give Stack Auth time to fetch project configuration
    setTimeout(async () => {
      try {
        console.log('🔍 Testing Stack Auth project configuration...');
        // Test if we can access the project configuration
        const user = await stackClientApp.getUser();
        console.log('✅ Stack Auth project configuration loaded successfully');
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

export { stackClientApp };
