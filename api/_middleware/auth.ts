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
 * ✅ FIXED: Supports both regular and anonymous user tokens
 * ✅ FIXED: Invalidates JWKS cache on verification failure to catch key rotations
 */
async function verifyJWTToken(token: string): Promise<JWTPayload & StackAuthUserInfo> {
  try {
    const { jwtVerify, createLocalJWKSet } = await import('jose');
    const jwks = await getJWKS();

    if (!jwks) {
      throw new Error('JWKS not available');
    }

    const localJwks = createLocalJWKSet(jwks);

    // ✅ NEW: Support both regular and anonymous user tokens
    // Regular tokens: issuer = https://api.stack-auth.com/api/v1/projects/{projectId}
    // Anonymous tokens: issuer = https://api.stack-auth.com/api/v1/projects-anonymous-users/{projectId}
    const anonymousIssuer = STACK_ISSUER.replace(
      '/projects/',
      '/projects-anonymous-users/'
    );

    const { payload } = await jwtVerify(token, localJwks, {
      issuer: [STACK_ISSUER, anonymousIssuer],
      audience: [STACK_PROJECT_ID, `${STACK_PROJECT_ID}:anon`],
      clockTolerance: 30, // Allow 30 seconds clock skew
    });

    return payload as JWTPayload & StackAuthUserInfo;
  } catch (error) {
    console.error('❌ JWT verification failed:', {
      error: error instanceof Error ? error.message : error,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });

    // ✅ FIXED: Invalidate JWKS cache on verification failure
    // This ensures we fetch fresh keys if Stack Auth rotated them
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('signature') || errorMsg.includes('key') || errorMsg.includes('invalid')) {
      console.warn('⚠️ Invalidating JWKS cache due to verification failure - may indicate key rotation');
      JWKS_CACHE = null;
      JWKS_LAST_FETCH = 0;
    }

    throw new Error(`JWT verification failed: ${(error as Error).message}`);
  }
}

/**
 * Validate JWT token format (must be 3 parts separated by dots)
 * ✅ NEW: Prevent malformed tokens from being processed
 * 🔥 ENHANCED: Validate each part is valid base64url to prevent image data being treated as JWT
 */
function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  // JWT must have exactly 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Each part must be non-empty
  if (parts.some(part => !part)) return false;

  // Token should not look like JSON (starts with [ or {)
  if (token.startsWith('[') || token.startsWith('{')) return false;

  // 🔥 FIX: Each part must be valid base64url (alphanumeric, -, _)
  // This prevents image data or other binary data from being treated as JWT
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  if (!parts.every(part => base64urlRegex.test(part))) {
    return false;
  }

  return true;
}

/**
 * Extract JWT token from Stack Auth cookie format
 * Stack Auth stores tokens as: ["refreshToken", "accessToken"]
 * ✅ NEW: Handle Stack Auth's JSON array cookie format
 */
function extractTokenFromStackAuthCookie(cookieValue: string): string | undefined {
  try {
    // Try to parse as JSON array (Stack Auth format)
    const decoded = decodeURIComponent(cookieValue);

    // Check if it looks like a JSON array
    if (decoded.startsWith('[')) {
      const parsed = JSON.parse(decoded);

      // Stack Auth format: ["refreshToken", "accessToken"]
      if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
        const token = parsed[1];
        if (isValidJWTFormat(token)) {
          console.log('✅ Extracted token from Stack Auth cookie array');
          return token;
        }
      }
    }

    // Try direct JWT if not an array
    if (isValidJWTFormat(decoded)) {
      console.log('✅ Found direct JWT in cookie');
      return decoded;
    }
  } catch (error) {
    console.warn('⚠️ Failed to parse Stack Auth cookie:', error);
  }

  return undefined;
}

/**
 * Extract token from request (cookies or headers)
 * ✅ SIMPLIFIED: Stack Auth uses 'stack-access' as the primary cookie name
 * ✅ NEW: Handle Stack Auth's JSON array cookie format
 */
function extractToken(req: VercelRequest): string | undefined {
  const cookies = parseCookies(req.headers.cookie);

  // ✅ PRIMARY: Stack Auth's standard cookie name
  if (cookies['stack-access']) {
    const token = extractTokenFromStackAuthCookie(cookies['stack-access']);
    if (token) {
      return token;
    }
  }

  // FALLBACK: Try alternative cookie names for backward compatibility
  const fallbackCookieNames = [
    'stack_access',
    'stack-access-token',
    'stack_access_token',
  ];

  for (const name of fallbackCookieNames) {
    const cookieValue = cookies[name];
    if (cookieValue) {
      const token = extractTokenFromStackAuthCookie(cookieValue);
      if (token) {
        return token;
      }
    }
  }

  // FALLBACK: Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (isValidJWTFormat(token)) {
      console.log('✅ Found token in Authorization header');
      return token;
    }
  }

  // FALLBACK: Custom header forwarded by proxy
  if (req.headers['x-stack-access-token']) {
    const token = req.headers['x-stack-access-token'] as string;
    if (isValidJWTFormat(token)) {
      console.log('✅ Found token in custom header');
      return token;
    }
  }

  return undefined;
}

/**
 * Extract refresh token from request cookies
 * ✅ NEW: Support token refresh mechanism
 */
function extractRefreshToken(req: VercelRequest): string | undefined {
  const cookies = parseCookies(req.headers.cookie);

  // ✅ PRIMARY: Stack Auth's standard refresh token cookie name
  if (cookies['stack-refresh']) {
    const token = cookies['stack-refresh'];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }

  // FALLBACK: Try alternative refresh token cookie names
  const fallbackCookieNames = [
    'stack_refresh',
    'stack-refresh-token',
    'stack_refresh_token',
  ];

  for (const name of fallbackCookieNames) {
    const token = cookies[name];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }

  return undefined;
}

/**
 * Refresh access token using refresh token
 * ✅ NEW: Implement token refresh mechanism
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    // Call Stack Auth refresh endpoint
    const response = await fetchWithTimeout(
      `${STACK_AUTH_API_URL}/api/v1/auth/sessions/current/refresh`,
      5000,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-stack-project-id': STACK_PROJECT_ID,
          'x-stack-refresh-token': refreshToken,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Token refresh failed:', {
        status: response.status,
        statusText: response.statusText
      });
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.accessToken || data.access_token;

    if (!newAccessToken) {
      console.error('❌ No access token in refresh response');
      return null;
    }

    console.log('✅ Token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('❌ Token refresh error:', {
      error: error instanceof Error ? error.message : error
    });
    return null;
  }
}

/**
 * Get or create database user from Stack Auth payload
 * ✅ FIXED: Uses upsertUser to prevent race conditions with concurrent requests
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

    // Extract user data from Stack Auth payload
    const email = payload.email || payload.primary_email || payload.email_address;
    const displayName = payload.displayName || payload.display_name || payload.name;

    // ✅ FIXED: Use upsertUser instead of separate get/create logic
    // This prevents race conditions where multiple concurrent requests could create duplicate users
    const user = await storage.upsertUser({
      id: userId,
      stackAuthId: userId,
      email: email || null,
      displayName: displayName || null,
      firstName: payload.given_name || null,
      lastName: null,
      profileImageUrl: payload.profileImageUrl || payload.profile_image_url || null,
    });

    if (!user) {
      throw new Error('Failed to create or retrieve user from database');
    }

    // Update last login timestamp
    let updatedUser = user;
    try {
      const result = await storage.updateUserProfile(userId, {
        lastLoginAt: new Date()
      });
      if (result) {
        updatedUser = result;
      }
    } catch (updateError) {
      console.warn('⚠️ Failed to update user profile, using upserted user:', updateError);
      // Continue with the upserted user if update fails
    }

    // ✅ NEW: Ensure all required fields exist
    return {
      id: updatedUser.id || userId,
      stackAuthId: updatedUser.stackAuthId || userId,
      email: updatedUser.email || email || null,
      displayName: updatedUser.displayName || displayName || null,
      firstName: updatedUser.firstName || payload.given_name || null,
      lastName: updatedUser.lastName || null,
      profileImageUrl: updatedUser.profileImageUrl || payload.profileImageUrl || payload.profile_image_url || null,
      onboardingProgress: (updatedUser.onboardingProgress || {}) as any,
      lastLoginAt: updatedUser.lastLoginAt || new Date(),
      stackUser: payload as StackAuthUserInfo
    } as AuthenticatedUser;
  } catch (error) {
    console.error('❌ Failed to get or create database user:', {
      error: error instanceof Error ? error.message : error,
      userId: payload.sub || payload.user_id || payload.id
    });
    throw error;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Detect JWT error type for better error handling
 * ✅ NEW: Support specific error types
 */
function getJWTErrorCode(error: any): string {
  if (error.code) return error.code;

  const message = error.message || String(error);

  if (message.includes('expired')) return 'ERR_JWT_EXPIRED';
  if (message.includes('signature')) return 'ERR_JWT_INVALID_SIGNATURE';
  if (message.includes('audience')) return 'ERR_JWT_INVALID_AUDIENCE';
  if (message.includes('issuer')) return 'ERR_JWT_INVALID_ISSUER';
  if (message.includes('malformed')) return 'ERR_JWT_MALFORMED';

  return 'ERR_JWT_UNKNOWN';
}

// ============================================================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * ✅ UNIFIED withAuth middleware - Single source of truth for all authentication
 *
 * Features:
 * - Supports regular and anonymous user tokens
 * - Automatic token refresh on expiration
 * - Multiple token extraction methods
 * - Specific error handling
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
      console.warn('⚠️ No valid authentication token found', {
        url: req.url,
        method: req.method,
        hasCookies: !!req.headers.cookie,
        hasAuthHeader: !!req.headers.authorization,
        hasCustomHeader: !!req.headers['x-stack-access-token']
      });

      if (options.optional) {
        // Optional auth - continue without user
        return await handler(req as AuthenticatedRequest, res);
      }

      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided'
      });
    }

    // ✅ NEW: Log token extraction success
    console.log('✅ Token extracted successfully', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
      url: req.url
    });

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
    let payload: JWTPayload & StackAuthUserInfo;

    try {
      payload = await verifyJWTToken(token);
    } catch (verifyError) {
      // ✅ NEW: Handle token expiration with refresh
      const errorCode = getJWTErrorCode(verifyError);

      if (errorCode === 'ERR_JWT_EXPIRED') {
        console.log('⏰ Token expired, attempting refresh...');

        const refreshToken = extractRefreshToken(req);

        if (refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);

          if (newAccessToken) {
            // ✅ NEW: Set new token in cookie
            res.setHeader(
              'Set-Cookie',
              `stack-access=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=Lax`
            );

            // Retry verification with new token
            try {
              payload = await verifyJWTToken(newAccessToken);
              console.log('✅ Token refreshed and verified successfully');
            } catch (retryError) {
              console.error('❌ Verification failed after refresh:', retryError);
              return res.status(401).json({
                error: 'Token refresh failed',
                code: 'TOKEN_REFRESH_FAILED',
                message: 'Failed to verify refreshed token'
              });
            }
          } else {
            return res.status(401).json({
              error: 'Token expired',
              code: 'TOKEN_EXPIRED',
              message: 'Your session has expired. Please sign in again.'
            });
          }
        } else {
          return res.status(401).json({
            error: 'Token expired',
            code: 'TOKEN_EXPIRED',
            message: 'Your session has expired. Please sign in again.'
          });
        }
      } else {
        // ✅ NEW: Return specific error codes
        console.error('❌ JWT verification failed:', {
          code: errorCode,
          error: verifyError instanceof Error ? verifyError.message : verifyError,
          url: req.url,
          method: req.method
        });

        const errorResponses: Record<string, any> = {
          'ERR_JWT_INVALID_SIGNATURE': {
            error: 'Invalid token',
            code: 'INVALID_SIGNATURE',
            message: 'Token signature is invalid'
          },
          'ERR_JWT_INVALID_AUDIENCE': {
            error: 'Invalid token',
            code: 'INVALID_AUDIENCE',
            message: 'Token is for a different project'
          },
          'ERR_JWT_INVALID_ISSUER': {
            error: 'Invalid token',
            code: 'INVALID_ISSUER',
            message: 'Token issuer is invalid'
          },
          'ERR_JWT_MALFORMED': {
            error: 'Invalid token',
            code: 'MALFORMED_TOKEN',
            message: 'Token format is invalid'
          }
        };

        const errorResponse = errorResponses[errorCode] || {
          error: 'Authentication failed',
          code: errorCode,
          message: verifyError instanceof Error ? verifyError.message : 'Unknown error'
        };

        return res.status(401).json(errorResponse);
      }
    }

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

