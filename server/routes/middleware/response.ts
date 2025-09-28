/**
 * Type-Safe API Response Helpers
 * Provides consistent response formatting with proper typing
 */

import { Response } from 'express';
import { ApiResponse, ApiError, ApiErrorCode, PaginatedResponse } from '../../../shared/types/api.js';

/**
 * Send a successful API response
 */
export function sendApiSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send a paginated API response
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): void {
  const paginatedData: PaginatedResponse<T> = {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total
  };
  
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: paginatedData,
    message,
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(response);
}

/**
 * Send an API error response
 */
export function sendApiError(
  res: Response,
  error: ApiError,
  statusCode: number = 500
): void {
  const response: ApiResponse<null> = {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
  
  res.status(statusCode).json(response);
}

/**
 * Create and send a validation error response
 */
export function sendValidationError(
  res: Response,
  message: string,
  errors: string[],
  field?: string
): void {
  const error: ApiError = {
    code: ApiErrorCode.VALIDATION_ERROR,
    message,
    field,
    details: { errors }
  };
  
  sendApiError(res, error, 400);
}

/**
 * Create and send an authentication error response
 */
export function sendAuthError(
  res: Response,
  message: string = 'Authentication required'
): void {
  const error: ApiError = {
    code: ApiErrorCode.AUTHENTICATION_ERROR,
    message
  };
  
  sendApiError(res, error, 401);
}

/**
 * Create and send an authorization error response
 */
export function sendAuthorizationError(
  res: Response,
  message: string = 'Insufficient permissions'
): void {
  const error: ApiError = {
    code: ApiErrorCode.AUTHORIZATION_ERROR,
    message
  };
  
  sendApiError(res, error, 403);
}

/**
 * Create and send a not found error response
 */
export function sendNotFoundError(
  res: Response,
  message: string = 'Resource not found'
): void {
  const error: ApiError = {
    code: ApiErrorCode.NOT_FOUND,
    message
  };
  
  sendApiError(res, error, 404);
}

/**
 * Create and send a conflict error response
 */
export function sendConflictError(
  res: Response,
  message: string,
  details?: Record<string, unknown>
): void {
  const error: ApiError = {
    code: ApiErrorCode.CONFLICT,
    message,
    details
  };
  
  sendApiError(res, error, 409);
}

/**
 * Create and send a rate limit error response
 */
export function sendRateLimitError(
  res: Response,
  message: string = 'Rate limit exceeded'
): void {
  const error: ApiError = {
    code: ApiErrorCode.RATE_LIMIT,
    message
  };
  
  sendApiError(res, error, 429);
}

/**
 * Create and send a service unavailable error response
 */
export function sendServiceUnavailableError(
  res: Response,
  message: string = 'Service temporarily unavailable'
): void {
  const error: ApiError = {
    code: ApiErrorCode.SERVICE_UNAVAILABLE,
    message
  };
  
  sendApiError(res, error, 503);
}

/**
 * Create and send an internal server error response
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error',
  details?: Record<string, unknown>
): void {
  const error: ApiError = {
    code: ApiErrorCode.INTERNAL_ERROR,
    message,
    details
  };
  
  sendApiError(res, error, 500);
}

/**
 * Create and send a Maya-specific error response
 */
export function sendMayaError(
  res: Response,
  message: string,
  details?: Record<string, unknown>
): void {
  const error: ApiError = {
    code: ApiErrorCode.MAYA_ERROR,
    message,
    details
  };
  
  sendApiError(res, error, 500);
}

/**
 * Handle and format error responses based on error type
 */
export function handleErrorResponse(res: Response, error: unknown): void {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    // Check if it's a validation error
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      sendValidationError(res, error.message, [error.message]);
      return;
    }
    
    // Check if it's an authentication error
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      sendAuthError(res, error.message);
      return;
    }
    
    // Check if it's an authorization error
    if (error.message.includes('authorization') || error.message.includes('forbidden')) {
      sendAuthorizationError(res, error.message);
      return;
    }
    
    // Check if it's a not found error
    if (error.message.includes('not found')) {
      sendNotFoundError(res, error.message);
      return;
    }
    
    // Default to internal server error
    sendInternalError(res, error.message, {
      stack: error.stack,
      name: error.name
    });
  } else {
    // Unknown error type
    sendInternalError(res, 'An unexpected error occurred', {
      error: String(error)
    });
  }
}