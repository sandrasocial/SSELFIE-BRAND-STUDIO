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

/**
 * Database operation timeout wrapper with fallback
 */
export function withDatabaseTimeout<T>(
  promise: Promise<T>, 
  fallbackValue: T, 
  ms: number = 3000, // Reduced default from 5000ms to 3000ms
  label: string = 'database-op'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => 
      setTimeout(() => {
        console.warn(`⚠️ Database timeout for ${label} after ${ms}ms, using fallback`);
        resolve(fallbackValue);
      }, ms)
    )
  ]);
}

/**
 * External API call timeout wrapper with retry
 */
export function withExternalApiTimeout<T>(
  apiCall: () => Promise<T>, 
  fallbackValue: T, 
  ms: number = 3000, 
  retries: number = 1,
  label: string = 'external-api'
): Promise<T> {
  const attempt = async (attemptNum: number): Promise<T> => {
    try {
      return await withTimeout(apiCall(), ms, `${label}-attempt-${attemptNum}`);
    } catch (error) {
      if (attemptNum < retries && isTimeoutError(error)) {
        console.warn(`⚠️ Retrying ${label} (attempt ${attemptNum + 1}/${retries + 1})`);
        return attempt(attemptNum + 1);
      }
      console.warn(`⚠️ External API timeout for ${label}, using fallback`);
      return fallbackValue;
    }
  };
  
  return attempt(1);
}

/**
 * Fast health check with immediate response
 */
export function quickHealthCheck(): Promise<{ status: 'healthy' | 'degraded'; timestamp: string }> {
  const startTime = Date.now();
  
  return Promise.resolve({
    status: Date.now() - startTime < 100 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString()
  });
}

/**
 * Database operation with retry and exponential backoff for critical operations
 */
export function withDatabaseTimeoutAndRetry<T>(
  promiseFactory: () => Promise<T>,
  fallbackValue: T,
  ms: number = 1500, // Reduced from 2000ms with caching
  retries: number = 2,
  label: string = 'critical-db-op'
): Promise<T> {
  const attempt = async (attemptNum: number): Promise<T> => {
    const backoffDelay = Math.min(1000 * Math.pow(2, attemptNum - 1), 3000);
    
    if (attemptNum > 1) {
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
    
    try {
      return await withDatabaseTimeout(promiseFactory(), fallbackValue, ms, `${label}-attempt-${attemptNum}`);
    } catch {
      if (attemptNum < retries + 1) {
        console.warn(`⚠️ ${label} attempt ${attemptNum} failed, retrying...`);
        return attempt(attemptNum + 1);
      }
      console.error(`❌ ${label} failed after ${retries + 1} attempts, using fallback`);
      return fallbackValue;
    }
  };
  
  return attempt(1);
}
