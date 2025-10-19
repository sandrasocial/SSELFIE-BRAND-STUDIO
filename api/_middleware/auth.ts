/**
 * ✅ UNIFIED Authentication Middleware for Vercel Serverless Functions
 *
 * This is the SINGLE SOURCE OF TRUTH for all authentication across the application.
 * It consolidates the previous dual-auth system into one production-ready implementation.
 *
 * Features:
 * - Stack Auth JWT verification with JWKS caching
 * - Cookie-based token extraction (Stack Auth default)
 * - Database user synchronization
 * - Comprehensive error handling
 * - Performance optimized with token caching
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { JWTPayload } from 'jose';
import type { AuthenticatedRequest, AuthenticatedUser, AuthOptions } from '../_shared/auth-types.js';
import type { StackAuthUserInfo } from '../_shared/stack-auth-types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

import { STACK_PROJECT_ID, STACK_AUTH_API_URL, JWKS_URL, STACK_ISSUER } from '../../server/_shared/stack-config.js';

// Token cache for performance
const TOKEN_CACHE = new Map<string, { payload: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// JWKS cache
let JWKS_CACHE: any = null;
let JWKS_LAST_FETCH = 0;
const JWKS_CACHE_TIME = 3600000; // 1 hour

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const value = decodeURIComponent(part.slice(idx + 1).trim());
      cookies[key] = value;
    }
  }
  return cookies;
}

/**
 * Hash token for cache key
 */
function hashToken(token: string): string {
  return Buffer.from(token).toString('base64').substring(0, 32);
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs = 5000,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get JWKS with caching
 */
async function getJWKS() {
  const now = Date.now();

  // Return cached JWKS if still valid
  if (JWKS_CACHE && (now - JWKS_LAST_FETCH) < JWKS_CACHE_TIME) {
    return JWKS_CACHE;
  }

  try {
    const response = await fetchWithTimeout(JWKS_URL, 5000);

    if (!response.ok) {
      throw new Error(`JWKS fetch failed: HTTP ${response.status}`);
    }

    const jwksData = await response.json();

    if (!jwksData?.keys || !Array.isArray(jwksData.keys)) {
      throw new Error('Invalid JWKS response format');
    }

    // Cache the JWKS data
    JWKS_CACHE = jwksData;
    JWKS_LAST_FETCH = now;

    return JWKS_CACHE;
  } catch (error) {
    console.error('❌ Failed to fetch JWKS:', {
      error: error instanceof Error ? error.message : error,
      url: JWKS_URL
    });

    // Return cached JWKS as fallback
    if (JWKS_CACHE) {
      return JWKS_CACHE;
    }

    throw new Error('No JWKS available');
  }
}

/**
 * Verify JWT token with Stack Auth JWKS
 */
async function verifyJWTToken(token: string): Promise<JWTPayload & StackAuthUserInfo> {
  try {
    const { jwtVerify, createLocalJWKSet } = await import('jose');
    const jwks = await getJWKS();

    if (!jwks) {
      throw new Error('JWKS not available');
    }

    const localJwks = createLocalJWKSet(jwks);

    const { payload } = await jwtVerify(token, localJwks, {
      issuer: STACK_ISSUER,
      audience: STACK_PROJECT_ID,
      clockTolerance: 30, // Allow 30 seconds clock skew
    });

    return payload as JWTPayload & StackAuthUserInfo;
  } catch (error) {
    console.error('❌ JWT verification failed:', {
      error: error instanceof Error ? error.message : error,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });

    throw new Error(`JWT verification failed: ${(error as Error).message}`);
  }
}

/**
 * Extract token from request (cookies or headers)
 */
function extractToken(req: VercelRequest): string | undefined {
  // 1) Cookies (preferred): support multiple Stack Auth cookie names and formats
  const cookies = parseCookies(req.headers.cookie);

  // Legacy/internal cookie used by some paths
  if (cookies['__stack_auth_token']) {
    return cookies['__stack_auth_token'];
  }

  const candidateCookieNames = [
    'stack-access',
    'stack_access',
    'stack-access-token',
    'stack_access_token',
    'stack-token',
    'stack_session',
  ];

  const tryParseCookieVal = (val?: string): string | undefined => {
    if (!val || typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    // JSON array format: ["token_id","jwt"]
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && typeof parsed[1] === 'string' && parsed[1]) {
          return parsed[1];
        }
      } catch {}
    }
    // JSON object format: { accessToken: "jwt" } or { token: "jwt" }
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        if (typeof obj?.accessToken === 'string' && obj.accessToken) return obj.accessToken;
        if (typeof obj?.token === 'string' && obj.token) return obj.token;
      } catch {}
    }
    // Raw JWT-like
    if (trimmed.split('.').length >= 3 && trimmed.length > 20) return trimmed;
    return undefined;
  };

  for (const name of candidateCookieNames) {
    const v = cookies[name];
    const token = tryParseCookieVal(v);
    if (token) return token;
  }

  // As a fallback, scan all cookies for a parsable token
  for (const [name, v] of Object.entries(cookies)) {
    if (/^stack[-_].*/i.test(name)) {
      const token = tryParseCookieVal(v);
      if (token) return token;
    }
  }

  // 2) Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 3) Custom header forwarded by our proxy (if used)
  if (req.headers['x-stack-access-token']) {
    return req.headers['x-stack-access-token'] as string;
  }

  return undefined;
}

/**
 * Get or create database user from Stack Auth payload
 */
async function getOrCreateDatabaseUser(
  payload: JWTPayload & StackAuthUserInfo
): Promise<AuthenticatedUser> {
  try {
    // Extract user ID from payload
    const userId = payload.sub || payload.user_id || payload.id;
    if (!userId) {
      throw new Error('No user ID in JWT payload');
    }

    // Get database storage
    const { storage } = await import('../../server/storage.js');

    // Try to get existing user
    let user = await storage.getUser(userId);

    if (!user) {
      // Create new user from Stack Auth payload
      const email = payload.email || payload.primary_email || payload.email_address;
      const displayName = payload.displayName || payload.display_name || payload.name;

      user = await storage.createUser({
        id: userId,
        stackAuthId: userId,
        email: email || null,
        displayName: displayName || null,
        firstName: payload.given_name || null,
        lastName: null,
        profileImageUrl: payload.profileImageUrl || payload.profile_image_url || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      });
    } else {
      // Update last login
      await storage.updateUserProfile(userId, { lastLoginAt: new Date() });
    }

    return {
      ...user,
      onboardingProgress: (user.onboardingProgress || {}) as any,
      stackUser: payload as StackAuthUserInfo
    } as AuthenticatedUser;
  } catch (error) {
    console.error('❌ Failed to get or create database user:', error);
    throw error;
  }
}

// ============================================================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * ✅ UNIFIED withAuth middleware - Single source of truth for all authentication
 *
 * Usage:
 * ```typescript
 * export default async (req: VercelRequest, res: VercelResponse) => {
 *   return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
 *     // Your handler code here
 *     const user = req.user;
 *     return res.json({ user });
 *   });
 * };
 * ```
 */
export async function withAuth<T = void>(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<T | void>,
  options: AuthOptions = {}
): Promise<any> {
  try {
    // Handle bypass option (for cron jobs, webhooks, etc.)
    if (options.bypass) {
      return await handler(req as AuthenticatedRequest, res);
    }

    // Extract token from request
    const token = extractToken(req);

    if (!token) {
      if (options.optional) {
        // Optional auth - continue without user
        return await handler(req as AuthenticatedRequest, res);
      }

      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided'
      });
    }

    // Check token cache
    const tokenHash = hashToken(token);
    const cached = TOKEN_CACHE.get(tokenHash);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      // Use cached payload
      const user = await getOrCreateDatabaseUser(cached.payload);
      (req as AuthenticatedRequest).user = user;
      return await handler(req as AuthenticatedRequest, res);
    }

    // Verify JWT token
    const payload = await verifyJWTToken(token);

    // Cache the payload
    TOKEN_CACHE.set(tokenHash, {
      payload,
      timestamp: Date.now()
    });

    // Get or create database user
    const user = await getOrCreateDatabaseUser(payload);

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    // Call handler
    return await handler(req as AuthenticatedRequest, res);
  } catch (error) {
    console.error('❌ Authentication failed:', {
      error: error instanceof Error ? error.message : error,
      url: req.url,
      method: req.method
    });

    return res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Optional authentication - doesn't block if no token
 */
export async function withOptionalAuth<T = void>(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: VercelRequest & { user?: AuthenticatedUser }, res: VercelResponse) => Promise<T | void>
): Promise<T | void> {
  return withAuth(req, res, handler, { optional: true });
}

