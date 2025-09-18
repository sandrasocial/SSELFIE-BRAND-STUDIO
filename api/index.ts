/* eslint-disable no-console */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Types
interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt: string;
  category: string;
  emoji: string;
}

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  message?: string;
}

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JWKS = createRemoteJWKSet(new (globalThis as any).URL(JWKS_URL));

// Helper function to apply gender context to concept cards
async function applyGenderContext(conceptCards: ConceptCard[], userId: string): Promise<ConceptCard[]> {
  try {
    console.log('🎯 Applying gender context to concept cards for user:', userId);
    
    // Import required utilities
    const { storage } = await import('../server/storage');
    const { enforceGender, normalizeGender } = await import('../server/utils/gender-prompt');
    
    // Get user data
    const [user, userModel] = await Promise.all([
      storage.getUser(userId),
      storage.getUserModelByUserId(userId)
    ]);
    
    if (!user?.gender || !userModel?.triggerWord) {
      console.log('⚠️ Gender or trigger word not available, skipping gender enforcement');
      return conceptCards;
    }
    
    const secureGender = normalizeGender(user.gender);
    if (!secureGender) {
      console.log('⚠️ Invalid gender format, skipping gender enforcement');
      return conceptCards;
    }
    
    console.log(`✅ Applying gender context: ${secureGender} with trigger: ${userModel.triggerWord}`);
    
    // Apply gender enforcement to each concept card
    return conceptCards.map((concept, index) => {
      let updatedPrompt = concept.fluxPrompt;
      let updatedDescription = concept.description;
      
      // Enforce gender in FLUX prompt
      if (updatedPrompt) {
        const enforcedPrompt = enforceGender(userModel.triggerWord!, updatedPrompt, secureGender);
        if (enforcedPrompt !== updatedPrompt) {
          console.log(`✅ Gender enforced in concept ${index + 1}: ${concept.title}`);
          updatedPrompt = enforcedPrompt;
        }
      }
      
      // Apply pronoun corrections to description based on gender
      if (updatedDescription) {
        if (secureGender === 'man') {
          // Replace female pronouns with male equivalents
          updatedDescription = updatedDescription
            .replace(/\bshe\b/gi, 'he')
            .replace(/\bher\b/gi, 'his')
            .replace(/\bwoman\b/gi, 'man')
            .replace(/\bwomen\b/gi, 'men');
        } else if (secureGender === 'woman') {
          // Replace male pronouns with female equivalents (less common but for safety)
          updatedDescription = updatedDescription
            .replace(/\bhe\b/gi, 'she')
            .replace(/\bhis\b/gi, 'her')
            .replace(/\bman\b/gi, 'woman')
            .replace(/\bmen\b/gi, 'women');
        } else if (secureGender === 'non-binary') {
          // Replace gendered pronouns with neutral alternatives
          updatedDescription = updatedDescription
            .replace(/\b(he|she)\b/gi, 'they')
            .replace(/\b(his|her)\b/gi, 'their')
            .replace(/\b(man|woman)\b/gi, 'person')
            .replace(/\b(men|women)\b/gi, 'people');
        }
      }
      
      return {
        ...concept,
        fluxPrompt: updatedPrompt,
        description: updatedDescription
      };
    });
    
  } catch (error) {
    console.log('❌ Gender context application failed (non-blocking):', error instanceof Error ? error.message : error);
    return conceptCards; // Return original cards if gender enforcement fails
  }
}

// Helper function to extract concept cards from Maya's response
function extractConceptCards(response: string): ConceptCard[] {
  const conceptCards: ConceptCard[] = [];
  
  try {
    // Split response by concept separators
    const conceptSections = response.split('---').filter(section => section.trim());
    
    conceptSections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      
      if (lines.length >= 2) {
        // Extract emoji and title from first line
        const titleLine = lines[0];
        const emojiMatch = titleLine.match(/^([🎯✨💼🌟💫🏆📸🎬])/u);
        const titleMatch = titleLine.match(/\*\*(.*?)\*\*/);
        
        const emoji = emojiMatch ? emojiMatch[1] : '🎯';
        const title = titleMatch ? titleMatch[1].trim() : `Concept ${index + 1}`;
        
        // Extract description (second line)
        const description = lines[1] || '';
        
        // Find FLUX_PROMPT
        let fluxPrompt = '';
        const fluxPromptLine = lines.find(line => line.includes('FLUX_PROMPT:'));
        if (fluxPromptLine) {
          fluxPrompt = fluxPromptLine.replace('FLUX_PROMPT:', '').trim();
        }
        
        if (title && description) {
          conceptCards.push({
            id: `concept_${Date.now()}_${index + 1}`,
            title: title,
            description: description,
            fluxPrompt: fluxPrompt,
            category: getCategoryFromTitle(title),
            emoji: emoji
          });
        }
      }
    });
  } catch (error) {
    console.log('❌ Error extracting concept cards:', error.message);
  }
  
  return conceptCards;
}

// Helper function to categorize concepts
function getCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('professional') || titleLower.includes('headshot') || titleLower.includes('business')) {
    return 'Professional';
  } else if (titleLower.includes('lifestyle') || titleLower.includes('casual') || titleLower.includes('relaxed')) {
    return 'Lifestyle';
  } else if (titleLower.includes('executive') || titleLower.includes('authority') || titleLower.includes('commanding')) {
    return 'Executive';
  } else if (titleLower.includes('creative') || titleLower.includes('artistic') || titleLower.includes('artistic')) {
    return 'Creative';
  } else if (titleLower.includes('editorial') || titleLower.includes('fashion') || titleLower.includes('street')) {
    return 'Editorial';
  } else {
    return 'General';
  }
}

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
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔍 Cookies:', JSON.stringify(req.cookies, null, 2));
    // Vercel Skew Protection: pin requests to this deployment via cookie
    if (
      process.env.VERCEL_SKEW_PROTECTION_ENABLED === '1' &&
      process.env.VERCEL_DEPLOYMENT_ID
    ) {
      try {
        const cookieValue = `__vdpl=${process.env.VERCEL_DEPLOYMENT_ID}; Path=/; HttpOnly; Secure; SameSite=Lax`;
        const existing = res.getHeader('Set-Cookie');
        if (Array.isArray(existing)) {
          res.setHeader('Set-Cookie', [...existing, cookieValue]);
        } else if (typeof existing === 'string' && existing.length > 0) {
          res.setHeader('Set-Cookie', [existing, cookieValue]);
        } else {
          res.setHeader('Set-Cookie', cookieValue);
        }
      } catch (e) {
        console.log('⚠️ Failed to set __vdpl cookie:', (e as Error).message);
      }
    }
    
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
        firstName: (userName as string)?.split(' ')[0],
        lastName: (userName as string)?.split(' ').slice(1).join(' '),
        plan: 'sselfie-studio', // Default plan
        role: 'user', // Default role
        stackUser: userInfo // Include raw Stack Auth user data
      };
    }

    // Helper: ensure DB user exists/linked from Stack user fields
    async function ensureDbUserFromStack(stackUser: { id?: string; email?: string | null; displayName?: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null; }) {
      const { storage } = await import('../server/storage');
      const stackId = (stackUser.id || '') as string;
      const email = (stackUser.email || '') as string;

      // Try by ID
      let dbUser = stackId ? await storage.getUser(stackId) : undefined;
      if (dbUser) return dbUser;

      // Try by linked stack auth id
      if (!dbUser && stackId) {
        dbUser = await storage.getUserByStackAuthId(stackId);
        if (dbUser) return dbUser;
      }

      // Try by email, then link
      if (!dbUser && email) {
        const byEmail = await storage.getUserByEmail(email);
        if (byEmail) {
          return await storage.linkStackAuthId(byEmail.id, stackId || byEmail.id);
        }
      }

      // Create new
      return await storage.upsertUser({
        id: stackId || email || `user_${Date.now()}`,
        email: email || null,
        displayName: stackUser.displayName || null,
        firstName: stackUser.firstName || (stackUser.displayName ? stackUser.displayName.split(' ')[0] : null),
        lastName: stackUser.lastName || (stackUser.displayName ? stackUser.displayName.split(' ').slice(1).join(' ') : null),
        profileImageUrl: stackUser.profileImageUrl || null,
      } as any);
    }

    // Handle authentication endpoints
    if (req.url?.includes('/api/auth/user')) {
      console.log('🔍 Auth user endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(user);
      } catch (error) {
        console.log('❌ Authentication failed:', error.message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: error.message
        });
      }
    }

    // Stack webhook to upsert users: /api/webhooks/stack
    if (req.url === '/api/webhooks/stack' || req.url?.startsWith('/api/webhooks/stack')) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const providedSecret = (req.headers['x-stack-webhook-secret'] as string) || (req.headers['x-stack-verification-secret'] as string) || (req.query as any)?.secret;
      const expected = process.env.STACK_WEBHOOK_SECRET || process.env.STACK_WEBHOOK_VERIFICATION_SECRET;
      if (!expected || providedSecret !== expected) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }
      res.setHeader('Cache-Control', 'no-store');
      try {
        const body = req.body || {};
        const eventType = (body.event && body.event.type) || body.type || 'unknown';
        const u = body.data?.user || body.user || body.data || {};
        const stackUser = {
          id: u.id || u.sub || u.user_id,
          email: u.email || u.primaryEmail || u.primary_email,
          displayName: u.displayName || u.display_name || u.name,
          firstName: u.firstName || u.given_name || null,
          lastName: u.lastName || u.family_name || null,
          profileImageUrl: u.profileImageUrl || u.avatar_url || null,
        };
        const dbUser = await ensureDbUserFromStack(stackUser);
        return res.status(200).json({ ok: true, event: eventType, userId: dbUser.id });
      } catch (e) {
        return res.status(500).json({ error: 'Webhook processing failed', detail: (e as Error).message });
      }
    }

    // Admin backfill: POST /api/admin/backfill-stack-users { users: [{id,email,displayName,firstName,lastName,profileImageUrl}] }
    if (req.url === '/api/admin/backfill-stack-users') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env.ADMIN_TOKEN || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      const users = (req.body && (req.body as any).users) || [];
      if (!Array.isArray(users)) return res.status(400).json({ error: 'users array required' });
      const results: any[] = [];
      for (const u of users) {
        const dbUser = await ensureDbUserFromStack({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          firstName: u.firstName,
          lastName: u.lastName,
          profileImageUrl: u.profileImageUrl,
        });
        results.push({ id: dbUser.id, email: dbUser.email });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, count: results.length, users: results });
    }

    // Admin: link legacy numeric user ID to Stack Auth ID
    // Body: { legacyUserId: string | number, stackId: string }
    if (req.url === '/api/admin/link-legacy-user') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env.ADMIN_TOKEN || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      const { legacyUserId, stackId } = (req.body || {}) as { legacyUserId?: string | number; stackId?: string };
      if (!legacyUserId || !stackId) return res.status(400).json({ error: 'legacyUserId and stackId required' });
      const { storage } = await import('../server/storage');
      const linked = await storage.linkStackAuthId(String(legacyUserId), String(stackId));
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, linkedUserId: linked.id, email: linked.email });
    }

    // Admin export: Get metadata for all users to update in Stack dashboard manually
    // Returns: [{ email, stackId, legacyUserId, triggerWord, modelStatus, modelName }]
    if (req.url === '/api/admin/export-user-metadata') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env.ADMIN_TOKEN || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      const { storage } = await import('../server/storage');
      const users = await storage.getAllUsers();
      const result = [] as Array<Record<string, unknown>>;
      for (const u of users) {
        const legacyUserId = (u as any).id;
        const stackId = (u as any).stackAuthId || null;
        let model = await storage.getUserModelByUserId(String(legacyUserId));
        const trained = !!model && (model as any).trainingStatus === 'completed';
        const triggerWord = model?.triggerWord || `user${String(legacyUserId).replace(/[^a-zA-Z0-9]/g, '')}`;
        result.push({
          email: (u as any).email || null,
          stackId,
          legacyUserId,
          triggerWord,
          modelStatus: model?.trainingStatus || 'not_started',
          modelName: model?.modelName || null
        });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ count: result.length, users: result });
    }

    // /api/me: ensure DB user and return JSON
    if (req.url === '/api/me' || req.url?.startsWith('/api/me?')) {
      try {
        const user = await getAuthenticatedUser();
        const { storage } = await import('../server/storage');
        // Try to get existing user
        let dbUser = await storage.getUser(user.id as string);
        if (!dbUser) {
          // Try link by email
          if (user.email) {
            const byEmail = await storage.getUserByEmail(user.email as string);
            if (byEmail) {
              dbUser = await storage.linkStackAuthId(byEmail.id, user.id as string);
            }
          }
        }
        if (!dbUser) {
          // Create new user
          dbUser = await storage.upsertUser({
            id: user.id as string,
            email: (user.email as string) || null,
            displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            profileImageUrl: null,
          } as any);
        }
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ user: dbUser });
      } catch (error) {
        console.log('❌ /api/me failed:', (error as Error).message);
        return res.status(401).json({ message: 'Authentication required', error: (error as Error).message });
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

    // Handle Maya video prompt endpoint
    if (req.url?.includes('/api/maya/get-video-prompt')) {
      console.log('🔍 Maya video prompt endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { imageUrl } = req.body || {};
        
        if (!imageUrl) {
          return res.status(400).json({ error: 'Image URL is required' });
        }
        
        console.log('🎬 MAYA VIDEO DIRECTION: Creating motion prompt for user:', user.id);
        
        // Maya's video director system prompt
        const videoDirectorPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Video Director. 

🎬 VIDEO DIRECTION MODE: You are analyzing the actual image provided to create the perfect motion prompt for VEO 3 video generation.

Your expertise includes:
- Cinematic storytelling and visual narrative
- Fashion and lifestyle video aesthetics
- Professional portrait cinematography
- Understanding of what makes compelling short-form video content

TASK: Analyze the provided image carefully and create ONE single, cinematic motion prompt that perfectly enhances what you see in the image.

ANALYSIS INSTRUCTIONS:
1. Study the subject's pose, expression, and mood
2. Observe the lighting, background, and overall composition
3. Consider the style and aesthetic of the image
4. Identify the best camera movement that would enhance the scene

MOTION PROMPT GUIDELINES:
- Keep it to 1-2 sentences maximum
- Focus on movements that specifically enhance THIS image
- Use the actual elements you see (lighting, pose, background, mood)
- Use professional cinematography terminology
- Make it suitable for high-end fashion/lifestyle content
- Be specific to what you observe in the image

Analyze the image and respond with ONLY the motion prompt that perfectly captures and enhances what you see - no explanation, no additional text.`;

        try {
          // Call Claude Vision API for real image analysis
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 1000,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: videoDirectorPrompt
                    },
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: 'image/jpeg',
                        data: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : imageUrl
                      }
                    }
                  ]
                }
              ]
            })
          });

          let videoPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
          
          if (claudeResponse.ok) {
            const data = await claudeResponse.json();
            videoPrompt = data.content[0].text;
            console.log('✅ MAYA VIDEO DIRECTION: Generated custom prompt via Claude Vision');
          } else {
            console.log('⚠️ MAYA VIDEO DIRECTION: Claude Vision failed, using fallback prompt');
          }
          
          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).json({
            videoPrompt,
            director: 'Maya - AI Creative Director',
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          // Fallback to a good default prompt
          const fallbackPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
          
          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).json({
            videoPrompt: fallbackPrompt,
            director: 'Maya - AI Creative Director (Fallback)',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (authError) {
        console.log('❌ Maya video prompt auth failed:', authError.message);
        return res.status(401).json({ 
          error: 'Authentication required',
          message: authError.message
        });
      }
    }

    // Handle Maya generate endpoint
    if (req.url?.includes('/api/maya/generate')) {
      console.log('🔍 Maya generate endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya generate for user:', user.id);
        
        // Get request body
        const body = req.body || {};
        console.log('🔍 Maya generate request body:', JSON.stringify(body, null, 2));
        
        const { prompt, conceptName, count = 2 } = body as {
          prompt?: string;
          conceptName?: string;
          count?: number;
        };
        
        if (!prompt) {
          return res.status(400).json({ error: 'Prompt is required' });
        }
        
        // Import the generation service
        const { ModelTrainingService } = await import('../server/model-training-service');
        
        console.log('🎨 Starting image generation for user:', user.id);
        console.log('🎯 Prompt:', prompt);
        console.log('🎯 Count:', count);
        
        // Generate images using the ModelTrainingService
        const generationResult = await ModelTrainingService.generateUserImages(
          user.id as string,
          prompt as string,
          count as number,
          { categoryContext: (conceptName as string) || 'Maya Generation' }
        );
        
        console.log('✅ Generation result:', generationResult);
        
        // Create generation tracker for monitoring
        const { storage } = await import('../server/storage');
        const tracker = await storage.createGenerationTracker({
          userId: user.id as string,
          predictionId: generationResult.predictionId as string,
          prompt: prompt as string,
          status: 'processing',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('📝 Created generation tracker:', tracker.id);
        
        // Return the generation result with prediction ID for polling
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          success: true,
          predictionId: generationResult.predictionId,
          generatedImageId: generationResult.generatedImageId,
          trackerId: tracker.id,
          message: 'Image generation started successfully',
          images: generationResult.images || []
        });
        
      } catch (error) {
        console.log('❌ Maya generate failed:', error.message);
        return res.status(500).json({ 
          message: 'Image generation failed',
          error: error.message
        });
      }
    }

    // Handle Maya generation status endpoint (for polling)
    if (req.url?.includes('/api/maya/status')) {
      console.log('🔍 Maya status endpoint called:', req.url);
      
      try {
        await getAuthenticatedUser();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const url = new (globalThis as any).URL(req.url || '', `http://${req.headers.host}`);
        const predictionId = url.searchParams.get('predictionId');
        
        if (!predictionId) {
          return res.status(400).json({ error: 'Prediction ID is required' });
        }
        
        // Import the generation service
        const { ModelTrainingService } = await import('../server/model-training-service');
        
        console.log('🔍 Checking generation status for prediction:', predictionId);
        
        // Check generation status
        const statusResult = await ModelTrainingService.checkGenerationStatus(predictionId);
        
        console.log('📊 Generation status result:', statusResult);
        
        // If generation is completed, trigger the completion monitor
        if (statusResult.status === 'succeeded' && statusResult.imageUrls && statusResult.imageUrls.length > 0) {
          console.log('🎉 Generation completed! Triggering completion monitor...');
          
          // Import and trigger the generation completion monitor
          // const { GenerationCompletionMonitor } = await import('../server/generation-completion-monitor');
          
          // Find the generation tracker for this prediction
          const { storage } = await import('../server/storage');
          const tracker = await storage.getGenerationTrackerByPredictionId(predictionId);
          
          if (tracker) {
            console.log('📝 Found generation tracker:', tracker.id);
            
            // Update the tracker with completed images
            await storage.updateGenerationTracker(tracker.id, {
              status: 'completed',
              imageUrls: JSON.stringify(statusResult.imageUrls),
              updatedAt: new Date()
            });
            
            // Save images to gallery
            for (const imageUrl of statusResult.imageUrls) {
              await storage.saveGeneratedImage({
                userId: tracker.userId,
                imageUrls: JSON.stringify([imageUrl]),
                prompt: tracker.prompt || 'Maya Editorial Photoshoot',
                category: 'Maya Editorial',
                subcategory: 'Professional'
              });
            }
            
            console.log('✅ Saved images to gallery for user:', tracker.userId);
          }
        }
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          success: true,
          status: statusResult.status,
          images: statusResult.imageUrls || [],
          predictionId: predictionId
        });
        
      } catch (error) {
        console.log('❌ Maya status check failed:', error.message);
        return res.status(500).json({ 
          message: 'Status check failed',
          error: error.message
        });
      }
    }

    // Handle Maya chat endpoints
    if (req.url?.includes('/api/maya/chat') || req.url?.includes('/api/maya-chat') || req.url?.includes('/api/maya-generate')) {
      console.log('🔍 Maya chat endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya chat for user:', user.id, user.email);
        
        // Get request body
        const body = req.body || {};
        console.log('🔍 Maya chat request body:', JSON.stringify(body, null, 2));
        
        // Real Maya response with Google Gemini AI
        const { message, context = 'styling', conversationHistory = [] } = body as {
          message?: string;
          context?: string;
          conversationHistory?: ConversationEntry[];
        };
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        // Connect to REAL Maya system using Claude API
        let mayaResponse = '';
        let conceptCards: ConceptCard[] = [];
        
        try {
          // Use the real Maya personality system
          const { PersonalityManager } = await import('../server/agents/personalities/personality-config.js');
          const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
          
          console.log('🎨 MAYA: Using real personality system with Claude API');
          
          // Call Claude API with Maya's real personality
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4000,
              system: baseMayaPersonality,
              messages: [
                ...(conversationHistory || []).map((entry: ConversationEntry) => ({
                  role: entry.role === 'user' ? 'user' : 'assistant',
                  content: entry.content || entry.message || ''
                })),
                {
                  role: 'user',
                  content: message
                }
              ]
            })
          });

          if (!claudeResponse.ok) {
            throw new Error(`Claude API error: ${claudeResponse.status}`);
          }

          const data = await claudeResponse.json();
          mayaResponse = data.content[0].text;
          
          // Extract concept cards from Maya's response
          conceptCards = extractConceptCards(mayaResponse);
          
          // Apply gender context to concept cards
          conceptCards = await applyGenderContext(conceptCards, user.id as string);
          
          console.log('✅ MAYA: Generated response with', conceptCards.length, 'concept cards using Claude API');
          
        } catch (claudeError) {
          console.log('❌ MAYA: Claude API failed:', (claudeError as Error).message);
          
          // Fallback to creative storytelling concepts aligned with Maya's signature looks
          mayaResponse = `I understand you're looking for styling concepts! Let me create some personalized photo concepts that tell your unique brand story.

Here are 3 concept cards inspired by my signature editorial looks:

🌟 **THE GOLDEN HOUR STORYTELLER**
Capture your authentic warmth and approachability with the magic of golden hour light. This concept positions you as someone who brings light and positivity to their work, perfect for coaches, consultants, and creative entrepreneurs.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, warm golden hour lighting streaming through large windows, person in soft knit sweater in neutral tones, authentic genuine smile, seated at a modern wooden table with soft shadows, warm backlit hair, natural makeup emphasizing warmth, cozy sophisticated environment with plants

---

✨ **THE SCANDINAVIAN MINIMALIST VISION**  
A clean, intentional aesthetic that speaks to your clarity of thought and sophisticated approach. This concept communicates reliability and premium quality through understated elegance.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, bright airy minimalist interior with white walls and light wood floors, person in high-quality neutral clothing - cream cashmere sweater, natural lighting from large windows with sheer curtains, serene confident expression, clean architectural lines, hygge atmosphere

---

🎬 **THE URBAN CREATIVE MUSE**
For the innovative thinker who thrives in dynamic environments. This concept captures your creative edge and forward-thinking approach through sophisticated urban aesthetics and moody lighting.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, atmospheric urban setting with soft industrial elements, dramatic side lighting creating interesting shadows, person in elevated casual wear - structured blazer over quality basics, thoughtful contemplative expression, modern art gallery or loft space background, cinematic depth of field`;
          
          conceptCards = [
            {
              id: `concept_${Date.now()}_1`,
              title: 'The Golden Hour Storyteller',
              description: 'Capture your authentic warmth and approachability with the magic of golden hour light.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, warm golden hour lighting streaming through large windows, person in soft knit sweater in neutral tones, authentic genuine smile, seated at a modern wooden table with soft shadows, warm backlit hair, natural makeup emphasizing warmth, cozy sophisticated environment with plants',
              category: 'Editorial',
              emoji: '🌟'
            },
            {
              id: `concept_${Date.now()}_2`, 
              title: 'The Scandinavian Minimalist Vision',
              description: 'A clean, intentional aesthetic that speaks to your clarity of thought and sophisticated approach.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, bright airy minimalist interior with white walls and light wood floors, person in high-quality neutral clothing - cream cashmere sweater, natural lighting from large windows with sheer curtains, serene confident expression, clean architectural lines, hygge atmosphere',
              category: 'Editorial',
              emoji: '✨'
            },
            {
              id: `concept_${Date.now()}_3`,
              title: 'The Urban Creative Muse', 
              description: 'For the innovative thinker who thrives in dynamic environments with creative edge.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, atmospheric urban setting with soft industrial elements, dramatic side lighting creating interesting shadows, person in elevated casual wear - structured blazer over quality basics, thoughtful contemplative expression, modern art gallery or loft space background, cinematic depth of field',
              category: 'Editorial',
              emoji: '🎬'
            }
          ];
          
          // Apply gender context to fallback concept cards
          conceptCards = await applyGenderContext(conceptCards, user.id as string);
        }
        
        const response = {
          id: `maya_${Date.now()}`,
          userId: user.id,
          message: message,
          response: mayaResponse,
          conceptCards: conceptCards,
          timestamp: new Date().toISOString(),
          context: context
        };
        
        console.log('📊 Returning Maya response:', JSON.stringify(response, null, 2));
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(response);
        
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
        console.log('🔍 Getting Maya chats for user:', user.id);
        
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
        res.setHeader('Cache-Control', 'no-store');
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
    if (req.url === '/api/gallery' || req.url?.startsWith('/api/gallery?')) {
      console.log('🔍 Gallery endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting gallery images for user:', user.id, user.email);
        
        // Import storage service to fetch real images
        const { storage } = await import('../server/storage');
        
        // Fetch images from both tables
        const [aiImages, generatedImages] = await Promise.all([
          storage.getAIImages(user.id as string),
          storage.getGeneratedImages(user.id as string)
        ]);
        
        console.log('📊 Found AI images:', aiImages.length);
        console.log('📊 Found generated images:', generatedImages.length);
        
        // Combine and format images for gallery
        const galleryImages = [
          // Format AI images (legacy table)
          ...aiImages.map(img => ({
            id: img.id.toString(),
            userId: img.userId,
            type: 'ai_generated',
            title: img.style || 'AI Generated Image',
            description: img.prompt || 'AI-generated image',
            imageUrl: img.imageUrl,
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: img.style ? [img.style] : ['ai-generated']
          })),
          // Format generated images (new table)
          ...generatedImages.map(img => ({
            id: `gen_${img.id}`,
            userId: img.userId,
            type: 'generated',
            title: 'Generated Image',
            description: img.prompt || 'Generated image',
            imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: [img.category || 'generated']
          }))
        ];
        
        // Sort by creation date (newest first)
        galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('📊 Returning gallery images:', galleryImages.length, 'total images');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        console.log('❌ Gallery fetch failed:', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch gallery images',
          error: error.message
        });
      }
    }

    // Handle user gender update endpoint
    if (req.url === '/api/user/update-gender') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const user = await getAuthenticatedUser();
        const { gender } = req.body || {};
        
        if (!gender) {
          return res.status(400).json({ error: 'Gender is required' });
        }
        
        if (!['man', 'woman', 'female', 'male', 'non-binary', 'other'].includes(gender.toLowerCase())) {
          return res.status(400).json({ error: 'Invalid gender value' });
        }
        
        // Update user gender in database
        const { storage } = await import('../server/storage');
        await storage.updateUserProfile(user.id as string, { gender });
        
        console.log(`✅ Updated gender for user ${user.id}: ${gender}`);
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ 
          success: true, 
          message: 'Gender updated successfully' 
        });
        
      } catch (error) {
        console.log('❌ Gender update failed:', error.message);
        return res.status(500).json({ 
          error: 'Failed to update gender',
          message: error.message 
        });
      }
    }

    // Handle gallery-images endpoint (alternative)
    if (req.url === '/api/gallery-images' || req.url?.startsWith('/api/gallery-images?')) {
      console.log('🔍 Gallery-images endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting gallery images for user:', user.id, user.email);
        
        // Import storage service to fetch real images
        const { storage } = await import('../server/storage');
        
        // Fetch images from both tables
        const [aiImages, generatedImages] = await Promise.all([
          storage.getAIImages(user.id as string),
          storage.getGeneratedImages(user.id as string)
        ]);
        
        console.log('📊 Found AI images:', aiImages.length);
        console.log('📊 Found generated images:', generatedImages.length);
        
        // Combine and format images for gallery
        const galleryImages = [
          // Format AI images (legacy table)
          ...aiImages.map(img => ({
            id: img.id.toString(),
            userId: img.userId,
            type: 'ai_generated',
            title: img.style || 'AI Generated Image',
            description: img.prompt || 'AI-generated image',
            imageUrl: img.imageUrl,
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: img.style ? [img.style] : ['ai-generated']
          })),
          // Format generated images (new table)
          ...generatedImages.map(img => ({
            id: `gen_${img.id}`,
            userId: img.userId,
            type: 'generated',
            title: 'Generated Image',
            description: img.prompt || 'Generated image',
            imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: [img.category || 'generated']
          }))
        ];
        
        // Sort by creation date (newest first)
        galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('📊 Returning gallery-images:', galleryImages.length, 'total images');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        console.log('❌ Gallery-images fetch failed:', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch gallery images',
          error: error.message
        });
      }
    }
    
    // Test database connection endpoint
    if (req.url === '/api/test-db') {
      try {
        const { storage } = await import('../server/storage');
        const user = await getAuthenticatedUser();
        
        // Test basic database operations
        const dbUser = await storage.getUser(user.id as string);
        const aiImages = await storage.getAIImages(user.id as string);
        const generatedImages = await storage.getGeneratedImages(user.id as string);
        
        return res.status(200).json({
          message: 'Database connection test',
          user: {
            id: user.id,
            email: user.email,
            dbUser: dbUser ? { id: dbUser.id, email: dbUser.email } : null
          },
          counts: {
            aiImages: aiImages.length,
            generatedImages: generatedImages.length
          },
          sampleAiImages: aiImages.slice(0, 3),
          sampleGeneratedImages: generatedImages.slice(0, 3)
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Database connection failed',
          error: error.message,
          stack: error.stack
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
