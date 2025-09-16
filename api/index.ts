import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

// Verify JWT token directly using Stack Auth JWKS
async function verifyJWTToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
    });
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔍 API Handler: Request received', req.url);
    console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔍 Cookies:', JSON.stringify(req.cookies, null, 2));
    
    // Set CORS headers for authentication
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Simple health check
    if (req.url?.includes('/api/health')) {
      return res.status(200).json({
        status: 'healthy',
        service: 'SSELFIE Studio API',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Helper function to get authenticated user
    async function getAuthenticatedUser() {
      let accessToken: string | undefined;
      
      // Check Authorization header for Bearer token
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('🔐 Found Bearer token in Authorization header');
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
              console.log('🔐 Found access token in stack-access cookie');
            } else {
              console.log('⚠️ Invalid stack-access cookie format');
            }
          } catch (error) {
            console.log('❌ Failed to parse stack-access cookie:', error);
          }
        }
        
        // Fallback: check for old stack-access-token format
        if (!accessToken) {
          accessToken = req.cookies['stack-access-token'];
          if (accessToken) {
            console.log('🔐 Found access token in stack-access-token cookie');
          } else {
            console.log('🔍 No access token found in cookies');
          }
        }
      }
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      console.log('🔐 Verifying JWT token...');
      console.log('🔍 Token preview:', accessToken.substring(0, 20) + '...');
      
      // Verify JWT token
      const userInfo = await verifyJWTToken(accessToken);
      
      console.log('✅ JWT verified successfully');
      console.log('🔍 JWT payload:', JSON.stringify(userInfo, null, 2));
      
      // Extract user information
      const userId = userInfo.sub || userInfo.user_id || userInfo.id;
      const userEmail = userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email;
      const userName = userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name;
      
      console.log('📊 Extracted user info:', {
        id: userId,
        email: userEmail,
        name: userName
      });
      
      return {
        id: userId,
        email: userEmail,
        firstName: userName?.split(' ')[0],
        lastName: userName?.split(' ').slice(1).join(' '),
        plan: 'sselfie-studio', // Default plan
        role: 'user', // Default role
        stackUser: userInfo // Include raw Stack Auth user data
      };
    }

    // Handle authentication endpoints
    if (req.url?.includes('/api/auth/user')) {
      console.log('🔍 Auth user endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        return res.status(200).json(user);
      } catch (error) {
        console.log('❌ Authentication failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }

    // Handle user model endpoint
    if (req.url?.includes('/api/user-model')) {
      console.log('🔍 User model endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting model for user:', user.id, user.email);
        
        // For now, return a mock model status
        // In a real implementation, this would query your database
        const modelStatus = {
          id: `model_${user.id}`,
          userId: user.id,
          trainingStatus: 'completed', // Mock: assume user has completed training
          modelType: 'sselfie-studio',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Add other model properties as needed
        };
        
        console.log('📊 Returning model status:', modelStatus);
        return res.status(200).json(modelStatus);
        
      } catch (error) {
        console.log('❌ User model fetch failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }
    
    // Default response
    return res.status(200).json({
      message: 'SSELFIE Studio API',
      endpoint: req.url
    });
    
  } catch (error) {
    console.error('❌ API Handler Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
