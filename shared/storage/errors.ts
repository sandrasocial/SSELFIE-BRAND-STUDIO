/**
 * Storage Error Handling System
 * SSELFIE Platform - Storage Errors
 */

import type { StorageError, StorageErrorType } from './types.js';

// ============================================================================
// Error Classes
// ============================================================================

export class StorageErrorBase extends Error implements StorageError {
  public readonly type: StorageErrorType;
  public readonly code: string;
  public readonly key?: string;
  public readonly originalError?: Error;
  public readonly retryable: boolean;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    type: StorageErrorType,
    code: string,
    message: string,
    options: {
      key?: string;
      originalError?: Error;
      retryable?: boolean;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    
    this.name = 'StorageError';
    this.type = type;
    this.code = code;
    this.key = options.key;
    this.originalError = options.originalError;
    this.retryable = options.retryable ?? false;
    this.metadata = options.metadata;

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageErrorBase);
    }
  }

  /**
   * Convert to JSON for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      key: this.key,
      retryable: this.retryable,
      metadata: this.metadata,
      originalError: this.originalError?.message,
      stack: this.stack,
    };
  }

  /**
   * Check if this error should trigger a retry
   */
  shouldRetry(): boolean {
    return this.retryable;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case 'upload':
        return 'Failed to upload file. Please try again.';
      case 'download':
        return 'Failed to download file. Please try again.';
      case 'delete':
        return 'Failed to delete file. Please try again.';
      case 'validation':
        return 'File validation failed. Please check the file and try again.';
      case 'configuration':
        return 'Storage configuration error. Please contact support.';
      case 'network':
        return 'Network error. Please check your connection and try again.';
      case 'permission':
        return 'Permission denied. Please contact support.';
      case 'quota':
        return 'Storage quota exceeded. Please contact support.';
      case 'timeout':
        return 'Operation timed out. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

export class UploadError extends StorageErrorBase {
  constructor(message: string, key?: string, originalError?: Error, metadata?: Record<string, unknown>) {
    super('upload', 'UPLOAD_FAILED', message, {
      key,
      originalError,
      retryable: true,
      metadata,
    });
  }
}

export class DownloadError extends StorageErrorBase {
  constructor(message: string, key?: string, originalError?: Error, metadata?: Record<string, unknown>) {
    super('download', 'DOWNLOAD_FAILED', message, {
      key,
      originalError,
      retryable: true,
      metadata,
    });
  }
}

export class ValidationError extends StorageErrorBase {
  constructor(message: string, key?: string, metadata?: Record<string, unknown>) {
    super('validation', 'VALIDATION_FAILED', message, {
      key,
      retryable: false,
      metadata,
    });
  }
}

export class ConfigurationError extends StorageErrorBase {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super('configuration', 'CONFIG_ERROR', message, {
      retryable: false,
      metadata,
    });
  }
}

export class NetworkError extends StorageErrorBase {
  constructor(message: string, originalError?: Error, metadata?: Record<string, unknown>) {
    super('network', 'NETWORK_ERROR', message, {
      originalError,
      retryable: true,
      metadata,
    });
  }
}

export class PermissionError extends StorageErrorBase {
  constructor(message: string, key?: string, metadata?: Record<string, unknown>) {
    super('permission', 'PERMISSION_DENIED', message, {
      key,
      retryable: false,
      metadata,
    });
  }
}

export class QuotaError extends StorageErrorBase {
  constructor(message: string, key?: string, metadata?: Record<string, unknown>) {
    super('quota', 'QUOTA_EXCEEDED', message, {
      key,
      retryable: false,
      metadata,
    });
  }
}

export class TimeoutError extends StorageErrorBase {
  constructor(message: string, key?: string, metadata?: Record<string, unknown>) {
    super('timeout', 'TIMEOUT', message, {
      key,
      retryable: true,
      metadata,
    });
  }
}

// ============================================================================
// Error Classification & Handling
// ============================================================================

export class ErrorClassifier {
  /**
   * Classify AWS S3 errors
   */
  static classifyS3Error(error: any, key?: string): StorageErrorBase {
    const errorCode = error.Code || error.code || error.name;
    const message = error.message || error.Message || 'Unknown S3 error';

    switch (errorCode) {
      case 'NoSuchBucket':
      case 'NoSuchKey':
        return new DownloadError(`Resource not found: ${message}`, key, error);
      
      case 'AccessDenied':
      case 'InvalidAccessKeyId':
      case 'SignatureDoesNotMatch':
        return new PermissionError(`Access denied: ${message}`, key);
      
      case 'EntityTooLarge':
      case 'InvalidRequest':
        return new ValidationError(`Invalid request: ${message}`, key);
      
      case 'ServiceUnavailable':
      case 'SlowDown':
        return new NetworkError(`Service temporarily unavailable: ${message}`, error);
      
      case 'RequestTimeout':
      case 'RequestTimeoutException':
        return new TimeoutError(`Request timed out: ${message}`, key);
      
      case 'InternalError':
      case 'InternalServerError':
        return new StorageErrorBase('upload', 'INTERNAL_ERROR', `Internal server error: ${message}`, {
          key,
          originalError: error,
          retryable: true,
        });
      
      default:
        // Generic classification based on HTTP status
        if (error.statusCode || error.$metadata?.httpStatusCode) {
          const statusCode = error.statusCode || error.$metadata.httpStatusCode;
          
          if (statusCode >= 400 && statusCode < 500) {
            if (statusCode === 403) {
              return new PermissionError(`Permission denied: ${message}`, key);
            }
            if (statusCode === 404) {
              return new DownloadError(`Resource not found: ${message}`, key, error);
            }
            if (statusCode === 408 || statusCode === 429) {
              return new NetworkError(`Request failed: ${message}`, error);
            }
            return new ValidationError(`Client error: ${message}`, key);
          }
          
          if (statusCode >= 500) {
            return new StorageErrorBase('upload', 'SERVER_ERROR', `Server error: ${message}`, {
              key,
              originalError: error,
              retryable: true,
            });
          }
        }
        
        return new StorageErrorBase('upload', 'UNKNOWN_ERROR', `Unknown error: ${message}`, {
          key,
          originalError: error,
          retryable: true,
        });
    }
  }

  /**
   * Classify network errors
   */
  static classifyNetworkError(error: any, key?: string): StorageErrorBase {
    const message = error.message || 'Network error';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new NetworkError(`Connection failed: ${message}`, error);
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return new TimeoutError(`Connection timed out: ${message}`, key);
    }
    
    return new NetworkError(message, error);
  }

  /**
   * Classify file validation errors
   */
  static classifyValidationError(message: string, key?: string): ValidationError {
    return new ValidationError(message, key);
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class RetryHandler {
  private static readonly DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  };

  /**
   * Execute function with exponential backoff retry
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let lastError: Error;
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's the last attempt
        if (attempt === opts.maxRetries) {
          break;
        }
        
        // Don't retry non-retryable errors
        if (error instanceof StorageErrorBase && !error.shouldRetry()) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, opts);
        
        console.warn(`Storage operation failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms:`, error);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private static calculateDelay(attempt: number, options: RetryOptions): number {
    let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt);
    delay = Math.min(delay, options.maxDelay);
    
    if (options.jitter) {
      // Add ±25% jitter
      const jitterAmount = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.max(0, Math.floor(delay));
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Error Reporting & Monitoring
// ============================================================================

export interface ErrorReporter {
  reportError(error: StorageErrorBase): void;
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<StorageErrorType, number>;
    recentErrors: StorageErrorBase[];
  };
}

export class DefaultErrorReporter implements ErrorReporter {
  private errors: StorageErrorBase[] = [];
  private readonly maxStoredErrors = 100;

  reportError(error: StorageErrorBase): void {
    // Add to error history
    this.errors.unshift(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.splice(this.maxStoredErrors);
    }
    
    // Log error
    console.error('Storage error reported:', error.toJSON());
    
    // Here you could integrate with external monitoring services
    // like Sentry, DataDog, etc.
  }

  getErrorStats() {
    const errorsByType: Record<StorageErrorType, number> = {
      upload: 0,
      download: 0,
      delete: 0,
      validation: 0,
      configuration: 0,
      network: 0,
      permission: 0,
      quota: 0,
      timeout: 0,
    };

    this.errors.forEach(error => {
      errorsByType[error.type]++;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      recentErrors: this.errors.slice(0, 10),
    };
  }
}

// Export singleton instance
export const errorReporter = new DefaultErrorReporter();