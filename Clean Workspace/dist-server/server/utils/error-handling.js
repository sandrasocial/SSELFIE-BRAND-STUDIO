/**
 * Comprehensive Error Handling System
 * Centralized error handling, logging, and recovery
 */
import { Logger } from './logger.js';
import { errorHandler } from './error-handler.js';
export class ErrorHandlingSystem {
    logger;
    _isEnabled;
    constructor() {
        this.logger = new Logger('ErrorHandlingSystem');
        this._isEnabled = true;
    }
    /**
     * Handle application errors
     */
    handleError(context) {
        if (!this._isEnabled) {
            return;
        }
        const { error, req, res, userId, sessionId, additionalData } = context;
        // Log error
        this.logger.error('Application error occurred', {
            message: error.message,
            stack: error.stack,
            userId,
            sessionId,
            endpoint: req?.path,
            method: req?.method,
            additionalData,
        });
        // Use error handler
        errorHandler.handleError(context);
        // Send error response if response object is available
        if (res && !res.headersSent) {
            const errorResponse = this.createErrorResponse(error);
            res.status(this.getStatusCode(error)).json(errorResponse);
        }
    }
    /**
     * Create error response
     */
    createErrorResponse(error) {
        return {
            success: false,
            error: {
                code: this.getErrorCode(error),
                message: this.getErrorMessage(error),
                details: this.getErrorDetails(error),
                timestamp: new Date().toISOString(),
            },
        };
    }
    /**
     * Get error code
     */
    getErrorCode(error) {
        const message = error.message.toLowerCase();
        if (message.includes('validation'))
            return 'VALIDATION_ERROR';
        if (message.includes('unauthorized'))
            return 'UNAUTHORIZED';
        if (message.includes('forbidden'))
            return 'FORBIDDEN';
        if (message.includes('not found'))
            return 'NOT_FOUND';
        if (message.includes('duplicate'))
            return 'DUPLICATE_ENTRY';
        if (message.includes('timeout'))
            return 'TIMEOUT';
        if (message.includes('database'))
            return 'DATABASE_ERROR';
        if (message.includes('connection'))
            return 'CONNECTION_ERROR';
        if (message.includes('memory'))
            return 'MEMORY_ERROR';
        if (message.includes('fatal'))
            return 'FATAL_ERROR';
        return 'INTERNAL_ERROR';
    }
    /**
     * Get error message
     */
    getErrorMessage(error) {
        // Don't expose internal error details in production
        if (process.env['NODE_ENV'] === 'production') {
            const message = error.message.toLowerCase();
            if (message.includes('validation'))
                return 'Validation failed';
            if (message.includes('unauthorized'))
                return 'Unauthorized access';
            if (message.includes('forbidden'))
                return 'Access forbidden';
            if (message.includes('not found'))
                return 'Resource not found';
            if (message.includes('duplicate'))
                return 'Duplicate entry';
            if (message.includes('timeout'))
                return 'Request timeout';
            if (message.includes('database'))
                return 'Database error occurred';
            if (message.includes('connection'))
                return 'Connection error occurred';
            if (message.includes('memory'))
                return 'Memory error occurred';
            if (message.includes('fatal'))
                return 'Fatal error occurred';
            return 'An internal error occurred';
        }
        return error.message;
    }
    /**
     * Get error details
     */
    getErrorDetails(error) {
        if (process.env['NODE_ENV'] === 'production') {
            return undefined;
        }
        return {
            stack: error.stack,
            name: error.name,
        };
    }
    /**
     * Get HTTP status code
     */
    getStatusCode(error) {
        const message = error.message.toLowerCase();
        if (message.includes('validation'))
            return 400;
        if (message.includes('unauthorized'))
            return 401;
        if (message.includes('forbidden'))
            return 403;
        if (message.includes('not found'))
            return 404;
        if (message.includes('duplicate'))
            return 409;
        if (message.includes('timeout'))
            return 408;
        if (message.includes('database'))
            return 500;
        if (message.includes('connection'))
            return 500;
        if (message.includes('memory'))
            return 500;
        if (message.includes('fatal'))
            return 500;
        return 500;
    }
    /**
     * Express error handling middleware
     */
    expressErrorHandler() {
        return (error, req, res, next) => {
            this.handleError({
                error,
                req,
                res,
                userId: req.user?.id,
                sessionId: req.sessionID,
            });
        };
    }
    /**
     * Async error wrapper
     */
    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch((error) => {
                this.handleError({
                    error,
                    req,
                    res,
                    userId: req.user?.id,
                    sessionId: req.sessionID,
                });
            });
        };
    }
    /**
     * Create error
     */
    createError(message, code, statusCode) {
        const error = new Error(message);
        error.code = code;
        error.statusCode = statusCode;
        return error;
    }
    /**
     * Create error with context
     */
    createErrorWithContext(message, context) {
        const error = new Error(message);
        error.code = context.code;
        error.statusCode = context.statusCode;
        error.details = context.details;
        error.userId = context.userId;
        error.sessionId = context.sessionId;
        return error;
    }
    /**
     * Send success response
     */
    sendSuccess(res, data, statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Send error response
     */
    sendError(res, message, statusCode = 500, code) {
        res.status(statusCode).json({
            success: false,
            error: {
                code: code || 'INTERNAL_ERROR',
                message,
                timestamp: new Date().toISOString(),
            },
        });
    }
    /**
     * Validate required fields
     */
    validateRequired(fields) {
        const missing = Object.entries(fields)
            .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key, _]) => key);
        if (missing.length > 0) {
            throw this.createError(`Missing required fields: ${missing.join(', ')}`, 'VALIDATION_ERROR', 400);
        }
    }
    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw this.createError('Invalid email format', 'VALIDATION_ERROR', 400);
        }
    }
    /**
     * Validate password strength
     */
    validatePassword(password) {
        if (password.length < 8) {
            throw this.createError('Password must be at least 8 characters long', 'VALIDATION_ERROR', 400);
        }
        if (!/(?=.*[a-z])/.test(password)) {
            throw this.createError('Password must contain at least one lowercase letter', 'VALIDATION_ERROR', 400);
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            throw this.createError('Password must contain at least one uppercase letter', 'VALIDATION_ERROR', 400);
        }
        if (!/(?=.*\d)/.test(password)) {
            throw this.createError('Password must contain at least one number', 'VALIDATION_ERROR', 400);
        }
    }
    /**
     * Enable/disable error handling
     */
    setEnabled(enabled) {
        this._isEnabled = enabled;
        this.logger.info(`Error handling system ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Check if error handling is enabled
     */
    isEnabled() {
        return this._isEnabled;
    }
}
// Export singleton instance
export const errorHandlingSystem = new ErrorHandlingSystem();
// Export convenience functions
export const asyncHandler = errorHandlingSystem.asyncHandler.bind(errorHandlingSystem);
export const createError = errorHandlingSystem.createError.bind(errorHandlingSystem);
export const sendSuccess = errorHandlingSystem.sendSuccess.bind(errorHandlingSystem);
export const sendError = errorHandlingSystem.sendError.bind(errorHandlingSystem);
export const validateRequired = errorHandlingSystem.validateRequired.bind(errorHandlingSystem);
export const validateEmail = errorHandlingSystem.validateEmail.bind(errorHandlingSystem);
export const validatePassword = errorHandlingSystem.validatePassword.bind(errorHandlingSystem);
