/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses across all route modules
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class RouteError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'RouteError';
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

// Predefined error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// Error factory functions
export const createError = {
  validation: (message: string, details?: any) => 
    new RouteError(message, 400, ErrorTypes.VALIDATION_ERROR, details),
  
  authentication: (message: string = 'Authentication required') => 
    new RouteError(message, 401, ErrorTypes.AUTHENTICATION_ERROR),
  
  authorization: (message: string = 'Insufficient permissions') => 
    new RouteError(message, 403, ErrorTypes.AUTHORIZATION_ERROR),
  
  notFound: (message: string = 'Resource not found') => 
    new RouteError(message, 404, ErrorTypes.NOT_FOUND),
  
  conflict: (message: string, details?: any) => 
    new RouteError(message, 409, ErrorTypes.CONFLICT, details),
  
  rateLimit: (message: string = 'Rate limit exceeded') => 
    new RouteError(message, 429, ErrorTypes.RATE_LIMIT),
  
  serviceUnavailable: (message: string = 'Service temporarily unavailable') => 
    new RouteError(message, 503, ErrorTypes.SERVICE_UNAVAILABLE),
  
  internal: (message: string = 'Internal server error', details?: any) => 
    new RouteError(message, 500, ErrorTypes.INTERNAL_ERROR, details)
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handling middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error('🚨 Route Error:', {
    message: error.message,
    statusCode: error.statusCode || 500,
    code: error.code || 'UNKNOWN_ERROR',
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code,
      timestamp: new Date().toISOString()
    }
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development' && error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      code: ErrorTypes.NOT_FOUND,
      timestamp: new Date().toISOString()
    }
  });
};

// Success response helper
export const sendSuccess = (res: Response, data: any, message?: string, statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Validation helper
export const validateRequired = (data: any, fields: string[]) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw createError.validation(`Missing required fields: ${missing.join(', ')}`);
  }
};

// ID validation helper
export const validateId = (id: string, fieldName: string = 'ID') => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw createError.validation(`Invalid ${fieldName}: must be a non-empty string`);
  }
  return id.trim();
};
