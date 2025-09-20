/**
 * Timing utilities for Vercel API routes
 * Prevents 504s with hard timeouts and fast failures
 */

export function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  label: string = 'op'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`TIMEOUT ${label} after ${ms}ms`)), ms)
    )
  ]);
}

export function createTimeoutError(label: string, ms: number): Error {
  return new Error(`TIMEOUT ${label} after ${ms}ms`);
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('TIMEOUT');
}
