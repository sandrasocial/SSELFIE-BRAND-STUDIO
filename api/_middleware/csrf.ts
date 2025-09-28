import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { z } from 'zod';

// Constants
const CSRF_COOKIE_NAME = 'X-CSRF-Token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_EXPIRY = 3600; // 1 hour

// Redis client for token storage
const redis = new Redis(process.env.REDIS_URL || '');

// Zod schema for CSRF token
const csrfTokenSchema = z.string().uuid();

// CSRF token validation error
class CSRFValidationError extends Error {
  constructor(message = 'Invalid CSRF token') {
    super(message);
    this.name = 'CSRFValidationError';
  }
}

/**
 * Generate a new CSRF token
 */
export async function generateToken(): Promise<string> {
  const token = uuidv4();
  await redis.setex(`csrf:${token}`, TOKEN_EXPIRY, '1');
  return token;
}

/**
 * Validate a CSRF token
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    // Validate token format
    csrfTokenSchema.parse(token);
    
    // Check if token exists in Redis
    const exists = await redis.exists(`csrf:${token}`);
    return exists === 1;
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
  req: VercelRequest,
  res: VercelResponse,
  next: () => void
) {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers?.[CSRF_HEADER_NAME.toLowerCase()];

  // Validate both tokens exist and match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new CSRFValidationError();
  }

  // Validate token in Redis
  const isValid = await validateToken(headerToken as string);
  if (!isValid) {
    throw new CSRFValidationError('Expired or invalid CSRF token');
  }

  // Generate new token for next request
  const newToken = await generateToken();
  
  // Set new token in cookie
  res.setHeader('Set-Cookie', `${CSRF_COOKIE_NAME}=${newToken}; Path=/; HttpOnly; SameSite=Strict; Secure`);
  
  return next();
}