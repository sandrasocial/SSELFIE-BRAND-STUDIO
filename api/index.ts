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
        console.log('🍪 All cookies received:', JSON.stringify(req.cookies, null, 2));
        
        // Stack Auth stores tokens in 'stack-access' cookie as array format
        const stackAccessCookie = req.cookies['stack-access'];
        console.log('🍪 stack-access cookie:', stackAccessCookie);
        
        if (stackAccessCookie) {
          try {
            // Parse the array format: ["token_id", "jwt_token"]
            const stackAccessArray = JSON.parse(stackAccessCookie);
            console.log('🍪 Parsed stack-access array:', stackAccessArray);
            
            if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
              accessToken = stackAccessArray[1]; // JWT is the second element
              console.log('🔐 Found access token in stack-access cookie');
            } else {
              console.log('⚠️ Invalid stack-access cookie format - not an array or insufficient elements');
            }
          } catch (error) {
            console.log('❌ Failed to parse stack-access cookie:', error);
            console.log('🍪 Raw cookie value:', stackAccessCookie);
          }
        }
        
        // Fallback: check for old stack-access-token format
        if (!accessToken) {
          accessToken = req.cookies['stack-access-token'];
          if (accessToken) {
            console.log('🔐 Found access token in stack-access-token cookie');
          } else {
            console.log('🔍 No access token found in any cookies');
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

    // Handle Maya chat endpoints
    if (req.url?.includes('/api/maya-chat') || req.url?.includes('/api/maya-generate')) {
      console.log('🔍 Maya chat endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya chat for user:', user.id, user.email);
        
        // Get request body
        const body = req.body || {};
        console.log('🔍 Maya chat request body:', JSON.stringify(body, null, 2));
        
        // Mock Maya response with concept generation
        const mayaResponse = {
          id: `maya_${Date.now()}`,
          userId: user.id,
          message: body.message || 'Hello! I\'m Maya, your AI photographer.',
          concepts: [
            {
              id: `concept_1_${Date.now()}`,
              title: 'Professional Headshot',
              description: 'Clean, corporate headshot perfect for LinkedIn',
              style: 'professional',
              prompt: 'professional headshot, business attire, clean background, corporate style',
              imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/maya_concept_1_${Date.now()}.png`
            },
            {
              id: `concept_2_${Date.now()}`,
              title: 'Creative Portrait',
              description: 'Artistic and creative portrait with unique lighting',
              style: 'creative',
              prompt: 'creative portrait, artistic lighting, unique composition, modern style',
              imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/maya_concept_2_${Date.now()}.png`
            },
            {
              id: `concept_3_${Date.now()}`,
              title: 'Lifestyle Shot',
              description: 'Casual, approachable lifestyle photography',
              style: 'lifestyle',
              prompt: 'lifestyle photography, casual attire, natural lighting, approachable style',
              imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/maya_concept_3_${Date.now()}.png`
            }
          ],
          cards: [
            {
              id: `card_1_${Date.now()}`,
              title: 'Business Professional',
              description: 'Perfect for your LinkedIn profile and business materials',
              style: 'professional',
              imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/maya_card_1_${Date.now()}.png`
            },
            {
              id: `card_2_${Date.now()}`,
              title: 'Creative Artist',
              description: 'Showcase your creative side with this artistic portrait',
              style: 'creative',
              imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/maya_card_2_${Date.now()}.png`
            }
          ],
          timestamp: new Date().toISOString()
        };
        
        console.log('📊 Returning Maya response:', JSON.stringify(mayaResponse, null, 2));
        return res.status(200).json(mayaResponse);
        
      } catch (error) {
        console.log('❌ Maya chat failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }

    // Handle Maya chats list endpoint
    if (req.url?.includes('/api/maya-chats')) {
      console.log('🔍 Maya chats list endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting Maya chats for user:', user.id, user.email);
        
        // Mock list of Maya chats
        const chats = [
          {
            id: `chat_1_${user.id}`,
            userId: user.id,
            title: 'Professional Headshots',
            lastMessage: 'I\'ve generated some professional headshot concepts for you.',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date().toISOString()
          },
          {
            id: `chat_2_${user.id}`,
            userId: user.id,
            title: 'Creative Portraits',
            lastMessage: 'Here are some creative portrait ideas to explore.',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ];
        
        console.log('📊 Returning Maya chats:', chats.length, 'chats');
        return res.status(200).json(chats);
        
      } catch (error) {
        console.log('❌ Maya chats fetch failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }

    // Handle gallery images endpoint
    if (req.url?.includes('/api/gallery')) {
      console.log('🔍 Gallery endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting gallery images for user:', user.id, user.email);
        
        // Mock gallery images for now - in production this would fetch from database
        const galleryImages = [
          {
            id: `gallery_1_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Professional Headshot',
            description: 'AI-generated professional headshot',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/professional_headshot_1.png`,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            tags: ['professional', 'headshot', 'business']
          },
          {
            id: `gallery_2_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Creative Portrait',
            description: 'AI-generated creative portrait',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/creative_portrait_1.png`,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            tags: ['creative', 'portrait', 'artistic']
          },
          {
            id: `gallery_3_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Lifestyle Shot',
            description: 'AI-generated lifestyle photography',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/lifestyle_shot_1.png`,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            tags: ['lifestyle', 'casual', 'natural']
          },
          {
            id: `gallery_4_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Business Professional',
            description: 'AI-generated business professional image',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/business_professional_1.png`,
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            tags: ['business', 'professional', 'corporate']
          },
          {
            id: `gallery_5_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Creative Artist',
            description: 'AI-generated creative artist portrait',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/creative_artist_1.png`,
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            tags: ['creative', 'artist', 'unique']
          }
        ];
        
        console.log('📊 Returning gallery images:', galleryImages.length, 'images');
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        console.log('❌ Gallery fetch failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }

    // Handle gallery-images endpoint (alternative)
    if (req.url?.includes('/api/gallery-images')) {
      console.log('🔍 Gallery-images endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting gallery images for user:', user.id, user.email);
        
        // Return the same mock data as /api/gallery
        const galleryImages = [
          {
            id: `gallery_1_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Professional Headshot',
            description: 'AI-generated professional headshot',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/professional_headshot_1.png`,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            tags: ['professional', 'headshot', 'business']
          },
          {
            id: `gallery_2_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Creative Portrait',
            description: 'AI-generated creative portrait',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/creative_portrait_1.png`,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            tags: ['creative', 'portrait', 'artistic']
          },
          {
            id: `gallery_3_${user.id}`,
            userId: user.id,
            type: 'ai_generated',
            title: 'Lifestyle Shot',
            description: 'AI-generated lifestyle photography',
            imageUrl: `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/${user.id}/lifestyle_shot_1.png`,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            tags: ['lifestyle', 'casual', 'natural']
          }
        ];
        
        console.log('📊 Returning gallery-images:', galleryImages.length, 'images');
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        console.log('❌ Gallery-images fetch failed:', error.message);
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
