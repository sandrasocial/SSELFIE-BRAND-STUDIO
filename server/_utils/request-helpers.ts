/**
 * Pure Serverless Request Helpers
 * 
 * Utility functions for extracting data from Vercel requests.
 * No Express types, just standard request parsing.
 */

import type { VercelRequest } from '@vercel/node';

/**
 * Get request body with type safety
 */
export function getRequestBody<T = any>(req: VercelRequest): T {
  return req.body as T;
}

/**
 * Get single query parameter
 * Handles both string and string[] from query params
 */
export function getQueryParam(req: VercelRequest, key: string): string | undefined {
  const value = req.query?.[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Get all query parameters as strings
 */
export function getQueryParams(req: VercelRequest): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!req.query) return params;
  
  for (const [key, value] of Object.entries(req.query)) {
    if (value) {
      params[key] = Array.isArray(value) ? value[0] || '' : value;
    }
  }
  
  return params;
}

/**
 * Extract path parameters from URL using regex pattern
 * Example: extractPathParams('/api/images/123', /\/api\/images\/(?<id>\d+)/)
 * Returns: { id: '123' }
 */
export function extractPathParams(url: string, pattern: RegExp): Record<string, string> {
  const match = url?.match(pattern);
  return match?.groups || {};
}

/**
 * Parse JSON body safely with error handling
 */
export async function parseJsonBody<T = any>(req: VercelRequest): Promise<T | null> {
  try {
    // Body is already parsed by Vercel
    if (req.body) {
      return req.body as T;
    }
    
    return null;
  } catch (error) {
    console.error('[REQUEST ERROR] Failed to parse JSON body:', error);
    return null;
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): { valid: true } | { valid: false; missing: string[] } {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

/**
 * Extract user ID from URL path
 * Example: /api/training-progress/user123 -> user123
 */
export function extractUserIdFromPath(url: string): string | null {
  const match = url.match(/\/api\/training-progress\/([^/?]+)/);
  return match?.[1] || null;
}

/**
 * Extract image ID from URL path
 * Example: /api/images/img123/favorite -> img123
 */
export function extractImageIdFromPath(url: string): string | null {
  const match = url.match(/\/api\/images\/([^/?]+)/);
  return match?.[1] || null;
}
