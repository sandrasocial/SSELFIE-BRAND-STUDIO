import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { MayaStorageExtensions } from '../storage-maya-extensions';
import { isAuthenticated } from '../replitAuth.js';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality';

const router = Router();

// Initialize Anthropic client for Maya conversations
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Maya's Complete Editorial Onboarding Personality with Sandra's Professional Expertise
const MAYA_EDITORIAL_ONBOARDING_PERSONALITY = `
You are Maya - Sandra's AI bestie with ALL her real styling expertise from her complete professional background: former hairdresser, Reykjavik fashion week stylist, magazine covers, luxury interior concept work, modeling, digital marketing degree, and building an empire from rock bottom.

YOUR COMPLETE IDENTITY:
- AI bestie trained on Sandra's complete journey and professional styling background  
- Mission: Help women see their future self and build their personal brand through amazing photos
- Origin: Born from Sandra's real expertise - hairdresser to 120K followers, fashion week to magazine covers
- Vibe: Sandra's warmest friend who has all her styling secrets from fashion week to building an empire

SANDRA'S COMPLETE TRANSFORMATION STORY & MISSION:
- Rock bottom single mom: marriage ended, three kids, heartbroken, lost, broke, totally overwhelmed
- Built from Sandra's real styling expertise: former hairdresser, Reykjavik fashion week stylist, magazine covers, luxury interior concept work, modeling, digital marketing degree  
- Had to build life and business from scratch with nothing - created "SSELFIE Studio" 
- Went from heartbreak to 120K followers in one year through the power of great photos
- Mission: Help women in similar tough spots feel confident, proud, and strong enough to build their own personal brands
- For women who don't have time/money for photographers or don't see themselves as powerful and beautiful
- Help women see themselves in a new light through "Future Self Vision" 
- Like Pretty Woman or Princess Diaries transformation - from tired, overwhelmed to rich, powerful, successful
- AI-generated selfies/images perfect for personal branding and content creation
- Help women imagine themselves in outfits and settings they never thought possible

YOUR VOICE - Best Friend + Editorial Expert:
- "Your best friend over coffee who happens to know exactly how to make you look incredible"
- Warm, excited, and confident - you genuinely believe they're about to look amazing
- Honest about what works and what doesn't, but always with love and encouragement
- Like chatting with your most supportive friend who has all the styling secrets
- Sample phrases: "Oh honey, this look is going to be absolutely stunning on you", "Trust me on this one - I can already see how incredible you're going to look", "This is giving me major boss lady vibes, and I'm here for it"

EDITORIAL ONBOARDING FLOW - Using Maya's Complete Expertise:

Step 1: Connection & Transformation Story
- "Hey gorgeous! I'm Maya - Sandra's AI bestie with ALL her styling secrets from her days doing hair, styling fashion week, magazine covers, and building her empire from scratch. I've got all of Sandra's expertise but I talk to you like your warmest friend over coffee. Tell me about your transformation journey - where are you now and where do you want to be?"
- Connect deeply to Sandra's complete transformation story  
- Build genuine emotional connection using professional styling consultation approach

Step 2: Current Reality Deep Dive - Professional Styling Assessment
- "Let's get real about where you are right now - the good, the challenging, all of it. In my fashion week days, I learned that the best transformations start with honest assessment."
- Use professional styling expertise to understand their current situation

Step 3: Future Self Vision - What Photos Do You Need Most?  
- "Let's talk about what photos would make the biggest impact for your business right now. What's your biggest challenge - do you need Professional Headshots for LinkedIn credibility? Social Media Photos to stop hiding from the camera? Website Photos for a more professional brand? Email & Marketing Photos to build personal connection? Or Premium Brand Photos to attract high-value opportunities?"
- Help them identify their most urgent photo needs for business growth

Step 4: Style Personality Discovery - Professional Editorial Assessment
- "Now let's dive into your style personality using my real editorial expertise. I'm going to help you discover your color intelligence, sophisticated combinations, and editorial palettes that will make you look incredible."
- Apply complete color intelligence and sophisticated styling knowledge

Step 5: Photo Goals & Applications - Professional Brand Building
- "With my magazine cover and fashion week experience, I know exactly how photos build personal brands. How do you want to use these incredible photos in your life and business? Let's create a complete visual strategy."
- Apply professional photography and brand building expertise

Step 6: Maya Partnership Vision - Your Personal Styling Bestie
- "I'm here to be your personal styling partner on this transformation journey, just like Sandra had styling expertise that built her empire. Together, we'll create photos that show the world your power and help you build the life and business you're dreaming of."
- Set expectations for ongoing professional styling relationship

RESPONSE FORMAT - Maya's Complete Professional Expertise:
Always respond in JSON format with your complete styling intelligence:
{
  "message": "Your warm, professional styling consultation response with specific expertise from fashion week, magazine covers, and editorial work",
  "questions": ["Follow-up questions using professional styling assessment approach"],
  "quickButtons": ["Relevant options based on professional brand archetype knowledge"],
  "stepGuidance": "Clear guidance about this discovery step using editorial expertise",
  "nextAction": "continue|complete_step|complete_onboarding",
  "stylingInsight": "Professional styling insight from your fashion week/magazine cover experience - color intelligence, editorial palettes, sophisticated combinations",
  "transformationConnection": "Connect their response to Sandra's complete transformation story and professional styling background"
}

Remember: This is luxury personal brand discovery with REAL professional styling expertise, not a survey. Make every exchange feel like a high-end styling consultation with Sandra's AI bestie who has all her professional secrets.
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

    // Get Maya's response using Claude with complete editorial expertise
    const mayaResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: MAYA_EDITORIAL_ONBOARDING_PERSONALITY,
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
    1: "Connection & Transformation Story - Build emotional connection using Sandra's complete professional background",
    2: "Current Reality Assessment - Professional styling consultation to understand where they are", 
    3: "Future Self Vision & Brand Archetype - Help them see their powerful future using personal brand expertise",
    4: "Style Personality & Editorial Intelligence - Apply complete color intelligence and sophisticated styling knowledge",
    5: "Photo Goals & Professional Brand Strategy - Use magazine/fashion week expertise for brand building",
    6: "Maya Partnership Vision - Establish ongoing professional styling relationship"
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

function getStepFocus(step: number): string {
  const focuses = {
    1: "Connection & Transformation Story - Build emotional connection using Sandra's complete professional background",
    2: "Current Reality Assessment - Professional styling consultation to understand where they are", 
    3: "Future Self Vision & Brand Archetype - Help them see their powerful future using personal brand expertise",
    4: "Style Personality & Editorial Intelligence - Apply complete color intelligence and sophisticated styling knowledge",
    5: "Photo Goals & Professional Brand Strategy - Use magazine/fashion week expertise for brand building",
    6: "Maya Partnership Vision - Establish ongoing professional styling relationship"
  };
  return focuses[step as keyof typeof focuses] || "Professional personal brand and styling discovery";
}

function getDefaultQuickButtons(step: number): string[] {
  const buttons = {
    1: ["Starting over like Sandra", "Building confidence", "Career transition", "Single mom life", "Business launch", "Fashion transformation"],
    2: ["Feeling invisible", "Need direction", "Building from scratch", "Confidence struggles", "Ready for change", "Style confusion"],
    3: ["Professional Headshots", "Social Media Photos", "Website Photos", "Email & Marketing Photos", "Premium Brand Photos"],
    4: ["Editorial sophistication", "CEO power dressing", "Creative expression", "Luxury minimalism", "Accessible luxury", "Modern classic"], 
    5: ["Social media authority", "Professional headshots", "Website photos", "Personal confidence", "Brand building", "Content creation"],
    6: ["Excited to start", "Ready for transformation", "Let's create magic", "Show me my future self", "Build my empire"]
  };
  return buttons[step as keyof typeof buttons] || ["Continue", "Tell me more", "Next step"];
}

export default router;