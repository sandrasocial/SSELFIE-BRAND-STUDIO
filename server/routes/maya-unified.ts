/**
 * PHASE 2: UNIFIED MAYA ROUTE - Single Intelligent System
 * Uses PersonalityManager.getNaturalPrompt('maya') correctly
 * Context enhancement instead of different personalities
 * Single Claude call system handling all interactions
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { ModelTrainingService } from '../model-training-service';

const router = Router();

// UNIFIED MAYA ENDPOINT - Handles all Maya interactions
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { message, context = 'regular', chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log(`🎨 UNIFIED MAYA: Processing ${context} message for user ${userId}`);

    // Get unified user context
    const userContext = await getUnifiedUserContext(userId);
    
    // Check generation capability
    const generationInfo = await checkGenerationCapability(userId);
    
    // Build unified Maya prompt using PersonalityManager (the RIGHT way)
    const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
    const enhancedPrompt = enhancePromptForContext(
      baseMayaPersonality, 
      context, 
      userContext, 
      generationInfo
    );
    
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
    
    // Unified conversation storage
    const savedChatId = await saveUnifiedConversation(
      userId, 
      message, 
      processedResponse, 
      chatId, 
      context
    );
    
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
    
    // CRITICAL: Always return proper JSON, never HTML
    return res.status(200).json({ 
      success: false,
      content: "I'm having trouble right now, but let me help you anyway! What kind of photos would you like to create?",
      message: "I'm having trouble right now, but let me help you anyway! What kind of photos would you like to create?",
      canGenerate: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Image generation through unified system
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    
    const { prompt, chatId, preset, seed, count } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    
    const safeCount = Math.min(Math.max(parseInt(count ?? 2, 10) || 2, 1), 6);
    
    // Get user context for trigger word
    const generationInfo = await checkGenerationCapability(userId);
    let finalPrompt = prompt.trim();
    
    // If this is a concept-based generation, enhance it with Maya's styling expertise
    if (prompt.includes('Create a professional photo concept:')) {
      const conceptName = prompt.replace('Create a professional photo concept: ', '').trim();
      finalPrompt = await createDetailedPromptFromConcept(conceptName, generationInfo.triggerWord);
    }
    
    const result = await ModelTrainingService.generateUserImages(
      userId,
      finalPrompt,
      safeCount,
      { preset, seed }
    );
    
    return res.json({ predictionId: result.predictionId });
  } catch (error: any) {
    console.error("Unified Maya generate error:", error);
    return res.status(400).json({ error: error?.message || "Failed to start generation" });
  }
});

// Unified status endpoint
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

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
    res.status(500).json({ error: 'Failed to get Maya status' });
  }
});

// 🎯 MAYA'S INTELLIGENT GENERATION STATUS POLLING
router.get('/check-generation/:predictionId', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const predictionId = req.params.predictionId;
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
        message: "I encountered an issue creating your photos. Let's try again with a different approach!"
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
    res.status(500).json({ 
      error: 'Status check failed',
      message: "I'm having trouble checking on your photos right now. Let me try again!"
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

function enhancePromptForContext(baseMayaPersonality: string, context: string, userContext: any, generationInfo: any): string {
  let enhancement = `\n\n🎯 CURRENT INTERACTION CONTEXT:
- User: ${userContext.userInfo.email || 'Unknown'}
- Plan: ${userContext.userInfo.plan || 'Not specified'}
- Context: ${context}
- Can Generate Images: ${generationInfo.canGenerate ? 'YES' : 'NO - needs training first'}`;

  if (generationInfo.triggerWord) {
    enhancement += `\n- Trigger Word: ${generationInfo.triggerWord}`;
  }

  // Context-specific enhancements using Maya's personality
  switch (context) {
    case 'onboarding':
      enhancement += `\n\n📋 ONBOARDING MODE:
You're guiding this user through personal brand discovery. Use your styling expertise to help them understand their style preferences and photo needs.

ONBOARDING CATEGORIES (use these exact names):
1. "Professional Headshots" - LinkedIn and business credibility
2. "Social Media Photos" - Instagram, TikTok, and daily content  
3. "Website Photos" - Homepage and brand storytelling
4. "Email & Marketing Photos" - Newsletters and personal connection
5. "Premium Brand Photos" - High-end collaborations and partnerships

Focus on understanding their business needs and connecting photos to practical applications.`;
      break;
      
    case 'generation':
      enhancement += `\n\n📸 GENERATION MODE:
The user wants to create photos. Use your complete styling expertise to create detailed prompts that include their trigger word "${generationInfo.triggerWord}".

CRITICAL INSTRUCTION FOR GENERATION RESPONSES:
- Always include detailed prompts in this format: **🎯 CONCEPT NAME**
- Follow with a complete, detailed prompt using "${generationInfo.triggerWord}"
- Include specific styling details: clothing, hair, makeup, lighting, setting
- Apply your professional knowledge: 2025 luxury trends, editorial formulas, photography techniques
- Be excited and enthusiastic about the concepts you're creating

Example format:
**🎯 EXECUTIVE POWER LOOK - OPTION 1: Modern Authority**
A cinematic portrait of ${generationInfo.triggerWord} as a confident executive, wearing an impeccably tailored charcoal grey blazer...`;
      break;

    case 'quickstart':
      enhancement += `\n\n⚡ QUICK START MODE:
The user chose Quick Start and wants to create photos immediately. Use your styling expertise to create compelling photo concepts.

CRITICAL INSTRUCTIONS:
- Generate 2-3 photo concepts based on your fashion expertise and styling knowledge
- Create short, simple concept names or descriptions that capture the styling essence
- Use emojis naturally in your creative concept names to make them feel warm and exciting
- Use this EXACT format: QUICK_ACTIONS: [Your Creative Concept Name], [Your Creative Concept Name], Show more concepts
- NEVER show technical prompt details with "${generationInfo.triggerWord}" in chat
- Be warm, excited, and use your natural styling voice
- Each concept should reflect your genuine styling recommendations based on current trends and your expertise

When they click generation buttons, the system will automatically create the detailed prompts using "${generationInfo.triggerWord}".`;
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

🎯 INTELLIGENT QUICK ACTIONS:
When appropriate, provide 2-4 contextual quick action options at the end of your response using this format:
QUICK_ACTIONS: Action 1, Action 2, Action 3

Make these actions:
- Specific to the conversation context
- Natural follow-ups to your response  
- Personalized based on what they've shared
- Written in a conversational way, not templated

Example: If discussing professional headshots, instead of generic "BUILDING CONFIDENCE", use specific actions like "Show me CEO headshot examples", "I need approachable authority", "Something for my consulting business"`;

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
    
    if (extractedPrompt) {
      processed.generatedPrompt = extractedPrompt;
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

async function saveUnifiedConversation(userId: string, userMessage: string, mayaResponse: any, chatId: number | null, context: string): Promise<number> {
  try {
    let currentChatId = chatId;
    
    // Create new chat if needed
    if (!currentChatId) {
      const chatTitle = context === 'onboarding' ? 'Personal Brand Discovery' : `${mayaResponse.chatCategory} Session`;
      const chatSummary = `${context}: ${userMessage.substring(0, 100)}...`;
      
      const newChat = await storage.createMayaChat({
        userId,
        chatTitle,
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

// Helper function to create detailed prompts from Maya's AI-generated concept names
async function createDetailedPromptFromConcept(conceptName: string, triggerWord: string): Promise<string> {
  // Maya generates concept names using her AI intelligence and styling expertise
  // Instead of hardcoded mapping, we analyze the concept name to create appropriate prompts
  
  const lowerName = conceptName.toLowerCase();
  
  // Professional/Business concepts
  if (lowerName.includes('boss') || lowerName.includes('ceo') || lowerName.includes('executive') || lowerName.includes('professional')) {
    return `Professional portrait of ${triggerWord} in a chic blazer and silk camisole, standing confidently against a minimalist white wall, arms crossed with a warm smile, hair perfectly styled, subtle but polished makeup, soft studio lighting creating gentle shadows, shot from a slight low angle for empowerment, luxury fashion photography aesthetic`;
  }
  
  // LinkedIn/Corporate concepts  
  if (lowerName.includes('linkedin') || lowerName.includes('corporate') || lowerName.includes('business')) {
    return `Executive portrait of ${triggerWord} in a navy blazer and white blouse, sitting at a polished conference table, warm professional smile, hair styled in a sleek bob, minimal but sophisticated makeup, soft office lighting, shot against a blurred modern office background, professional headshot photography style`;
  }
  
  // Lifestyle/Casual concepts
  if (lowerName.includes('lifestyle') || lowerName.includes('casual') || lowerName.includes('coffee') || lowerName.includes('chic')) {
    return `Stylish woman ${triggerWord} sitting at a marble coffee table in a bright, modern café, wearing a cream cashmere sweater and gold jewelry, natural makeup with glowing skin, long hair styled in loose waves, holding a latte with beautiful foam art, soft natural lighting streaming through large windows, shot with a 50mm lens for that perfect shallow depth of field, editorial photography style`;
  }
  
  // Social Media concepts
  if (lowerName.includes('social') || lowerName.includes('instagram') || lowerName.includes('influencer') || lowerName.includes('content')) {
    return `${triggerWord} in trendy casual wear, sitting on a velvet couch with perfect lighting, effortless waves in hair, natural glowing makeup, holding a phone in a candid moment, soft natural light creating that perfect Instagram glow, shot with portrait lens for social media perfection, lifestyle influencer aesthetic`;
  }
  
  // Website/Brand concepts
  if (lowerName.includes('website') || lowerName.includes('brand') || lowerName.includes('hero')) {
    return `Professional business portrait of ${triggerWord} in elegant attire, standing in a modern office space with floor-to-ceiling windows, confident posture with hands on hips, sophisticated styling with tailored jacket, natural lighting creating soft shadows, shot with 85mm lens for professional headshot quality, luxury corporate photography aesthetic`;
  }
  
  // Creative/Editorial concepts
  if (lowerName.includes('editorial') || lowerName.includes('creative') || lowerName.includes('artistic') || lowerName.includes('goddess')) {
    return `${triggerWord} in a flowing midi dress, sitting on a velvet accent chair in a beautifully styled living room with plants and books, natural sunlight creating a warm glow, relaxed but polished styling, candid laugh captured mid-moment, cozy yet sophisticated atmosphere, lifestyle photography with rich colors and textures`;
  }
  
  // Default: Professional portrait with Maya's styling expertise
  return `Professional portrait of ${triggerWord} in elegant styling, sophisticated lighting, editorial photography quality, styled with Maya's fashion expertise and attention to luxury details`;
}

export default router;