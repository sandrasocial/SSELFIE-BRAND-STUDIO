import { jwtVerify, createRemoteJWKSet } from 'jose';
import fs from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver or use test public key in test mode
let JWKS: any;
import { createPublicKey, KeyObject } from 'crypto';
if (process.env.NODE_ENV === 'test') {
  // Use test public key for JWT verification as a KeyObject
  const testPubKeyPath = path.join(__dirname, '__tests__', 'test-public.key');
  const testPublicKeyPem = fs.readFileSync(testPubKeyPath, 'utf8');
  const testPublicKey: KeyObject = createPublicKey({ key: testPublicKeyPem, format: 'pem', type: 'spki' });
  JWKS = testPublicKey;
} else {
  JWKS = createRemoteJWKSet(new URL(JWKS_URL));
}

// Authentication cache to improve performance
interface CachedUser {
  dbUser: any;
  timestamp: number;
  tokenHash: string;
}

const authCache = new Map<string, CachedUser>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, cached] of authCache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      authCache.delete(key);
    }
  }
  
  // Prevent memory leaks by limiting cache size
  if (authCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(authCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, authCache.size - MAX_CACHE_SIZE + 100);
    toDelete.forEach(([key]) => authCache.delete(key));
  }
}

// Simple hash function for tokens
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

export interface StackAuthUser {
  id: string;
  primaryEmail?: string;
  displayName?: string;
  isAdmin?: boolean; // Added for compatibility
  // Add other Stack Auth user properties as needed
}

declare global {
  namespace Express {
    interface Request {
      user?: StackAuthUser;
    }
  }
}

// ✅ SIMPLIFIED: Direct Stack Auth integration - no token exchange needed

// Verify JWT token directly using Stack Auth JWKS or test public key
async function verifyJWTToken(token: string) {
  try {
    let payload;
    if (process.env.NODE_ENV === 'test') {
      // Use test public key and RS256
      const { payload: testPayload } = await jwtVerify(token, JWKS, {
        algorithms: ['RS256'],
        issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
        audience: STACK_AUTH_PROJECT_ID,
      });
      payload = testPayload;
    } else {
      // Verify JWT using Stack Auth's JWKS
      const { payload: prodPayload } = await jwtVerify(token, JWKS, {
        issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
        audience: STACK_AUTH_PROJECT_ID,
      });
      payload = prodPayload;
    }
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

export async function verifyStackAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    let accessToken: string | undefined;
    
    // Skip authentication for non-protected routes to improve performance
    const skipPaths = ['/api/proxy-image', '/notification-preferences'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    console.log('🔍 Stack Auth: Starting token verification');
    console.log('🔍 Request path:', req.path);
    console.log('🔍 Available cookies:', Object.keys(req.cookies || {}));
    
    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
      console.log('🔐 Stack Auth: Found Bearer token in Authorization header');
    }
    
    // Check cookies for stored access token
    if (!accessToken && req.cookies) {
      // Stack Auth stores tokens in 'stack-access' cookie as array format
      const stackAccessCookie = req.cookies['stack-access'];
      
      if (stackAccessCookie) {
        try {
          // Parse the array format: ["token_id", "jwt_token"]
          const stackAccessArray = JSON.parse(stackAccessCookie);
          if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
            accessToken = stackAccessArray[1]; // JWT is the second element
            console.log('🔐 Stack Auth: Found access token in stack-access cookie');
          } else {
            console.log('⚠️ Stack Auth: Invalid stack-access cookie format');
          }
        } catch (error) {
          console.log('❌ Stack Auth: Failed to parse stack-access cookie:', error);
        }
      }
      
      // Fallback: check for old stack-access-token format
      if (!accessToken) {
        accessToken = req.cookies['stack-access-token'];
        if (accessToken) {
          console.log('🔐 Stack Auth: Found access token in stack-access-token cookie');
        } else {
          console.log('🔍 Stack Auth: No stack-access or stack-access-token cookie found');
          console.log('🔍 Available cookies:', Object.keys(req.cookies));
          // Log cookie values without sensitive data
          for (const [name, value] of Object.entries(req.cookies)) {
            console.log(`🔍 Cookie '${name}': ${typeof value === 'string' ? value.substring(0, 10) + '...' : value}`);
          }
        }
      }
    }
    
    if (!accessToken) {
      console.log('❌ Stack Auth: No access token found');
      console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔐 Stack Auth: Verifying JWT token...');
    console.log('🔍 Token preview:', accessToken.substring(0, 20) + '...');
    
    // Check cache first for performance
    const tokenHash = hashToken(accessToken);
    const cached = authCache.get(tokenHash);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log('⚡ Stack Auth: Using cached authentication');
      req.user = cached.dbUser;
      return next();
    }
    
    // Clean expired cache periodically
    if (Math.random() < 0.1) {
      cleanExpiredCache();
    }
    
    // Verify JWT token directly
    const userInfo = await verifyJWTToken(accessToken);
    
    console.log('✅ Stack Auth: JWT verified successfully');
    console.log('🔍 Stack Auth: Full JWT payload:', JSON.stringify(userInfo, null, 2));
    
    // Extract user information with multiple field name attempts and enhanced debugging
    const userId = userInfo.sub || userInfo.user_id || userInfo.id;
    const userEmail = userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email;
    const userName = userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name;
    
    // 🔍 ENHANCED DEBUGGING: Log all available fields to identify email field
    console.log('🔍 Stack Auth: Full JWT user info keys:', Object.keys(userInfo));
    console.log('🔍 Stack Auth: Email field search:', {
      email: userInfo.email,
      primary_email: userInfo.primary_email, 
      primaryEmail: userInfo.primaryEmail,
      email_address: userInfo.email_address,
      user_email: userInfo.user_email
    });
    
    console.log('📊 Stack Auth: Extracted user info:', {
      id: userId,
      email: userEmail,
      name: userName
    });
    
    // Get or create user in our database with email-based linking for existing users
    const { storage } = await import('./storage');
    
    // Step 1: Try to find user by Stack Auth ID first
    let dbUser = await storage.getUserByStackAuthId(userId);
    
    if (!dbUser) {
      // Step 2: Try to find existing user by email (for migration from integer IDs)
      if (userEmail) {
        dbUser = await storage.getUserByEmail(userEmail);
        
        if (dbUser) {
          // Step 3: Link existing user to Stack Auth ID
          console.log(`🔗 Stack Auth: Linking existing user ${dbUser.email} (ID: ${dbUser.id}) to Stack Auth ID: ${userId}`);
          dbUser = await storage.linkStackAuthId(dbUser.id, userId);
          console.log('✅ Stack Auth: Existing user successfully linked to Stack Auth');
        }
      }
    }
    
    if (!dbUser) {
      // Step 4: Create new user if not found by Stack Auth ID or email
      console.log('🔄 Stack Auth: Creating new user in database...');
      dbUser = await storage.upsertUser({
        id: userId,
        stackAuthId: userId,
        email: userEmail || null,
        firstName: userName?.split(' ')[0] || null,
        lastName: userName?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url || null,
        plan: null, // New users have no plan until they subscribe
        monthlyGenerationLimit: 0, // No generations until they subscribe
        mayaAiAccess: false // No AI access until they subscribe
      });
      console.log('✅ Stack Auth: New user created (no subscription):', dbUser.email);
    } else {
      console.log('✅ Stack Auth: User authenticated successfully:', dbUser.email);
    }
    
    // Set user information in request from database user
    req.user = dbUser;
    
    // Cache the authenticated user for performance
    authCache.set(tokenHash, {
      dbUser,
      timestamp: Date.now(),
      tokenHash
    });

    console.log('🎯 Stack Auth: User authenticated successfully, ID:', dbUser.id, 'Plan:', dbUser.plan || 'No subscription');
    
    next();
  } catch (error) {
    console.error('❌ Stack Auth: Token verification failed:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ✅ REMOVED: Complex OAuth callback handler no longer needed with direct Stack Auth integration

// Middleware that requires authentication
// Middleware to check active subscription for workspace access
export function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  requireStackAuth(req, res, async () => {
    try {
      const user = req.user as any;
      
      if (!user || !user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user has active subscription
      const { storage } = await import('./storage');
      const subscription = await storage.getUserSubscription(user.id);
      
      // Allow admin users and users with active subscriptions
      if (user.role === 'admin' || user.monthlyGenerationLimit === -1) {
        console.log('✅ Admin user access granted:', user.email);
        return next();
      }
      
      if (!subscription || subscription.status !== 'active') {
        console.log('❌ No active subscription for user:', user.email);
        return res.status(402).json({ 
          message: 'SSELFIE Studio subscription required (€47/month)', 
          redirectTo: '/checkout',
          requiresPayment: true 
        });
      }
      
      console.log('✅ Active subscription verified for user:', user.email);
      next();
    } catch (error) {
      console.error('❌ Subscription validation error:', error);
      res.status(500).json({ message: 'Subscription validation failed' });
    }
  });
}

export function requireStackAuth(req: Request, res: Response, next: NextFunction) {
  return verifyStackAuthToken(req, res, next);
}

// Optional authentication - doesn't block if no token
export async function optionalStackAuth(req: Request, res: Response, next: NextFunction) {
  try {
    await verifyStackAuthToken(req, res, () => {}); // Don't call next() in callback
    next(); // Call next here if verification succeeds
  } catch (error) {
    // If verification fails, still continue but without user
    req.user = undefined;
    next();
  }
}

// Admin authentication - requires admin role
export async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    await verifyStackAuthToken(req, res, () => {});
    
    // Check if user has admin role
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication required' });
  }
}