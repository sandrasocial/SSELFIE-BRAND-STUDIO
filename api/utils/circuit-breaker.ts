/**
 * Circuit breaker pattern for database operations
 */

// Simple circuit breaker for database operations
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

const CIRCUIT_BREAKER_THRESHOLD = 5; // Open after 5 failures
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds
const CIRCUIT_BREAKER_RESET_TIME = 60000; // Reset after 1 minute

const circuitBreakerState: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  state: 'closed'
};

export function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  // Reset if enough time has passed
  if (circuitBreakerState.state === 'open' && 
      now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_RESET_TIME) {
    circuitBreakerState.state = 'half-open';
    circuitBreakerState.failures = 0;
  }
  
  return circuitBreakerState.state !== 'open';
}

export function recordCircuitBreakerSuccess(): void {
  circuitBreakerState.failures = 0;
  circuitBreakerState.state = 'closed';
}

export function recordCircuitBreakerFailure(): void {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.state = 'open';
    
    // Log circuit breaker opening
    try {
      console.warn(`⚠️ Circuit breaker opened after ${circuitBreakerState.failures} failures`);
    } catch (e) {
      // Ignore logging errors
    }
  }
}

export async function withCircuitBreaker<T>(operation: () => Promise<T>): Promise<T | null> {
  if (!checkCircuitBreaker()) {
    try {
      console.warn('⚠️ Circuit breaker is open, rejecting request');
    } catch (e) {
      // Ignore logging errors
    }
    return null;
  }
  
  try {
    const result = await operation();
    recordCircuitBreakerSuccess();
    return result;
  } catch (error) {
    recordCircuitBreakerFailure();
    throw error;
  }
}