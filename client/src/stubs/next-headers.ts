/**
 * Stub for next/headers - Stack Auth tries to import this in Next.js environments
 * In our Vite/React app, these are never called, but we need to provide stubs
 * to prevent bundler errors
 */

export const headers = () => ({
  get: () => null,
  has: () => false,
  entries: () => [],
  forEach: () => {},
  keys: () => [],
  values: () => []
});

export const cookies = () => ({
  get: () => undefined,
  getAll: () => [],
  has: () => false,
  set: () => {},
  delete: () => {}
});
