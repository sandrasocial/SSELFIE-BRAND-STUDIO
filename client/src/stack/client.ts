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
    // Simple Stack Auth configuration
    stackApp = new StackClientApp({
      projectId: STACK_PROJECT_ID,
      publishableClientKey: publishableKey,
    });
    
    console.log('✅ Stack Auth client created');
    
  } catch (error) {
    console.error('❌ Stack Auth client creation failed:', error);
    stackApp = createFallbackStackApp();
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