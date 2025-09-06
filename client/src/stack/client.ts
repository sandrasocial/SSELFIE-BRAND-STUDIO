import { StackClientApp } from "@stackframe/stack";

// Use environment variables for Stack Auth configuration
const STACK_PROJECT_ID = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

// Stack Auth client configuration with robust error handling
let stackApp: any;

if (STACK_PROJECT_ID && publishableKey) {
  try {
    console.log('🔧 Initializing Stack Auth with config:', {
      projectId: STACK_PROJECT_ID,
      hasPublishableKey: !!publishableKey,
      publishableKeyPrefix: publishableKey?.substring(0, 10) + '...'
    });
    
    stackApp = new StackClientApp({
      projectId: STACK_PROJECT_ID,
      publishableClientKey: publishableKey,
      // Remove tokenStore config to use default behavior
    });
    
    console.log('✅ Stack Auth client initialized successfully');
    console.log('🔧 Stack Auth client methods:', Object.keys(stackApp));
    
  } catch (error) {
    console.error('❌ Stack Auth initialization failed:', {
      error,
      message: error?.message,
      stack: error?.stack
    });
    stackApp = createFallbackStackApp();
  }
} else {
  console.warn('⚠️ Stack Auth environment variables missing - using fallback auth system');
  console.warn('Project ID available:', !!STACK_PROJECT_ID);
  console.warn('Publishable key available:', !!publishableKey);
  if (STACK_PROJECT_ID) {
    console.warn('Project ID value:', STACK_PROJECT_ID);
  }
  if (publishableKey) {
    console.warn('Publishable key prefix:', publishableKey?.substring(0, 10) + '...');
  }
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