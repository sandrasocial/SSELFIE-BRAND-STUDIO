/**
 * Error Boundary System
 * Comprehensive error handling and recovery
 */

import { FeatureFlags } from './feature-flags';

export interface ErrorContext {
  operation: string;
  userId?: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ErrorBoundary {
  private static errorCount = 0;
  private static maxErrorsPerMinute = 10;
  private static errorTimestamps: Date[] = [];

  /**
   * Handle errors with appropriate recovery strategies
   */
  static async handleError(
    error: Error, 
    context: ErrorContext
  ): Promise<{
    handled: boolean;
    fallback?: any;
    shouldRetry: boolean;
  }> {
    // Rate limiting - prevent error storms
    if (this.isErrorRateLimited()) {
      console.warn('Error rate limit exceeded, suppressing error');
      return { handled: true, shouldRetry: false };
    }

    // Log error with context
    this.logError(error, context);

    // Determine recovery strategy based on error type
    const strategy = this.determineRecoveryStrategy(error, context);

    // Execute recovery strategy
    const result = await this.executeRecoveryStrategy(strategy, error, context);

    return result;
  }

  /**
   * Safe API call wrapper
   */
  static async safeCall<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallback?: T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const result = await this.handleError(error as Error, context);
      
      if (result.handled && result.fallback !== undefined) {
        return result.fallback;
      }
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      return null;
    }
  }

  /**
   * Safe synchronous operation wrapper
   */
  static safeSync<T>(
    operation: () => T,
    context: ErrorContext,
    fallback?: T
  ): T | null {
    try {
      return operation();
    } catch (error) {
      this.logError(error as Error, context);
      return fallback || null;
    }
  }

  /**
   * Check if we're hitting error rate limits
   */
  private static isErrorRateLimited(): boolean {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Remove old timestamps
    this.errorTimestamps = this.errorTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    // Check if we're over the limit
    if (this.errorTimestamps.length >= this.maxErrorsPerMinute) {
      return true;
    }
    
    // Add current timestamp
    this.errorTimestamps.push(now);
    return false;
  }

  /**
   * Log error with appropriate detail level
   */
  private static logError(error: Error, context: ErrorContext): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      errorCount: ++this.errorCount
    };

    if (FeatureFlags.shouldLogVerbose()) {
      console.error('🚨 ERROR BOUNDARY:', errorInfo);
    } else {
      console.error('🚨 ERROR:', error.message, context.operation);
    }

    // TODO: Send to monitoring service when available
    // await this.sendToMonitoring(errorInfo);
  }

  /**
   * Determine the best recovery strategy for an error
   */
  private static determineRecoveryStrategy(
    error: Error, 
    context: ErrorContext
  ): 'retry' | 'fallback' | 'fail' | 'circuit_break' {
    // Network errors - retry
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'retry';
    }
    
    // Database errors - circuit break
    if (error.message.includes('database') || error.message.includes('connection')) {
      return 'circuit_break';
    }
    
    // Validation errors - fail fast
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'fail';
    }
    
    // Default to fallback
    return 'fallback';
  }

  /**
   * Execute the determined recovery strategy
   */
  private static async executeRecoveryStrategy(
    strategy: string,
    error: Error,
    context: ErrorContext
  ): Promise<{
    handled: boolean;
    fallback?: any;
    shouldRetry: boolean;
  }> {
    switch (strategy) {
      case 'retry':
        return {
          handled: false,
          shouldRetry: true
        };
        
      case 'fallback':
        return {
          handled: true,
          fallback: this.getFallbackResponse(context),
          shouldRetry: false
        };
        
      case 'circuit_break':
        return {
          handled: true,
          fallback: { error: 'Service temporarily unavailable' },
          shouldRetry: false
        };
        
      case 'fail':
      default:
        return {
          handled: false,
          shouldRetry: false
        };
    }
  }

  /**
   * Get appropriate fallback response based on context
   */
  private static getFallbackResponse(context: ErrorContext): any {
    switch (context.operation) {
      case 'ai_generation':
        return { error: 'AI service temporarily unavailable' };
      case 'database_query':
        return { error: 'Database temporarily unavailable' };
      case 'file_upload':
        return { error: 'File upload temporarily unavailable' };
      default:
        return { error: 'Service temporarily unavailable' };
    }
  }
}

// Export convenience functions
export const safeCall = ErrorBoundary.safeCall.bind(ErrorBoundary);
export const safeSync = ErrorBoundary.safeSync.bind(ErrorBoundary);
export const handleError = ErrorBoundary.handleError.bind(ErrorBoundary);
