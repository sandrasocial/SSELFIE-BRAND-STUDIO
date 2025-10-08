/**
 * Comprehensive Error Handling System
 * Centralized error handling, logging, and recovery
 */

import { Logger } from './logger.js';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/ai-generation.js';

export interface ErrorContext {
  error: Error;
  req?: Request;
  res?: Response;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId?: string;
  };
}

export interface ExtendedError extends Error {
  code?: string;
  statusCode?: number;
  details?: unknown;
  userId?: string;
  sessionId?: string;
}

export class ErrorHandler {
  private logger: Logger;
  private _isEnabled: boolean;

  constructor() {
  this.logger = new Logger('ErrorHandler');
  this._isEnabled = true;
  }

  /**
   * Handle application errors
   */
  public handleError(context: ErrorContext): void {
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

    // Track error
    // TODO: Implement error tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send error response if response object is available
    if (res && !res.headersSent) {
      const errorResponse = this.createErrorResponse(error, errorId);
      res.status(this.getStatusCode(error)).json(errorResponse);
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: Error, errorId: string): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: this.getErrorDetails(error),
        timestamp: new Date().toISOString(),
        requestId: errorId,
      },
    };
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('database') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('memory') ||
      message.includes('fatal') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('not found') ||
      message.includes('duplicate')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('warning') ||
      message.includes('deprecated') ||
      message.includes('slow')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine error category
   */
  private determineCategory(error: Error): 'validation' | 'database' | 'external_api' | 'authentication' | 'authorization' | 'system' | 'unknown' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }

    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return 'database';
    }

    if (message.includes('api') || message.includes('http') || message.includes('fetch')) {
      return 'external_api';
    }

    if (message.includes('auth') || message.includes('token') || message.includes('login')) {
      return 'authentication';
    }

    if (message.includes('permission') || message.includes('access') || message.includes('role')) {
      return 'authorization';
    }

    if (message.includes('system') || message.includes('process') || message.includes('memory')) {
      return 'system';
    }

    return 'unknown';
  }

  /**
   * Get error code
   */
  private getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('validation')) return 'VALIDATION_ERROR';
    if (message.includes('unauthorized')) return 'UNAUTHORIZED';
    if (message.includes('forbidden')) return 'FORBIDDEN';
    if (message.includes('not found')) return 'NOT_FOUND';
    if (message.includes('duplicate')) return 'DUPLICATE_ENTRY';
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('database')) return 'DATABASE_ERROR';
    if (message.includes('connection')) return 'CONNECTION_ERROR';
    if (message.includes('memory')) return 'MEMORY_ERROR';
    if (message.includes('fatal')) return 'FATAL_ERROR';

    return 'INTERNAL_ERROR';
  }

  /**
   * Get error message
   */
  private getErrorMessage(error: Error): string {
    // Don't expose internal error details in production
    if (process.env['NODE_ENV'] === 'production') {
      const message = error.message.toLowerCase();
      
      if (message.includes('validation')) return 'Validation failed';
      if (message.includes('unauthorized')) return 'Unauthorized access';
      if (message.includes('forbidden')) return 'Access forbidden';
      if (message.includes('not found')) return 'Resource not found';
      if (message.includes('duplicate')) return 'Duplicate entry';
      if (message.includes('timeout')) return 'Request timeout';
      if (message.includes('database')) return 'Database error occurred';
      if (message.includes('connection')) return 'Connection error occurred';
      if (message.includes('memory')) return 'Memory error occurred';
      if (message.includes('fatal')) return 'Fatal error occurred';

      return 'An internal error occurred';
    }

    return error.message;
  }

  /**
   * Get error details
   */
  private getErrorDetails(error: Error): unknown {
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
  private getStatusCode(error: Error): number {
    const message = error.message.toLowerCase();

    if (message.includes('validation')) return 400;
    if (message.includes('unauthorized')) return 401;
    if (message.includes('forbidden')) return 403;
    if (message.includes('not found')) return 404;
    if (message.includes('duplicate')) return 409;
    if (message.includes('timeout')) return 408;
    if (message.includes('database')) return 500;
    if (message.includes('connection')) return 500;
    if (message.includes('memory')) return 500;
    if (message.includes('fatal')) return 500;

    return 500;
  }

  /**
   * Express error handling middleware
   */
  public expressErrorHandler() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      this.handleError({
        error,
        req,
        res,
        userId: authReq.user?.id,
        sessionId: (req as Request & { sessionID?: string }).sessionID,
      });
    };
  }

  /**
   * Async error wrapper
   */
  public asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        const authReq = req as AuthenticatedRequest;
        this.handleError({
          error,
          req,
          res,
          userId: authReq.user?.id,
          sessionId: (req as Request & { sessionID?: string }).sessionID,
        });
      });
    };
  }

  /**
   * Create error
   */
  public createError(message: string, code?: string, statusCode?: number): ExtendedError {
    const error = new Error(message) as ExtendedError;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  /**
   * Create error with context
   */
  public createErrorWithContext(
    message: string,
    context: {
      code?: string;
      statusCode?: number;
      details?: unknown;
      userId?: string;
      sessionId?: string;
    }
  ): ExtendedError {
    const error = new Error(message) as ExtendedError;
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
  public sendSuccess(res: Response, data: unknown, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send error response
   */
  public sendError(res: Response, message: string, statusCode: number = 500, code?: string): void {
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
  public validateRequired(fields: Record<string, unknown>): void {
    const missing = Object.entries(fields)
      .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key, _]) => key);

    if (missing.length > 0) {
      throw this.createError(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw this.createError('Invalid email format', 'VALIDATION_ERROR', 400);
    }
  }

  /**
   * Validate password strength
   */
  public validatePassword(password: string): void {
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
  public setEnabled(enabled: boolean): void {
  this._isEnabled = enabled;
  this.logger.info(`Error handling ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if error handling is enabled
   */
  public isEnabled(): boolean {
  return this._isEnabled;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const asyncHandler = errorHandler.asyncHandler.bind(errorHandler);
export const createError = errorHandler.createError.bind(errorHandler);
export const sendSuccess = errorHandler.sendSuccess.bind(errorHandler);
export const sendError = errorHandler.sendError.bind(errorHandler);
export const validateRequired = errorHandler.validateRequired.bind(errorHandler);
export const validateEmail = errorHandler.validateEmail.bind(errorHandler);
export const validatePassword = errorHandler.validatePassword.bind(errorHandler);
