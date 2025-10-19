import { VercelRequest, VercelResponse } from '@vercel/node';
import { JWTVerifyResult, JWTPayload } from 'jose';
import { StackAuthUserInfo } from '../_shared/stack-auth-types.js';
import { LocalJWKSet } from '../_shared/jwks-types.js';

// Global type declarations for server environment
declare global {
  var Response: typeof globalThis.Response;
}

// Constants (canonical env names with fallbacks)
const STACK_PROJECT_ID = process.env.STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`;
// One-time debug
console.log('🔧 Stack Auth Middleware Env:', { projectId: STACK_PROJECT_ID });

// JWKS cache
let JWKS: ReturnType<typeof import('jose').createLocalJWKSet> | null = null;
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
async function timedFetch(url: string, ms = 3000, init?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<any> {
  const AbortCtor = typeof AbortController !== 'undefined' ? AbortController : (globalThis as any).AbortController;
  const ac = new AbortCtor();
  const id = setTimeout(() => ac.abort(), ms);
  try {
    const f = (globalThis as any).fetch || fetch;
    return await f(url, { ...(init || {}), signal: ac.signal }) as any;
  } finally {
    clearTimeout(id);
  }
}

// Get JWKS with improved caching and error handling
async function getJWKS() {
  const now = Date.now();
  
  // Use cached JWKS if available and not expired
  if (JWKS && (now - JWKS_LAST_FETCH) < JWKS_CACHE_TIME) {
    return JWKS;
  }

  // Fetch new JWKS if cache is expired or empty

  try {
    const jose = await import('jose');
    const resp = await timedFetch(JWKS_URL, 5000); // Increased timeout
    
    if (!resp.ok) {
      throw new Error(`JWKS fetch failed: HTTP ${resp.status} ${resp.statusText}`);
    }
    
    const jwksData = await resp.json() as { keys: unknown[] };
    
    if (!jwksData || !jwksData.keys || !Array.isArray(jwksData.keys)) {
      throw new Error('Invalid JWKS response format');
    }

    JWKS = jose.createLocalJWKSet(jwksData as any);
    JWKS_LAST_FETCH = now;
    
    return JWKS;
    
  } catch (error) {
    console.error('❌ Failed to fetch JWKS:', {
      error: error instanceof Error ? error.message : error,
      url: JWKS_URL,
      cacheAge: JWKS_LAST_FETCH ? now - JWKS_LAST_FETCH : 'never'
    });
    
    // Return cached JWKS even if expired, as fallback
    if (JWKS) {
      return JWKS;
    }
    
    throw new Error('No JWKS available and cache is empty');
  }
}

// Verify JWT token with improved error handling
async function verifyJWTToken(token: string): Promise<JWTPayload & StackAuthUserInfo> {
  
  try {
    const jose = await import('jose');
    const jwks = await getJWKS();
    
    if (!jwks) {
      throw new Error('JWKS not available - authentication service unreachable');
    }

    // Verify JWT token


    const { payload } = await jose.jwtVerify(token, jwks as any, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}`,
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

import { AuthenticatedUser, OnboardingProgress } from '../_shared/auth-types.js';
import { AuthenticatedHandler, AuthOptions, AuthResponse, AuthenticatedRequest } from '../_shared/auth-middleware-types.js';

// Get authenticated user helper with improved token extraction
export async function getAuthenticatedUser(req: VercelRequest): Promise<AuthenticatedUser> {
  let accessToken: string | undefined;
  
  // 1. Check Authorization header (preferred method)
  const authHeader = req.headers.authorization;
  const authHeaderValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (authHeaderValue?.startsWith('Bearer ')) {
    accessToken = authHeaderValue.substring(7);
  }

  // 2. Check Stack Auth specific headers
  if (!accessToken && req.headers['x-stack-access-token']) {
    accessToken = req.headers['x-stack-access-token'] as string;
  }

  // 3. Check cookies for Stack Auth tokens (using the correct format)
  if (!accessToken) {
    const cookieHeader = req.headers.cookie;
    const cookieHeaderValue = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
    
    if (cookieHeaderValue) {
      const cookies = parseCookieHeader(cookieHeaderValue);
      
      // Helper function to extract JWT from Stack Auth cookie format
      const tryParseAccessFromCookieValue = (val: unknown): string | undefined => {
        if (!val || typeof val !== 'string') return undefined;
        try {
          // New format: JSON array ["token_id", "jwt"]
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
            return parsed[1] as string;
          }
        } catch {
          // Some environments may store the raw JWT as a string
          if (val.split('.').length === 3) {
            return val; // looks like a JWT
          }
        }
        return undefined;
      };
      
      // 1) Check exact 'stack-access' cookie first
      const stackAccess = cookies['stack-access'];
      if (stackAccess) {
        const token = tryParseAccessFromCookieValue(stackAccess);
        if (token) {
          accessToken = token;
        }
      }

      // 2) Check any cookie whose name starts with 'stack-access'
      if (!accessToken) {
        const matchingKeys = Object.keys(cookies).filter(k => k.startsWith('stack-access'));
        for (const key of matchingKeys) {
          const token = tryParseAccessFromCookieValue(cookies[key]);
          if (token) {
            accessToken = token;
            break;
          }
        }
      }

      // 2.5) Check OAuth cookies as fallback (these might contain temporary tokens)
      if (!accessToken) {
        const oauthKeys = Object.keys(cookies).filter(k => k.startsWith('stack-oauth-outer-'));
        for (const key of oauthKeys) {
          const token = tryParseAccessFromCookieValue(cookies[key]);
          if (token) {
            accessToken = token;
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
            break;
          }
        }
      }
    }
  }

  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Extract and validate JWT token


  // Verify JWT token
  const userInfo = await verifyJWTToken(accessToken);

  // DEBUG: Log full JWT payload and key fields to trace mapping
  try {
    console.log('🔐 JWT payload:', JSON.stringify(userInfo, null, 2));
  } catch {}

  // Extract user info from JWT
  const stackAuthId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
  const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
  const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');
  console.log('🆔 Extracted from JWT:', { stackAuthId: stackAuthId?.slice(0,8) + '...', userEmail, userName });

  // Ensure we have required fields
  if (!stackAuthId || !userEmail) {
    throw new Error('Invalid user info: missing required fields');
  }

  // User info extracted successfully

  // 🔥 HARDENED: Database lookup with bulletproof Stack Auth ID and email linking
  try {
    
    const { storage: storageInstance } = await import('../../server/storage.js');
    
    // Call hardened getOrCreateUser function with three-step lookup strategy
    console.log('🔎 DB LINK: getUserByStackAuthId →', stackAuthId?.slice(0,8) + '...');
    let dbUserProfile = await storageInstance.getUserByStackAuthId(stackAuthId);
    console.log('🔎 DB LINK: byStackAuthId result:', !!dbUserProfile);

    if (!dbUserProfile) {
      // Try to find by email
      if (userEmail) {
        console.log('🔎 DB LINK: getUserByEmail →', userEmail);
        dbUserProfile = await storageInstance.getUserByEmail(userEmail);
        console.log('🔎 DB LINK: byEmail result:', !!dbUserProfile, '→ will link if found');
        if (dbUserProfile) {
          // Link the Stack Auth ID
          console.log('🔗 DB LINK: linkStackAuthId(existingId, stackAuthId)', { existingId: dbUserProfile.id?.slice(0,8) + '...', stackAuthId: stackAuthId?.slice(0,8) + '...' });
          dbUserProfile = await storageInstance.linkStackAuthId(dbUserProfile.id, stackAuthId);
          console.log('✅ DB LINK: linked user now has stackAuthId');
        }
      }

      // Create new user if not found
      if (!dbUserProfile) {
        console.log('🆕 DB LINK: upsertUser (create new) with id=stackAuthId');
        const userData = {
          id: stackAuthId,
          email: userEmail,
          displayName: userName,
          firstName: userName?.split(' ')[0] || null,
          lastName: userName?.split(' ').slice(1).join(' ') || null,
          profileImageUrl: (userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url) || null,
          plan: 'sselfie-studio',
          role: 'user',
          monthlyGenerationLimit: 100,
          mayaAiAccess: true,
          victoriaAiAccess: false,
          preferredOnboardingMode: 'conversational',
          onboardingProgress: JSON.stringify({ source: 'direct-signup' }),
          lastLoginAt: new Date()
        };
        dbUserProfile = await storageInstance.upsertUser(userData);
        console.log('✅ DB LINK: upsertUser created', { id: dbUserProfile.id?.slice(0,8) + '...', stackAuthId: dbUserProfile.stackAuthId?.slice(0,8) + '...' });
      }
    }

    // User profile found/created successfully

    // Get the full database user record to ensure complete data
    const { storage } = await import('../../server/storage.js');
    const dbUser = await storage.getUserByStackAuthId(stackAuthId);

    if (!dbUser) {
      // This should not happen after hardened getOrCreateUser, but handle gracefully
      console.error('❌ Critical: User not found by Stack Auth ID after hardened sync');
      throw new Error(`Failed to retrieve user by Stack Auth ID ${stackAuthId.substring(0, 8)}... after successful user service call`);
    }

    console.log('✅ DB LINK: Final dbUser', { id: dbUser.id?.slice(0,8) + '...', stackAuthId: dbUser.stackAuthId?.slice(0,8) + '...', email: dbUser.email });

    // Database user retrieved and user object created successfully

    // Return the complete user object with Stack Auth info
    const user: AuthenticatedUser = {
      ...dbUser,
      onboardingProgress: dbUser.onboardingProgress as OnboardingProgress | null,
      stackUser: userInfo
    };

    console.log('✅ AUTH: Authenticated user object constructed', { id: user.id?.slice(0,8) + '...', stackAuthId: user.stackAuthId?.slice(0,8) + '...' });

    return user;

  } catch (dbError) {
    // Database sync failed, using fallback user (this is expected during deployment/cache issues)
    console.warn('⚠️  Database sync failed, using fallback user:', dbError instanceof Error ? dbError.message : dbError);
    
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
      stackUser: userInfo
    };

    return fallbackUser;
  }
}

// Authentication middleware function

// Auth middleware
export async function withAuth<T>(
  req: VercelRequest,
  res: VercelResponse,
  handler: AuthenticatedHandler<T>,
  options: AuthOptions = {}
): Promise<T> {
  // Handle bypass option (e.g. for cron jobs)
  if (options.bypass || req.url?.startsWith('/api/cron/')) {
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
    console.log('👤 withAuth: attaching user to request', { id: user.id?.slice(0,8) + '...', stackAuthId: user.stackAuthId?.slice(0,8) + '...', email: user.email });
    (req as AuthenticatedRequest).user = user;
    // Set claims for backward compatibility with getUserFromRequest
    (req as any).user.claims = user.stackUser;

    // Call handler with authenticated request
    return await handler(req as AuthenticatedRequest, res);
  } catch (error) {
    // For optional auth, allow request through without user
    if (options.optional) {
      (req as any).user = (req as any).user || {};
      (req as any).user.claims = (req as any).user.stackUser || null;
      return await handler(req as AuthenticatedRequest, res);
    }

    console.warn('🔒 Expected auth failure for protected endpoint:', {
      url: req.url,
      error: error instanceof Error ? error.message : error
    });

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