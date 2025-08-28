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

// UNIFIED MAYA ENDPOINT - Handles all Maya interactions with admin/member distinction
router.post('/chat', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { message, context = 'regular', chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Admin/Member context awareness
    const userType = req.userType || 'member';
    const conversationId = getConversationId(userId, req.isAdmin || false, chatId);
    
    console.log(`🎨 MAYA ${userType.toUpperCase()}: Processing ${context} message for ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);

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
      chatCategory: processedResponse.chatCategory
    });

  } catch (error) {
    console.error('Unified Maya error:', error);
    
    // CRITICAL: Always return proper JSON with Maya's warm personality
    return res.status(200).json({ 
      success: false,
      content: "Oh! I had a little hiccup there, but I'm still here to help you create amazing photos! Tell me what kind of shots you're dreaming of and I'll guide you through it step by step. What's your vision?",
      message: "Oh! I had a little hiccup there, but I'm still here to help you create amazing photos! Tell me what kind of shots you're dreaming of and I'll guide you through it step by step. What's your vision?",
      canGenerate: false,
      quickButtons: ["Professional headshots", "Creative lifestyle", "Business portraits", "Tell me what happened"],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Image generation through unified system
router.post('/generate', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    
    const userType = req.userType || 'member';
    console.log(`🖼️ MAYA ${userType.toUpperCase()}: Image generation request from ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);
    
    // Track generation activity with admin/member separation
    trackMayaActivity(userId, userType as 'admin' | 'member', `maya_${userType}_${userId}`, 'generation', {
      conceptName: req.body.conceptName || 'custom_generation',
      timestamp: new Date()
    });
    
    const { prompt, chatId, preset, seed, count } = req.body || {};
    if (!prompt) {
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
    
    // If this is a concept-based generation, enhance it with Maya's styling expertise
    if (prompt.includes('Create a professional photo concept:')) {
      const conceptName = prompt.replace('Create a professional photo concept: ', '').trim();
      console.log(`🎯 MAYA CONCEPT DETECTED: "${conceptName}" - Calling createDetailedPromptFromConcept with user context`);
      finalPrompt = await createDetailedPromptFromConcept(conceptName, generationInfo.triggerWord, userId);
      console.log(`✅ MAYA CONCEPT RESULT: Generated ${finalPrompt.length} character prompt`);
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
    
    return res.json({ 
      success: true,
      predictionId: result.predictionId
    });
  } catch (error: any) {
    console.error("Unified Maya generate error:", error);
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
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userType = req.userType || 'member';
    console.log(`📊 MAYA ${userType.toUpperCase()}: Status check from ${req.isAdmin ? 'admin' : 'member'} user ${userId}`);

    const userContext = await getUnifiedUserContext(userId);
    const generationInfo = await checkGenerationCapability(userId);
    
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
    res.status(200).json({ 
      success: false,
      error: 'Status check failed',
      message: "I'm having trouble checking your account status right now, but I'm still here to help! What would you like to create today?"
    });
  }
});

// 🎯 MAYA'S INTELLIGENT GENERATION STATUS POLLING
router.get('/check-generation/:predictionId', isAuthenticated, adminContextDetection, async (req: AdminContextRequest, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
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

    const Replicate = require('replicate');
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    
    const prediction = await replicate.predictions.get(predictionId);
    
    console.log(`📊 MAYA POLLING: Prediction status: ${prediction.status}`);
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output];
      console.log(`✅ MAYA GENERATION COMPLETE: ${imageUrls.length} images generated`);
      
      // 🔥 CRITICAL FIX: Save generated images to database for persistence
      if (chatId && messageId) {
        try {
          console.log(`💾 MAYA PERSISTENCE: Saving ${imageUrls.length} images to database`);
          
          // Find the latest Maya message in this chat that can generate
          const chatMessages = await storage.getMayaChatMessages(Number(chatId));
          const latestMayaMessage = chatMessages
            .filter(msg => msg.role === 'assistant' || msg.role === 'maya')
            .reverse()[0]; // Get the most recent Maya message
          
          if (latestMayaMessage) {
            await storage.updateMayaChatMessage(latestMayaMessage.id, {
              imagePreview: JSON.stringify(imageUrls) // Store as JSON string
            });
            console.log(`✅ MAYA PERSISTENCE: Images saved to message ${latestMayaMessage.id}`);
          }
        } catch (persistError) {
          console.error('Maya persistence error (non-blocking):', persistError);
          // Don't fail the request if persistence fails
        }
      }
      
      res.json({
        status: 'completed',
        imageUrls,
        message: `Maya created ${imageUrls.length} stunning photo${imageUrls.length > 1 ? 's' : ''} for you!`
      });
    } else if (prediction.status === 'failed') {
      console.error(`❌ MAYA GENERATION FAILED: ${prediction.error || 'Unknown error'}`);
      res.json({ 
        status: 'failed', 
        error: prediction.error || 'Generation failed',
        message: "Oh no! I hit a snag while creating those photos. Don't worry though - let me try a completely different approach! What specific style or vibe are you going for? I'll make sure we nail it this time!"
      });
    } else {
      // Still processing
      res.json({ 
        status: 'processing',
        message: "I'm working on your photos right now! This usually takes 30-60 seconds..."
      });
    }
    
  } catch (error: any) {
    console.error('Maya check generation error:', error);
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
  // 🚨 ZERO TOLERANCE ANTI-HARDCODE: Maya's personality file drives ALL guidance
  // Only provide essential context, let Maya's AI handle specific instructions
  
  let enhancement = `\n\n🎯 CURRENT CONTEXT: ${context}`;
  
  // Minimal admin/member distinction
  if (isAdmin) {
    enhancement += `\n💼 Platform owner context: SSELFIE Studio business strategy and development`;
  } else {
    enhancement += `\n✨ Member context: Personal branding transformation journey`;
  }

  // Generation capability awareness
  if (generationInfo.canGenerate) {
    enhancement += `\n⚡ Photo generation: READY! Trigger word: ${generationInfo.triggerWord}`;
  } else {
    enhancement += `\n📸 Photo status: Training needed first`;
  }

  // CRITICAL: Let Maya's complete personality file handle ALL specific guidance
  enhancement += `\n\n🎨 USE YOUR COMPLETE MAYA INTELLIGENCE:
Apply your full personality, expertise, and knowledge:
- Your complete 2025 luxury fashion trends and styling formulas
- Your professional background: fashion week, magazine covers, luxury concepts
- Your photography expertise: shot types, lighting, posing psychology
- Your natural communication style and warmth
- Your intelligent quick actions using QUICK_ACTIONS: format when helpful
- Your ability to guide users: they can choose your concepts OR describe custom requests

Be authentically Maya - no templates or constraints on your expertise!`;

  // Add user context if available
  if (userContext.onboarding?.stylePreferences) {
    enhancement += `\n\n🎨 User style preferences: ${userContext.onboarding.stylePreferences}`;
  }

  if (userContext.onboarding?.businessType) {
    enhancement += `\nUser business type: ${userContext.onboarding.businessType}`;
  }

  return baseMayaPersonality + enhancement;
}

async function processMayaResponse(response: string, context: string, userId: string, userContext: any, generationInfo: any) {
  let processed = {
    message: response,
    canGenerate: false,
    generatedPrompt: null,
    onboardingProgress: null,
    quickButtons: [],
    chatCategory: 'General Styling'
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

  // Handle onboarding progression
  if (context === 'onboarding') {
    // Detect if onboarding should complete
    if (response.toLowerCase().includes('complete') || response.toLowerCase().includes('ready to create')) {
      processed.onboardingProgress = {
        isComplete: true,
        currentStep: 6
      };
      // Only use fallback if Maya didn't provide her own quick actions
      if (processed.quickButtons.length === 0) {
        processed.quickButtons = ["Tell me more", "I'm ready", "What's next?"];
      }
    } else {
      // Only use templated buttons if Maya didn't generate her own
      if (processed.quickButtons.length === 0) {
        processed.quickButtons = getContextualQuickButtons(context, userContext.onboarding.currentStep);
      }
    }
  }
  
  // Set chat category based on content
  if (response.toLowerCase().includes('headshot')) processed.chatCategory = 'Professional Headshots';
  else if (response.toLowerCase().includes('social') || response.toLowerCase().includes('instagram')) processed.chatCategory = 'Social Media Photos';
  else if (response.toLowerCase().includes('website')) processed.chatCategory = 'Website Photos';
  else if (response.toLowerCase().includes('email') || response.toLowerCase().includes('newsletter')) processed.chatCategory = 'Email & Marketing Photos';
  else if (response.toLowerCase().includes('premium') || response.toLowerCase().includes('luxury')) processed.chatCategory = 'Premium Brand Photos';

  return processed;
}

function getContextualQuickButtons(context: string, step: number = 1): string[] {
  // 🚨 ZERO TOLERANCE ANTI-HARDCODE: Maya's AI should generate ALL quick actions
  // This minimal fallback should NEVER be used in production
  console.warn('🚨 WARNING: Using fallback quick buttons - Maya\'s AI should generate these');
  
  // Absolute minimal fallback - Maya's intelligence should provide context-aware options
  return ["Continue chat"];
}

async function saveUnifiedConversation(userId: string, userMessage: string, mayaResponse: any, chatId: number | null, context: string, userType: string = 'member', conversationId: string = ''): Promise<number> {
  try {
    let currentChatId = chatId;
    
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

SHOT TYPE VARIETY INTELLIGENCE:
• ALWAYS vary shot types intelligently: Close-up (face/shoulders focus), Half-body (waist up), Full scenery (full body with environment)
• Match styling complexity to shot type: close-ups emphasize face/hair/expression, full scenery includes environment and full outfit
• Consider the concept purpose: professional headshots work as close-ups, lifestyle concepts shine as half-body or full scenery
• Use your photography expertise to choose the most impactful shot type for each specific concept

CREATIVE VARIETY MANDATE:
- Every prompt should feel fresh and unique to the specific concept
- Avoid repeating the same color schemes, locations, or styling formulas
- Let the concept drive the creative direction, not predetermined templates
- Use your full professional expertise to create diverse, personalized styling
- Intelligently vary shot types based on what would work best for each concept

CREATE DETAILED PROMPT FOR: "${conceptName}" 
REQUIREMENTS:
1. ALWAYS start with "${triggerWord}" as first word
2. IMMEDIATELY follow with mandatory technical parameters: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
3. Apply your complete styling expertise (300-500 words) with CREATIVE VARIETY
4. Include: specific garments, colors, textures, hair, makeup, accessories, pose, lighting, setting
5. Use your professional fashion and photography knowledge extensively
6. CRITICAL: Choose appropriate shot type - Close-up (face/shoulders), Half-body (waist up), or Full scenery (full body with environment)
7. Match styling detail to shot type: close-ups focus on facial features/hair, full scenery includes complete environment
8. Return ONLY the prompt - no conversational text
9. CRITICAL: Make this concept feel unique - vary colors, locations, styling AND shot types based on the specific concept
10. Avoid repeating previous styling patterns - create fresh interpretations each time

MANDATORY FORMAT: "${triggerWord}, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [YOUR CREATIVE STYLING VISION WITH APPROPRIATE SHOT TYPE]"

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

SHOT TYPE INTELLIGENCE: Choose the most impactful shot type for this specific concept:
- Close-up (face/shoulders): Perfect for headshots, beauty focus, intimate portraits
- Half-body (waist up): Great for lifestyle, business casual, showing outfit details
- Full scenery (full body + environment): Ideal for lifestyle, environmental context, complete outfit showcase

Showcase your professional styling vision in 300-500 words after the mandatory technical parameters, including appropriate shot type selection.`
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
    console.error('🚨 ERROR - Maya\'s AI should handle all prompt generation');
    
    // ZERO TOLERANCE: No hardcoded templates allowed
    // Return minimal technical prompt that preserves trigger word format requirements
    const requiredTechParams = "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";
    const minimalPrompt = `${triggerWord}, ${requiredTechParams}, professional portrait`;
    console.log(`🚨 MINIMAL TECHNICAL PROMPT (NOT MAYA'S STYLING):`, minimalPrompt);
    return minimalPrompt;
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