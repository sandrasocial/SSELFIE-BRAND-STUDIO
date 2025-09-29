export class RouteError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.name = 'RouteError';
        this.statusCode = statusCode;
        this.code = code || 'INTERNAL_ERROR';
        this.details = details;
    }
}
export const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMIT: 'RATE_LIMIT',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};
export const createError = {
    validation: (message, details) => new RouteError(message, 400, ErrorTypes.VALIDATION_ERROR, details),
    authentication: (message = 'Authentication required') => new RouteError(message, 401, ErrorTypes.AUTHENTICATION_ERROR),
    authorization: (message = 'Insufficient permissions') => new RouteError(message, 403, ErrorTypes.AUTHORIZATION_ERROR),
    notFound: (message = 'Resource not found') => new RouteError(message, 404, ErrorTypes.NOT_FOUND),
    conflict: (message, details) => new RouteError(message, 409, ErrorTypes.CONFLICT, details),
    rateLimit: (message = 'Rate limit exceeded') => new RouteError(message, 429, ErrorTypes.RATE_LIMIT),
    serviceUnavailable: (message = 'Service temporarily unavailable') => new RouteError(message, 503, ErrorTypes.SERVICE_UNAVAILABLE),
    internal: (message = 'Internal server error', details) => new RouteError(message, 500, ErrorTypes.INTERNAL_ERROR, details),
    badRequest: (message, details) => new RouteError(message, 400, ErrorTypes.VALIDATION_ERROR, details),
    forbidden: (message = 'Insufficient permissions') => new RouteError(message, 403, ErrorTypes.AUTHORIZATION_ERROR)
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
export const errorHandler = (error, req, res, next) => {
    console.error('🚨 Route Error:', {
        message: error.message,
        statusCode: error.statusCode || 500,
        code: error.code || 'UNKNOWN_ERROR',
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const errorResponse = {
        success: false,
        error: {
            message: error.message || 'Internal server error',
            code,
            timestamp: new Date().toISOString()
        }
    };
    if (process.env['NODE_ENV'] === 'development' && error.details) {
        errorResponse.error.details = error.details;
    }
    if (process.env['NODE_ENV'] === 'development' && error.stack) {
        errorResponse.error.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.url} not found`,
            code: ErrorTypes.NOT_FOUND,
            timestamp: new Date().toISOString()
        }
    });
};
export const sendSuccess = (res, data, message, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};
export const validateRequired = (data, fields) => {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
        throw createError.validation(`Missing required fields: ${missing.join(', ')}`);
    }
};
export const validateId = (id, fieldName = 'ID') => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw createError.validation(`Invalid ${fieldName}: must be a non-empty string`);
    }
    return id.trim();
};
//# sourceMappingURL=error-handler.js.map