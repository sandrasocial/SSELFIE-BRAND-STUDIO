/**
 * Error Boundary System
 * Comprehensive error handling and recovery
 */
import { FeatureFlags } from './feature-flags.js';
export class ErrorBoundary {
    static errorCount = 0;
    static maxErrorsPerMinute = 10;
    static errorTimestamps = [];
    /**
     * Handle errors with appropriate recovery strategies
     */
    static async handleError(error, context) {
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
    static async safeCall(operation, context, fallback) {
        try {
            return await operation();
        }
        catch (error) {
            const result = await this.handleError(error, context);
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
    static safeSync(operation, context, fallback) {
        try {
            return operation();
        }
        catch (error) {
            this.logError(error, context);
            return fallback || null;
        }
    }
    /**
     * Check if we're hitting error rate limits
     */
    static isErrorRateLimited() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        // Remove old timestamps
        this.errorTimestamps = this.errorTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
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
    static logError(error, context) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            errorCount: ++this.errorCount
        };
        if (FeatureFlags.shouldLogVerbose()) {
            console.error('🚨 ERROR BOUNDARY:', errorInfo);
        }
        else {
            console.error('🚨 ERROR:', error.message, context.operation);
        }
        // TODO: Send to monitoring service when available
        // await this.sendToMonitoring(errorInfo);
    }
    /**
     * Determine the best recovery strategy for an error
     */
    static determineRecoveryStrategy(error, context) {
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
    static async executeRecoveryStrategy(strategy, error, context) {
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
    static getFallbackResponse(context) {
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
