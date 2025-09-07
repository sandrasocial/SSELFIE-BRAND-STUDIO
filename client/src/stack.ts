// src/stack.ts
import { StackClientApp } from "@stackframe/react";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "./env";

export const stackClientApp = new StackClientApp({
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: "cookie",
});