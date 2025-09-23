/**
 * Timing utilities for Vercel API routes
 * Prevents 504s with hard timeouts and fast failures
 */
export function withTimeout(promise, ms, label = 'op') {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT ${label} after ${ms}ms`)), ms))
    ]);
}
export function createTimeoutError(label, ms) {
    return new Error(`TIMEOUT ${label} after ${ms}ms`);
}
export function isTimeoutError(error) {
    return error instanceof Error && error.message.startsWith('TIMEOUT');
}
/**
 * Database operation timeout wrapper with fallback
 */
export function withDatabaseTimeout(promise, fallbackValue, ms = 3000, // Reduced default from 5000ms to 3000ms
label = 'database-op') {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => {
            console.warn(`⚠️ Database timeout for ${label} after ${ms}ms, using fallback`);
            resolve(fallbackValue);
        }, ms))
    ]);
}
/**
 * External API call timeout wrapper with retry
 */
export function withExternalApiTimeout(apiCall, fallbackValue, ms = 3000, retries = 1, label = 'external-api') {
    const attempt = async (attemptNum) => {
        try {
            return await withTimeout(apiCall(), ms, `${label}-attempt-${attemptNum}`);
        }
        catch (error) {
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
export function quickHealthCheck() {
    const startTime = Date.now();
    return Promise.resolve({
        status: Date.now() - startTime < 100 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString()
    });
}
/**
 * Database operation with retry and exponential backoff for critical operations
 */
export function withDatabaseTimeoutAndRetry(promiseFactory, fallbackValue, ms = 2000, retries = 2, label = 'critical-db-op') {
    const attempt = async (attemptNum) => {
        const backoffDelay = Math.min(1000 * Math.pow(2, attemptNum - 1), 3000);
        if (attemptNum > 1) {
            console.log(`⏳ Retrying ${label} (attempt ${attemptNum}/${retries + 1}) with ${backoffDelay}ms backoff`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
        try {
            return await withDatabaseTimeout(promiseFactory(), fallbackValue, ms, `${label}-attempt-${attemptNum}`);
        }
        catch (error) {
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
