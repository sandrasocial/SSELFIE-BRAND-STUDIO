import { StackClientApp } from "@stackframe/stack";

// Use environment variables for Stack Auth configuration
const STACK_PROJECT_ID = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

// Stack Auth client configuration with proper environment variable handling
let stackApp: any;

if (STACK_PROJECT_ID && publishableKey) {
  try {
    stackApp = new StackClientApp({
      projectId: STACK_PROJECT_ID,
      publishableClientKey: publishableKey,
    });
    console.log('🔧 Stack Auth client initialized successfully');
    console.log('Project ID:', STACK_PROJECT_ID);
    
    // Add error handling for Stack Auth internal errors
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('accessToken') || 
            event.reason?.message?.includes('StackAssertionError')) {
          console.warn('⚠️ Stack Auth internal error caught, using fallback');
          event.preventDefault(); // Prevent unhandled rejection error
          stackApp = createFallbackStackApp();
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Stack Auth initialization failed:', error);
    stackApp = createFallbackStackApp();
  }
} else {
  console.warn('⚠️ Stack Auth environment variables missing - using fallback auth system');
  console.warn('Project ID available:', !!STACK_PROJECT_ID);
  console.warn('Publishable key available:', !!publishableKey);
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