import { StackClientApp } from "@stackframe/stack";

// Define process.env for Stack Auth compatibility
declare global {
  var process: { env: Record<string, string> };
}

// Ensure process.env exists for Stack Auth
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { 
    env: {
      VITE_STACK_PROJECT_ID: import.meta.env.VITE_STACK_PROJECT_ID,
      VITE_STACK_PUBLISHABLE_CLIENT_KEY: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
    }
  };
}

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID!,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY!,
});