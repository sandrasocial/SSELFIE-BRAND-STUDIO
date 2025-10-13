/**
 * Pure Serverless Authentication Helpers
 * 
 * Replaces Express middleware with direct function calls for auth validation.
 * No Express types, no middleware chain - just pure functions.
 */

import type { VercelRequest } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { storage } from '../storage.js';
import { STACK_PROJECT_ID, STACK_JWKS_URL, STACK_ISSUER } from '../config/env.js';

// JWKS resolver (uses centralized environment configuration)
const remoteJwks = createRemoteJWKSet(new URL(STACK_JWKS_URL));

/**
 * Verify JWT token and get payload
 */
async function verifyJWTToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer: STACK_ISSUER,
      audience: STACK_PROJECT_ID,
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
      console.log('[AUTH] No authorization header');
      return null;
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] Authorization header does not start with Bearer');
      return null;
    }
    
    const token = authHeader.slice(7);
    if (!token) {
      console.log('[AUTH] Token is empty after extracting Bearer');
      return null;
    }
    
    console.log(`[AUTH] Verifying JWT token with JWKS: ${STACK_JWKS_URL}`);
    console.log(`[AUTH] Expected issuer: ${STACK_ISSUER}`);
    console.log(`[AUTH] Expected audience: ${STACK_PROJECT_ID}`);
    
    // Verify JWT token
    const payload = await verifyJWTToken(token);
    console.log('[AUTH] JWT verified successfully, payload:', JSON.stringify(payload, null, 2));
    
    // Extract user ID from JWT
    const userId = payload?.sub || payload?.user_id || payload?.id;
    if (!userId) {
      console.log('[AUTH] No userId found in JWT payload');
      return null;
    }
    
    console.log(`[AUTH] Fetching user from database for userId: ${userId}`);
    
    // Get user from database by Stack Auth ID (JWT sub claim)
    // This handles cases where user.id might still be legacy ID but stackAuthId is the JWT sub
    const user = await storage.getUserByStackAuthId(userId);
    
    if (!user) {
      console.log(`[AUTH] User not found in database for stackAuthId: ${userId}`);
      return null;
    }
    
    console.log(`[AUTH] User found: ${user.id} (${user.email})`);
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
