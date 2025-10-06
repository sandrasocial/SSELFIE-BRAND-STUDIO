import { apiRequest } from '../lib/queryClient.js';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ApiRequestOptions {
  retry?: Partial<RetryConfig>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface EnhancedError extends Error {
  originalError: Error;
  attempts: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Enhanced API request with retry logic and error handling
 */
export async function enhancedApiRequest<T = unknown>(
  url: string,
  method: string = 'GET',
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retry };
  const { signal, timeout = 30000 } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Create timeout controller if timeout is specified
      const timeoutController = new AbortController();
      const combinedSignal = signal 
        ? combineAbortSignals([signal, timeoutController.signal])
        : timeoutController.signal;

      const timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, timeout);

      try {
        const result = await apiRequest(url, method, data);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (shouldStopRetrying(error as Error)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === retryConfig.maxRetries) {
        throw enhanceError(lastError, attempt + 1);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      console.warn(`Request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}). Retrying in ${Math.round(jitteredDelay)}ms...`, error);

      await sleep(jitteredDelay);
    }
  }

  throw enhanceError(lastError!, retryConfig.maxRetries + 1);
}

/**
 * Determine if we should stop retrying based on the error
 */
function shouldStopRetrying(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Don't retry on client errors (4xx except 408, 429)
  if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
    return true;
  }

  // Don't retry on validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return true;
  }

  // Don't retry on payment errors that are final
  if (message.includes('card_declined') || message.includes('payment_failed')) {
    return true;
  }

  return false;
}

function enhanceError(error: Error, attempts: number): EnhancedError {
  const enhancedError = new Error(`${error.message} (after ${attempts} attempts)`) as EnhancedError;
  enhancedError.name = error.name;
  enhancedError.stack = error.stack;
  enhancedError.originalError = error;
  enhancedError.attempts = attempts;
  return enhancedError;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Combine multiple abort signals
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  signals.forEach(signal => {
    if (signal.aborted) {
      controller.abort();
      return;
    }
    
    signal.addEventListener('abort', () => {
      controller.abort();
    });
  });
  
  return controller.signal;
}

/**
 * Specialized checkout API request
 */
export async function checkoutApiRequest<T = unknown>(
  url: string,
  method: string = 'GET',
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  // Specialized retry config for checkout operations
  const checkoutRetryConfig: Partial<RetryConfig> = {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    ...options.retry
  };

  return enhancedApiRequest<T>(url, method, data, {
    ...options,
    retry: checkoutRetryConfig,
    timeout: options.timeout || 45000 // Longer timeout for payment operations
  });
}

/**
 * Network connectivity checker
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    // Try to reach a simple endpoint
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    // If the health check fails, assume no connectivity
    return false;
  }
}

/**
 * Error classification utility
 */
export interface ErrorClassification {
  type: 'network' | 'payment' | 'validation' | 'server' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  shouldRetry: boolean;
}

export function classifyError(error: Error): ErrorClassification {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return {
      type: 'network',
      severity: 'medium',
      userMessage: 'Connection problem. Please check your internet connection and try again.',
      technicalMessage: error.message,
      shouldRetry: true
    };
  }

  // Payment errors
  if (message.includes('stripe') || message.includes('payment') || message.includes('card')) {
    return {
      type: 'payment',
      severity: 'high',
      userMessage: 'Payment processing error. Your card has not been charged.',
      technicalMessage: error.message,
      shouldRetry: false
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      type: 'validation',
      severity: 'low',
      userMessage: 'Please check your information and try again.',
      technicalMessage: error.message,
      shouldRetry: false
    };
  }

  // Server errors
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return {
      type: 'server',
      severity: 'high',
      userMessage: 'Our servers are temporarily unavailable. Please try again in a few moments.',
      technicalMessage: error.message,
      shouldRetry: true
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    severity: 'medium',
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: error.message,
    shouldRetry: true
  };
}