import { StackClientApp } from "@stackframe/stack";

// Use environment variables for Stack Auth configuration
const STACK_PROJECT_ID = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

// Stack Auth client configuration
let stackApp: any;

console.log('🔧 Stack Auth Environment Check:', {
  projectId: STACK_PROJECT_ID,
  hasPublishableKey: !!publishableKey,
  publishableKeyExists: typeof publishableKey === 'string',
});

if (STACK_PROJECT_ID && publishableKey) {
  try {
    console.log('🔧 Initializing Stack Auth with explicit token storage...');
    
    // Configure Stack Auth with explicit token storage settings
    stackApp = new StackClientApp({
      projectId: STACK_PROJECT_ID,
      publishableClientKey: publishableKey,
      // Force localStorage-based token storage to avoid undefined object issues
      tokenStore: {
        type: 'localStorage',
        prefix: 'stack-auth-',
      },
      // Add explicit storage configuration
      baseUrl: 'https://api.stack-auth.com',
    });
    
    console.log('✅ Stack Auth client created with explicit storage config');
    
  } catch (error) {
    console.error('❌ Stack Auth client creation failed:', error);
    console.log('🔧 Trying fallback Stack Auth config...');
    
    // Try simpler configuration as fallback
    try {
      stackApp = new StackClientApp({
        projectId: STACK_PROJECT_ID,
        publishableClientKey: publishableKey,
      });
      console.log('✅ Stack Auth fallback config worked');
    } catch (fallbackError) {
      console.error('❌ Stack Auth fallback also failed:', fallbackError);
      stackApp = createFallbackStackApp();
    }
  }
} else {
  console.warn('⚠️ Stack Auth environment variables missing');
  console.log('Missing vars:', {
    projectId: !STACK_PROJECT_ID,
    publishableKey: !publishableKey
  });
  stackApp = createFallbackStackApp();
}

// Fallback implementation for when Stack Auth isn't available
function createFallbackStackApp() {
  return {
    redirectToSignIn: () => {
      console.log('🔐 Redirecting to fallback login');
      window.location.href = '/login';
    },
    signOut: () => {
      console.log('🔐 Fallback logout');
      window.location.href = '/';
    },
  };
}

export { stackApp };