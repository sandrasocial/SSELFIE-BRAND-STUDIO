import { StackClientApp } from "@stackframe/stack";

// Get Stack Auth configuration from environment
const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

console.log('🔧 Stack Auth Configuration:', {
  hasProjectId: !!projectId,
  hasPublishableKey: !!publishableKey,
  projectId: projectId ? `${projectId.slice(0, 8)}...` : 'MISSING'
});

// Create Stack Auth client with minimal configuration - let Stack Auth handle defaults
export const stackApp = new StackClientApp({
  projectId: projectId || "253d7343-a0d4-43a1-be5c-822f590d40be", // fallback to known project ID
  publishableClientKey: publishableKey || "",
});

console.log('✅ Stack Auth client initialized successfully');