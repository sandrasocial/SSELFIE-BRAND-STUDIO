import { Logger } from '../utils/logger.js';
import { createError } from '../utils/error-handler.js';
export class UnifiedErrorHandler {
    logger;
    errorCounts;
    lastErrorTimes;
    constructor() {
        this.logger = new Logger('UnifiedErrorHandler');
        this.errorCounts = new Map();
        this.lastErrorTimes = new Map();
    }
    async handleError(error, context = {}, options = {}) {
        const errorId = this.generateErrorId();
        const errorKey = this.getErrorKey(error, context);
        this.trackErrorFrequency(errorKey);
        this.logError(error, context, errorId);
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
            }
            catch (fallbackError) {
                this.logger.error(`Fallback action failed for error ${errorId}:`, fallbackError);
            }
        }
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
    handleAPIError(error, context = {}, statusCode = 500) {
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
    async handleDatabaseError(error, context = {}, operation) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
            return this.handleError(error, context, {
                retry: true,
                maxRetries: 3,
                retryDelay: 1000,
                notifyAdmin: true
            });
        }
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
        if (errorMessage.includes('query') || errorMessage.includes('syntax')) {
            return this.handleError(error, context, {
                retry: true,
                maxRetries: 1,
                retryDelay: 500
            });
        }
        return this.handleError(error, context, {
            retry: false,
            notifyAdmin: true
        });
    }
    async handleAIServiceError(error, context = {}, service) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            return this.handleError(error, context, {
                retry: true,
                maxRetries: 2,
                retryDelay: 5000,
                notifyAdmin: true
            });
        }
        if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
            return this.handleError(error, context, {
                retry: false,
                notifyAdmin: true
            });
        }
        if (errorMessage.includes('unavailable') || errorMessage.includes('503')) {
            return this.handleError(error, context, {
                retry: true,
                maxRetries: 3,
                retryDelay: 2000,
                fallbackAction: async () => {
                    this.logger.info(`Attempting fallback to alternative AI service for ${service}`);
                    return { fallback: true, service };
                }
            });
        }
        return this.handleError(error, context, {
            retry: true,
            maxRetries: 2,
            retryDelay: 1000
        });
    }
    getErrorStatistics() {
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
    clearOldErrors(maxAge = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAge;
        for (const [errorKey, lastTime] of this.lastErrorTimes.entries()) {
            if (lastTime < cutoff) {
                this.errorCounts.delete(errorKey);
                this.lastErrorTimes.delete(errorKey);
            }
        }
        this.logger.info('Cleared old error data');
    }
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getErrorKey(error, context) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const operation = context.operation || 'unknown';
        const service = context.service || 'unknown';
        return `${service}:${operation}:${errorMessage.split(' ').slice(0, 3).join('_')}`;
    }
    trackErrorFrequency(errorKey) {
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        this.lastErrorTimes.set(errorKey, Date.now());
    }
    shouldRetry(error, errorKey, options) {
        if (!options.retry)
            return false;
        const count = this.errorCounts.get(errorKey) || 0;
        const maxRetries = options.maxRetries || 3;
        return count <= maxRetries;
    }
    calculateRetryDelay(errorKey, options) {
        const count = this.errorCounts.get(errorKey) || 0;
        const baseDelay = options.retryDelay || 1000;
        const delay = baseDelay * Math.pow(2, count - 1);
        const jitter = Math.random() * 0.1 * delay;
        return Math.min(delay + jitter, 30000);
    }
    logError(error, context, errorId) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Error ${errorId}:`, {
            message: errorMessage,
            stack,
            context,
            timestamp: new Date().toISOString()
        });
    }
    sanitizeError(error) {
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
    getErrorMessage(error) {
        if (error?.message)
            return error.message;
        if (typeof error === 'string')
            return error;
        return 'An unexpected error occurred';
    }
    getErrorCode(error) {
        if (error?.name)
            return error.name.toUpperCase();
        if (error?.code)
            return error.code;
        return 'UNKNOWN_ERROR';
    }
    async notifyAdmin(error, context, errorId) {
        this.logger.warn(`Admin notification for error ${errorId}:`, {
            error: this.sanitizeError(error),
            context,
            timestamp: new Date().toISOString()
        });
    }
}
export const unifiedErrorHandler = new UnifiedErrorHandler();
//# sourceMappingURL=unified-error-handler.js.map