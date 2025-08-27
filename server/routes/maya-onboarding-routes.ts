import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { MayaStorageExtensions } from '../storage-maya-extensions';
import { isAuthenticated } from '../replitAuth.js';

const router = Router();

// Initialize Anthropic client for Maya conversations
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Maya's Member-Facing Personality for Onboarding
const MAYA_ONBOARDING_PERSONALITY = `
You are Maya, a warm, encouraging personal brand stylist who helps women discover and express their most confident, authentic selves.

CORE IDENTITY:
- Personal Brand Expert & Transformation Guide
- Warm, supportive friend who truly listens
- Celebrates every woman's unique journey and vision
- Helps women see their powerful future selves

YOUR MISSION:
Guide women through discovering their personal brand story and style vision through engaging, supportive conversation. You're helping them move from where they are now to where they dream of being.

CONVERSATION STYLE:
- Warm and encouraging, like talking to your most supportive friend
- Ask thoughtful follow-up questions to go deeper
- Celebrate their dreams and validate their experiences
- Use "we" language - you're in this together
- Reference their specific details to show you're truly listening

ONBOARDING FLOW:
1. WELCOME & STORY - Get to know their transformation journey
2. CURRENT SITUATION - Understand where they are today
3. FUTURE VISION - Explore their dreams and goals
4. BUSINESS CONTEXT - Understand their professional world
5. STYLE DISCOVERY - Explore their visual preferences
6. PHOTO GOALS - Understand how they want to use their images

RESPONSE FORMAT:
Always respond with JSON containing:
{
  "message": "Your warm, encouraging message to the user",
  "questions": ["Follow-up question 1", "Follow-up question 2"],
  "step_guidance": "Brief guidance about this onboarding step",
  "next_action": "continue" or "complete_step"
}

Remember: You're helping each woman see herself as the confident, successful woman she's becoming. Every conversation should leave her feeling more empowered and excited about her journey.
`;

// Validation schemas
const onboardingMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  step: z.number().int().min(1).max(6).optional().default(1),
});

const updateProfileSchema = z.object({
  step: z.number().int().min(1).max(6),
  data: z.record(z.any()), // Flexible data structure for different steps
});

// Maya Onboarding Conversation Handler
router.post('/conversation', isAuthenticated, async (req, res) => {
  try {
    const { message, step } = onboardingMessageSchema.parse(req.body);
    const userId = (req.user as any)?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get current user context for Maya
    const userContext = await MayaStorageExtensions.getMayaUserContext(userId);
    
    // Build context-aware prompt for Maya
    const contextualPrompt = buildMayaPrompt(message, step, userContext);

    // Get Maya's response using Claude
    const mayaResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: MAYA_ONBOARDING_PERSONALITY,
      messages: [
        {
          role: "user", 
          content: contextualPrompt
        }
      ],
    });

    // Parse Maya's response
    let parsedResponse;
    const responseText = mayaResponse.content[0].type === 'text' ? mayaResponse.content[0].text : '';
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        message: responseText,
        questions: [],
        step_guidance: "Continue sharing - I'm here to listen and guide you.",
        next_action: "continue"
      };
    }

    // Update Maya's memory with this conversation
    await updateMayaMemory(userId, message, parsedResponse, step);
    
    // Save onboarding data to database
    const stepData = extractStepData(message, step);
    await MayaStorageExtensions.saveOnboardingData(userId, stepData, step);

    res.json({
      success: true,
      maya_response: parsedResponse,
      current_step: step,
      context: userContext ? {
        onboarding_progress: userContext.personalBrand?.onboardingStep || 1,
        is_completed: userContext.personalBrand?.isCompleted || false
      } : null
    });

  } catch (error) {
    console.error('Maya onboarding conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to process conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update User Profile Data
router.post('/update-profile', isAuthenticated, async (req, res) => {
  try {
    const { step, data } = updateProfileSchema.parse(req.body);
    const userId = (req.user as any)?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update profile based on current step
    let updateResult;
    
    switch (step) {
      case 1:
      case 2:
      case 3:
      case 4:
        // Steps 1-4: Update personal brand data
        updateResult = await MayaStorageExtensions.saveUserPersonalBrand({
          userId,
          ...data,
          onboardingStep: step,
          updatedAt: new Date()
        });
        break;
        
      case 5:
        // Step 5: Update style profile
        updateResult = await MayaStorageExtensions.saveUserStyleProfile({
          userId,
          ...data,
          updatedAt: new Date()
        });
        // Also update personal brand step
        await MayaStorageExtensions.saveUserPersonalBrand({
          userId,
          onboardingStep: step,
          updatedAt: new Date()
        });
        break;
        
      case 6:
        // Step 6: Final updates and completion
        updateResult = await MayaStorageExtensions.saveUserPersonalBrand({
          userId,
          ...data,
          onboardingStep: step,
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid step number' });
    }

    // Get updated context
    const updatedContext = await MayaStorageExtensions.getMayaUserContext(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      step: step,
      progress: calculateProgress(updatedContext),
      is_completed: step === 6,
      context: updatedContext
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test route without auth first
router.get('/test', async (req, res) => {
  res.json({ message: 'Maya onboarding routes are working!' });
});

// Get Current Onboarding Status
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    console.log('🔍 Maya Onboarding Status - Debug Info:', {
      user: req.user ? 'Present' : 'Missing',
      userClaims: (req.user as any)?.claims ? 'Present' : 'Missing',
      isAuthenticated: (req as any).isAuthenticated ? (req as any).isAuthenticated() : 'Method missing',
      sessionId: (req as any).session?.id || 'No session'
    });

    const userId = (req.user as any)?.claims?.sub;

    if (!userId) {
      console.error('❌ Maya Onboarding Status: No userId found', {
        hasUser: !!req.user,
        claims: (req.user as any)?.claims
      });
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log(`✅ Maya Onboarding Status: Processing for user ${userId}`);

    const userContext = await MayaStorageExtensions.getMayaUserContext(userId);
    const progress = calculateProgress(userContext);

    res.json({
      success: true,
      status: {
        current_step: userContext?.personalBrand?.onboardingStep || 1,
        is_completed: userContext?.personalBrand?.isCompleted || false,
        completed_at: userContext?.personalBrand?.completedAt,
        progress_percentage: progress,
        has_started: !!userContext?.personalBrand
      },
      context: userContext
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get onboarding status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper Functions



async function updateMayaMemory(userId: string, userMessage: string, mayaResponse: any, step: number) {
  try {
    // Get current Maya memory or create new
    let memory = await MayaStorageExtensions.getMayaPersonalMemory(userId);
    
    if (!memory) {
      memory = await MayaStorageExtensions.saveMayaPersonalMemory({
        userId,
        personalInsights: {
          coreMotivations: [],
          transformationJourney: '',
          strengthsIdentified: [],
          growthAreas: [],
          personalityNotes: '',
          communicationStyle: ''
        },
        ongoingGoals: {
          shortTermGoals: [],
          longTermVision: [],
          milestonesToCelebrate: [],
          challengesToSupport: []
        },
        preferredTopics: [],
        conversationStyle: {
          energyLevel: '',
          supportType: '',
          communicationTone: '',
          motivationApproach: ''
        },
        personalizedStylingNotes: '',
        successfulPromptPatterns: [],
        userFeedbackPatterns: {
          lovedElements: [],
          dislikedElements: [],
          requestPatterns: []
        }
      });
    }

    // Extract insights from the conversation
    const insights = {
      user_message: userMessage,
      maya_response: mayaResponse.message,
      step: step,
      timestamp: new Date().toISOString(),
      key_topics: extractKeyTopics(userMessage),
      emotional_tone: assessEmotionalTone(userMessage)
    };

    // Update memory with new insights
    const updatedMemory = {
      ...memory,
      preferredTopics: [...(memory.preferredTopics || []), ...insights.key_topics],
      lastMemoryUpdate: new Date(),
      memoryVersion: (memory.memoryVersion || 1) + 1
    };

    await MayaStorageExtensions.saveMayaPersonalMemory(updatedMemory);
  } catch (error) {
    console.error('Memory update error:', error);
    // Don't fail the main request if memory update fails
  }
}

function extractStepData(message: string, step: number): any {
  // Extract meaningful data from user message based on step
  const stepData: any = {};
  
  switch (step) {
    case 1:
      stepData.brandStory = message;
      stepData.personalMission = message;
      break;
    case 2:
      stepData.businessGoals = message;
      stepData.targetAudience = message;
      break;
    case 3:
      stepData.brandVoice = message;
      stepData.stylePreferences = message;
      break;
    case 4:
    case 5:
    case 6:
      // Later steps can be handled with specific extraction logic
      break;
  }
  
  return stepData;
}

function buildMayaPrompt(userMessage: string, step: number, userContext: any): string {
  let prompt = `User is in onboarding step ${step}/6.\n\n`;
  
  // Add context if available
  if (userContext?.personalBrand) {
    prompt += `CONTEXT ABOUT USER:\n`;
    if (userContext.personalBrand.transformation_story) {
      prompt += `- Transformation Story: ${userContext.personalBrand.transformation_story}\n`;
    }
    if (userContext.personalBrand.current_situation) {
      prompt += `- Current Situation: ${userContext.personalBrand.current_situation}\n`;
    }
    if (userContext.personalBrand.future_vision) {
      prompt += `- Future Vision: ${userContext.personalBrand.future_vision}\n`;
    }
    if (userContext.personalBrand.business_goals) {
      prompt += `- Business Goals: ${userContext.personalBrand.business_goals}\n`;
    }
    prompt += `\n`;
  }

  const stepGuidance = {
    1: "WELCOME & STORY: Get to know their transformation journey. What brought them here? What's their story?",
    2: "CURRENT SITUATION: Understand where they are today. What challenges are they facing? What's working?", 
    3: "FUTURE VISION: Explore their dreams and goals. Who do they want to become? What's their vision?",
    4: "BUSINESS CONTEXT: Understand their professional world. What do they do? Who do they serve?",
    5: "STYLE DISCOVERY: Explore their visual preferences. What styles speak to them? What's their vibe?",
    6: "PHOTO GOALS: Understand how they want to use their images. What's the purpose? How will this help them?"
  };

  prompt += `STEP ${step} FOCUS: ${stepGuidance[step] || 'Continue the conversation naturally.'}\n\n`;
  prompt += `USER MESSAGE: "${userMessage}"\n\n`;
  prompt += `Respond with encouraging guidance, thoughtful follow-up questions, and help them go deeper into this step of their journey.`;

  return prompt;
}

function extractKeyTopics(message: string): string[] {
  const topics = [];
  const keywords = message.toLowerCase();
  
  if (keywords.includes('business') || keywords.includes('entrepreneur')) topics.push('business');
  if (keywords.includes('family') || keywords.includes('mom') || keywords.includes('mother')) topics.push('family');
  if (keywords.includes('confidence') || keywords.includes('confident')) topics.push('confidence');
  if (keywords.includes('style') || keywords.includes('fashion')) topics.push('style');
  if (keywords.includes('professional') || keywords.includes('work')) topics.push('professional');
  if (keywords.includes('dream') || keywords.includes('goal')) topics.push('goals');
  
  return topics;
}

function assessEmotionalTone(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('excited') || msg.includes('amazing') || msg.includes('love')) return 'positive';
  if (msg.includes('scared') || msg.includes('worried') || msg.includes('difficult')) return 'concerned';
  if (msg.includes('determined') || msg.includes('ready') || msg.includes('committed')) return 'motivated';
  
  return 'neutral';
}

function calculateProgress(userContext: any): number {
  if (!userContext?.personalBrand) return 0;
  
  const pb = userContext.personalBrand;
  let progress = 0;
  
  if (pb.transformationStory) progress += 15;
  if (pb.currentSituation) progress += 15;
  if (pb.futureVision) progress += 15;
  if (pb.businessGoals) progress += 15;
  if (userContext.styleProfile) progress += 20;
  if (pb.isCompleted) progress += 20;
  
  return Math.min(progress, 100);
}

export default router;