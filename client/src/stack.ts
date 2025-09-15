// src/stack.ts
import { StackClientApp } from "@stackframe/react";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "./env";

// Debug logging
console.log('🔍 Stack Auth Config:', {
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
  projectIdPresent: !!STACK_PROJECT_ID,
  keyPresent: !!STACK_PUBLISHABLE_CLIENT_KEY,
  keyStartsWith: STACK_PUBLISHABLE_CLIENT_KEY?.startsWith?.('pck_'),
});

export const stackClientApp = new StackClientApp({
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: "cookie",
});