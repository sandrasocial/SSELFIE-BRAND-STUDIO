import { StackClientApp } from "@stackframe/stack";

if (!import.meta.env.VITE_STACK_PROJECT_ID) {
  throw new Error('VITE_STACK_PROJECT_ID environment variable is required');
}

if (!import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY) {
  throw new Error('VITE_STACK_PUBLISHABLE_CLIENT_KEY environment variable is required');
}

export const stackApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
});

console.log('🔧 Stack Auth client initialized with project ID:', import.meta.env.VITE_STACK_PROJECT_ID);