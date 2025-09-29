import { FeatureFlags } from './feature-flags.js';
export class ErrorBoundary {
    static errorCount = 0;
    static maxErrorsPerMinute = 10;
    static errorTimestamps = [];
    static async handleError(error, context) {
        if (this.isErrorRateLimited()) {
            console.warn('Error rate limit exceeded, suppressing error');
            return { handled: true, shouldRetry: false };
        }
        this.logError(error, context);
        const strategy = this.determineRecoveryStrategy(error, context);
        const result = await this.executeRecoveryStrategy(strategy, error, context);
        return result;
    }
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
    static safeSync(operation, context, fallback) {
        try {
            return operation();
        }
        catch (error) {
            this.logError(error, context);
            return fallback || null;
        }
    }
    static isErrorRateLimited() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        this.errorTimestamps = this.errorTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
        if (this.errorTimestamps.length >= this.maxErrorsPerMinute) {
            return true;
        }
        this.errorTimestamps.push(now);
        return false;
    }
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
    }
    static determineRecoveryStrategy(error, context) {
        if (error.message.includes('network') || error.message.includes('timeout')) {
            return 'retry';
        }
        if (error.message.includes('database') || error.message.includes('connection')) {
            return 'circuit_break';
        }
        if (error.message.includes('validation') || error.message.includes('invalid')) {
            return 'fail';
        }
        return 'fallback';
    }
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
export const safeCall = ErrorBoundary.safeCall.bind(ErrorBoundary);
export const safeSync = ErrorBoundary.safeSync.bind(ErrorBoundary);
export const handleError = ErrorBoundary.handleError.bind(ErrorBoundary);
//# sourceMappingURL=error-boundary.js.map