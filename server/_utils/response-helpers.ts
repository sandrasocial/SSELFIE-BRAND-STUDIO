/**
 * Pure Serverless Response Helpers
 * 
 * Standard response patterns for Vercel serverless functions.
 * Consistent JSON formatting and error handling.
 */

import type { VercelResponse } from '@vercel/node';

/**
 * Standard success response
 */
export function sendSuccess<T = any>(
  res: VercelResponse,
  data: T,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Standard error response
 */
export function sendError(
  res: VercelResponse,
  message: string,
  statusCode: number = 500,
  details?: any
): void {
  const response: any = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Not found response
 */
export function sendNotFound(res: VercelResponse, resource: string = 'Resource'): void {
  sendError(res, `${resource} not found`, 404);
}

/**
 * Unauthorized response
 */
export function sendUnauthorized(res: VercelResponse, message: string = 'Authentication required'): void {
  sendError(res, message, 401);
}

/**
 * Forbidden response
 */
export function sendForbidden(res: VercelResponse, message: string = 'Access forbidden'): void {
  sendError(res, message, 403);
}

/**
 * Bad request response
 */
export function sendBadRequest(res: VercelResponse, message: string = 'Bad request', details?: any): void {
  sendError(res, message, 400, details);
}

/**
 * Method not allowed response
 */
export function sendMethodNotAllowed(res: VercelResponse, allowedMethods: string[] = []): void {
  const message = allowedMethods.length > 0
    ? `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    : 'Method not allowed';
    
  if (allowedMethods.length > 0) {
    res.setHeader('Allow', allowedMethods.join(', '));
  }
  
  sendError(res, message, 405);
}

/**
 * Set no-cache headers
 */
export function setNoCacheHeaders(res: VercelResponse): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

/**
 * Set CORS headers
 */
export function setCorsHeaders(res: VercelResponse, origin: string = '*'): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(res: VercelResponse): void {
  setCorsHeaders(res);
  res.status(204).end();
}

/**
 * Validate HTTP method
 */
export function validateMethod(
  req: { method?: string },
  res: VercelResponse,
  allowedMethods: string[]
): boolean {
  if (!req.method || !allowedMethods.includes(req.method)) {
    sendMethodNotAllowed(res, allowedMethods);
    return false;
  }
  return true;
}
