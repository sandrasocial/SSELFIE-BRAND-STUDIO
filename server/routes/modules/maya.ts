/**
 * Maya Routes - Real Implementation
 * Handles Maya AI chat, personality system, and image generation
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
import { ModelTrainingService } from '../../model-training-service.js';
import { PersonalityManager } from '../../agents/personalities/personality-config.js';
import { ClaudeApiServiceSimple } from '../../services/claude-api-service-simple.js';
import { AuthenticatedRequest } from '../../../shared/types/ai-generation.js';
import { SuccessResponse } from '../../../shared/types/ai-generation.js';
import { InsertAiImage } from '../../../shared/types-override.js';
import { unifiedMayaIntelligenceService } from '../../services/unified-maya-intelligence-service.js';

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary: string;
  chatCategory: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MayaMessage {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  conceptCards?: MayaConceptCard[];
  createdAt: Date;
}

interface MayaConceptCard {
  title: string;
  prompt: string;
}

interface MayaChatRequest {
  message: string;
  chatHistory?: {
    user?: string;
    maya?: string;
    response?: string;
  }[];
  context?: Record<string, unknown>;
}

interface MayaGenerateRequest {
  prompt: string;
  style?: string;
  count?: number;
  conceptName?: string;
  seed?: string;
}

interface MayaCreateChatRequest {
  title?: string;
  initialMessage?: string;
}

interface MayaUpdateMessageRequest {
  content: string;
}

interface MayaVideoPromptRequest {
  imageUrl: string;
}

interface ClaudeHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

const router = Router();

// Initialize Claude AI service
const claudeService = new ClaudeApiServiceSimple();

// Get Maya chats
router.get('/api/maya-chats', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const chats = await storage.getMayaChats(userId) as MayaChat[];
  
  const responseData: SuccessResponse<{
    chats: MayaChat[];
    count: number;
  }> = {
    data: {
      chats,
      count: chats.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Get Maya chat by ID
router.get('/api/maya-chats/:chatId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const chat = await storage.getMayaChat(chatId, userId) as MayaChat;
  
  if (!chat) {
    throw createError.notFound('Chat not found');
  }
  
  const responseData: SuccessResponse<{ chat: MayaChat }> = {
    data: { chat }
  };
  
  sendSuccess(res, responseData);
}));

// Send message to Maya with full personality system
router.post('/api/maya-chat', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: MayaChatRequest }, res: Response) => {
  const userId = req.user.id;
  const { message, chatHistory = [], context = {} } = req.body;
  validateRequired({ message }, ['message']);

  try {
    // Get Maya's full personality with adaptation
    const basePersonality = PersonalityManager.getNaturalPrompt('maya');
    let mayaPersonality = basePersonality;

    // Re-enabling context integration using the Unified Intelligence Service (Phase 3 Fix)
    try {
      
      // Retrieve the consolidated user intelligence
      const unifiedIntelligence = await unifiedMayaIntelligenceService.getUnifiedStyleIntelligence(
        userId, 
        context, 
        'chat' 
      );
      
      // Augment the base personality prompt by embedding the latest contextual data 
      // This is necessary for the Claude model to use non-generic data (like location/topic).
      const contextualData = `USER STYLE INTELLIGENCE (DO NOT mention this block directly to the user): 
User Profile: ${JSON.stringify(unifiedIntelligence.userProfile, null, 2)}
Style Predictions: ${unifiedIntelligence.stylePredictions.predictedStyles.join(', ')}
Trend Intelligence: ${unifiedIntelligence.trendIntelligence.currentTrends.join(', ')}
Brand Alignment: ${unifiedIntelligence.brandAlignment.brandVoice} voice, ${unifiedIntelligence.brandAlignment.visualDirection.join(', ')} visual direction.
The user's current message context is: ${JSON.stringify(context)}
`;
      
      // Inject the context to augment the base personality
      mayaPersonality = `${basePersonality}\n\n[CONTEXTUAL STYLING DATA]:\n${contextualData}`;
      

    } catch (adaptError) {
      console.error('❌ MAYA: Unified Intelligence augmentation failed, falling back to base personality:', adaptError);
      // mayaPersonality remains basePersonality
    }

    // Convert chat history to Claude format
    const claudeHistory: ClaudeHistoryEntry[] = chatHistory.map((entry: { user?: string; maya?: string; response?: string }) => ({
      role: entry.user ? 'user' : 'assistant',
      content: entry.user || entry.maya || entry.response || ''
    })).filter((msg: { role: string; content: string }) => msg.content.trim());

    // Generate response using Claude with full personality system
    const mayaResponseObj = await claudeService.sendMessage(
      message,
      claudeHistory,
      mayaPersonality
    );
    const mayaResponse = mayaResponseObj.content;

    // Extract concept cards if Maya suggests photo concepts
    const conceptCards: MayaConceptCard[] = [];
    try {
      const conceptRegex = /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi;
      let match;
      while ((match = conceptRegex.exec(mayaResponse)) !== null) {
        conceptCards.push({
          title: match[1].trim(),
          prompt: match[2].trim()
        });
      }
    } catch (parseError) {
    }

    // Save chat to database
    const chatId = await storage.saveMayaChat(userId, {
      message,
      response: mayaResponse,
      conceptCards,
      context
    });

    const responseData: SuccessResponse<{
      response: string;
      conceptCards: MayaConceptCard[];
      chatId: string;
      agentName: string;
      agentType: string;
      timestamp: string;
    }> = {
      data: {
        response: mayaResponse,
        conceptCards,
        chatId,
        agentName: 'Maya - AI Creative Director',
        agentType: 'member',
        timestamp: new Date().toISOString()
      }
    };

    sendSuccess(res, responseData);

  } catch (error) {
    console.error('❌ MAYA: Chat failed:', error);
    throw createError.internal('Failed to process chat message');
  }
}));

// Alias for legacy frontend endpoint: /api/maya/chat → use same handler as /api/maya-chat
router.post('/api/maya/chat', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { message, chatHistory, context } = req.body;
  validateRequired({ message }, ['message']);

  try {
    const basePersonality = PersonalityManager.getNaturalPrompt('maya');
    let mayaPersonality = basePersonality;

    // Re-enabling context integration using the Unified Intelligence Service (Phase 3 Fix)
    try {
      
      // Retrieve the consolidated user intelligence
      const unifiedIntelligence = await unifiedMayaIntelligenceService.getUnifiedStyleIntelligence(
        userId, 
        context, 
        'chat' 
      );
      
      // Augment the base personality prompt by embedding the latest contextual data 
      // This is necessary for the Claude model to use non-generic data (like location/topic).
      const contextualData = `USER STYLE INTELLIGENCE (DO NOT mention this block directly to the user): 
User Profile: ${JSON.stringify(unifiedIntelligence.userProfile, null, 2)}
Style Predictions: ${unifiedIntelligence.stylePredictions.predictedStyles.join(', ')}
Trend Intelligence: ${unifiedIntelligence.trendIntelligence.currentTrends.join(', ')}
Brand Alignment: ${unifiedIntelligence.brandAlignment.brandVoice} voice, ${unifiedIntelligence.brandAlignment.visualDirection.join(', ')} visual direction.
The user's current message context is: ${JSON.stringify(context)}
`;
      
      // Inject the context to augment the base personality
      mayaPersonality = `${basePersonality}\n\n[CONTEXTUAL STYLING DATA]:\n${contextualData}`;
      

    } catch (adaptError) {
      console.error('❌ MAYA: Unified Intelligence augmentation failed, falling back to base personality:', adaptError);
      // mayaPersonality remains basePersonality
    }

    const claudeHistory = (chatHistory || []).map((entry: any) => ({
      role: entry.user ? 'user' : 'assistant',
      content: entry.user || entry.maya || entry.response || ''
    })).filter((msg: any) => msg.content.trim());

    const mayaResponseObj = await claudeService.sendMessage(
      message,
      claudeHistory,
      mayaPersonality
    );
    const mayaResponse = mayaResponseObj.content;

    const conceptCards = [];
    try {
      const conceptRegex = /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi;
      let match;
      while ((match = conceptRegex.exec(mayaResponse)) !== null) {
        conceptCards.push({
          title: match[1].trim(),
          prompt: match[2].trim()
        });
      }
    } catch (parseError) {
    }

    const chatId = await storage.saveMayaChat(userId, {
      message,
      response: mayaResponse,
      conceptCards,
      context: context || {}
    });

    sendSuccess(res, {
      response: mayaResponse,
      conceptCards,
      chatId,
      agentName: 'Maya - AI Creative Director',
      agentType: 'member',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ MAYA: Chat failed:', error);
    throw createError.internal('Failed to process chat message');
  }
}));

// Generate images with Maya's full pipeline
router.post('/api/maya-generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: MayaGenerateRequest }, res: Response) => {
  const userId = req.user.id;
  const { prompt, style, count, conceptName, seed } = req.body;
  validateRequired({ prompt }, ['prompt']);

  try {
    // Get user's model and LoRA weights
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw createError.validation('User model not ready. Please complete training first.');
    }

    // Get user's LoRA weights
    const loraWeights = await storage.getUserActiveLoraWeight(userId);
    if (!loraWeights) {
      throw createError.validation('User LoRA weights not available. Please retrain your model.');
    }

    // Use Maya's optimization service for prompt enhancement only
    // Maya does NOT change parameters - only enhances prompts
    let finalPrompt = prompt;
    if (conceptName) {
      // For concept-based generation, use the concept name as the base
      finalPrompt = `${conceptName}: ${prompt}`;
    } else {
      // For custom prompts, enhance with Maya's intelligence
      finalPrompt = `Professional photography, ${userModel.triggerWord || 'sandra'}, ${prompt}`;
    }

    // Generate images using ModelTrainingService with standard parameters
    // Maya does not modify generation parameters - only prompt enhancement
    const result = await ModelTrainingService.generateUserImages(
      userId,
      finalPrompt,
      count || 2,
      { seed, categoryContext: style }
    );

    // Save generation to database
    const imageData: InsertAiImage = {
      userId,
      prompt: finalPrompt,
      imageUrl: result.images[0] || '',
      style: style || 'maya-styled',
      predictionId: result.predictionId
    };
    const generationId = await storage.saveAIImage(imageData);

    const responseData: SuccessResponse<{
      jobId: string;
      generationId: string;
      images: string[];
      prompt: string;
    }> = {
      data: {
        jobId: result.predictionId || 'no-prediction-id',
        generationId: generationId.toString(),
        images: result.images,
        prompt: finalPrompt
      },
      message: 'Maya generation completed successfully'
    };

    sendSuccess(res, responseData);

  } catch (error) {
    console.error('❌ MAYA: Generation failed:', error);
    throw createError.internal('Image generation failed');
  }
}));

// Get Maya chat history
router.get('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const messages = await storage.getMayaChatMessages(chatId, userId) as MayaMessage[];
  
  const responseData: SuccessResponse<{
    messages: MayaMessage[];
    count: number;
  }> = {
    data: {
      messages,
      count: messages.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Send message to specific chat
router.post('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: { message: string } }, res: Response) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { message } = req.body;
  validateRequired({ message }, ['message']);

  const messageId = await storage.saveMayaMessage(chatId, userId, {
    message,
    role: 'user'
  });

  const responseData: SuccessResponse<{ messageId: string }> = {
    data: { messageId },
    message: 'Message sent successfully'
  };
  
  sendSuccess(res, responseData, 'Message sent successfully', 201);
}));

// Update message
router.patch('/api/maya-chats/:chatId/messages/:messageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: MayaUpdateMessageRequest }, res: Response) => {
  const userId = req.user.id;
  const { chatId, messageId } = req.params;
  const { content } = req.body;
  validateRequired({ content }, ['content']);

  await storage.updateMayaMessage(messageId, userId, { content });
  
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Message updated successfully'
  };
  
  sendSuccess(res, responseData);
}));

// Create new Maya chat
router.post('/api/maya-chats', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: MayaCreateChatRequest }, res: Response) => {
  const userId = req.user.id;
  const { title, initialMessage } = req.body;

  const chatId = await storage.createMayaChat(userId, {
    userId,
    chatTitle: title || 'New Maya Chat',
    initialMessage
  });

  const responseData: SuccessResponse<{ chatId: string }> = {
    data: { chatId },
    message: 'New Maya chat created'
  };
  
  sendSuccess(res, responseData, 'New Maya chat created', 201);
}));

// Get user's generated images
router.get('/api/maya-images', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const images = await storage.getUserAIImages(userId);
  
  const responseData: SuccessResponse<{
    images: unknown[];
    count: number;
  }> = {
    data: {
      images,
      count: images.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Get Maya's personality info
router.get('/api/maya/personality', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const personality = PersonalityManager.getNaturalPrompt('maya');
  
  const responseData: SuccessResponse<{ personality: string }> = {
    data: { personality }
  };
  
  sendSuccess(res, responseData);
}));

// Maya Video Prompt Endpoint - Migrated from disabled file
router.post('/api/maya/get-video-prompt', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: MayaVideoPromptRequest }, res: Response) => {
  const userId = req.user.id;
  const { imageUrl } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  try {
    
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

    // Use Claude API service for image analysis
    const claudeService = new ClaudeApiServiceSimple();
    const videoConversationId = `video_direction_${userId}_${Date.now()}`;
    
    // Generate video direction prompt using regular Claude service
    // Note: Image processing capability would need to be added to ClaudeApiServiceSimple for full functionality
    const mayaVideoResponseObj = await claudeService.sendMessage(
      `${videoDirectorPrompt}\n\nImage URL for context: ${imageUrl}`,
      [],
      'You are Maya, a professional AI creative director helping with video generation.'
    );
    const mayaVideoPrompt = mayaVideoResponseObj.content;


    const responseData: SuccessResponse<{
      videoPrompt: string;
      director: string;
      timestamp: string;
    }> = {
      data: {
        videoPrompt: mayaVideoPrompt,
        director: 'Maya - AI Creative Director',
        timestamp: new Date().toISOString()
      }
    };

    sendSuccess(res, responseData);

  } catch (error) {
    console.error('❌ MAYA VIDEO DIRECTION ERROR:', error);
    throw createError.internal('Failed to generate video direction');
  }
}));

// Heart image from Maya chat preview to gallery
router.post('/api/maya/heart-image', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: { imageUrl: string; prompt?: string; category?: string } }, res: Response) => {
  const userId = req.user.id;
  const { imageUrl, prompt, category } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  try {
    
    // Import the MayaChatPreviewService
    const { MayaChatPreviewService } = await import('../../maya-chat-preview-service.js');
    
    // Heart the image to gallery
    const galleryImage = await MayaChatPreviewService.heartImageToGallery(
      userId,
      imageUrl,
      prompt || 'Hearted from Maya chat',
      category || 'Maya AI'
    );

    const responseData: SuccessResponse<{
      galleryImage: typeof galleryImage;
      message: string;
    }> = {
      data: {
        galleryImage,
        message: 'Image saved to your gallery!'
      }
    };

    sendSuccess(res, responseData);

  } catch (error) {
    console.error('❌ MAYA HEART ERROR:', error);
    throw createError.internal('Failed to save image to gallery');
  }
}));

export default router;