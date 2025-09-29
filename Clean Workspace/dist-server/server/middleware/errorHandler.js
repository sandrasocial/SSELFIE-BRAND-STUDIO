import { logger } from '../config/monitoring.js';
// Custom error class
export class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log error
    logger.error({
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        user: req.user,
    });
    // Log server errors for monitoring
    if (err.statusCode >= 500) {
        logger.error(`Server Error: ${err.message}`);
    }
    // Development error response
    if (process.env['NODE_ENV'] === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // Production error response
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or unknown errors: don't leak error details
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};
