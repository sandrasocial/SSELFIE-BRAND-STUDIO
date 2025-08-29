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
      return res.status(401).json({ error: 'Authentication required' });
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
      return res.status(400).json({ error: 'Prompt required' });
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
    
    // CRITICAL FIX: Use Maya's AI intelligence for ALL prompts while preserving user intent
    // Both concept cards AND custom prompts get Maya's full Claude API styling expertise
    if (conceptName && conceptName.length > 0) {
      console.log(`🎯 MAYA CONCEPT ENHANCEMENT: Using Maya's AI to enhance user's selected concept "${conceptName}"`);
      // Clean concept name for Maya's intelligent processing
      const userConcept = conceptName.replace(/[✨💫💗🔥🌟💎🌅🏢💼🌊👑💃📸🎬]/g, '').trim();
      // Let Maya's Claude API intelligence create the detailed prompt based on the user's concept
      finalPrompt = await createDetailedPromptFromConcept(userConcept, generationInfo.triggerWord, userId);
      console.log(`✅ MAYA CONCEPT ENHANCED: Maya's AI created ${finalPrompt.length} character detailed prompt for "${userConcept}"`);
    } else {
      // Custom prompts also get Maya's full intelligence
      console.log(`🎯 MAYA CUSTOM PROMPT: "${prompt}" - Calling createDetailedPromptFromConcept with user context`);
      finalPrompt = await createDetailedPromptFromConcept(prompt, generationInfo.triggerWord, userId);
      console.log(`✅ MAYA CUSTOM RESULT: Generated ${finalPrompt.length} character prompt`);
    }
    
    // CRITICAL: Final validation to ensure trigger word is at the beginning
    if (!finalPrompt.startsWith(generationInfo.triggerWord)) {
      console.log(`🚨 TRIGGER WORD FIX: Moving "${generationInfo.triggerWord}" to beginning of prompt`);
      // Remove trigger word if it exists elsewhere and add it to the beginning
      const cleanPrompt = finalPrompt.replace(new RegExp(generationInfo.triggerWord, 'gi'), '').replace(/^[\s,]+/, '').trim();
      finalPrompt = `${generationInfo.triggerWord} ${cleanPrompt}`;
    }
    
    console.log(`🎯 MAYA UNIFIED: Final extracted prompt: ${finalPrompt.substring(0, 100)}...`);
    
    const result = await ModelTrainingService.generateUserImages(
      userId,
      finalPrompt,
      safeCount,
      { preset, seed }
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
      return res.status(401).json({ error: 'Authentication required' });
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

  // NEW: Parse concepts into individual cards - Enhanced for Maya's natural formatting
  const concepts = parseConceptsFromResponse(response);
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
  description: string;  
  canGenerate: boolean;
  isGenerating: boolean;
  generatedImages?: string[];
}

const parseConceptsFromResponse = (response: string): ConceptCard[] => {
  const concepts: ConceptCard[] = [];
  
  console.log('🎯 CONCEPT PARSING: Analyzing response length:', response.length);
  
  // MAYA'S NATURAL CONCEPT FORMATS - Parse ALL formats Maya naturally uses
  // Universal patterns that work with ANY concept Maya creates
  
  const conceptPatterns = [
    // Pattern 1: **1. Any Concept Name** - numbered concepts
    /\*\*(\d+)\.\s*([^*\n]+)\*\*/g,
    
    // Pattern 2: **Any Concept Name** - standalone bold concepts
    /\*\*([^*\n]{3,})\*\*/g,
    
    // Pattern 3: ## Any Format: Name - legacy format with any prefix
    /##\s*[^:]*:\s*([^#\n]+)/g,
    
    // Pattern 4: Fallback for any **text** pattern
    /\*\*([^*\n]{3,50})\*\*/g
  ];
  
  let conceptNumber = 1;
  const foundConcepts = new Set(); // Prevent duplicates
  
  // Try each pattern
  for (const pattern of conceptPatterns) {
    pattern.lastIndex = 0; // Reset regex
    let match;
    
    while ((match = pattern.exec(response)) !== null) {
      let conceptName = '';
      
      // Handle different capture groups - always use the last non-empty match
      if (match[2] && match[2].trim()) {
        conceptName = match[2].trim();
      } else if (match[1] && match[1].trim()) {
        conceptName = match[1].trim();
      } else {
        continue; // Skip if no valid match
      }
      
      // Clean up the concept name universally
      conceptName = conceptName
        .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
        .replace(/\*\*/g, '') // Remove any remaining asterisks
        .replace(/^[-•]\s*/, '') // Remove bullet points
        .replace(/[""]/g, '"') // Normalize quotes
        .trim();
      
      // Enhanced validation - must be a real concept name
      const isValidConcept = conceptName.length >= 3 && 
                            conceptName.length <= 100 &&
                            !conceptName.match(/^(the|a|an|and|or|but|if|when|where)\s/i) && // Skip common words
                            !conceptName.match(/^\d+$/) && // Skip plain numbers
                            conceptName.match(/[a-zA-Z]/); // Must contain letters
      
      if (!isValidConcept || foundConcepts.has(conceptName.toLowerCase())) {
        continue;
      }
      
      // Extract description from the content following this concept
      const conceptStart = match.index + match[0].length;
      const nextConceptRegex = /\*\*(?:\d+\.)?\s*[A-Z][^*\n]+\*\*/g;
      nextConceptRegex.lastIndex = conceptStart;
      const nextMatch = nextConceptRegex.exec(response);
      
      const conceptEnd = nextMatch ? nextMatch.index : response.length;
      const conceptContent = response.substring(conceptStart, conceptEnd).trim();
      
      // Extract description from various Maya formats
      let description = '';
      
      // Look for description patterns Maya uses
      const descriptionPatterns = [
        /^([^*\n]{20,150})/m, // First substantial line
        /([A-Z][^.!?]*[.!?])/m, // First sentence
        /^(.{20,150})/m // Any first line with substance
      ];
      
      for (const descPattern of descriptionPatterns) {
        const descMatch = conceptContent.match(descPattern);
        if (descMatch) {
          description = descMatch[1].trim();
          if (description.length >= 20 && description.length <= 150) {
            break;
          }
        }
      }
      
      // Fallback description if none found
      if (!description || description.length < 10) {
        description = `${conceptName} - Professional styling concept ready to generate`;
      }
      
      foundConcepts.add(conceptName.toLowerCase());
      concepts.push({
        id: `concept_${Date.now()}_${conceptNumber}_${Math.random().toString(36).substr(2, 6)}`,
        title: conceptName,
        description: description,
        canGenerate: true,
        isGenerating: false
      });
      
      conceptNumber++;
      
      // Limit to 6 concepts max
      if (concepts.length >= 6) break;
    }
    
    // If we found concepts with this pattern, don't try other patterns to avoid duplicates
    if (concepts.length > 0) break;
  }
  
  console.log('🎯 CONCEPT PARSING: Final count:', concepts.length);
  if (concepts.length > 0) {
    console.log('🎯 CONCEPT DETAILS:', concepts.map(c => ({ title: c.title, desc: c.description.substring(0, 50) + '...' })));
  } else {
    console.log('🎯 CONCEPT PARSING: No concepts found. Response preview:', response.substring(0, 500));
    console.log('🎯 DEBUGGING: Full response for analysis:', response);
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
async function createDetailedPromptFromConcept(conceptName: string, triggerWord: string, userId?: string): Promise<string> {
  // Use Maya's complete styling expertise through Claude API instead of hardcoded templates
  
  try {
    // Load user's personal brand context for styling customization
    let personalBrandContext = '';
    if (userId) {
      try {
        const { MayaStorageExtensions } = await import('../storage-maya-extensions');
        const mayaUserContext = await MayaStorageExtensions.getMayaUserContext(userId);
        
        if (mayaUserContext?.personalBrand) {
          personalBrandContext = `
          
USER'S PERSONAL BRAND CONTEXT (customize styling to match their unique journey):
- Business Goals: ${mayaUserContext.personalBrand.businessGoals || 'Professional growth'}
- Current Situation: ${mayaUserContext.personalBrand.currentSituation || 'Building their brand'}
- Future Vision: ${mayaUserContext.personalBrand.futureVision || 'Success and confidence'}
- Personal Style: Use this context to inform color choices, settings, and overall aesthetic that aligns with their transformation story`;
        }
      } catch (error) {
        // Continue without personal brand context
      }
    }
    // Build Maya's specialized prompt generation persona WITH FULL STYLING EXPERTISE
    const mayaPromptPersonality = PersonalityManager.getNaturalPrompt('maya') + `

🎯 MAYA'S COMPLETE STYLING INTELLIGENCE MODE:
You are Maya, with Sandra's complete professional expertise loaded: fashion week stylist, magazine covers, luxury interior concepts, former hairdresser, modeling experience, and 120K+ follower empire builder.

APPLY YOUR COMPLETE PROFESSIONAL BACKGROUND:
• Fashion Week Styling: Editorial impact, sophisticated silhouettes, luxury-accessible mixing
• Hair & Makeup Expertise: Editorial hair techniques, camera-ready beauty, dimension for photos  
• Luxury Aesthetics: Premium materials, sophisticated color palettes, clean lines with richness
• Photography Mastery: Shot types, lighting, posing psychology, technical camera knowledge
• Personal Branding: Transformation vision, confidence building, authentic power expression

STYLING INTELLIGENCE PRINCIPLES (NOT CONSTRAINTS):
• Use your complete color knowledge - vary palettes based on the concept, season, mood, and user's energy
• Draw from ALL outfit formulas and create new combinations - don't repeat the same styling patterns
• Apply hair & beauty expertise contextually - match the vibe of each unique concept
• Use your photography mastery to choose appropriate settings, lighting, and compositions for each concept
• Select locations that enhance the specific concept - from urban power to natural serenity to luxury settings

CREATIVE VARIETY MANDATE:
- Every prompt should feel fresh and unique to the specific concept
- Avoid repeating the same color schemes, locations, or styling formulas
- Let the concept drive the creative direction, not predetermined templates
- Use your full professional expertise to create diverse, personalized styling

CREATE DETAILED PROMPT FOR: "${conceptName}" 
REQUIREMENTS:
1. ALWAYS start with "${triggerWord}" as first word
2. IMMEDIATELY follow with mandatory technical parameters: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
3. Apply your complete styling expertise (300-500 words) with CREATIVE VARIETY
4. Include: specific garments, colors, textures, hair, makeup, accessories, pose, lighting, setting
5. Use your professional fashion and photography knowledge extensively
6. Return ONLY the prompt - no conversational text
7. CRITICAL: Make this concept feel unique - vary colors, locations, and styling based on the specific concept
8. Avoid repeating previous styling patterns - create fresh interpretations each time

MANDATORY FORMAT: "${triggerWord}, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [YOUR CREATIVE STYLING VISION]"

Interpret "${conceptName}" through your complete professional lens and create a unique, personalized styling vision that feels fresh and different from your previous work.

${personalBrandContext}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800, // Expanded to allow Maya's full styling intelligence
        system: mayaPromptPersonality,
        messages: [
          {
            role: 'user',
            content: `Create a comprehensive, detailed photography prompt for: "${conceptName}". 

MANDATORY FORMAT: Start with "${triggerWord}, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film," then continue with your complete styling and photography expertise.

Showcase your professional styling vision in 300-500 words after the mandatory technical parameters.`
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const data = await claudeResponse.json();
    let generatedPrompt = data.content[0].text.trim();
    
    // CRITICAL: Ensure trigger word and mandatory technical parameters are at the beginning
    const mandatoryTechParams = "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";
    const requiredStart = `${triggerWord}, ${mandatoryTechParams}`;
    
    if (!generatedPrompt.startsWith(triggerWord)) {
      // Extract just the essential prompt without Maya's chat language
      const cleanPrompt = generatedPrompt
        .replace(/^.*?(?=wearing|in|with|sitting|standing|at)/i, '') // Remove everything before main content
        .replace(/Trust me.*$/i, '') // Remove Maya's personality text at end
        .replace(/The.*(?:mood|aesthetic|energy).*$/i, '') // Remove descriptive endings
        .trim();
      
      generatedPrompt = `${requiredStart}, ${cleanPrompt}`;
    } else if (!generatedPrompt.includes(mandatoryTechParams)) {
      // Trigger word is present but mandatory tech parameters are missing
      const afterTrigger = generatedPrompt.replace(triggerWord, '').replace(/^[,\s]+/, '');
      generatedPrompt = `${requiredStart}, ${afterTrigger}`;
    }
    
    // Allow comprehensive prompts - Maya's styling intelligence needs space to work
    // Only trim if extremely long (over 1000 characters) to prevent API issues
    if (generatedPrompt.length > 1000) {
      const essentialParts = generatedPrompt.split(',').slice(0, 15).join(','); // Take more parts for detail
      generatedPrompt = essentialParts.endsWith(',') ? essentialParts.slice(0, -1) : essentialParts;
    }
    
    console.log(`🎯 MAYA AI PROMPT GENERATION SUCCESS for "${conceptName}":`, generatedPrompt.substring(0, 200) + '...');
    console.log(`🎯 MAYA AI PROMPT LENGTH: ${generatedPrompt.length} characters`);
    console.log(`🎯 MAYA PROMPT VALIDATION: Starts with trigger word: ${generatedPrompt.startsWith(triggerWord)}`);
    console.log(`🎯 MAYA PROMPT VALIDATION: Contains mandatory tech params: ${generatedPrompt.includes('raw photo, visible skin pores')}`);
    
    // FINAL VALIDATION: Ensure format is exactly correct
    if (!generatedPrompt.startsWith(`${triggerWord}, ${mandatoryTechParams}`)) {
      console.log(`🚨 MAYA PROMPT FIX: Correcting format to ensure trigger word + tech params first`);
      // Strip out any existing trigger word and tech params, then rebuild correctly
      let cleanContent = generatedPrompt;
      const triggerRegex = new RegExp(`^${triggerWord}[,\\s]*`, 'gi');
      cleanContent = cleanContent.replace(triggerRegex, '');
      const techParamsRegex = /raw photo,?\s*visible skin pores,?\s*film grain,?\s*unretouched natural skin texture,?\s*subsurface scattering,?\s*photographed on film,?\s*/gi;
      cleanContent = cleanContent.replace(techParamsRegex, '').replace(/^[,\s]+/, '').trim();
      
      generatedPrompt = `${triggerWord}, ${mandatoryTechParams}, ${cleanContent}`;
    }
    
    return generatedPrompt;
    
  } catch (error) {
    console.error('🚨 MAYA AI PROMPT GENERATION FAILED:', error);
    console.error('🚨 FALLING BACK TO EMERGENCY PROMPT - This should not happen!');
    
    // ZERO TOLERANCE ANTI-HARDCODE: Emergency fallback respects user's concept without forcing business style
    const mandatoryTechParamsFallback = "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";
    const fallbackPrompt = `${triggerWord}, ${mandatoryTechParamsFallback}, ${conceptName}, natural confident expression, beautiful lighting, personal branding photography`;
    console.log(`🚨 USING FALLBACK PROMPT (preserving user concept):`, fallbackPrompt);
    return fallbackPrompt;
  }
}

// 🔥 CRITICAL FIX: Chat History Loading with Image Persistence
router.get('/chats/:chatId/messages', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const chatId = parseInt(req.params.chatId);
    if (isNaN(chatId)) {
      return res.status(400).json({ error: 'Valid chat ID required' });
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