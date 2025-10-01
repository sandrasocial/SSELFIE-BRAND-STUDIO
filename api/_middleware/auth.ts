import { VercelRequest, VercelResponse } from '@vercel/node';
import { JWTVerifyResult, JWTPayload } from 'jose';
import { StackAuthUserInfo } from '../_shared/stack-auth-types.js';
import { LocalJWKSet } from '../_shared/jwks-types.js';
import { Response } from 'node-fetch';

// Constants
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// JWKS cache
let JWKS: LocalJWKSet | null = null;
let JWKS_LAST_FETCH = 0;
const JWKS_CACHE_TIME = 3600000; // 1 hour

// Parse cookie header helper
function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

// Timed fetch helper
async function timedFetch(url: string, ms = 3000, init?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<Response> {
  const AbortCtor = typeof AbortController !== 'undefined' ? AbortController : (globalThis as any).AbortController;
  const ac = new AbortCtor();
  const id = setTimeout(() => ac.abort(), ms);
  try {
    const f = (globalThis as any).fetch || fetch;
    return await f(url, { ...(init || {}), signal: ac.signal }) as Response;
  } finally {
    clearTimeout(id);
  }
}

// Get JWKS with improved caching and error handling
async function getJWKS() {
  const now = Date.now();
  
  // Use cached JWKS if available and not expired
  if (JWKS && (now - JWKS_LAST_FETCH) < JWKS_CACHE_TIME) {
    console.log('✅ Using cached JWKS');
    return JWKS;
  }

  console.log('🔄 Fetching fresh JWKS from Stack Auth...');

  try {
    const jose = await import('jose');
    const resp = await timedFetch(JWKS_URL, 5000); // Increased timeout
    
    if (!resp.ok) {
      throw new Error(`JWKS fetch failed: HTTP ${resp.status} ${resp.statusText}`);
    }
    
    const jwksData = await resp.json();
    
    if (!jwksData || !jwksData.keys || !Array.isArray(jwksData.keys)) {
      throw new Error('Invalid JWKS response format');
    }

    JWKS = jose.createLocalJWKSet(jwksData);
    JWKS_LAST_FETCH = now;
    
    console.log('✅ JWKS fetched and cached successfully');
    return JWKS;
    
  } catch (error) {
    console.error('❌ Failed to fetch JWKS:', {
      error: error instanceof Error ? error.message : error,
      url: JWKS_URL,
      cacheAge: JWKS_LAST_FETCH ? now - JWKS_LAST_FETCH : 'never'
    });
    
    // Return cached JWKS even if expired, as fallback
    if (JWKS) {
      console.log('⚠️ Using expired JWKS as fallback');
      return JWKS;
    }
    
    throw new Error('No JWKS available and cache is empty');
  }
}

// Verify JWT token with improved error handling
async function verifyJWTToken(token: string): Promise<JWTPayload & StackAuthUserInfo> {
  console.log('🔍 Verifying JWT token...');
  
  try {
    const jose = await import('jose');
    const jwks = await getJWKS();
    
    if (!jwks) {
      throw new Error('JWKS not available - authentication service unreachable');
    }

    console.log('🔍 Using JWKS for verification');

    const { payload } = await jose.jwtVerify(token, jwks, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
      clockTolerance: 30, // Allow 30 seconds clock skew
    });

    console.log('✅ JWT verification successful');
    
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

import { AuthenticatedUser } from '../_shared/auth-types.js';
import { AuthenticatedHandler, AuthOptions, AuthResponse, AuthenticatedRequest } from '../_shared/auth-middleware-types.js';

// Get authenticated user helper with improved token extraction
export async function getAuthenticatedUser(req: VercelRequest): Promise<AuthenticatedUser> {
  let accessToken: string | undefined;
  
  console.log('🔍 Auth: Extracting token from request...');
  
  // 1. Check Authorization header (preferred method)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
    console.log('✅ Token found in Authorization header');
  }

  // 2. Check Stack Auth specific headers
  if (!accessToken && req.headers['x-stack-access-token']) {
    accessToken = req.headers['x-stack-access-token'] as string;
    console.log('✅ Token found in x-stack-access-token header');
  }

  // 3. Check cookies for Stack Auth tokens (using the correct format)
  if (!accessToken) {
    const cookieHeader = req.headers.cookie;
    console.log('🔍 Full request headers:', JSON.stringify({
      cookie: cookieHeader,
      authorization: req.headers.authorization,
      'x-stack-access-token': req.headers['x-stack-access-token'],
      host: req.headers.host,
      origin: req.headers.origin
    }, null, 2));
    
    if (cookieHeader) {
      const cookies = parseCookieHeader(cookieHeader);
      console.log('🔍 Parsed cookies:', Object.keys(cookies));
      console.log('🔍 Cookie values (first 50 chars):', Object.fromEntries(
        Object.entries(cookies).map(([k, v]) => [k, v.substring(0, 50) + (v.length > 50 ? '...' : '')])
      ));
      
      // Helper function to extract JWT from Stack Auth cookie format
      const tryParseAccessFromCookieValue = (val: unknown): string | undefined => {
        if (!val || typeof val !== 'string') return undefined;
        try {
          // New format: JSON array ["token_id", "jwt"]
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
            console.log('✅ Successfully parsed JSON array cookie format');
            return parsed[1] as string;
          }
        } catch {
          // Some environments may store the raw JWT as a string
          if (val.split('.').length === 3) {
            console.log('✅ Found raw JWT in cookie');
            return val; // looks like a JWT
          }
        }
        return undefined;
      };
      
      // 1) Check exact 'stack-access' cookie first
      const stackAccess = cookies['stack-access'];
      if (stackAccess) {
        console.log('🔍 Found stack-access cookie, length:', stackAccess.length);
        const token = tryParseAccessFromCookieValue(stackAccess);
        if (token) {
          accessToken = token;
          console.log('✅ Token found in stack-access cookie (JSON format)');
        }
      }

      // 2) Check any cookie whose name starts with 'stack-access'
      if (!accessToken) {
        const matchingKeys = Object.keys(cookies).filter(k => k.startsWith('stack-access'));
        console.log('🔍 Stack-access cookies found:', matchingKeys);
        for (const key of matchingKeys) {
          const token = tryParseAccessFromCookieValue(cookies[key]);
          if (token) {
            accessToken = token;
            console.log(`✅ Token found in cookie '${key}' (JSON format)`);
            break;
          }
        }
      }

      // 3) Legacy fallback for simple string tokens
      if (!accessToken) {
        const legacyNames = ['stack-access-token', 'stack_session'];
        for (const cookieName of legacyNames) {
          const cookieValue = cookies[cookieName];
          if (cookieValue && 
              cookieValue !== 'undefined' && 
              cookieValue !== 'null' && 
              cookieValue.length > 20 &&
              cookieValue.split('.').length === 3) {
            accessToken = cookieValue;
            console.log(`✅ Token found in legacy cookie: ${cookieName}`);
            break;
          }
        }
      }
    }
  }

  if (!accessToken) {
    console.log('❌ No valid access token found in request');
    throw new Error('No access token found');
  }

  console.log('🔍 Token extracted, length:', accessToken.length);

  // Verify JWT token
  const userInfo = await verifyJWTToken(accessToken);

  // Extract user info from JWT
  const stackAuthId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
  const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
  const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');

  // Ensure we have required fields
  if (!stackAuthId || !userEmail) {
    throw new Error('Invalid user info: missing required fields');
  }

  console.log('🔍 Auth middleware: Stack user info received:', {
    stackAuthId: stackAuthId.substring(0, 8) + '...',
    email: userEmail,
    displayName: userName,
    hasProfileImage: !!(userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url)
  });

  // 🔥 HARDENED: Database lookup with bulletproof Stack Auth ID and email linking
  try {
    console.log('🔍 Starting hardened database user lookup...');
    
    const { userService } = await import('../../server/services/user-service.js');
    
    // Call hardened getOrCreateUser function with three-step lookup strategy
    const dbUserProfile = await userService.getOrCreateUser(
      stackAuthId,
      userEmail,
      userName,
      (userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url) || null
    );

    console.log('✅ User service returned profile:', {
      userId: dbUserProfile.id,
      email: dbUserProfile.email,
      displayName: dbUserProfile.displayName
    });

    // Get the full database user record to ensure complete data
    const { storage } = await import('../../server/storage.js');
    const dbUser = await storage.getUserByStackAuthId(stackAuthId);
    
    if (!dbUser) {
      // This should not happen after hardened getOrCreateUser, but handle gracefully
      console.error('❌ Critical: User not found by Stack Auth ID after hardened sync');
      throw new Error(`Failed to retrieve user by Stack Auth ID ${stackAuthId.substring(0, 8)}... after successful user service call`);
    }

    console.log('✅ Full database user retrieved after hardened lookup:', {
      id: dbUser.id,
      email: dbUser.email,
      stackAuthId: dbUser.stackAuthId?.substring(0, 8) + '...',
      plan: dbUser.plan,
      role: dbUser.role
    });

    console.log('✅ Database user synced:', {
      id: dbUser.id,
      email: dbUser.email,
      plan: dbUser.plan,
      hasStackAuthId: !!dbUser.stackAuthId
    });

    // Return the complete user object with Stack Auth info
    const user: AuthenticatedUser = {
      ...dbUser,
      stackUser: userInfo
    };

    return user;

  } catch (dbError) {
    console.error('❌ Database sync failed, using fallback user:', dbError);
    
    // Fallback: create minimal user object if database sync fails
    const fallbackUser: AuthenticatedUser = {
      id: stackAuthId,
      stackAuthId: stackAuthId,
      email: userEmail,
      firstName: userName?.split(' ')[0] || null,
      lastName: userName?.split(' ').slice(1).join(' ') || null,
      displayName: userName || null,
      profileImageUrl: (userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url) || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      plan: 'sselfie-studio',
      role: 'user',
      monthlyGenerationLimit: 100,
      generationsUsedThisMonth: 0,
      mayaAiAccess: true,
      victoriaAiAccess: false,
      hasRetrainingAccess: false,
      retrainingSessionId: null,
      retrainingPaidAt: null,
      preferredOnboardingMode: 'conversational',
      onboardingProgress: null,
      gender: null,
      profession: null,
      brandStyle: null,
      photoGoals: null,
      trainingCoachingStarted: false,
      trainingCoachingCompleted: false,
      trainingCoachingPhase: null,
      trainingCoachingStep: 0,
      brandStrategyContext: null,
      stackUser: userInfo
    };

    return fallbackUser;
  }
}

// Auth middleware
export async function withAuth<T>(
  req: VercelRequest,
  res: VercelResponse,
  handler: AuthenticatedHandler<T>,
  options: AuthOptions = {}
): Promise<T> {
  // Handle bypass option (e.g. for cron jobs)
  if (options.bypass || req.url?.startsWith('/api/cron/')) {
    console.log('🔓 Bypassing auth:', {
      url: req.url,
      method: req.method,
      headers: req.headers,
      query: req.query,
      bypass: options.bypass
    });
    try {
      return await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('❌ Handler failed:', {
        url: req.url,
        method: req.method,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error
      });
      throw error;
    }
  }

  try {
    // Add user to request
    const user = await getAuthenticatedUser(req);
    (req as AuthenticatedRequest).user = user;

    // Call handler with authenticated request
    return await handler(req as AuthenticatedRequest, res);
  } catch (error) {
    // For optional auth, allow request through without user
    if (options.optional) {
      console.log('📝 Optional auth failed, continuing without user');
      return await handler(req as AuthenticatedRequest, res);
    }

    console.error('❌ Auth failed:', error);

    // Clear cookies on auth failure with proper domain configuration
    const domain = process.env.VERCEL_ENV === 'production' 
                   ? '.sselfie.ai' // Use root domain for production cookie setting
                   : undefined;   // Use default for development/preview environments
    
    const cookieOptions = {
      domain: domain,
      secure: true,
      sameSite: 'Lax' as const, // Must be Lax or Strict for security
      path: '/',
      httpOnly: true,
      maxAge: 0
    };
    
    const expired = [
      'stack-access',
      'stack-access-token',
      'stack_session',
      '__Secure-next-auth.session-token' 
    ].map(name => {
      const cookieString = `${name}=; Path=${cookieOptions.path}; HttpOnly; Secure; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}`;
      return domain ? `${cookieString}; Domain=${domain}` : cookieString;
    });
    
    res.setHeader('Set-Cookie', expired);
    
    const response: AuthResponse<null> = {
      status: 401,
      message: 'Authentication required',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(401).json(response);
    return null as any; // Return value to satisfy TypeScript
  }
}