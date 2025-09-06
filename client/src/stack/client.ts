import { StackClientApp } from "@stackframe/stack";

// Use the known project ID from the Stack Auth integration
const STACK_PROJECT_ID = "253d7343-a0d4-43a1-be5c-822f590d40be";

// Stack Auth client configuration with fallback for missing environment variables
let stackApp: any;

// Check if we have the required publishable key
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_KEY || 
                       import.meta.env.VITE_STACK_AUTH_PUBLISHABLE_KEY ||
                       import.meta.env.VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ||
                       import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

if (publishableKey) {
  try {
    stackApp = new StackClientApp({
      projectId: STACK_PROJECT_ID,
      publishableClientKey: publishableKey,
    });
    console.log('🔧 Stack Auth client initialized with project ID:', STACK_PROJECT_ID);
  } catch (error) {
    console.error('❌ Stack Auth initialization failed:', error);
    stackApp = createFallbackStackApp();
  }
} else {
  console.warn('⚠️ Stack Auth publishable key not found - using fallback auth system');
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