/**
 * Pure Serverless Authentication Helpers
 * 
 * Replaces Express middleware with direct function calls for auth validation.
 * No Express types, no middleware chain - just pure functions.
 */

import type { VercelRequest } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { storage } from '../storage.js';

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// JWKS resolver
const remoteJwks = createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Verify JWT token and get payload
 */
async function verifyJWTToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
    });
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract and validate user from Bearer token in request headers
 * @returns User object if authenticated, null otherwise
 */
export async function getUserFromRequest(req: VercelRequest) {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    
    if (!authHeader) {
      return null;
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.slice(7);
    if (!token) {
      return null;
    }
    
    // Verify JWT token
    const payload = await verifyJWTToken(token);
    
    // Extract user ID from JWT
    const userId = payload?.sub || payload?.user_id || payload?.id;
    if (!userId) {
      return null;
    }
    
    // Get user from database
    const user = await storage.getUser(userId);
    return user;
    
  } catch (error) {
    console.error('[AUTH ERROR] Failed to get user from request:', error);
    return null;
  }
}

/**
 * Require authentication - throws if user is null
 * Use this for protected endpoints
 */
export function requireAuth<T>(user: T | null): asserts user is T {
  if (!user) {
    throw new Error('Authentication required');
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === 'admin' || user?.email?.includes('@ssasocial.com');
}

/**
 * Require admin access - throws if user is not admin
 */
export function requireAdmin(user: any): void {
  requireAuth(user);
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}
