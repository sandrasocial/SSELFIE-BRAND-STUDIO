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

// Get user info from access token  
async function getUserInfo(accessToken: string) {
  const response = await fetch(`${STACK_AUTH_API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get user info failed: ${response.status} - ${error}`);
  }

  return await response.json();
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
      accessToken = req.cookies['stack-access-token'];
      if (accessToken) {
        console.log('🔐 Stack Auth: Found access token in cookies');
      } else {
        console.log('🔍 Stack Auth: No stack-access-token cookie found');
        console.log('🔍 Available cookies:', Object.keys(req.cookies));
        // Log cookie values without sensitive data
        for (const [name, value] of Object.entries(req.cookies)) {
          console.log(`🔍 Cookie '${name}': ${typeof value === 'string' ? value.substring(0, 10) + '...' : value}`);
        }
      }
    }
    
    if (!accessToken) {
      console.log('❌ Stack Auth: No access token found');
      console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔐 Stack Auth: Verifying access token with Stack Auth API...');
    console.log('🔍 Token preview:', accessToken.substring(0, 20) + '...');
    
    // Get user info from Stack Auth API
    const userInfo = await getUserInfo(accessToken);
    
    console.log('✅ Stack Auth: User verified successfully');
    console.log('📊 Stack Auth: User info:', {
      id: userInfo.id,
      email: userInfo.primary_email,
      displayName: userInfo.display_name || userInfo.first_name
    });
    
    // Set user information in request
    req.user = {
      id: userInfo.id,
      primaryEmail: userInfo.primary_email,
      displayName: userInfo.display_name || userInfo.first_name,
    };

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