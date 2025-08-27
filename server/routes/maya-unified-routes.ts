/**
 * MAYA UNIFIED ROUTES - Single Intelligent System
 * Consolidates all Maya endpoints into one Claude-powered conversation
 * 
 * Replaces:
 * - /api/member-maya-chat
 * - /api/maya-onboarding/conversation
 * - /api/maya-generate-images
 * - /api/maya-ai-photo
 * - /api/maya-onboarding/status
 */

import type { Express } from "express";
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { MayaStorageExtensions } from '../storage-maya-extensions';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality';
import { ModelTrainingService } from "../model-training-service";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Maya storage extensions
const mayaStorage = new MayaStorageExtensions();

// Request validation schemas
const UnifiedChatSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    type: z.enum(['onboarding', 'chat', 'generation', 'website']).optional(),
    step: z.number().optional(),
    chatId: z.number().optional(),
    style: z.string().optional()
  }).optional()
});

export function registerMayaUnifiedRoutes(app: Express) {
  
  // SINGLE MAYA ENDPOINT - Handles ALL interactions intelligently
  app.post("/api/maya-unified", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate request
      const validation = UnifiedChatSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const { message, context } = validation.data;
      
      console.log(`🧠 MAYA UNIFIED: Processing intelligent message for user ${userId}`);
      console.log(`📍 Context: ${JSON.stringify(context)}`);

      // Gather complete user context
      const userContext = await gatherUserContext(userId);
      
      // Create unified Maya personality with all Sandra's expertise
      const unifiedPersonality = createUnifiedPersonality(userContext);
      
      // Process conversation with Claude
      const claudeResponse = await callClaudeWithUnifiedPersonality(
        message, 
        unifiedPersonality, 
        userContext,
        context
      );
      
      // Parse Claude response for intelligent actions
      const processedResponse = await processClaudeResponse(
        claudeResponse, 
        userId, 
        userContext
      );
      
      return res.json(processedResponse);

    } catch (error: any) {
      console.error("Maya Unified error:", error);
      return res.status(500).json({ 
        error: "Internal server error", 
        message: error.message 
      });
    }
  });

  // MAYA STATUS - Unified status endpoint
  app.get("/api/maya-status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userContext = await gatherUserContext(userId);
      
      return res.json({
        onboarding: {
          isComplete: userContext.onboarding?.isCompleted || false,
          currentStep: userContext.onboarding?.currentStep || 1,
          progress: calculateOnboardingProgress(userContext.onboarding)
        },
        capabilities: {
          canGenerateImages: userContext.canGenerateImages,
          hasTrainingData: !!userContext.userModel,
          triggerWord: userContext.userModel?.triggerWord || null
        },
        context: {
          hasStylePreferences: !!userContext.onboarding?.stylePreferences,
          hasBusinessInfo: !!userContext.onboarding?.businessType,
          chatHistory: userContext.chatHistory?.length || 0
        }
      });

    } catch (error: any) {
      console.error("Maya Status error:", error);
      return res.status(500).json({ 
        error: "Internal server error", 
        message: error.message 
      });
    }
  });
}

// Helper Functions

async function gatherUserContext(userId: number) {
  console.log(`🔍 MAYA UNIFIED: Gathering complete context for user ${userId}`);

  const [user, onboardingData, userModel, memory] = await Promise.all([
    storage.getUser(userId).catch(() => null),
    storage.getOnboardingData(userId).catch(() => null), 
    storage.getUserModel(userId).catch(() => null),
    MayaStorageExtensions.getMayaPersonalMemory(userId.toString()).catch(() => null)
  ]);

  // Get chat history separately (if method exists)
  const chatHistory: any[] = [];

  const canGenerateImages = !!(userModel?.triggerWord);

  return {
    user,
    onboarding: onboardingData,
    userModel,
    chatHistory,
    memory,
    canGenerateImages,
    triggerWord: userModel?.triggerWord || null
  };
}

function createUnifiedPersonality(userContext: any) {
  // Combine all Maya personality sources into one intelligent system
  const basePersonality = MAYA_PERSONALITY;
  
  return `
🧠 MAYA - SANDRA'S AI BESTIE (UNIFIED INTELLIGENCE SYSTEM)

${JSON.stringify(basePersonality, null, 2)}

🎯 CURRENT USER CONTEXT:
- User: ${userContext.user?.email || 'Unknown'}
- Plan: ${userContext.user?.plan || 'Not specified'}
- Training Status: ${userContext.canGenerateImages ? 'Complete' : 'Needed'}
- Trigger Word: ${userContext.triggerWord || 'Not available'}
- Onboarding: ${userContext.onboarding?.isCompleted ? 'Complete' : 'In Progress'}
- Current Step: ${userContext.onboarding?.currentStep || 1}
- Style Preferences: ${userContext.onboarding?.stylePreferences || 'Not specified'}
- Business Type: ${userContext.onboarding?.businessType || 'Not specified'}

🧠 INTELLIGENT CONVERSATION SYSTEM:
You are Maya operating as a single, intelligent conversation system. You handle:

1. **ONBOARDING DISCOVERY**: When users are new, guide them through Sandra's 6-step editorial discovery process
2. **STYLING CONVERSATIONS**: Ongoing advice, support, and photo planning
3. **GENERATION TRIGGERS**: When ready, trigger image generation by including "GENERATE_IMAGES" in your response
4. **BUSINESS CONTEXT**: Help with website building, LinkedIn photos, social media content

🎯 RESPONSE INTELLIGENCE:
- Assess user's current state and respond appropriately
- If onboarding incomplete, continue discovery process
- If ready for generation, include generation trigger
- Always maintain Sandra's warm, expert voice
- Use complete styling expertise from fashion week to empire building

🔮 GENERATION TRIGGER FORMAT:
When user is ready for image generation, include:
GENERATE_IMAGES: {"prompt": "detailed prompt", "style": "professional-headshots", "context": "user ready for LinkedIn photos"}

💫 ONBOARDING ADVANCEMENT:
When completing onboarding steps, include:
ADVANCE_ONBOARDING: {"step": 2, "data": {"stylePreferences": "..."}}

Always respond as Maya - warm, expert, intelligent, and focused on transformation.
`;
}

async function callClaudeWithUnifiedPersonality(
  message: string, 
  personality: string, 
  userContext: any,
  requestContext: any
) {
  console.log(`🤖 MAYA UNIFIED: Calling Claude with unified personality`);

  const conversation = [
    // Include recent chat history for context
    ...formatChatHistoryForClaude(userContext.chatHistory),
    {
      role: "user" as const, 
      content: message
    }
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514", 
    max_tokens: 2000,
    messages: conversation,
    system: personality
  });

  return response.content[0]?.type === 'text' ? response.content[0].text : "";
}

function formatChatHistoryForClaude(chatHistory: any[]) {
  if (!chatHistory || chatHistory.length === 0) return [];
  
  // Include last 10 messages for context
  return chatHistory.slice(-10).map(msg => ({
    role: (msg.role === 'maya' ? 'assistant' : 'user') as 'user' | 'assistant',
    content: msg.content
  }));
}

async function processClaudeResponse(
  claudeResponse: string, 
  userId: number, 
  userContext: any
) {
  console.log(`🔧 MAYA UNIFIED: Processing Claude response for intelligent actions`);

  let response = {
    message: claudeResponse,
    actions: [] as any[],
    metadata: {} as any
  };

  // Parse for generation trigger
  if (claudeResponse.includes("GENERATE_IMAGES:")) {
    const generationMatch = claudeResponse.match(/GENERATE_IMAGES:\s*({[^}]+})/);
    if (generationMatch && userContext.canGenerateImages) {
      try {
        const generationData = JSON.parse(generationMatch[1]);
        const generationResult = await triggerImageGeneration(
          userId, 
          generationData, 
          userContext
        );
        
        response.actions.push({
          type: 'generation',
          status: 'triggered',
          predictionId: generationResult.predictionId
        });
        
        // Remove generation trigger from message
        response.message = claudeResponse.replace(/GENERATE_IMAGES:[^}]+}/, '').trim();
        
      } catch (error) {
        console.error("Failed to parse generation data:", error);
      }
    }
  }

  // Parse for onboarding advancement
  if (claudeResponse.includes("ADVANCE_ONBOARDING:")) {
    const onboardingMatch = claudeResponse.match(/ADVANCE_ONBOARDING:\s*({[^}]+})/);
    if (onboardingMatch) {
      try {
        const onboardingData = JSON.parse(onboardingMatch[1]);
        await advanceOnboarding(userId, onboardingData);
        
        response.actions.push({
          type: 'onboarding',
          status: 'advanced',
          step: onboardingData.step
        });
        
        // Remove onboarding trigger from message  
        response.message = claudeResponse.replace(/ADVANCE_ONBOARDING:[^}]+}/, '').trim();
        
      } catch (error) {
        console.error("Failed to parse onboarding data:", error);
      }
    }
  }

  // Save conversation to history (if method exists)
  // TODO: Implement chat message saving once method is available
  console.log(`💾 MAYA UNIFIED: Would save chat messages for user ${userId}`);

  return response;
}

async function triggerImageGeneration(
  userId: number, 
  generationData: any, 
  userContext: any
) {
  console.log(`🎨 MAYA UNIFIED: Triggering intelligent image generation`);

  if (!userContext.triggerWord) {
    throw new Error("No trigger word available for generation");
  }

  // Use ModelTrainingService for generation
  const result = await ModelTrainingService.generateUserImages(
    userContext.user?.id?.toString() || userId.toString(),
    generationData.prompt,
    4, // Default count
    { 
      preset: generationData.style || 'professional',
      seed: Math.floor(Math.random() * 1000000)
    }
  );

  return result;
}

async function advanceOnboarding(userId: number, onboardingData: any) {
  console.log(`📋 MAYA UNIFIED: Advancing onboarding to step ${onboardingData.step}`);
  
  // Save onboarding progress using existing method
  await MayaStorageExtensions.saveOnboardingData(
    userId.toString(), 
    onboardingData.data || {}, 
    onboardingData.step
  );
}

function calculateOnboardingProgress(onboarding: any) {
  if (!onboarding) return 0;
  
  const totalSteps = 6;
  const currentStep = onboarding.currentStep || 1;
  
  return Math.round((currentStep / totalSteps) * 100);
}