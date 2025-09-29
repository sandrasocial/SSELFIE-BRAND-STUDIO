/**
 * Unified Error Handling Service
 * Centralized error handling and recovery system
 */

import { Logger } from '../utils/logger';
import { createError } from '../utils/error-handler';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  service?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: () => Promise<any>;
  notifyAdmin?: boolean;
}

export class UnifiedErrorHandler {
  private logger: Logger;
  private errorCounts: Map<string, number>;
  private lastErrorTimes: Map<string, number>;

  constructor() {
    this.logger = new Logger('UnifiedErrorHandler');
    this.errorCounts = new Map();
    this.lastErrorTimes = new Map();
  }

  /**
   * Handle and process errors with context and recovery options
   */
  async handleError(
    error: Error | unknown,
    context: ErrorContext = {},
    options: ErrorRecoveryOptions = {}
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    error: any;
    retryAfter?: number;
  }> {
    const errorId = this.generateErrorId();
    const errorKey = this.getErrorKey(error, context);
    
    // Track error frequency
    this.trackErrorFrequency(errorKey);
    
    // Log error with context
    this.logError(error, context, errorId);
    
    // Check if we should retry
    const shouldRetry = this.shouldRetry(error, errorKey, options);
    
    if (shouldRetry) {
      const retryAfter = this.calculateRetryDelay(errorKey, options);
      this.logger.info(`Error ${errorId} will be retried after ${retryAfter}ms`);
      
      return {
        handled: true,
        recovered: false,
        error: this.sanitizeError(error),
        retryAfter
      };
    }
    
    // Try fallback action if available
    if (options.fallbackAction) {
      try {
        this.logger.info(`Attempting fallback action for error ${errorId}`);
        const result = await options.fallbackAction();
        return {
          handled: true,
          recovered: true,
          error: null,
          retryAfter: undefined
        };
      } catch (fallbackError) {
        this.logger.error(`Fallback action failed for error ${errorId}:`, fallbackError);
      }
    }
    
    // Notify admin if requested
    if (options.notifyAdmin) {
      await this.notifyAdmin(error, context, errorId);
    }
    
    return {
      handled: true,
      recovered: false,
      error: this.sanitizeError(error),
      retryAfter: undefined
    };
  }

  /**
   * Handle API errors with standardized responses
   */
  handleAPIError(
    error: Error | unknown,
    context: ErrorContext = {},
    statusCode: number = 500
  ): {
    statusCode: number;
    error: {
      message: string;
      code: string;
      requestId?: string;
      timestamp: string;
    };
  } {
    const errorId = this.generateErrorId();
    const sanitizedError = this.sanitizeError(error);
    
    this.logError(error, context, errorId);
    
    return {
      statusCode,
      error: {
        message: this.getErrorMessage(sanitizedError),
        code: this.getErrorCode(sanitizedError),
        requestId: errorId,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handle database errors with specific recovery strategies
   */
  async handleDatabaseError(
    error: Error | unknown,
    context: ErrorContext = {},
    operation: string
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    error: any;
    retryAfter?: number;
  }> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Connection errors - retry with exponential backoff
    if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      return this.handleError(error, context, {
        retry: true,
        maxRetries: 3,
        retryDelay: 1000,
        notifyAdmin: true
      });
    }
    
    // Constraint violations - don't retry, return specific error
    if (errorMessage.includes('constraint') || errorMessage.includes('duplicate')) {
      return {
        handled: true,
        recovered: false,
        error: createError.badRequest('Database constraint violation', {
          operation,
          originalError: errorMessage
        })
      };
    }
    
    // Query errors - retry once
    if (errorMessage.includes('query') || errorMessage.includes('syntax')) {
      return this.handleError(error, context, {
        retry: true,
        maxRetries: 1,
        retryDelay: 500
      });
    }
    
    // Default handling
    return this.handleError(error, context, {
      retry: false,
      notifyAdmin: true
    });
  }

  /**
   * Handle AI service errors with fallback strategies
   */
  async handleAIServiceError(
    error: Error | unknown,
    context: ErrorContext = {},
    service: string
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    error: any;
    retryAfter?: number;
  }> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Rate limiting - retry with longer delay
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return this.handleError(error, context, {
        retry: true,
        maxRetries: 2,
        retryDelay: 5000,
        notifyAdmin: true
      });
    }
    
    // API key issues - don't retry, notify admin
    if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
      return this.handleError(error, context, {
        retry: false,
        notifyAdmin: true
      });
    }
    
    // Service unavailable - retry with exponential backoff
    if (errorMessage.includes('unavailable') || errorMessage.includes('503')) {
      return this.handleError(error, context, {
        retry: true,
        maxRetries: 3,
        retryDelay: 2000,
        fallbackAction: async () => {
          // Try alternative AI service
          this.logger.info(`Attempting fallback to alternative AI service for ${service}`);
          return { fallback: true, service };
        }
      });
    }
    
    // Default handling
    return this.handleError(error, context, {
      retry: true,
      maxRetries: 2,
      retryDelay: 1000
    });
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorFrequency: Record<string, number>;
    recentErrors: Array<{
      errorKey: string;
      count: number;
      lastOccurrence: string;
    }>;
  } {
    const recentErrors = Array.from(this.errorCounts.entries())
      .map(([errorKey, count]) => ({
        errorKey,
        count,
        lastOccurrence: new Date(this.lastErrorTimes.get(errorKey) || 0).toISOString()
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
      errorFrequency: Object.fromEntries(this.errorCounts),
      recentErrors
    };
  }

  /**
   * Clear old error data
   */
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    
    for (const [errorKey, lastTime] of this.lastErrorTimes.entries()) {
      if (lastTime < cutoff) {
        this.errorCounts.delete(errorKey);
        this.lastErrorTimes.delete(errorKey);
      }
    }
    
    this.logger.info('Cleared old error data');
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorKey(error: Error | unknown, context: ErrorContext): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const operation = context.operation || 'unknown';
    const service = context.service || 'unknown';
    
    // Create a normalized error key
    return `${service}:${operation}:${errorMessage.split(' ').slice(0, 3).join('_')}`;
  }

  private trackErrorFrequency(errorKey: string): void {
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    this.lastErrorTimes.set(errorKey, Date.now());
  }

  private shouldRetry(error: Error | unknown, errorKey: string, options: ErrorRecoveryOptions): boolean {
    if (!options.retry) return false;
    
    const count = this.errorCounts.get(errorKey) || 0;
    const maxRetries = options.maxRetries || 3;
    
    return count <= maxRetries;
  }

  private calculateRetryDelay(errorKey: string, options: ErrorRecoveryOptions): number {
    const count = this.errorCounts.get(errorKey) || 0;
    const baseDelay = options.retryDelay || 1000;
    
    // Exponential backoff with jitter
    const delay = baseDelay * Math.pow(2, count - 1);
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.min(delay + jitter, 30000); // Max 30 seconds
  }

  private logError(error: Error | unknown, context: ErrorContext, errorId: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    this.logger.error(`Error ${errorId}:`, {
      message: errorMessage,
      stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private sanitizeError(error: Error | unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    return {
      message: String(error),
      type: typeof error
    };
  }

  private getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  }

  private getErrorCode(error: any): string {
    if (error?.name) return error.name.toUpperCase();
    if (error?.code) return error.code;
    return 'UNKNOWN_ERROR';
  }

  private async notifyAdmin(error: Error | unknown, context: ErrorContext, errorId: string): Promise<void> {
    // In production, this would send notifications to admin
    this.logger.warn(`Admin notification for error ${errorId}:`, {
      error: this.sanitizeError(error),
      context,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const unifiedErrorHandler = new UnifiedErrorHandler();
