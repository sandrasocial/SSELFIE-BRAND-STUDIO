import { StackClientApp } from "@stackframe/stack";

// Get Stack Auth configuration from environment
const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

console.log('🔧 Stack Auth Configuration:', {
  hasProjectId: !!projectId,
  hasPublishableKey: !!publishableKey,
  projectId: projectId ? `${projectId.slice(0, 8)}...` : 'MISSING'
});

// Create Stack Auth client with explicit token store configuration
export const stackApp = new StackClientApp({
  projectId: projectId || "253d7343-a0d4-43a1-be5c-822f590d40be", // fallback to known project ID
  publishableClientKey: publishableKey || "",
  tokenStore: "localStorage", // Explicitly specify localStorage token storage
  // Provide baseUrl to ensure proper API communication
  baseUrl: "https://api.stack-auth.com",
});

console.log('✅ Stack Auth client initialized successfully');