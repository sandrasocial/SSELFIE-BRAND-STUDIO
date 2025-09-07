// src/stack.ts
import { StackClientApp } from '@stackframe/react';

// Helper function to clean environment variables (remove quotes and trim)
function cleanEnvVar(value: string): string {
  if (!value) return '';
  
  // Remove all types of quotes and trim whitespace
  let cleaned = value.trim();
  
  // Handle different quote patterns
  if ((cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Handle escaped quotes and extra whitespace
  cleaned = cleaned.replace(/\\['"]/g, '').trim();
  
  return cleaned;
}

const projectId = cleanEnvVar(import.meta.env.VITE_STACK_PROJECT_ID || '');
const publishableClientKey = cleanEnvVar(import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '');

console.log('🔧 Stack Config Debug:', {
  rawProjectId: import.meta.env.VITE_STACK_PROJECT_ID,
  cleanProjectId: projectId,
  projectIdLength: projectId?.length,
  rawKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  cleanKey: publishableClientKey ? publishableClientKey.substring(0, 10) + '...' : 'MISSING',
  keyLength: publishableClientKey?.length,
  keyType: typeof publishableClientKey,
  keyValue: publishableClientKey || 'EMPTY'
});

console.log('🔍 Pre-validation check:', {
  projectId: !!projectId,
  projectIdValue: projectId,
  publishableClientKey: !!publishableClientKey,
  keyValue: publishableClientKey,
  keyStartsWith: publishableClientKey ? publishableClientKey.startsWith('pck_') : false
});

if (!projectId || !publishableClientKey) {
  console.error('❌ Stack Auth: Missing required configuration:', {
    projectId: projectId || 'MISSING',
    publishableClientKey: publishableClientKey ? publishableClientKey.substring(0, 10) + '...' : 'MISSING'
  });
  throw new Error('Stack Auth configuration incomplete - check environment variables');
}

export const stackClientApp = new StackClientApp({
  projectId: projectId,
  publishableClientKey: publishableClientKey,
  tokenStore: 'cookie',
});

console.log('✅ Stack Auth Client App created successfully:', {
  projectId: stackClientApp.projectId,
  hasKey: !!stackClientApp.publishableClientKey,
  keyPrefix: stackClientApp.publishableClientKey ? stackClientApp.publishableClientKey.substring(0, 10) + '...' : 'MISSING'
});