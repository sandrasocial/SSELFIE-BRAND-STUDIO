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
      message: processedResponse.message,
      mode: context,
      canGenerate: processedResponse.canGenerate,
      generatedPrompt: processedResponse.generatedPrompt,
      onboardingProgress: processedResponse.onboardingProgress,
      chatId: savedChatId,
      quickButtons: processedResponse.quickButtons,
      chatCategory: processedResponse.chatCategory
    });

  } catch (error) {
    console.error('Unified Maya error:', error);
    res.status(500).json({ 
      error: 'Failed to process Maya request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

Apply your professional styling knowledge:
- Current 2025 luxury trends
- Editorial styling formulas  
- Professional photography techniques
- Color intelligence and sophisticated combinations
- Hair & makeup expertise from your fashion week background`;
      break;

    case 'quickstart':
      enhancement += `\n\n⚡ QUICK START MODE:
The user chose Quick Start and wants to create photos immediately. Provide photo concept descriptions for them to choose from, NOT full prompts.

CRITICAL INSTRUCTIONS:
- Offer 2-3 styled photo concepts with friendly descriptions
- Use this EXACT format for generation buttons: QUICK_ACTIONS: Generate [Concept Name], Generate [Concept Name], Show more options
- NEVER show the full prompt text with "${generationInfo.triggerWord}" in chat - keep that hidden
- Be warm, excited, and confident about the concepts
- Focus on describing the visual style and mood, not technical prompt details

EXAMPLE RESPONSE FORMAT:
"I'm so excited to create stunning photos for you! Here are some amazing concepts:

**Concept 1: Professional Confidence**
[Beautiful description of the styling and mood]

**Concept 2: Social Media Ready** 
[Beautiful description of the styling and mood]

QUICK_ACTIONS: Generate Professional Confidence, Generate Social Media Ready, Show more concepts"

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
    response.includes('```prompt')
  )) {
    processed.canGenerate = true;

    // Extract prompt if provided
    const promptMatch = response.match(/```prompt\s*([\s\S]*?)\s*```/);
    if (promptMatch) {
      processed.generatedPrompt = promptMatch[1].trim();
      // Remove prompt block from conversation response
      processed.message = processed.message.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
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

// Helper function to create detailed prompts from concept names
async function createDetailedPromptFromConcept(conceptName: string, triggerWord: string): Promise<string> {
  const conceptMap: { [key: string]: string } = {
    'Professional Confidence': `Professional portrait of ${triggerWord} in a chic blazer and silk camisole, standing confidently against a minimalist white wall, arms crossed with a warm smile, hair perfectly styled, subtle but polished makeup, soft studio lighting creating gentle shadows, shot from a slight low angle for empowerment, luxury fashion photography aesthetic`,
    
    'Social Media Ready': `Stylish woman ${triggerWord} sitting at a marble coffee table in a bright, modern café, wearing a cream cashmere sweater and gold jewelry, natural makeup with glowing skin, long hair styled in loose waves, holding a latte with beautiful foam art, soft natural lighting streaming through large windows, shot with a 50mm lens for that perfect shallow depth of field, editorial photography style`,
    
    'Lifestyle Guru Energy': `${triggerWord} in a flowing midi dress, sitting on a velvet accent chair in a beautifully styled living room with plants and books, natural sunlight creating a warm glow, relaxed but polished styling, candid laugh captured mid-moment, cozy yet sophisticated atmosphere, lifestyle photography with rich colors and textures`,
    
    'Website Hero Image': `Professional business portrait of ${triggerWord} in elegant attire, standing in a modern office space with floor-to-ceiling windows, confident posture with hands on hips, sophisticated styling with tailored jacket, natural lighting creating soft shadows, shot with 85mm lens for professional headshot quality, luxury corporate photography aesthetic`,
    
    'LinkedIn Authority Photo': `Executive portrait of ${triggerWord} in a navy blazer and white blouse, sitting at a polished conference table, warm professional smile, hair styled in a sleek bob, minimal but sophisticated makeup, soft office lighting, shot against a blurred modern office background, professional headshot photography style`,
  };
  
  // Return specific prompt if concept matches, otherwise create a general professional prompt
  return conceptMap[conceptName] || `Professional portrait of ${triggerWord} in elegant styling, sophisticated lighting, editorial photography quality`;
}

export default router;