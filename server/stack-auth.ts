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
    let jwtToken: string | undefined;
    
    // Check Authorization header for JWT tokens
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      jwtToken = authHeader.substring(7);
      console.log('🔐 Stack Auth: Found Bearer token in Authorization header');
    }
    
    // Check for direct JWT tokens in cookies first
    if (!jwtToken && req.cookies) {
      jwtToken = req.cookies['stack-auth-jwt'] || req.cookies['access_token'];
    }
    
    // If no JWT token found, check for Stack Auth session cookies
    if (!jwtToken) {
      console.log('🔍 Stack Auth: No JWT token found, checking for session cookies...');
      console.log('🔍 Available cookies:', req.headers.cookie || 'none');
      
      // For now, let's look for any tokens that might be JWT format
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          const decodedValue = decodeURIComponent(value);
          
          console.log(`🔍 Cookie '${name}': ${decodedValue.substring(0, 100)}...`);
          
          // Check if the value looks like a JWT (has two dots)
          if (decodedValue.includes('.') && decodedValue.split('.').length === 3) {
            console.log(`🎯 Found JWT-like token in cookie '${name}'`);
            jwtToken = decodedValue;
            break;
          }
        }
      }
    }
    
    if (!jwtToken) {
      console.log('❌ Stack Auth: No JWT token found in any location');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔐 Stack Auth: Attempting to verify JWT token...');
    console.log('🔍 Token preview:', jwtToken.substring(0, 50) + '...');
    
    // Verify JWT using Stack Auth JWKS
    const { payload } = await jwtVerify(jwtToken, JWKS);
    
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