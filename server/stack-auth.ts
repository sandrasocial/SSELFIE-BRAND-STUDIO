import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { Request, Response, NextFunction } from 'express';

// Stack Auth JWKS endpoint
const JWKS_URL = 'https://api.stack-auth.com/api/v1/projects/253d7343-a0d4-43a1-be5c-822f590d40be/.well-known/jwks.json';

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

export async function verifyStackAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Look for token in Authorization header or cookies
    let token: string | undefined;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies for Stack Auth token
    if (!token && req.cookies) {
      token = req.cookies['stack-auth-token'] || req.cookies['stack-auth'];
    }
    
    if (!token) {
      console.log('🔐 Stack Auth: No token found in headers or cookies');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify JWT using Stack Auth JWKS
    const { payload } = await jwtVerify(token, JWKS);
    
    console.log('✅ Stack Auth: Token verified successfully');
    console.log('📊 Stack Auth: User payload:', payload);
    
    // Extract user information from the payload
    req.user = {
      id: payload.sub as string,
      primaryEmail: payload.email as string,
      displayName: payload.name as string,
      // Add other fields as they exist in Stack Auth payload
    };

    next();
  } catch (error) {
    console.error('❌ Stack Auth: Token verification failed:', error);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

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