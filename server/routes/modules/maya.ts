/**
 * Maya Routes - AI Brand Strategist
 * Handles Maya AI conversational interface, image generation, and brand development
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { storage } from '../../storage.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { AuthenticatedRequest } from '../../../shared/types/ai-generation.js';

const router = Router();

// Helper to get authenticated user
function getAuthenticatedUser(req: AuthenticatedRequest) {
  if (!req.user?.id) {
    throw new Error('Authentication required');
  }
  return req.user;
}

// Timed fetch utility for external API calls
async function timedFetch(url: string, timeoutMs: number, options: RequestInit): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
// Maya video prompt endpoint
router.post('/api/maya/get-video-prompt', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { imageUrl } = req.body || {};
    
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }
    
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
      const claudeResponse = await timedFetch('https://api.anthropic.com/v1/messages', 15000, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env['ANTHROPIC_API_KEY'] || '',
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
                imageUrl.startsWith('data:')
                  ? {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: 'image/jpeg',
                        data: imageUrl.split(',')[1]
                      }
                    }
                  : {
                      type: 'image',
                      source: {
                        type: 'url',
                        url: imageUrl
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
      }
      
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        videoPrompt,
        director: 'Maya - AI Creative Director',
        timestamp: new Date().toISOString()
      });
      
    } catch {
      const fallbackPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
      
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        videoPrompt: fallbackPrompt,
        director: 'Maya - AI Creative Director (Fallback)',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (authError) {
    res.status(401).json({ 
      error: 'Authentication required',
      message: (authError as Error).message
    });
  }
}));

// Maya status endpoint
router.get('/api/maya/status', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const userModel = await storage.getUserModelByUserId(user.id);
    const dbUser = await storage.getUserByStackAuthId(user.id);
    
    if (!userModel) {
      res.status(200).json({
        ready: false,
        message: 'Training required',
        trainingStatus: 'not_started',
        needsTraining: true
      });
      return;
    }
    
    const isReady = userModel.trainingStatus === 'completed';
    const canGenerate = isReady && (dbUser?.monthlyGenerationLimit === -1 || (dbUser?.monthlyGenerationLimit || 0) > 0);
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ready: isReady,
      canGenerate,
      trainingStatus: userModel.trainingStatus,
      modelVersionId: userModel.replicateVersionId,
      generationsRemaining: dbUser?.monthlyGenerationLimit || 0,
      message: isReady ? 'Maya AI is ready!' : 'Training in progress...'
    });
    
  } catch (error) {
    console.error('❌ MAYA STATUS ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to check Maya status',
      message: (error as Error).message
    });
  }
}));

// Maya models endpoint
router.get('/api/maya/models', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    models: ['flux-dev', 'flux-schnell'],
    default: 'flux-dev'
  });
}));

// Maya env check endpoint
router.get('/api/maya/env-check', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const anthropicKeySet = !!process.env['ANTHROPIC_API_KEY'];
  const replicateTokenSet = !!process.env['REPLICATE_API_TOKEN'];
  
  res.status(200).json({
    anthropicApiKey: anthropicKeySet ? 'SET' : 'MISSING',
    replicateToken: replicateTokenSet ? 'SET' : 'MISSING',
    allConfigured: anthropicKeySet && replicateTokenSet
  });
}));

// Maya generate endpoint
router.post('/api/maya/generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    console.log(`🔍 MAYA GENERATE: Request from Stack Auth user: ${user.id}`);
    
    const { prompt, style, count = 1, conceptName, seed } = req.body || {};
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    
    // Get database user for generation
    const dbUser = await storage.getUserByStackAuthId(user.id);
    if (!dbUser) {
      res.status(400).json({ 
        error: 'User not found',
        message: 'Please complete onboarding first'
      });
      return;
    }
    
    // Validate model training
    const userModel = await storage.getUserModelByUserId(user.id);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      res.status(400).json({ 
        error: 'Training required',
        message: 'Please complete your model training before generating images'
      });
      return;
    }
    
    // Use MayaService for generation (needs internal database ID for trigger word)
    const { mayaService } = await import('../../services/maya-service.js');
    
    const generationResult = await mayaService.generateImages(dbUser.id, {
      conceptCard: {
        id: `maya-gen-${Date.now()}`,
        title: conceptName || 'Maya AI Generation',
        fluxPrompt: prompt
      }
    });
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      generationId: generationResult.generationId,
      status: generationResult.status,
      message: generationResult.message
    });
    
  } catch (error) {
    console.error('❌ MAYA GENERATE ERROR:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      message: (error as Error).message
    });
  }
}));

// Maya heart image endpoint
router.post('/api/maya/heart-image', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { imageUrl, prompt, category } = req.body || {};
    
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }
    
    const { MayaChatPreviewService } = await import('../../maya-chat-preview-service.js');
    
    const galleryImage = await MayaChatPreviewService.heartImageToGallery(
      user.id,
      imageUrl,
      prompt || 'Hearted from Maya chat',
      category || 'Maya AI'
    );

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      galleryImage,
      message: 'Image saved to your gallery!'
    });
    
  } catch (error) {
    console.error('❌ MAYA HEART ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to save image to gallery',
      message: (error as Error).message
    });
  }
}));

// Maya chats list endpoint
router.get('/api/maya-chats', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const conversations = await storage.getMayaChats(user.id);
    
    conversations.sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      chats: conversations
    });
    
  } catch (error) {
    console.error('❌ MAYA CHATS ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve chats',
      message: (error as Error).message
    });
  }
}));

// Maya chat history endpoint
router.get('/api/maya/chat-history', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const chatId = req.query.chatId as string;
    
    if (!chatId) {
      res.status(400).json({ error: 'chatId is required' });
      return;
    }
    
    const messages = await storage.getMayaChatMessages(chatId, user.id);
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      messages
    });
    
  } catch (error) {
    console.error('❌ MAYA CHAT HISTORY ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve chat history',
      message: (error as Error).message
    });
  }
}));

// Maya chat endpoint (main conversational AI)
router.post('/api/maya/chat', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { message, chatHistory = [], context = {} } = req.body || {};
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    console.log(`💬 MAYA CHAT: User ${user.id} - "${message.substring(0, 50)}..."`);
    
    const dbUser = await storage.getUserByStackAuthId(user.id);
    const userProfile = dbUser ? {
      name: dbUser.displayName || dbUser.email || 'there',
      email: dbUser.email,
      plan: dbUser.plan
    } : { name: 'there' };
    
    const mayaSystemPrompt = `You are Maya, SSELFIE Studio's AI Personal Brand Strategist and Creative Director.

Your personality:
- Warm, insightful, and genuinely invested in your client's success
- Professional yet approachable - like a trusted creative partner
- Expert in personal branding, visual identity, and content strategy
- Passionate about helping people discover and express their authentic brand

Your approach:
- Ask thoughtful questions to understand their brand vision
- Provide specific, actionable guidance
- Celebrate their unique qualities and help them shine
- Be encouraging but honest about what works

Current conversation with ${userProfile.name}.

Respond naturally and conversationally. Keep responses focused and valuable.`;

    const claudeHistory = chatHistory.map((entry: any) => ({
      role: entry.maya ? 'assistant' : 'user',
      content: entry.maya || entry.user || entry.response || ''
    })).filter((entry: any) => entry.content);

    claudeHistory.push({
      role: 'user',
      content: message
    });

    try {
      const claudeResponse = await timedFetch('https://api.anthropic.com/v1/messages', 30000, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env['ANTHROPIC_API_KEY'] || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: mayaSystemPrompt,
          messages: claudeHistory
        })
      });

      if (!claudeResponse.ok) {
        throw new Error(`Claude API error: ${claudeResponse.status}`);
      }

      const data = await claudeResponse.json();
      const mayaResponse = data.content[0].text;

      let conversation: any = null;
      try {
        const conversations = await storage.getMayaChats(user.id);
        conversation = conversations[0];
        
        if (!conversation) {
          const chatId = await storage.createMayaChat(user.id, {
            userId: user.id,
            chatTitle: 'New Chat',
            initialMessage: message.substring(0, 100)
          });
          conversation = { id: chatId };
        }

        await storage.createMayaChatMessage({
          chatId: parseInt(conversation.id),
          role: 'user',
          content: message
        });

        await storage.createMayaChatMessage({
          chatId: parseInt(conversation.id),
          role: 'assistant',
          content: mayaResponse
        });

      } catch (storageError) {
        console.warn('⚠️ Failed to store conversation:', (storageError as Error).message);
      }

      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        response: mayaResponse,
        conversationId: conversation?.id || null,
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('❌ Claude API error:', apiError);
      
      const fallbackResponse = "I'm having trouble connecting right now. Please try again in a moment, and I'll be here to help you with your brand strategy!";
      
      res.status(200).json({
        response: fallbackResponse,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ MAYA CHAT ERROR:', error);
    res.status(500).json({ 
      error: 'Chat failed',
      message: (error as Error).message
    });
  }
}));

// Maya chat alias endpoints - these forward to /api/maya/chat
router.post('/api/maya-chat', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Forward the request body to the chat endpoint
  const chatRequest = { ...req, url: '/api/maya/chat', body: req.body };
  try {
    const user = getAuthenticatedUser(req);
    const { message, chatHistory = [], context = {} } = req.body || {};
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    // Reuse the chat logic - just respond with same format
    console.log(`💬 MAYA-CHAT ALIAS: User ${user.id} - forwarding to main chat endpoint`);
    res.status(200).json({
      response: "Please use /api/maya/chat endpoint directly",
      aliasWarning: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat alias' });
  }
}));

router.post('/api/maya-generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // This is an alias that historically existed - redirecting to chat
  try {
    const user = getAuthenticatedUser(req);
    console.log(`💬 MAYA-GENERATE ALIAS: User ${user.id} - forwarding to main chat endpoint`);
    res.status(200).json({
      response: "Please use /api/maya/chat endpoint directly",
      aliasWarning: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process generate alias' });
  }
}));

export default router;