/**
 * PHASE 2: UNIFIED MAYA ROUTE - Single Intelligent System
 * Uses PersonalityManager.getNaturalPrompt('maya') correctly
 * Context enhancement instead of different personalities
 * Single Claude call system handling all interactions
 * 
 * 🚨 ZERO TOLERANCE ANTI-HARDCODE POLICY:
 * - Never implement hardcoded if/else prompt logic  
 * - Never bypass Maya's Claude API intelligence
 * - Never use template strings for image generation
 * - All prompts MUST flow through PersonalityManager.getNaturalPrompt('maya')
 * - Maya's AI drives everything - no shortcuts allowed
 * 
 * ✅ ROUTE-LEVEL HARDCODE ELIMINATION COMPLETE (Phase 1 of 5):
 * - REMOVED: hardcoded "professional executive portrait, charcoal grey blazer" examples
 * - REMOVED: rigid "CRITICAL INSTRUCTIONS" and "EXACT format" requirements  
 * - REMOVED: templated constraints that override Maya's natural conversation flow
 * - REPLACED: with natural conversation guidance that preserves Maya's expertise
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality';
import { ModelTrainingService } from '../model-training-service';
import { adminContextDetection, getConversationId, type AdminContextRequest } from '../middleware/admin-context';
import { trackMayaActivity } from '../services/maya-usage-isolation';

const router = Router();

// PHASE 7: Environment Variables Validation
if (!process.env.REPLICATE_API_TOKEN) {
  console.error('🚨 CRITICAL: REPLICATE_API_TOKEN not configured - Image generation will fail');
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('🚨 CRITICAL: ANTHROPIC_API_KEY not configured - Maya chat will fail');
}

// PHASE 7: Performance Monitoring Utilities
function logMayaPerformance(event: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`MAYA_PERFORMANCE_${event}`, {
    ...data,
    timestamp
  });
}

function logMayaGeneration(event: 'START' | 'COMPLETE' | 'FAILED', data: any) {
  const timestamp = Date.now();
  console.log(`MAYA_GENERATION_${event}`, {
    ...data,
    timestamp
  });
}

function logMayaAPI(endpoint: string, startTime: number, success: boolean, error?: any) {
  const duration = Date.now() - startTime;
  console.log('MAYA_API_PERFORMANCE', {
    endpoint,
    duration,
    success,
    error: error?.message || null,
    timestamp: Date.now()
  });
}

function logUserAbandonment(event: 'ONBOARDING_ABANDON' | 'CHAT_ABANDON' | 'GENERATION_ABANDON', data: any) {
  console.log(`MAYA_${event}`, {
    ...data,
    timestamp: Date.now()
  });
}

// UNIFIED MAYA ENDPOINT - Handles all Maya interactions with admin/member distinction
router.post('/chat', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  const startTime = Date.now(); // PHASE 7: Track API performance
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      logMayaAPI('/chat', startTime, false, new Error('Authentication required'));
      return res.status(401).json({ 
        error: "Hey beautiful! I need to make sure you're logged in before we can start creating amazing photos together. Let's get you signed in so I can help you see your future self!" 
      });
    }

    const { message, context = 'regular', chatId, conversationHistory = [] } = req.body;

    if (!message) {
      logMayaAPI('/chat', startTime, false, new Error('Message required'));
      return res.status(400).json({ error: 'Message required' });
    }

    // Admin/Member context awareness
    const userType = req.userType || 'member';
    const conversationId = getConversationId(userId, req.isAdmin || false, chatId);
    
    // PHASE 7: Log chat interaction
    logMayaPerformance('CHAT_START', {
      userId,
      userType,
      context,
      messageLength: message.length,
      isAdmin: req.isAdmin || false
    });
    
    console.log(`🎨 MAYA ${userType.toUpperCase()}: Processing ${context} message for ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);

    // CRITICAL FIX: Use frontend conversation history or load from database
    let fullConversationHistory: any[] = conversationHistory || [];
    
    // If no frontend history but we have a chatId, load from database as backup
    if (fullConversationHistory.length === 0 && chatId) {
      try {
        const chatMessages = await storage.getMayaChatMessages(Number(chatId));
        // Transform to Claude API format, keeping last 10 messages for context
        fullConversationHistory = chatMessages
          .slice(-10)
          .map(msg => ({
            role: msg.role === 'assistant' || msg.role === 'maya' ? 'assistant' : 'user',
            content: msg.content
          }));
        console.log(`📖 MAYA CONTEXT: Loaded ${fullConversationHistory.length} previous messages from database`);
      } catch (error) {
        console.log('No previous conversation history found, starting fresh');
      }
    } else if (fullConversationHistory.length > 0) {
      console.log(`📖 MAYA CONTEXT: Using ${fullConversationHistory.length} messages from frontend`);
    }

    // Get unified user context
    const userContext = await getUnifiedUserContext(userId);
    
    // Check generation capability
    const generationInfo = await checkGenerationCapability(userId);
    
    // PHASE 5: Load personal brand context for personalized responses
    let personalBrandContext = '';
    try {
      // Load user's personal brand context
      const { MayaStorageExtensions } = await import('../storage-maya-extensions');
      const mayaUserContext = await MayaStorageExtensions.getMayaUserContext(userId);
      
      if (mayaUserContext?.personalBrand) {
        // Enhance Maya's prompt with personal brand data
        personalBrandContext = `

PERSONAL BRAND CONTEXT FOR THIS USER:
- Transformation Story: ${mayaUserContext.personalBrand.transformationStory || 'Not provided'}
- Current Situation: ${mayaUserContext.personalBrand.currentSituation || 'Not provided'}
- Future Vision: ${mayaUserContext.personalBrand.futureVision || 'Not provided'}
- Business Goals: ${mayaUserContext.personalBrand.businessGoals || 'Not provided'}
- Onboarding Completed: ${mayaUserContext.personalBrand.isCompleted ? 'Yes' : 'No'}

Use this context to provide personalized styling advice that aligns with their transformation journey.`;
        
        console.log(`🎯 MAYA MEMORY: Loaded personal brand context for user ${userId}`);
      }
    } catch (error) {
      console.log('Personal brand context not available, proceeding with basic Maya');
    }
    
    // Build Maya prompt with admin/member context awareness
    const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
    const enhancedPrompt = enhancePromptForContext(
      baseMayaPersonality, 
      context, 
      userContext, 
      generationInfo,
      req.isAdmin || false,
      userType
    ) + personalBrandContext;
    
    // Single Claude API call with Maya's complete intelligence
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: enhancedPrompt,
        messages: [
          ...fullConversationHistory,
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
    let mayaResponse = data.content[0].text;
    
    // Process Maya's unified response
    const processedResponse = await processMayaResponse(
      mayaResponse, 
      context, 
      userId, 
      userContext,
      generationInfo
    );
    
    // Admin/Member aware conversation storage
    const savedChatId = await saveUnifiedConversation(
      userId, 
      message, 
      processedResponse, 
      chatId, 
      context,
      userType,
      conversationId
    );

    // Track Maya activity with admin/member separation
    trackMayaActivity(userId, userType as 'admin' | 'member', conversationId, 'chat', {
      context,
      chatId: savedChatId,
      hasGeneration: !!processedResponse.generatedPrompt
    });
    
    // PHASE 7: Log successful chat completion
    logMayaPerformance('CHAT_COMPLETE', {
      userId,
      userType,
      context,
      responseLength: typeof processedResponse.message === 'string' ? processedResponse.message.length : 0,
      hasQuickButtons: !!processedResponse.quickButtons?.length,
      canGenerate: processedResponse.canGenerate || false,
      hasGeneration: !!processedResponse.generatedPrompt
    });
    
    logMayaAPI('/chat', startTime, true);
    
    res.json({
      success: true,
      content: processedResponse.message || processedResponse,  // CRITICAL: Frontend expects 'content' field
      message: processedResponse.message || processedResponse,
      mode: context,
      canGenerate: processedResponse.canGenerate || false,
      generatedPrompt: processedResponse.generatedPrompt,
      onboardingProgress: processedResponse.onboardingProgress,
      chatId: savedChatId,
      quickButtons: processedResponse.quickButtons,
      conceptCards: processedResponse.conceptCards || [], // CRITICAL: Include concept cards for frontend
      chatCategory: processedResponse.chatCategory
    });

  } catch (error) {
    console.error('Unified Maya error:', error);
    
    // PHASE 7: Log chat error
    logMayaPerformance('CHAT_ERROR', {
      userId: (req.user as any)?.claims?.sub || 'unknown',
      userType: req.userType || 'member',
      context: req.body?.context || 'regular',
      error: error.message
    });
    
    logMayaAPI('/chat', startTime, false, error);
    
    // CRITICAL: Always return proper JSON with Maya's warm personality
    return res.status(200).json({ 
      success: false,
      content: "Oh! I had a little hiccup there, but I'm still here to help you create amazing photos! Tell me what kind of shots you're dreaming of and I'll guide you through it step by step. What's your vision?",
      message: "Oh! I had a little hiccup there, but I'm still here to help you create amazing photos! Tell me what kind of shots you're dreaming of and I'll guide you through it step by step. What's your vision?",
      canGenerate: false,
      quickButtons: ["Lifestyle photography", "Creative portraits", "Personal branding photos", "Tell me what happened"],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Image generation through unified system
router.post('/generate', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  const startTime = Date.now(); // PHASE 7: Track generation performance
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      logMayaAPI('/generate', startTime, false, new Error('Authentication required'));
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userType = req.userType || 'member';
    const { prompt, chatId, preset, seed, count, conceptName } = req.body || {};
    
    // PHASE 7: Log generation start
    logMayaGeneration('START', {
      userId,
      userType,
      concept: conceptName || 'custom',
      prompt: prompt?.substring(0, 100) + '...', // Log truncated prompt for privacy
      preset: preset || 'Identity',
      count: count || 2
    });
    
    console.log(`🖼️ MAYA ${userType.toUpperCase()}: Image generation request from ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);
    
    // Track generation activity with admin/member separation
    trackMayaActivity(userId, userType as 'admin' | 'member', `maya_${userType}_${userId}`, 'generation', {
      conceptName: req.body.conceptName || 'custom_generation',
      timestamp: new Date()
    });
    
    if (!prompt) {
      logMayaAPI('/generate', startTime, false, new Error('Prompt required'));
      return res.status(400).json({ 
        error: "I'm so excited to create something amazing for you! Just tell me what kind of photos you're dreaming of - business vibes? Lifestyle moments? Let's bring your vision to life!" 
      });
    }
    
    const safeCount = Math.min(Math.max(parseInt(count ?? 2, 10) || 2, 1), 6);
    
    // Get user context for trigger word
    const generationInfo = await checkGenerationCapability(userId);
    
    // Check if user can generate - provide Maya's friendly guidance if not
    if (!generationInfo.canGenerate || !generationInfo.userModel || !generationInfo.triggerWord) {
      return res.status(200).json({
        success: false,
        error: "I'd love to create photos for you, but it looks like your AI model isn't quite ready yet! Once you complete the training process with your selfies, I'll be able to create amazing personalized photos. Should we check on your training status?",
        message: "I'd love to create photos for you, but it looks like your AI model isn't quite ready yet! Once you complete the training process with your selfies, I'll be able to create amazing personalized photos. Should we check on your training status?",
        quickButtons: ["Check training status", "Learn about training", "Upload more photos", "Start training process"],
        canGenerate: false
      });
    }
    
    let finalPrompt = prompt.trim();
    
    // CRITICAL FIX: Use embedded prompts from concept cards OR Maya's AI for custom prompts
    // Concept cards have embedded prompts ready, custom prompts get Maya's full Claude API styling expertise
    if (conceptName && conceptName.length > 0) {
      // Check if concept has embedded prompt first (from concept card generation)
      const conceptId = req.body.conceptId;
      let embeddedPrompt = '';
      
      if (conceptId) {
        try {
          // Try to retrieve embedded prompt from recent Maya chat
          const recentChats = await storage.getMayaChats(userId);
          for (const chat of recentChats.slice(0, 5)) {
            const messages = await storage.getMayaChatMessages(chat.id);
            for (const message of messages) {
              // Check if message content contains conceptCards data
              if (message.content && typeof message.content === 'string') {
                try {
                  const contentData = JSON.parse(message.content);
                  if (contentData.conceptCards) {
                    const conceptCard = contentData.conceptCards.find((c: any) => c.id === conceptId || c.title === conceptName);
                    if (conceptCard && conceptCard.fullPrompt) {
                      embeddedPrompt = conceptCard.fullPrompt;
                      console.log(`🎯 MAYA EMBEDDED PROMPT FOUND: Using pre-generated ${embeddedPrompt.length} character prompt for "${conceptName}"`);
                      break;
                    }
                  }
                } catch (parseError) {
                  // Continue if content is not JSON - this is normal for regular messages
                  continue;
                }
              }
            }
            if (embeddedPrompt) break;
          }
        } catch (error) {
          console.log(`⚠️ MAYA EMBEDDED PROMPT LOOKUP FAILED:`, error);
        }
      }
      
      // PHASE 1 FIX: Always use Maya's original context for consistency
      let originalContext = '';
      
      // Extract original context from concept cards
      if (conceptId) {
        try {
          const recentChats = await storage.getMayaChats(userId);
          for (const chat of recentChats.slice(0, 5)) {
            const messages = await storage.getMayaChatMessages(chat.id);
            for (const message of messages) {
              if (message.content && typeof message.content === 'string') {
                try {
                  const contentData = JSON.parse(message.content);
                  if (contentData.conceptCards) {
                    const conceptCard = contentData.conceptCards.find((c: any) => c.id === conceptId || c.title === conceptName);
                    if (conceptCard && conceptCard.originalContext) {
                      originalContext = conceptCard.originalContext;
                      console.log(`🎯 MAYA ORIGINAL CONTEXT FOUND: Using Maya's original styling context for "${conceptName}"`);
                      break;
                    }
                  }
                } catch (parseError) {
                  continue;
                }
              }
            }
            if (originalContext) break;
          }
        } catch (error) {
          console.log(`⚠️ MAYA ORIGINAL CONTEXT LOOKUP FAILED:`, error);
        }
      }

      if (embeddedPrompt && embeddedPrompt.length > 50) {
        // Use Maya's pre-generated detailed prompt from concept creation
        finalPrompt = embeddedPrompt;
        console.log(`✅ MAYA UNIFIED: Using embedded prompt (${finalPrompt.length} chars) with original context preserved`);
      } else {
        // Generate new prompt using Maya's unified intelligence WITH original context
        console.log(`🎯 MAYA UNIFIED: Generating new prompt for "${conceptName}" using original Maya context`);
        const userConcept = conceptName.replace(/[✨💫💗🔥🌟💎🌅🏢💼🌊👑💃📸🎬]/g, '').trim();
        finalPrompt = await createDetailedPromptFromConcept(userConcept, generationInfo.triggerWord, userId, originalContext);
        console.log(`✅ MAYA UNIFIED: Generated ${finalPrompt.length} character prompt using original Maya context`);
      }
    } else {
      // All prompts get Maya's complete styling intelligence
      console.log(`🎯 MAYA UNIFIED: Enhancing custom prompt "${prompt}" with styling expertise`);
      finalPrompt = await createDetailedPromptFromConcept(prompt, generationInfo.triggerWord, userId);
      console.log(`✅ MAYA UNIFIED: Enhanced prompt to ${finalPrompt.length} characters with professional styling`);
    }
    
    // CRITICAL: Final validation to ensure trigger word is at the beginning
    if (!finalPrompt.startsWith(generationInfo.triggerWord)) {
      console.log(`🚨 TRIGGER WORD FIX: Moving "${generationInfo.triggerWord}" to beginning of prompt`);
      // Remove trigger word if it exists elsewhere and add it to the beginning
      const cleanPrompt = finalPrompt.replace(new RegExp(generationInfo.triggerWord, 'gi'), '').replace(/^[\s,]+/, '').trim();
      finalPrompt = `${generationInfo.triggerWord} ${cleanPrompt}`;
    }
    
    console.log(`🎯 MAYA UNIFIED: Final extracted prompt: ${finalPrompt.substring(0, 100)}...`);
    
    // CRITICAL FIX: Extract category context from user's request for Maya's intelligent parameter selection
    let categoryContext = '';
    
    // Extract category from concept name using actual SSELFIE Studio categories
    if (conceptName) {
      const conceptLower = conceptName.toLowerCase();
      if (conceptLower.includes('business') || conceptLower.includes('corporate')) {
        categoryContext = 'Business';
      } else if (conceptLower.includes('professional') || conceptLower.includes('authority') || conceptLower.includes('leadership')) {
        categoryContext = 'Professional & Authority';
      } else if (conceptLower.includes('lifestyle') || conceptLower.includes('coffee') || conceptLower.includes('everyday')) {
        categoryContext = 'Lifestyle';
      } else if (conceptLower.includes('casual') || conceptLower.includes('authentic') || conceptLower.includes('natural')) {
        categoryContext = 'Casual & Authentic';
      } else if (conceptLower.includes('story') || conceptLower.includes('narrative') || conceptLower.includes('journey')) {
        categoryContext = 'Story';
      } else if (conceptLower.includes('behind') || conceptLower.includes('scenes') || conceptLower.includes('process')) {
        categoryContext = 'Behind the Scenes';
      } else if (conceptLower.includes('instagram') || conceptLower.includes('social media')) {
        categoryContext = 'Instagram';
      } else if (conceptLower.includes('feed') || conceptLower.includes('stories')) {
        categoryContext = 'Feed & Stories';
      } else if (conceptLower.includes('travel') || conceptLower.includes('destination')) {
        categoryContext = 'Travel';
      } else if (conceptLower.includes('adventure') || conceptLower.includes('explore')) {
        categoryContext = 'Adventures & Destinations';
      } else if (conceptLower.includes('outfit') || conceptLower.includes('fashion') || conceptLower.includes('style')) {
        categoryContext = 'Fashion & Style';
      } else if (conceptLower.includes('grwm') || conceptLower.includes('get ready') || conceptLower.includes('morning')) {
        categoryContext = 'GRWM';
      } else if (conceptLower.includes('future') || conceptLower.includes('aspirational') || conceptLower.includes('vision')) {
        categoryContext = 'Future Self';
      } else if (conceptLower.includes('b&w') || conceptLower.includes('black and white') || conceptLower.includes('timeless')) {
        categoryContext = 'B&W';
      } else if (conceptLower.includes('studio') || conceptLower.includes('controlled') || conceptLower.includes('professional lighting')) {
        categoryContext = 'Studio';
      }
    }
    
    // Fallback: analyze the final prompt for category clues using actual categories
    if (!categoryContext) {
      const promptLower = finalPrompt.toLowerCase();
      if (promptLower.includes('office') || promptLower.includes('meeting') || promptLower.includes('corporate')) {
        categoryContext = 'Business';
      } else if (promptLower.includes('leadership') || promptLower.includes('executive') || promptLower.includes('authority')) {
        categoryContext = 'Professional & Authority';
      } else if (promptLower.includes('kitchen') || promptLower.includes('coffee') || promptLower.includes('home')) {
        categoryContext = 'Lifestyle';
      } else if (promptLower.includes('relaxed') || promptLower.includes('natural') || promptLower.includes('authentic')) {
        categoryContext = 'Casual & Authentic';
      } else if (promptLower.includes('pajama') || promptLower.includes('morning') || promptLower.includes('getting ready')) {
        categoryContext = 'GRWM';
      } else if (promptLower.includes('travel') || promptLower.includes('destination') || promptLower.includes('location')) {
        categoryContext = 'Travel';
      } else if (promptLower.includes('fashion') || promptLower.includes('outfit') || promptLower.includes('style')) {
        categoryContext = 'Fashion & Style';
      } else if (promptLower.includes('studio') || promptLower.includes('controlled lighting')) {
        categoryContext = 'Studio';
      }
    }
    
    console.log(`🎯 MAYA CATEGORY CONTEXT: "${categoryContext}" detected for intelligent parameter selection`);
    
    const result = await ModelTrainingService.generateUserImages(
      userId,
      finalPrompt,
      safeCount,
      { preset, seed, categoryContext }
    );
    
    // PHASE 7: Log successful generation start
    logMayaGeneration('COMPLETE', {
      userId,
      userType,
      predictionId: result.predictionId,
      success: true,
      duration: Date.now() - startTime
    });
    
    logMayaAPI('/generate', startTime, true);

    return res.json({ 
      success: true,
      predictionId: result.predictionId
    });
  } catch (error: any) {
    console.error("Unified Maya generate error:", error);
    
    // PHASE 7: Log generation failure
    logMayaGeneration('FAILED', {
      userId: (req.user as any)?.claims?.sub || 'unknown',
      userType: req.userType || 'member',
      error: error.message,
      duration: Date.now() - startTime
    });
    
    logMayaAPI('/generate', startTime, false, error);
    
    return res.status(200).json({ 
      success: false,
      error: "Oops! Something went wonky when I tried to start creating your photos. Let me help you troubleshoot this - what specific type of photo are you trying to create? I'll make sure we get it working!",
      message: "Oops! Something went wonky when I tried to start creating your photos. Let me help you troubleshoot this - what specific type of photo are you trying to create? I'll make sure we get it working!",
      quickButtons: ["Try professional headshot", "Try lifestyle photo", "Check my training", "Tell me what's wrong"],
      canGenerate: false 
    });
  }
});

// Unified status endpoint
router.get('/status', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  const startTime = Date.now(); // PHASE 7: Track status performance
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      logMayaAPI('/status', startTime, false, new Error('Authentication required'));
      return res.status(401).json({ 
        error: "Hey gorgeous! I need to verify it's you before I can check your styling status. Let's get you signed in so I can see what amazing photos we can create!" 
      });
    }
    
    const userType = req.userType || 'member';
    console.log(`📊 MAYA ${userType.toUpperCase()}: Status check from ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);

    const userContext = await getUnifiedUserContext(userId);
    const generationInfo = await checkGenerationCapability(userId);
    
    // PHASE 7: Log status check success
    logMayaPerformance('STATUS_CHECK', {
      userId,
      userType,
      onboardingComplete: userContext.onboardingComplete,
      canGenerate: generationInfo.canGenerate,
      hasModel: !!generationInfo.userModel
    });
    
    logMayaAPI('/status', startTime, true);
    
    res.json({
      success: true,
      onboardingComplete: userContext.onboardingComplete,
      canGenerate: generationInfo.canGenerate,
      hasModel: !!generationInfo.userModel,
      triggerWord: generationInfo.triggerWord,
      chatHistory: userContext.recentChats
    });

  } catch (error) {
    console.error('Maya status error:', error);
    
    // PHASE 7: Log status error
    logMayaPerformance('STATUS_ERROR', {
      userId: (req.user as any)?.claims?.sub || 'unknown',
      userType: req.userType || 'member',
      error: error.message
    });
    
    logMayaAPI('/status', startTime, false, error);
    
    res.status(200).json({ 
      success: false,
      error: 'Status check failed',
      message: "I'm having trouble checking your account status right now, but I'm still here to help! What would you like to create today?"
    });
  }
});

// 🎯 MAYA'S INTELLIGENT GENERATION STATUS POLLING
router.get('/check-generation/:predictionId', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  const startTime = Date.now(); // PHASE 7: Track polling performance
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      logMayaAPI('/check-generation', startTime, false, new Error('Authentication required'));
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userType = req.userType || 'member';
    console.log(`🔄 MAYA ${userType.toUpperCase()}: Generation check from ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);

    const predictionId = req.params.predictionId;
    const { chatId, messageId } = req.query; // Get chatId and messageId from query params
    if (!predictionId) {
      return res.status(400).json({ error: 'Prediction ID required' });
    }

    console.log(`🔍 MAYA POLLING: Checking generation status for prediction ${predictionId}`);

    const { default: Replicate } = await import('replicate');
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    
    const prediction = await replicate.predictions.get(predictionId);
    
    console.log(`📊 MAYA POLLING: Prediction status: ${prediction.status}`);
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output];
      console.log(`✅ MAYA GENERATION COMPLETE: ${imageUrls.length} images generated`);
      
      // 🔥 CRITICAL FIX: Save generated images to database and start permanent migration
      let finalImageUrls = imageUrls;
      
      if (chatId && messageId) {
        try {
          console.log(`💾 MAYA PERSISTENCE: Saving ${imageUrls.length} images to database and migrating to permanent storage`);
          
          // Step 1: Immediately migrate temporary URLs to permanent S3 storage
          const { ImageStorageService } = await import('../image-storage-service');
          const permanentUrls = [];
          
          for (const tempUrl of imageUrls) {
            try {
              const permanentUrl = await ImageStorageService.ensurePermanentStorage(
                tempUrl, 
                userId, 
                `maya_${predictionId}_${permanentUrls.length}`
              );
              permanentUrls.push(permanentUrl);
              console.log(`✅ MAYA MIGRATION: ${tempUrl} → ${permanentUrl}`);
            } catch (migrationError) {
              console.error(`⚠️ MAYA MIGRATION: Failed to migrate ${tempUrl}, using temporary URL:`, migrationError);
              // Use temporary URL as fallback - migration monitor will retry later
              permanentUrls.push(tempUrl);
            }
          }
          
          finalImageUrls = permanentUrls;
          
          // Step 2: Find the latest Maya message in this chat that can generate
          const chatMessages = await storage.getMayaChatMessages(Number(chatId));
          const latestMayaMessage = chatMessages
            .filter(msg => msg.role === 'assistant' || msg.role === 'maya')
            .reverse()[0]; // Get the most recent Maya message
          
          if (latestMayaMessage) {
            await storage.updateMayaChatMessage(latestMayaMessage.id, {
              imagePreview: JSON.stringify(finalImageUrls) // Store permanent URLs as JSON string
            });
            console.log(`✅ MAYA PERSISTENCE: ${finalImageUrls.length} permanent images saved to message ${latestMayaMessage.id}`);
          }
        } catch (persistError) {
          console.error('Maya persistence error (non-blocking):', persistError);
          // Don't fail the request if persistence fails - use original URLs
          finalImageUrls = imageUrls;
        }
      }
      
      // PHASE 7: Log successful generation completion
      logMayaPerformance('GENERATION_COMPLETE', {
        userId,
        userType,
        predictionId,
        imageCount: imageUrls.length,
        pollDuration: Date.now() - startTime
      });
      
      logMayaAPI('/check-generation', startTime, true);

      res.json({
        status: 'completed',
        imageUrls: finalImageUrls, // Return permanent URLs
        message: `Maya created ${finalImageUrls.length} stunning photo${finalImageUrls.length > 1 ? 's' : ''} for you!`
      });
    } else if (prediction.status === 'failed') {
      console.error(`❌ MAYA GENERATION FAILED: ${prediction.error || 'Unknown error'}`);
      
      // PHASE 7: Log generation failure during polling
      logMayaPerformance('GENERATION_POLL_FAILED', {
        userId,
        userType,
        predictionId,
        error: prediction.error || 'Unknown error',
        pollDuration: Date.now() - startTime
      });
      
      logMayaAPI('/check-generation', startTime, false, new Error(String(prediction.error || 'Generation failed')));
      
      res.json({ 
        status: 'failed', 
        error: prediction.error || 'Generation failed',
        message: "Oh no! I hit a snag while creating those photos. Don't worry though - let me try a completely different approach! What specific style or vibe are you going for? I'll make sure we nail it this time!"
      });
    } else {
      // PHASE 7: Log polling status
      logMayaPerformance('GENERATION_POLL', {
        userId,
        userType,
        predictionId,
        status: prediction.status,
        pollDuration: Date.now() - startTime
      });
      
      logMayaAPI('/check-generation', startTime, true);
      
      // Still processing
      res.json({ 
        status: 'processing',
        message: "I'm working on your photos right now! This usually takes 30-60 seconds..."
      });
    }
    
  } catch (error: any) {
    console.error('Maya check generation error:', error);
    
    // PHASE 7: Log polling error
    logMayaPerformance('GENERATION_POLL_ERROR', {
      userId: (req.user as any)?.claims?.sub || 'unknown',
      userType: req.userType || 'member',
      predictionId: req.params.predictionId,
      error: error.message,
      pollDuration: Date.now() - startTime
    });
    
    logMayaAPI('/check-generation', startTime, false, error);
    
    res.status(200).json({ 
      status: 'error',
      error: 'Status check failed',
      message: "I'm having a little trouble checking on your photos right now, but don't worry! Let me create something fresh for you instead. What kind of amazing photos would you love to see?"
    });
  }
});

// HELPER FUNCTIONS

async function getUnifiedUserContext(userId: string) {
  try {
    // Get user basic info
    const user = await storage.getUser(userId);
    
    // Get onboarding data
    let onboardingData = null;
    try {
      onboardingData = await storage.getOnboardingData(userId);
    } catch (error) {
      console.log('No onboarding data found for user:', userId);
    }
    
    // Get recent Maya chats
    let recentChats = [];
    try {
      const chats = await storage.getMayaChats(userId);
      recentChats = chats.slice(0, 5); // Get 5 most recent
    } catch (error) {
      console.log('No chat history found for user:', userId);
    }

    return {
      userId,
      userInfo: {
        email: user?.email,
        firstName: user?.firstName,
        plan: user?.plan
      },
      onboarding: {
        isComplete: onboardingData?.isCompleted || false,
        currentStep: onboardingData?.currentStep || 1,
        stylePreferences: onboardingData?.stylePreferences,
        businessType: onboardingData?.businessType,
        personalBrandGoals: onboardingData?.personalBrandGoals
      },
      recentChats,
      onboardingComplete: onboardingData?.isCompleted || false
    };
  } catch (error) {
    console.error('Error getting unified user context:', error);
    return {
      userId,
      userInfo: {},
      onboarding: { isComplete: false, currentStep: 1 },
      recentChats: [],
      onboardingComplete: false
    };
  }
}

async function checkGenerationCapability(userId: string) {
  try {
    const userModel = await storage.getUserModelByUserId(userId);
    return {
      canGenerate: !!userModel?.triggerWord,
      triggerWord: userModel?.triggerWord || null,
      userModel: userModel
    };
  } catch (error) {
    return {
      canGenerate: false,
      triggerWord: null,
      userModel: null
    };
  }
}

function enhancePromptForContext(baseMayaPersonality: string, context: string, userContext: any, generationInfo: any, isAdmin: boolean = false, userType: string = 'member'): string {
  let enhancement = `\n\n🎯 CURRENT INTERACTION CONTEXT:
- User: ${userContext.userInfo.email || 'Unknown'}
- User Type: ${userType.toUpperCase()} ${isAdmin ? '(PLATFORM OWNER)' : '(SUBSCRIBER)'}
- Plan: ${userContext.userInfo.plan || 'Not specified'}
- Context: ${context}
- Can Generate Images: ${generationInfo.canGenerate ? 'YES' : 'NO - needs training first'}`;

  if (generationInfo.triggerWord) {
    enhancement += `\n- Trigger Word: ${generationInfo.triggerWord}`;
  }

  // CRITICAL: Immediate concept generation rules
  enhancement += `\n\n🚫 ZERO TOLERANCE: IMMEDIATE CONCEPT GENERATION REQUIRED
- When user requests categories/concepts (like "Glam time before a night out at beachclubs"), generate specific styling concepts IMMEDIATELY
- NO repetitive questions like "Tell me more about this vision" - use conversation history and create concepts
- Each concept must include: outfit formula, hair/makeup, location, mood
- Present 3-5 complete styling scenarios ready for generation
- Use your styling expertise to be specific about colors, textures, silhouettes without asking for more details

🎯 UNIVERSAL CONCEPT GENERATION RULES:
When creating styling concepts, use your natural conversational style with clear concept presentation:

NATURAL FORMAT FLEXIBILITY:
- Present concepts however feels most natural to the conversation flow
- Use bold formatting (**Concept Name**) to make concepts easy to identify
- Each concept should showcase your styling expertise with specific details
- Generate 3-6 diverse concepts that demonstrate your complete professional range
- Make each concept feel unique and personalized to the user's style journey

STYLING INTELLIGENCE MANDATE:
- Draw from your complete professional background for each concept
- Create diverse combinations of colors, textures, settings, and styling approaches
- Let each concept tell its own story rather than following templates
- Use your fashion week, photography, and personal branding expertise authentically`;

  // Admin-specific context enhancement
  if (isAdmin) {
    enhancement += `\n\n🎯 ADMIN PLATFORM CONTEXT:
You're interacting with the platform owner (ssa@ssasocial.com). This is for platform content creation, business strategy, or system testing.
- Provide enhanced business and platform insights
- Can discuss platform development and strategy  
- Focus on business content creation and marketing materials
- Separate this interaction from member subscriber analytics`;
  } else {
    enhancement += `\n\n👤 MEMBER SUBSCRIBER CONTEXT:
You're interacting with a paying subscriber (€47/month). Focus on their personal branding transformation journey.
- Provide personalized styling expertise
- Help them achieve their business transformation goals
- Create content that supports their personal brand journey`;
  }

  // Context-specific enhancements using Maya's personality
  switch (context) {
    case 'onboarding':
      enhancement += `\n\n💫 CONVERSATIONAL DISCOVERY MODE:
You're having a natural conversation to understand their personal brand journey. NO structured steps, forms, or progress indicators needed.

APPROACH:
- Ask about their transformation journey in warm conversation
- Extract business context naturally from their responses
- Learn style preferences through genuine interest and dialogue
- Let them skip between topics freely based on their interest
- Save partial information gracefully without requiring completion

WHAT TO GATHER NATURALLY:
- Their story: Where they're coming from, what's changing in their life
- Their goals: Business dreams, personal transformation, confidence building  
- Their style: What makes them feel powerful, colors they love, lifestyle they're building
- Their vision: The future version of themselves they're creating

Focus on making them feel heard and understood first, information gathering second.`;
      break;
      
    case 'generation':
      enhancement += `\n\n📸 GENERATION MODE:
The user wants to create photos. When creating images, include the user's trigger word "${generationInfo.triggerWord}" and apply your styling expertise naturally.

Use your complete professional knowledge: fashion week experience, hair and beauty mastery, photography expertise, and personal branding wisdom. Let your authentic styling intelligence guide each unique concept based on the user's specific context and goals.`;
      break;

    case 'quickstart':
      enhancement += `\n\n⚡ QUICK START MODE:
The user chose Quick Start and wants to create photos immediately. Use your styling expertise to create compelling photo concepts.

Generate 2-3 photo concepts based on your complete fashion expertise and styling knowledge. Create concept names that capture your unique styling vision. Be warm, excited, and use your natural voice to suggest styling directions that feel authentic to your professional background.

Use the QUICK_ACTIONS format to present your concepts, and let your genuine styling recommendations shine through based on current trends and your expertise.`;
      break;
      
    default:
      enhancement += `\n\n💬 REGULAR CHAT MODE:
Provide styling consultation using your complete fashion expertise. Help them with styling questions, photo concepts, or personal brand development.`;
  }

  if (userContext.onboarding.stylePreferences) {
    enhancement += `\n\n🎨 USER'S STYLE PREFERENCES: ${userContext.onboarding.stylePreferences}`;
  }

  if (userContext.onboarding.businessType) {
    enhancement += `\nBUSINESS TYPE: ${userContext.onboarding.businessType}`;
  }

  enhancement += `\n\n💫 REMEMBER: You're Sandra's AI bestie with all her styling secrets. Be warm, expert, and help them see their future self through amazing photos.

🎯 NATURAL CONVERSATION FLOW:
When appropriate, offer contextual suggestions that feel natural to the conversation. Let your expertise guide the interaction organically, creating authentic moments of styling insight and creative inspiration.`;

  return baseMayaPersonality + enhancement;
}

async function processMayaResponse(response: string, context: string, userId: string, userContext: any, generationInfo: any) {
  let processed = {
    message: response,
    canGenerate: false,
    generatedPrompt: null,
    onboardingProgress: null,
    quickButtons: [],
    chatCategory: 'General Styling',
    conceptCards: []
  };

  // FIRST: Extract Maya-generated quick actions
  if (response.includes('QUICK_ACTIONS:')) {
    const quickActionsMatch = response.match(/QUICK_ACTIONS:\s*(.*)/);
    if (quickActionsMatch) {
      processed.quickButtons = quickActionsMatch[1].split(',').map(s => s.trim());
      // Remove the quick actions directive from the displayed message
      processed.message = response.replace(/QUICK_ACTIONS:.*/, '').trim();
    }
  }

  // Check if Maya wants to generate images
  if (generationInfo.canGenerate && (
    response.toLowerCase().includes('generate') || 
    response.toLowerCase().includes('create') ||
    response.toLowerCase().includes('photoshoot') ||
    response.includes('```prompt') ||
    response.includes('🎯') // Maya's embedded prompt indicator
  )) {
    processed.canGenerate = true;

    // CRITICAL FIX: Extract prompt from multiple formats
    let extractedPrompt = null;
    
    // First try: Traditional ```prompt``` blocks
    const promptMatch = response.match(/```prompt\s*([\s\S]*?)\s*```/);
    if (promptMatch) {
      extractedPrompt = promptMatch[1].trim();
      // Remove prompt block from conversation response
      processed.message = processed.message.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
    } else {
      // Second try: Maya's embedded prompt format (🎯 EXECUTIVE POWER LOOK)
      const embeddedMatch = response.match(/\*\*🎯[^*]*\*\*\s*([\s\S]*?)(?=\*\*🎯|\*\*Generated|$)/);
      if (embeddedMatch) {
        extractedPrompt = embeddedMatch[1].trim();
        console.log('🎯 MAYA UNIFIED: Extracted embedded prompt:', extractedPrompt);
        // Don't remove embedded prompts from display - they're part of Maya's styling expertise
      }
    }
    
    // Third try: If no specific prompt found, check if entire response is a detailed prompt
    if (!extractedPrompt && response.length > 100 && response.includes('portrait')) {
      extractedPrompt = response;
      console.log('🎯 MAYA UNIFIED: Using entire response as detailed prompt');
    }
    
    if (extractedPrompt) {
      processed.generatedPrompt = extractedPrompt;
      console.log('🎯 MAYA UNIFIED: Final extracted prompt:', extractedPrompt.substring(0, 100) + '...');
    }
  }

  // NEW: Parse concepts into individual cards with embedded prompts - Enhanced for Maya's natural formatting
  const concepts = await parseConceptsFromResponse(response, userId);
  if (concepts.length > 0) {
    processed.conceptCards = concepts;
    // Remove traditional canGenerate since we have concept cards
    processed.canGenerate = false;
    processed.generatedPrompt = null;
    
    // CRITICAL FIX: Remove ALL concept card content from main message to prevent duplication
    let cleanedMessage = response;
    
    // COMPREHENSIVE CONCEPT REMOVAL: Remove all formats Maya uses for concepts
    // This ensures concepts only appear as interactive cards, never duplicated in chat
    
    // 1. Remove ALL bold concept titles that will be parsed as concept cards
    // Pattern: **Any Concept Name** (that becomes a concept card)
    const conceptTitles = concepts.map(c => c.title);
    for (const title of conceptTitles) {
      // Remove the exact concept title and everything until the next concept or end
      const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const conceptSectionRegex = new RegExp(`\\*\\*${titleEscaped}\\*\\*[\\s\\S]*?(?=\\*\\*(?:${conceptTitles.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\*\\*|$)`, 'gi');
      cleanedMessage = cleanedMessage.replace(conceptSectionRegex, '');
    }
    
    // 2. Remove numbered concept patterns (**1. Concept Name**)
    cleanedMessage = cleanedMessage.replace(/\*\*\d+\.\s*[^*\n]+\*\*[\s\S]*?(?=\*\*\d+\.|$)/g, '');
    
    // 3. Remove standalone bold concept patterns
    cleanedMessage = cleanedMessage.replace(/\*\*[^*\n]{3,50}\*\*[\s\S]*?(?=\*\*[^*\n]{3,50}\*\*|$)/g, '');
    
    // 4. Remove legacy ## format sections completely
    cleanedMessage = cleanedMessage.replace(/##[^#]*?(?=##|$)/gs, '');
    
    // 5. Remove concept-related formatting phrases
    cleanedMessage = cleanedMessage.replace(/\*\*(?:The Look|Setting|Vibe|Mood|Details|Style|Hair|Makeup|Location|Accessories|Outfit|Colors|Textures|Energy)\*\*:?[^\n]*/gi, '');
    
    // 6. Remove bullet points and descriptions typically found in concepts
    cleanedMessage = cleanedMessage.replace(/^\s*[-*•]\s*.{10,200}/gm, '');
    
    // 7. Remove common concept description patterns
    cleanedMessage = cleanedMessage.replace(/^[A-Z][^.!?]*[.!?]\s*(?=[A-Z]|$)/gm, '');
    
    // 8. Clean up the message structure
    cleanedMessage = cleanedMessage
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Keep only meaningful intro/outro lines, remove concept fragments
        return line.length > 0 && 
               !line.match(/^[-*#•]+$/) && 
               !line.match(/^\*\*/) && 
               !line.match(/^[A-Z][^.]*\.$/) && // Remove short descriptive sentences
               line.length > 15; // Remove very short fragments
      })
      .join('\n')
      .trim();
    
    // Update the message to show only the intro/outro without concept details
    if (cleanedMessage.length > 100) {
      processed.message = cleanedMessage;
    } else {
      // If almost everything was removed, create a nice intro message
      processed.message = `Oh my gosh, I'm absolutely buzzing with ideas for you! 

Based on your personal brand vision and the amazing energy you're bringing - let me give you some absolutely stunning concepts that are going to make your audience stop scrolling.

Which of these is calling to you? I can already picture how incredible these are going to look!`;
    }
    
    console.log('🎯 MAYA CONCEPT CARDS: Parsed', concepts.length, 'concepts from response');
    console.log('🎯 MAYA CLEANUP: Cleaned message to prevent duplication');
  }

  // Handle conversational onboarding (no forced steps)
  if (context === 'onboarding') {
    // Natural completion detection - Maya decides when discovery is sufficient
    if (response.toLowerCase().includes('ready to create') || 
        response.toLowerCase().includes('let\'s create') ||
        response.toLowerCase().includes('start generating')) {
      processed.onboardingProgress = {
        isComplete: true,
        naturalTransition: true
      };
    }
    // No forced step progression - let conversation flow naturally
  }
  
  // Set chat category based on content
  if (response.toLowerCase().includes('headshot')) processed.chatCategory = 'Professional Headshots';
  else if (response.toLowerCase().includes('social') || response.toLowerCase().includes('instagram')) processed.chatCategory = 'Social Media Photos';
  else if (response.toLowerCase().includes('website')) processed.chatCategory = 'Website Photos';
  else if (response.toLowerCase().includes('email') || response.toLowerCase().includes('newsletter')) processed.chatCategory = 'Email & Marketing Photos';
  else if (response.toLowerCase().includes('premium') || response.toLowerCase().includes('luxury')) processed.chatCategory = 'Premium Brand Photos';

  return processed;
}

interface ConceptCard {
  id: string;
  title: string;
  description: string;  // Short description for frontend display
  originalContext: string;  // Maya's complete original styling context and reasoning
  fullPrompt?: string;  // Maya's complete detailed prompt ready for generation
  canGenerate: boolean;
  isGenerating: boolean;
  generatedImages?: string[];
}

const parseConceptsFromResponse = async (response: string, userId?: string): Promise<ConceptCard[]> => {
  const concepts: ConceptCard[] = [];
  
  console.log('🎯 UNIFIED CONCEPT PARSING: Analyzing response for Maya\'s styling concepts');
  
  // ENHANCED CONCEPT DETECTION: Look for Maya's natural concept presentation
  // Pattern: **Concept Name** followed by styling details
  const conceptPattern = /\*\*([^*\n]{10,80})\*\*([^*]*?)(?=\*\*[^*\n]{10,80}\*\*|$)/gs;
  
  let match;
  let conceptNumber = 1;
  const foundConcepts = new Set();
  
  while ((match = conceptPattern.exec(response)) !== null) {
    let conceptName = match[1].trim();
    let conceptContent = match[2].trim();
    
    // Clean up concept name
    conceptName = conceptName
      .replace(/^\d+\.\s*/, '') // Remove leading numbers
      .replace(/[""]/g, '"') // Normalize quotes
      .trim();
    
    // Enhanced validation for styling concepts
    const isStyleConcept = conceptName.length >= 8 && 
                          conceptName.length <= 80 &&
                          !conceptName.match(/^(the|a|an|and|or|but|if|when|where|how|what|why)\s/i) &&
                          !conceptName.match(/^\d+$/) &&
                          conceptName.match(/[a-zA-Z]/) &&
                          // Look for styling-related keywords
                          (conceptName.toLowerCase().includes('look') ||
                           conceptName.toLowerCase().includes('style') ||
                           conceptName.toLowerCase().includes('vibe') ||
                           conceptName.toLowerCase().includes('power') ||
                           conceptName.toLowerCase().includes('glam') ||
                           conceptName.toLowerCase().includes('chic') ||
                           conceptName.toLowerCase().includes('boss') ||
                           conceptName.toLowerCase().includes('elegance') ||
                           conceptName.toLowerCase().includes('confident') ||
                           conceptName.toLowerCase().includes('luxury') ||
                           conceptName.toLowerCase().includes('professional') ||
                           conceptName.toLowerCase().includes('business') ||
                           conceptContent.length > 50); // Or has substantial content
    
    if (!isStyleConcept || foundConcepts.has(conceptName.toLowerCase())) {
      continue;
    }
    
    foundConcepts.add(conceptName.toLowerCase());
    
    // Extract styling elements from concept content
    let description = '';
    let outfit = '';
    let setting = '';
    let mood = '';
    
    // Parse Maya's styling descriptions
    const lines = conceptContent.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 20 && cleanLine.length < 200) {
        if (!description && cleanLine.includes('.')) {
          description = cleanLine;
        } else if (cleanLine.toLowerCase().includes('outfit') || cleanLine.toLowerCase().includes('wear')) {
          outfit = cleanLine;
        } else if (cleanLine.toLowerCase().includes('setting') || cleanLine.toLowerCase().includes('location')) {
          setting = cleanLine;
        } else if (cleanLine.toLowerCase().includes('mood') || cleanLine.toLowerCase().includes('vibe')) {
          mood = cleanLine;
        }
      }
    }
    
    // Create meaningful description from content
    if (!description && conceptContent.length > 10) {
      const firstSentence = conceptContent.split('.')[0];
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 150) {
        description = firstSentence + '.';
      } else {
        description = conceptContent.substring(0, 120) + (conceptContent.length > 120 ? '...' : '');
      }
    }
    
    if (!description) {
      description = `${conceptName} styling concept with Maya's professional expertise`;
    }
    
    // PHASE 1 FIX: Store Maya's complete original concept context for consistency
    const fullOriginalContext = `${conceptName}: ${conceptContent}`.trim();
    
    // CRITICAL FIX: Generate embedded prompt immediately using Maya's intelligence WITH original context
    let embeddedPrompt = '';
    if (userId) {
      try {
        // Generate detailed prompt using Maya's styling intelligence with FULL original context
        embeddedPrompt = await createDetailedPromptFromConcept(conceptName, '', userId, fullOriginalContext);
        console.log(`✅ EMBEDDED PROMPT GENERATED: ${embeddedPrompt.length} chars for "${conceptName}" using original context`);
      } catch (error) {
        console.log(`⚠️ EMBEDDED PROMPT GENERATION FAILED for "${conceptName}":`, error);
      }
    }
    
    const concept: ConceptCard = {
      id: `concept_${conceptNumber}_${Date.now()}`,
      title: conceptName,
      description: description,
      originalContext: fullOriginalContext, // Maya's complete original styling context and reasoning
      fullPrompt: embeddedPrompt, // Maya's complete styling prompt ready for generation
      canGenerate: embeddedPrompt.length > 0,
      isGenerating: false,
      generatedImages: []
    };
    
    concepts.push(concept);
    conceptNumber++;
    
    console.log(`🎯 CONCEPT EXTRACTED: "${conceptName}" with ${embeddedPrompt ? embeddedPrompt.length : 0} char prompt`);
  }
  
  if (concepts.length === 0) {
    console.log('🎯 CONCEPT PARSING: No styling concepts found in response');
  } else {
    console.log(`✅ CONCEPT PARSING SUCCESS: Extracted ${concepts.length} styling concepts with embedded prompts`);
  }
  
  return concepts;
};

function getContextualQuickButtons(context: string, step: number = 1): string[] {
  // DEPRECATED: This function is only used as fallback when Maya doesn't generate her own intelligent quick actions
  // Maya now generates contextual, personalized quick actions using her AI intelligence
  // This fallback provides basic options only when Maya's system doesn't provide suggestions
  
  if (context === 'onboarding') {
    // Simple fallback options - Maya's AI will provide much better contextual suggestions
    return ["Tell me more", "I'm interested", "What's next?"];
  }
  
  // Basic fallback for regular chat - Maya's intelligence provides much better suggestions
  return ["Tell me more", "Show me examples", "What do you recommend?"];
}

async function saveUnifiedConversation(userId: string, userMessage: string, mayaResponse: any, chatId: number | null, context: string, userType: string = 'member', conversationId: string = ''): Promise<number> {
  try {
    let currentChatId = chatId;
    
    // PHASE 4: Natural data extraction from conversation (no step validation)
    if (context === 'onboarding') {
      await extractAndSaveNaturalOnboardingData(userId, userMessage, mayaResponse.message);
    }
    
    // Create new chat if needed
    if (!currentChatId) {
      const contextPrefix = userType === 'admin' ? '[ADMIN] ' : '';
      const chatTitle = context === 'onboarding' ? 'Personal Brand Discovery' : `${mayaResponse.chatCategory} Session`;
      const chatSummary = `${context}: ${userMessage.substring(0, 100)}...`;
      
      const newChat = await storage.createMayaChat({
        userId,
        chatTitle: contextPrefix + chatTitle,
        chatSummary
      });
      currentChatId = newChat.id;
    }

    // Save both messages
    await storage.saveMayaChatMessage({
      chatId: currentChatId,
      role: 'user',
      content: userMessage
    });

    await storage.saveMayaChatMessage({
      chatId: currentChatId,
      role: 'maya',
      content: mayaResponse.message,
      generatedPrompt: mayaResponse.generatedPrompt
    });

    return currentChatId;
  } catch (error) {
    console.error('Error saving unified conversation:', error);
    // Return existing chatId or 0 as fallback
    return chatId || 0;
  }
}

// PHASE 4: Natural onboarding data extraction without step validation
async function extractAndSaveNaturalOnboardingData(userId: string, userMessage: string, mayaResponse: string) {
  try {
    // Check if storage extensions exist for personal brand data
    const { MayaStorageExtensions } = await import('../storage-maya-extensions');
    
    // Natural language processing to extract data from conversation
    const extractedData: any = {};
    let hasNewData = false;
    
    // Extract transformation story from various conversation patterns
    const storyPatterns = [
      /(?:story|journey|background|started|began|transformation|experience|path)[^.]*?([^.]{10,200})/gi,
      /(?:i'm|i am|i was|i have been)[^.]*?([^.]{20,200})/gi,
      /(?:from|since|after|when)[^.]*?([^.]{15,150})/gi
    ];
    
    for (const pattern of storyPatterns) {
      const matches = userMessage.match(pattern);
      if (matches && !extractedData.transformationStory) {
        extractedData.transformationStory = matches[0].trim();
        hasNewData = true;
        break;
      }
    }
    
    // Extract business context and goals naturally
    const businessPatterns = [
      /(?:business|company|work|entrepreneur|coaching|consulting|brand|marketing)[^.]*?([^.]{15,150})/gi,
      /(?:goal|want|need|building|creating|launching|growing)[^.]*?([^.]{15,150})/gi
    ];
    
    for (const pattern of businessPatterns) {
      const matches = userMessage.match(pattern);
      if (matches && !extractedData.businessGoals) {
        extractedData.businessGoals = matches[0].trim();
        hasNewData = true;
        break;
      }
    }
    
    // Extract future vision and aspirations
    const visionPatterns = [
      /(?:future|vision|dream|hope|want to be|becoming|see myself)[^.]*?([^.]{15,150})/gi,
      /(?:CEO|leader|confident|successful|powerful)[^.]*?([^.]{10,100})/gi
    ];
    
    for (const pattern of visionPatterns) {
      const matches = userMessage.match(pattern);
      if (matches && !extractedData.futureVision) {
        extractedData.futureVision = matches[0].trim();
        hasNewData = true;
        break;
      }
    }
    
    // Extract style preferences from conversation
    const stylePatterns = [
      /(?:style|fashion|look|outfit|color|prefer|love|like)[^.]*?([^.]{10,100})/gi,
      /(?:professional|casual|elegant|edgy|classic|modern)[^.]*?([^.]{10,80})/gi
    ];
    
    for (const pattern of stylePatterns) {
      const matches = userMessage.match(pattern);
      if (matches && !extractedData.stylePreferences) {
        extractedData.stylePreferences = matches[0].trim();
        hasNewData = true;
        break;
      }
    }
    
    // Save naturally extracted data if any new information was found
    if (hasNewData) {
      await MayaStorageExtensions.saveUserPersonalBrand({
        ...extractedData,
        userId,
        updatedAt: new Date()
      });
      console.log(`💫 MAYA NATURAL ONBOARDING: Saved conversation data for user ${userId}:`, 
        Object.keys(extractedData).join(', '));
    }
    
  } catch (error) {
    console.log('Natural onboarding data extraction failed, continuing gracefully:', error);
  }
}

// MAYA'S AI-DRIVEN PROMPT GENERATION - NO MORE HARDCODED TEMPLATES
async function createDetailedPromptFromConcept(conceptName: string, triggerWord: string, userId?: string, originalConceptContext?: string): Promise<string> {
  // UNIFIED MAYA INTELLIGENCE: Use Maya's complete styling expertise to create detailed prompts
  
  try {
    // Load user's personal brand context for personalized styling
    let personalBrandContext = '';
    let finalTriggerWord = triggerWord;
    
    if (userId) {
      try {
        // Get user's trigger word if not provided
        if (!finalTriggerWord) {
          const generationInfo = await checkGenerationCapability(userId);
          finalTriggerWord = generationInfo.triggerWord || '';
        }
        
        // Load personal brand context for styling customization
        const { MayaStorageExtensions } = await import('../storage-maya-extensions');
        const mayaUserContext = await MayaStorageExtensions.getMayaUserContext(userId);
        
        if (mayaUserContext?.personalBrand) {
          personalBrandContext = `
          
USER'S PERSONAL BRAND CONTEXT:
- Business Goals: ${mayaUserContext.personalBrand.businessGoals || 'Professional growth'}
- Current Situation: ${mayaUserContext.personalBrand.currentSituation || 'Building their brand'}
- Future Vision: ${mayaUserContext.personalBrand.futureVision || 'Success and confidence'}
- Transformation Story: ${mayaUserContext.personalBrand.transformationStory || 'Personal evolution'}

Use this context to customize styling choices that align with their unique transformation journey.`;
        }
      } catch (error) {
        console.log('Personal brand context not available, using general styling approach');
      }
    }
    
    // MAYA'S UNIFIED PROMPT GENERATION INTELLIGENCE
    const mayaPromptPersonality = PersonalityManager.getNaturalPrompt('maya') + `

🎯 MAYA'S UNIFIED STYLING INTELLIGENCE:
You are Maya with Sandra's complete professional expertise: fashion week stylist, magazine covers, luxury aesthetics, former hairdresser, modeling experience, and 120K+ follower empire.

PROMPT GENERATION TASK:
Create a detailed, technical prompt for generating "${conceptName}" that showcases your complete styling expertise.

APPLY YOUR PROFESSIONAL MASTERY:
• Fashion Week Experience: Editorial impact, sophisticated silhouettes, luxury-accessible combinations
• Hair & Beauty Expertise: Editorial techniques, camera-ready styling, photographic dimension
• Luxury Aesthetics: Premium materials, sophisticated palettes, clean lines with visual richness
• Photography Knowledge: Shot types, lighting mastery, technical camera expertise
• Personal Branding: Transformation vision, confidence building, authentic power expression

MAYA'S INTELLIGENCE MANDATE:
- NEVER use generic descriptions or simplified styling - showcase your complete fashion week expertise
- Apply your 120K+ follower brand knowledge to create sophisticated, editorial-level concepts
- Use your hairdresser background for detailed hair and beauty specifications
- Leverage your modeling experience for authentic posing and styling combinations
- Create unique, personalized concepts that reflect Sandra's luxury aesthetic and professional transformation philosophy
- Avoid repetitive patterns - each prompt should demonstrate fresh styling innovation
- Include technical photography details that show your behind-the-scenes industry knowledge

MAYA'S EXPERT PROMPT ARCHITECTURE:
- Begin with trigger word: "${finalTriggerWord}"
- Apply your fashion week styling expertise for sophisticated outfit combinations and fabric choices
- Use your hairdresser expertise for detailed hair texture, styling techniques, and dimensional color
- Include your modeling knowledge for authentic poses, angles, and body positioning
- Specify editorial-quality lighting setups using your photography background
- Create luxury aesthetics that reflect Sandra's brand transformation philosophy
- Include technical camera details (lens choice, aperture, composition) from your industry experience
- Build authentic energy and confidence that embodies personal brand transformation
- NO GENERIC STYLING - every element should demonstrate your complete professional mastery${personalBrandContext}

CONCEPT TO DEVELOP: "${conceptName}"
ORIGINAL MAYA CONTEXT: "${originalConceptContext || 'No original context provided - use your complete professional styling expertise'}"

CRITICAL INTELLIGENCE REQUIREMENTS:
- NEVER use hardcoded outfit formulas from personality files
- NEVER repeat styling patterns from previous generations
- Create completely fresh, unique styling using your complete expertise
- Apply Sandra's luxury transformation philosophy to create aspirational yet authentic concepts
- Use your fashion week, hairdressing, modeling, and photography knowledge to create sophisticated prompts

Generate ONLY the final technical prompt - nothing else. Make it detailed, sophisticated, and ready for immediate image generation using your complete professional intelligence.`;

    // Call Claude API for Maya's intelligent prompt generation
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: mayaPromptPersonality,
        messages: [{
          role: 'user',
          content: `Create a detailed technical prompt for: "${conceptName}"`
        }]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const data = await claudeResponse.json();
    let generatedPrompt = data.content[0].text.trim();
    
    // Ensure trigger word is at the beginning
    if (finalTriggerWord && !generatedPrompt.startsWith(finalTriggerWord)) {
      const cleanPrompt = generatedPrompt.replace(new RegExp(finalTriggerWord, 'gi'), '').replace(/^[\s,]+/, '').trim();
      generatedPrompt = `${finalTriggerWord} ${cleanPrompt}`;
    }
    
    console.log(`✅ MAYA UNIFIED PROMPT: Generated ${generatedPrompt.length} character prompt using complete styling intelligence`);
    return generatedPrompt;
    
  } catch (error) {
    console.error('Maya prompt generation error:', error);
    // Fallback to basic prompt if Claude fails
    const basicPrompt = triggerWord ? 
      `${triggerWord} ${conceptName}, professional photo, elegant styling, sophisticated lighting` :
      `${conceptName}, professional photo, elegant styling, sophisticated lighting`;
    
    console.log(`⚠️ MAYA FALLBACK: Using basic prompt due to generation error`);
    return basicPrompt;
  }
}

// 🔥 CRITICAL FIX: Chat History Loading with Image Persistence
router.get('/chats/:chatId/messages', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        error: "I need to make sure it's really you before I can load your styling journey! Let's get you signed in so I can see all the amazing concepts we've created together." 
      });
    }

    const chatId = parseInt(req.params.chatId);
    if (isNaN(chatId)) {
      return res.status(400).json({ 
        error: "Something seems off with that chat link, babe! Let me help you navigate back to your styling conversations - I want to make sure we don't lose any of your amazing photo ideas!" 
      });
    }

    console.log(`📖 MAYA CHAT HISTORY: Loading messages for chat ${chatId}`);

    // Get chat messages from database
    const messages = await storage.getMayaChatMessages(chatId);
    
    // Transform messages for frontend with proper image parsing
    const transformedMessages = messages.map(msg => {
      const transformedMsg: any = {
        role: msg.role === 'assistant' ? 'maya' : msg.role, // Normalize role
        content: msg.content,
        timestamp: msg.createdAt,
        generatedPrompt: msg.generatedPrompt
      };

      // 🔥 CRITICAL FIX: Parse stored JSON imagePreview back to array
      if (msg.imagePreview) {
        try {
          const parsedImages = JSON.parse(msg.imagePreview);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            transformedMsg.imagePreview = parsedImages;
            console.log(`🖼️ MAYA CHAT HISTORY: Loaded ${parsedImages.length} persisted images for message`);
          }
        } catch (parseError) {
          console.error('Error parsing stored imagePreview:', parseError);
          // If it's already an array (legacy format), use as-is
          if (Array.isArray(msg.imagePreview)) {
            transformedMsg.imagePreview = msg.imagePreview;
          }
        }
      }

      return transformedMsg;
    });

    console.log(`✅ MAYA CHAT HISTORY: Loaded ${transformedMessages.length} messages for chat ${chatId}`);
    res.json(transformedMessages);

  } catch (error) {
    console.error('Maya chat history error:', error);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

export default router;