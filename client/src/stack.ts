// src/stack.ts
import { StackClientApp } from '@stackframe/react';

// Helper function to clean environment variables (remove quotes if present)
function cleanEnvVar(value: string): string {
  if (!value) return value;
  return value.replace(/^['"]|['"]$/g, ''); // Remove leading and trailing quotes
}

const projectId = cleanEnvVar(import.meta.env.VITE_STACK_PROJECT_ID || '');
const publishableClientKey = cleanEnvVar(import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '');

console.log('🔧 Stack Config Debug:', {
  rawProjectId: import.meta.env.VITE_STACK_PROJECT_ID,
  cleanProjectId: projectId,
  rawKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  cleanKey: publishableClientKey ? publishableClientKey.substring(0, 10) + '...' : 'MISSING'
});

export const stackClientApp = new StackClientApp({
  projectId: projectId,
  publishableClientKey: publishableClientKey,
  tokenStore: 'cookie',
});