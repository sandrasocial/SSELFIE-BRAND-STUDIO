import type { Express, RequestHandler } from "express";
import { StackServerApp } from "@stackframe/stack";
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Use the known project ID from the Stack Auth integration
const STACK_PROJECT_ID = "253d7343-a0d4-43a1-be5c-822f590d40be";
const JWKS_URL = "https://api.stack-auth.com/api/v1/projects/253d7343-a0d4-43a1-be5c-822f590d40be/.well-known/jwks.json";

// Check for required environment variables
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;
const publishableClientKey = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

// Initialize JWKS client for JWT verification
const jwksClientInstance = jwksClient({
  jwksUri: JWKS_URL,
  requestHeaders: {}, // Additional headers can be added if needed
  timeout: 30000, // Defaults to 30s
});

// Helper function to get signing key
function getKey(header: any, callback: any) {
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Failed to get signing key:', err);
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Initialize Stack Server App only if we have the required credentials
let stackServerApp: any = null;

if (secretServerKey && publishableClientKey) {
  try {
    stackServerApp = new StackServerApp({
      projectId: STACK_PROJECT_ID,
      secretServerKey: secretServerKey,
      publishableClientKey: publishableClientKey,
    });
    console.log('🔧 Stack Auth server initialized with project ID:', STACK_PROJECT_ID);
  } catch (error) {
    console.error('❌ Stack Auth server initialization failed:', error);
    stackServerApp = null;
  }
} else {
  console.warn('⚠️ Stack Auth server credentials not found - using fallback auth system');
  console.warn('Missing credentials:', {
    secretServerKey: !!secretServerKey,
    publishableClientKey: !!publishableClientKey
  });
}

// Verify JWT token using Stack Auth JWKS
async function verifyStackAuthToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: STACK_PROJECT_ID,
      issuer: 'https://api.stack-auth.com',
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('❌ JWT verification failed:', err.message);
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

// Stack Auth middleware for protected routes
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    console.log('🔐 Stack Auth: Verifying request authentication');
    
    // Look for token in X-Stack-Access-Token header (Stack Auth standard)
    const accessToken = req.headers['x-stack-access-token'] as string;
    
    if (!accessToken) {
      console.log('❌ Stack Auth: No access token found in headers');
      return res.status(401).json({ 
        message: "Authentication required",
        error: "Missing X-Stack-Access-Token header"
      });
    }

    try {
      // Verify the JWT token using Stack Auth JWKS
      const decoded = await verifyStackAuthToken(accessToken);
      console.log('✅ Stack Auth: Token verified successfully');
      
      // Add verified user info to request object
      (req as any).user = {
        claims: {
          sub: decoded.sub,
          email: decoded.email,
          user_id: decoded.user_id,
          ...decoded
        },
        accessToken: accessToken
      };
      
      next();
    } catch (verifyError) {
      console.error('❌ Stack Auth: Token verification failed:', verifyError);
      return res.status(401).json({ 
        message: "Invalid access token",
        error: "Token verification failed"
      });
    }
  } catch (error) {
    console.error('❌ Stack Auth middleware error:', error);
    return res.status(500).json({ message: "Authentication system error" });
  }
};

// Helper to get current user from Stack Auth
export async function getCurrentUser(req: any): Promise<any> {
  try {
    // For compatibility, return the user from request if available
    return req.user || null;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    return null;
  }
}

// Setup Stack Auth endpoints (if needed)
export function setupStackAuth(app: Express) {
  console.log('🔧 Setting up Stack Auth server integration...');
  
  // Stack Auth endpoint for user session info
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('🔍 /api/auth/user called - checking Stack Auth token');
      
      // Look for token in X-Stack-Access-Token header
      const accessToken = req.headers['x-stack-access-token'] as string;
      
      if (!accessToken) {
        console.log('❌ No access token found in headers');
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        // Verify the JWT token using Stack Auth JWKS
        const decoded = await verifyStackAuthToken(accessToken);
        console.log('✅ Token verified, returning user data');
        
        // Return verified user data
        const userData = {
          id: decoded.sub || decoded.user_id,
          email: decoded.email,
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          profileImageUrl: decoded.picture,
          claims: decoded
        };
        
        res.json(userData);
      } catch (verifyError) {
        console.error('❌ Token verification failed:', verifyError);
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      console.error('User check error:', error);
      res.status(401).json({ message: "Authentication error" });
    }
  });
  
  console.log('✅ Stack Auth server integration setup complete');
}

console.log('🔧 Stack Auth server module loaded');