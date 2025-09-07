import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { Request, Response, NextFunction } from 'express';

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

interface StackAuthUser {
  id: string;
  primaryEmail?: string;
  displayName?: string;
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

// Verify JWT token directly using Stack Auth JWKS
async function verifyJWTToken(token: string) {
  try {
    // Verify JWT using Stack Auth's JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
    });
    
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

export async function verifyStackAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    let accessToken: string | undefined;
    
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
    
    // Verify JWT token directly
    const userInfo = await verifyJWTToken(accessToken);
    
    console.log('✅ Stack Auth: JWT verified successfully');
    console.log('📊 Stack Auth: User info:', {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.displayName
    });
    
    // Get or create user in our database
    const { storage } = await import('./storage');
    let dbUser = await storage.getUser(userInfo.sub);
    
    if (!dbUser) {
      console.log('🔄 Stack Auth: Creating new user in database...');
      dbUser = await storage.upsertUser({
        id: userInfo.sub,
        email: userInfo.email || null,
        firstName: userInfo.displayName?.split(' ')[0] || null,
        lastName: userInfo.displayName?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: userInfo.profileImageUrl || null
      });
      console.log('✅ Stack Auth: User created in database:', dbUser.email);
    } else {
      console.log('✅ Stack Auth: User found in database:', dbUser.email);
    }
    
    // Set user information in request from database user
    req.user = dbUser;

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