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

// OAuth callback handler
export async function handleStackAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;
    
    console.log('🔐 Stack Auth: Callback received');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 Host:', req.get('host'));
    console.log('🔍 Protocol:', req.protocol);
    
    if (!code) {
      console.error('❌ Stack Auth: Missing authorization code');
      return res.redirect('/?auth=error&reason=no_code');
    }
    
    console.log('🔐 Stack Auth: Handling OAuth callback with code:', typeof code === 'string' ? code.substring(0, 20) + '...' : code);
    
    const redirectUri = `${req.protocol}://${req.get('host')}/auth-success`;
    console.log('🔍 Redirect URI used:', redirectUri);
    
    // Exchange authorization code for tokens
    console.log('🔄 Stack Auth: Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code as string, redirectUri);
    console.log('✅ Stack Auth: Tokens received successfully');
    console.log('🔍 Token info:', { 
      hasAccessToken: !!tokens.access_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type 
    });
    
    // Get user information
    console.log('🔄 Stack Auth: Getting user info...');
    const userInfo = await getUserInfo(tokens.access_token);
    console.log('✅ Stack Auth: User info retrieved:', {
      id: userInfo.id,
      email: userInfo.primary_email,
      displayName: userInfo.display_name || userInfo.first_name
    });
    
    // Store access token in secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: req.get('host')?.includes('replit.') ? true : false, // Allow HTTP in dev
      sameSite: 'lax' as const, // More permissive for OAuth redirects
      maxAge: (tokens.expires_in || 3600) * 1000, // Convert to milliseconds
      path: '/' // Ensure cookie is available site-wide
    };
    
    console.log('🔄 Stack Auth: Setting access token cookie with options:', cookieOptions);
    res.cookie('stack-access-token', tokens.access_token, cookieOptions);
    
    // Redirect to the main app
    console.log('✅ Stack Auth: Redirecting to success page');
    res.redirect('/?auth=success');
    
  } catch (error) {
    console.error('❌ Stack Auth: OAuth callback failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.redirect('/?auth=error&reason=callback_failed');
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