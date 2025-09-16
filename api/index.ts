import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
const JWKS = createRemoteJWKSet(new (globalThis as any).URL(JWKS_URL));

// Helper function to extract concept cards from Maya's response
function extractConceptCards(response: string): any[] {
  const conceptCards: any[] = [];
  
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

    // Handle Maya generate endpoint
    if (req.url?.includes('/api/maya/generate')) {
      console.log('🔍 Maya generate endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya generate for user:', user.id, user.email);
        
        // Get request body
        const body = req.body || {};
        console.log('🔍 Maya generate request body:', JSON.stringify(body, null, 2));
        
        const { prompt, chatId, conceptName, count = 2 } = body as {
          prompt?: string;
          chatId?: string;
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
        const user = await getAuthenticatedUser();
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
          const { GenerationCompletionMonitor } = await import('../server/generation-completion-monitor');
          
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
    if (req.url?.includes('/api/maya-chat') || req.url?.includes('/api/maya-generate')) {
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
          conversationHistory?: any[];
        };
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        // Initialize Google Gemini AI
        let geminiAI: any = null;
        try {
          if (process.env.GOOGLE_API_KEY) {
            // Dynamic import to avoid build-time dependency issues
            const googleAI = await import('@google/generative-ai');
            geminiAI = new googleAI.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            console.log('🎨 MAYA: Gemini AI initialized');
          } else {
            console.log('⚠️ MAYA: No Google API key found, using fallback response');
          }
        } catch (error) {
          console.log('❌ MAYA: Failed to initialize Gemini AI:', (error as Error).message);
        }
        
        let mayaResponse = '';
        let conceptCards: any[] = [];
        
        if (geminiAI) {
          // Use real Maya personality with Google Gemini
          const model = (geminiAI as any).getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
          
          // Maya's complete personality prompt
          const systemPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Personal Brand Strategist. You are sophisticated, intuitive, and deeply understand luxury personal branding.

CORE PHILOSOPHY:
- Mission: To act as a world-class AI Art Director, Brand Stylist, and Location Scout, translating a user's personal brand into a cohesive, editorial-quality visual identity.
- Role: You are the user's creative partner, providing sophisticated visual direction with expertise in lighting, composition, fashion, and scenery.
- Core Principle: Always create 3-5 concept cards. 80% should feature the individual (portraits/lifestyle), while 20% should be supporting flatlay/object imagery that builds the brand world.

AESTHETIC DNA:
- Quality First: All prompts begin with technical keywords: "raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores"
- Natural and Authentic: Avoid overly perfect, 'plastic' AI looks. Strive for authenticity.
- Sophisticated and Understated: Elegant and confident, never loud or trendy. It whispers luxury, it doesn't shout.
- Focus on Light: Light is the most important element. Whether it's soft morning light, dramatic shadows, or golden hour glow, the lighting must be intentional and evocative.

CREATIVE LOOKBOOK (12 Signature Styles):
1. The Scandinavian Minimalist - Clean, bright, intentional with natural materials
2. The Urban Moody - Sophisticated, atmospheric, cinematic for professionals with edge
3. The High-End Coastal - Effortless luxury meets the sea, relaxed elegance
4. The Luxury Dark & Moody - Rich, opulent, mysterious with old-world elegance
5. The 'White Space' Executive - Modern, powerful, clean for forward-thinking leaders
6. The 'Black & Dark' Auteur - Creative, intense, confident for artists and visionaries
7. The Golden Hour Glow - Warm, approachable, authentic capturing magic hour
8. The Night Time Luxe - Energetic, sophisticated, glamorous city energy
9. The Classic B&W - Timeless, emotional, powerful focus on form and texture
10. The Beige & Sophisticated - Warm, calm, professional new neutral for business
11. The Fashion Street Style - Candid, effortless, editorial modern tastemaker
12. The User-Directed Look - Flexible framework adapting to specific user requests

CRITICAL: CONCEPT CARD GENERATION TRAINING

MANDATORY RESPONSE FORMAT: When a user asks for styling ideas, photos, or concepts, you MUST create exactly 3-5 concept cards using this format:

[EMOJI] **CONCEPT NAME IN ALL CAPS**
[Your intelligent styling description explaining why this concept works for the user's goals and brand, drawing from your Creative Lookbook above]

FLUX_PROMPT: [Create a detailed, natural language prompt that incorporates the aesthetic DNA principles above and relevant elements from your Creative Lookbook]

---

REQUIREMENTS FOR EVERY RESPONSE:
• Always create 3-5 different concept variations
• Start each concept with styling emoji (🎯✨💼🌟💫🏆📸🎬)  
• Include FLUX_PROMPT with technical quality keywords and natural styling description
• Draw inspiration from your 12 signature looks above
• Use your aesthetic DNA principles in every concept
• Include appropriate camera/lens specifications for the shot type
• Write as natural flowing sentences, not keyword lists
• Separate concepts with "---" line breaks
• Apply the 80/20 principle: ALWAYS include 3-4 portrait/lifestyle concepts (80%) AND 1-2 flatlay/object concepts (20%) drawn from the "Detail Styling" sections of your Creative Looks above

VOICE & COMMUNICATION:
- Strategic and encouraging: Think about the "why" behind each creative choice
- Elegant and efficient: Polished, clear communication that respects the user's time  
- Warm with authority: Friendly but confident - you are the expert
- Focus on "you" and "your": Make it personal and bespoke for the user's brand
- Inspire, don't just instruct: Frame suggestions as collaborative creative actions

EXAMPLE PHRASES:
"Let's create..."
"Your story..."  
"Perfect for your brand..."
"This concept captures..."
"I'm excited to see..."`;

          // Build conversation context
          let conversationContext = systemPrompt + '\n\n';
          if (conversationHistory && Array.isArray(conversationHistory)) {
            conversationHistory.forEach(entry => {
              if (entry.role === 'user') conversationContext += `User: ${entry.content}\n`;
              if (entry.role === 'assistant') conversationContext += `Maya: ${entry.content}\n`;
            });
          }
          conversationContext += `User: ${message}\nMaya:`;

          try {
            const result = await model.generateContent(conversationContext);
            const response = result.response;
            mayaResponse = response.text();
            
            // Extract concept cards from Maya's response
            conceptCards = extractConceptCards(mayaResponse);
            
            console.log('✅ MAYA: Generated response with', conceptCards.length, 'concept cards');
          } catch (geminiError) {
            console.log('❌ MAYA: Gemini generation failed:', geminiError.message);
            // Fallback to basic response
            mayaResponse = `I understand you're looking for styling concepts! Let me create some personalized photo concepts for your brand.

Here are 3 concept cards tailored to your needs:

🎯 **PROFESSIONAL HEADSHOT**
A clean, confident portrait perfect for your professional brand. Think crisp white background, natural lighting, and a sharp blazer.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, confident business professional, clean white background, natural lighting, sharp blazer, professional headshot, high-end portrait

---

✨ **LIFESTYLE BRAND SHOT**  
A more relaxed, approachable image that shows your personality while maintaining professionalism. Perfect for social media and marketing materials.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, lifestyle portrait, natural lighting, approachable professional, modern office setting, authentic expression

---

💼 **EXECUTIVE PRESENCE**
A powerful, commanding image that conveys authority and expertise. Ideal for speaking engagements and thought leadership content.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, executive portrait, dramatic lighting, commanding presence, dark background, professional attire, confident expression`;
            
            conceptCards = [
              {
                id: `concept_${Date.now()}_1`,
                title: 'Professional Headshot',
                description: 'A clean, confident portrait perfect for your professional brand.',
                fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, confident business professional, clean white background, natural lighting, sharp blazer, professional headshot, high-end portrait',
                category: 'Professional',
                emoji: '🎯'
              },
              {
                id: `concept_${Date.now()}_2`, 
                title: 'Lifestyle Brand Shot',
                description: 'A more relaxed, approachable image that shows your personality.',
                fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, lifestyle portrait, natural lighting, approachable professional, modern office setting, authentic expression',
                category: 'Lifestyle',
                emoji: '✨'
              },
              {
                id: `concept_${Date.now()}_3`,
                title: 'Executive Presence', 
                description: 'A powerful, commanding image that conveys authority and expertise.',
                fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, executive portrait, dramatic lighting, commanding presence, dark background, professional attire, confident expression',
                category: 'Executive',
                emoji: '💼'
              }
            ];
          }
        } else {
          // Fallback response when Gemini is not available
          mayaResponse = `I understand you're looking for styling concepts! Let me create some personalized photo concepts for your brand.

Here are 3 concept cards tailored to your needs:

🎯 **PROFESSIONAL HEADSHOT**
A clean, confident portrait perfect for your professional brand. Think crisp white background, natural lighting, and a sharp blazer.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, confident business professional, clean white background, natural lighting, sharp blazer, professional headshot, high-end portrait

---

✨ **LIFESTYLE BRAND SHOT**  
A more relaxed, approachable image that shows your personality while maintaining professionalism. Perfect for social media and marketing materials.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, lifestyle portrait, natural lighting, approachable professional, modern office setting, authentic expression

---

💼 **EXECUTIVE PRESENCE**
A powerful, commanding image that conveys authority and expertise. Ideal for speaking engagements and thought leadership content.

FLUX_PROMPT: raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, executive portrait, dramatic lighting, commanding presence, dark background, professional attire, confident expression`;
          
          conceptCards = [
            {
              id: `concept_${Date.now()}_1`,
              title: 'Professional Headshot',
              description: 'A clean, confident portrait perfect for your professional brand.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, confident business professional, clean white background, natural lighting, sharp blazer, professional headshot, high-end portrait',
              category: 'Professional',
              emoji: '🎯'
            },
            {
              id: `concept_${Date.now()}_2`, 
              title: 'Lifestyle Brand Shot',
              description: 'A more relaxed, approachable image that shows your personality.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, lifestyle portrait, natural lighting, approachable professional, modern office setting, authentic expression',
              category: 'Lifestyle',
              emoji: '✨'
            },
            {
              id: `concept_${Date.now()}_3`,
              title: 'Executive Presence', 
              description: 'A powerful, commanding image that conveys authority and expertise.',
              fluxPrompt: 'raw photo, editorial quality, professional photography, sharp focus, film grain, visible skin pores, executive portrait, dramatic lighting, commanding presence, dark background, professional attire, confident expression',
              category: 'Executive',
              emoji: '💼'
            }
          ];
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
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        console.log('❌ Gallery fetch failed:', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch gallery images',
          error: error.message
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
