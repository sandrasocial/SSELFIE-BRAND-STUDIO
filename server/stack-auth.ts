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

// OAuth token exchange function
async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const response = await fetch(`${STACK_AUTH_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: STACK_AUTH_PROJECT_ID,
      publishable_client_key: process.env.VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

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
      }
    }
    
    if (!accessToken) {
      console.log('❌ Stack Auth: No access token found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔐 Stack Auth: Verifying access token with Stack Auth API...');
    
    // Get user info from Stack Auth API
    const userInfo = await getUserInfo(accessToken);
    
    console.log('✅ Stack Auth: User verified successfully');
    console.log('📊 Stack Auth: User info:', userInfo);
    
    // Set user information in request
    req.user = {
      id: userInfo.id,
      primaryEmail: userInfo.primary_email,
      displayName: userInfo.display_name || userInfo.first_name,
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

// OAuth callback handler
export async function handleStackAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Missing authorization code' });
    }
    
    console.log('🔐 Stack Auth: Handling OAuth callback with code:', typeof code === 'string' ? code.substring(0, 20) + '...' : code);
    
    const redirectUri = `${req.protocol}://${req.get('host')}/auth-success`;
    
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code as string, redirectUri);
    console.log('✅ Stack Auth: Tokens received successfully');
    
    // Get user information
    const userInfo = await getUserInfo(tokens.access_token);
    console.log('✅ Stack Auth: User info retrieved:', userInfo);
    
    // Store access token in secure cookie
    res.cookie('stack-access-token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokens.expires_in * 1000, // Convert to milliseconds
    });
    
    // Redirect to the main app
    res.redirect('/?auth=success');
    
  } catch (error) {
    console.error('❌ Stack Auth: OAuth callback failed:', error);
    res.redirect('/?auth=error');
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