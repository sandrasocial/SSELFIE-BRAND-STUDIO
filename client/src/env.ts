// src/env.ts
const clean = (s?: string) => (s ?? "").trim().replace(/^['"]+|['"]+$/g, "");

export const STACK_PROJECT_ID = clean(import.meta.env.VITE_STACK_PROJECT_ID);
export const STACK_PUBLISHABLE_CLIENT_KEY = clean(import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY);

// Minimal dev-time validation (safe to keep in prod; no values printed)
if (!STACK_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.error("Neon Auth: Missing VITE_STACK_PROJECT_ID");
}
if (!STACK_PUBLISHABLE_CLIENT_KEY || !STACK_PUBLISHABLE_CLIENT_KEY.startsWith("pck_")) {
  // eslint-disable-next-line no-console
  console.error("Neon Auth: Missing or invalid VITE_STACK_PUBLISHABLE_CLIENT_KEY", {
    key: STACK_PUBLISHABLE_CLIENT_KEY,
    keyType: typeof STACK_PUBLISHABLE_CLIENT_KEY,
    keyLength: STACK_PUBLISHABLE_CLIENT_KEY?.length
  });
}

// Optional one-time debug (guarded)
// eslint-disable-next-line no-console
if (import.meta.env.DEV) {
  console.log("Neon Auth env (sanity):", {
    projectIdPresent: !!STACK_PROJECT_ID,
    pckStartsWith: STACK_PUBLISHABLE_CLIENT_KEY.startsWith("pck_"),
    keyLength: STACK_PUBLISHABLE_CLIENT_KEY.length,
  });
}