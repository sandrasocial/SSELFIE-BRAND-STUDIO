/**
 * Maya Routes - Real Implementation
 * Handles Maya AI chat, personality system, and image generation
 */

import { Router } from 'express';
import { requireStackAuth } from '../middleware/auth';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler';
import { storage } from '../../storage';
import { ModelTrainingService } from '../../model-training-service';
import { PersonalityManager } from '../../agents/personalities/personality-config';
import { MayaOptimizationService } from '../../services/maya-optimization-service';
import { MayaAdaptationEngine } from '../../services/maya-adaptation-engine';
import { ClaudeApiServiceSimple } from '../../services/claude-api-service-simple';

const router = Router();

// Initialize Claude AI service
const claudeService = new ClaudeApiServiceSimple();

// Get Maya chats
router.get('/api/maya-chats', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const chats = await storage.getMayaChats(userId);
  sendSuccess(res, { chats, count: chats.length });
}));

// Get Maya chat by ID
router.get('/api/maya-chats/:chatId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const chat = await storage.getMayaChat(chatId, userId);
  sendSuccess(res, { chat });
}));

// Send message to Maya with full personality system
router.post('/api/maya-chat', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { message, chatHistory, context } = req.body;
  validateRequired({ message }, ['message']);

  try {
    // Get Maya's full personality with adaptation
    const basePersonality = PersonalityManager.getNaturalPrompt('maya');
    let mayaPersonality = basePersonality;

    // Apply user-specific adaptation if available
    try {
      const adaptation = await MayaAdaptationEngine.adaptStylingApproach(
        userId, 
        context || {}, 
        chatHistory || []
      );
      if (adaptation.adaptedPersonality) {
        mayaPersonality = adaptation.adaptedPersonality;
        console.log('🎯 MAYA: Applied personalized adaptation');
      }
    } catch (adaptError) {
      console.log('⚠️ MAYA: Adaptation failed, using base personality');
    }

    // Convert chat history to Claude format
    const claudeHistory = (chatHistory || []).map((entry: any) => ({
      role: entry.user ? 'user' : 'assistant',
      content: entry.user || entry.maya || entry.response || ''
    })).filter((msg: any) => msg.content.trim());

    // Generate response using Claude with full personality system
    const mayaResponse = await claudeService.sendMessage(
      message,
      `maya-chat-${userId}`,
      'maya',
      false,
      claudeHistory,
      mayaPersonality
    );

    // Extract concept cards if Maya suggests photo concepts
    let conceptCards = [];
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
      console.log('No concept cards extracted from response');
    }

    // Save chat to database
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

// Alias for legacy frontend endpoint: /api/maya/chat → use same handler as /api/maya-chat
router.post('/api/maya/chat', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { message, chatHistory, context } = req.body;
  validateRequired({ message }, ['message']);

  try {
    const basePersonality = PersonalityManager.getNaturalPrompt('maya');
    let mayaPersonality = basePersonality;

    try {
      const adaptation = await MayaAdaptationEngine.adaptStylingApproach(
        userId, 
        context || {}, 
        chatHistory || []
      );
      if (adaptation.adaptedPersonality) {
        mayaPersonality = adaptation.adaptedPersonality;
        console.log('🎯 MAYA: Applied personalized adaptation');
      }
    } catch (adaptError) {
      console.log('⚠️ MAYA: Adaptation failed, using base personality');
    }

    const claudeHistory = (chatHistory || []).map((entry: any) => ({
      role: entry.user ? 'user' : 'assistant',
      content: entry.user || entry.maya || entry.response || ''
    })).filter((msg: any) => msg.content.trim());

    const mayaResponse = await claudeService.sendMessage(
      message,
      `maya-chat-${userId}`,
      'maya',
      false,
      claudeHistory,
      mayaPersonality
    );

    let conceptCards = [];
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
      console.log('No concept cards extracted from response');
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
router.post('/api/maya-generate', requireStackAuth, asyncHandler(async (req: any, res) => {
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
    const generationId = await storage.saveAIImage({
      userId,
      prompt: finalPrompt,
      imageUrl: result.images[0] || '',
      style: style || 'maya-styled',
      predictionId: result.predictionId
    });

    sendSuccess(res, {
      jobId: result.predictionId,
      generationId,
      images: result.images,
      prompt: finalPrompt,
      message: 'Maya generation completed successfully'
    });

  } catch (error) {
    console.error('❌ MAYA: Generation failed:', error);
    throw createError.internal('Image generation failed');
  }
}));

// Get Maya chat history
router.get('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const messages = await storage.getMayaChatMessages(chatId, userId);
  sendSuccess(res, { messages, count: messages.length });
}));

// Send message to specific chat
router.post('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { message } = req.body;
  validateRequired({ message }, ['message']);

  const messageId = await storage.saveMayaMessage(chatId, userId, {
    message,
    role: 'user'
  });

  sendSuccess(res, { messageId, message: 'Message sent successfully' }, 'Message sent successfully', 201);
}));

// Update message
router.patch('/api/maya-chats/:chatId/messages/:messageId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { chatId, messageId } = req.params;
  const { content } = req.body;

  await storage.updateMayaMessage(messageId, userId, { content });
  sendSuccess(res, { message: 'Message updated successfully' });
}));

// Create new Maya chat
router.post('/api/maya-chats', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { title, initialMessage } = req.body;

  const chatId = await storage.createMayaChat(userId, {
    title: title || 'New Maya Chat',
    initialMessage
  });

  sendSuccess(res, { chatId, message: 'New Maya chat created' }, 'New Maya chat created', 201);
}));

// Get user's generated images
router.get('/api/maya-images', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const images = await storage.getUserAIImages(userId);
  sendSuccess(res, { images, count: images.length });
}));

// Get Maya's personality info
router.get('/api/maya/personality', requireStackAuth, asyncHandler(async (req: any, res) => {
  const personality = PersonalityManager.getNaturalPrompt('maya');
  sendSuccess(res, { personality });
}));

export default router;