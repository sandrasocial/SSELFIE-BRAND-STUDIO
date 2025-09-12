/**
 * MAYA UNIFIED API - CONSOLIDATED CHAT SYSTEM
 * 
 * Single cohesive router for all Maya interactions.
 * Integrates the full Maya intelligence pipeline directly without dynamic imports.
 * 
 * This replaces the previous façade pattern with direct implementation
 * for better performance and maintainability.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireStackAuth } from '../stack-auth';
import { storage } from '../storage';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { unifiedMayaContextService } from '../services/unified-maya-context-service.js';
import { unifiedMayaIntelligenceService } from '../services/unified-maya-intelligence-service.js';
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';

// Helper function for 80/20 rule concept type determination
const determineConceptType = (title: string, fluxPrompt: string): 'portrait' | 'flatlay' | 'lifestyle' => {
  const text = `${title} ${fluxPrompt}`.toLowerCase();
  
  // Detect flatlay/object concepts (20%)
  if (text.includes('close-up') || text.includes('detail') || text.includes('texture') || 
      text.includes('flatlay') || text.includes('object') || text.includes('prop') ||
      text.includes('mug') || text.includes('book') || text.includes('jewelry') ||
      text.includes('notebook') || text.includes('coffee') || text.includes('product')) {
    return 'flatlay';
  }
  
  // Detect lifestyle concepts
  if (text.includes('walking') || text.includes('sitting') || text.includes('lifestyle') || 
      text.includes('scene') || text.includes('environment') || text.includes('location')) {
    return 'lifestyle';
  }
  
  // Default to portrait (80%)
  return 'portrait';
};

const router = Router();

/**
 * POST /api/maya/chat
 * 
 * Unified Maya chat endpoint with direct implementation
 * Handles all Maya conversations and concept generation for photo creation
 */
router.post('/chat', requireStackAuth, async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🎨 MAYA UNIFIED: Photo Studio chat request received');
    
    const { message, conversationHistory = [], context = 'styling' } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    
    if (!message) {
      return res.status(400).json({
        error: 'Missing required field: message'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Load user context
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Load unified Maya context and intelligence
    const unifiedContext = await unifiedMayaContextService.getUnifiedMayaContext(userId, null);
    const mayaIntelligence = await unifiedMayaIntelligenceService.getUnifiedStyleIntelligence(
      userId, 
      unifiedContext, 
      'chat'
    );

    // Build Maya personality with user context
    const baseMayaPersonality = PersonalityManager.getContextPrompt('maya', context);
    let mayaPersonality = baseMayaPersonality;
    
    if (mayaIntelligence && mayaIntelligence.intelligenceConfidence > 70) {
      mayaPersonality += `\n\n🎯 PERSONALIZATION INSIGHTS:
${mayaIntelligence.stylePredictions.predictedStyles.slice(0, 3).join('\n')}

💡 2025 TREND RECOMMENDATIONS FOR USER:
${mayaIntelligence.trendIntelligence.personalizedTrends.slice(0, 3).join('\n')}`;
    }

    // Format conversation history for Claude
    const fullConversationHistory = conversationHistory.map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Call Claude API directly
    const conversationId = `maya-chat-${userId}`;
    const claudeResponse = await claudeApiServiceSimple.sendMessage(
      message, 
      conversationId, 
      'maya', 
      false,
      fullConversationHistory,
      mayaPersonality
    );

    // Parse concept cards from response using improved parsing logic
    let conceptCards: any[] = [];
    let parsedMessages: any[] = [];
    
    try {
      // New, resilient concept card parser
      function parseMayaResponse(responseText: string) {
        const messages: any[] = [];
        const conceptDelimiter = '---';

        const firstConceptMarkerIndex = responseText.search(/🎯|✨|🌟|📸/);

        if (firstConceptMarkerIndex === -1) {
          // No concepts found, return the entire response as a single text message
          return [{ sender: 'ai', type: 'text', content: responseText.trim() }];
        }

        // 1. Isolate and add the introductory text
        const introText = responseText.substring(0, firstConceptMarkerIndex).trim();
        if (introText) {
          messages.push({ sender: 'ai', type: 'text', content: introText });
        }

        // 2. Isolate the text containing all concept blocks
        const conceptsText = responseText.substring(firstConceptMarkerIndex);
        const conceptBlocks = conceptsText.split(conceptDelimiter).map(block => block.trim()).filter(Boolean);

        for (const block of conceptBlocks) {
          // 3. Use a precise regex to capture title, description, and prompt
          const conceptRegex = /(?:🎯|✨|🌟|📸)\s*\*\*(.*?)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*([\s\S]*)/;
          const match = block.match(conceptRegex);

          if (match) {
            const title = match[1].trim();
            const description = match[2].trim();
            const fluxPrompt = match[3].trim();

            messages.push({
              sender: 'ai',
              type: 'concept',
              content: {
                title: title,
                category: 'AI Concept',
                description: description, // Correct description
                fluxPrompt: fluxPrompt, // Correct prompt
              },
            });
          }
        }

        return messages;
      }

      // Parse the Claude response using the new parser
      parsedMessages = parseMayaResponse(claudeResponse);
      // Extract concept cards from parsed messages
      conceptCards = parsedMessages
        .filter(msg => msg.type === 'concept')
        .map((msg, index) => {
          const concept = msg.content;
          const emoji = concept.title.match(/^([🎯✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖])/)?.[1] || '🎯';
          const title = concept.title.replace(/^[🎯✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]\s*/, '');
          // Determine concept type for 80/20 rule implementation
          const conceptType = determineConceptType(title, concept.fluxPrompt);
          return {
            id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${emoji} ${title}`,
            description: concept.description || `Creative concept: ${title}`,
            emoji: emoji,
            creativeLook: title,
            creativeLookDescription: concept.description || `${title} styling concept`,
            fluxPrompt: concept.fluxPrompt,
            type: conceptType // portrait | flatlay | lifestyle for 80/20 rule
          };
        });
      if (conceptCards.length > 0) {
        console.log(`✅ CONCEPT CARDS: Successfully parsed ${conceptCards.length} Creative Lookbook concepts`);
      } else {
        console.log('⚠️ CONCEPT CARDS: No Creative Lookbook concepts found in Maya response');
      }
    } catch (parseError) {
      console.error('❌ CONCEPT PARSING ERROR:', parseError);
      console.log('📝 CONCEPT PARSING: Falling back to no concept cards');
    }


    // Log performance
    const duration = Date.now() - startTime;
    console.log('MAYA_API_PERFORMANCE', {
      endpoint: '/chat',
      duration,
      success: true,
      error: null,
      timestamp: Date.now()
    });

    console.log('✅ MAYA UNIFIED: Photo Studio response generated');
    
    // Use parsed response or fall back to original claudeResponse
    const responseText = parsedMessages.length > 0 && parsedMessages.some(msg => msg.type === 'text') 
      ? parsedMessages.filter(msg => msg.type === 'text').map(msg => msg.content).join('\n')
      : claudeResponse;
    
    res.json({
      response: responseText,
      reply: responseText,
      conceptCards: conceptCards,
      status: 'success'
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.log('MAYA_API_PERFORMANCE', {
      endpoint: '/chat',
      duration,
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
    
    console.error('❌ MAYA UNIFIED: Photo Studio error:', error);
    res.status(500).json({
      error: 'Maya encountered an issue with your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/maya/draft-storyboard
 * 
 * Story Studio storyboard creation (deprecated endpoint)
 * Note: This functionality is handled by the dedicated video service
 */
router.post('/draft-storyboard', requireStackAuth, async (req: Request, res: Response) => {
  try {
    console.log('🎬 MAYA UNIFIED: Story Studio storyboard request received');
    
    const { concept, userId, preferences } = req.body;
    
    if (!concept || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: concept and userId'
      });
    }

    // Redirect to dedicated video service endpoint
    console.log('📍 MAYA UNIFIED: Redirecting to video service for storyboard creation');
    
    const response = {
      redirect: '/api/video/draft-storyboard',
      message: 'Storyboard creation is handled by the dedicated video service',
      concept,
      userId,
      preferences: preferences || {},
      status: 'redirect'
    };

    console.log('✅ MAYA UNIFIED: Story Studio redirect response generated');
    res.json(response);

  } catch (error) {
    console.error('❌ MAYA UNIFIED: Story Studio error:', error);
    res.status(500).json({
      error: 'Maya encountered an issue with your storyboard request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/maya/generate
 * 
 * Generate images from concept cards created by Maya
 * Validates user has trained model and triggers image generation
 */
router.post('/generate', requireStackAuth, async (req: Request, res: Response) => {
  try {
    console.log('🎨 MAYA UNIFIED: Image generation request received');
    const { prompt, conceptData } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    if (!prompt) return res.status(400).json({ error: 'Missing required field: prompt' });
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed' || !userModel.replicateVersionId) {
      return res.status(400).json({ success: false, message: "Your AI model isn't ready yet. Please complete training first.", error: "USER_MODEL_NOT_TRAINED" });
    }
    // Import and call ModelTrainingService directly
    const { ModelTrainingService } = await import('../model-training-service');
    // This should trigger the Replicate/Flux job and return a predictionId
    const result = await ModelTrainingService.generateUserImages(userId, prompt, 4);
    // Immediately return the predictionId for polling
    res.json({ success: true, predictionId: result.predictionId });
  } catch (error) {
    console.error('❌ MAYA UNIFIED: Image generation error:', error);
    if (error.message === 'USER_MODEL_NOT_TRAINED: User must train their AI model before generating images. Individual models required.') {
      return res.status(400).json({ success: false, message: "Your AI model isn't ready yet. Please complete training first.", error: "USER_MODEL_NOT_TRAINED" });
    }
    res.status(500).json({ error: 'Maya encountered an issue with your image generation request', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// GET /api/maya/check-generation/:predictionId
router.get('/check-generation/:predictionId', async (req: Request, res: Response) => {
  const { predictionId } = req.params;
  try {
    // Import Replicate/Flux API logic (assume ModelTrainingService for now)
    const { ModelTrainingService } = await import('../model-training-service');
    // This should check the status and return image URLs if done
    const statusResult = await ModelTrainingService.checkGenerationStatus(predictionId);
    if (statusResult.status === 'succeeded') {
      // statusResult.imageUrls should be an array of permanent URLs
      return res.json({ status: 'completed', imageUrls: statusResult.imageUrls });
    } else if (statusResult.status === 'failed' || statusResult.status === 'canceled') {
      return res.json({ status: 'failed' });
    } else {
      return res.json({ status: 'processing' });
    }
  } catch (error) {
    console.error('❌ Error checking generation status:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
});

/**
 * Health check endpoint for Maya Unified API
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    unified: 'active',
    timestamp: new Date().toISOString(),
    message: 'Maya Unified API is operational'
  });
});

export default router;