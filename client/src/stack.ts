import { StackClientApp } from "@stackframe/stack";

// Stack Auth client configuration with proper token store
export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID!,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "cookie", // Fix token store configuration
});