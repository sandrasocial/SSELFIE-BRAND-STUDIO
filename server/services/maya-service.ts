/**
 * Maya AI Service - Complete Integration
 * Handles all Maya AI operations with full database integration and FLUX API
 */

import { getDatabase, type IStorage } from '../../shared/database-provider.js';
import {
  MayaProfile,
  InsertMayaProfile,
  InsertMayaImage,
  Conversation,
  InsertConversation,
  InsertConversationSummary,
  GenerationTracker,
  InsertGenerationTracker,
  UserModel
} from '../../shared/types-override.js';
import { InsertMessage, InsertMayaConcept } from '../../shared/schema.js';
import { ConceptCard } from '../../shared/types/concept-card.js';
import Anthropic from '@anthropic-ai/sdk';
import { PersonalityManager } from '../agents/personalities/personality-config.js';

export interface MayaChatRequest {
  message: string;
  history?: Array<{ user?: string; maya?: string }>;
  conversationId?: string;
}

export interface MayaGenerationRequest {
  conceptCard: {
    id: string;
    title: string;
    description?: string;
    fluxPrompt: string;
  };
  conversationId?: string;
}

export interface MayaChatResponse {
  response: string;
  conceptCards: ConceptCard[];
  conversationId: string;
}

export interface MayaGenerationResponse {
  generationId: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
}

export class MayaService {
  private db: IStorage;
  private anthropic: Anthropic;

  constructor(db: IStorage) {
    this.db = db;
    
    // 🔧 FIX: Add proper error handling for missing API key
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      console.error('❌ MAYA: ANTHROPIC_API_KEY environment variable is not set');
      throw new Error('Maya AI service is not properly configured - missing API key');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('✅ MAYA: Service initialized with Claude API access');
  }

  /**
   * Get or create user profile for Maya personalization
   */
  async getOrCreateUserProfile(stackAuthId: string): Promise<MayaProfile> {
    try {
      // Get user data first (stackAuthId is Stack Auth ID)
      let user = await this.db.getUserByStackAuthId(stackAuthId);
      
      // 🔧 FIX: If user not found by Stack Auth ID, try to find and link existing user
      if (!user) {
        console.log(`🔍 MAYA: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);
        
        // Try to find user by the Stack Auth ID as primary ID (legacy users)
        user = await this.db.getUser(stackAuthId);
        
        if (user) {
          // Link the Stack Auth ID to this user
          console.log(`🔗 MAYA: Linking Stack Auth ID ${stackAuthId} to user ${user.id}`);
          user = await this.db.linkStackAuthId(user.id, stackAuthId);
        } else {
          throw new Error(`User not found with Stack Auth ID: ${stackAuthId}. User may need to complete registration.`);
        }
      }

      // Check if profile exists using database user ID
      const existingProfile = await this.db.getMayaProfile(user.id);
      if (existingProfile) {
        return existingProfile;
      }

      // Create new Maya profile using database user ID
      const newProfile: InsertMayaProfile = {
        userId: user.id,
        onboardingStatus: 'pending',
        onboardingStep: 1,
        completedSteps: [],
        preferences: {
          communicationStyle: 'casual',
          generationSettings: {
            defaultQuality: 'high',
            preferredAspectRatio: '1:1',
            autoSave: true,
          },
          privacySettings: {
            shareGenerations: false,
            allowDataCollection: true,
          },
          notificationSettings: {
            emailUpdates: true,
            trainingComplete: true,
            newFeatures: false,
          },
        },
        totalGenerations: 0,
        monthlyGenerations: 0,
        lastResetDate: new Date(),
        featureAccess: {
          basicGeneration: true,
          advancedPrompting: true,
          customModels: false,
          prioritySupport: false,
        },
      };

      const createdProfile = await this.db.insertMayaProfile(newProfile);
      return createdProfile;
    } catch (error) {
      console.error('❌ MAYA: Failed to get/create user profile:', error);
      throw error;
    }
  }

  /**
   * Get user's trained model for personalized generation
   */
  async getUserModel(userId: string): Promise<UserModel | null> {
    try {
      const userModel = await this.db.getUserModel(userId);
      
      // 🔍 DEBUG: Log model status for troubleshooting
      if (userModel) {
        console.log(`🎯 MAYA: User ${userId} model found - Status: ${userModel.trainingStatus}, Trigger: ${userModel.triggerWord}`);
      } else {
        console.log(`🔍 MAYA: No trained model found for user ${userId}`);
      }
      
      return userModel || null;
    } catch (error) {
      console.error('❌ MAYA: Failed to get user model:', error);
      return null;
    }
  }

  /**
   * Process Maya chat with full database integration
   * @deprecated Use processAndSaveChat instead to avoid duplicate Claude API calls
   * This method makes its own Claude API call which causes redundancy when used with unified-maya-intelligence-service
   */
  async processChat(stackAuthId: string, request: MayaChatRequest): Promise<MayaChatResponse> {
    try {
      // Get user data first to get database user ID
      let user = await this.db.getUserByStackAuthId(stackAuthId);
      
      // 🔧 FIX: If user not found by Stack Auth ID, try to find and link existing user
      if (!user) {
        console.log(`🔍 MAYA: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);
        
        // Try to find user by the Stack Auth ID as primary ID (legacy users)
        user = await this.db.getUser(stackAuthId);
        
        if (user) {
          // Link the Stack Auth ID to this user
          console.log(`🔗 MAYA: Linking Stack Auth ID ${stackAuthId} to user ${user.id}`);
          user = await this.db.linkStackAuthId(user.id, stackAuthId);
        } else {
          throw new Error(`User not found with Stack Auth ID: ${stackAuthId}. User may need to complete registration.`);
        }
      }

      // Get or create user profile
      await this.getOrCreateUserProfile(stackAuthId);

      // Get or create Maya chat session
      let mayaChatId: string;
      
      if (request.conversationId && !isNaN(parseInt(request.conversationId))) {
        // Use existing chat ID if it's a valid number
        mayaChatId = request.conversationId;
        
        // Verify the chat exists
        const existingChat = await this.db.getMayaChat(mayaChatId, user.id);
        if (!existingChat) {
          console.warn(`⚠️ MAYA: Chat ${mayaChatId} not found, creating new chat`);
          mayaChatId = await this.db.createMayaChat(user.id, {
            userId: user.id,
            chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
            title: `Maya Chat ${new Date().toLocaleDateString()}`
          });
        }
      } else {
        // Create new Maya chat
        mayaChatId = await this.db.createMayaChat(user.id, {
          userId: user.id,
          chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
          title: `Maya Chat ${new Date().toLocaleDateString()}`
        });
      }

      console.log(`✅ MAYA: Using chat ID ${mayaChatId} for user ${user.id}`);

      // Get Maya's personality prompt with dynamic creative direction
      const creativeLook = PersonalityManager.getRandomCreativeLook();
      const systemPrompt = PersonalityManager.buildDynamicMayaPrompt(creativeLook);
      
      console.log(`🎨 MAYA: Using creative look "${creativeLook.name}" for this conversation`);

      // Build conversation context
      const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      // Add conversation history if provided
      if (request.history && Array.isArray(request.history)) {
        const recentHistory = request.history.slice(-10); // Limit to last 10 exchanges
        recentHistory.forEach(entry => {
          if (entry.user) {
            conversationMessages.push({
              role: 'user',
              content: entry.user
            });
          }
          if (entry.maya) {
            conversationMessages.push({
              role: 'assistant',
              content: entry.maya
            });
          }
        });
      }

      // Add current message
      conversationMessages.push({
        role: 'user',
        content: request.message
      });

      // Call Claude API with fallback handling
      let mayaResponse = '';
      
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          temperature: 0.7,
          system: systemPrompt,
          messages: conversationMessages
        });

        mayaResponse = response.content[0].type === 'text'
          ? response.content[0].text
          : '';
          
        console.log('✅ MAYA: Claude API call successful');
        
      } catch (apiError) {
        console.error('❌ MAYA: Claude API failed, using fallback response:', (apiError as Error).message);
        
        // 🔧 FALLBACK: Provide Maya response without Claude API
        mayaResponse = this.generateFallbackResponse(request.message, user);
      }

      // Extract concept cards from response
      const conceptCards = this.extractConceptCards(mayaResponse);

      // Save user message to Maya chat database
      const userMessage = {
        chatId: parseInt(mayaChatId),
        role: 'user',
        content: request.message,
      };
      await this.db.createMayaChatMessage(userMessage);

      // Save Maya response with concept cards to database
      const mayaMessage = {
        chatId: parseInt(mayaChatId),
        role: 'assistant',
        content: mayaResponse,
        conceptCards: conceptCards.map(card => ({
          title: card.title || 'Untitled Concept',
          description: card.description || '',
          prompt: card.fluxPrompt || '',
          type: 'professional',
          metadata: { emoji: card.emoji || '📸' },
          tags: [card.creativeLook || 'Professional'],
          status: 'active',
          isTemplate: false
        }))
      };
      await this.db.createMayaChatMessage(mayaMessage);

      // Save individual concept cards to the concepts table
      for (const conceptCard of conceptCards) {
        try {
          console.log(`🎨 MAYA CONCEPT: Saving concept card:`, {
            title: conceptCard.title,
            hasDescription: !!conceptCard.description,
            hasFluxPrompt: !!conceptCard.fluxPrompt,
            fluxPromptLength: conceptCard.fluxPrompt?.length || 0,
            fluxPromptStart: conceptCard.fluxPrompt?.substring(0, 60) || 'NO PROMPT'
          });

          // Clean emoji to prevent JSON encoding issues
          const cleanEmoji = this.cleanEmojiForDatabase(conceptCard.emoji || '📸');
          
          const conceptData = {
            userId: user.id,
            title: conceptCard.title,
            description: conceptCard.description || '',
            type: 'professional' as const,
          };
          await this.db.insertMayaConcept(conceptData as InsertMayaConcept);
        } catch (conceptError) {
          console.error('❌ MAYA: Failed to save concept card:', conceptError);
          // Continue processing other concepts
        }
      }

      console.log(`✅ MAYA: Processed ${conceptCards.length} concept cards for response`);

      // Update user profile stats
      await this.updateUserProfileStats();

      return {
        response: mayaResponse,
        conceptCards,
        conversationId: mayaChatId,
      };

    } catch (error) {
      console.error('❌ MAYA: Chat processing failed:', error);
      throw error;
    }
  }

  /**
   * Process and save chat with pre-generated Maya response
   * Used by unified-maya-intelligence-service to avoid duplicate Claude API calls
   */
  async processAndSaveChat(stackAuthId: string, request: {
    message: string;
    conversationId?: string;
    mayaResponseContent: string;
  }): Promise<{
    conversationId: string;
    conceptCards: ConceptCard[];
  }> {
    try {
      // Get user data first to get database user ID
      let user = await this.db.getUserByStackAuthId(stackAuthId);
      
      // 🔧 FIX: If user not found by Stack Auth ID, try to find and link existing user
      if (!user) {
        console.log(`🔍 MAYA: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);
        
        // Try to find user by the Stack Auth ID as primary ID (legacy users)
        user = await this.db.getUser(stackAuthId);
        
        if (user) {
          // Link the Stack Auth ID to this user
          await this.db.linkStackAuthId(user.id, stackAuthId);
          console.log(`✅ MAYA: Successfully linked Stack Auth ID ${stackAuthId} to existing user ${user.id}`);
        }
      }

      if (!user) {
        throw new Error(`User not found: ${stackAuthId}`);
      }

      console.log(`🎯 MAYA: Processing pre-generated response for user ${user.id}`);

      // Create or get Maya chat session
      let mayaChatId: string;
      
      if (request.conversationId && !isNaN(parseInt(request.conversationId))) {
        // Use existing chat ID if it's a valid number
        mayaChatId = request.conversationId;
        
        // Verify the chat exists
        const existingChat = await this.db.getMayaChat(mayaChatId, user.id);
        if (!existingChat) {
          console.warn(`⚠️ MAYA: Chat ${mayaChatId} not found, creating new chat`);
          mayaChatId = await this.db.createMayaChat(user.id, {
            userId: user.id,
            chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
            title: `Maya Chat ${new Date().toLocaleDateString()}`
          });
        }
      } else {
        // Create new Maya chat
        mayaChatId = await this.db.createMayaChat(user.id, {
          userId: user.id,
          chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
          title: `Maya Chat ${new Date().toLocaleDateString()}`
        });
      }

      console.log(`✅ MAYA: Using chat ID ${mayaChatId} for user ${user.id}`);

      // Extract concept cards from the pre-generated response
      const conceptCards = this.extractConceptCards(request.mayaResponseContent);

      // Save user message to Maya chat database
      const userMessage = {
        chatId: parseInt(mayaChatId),
        role: 'user',
        content: request.message,
      };
      await this.db.createMayaChatMessage(userMessage);

      // Save Maya response with concept cards to database
      const mayaMessage = {
        chatId: parseInt(mayaChatId),
        role: 'assistant',
        content: request.mayaResponseContent,
        conceptCards: conceptCards.map(card => ({
          title: card.title || 'Untitled Concept',
          description: card.description || '',
          prompt: card.fluxPrompt || '',
          type: 'professional',
          metadata: { emoji: card.emoji || '📸' },
          tags: [card.creativeLook || 'Professional'],
          status: 'active',
          isTemplate: false
        }))
      };
      await this.db.createMayaChatMessage(mayaMessage);

      // Save individual concept cards to the concepts table
      for (const conceptCard of conceptCards) {
        try {
          console.log(`🎨 MAYA CONCEPT: Saving concept card:`, {
            title: conceptCard.title,
            hasDescription: !!conceptCard.description,
            hasFluxPrompt: !!conceptCard.fluxPrompt,
            fluxPromptLength: conceptCard.fluxPrompt?.length || 0,
            fluxPromptStart: conceptCard.fluxPrompt?.substring(0, 60) || 'NO PROMPT'
          });

          // Clean emoji to prevent JSON encoding issues
          const cleanEmoji = this.cleanEmojiForDatabase(conceptCard.emoji || '📸');
          
          const conceptData = {
            userId: user.id,
            title: conceptCard.title,
            description: conceptCard.description || '',
            type: 'professional' as const,
          };
          await this.db.insertMayaConcept(conceptData as InsertMayaConcept);
        } catch (conceptError) {
          console.error('❌ MAYA: Failed to save concept card:', conceptError);
          // Continue processing other concepts
        }
      }

      console.log(`✅ MAYA: Processed ${conceptCards.length} concept cards for pre-generated response`);

      // Debug concept cards being returned
      conceptCards.forEach((card, index) => {
        console.log(`🎯 MAYA CONCEPT ${index + 1}:`, {
          id: card.id,
          title: card.title,
          hasDescription: !!card.description,
          hasFluxPrompt: !!card.fluxPrompt,
          fluxPromptLength: card.fluxPrompt?.length || 0
        });
      });

      // Update user profile stats
      await this.updateUserProfileStats();

      return {
        conversationId: mayaChatId,
        conceptCards
      };

    } catch (error) {
      console.error('❌ MAYA: ProcessAndSaveChat failed:', error);
      throw error;
    }
  }

  /**
   * 🎯 NEW: Cancel an active generation using Replicate SDK
   */
  async cancelGeneration(predictionId: string): Promise<{ success: boolean, message: string }> {
    try {
      const cancellationInfo = (global as any).activeGenerations?.get(predictionId);
      if (!cancellationInfo) {
        return { success: false, message: 'Generation not found or already completed' };
      }

      // Try to use the official SDK for cancellation
      try {
        const { ReplicateClient } = await import('./replicate-client.js');
        const replicateClient = new ReplicateClient();
        
        await replicateClient.cancelPrediction(predictionId);
        console.log(`✅ MAYA CANCEL: Successfully canceled prediction ${predictionId} using SDK`);
        
      } catch (sdkError) {
        console.warn('⚠️ MAYA CANCEL: SDK unavailable, using fallback API:', sdkError);
        
        // Fallback to raw API
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env['REPLICATE_API_TOKEN']}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Cancel request failed: ${response.status}`);
        }
      }

      // Update tracker status
      await this.db.updateGenerationTracker(cancellationInfo.trackerId, {
        status: 'canceled'
      });

      // Remove from active generations
      (global as any).activeGenerations?.delete(predictionId);

      return { success: true, message: 'Generation canceled successfully' };
      
    } catch (error) {
      console.error(`❌ MAYA CANCEL: Failed to cancel prediction ${predictionId}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Cancellation failed' 
      };
    }
  }

  /**
   * Generate images using FLUX API
   */
  async generateImages(userId: string, request: MayaGenerationRequest): Promise<MayaGenerationResponse> {
    try {
      // userId is already the internal database user ID (needed for trigger words)
      const internalUserId = userId;
      console.log(`🔍 MAYA GENERATION: Starting for internal user ID ${internalUserId}`);

      // Get user to find their Stack Auth ID for profile operations
      const user = await this.db.getUser(internalUserId);
      if (!user) {
        console.error(`❌ MAYA GENERATION: User not found with internal ID: ${internalUserId}`);
        throw new Error(`User not found with internal ID: ${internalUserId}`);
      }
      
      console.log(`🔍 MAYA GENERATION: Found user - Stack Auth ID: ${user.stackAuthId}, Gender: ${user.gender}`);
      
      if (!user.stackAuthId) {
        console.error(`❌ MAYA GENERATION: User ${internalUserId} missing Stack Auth ID`);
        throw new Error(`User ${internalUserId} does not have a Stack Auth ID linked`);
      }

      // Validate user has access using Stack Auth ID
      const userProfile: MayaProfile = await this.getOrCreateUserProfile(user.stackAuthId);
      console.log(`🔍 MAYA GENERATION: Profile access - basicGeneration: ${userProfile.featureAccess?.basicGeneration}, monthlyGenerations: ${userProfile.monthlyGenerations}`);
      
      if (!(userProfile.featureAccess as { basicGeneration?: boolean })?.basicGeneration) {
        console.error(`❌ MAYA GENERATION: User does not have generation access`);
        throw new Error('User does not have generation access');
      }

      // Check generation limits (allow admin users with -1 limit)
      const monthlyLimit = userProfile.monthlyGenerations || 0;
      if (monthlyLimit >= 100 && monthlyLimit !== -1) {
        console.error(`❌ MAYA GENERATION: Monthly limit exceeded: ${monthlyLimit}/100`);
        throw new Error('Monthly generation limit exceeded');
      }

      // Get user's trained model for personalization
      const userModel = await this.getUserModel(userId);
      console.log(`🔍 MAYA GENERATION: User model status - Found: ${!!userModel}, Training: ${userModel?.trainingStatus}, Version: ${userModel?.replicateVersionId}, Trigger: ${userModel?.triggerWord}`);
      
      // CRITICAL: Validate user has completed trained model
      if (!userModel || userModel.trainingStatus !== 'completed') {
        console.error(`❌ MAYA GENERATION: Invalid model - Status: ${userModel?.trainingStatus || 'no_model'}, ID: ${userModel?.id}`);
        throw new Error(`User does not have a completed trained model. Status: ${userModel?.trainingStatus || 'no_model'}. Please complete model training first.`);
      }
      
      // 🔍 CRITICAL DEBUG: Log detailed model information
      console.log(`🔍 MAYA GENERATION: Model validation for user ${userId}:`, {
        trainingStatus: userModel.trainingStatus,
        replicateVersionId: userModel.replicateVersionId,
        triggerWord: userModel.triggerWord,
        modelId: userModel.id,
        completedAt: userModel.completedAt
      });
      
      if (!userModel.replicateVersionId) {
        console.error(`❌ MAYA GENERATION: Model missing Replicate version ID - Training may have completed without proper version extraction`);
        throw new Error('User model missing replicateVersionId for personalized generation. Training completion may have failed to extract version ID.');
      }
      
      console.log(`✅ MAYA GENERATION: Valid model found - Version: ${userModel.replicateVersionId}, Trigger: ${userModel.triggerWord}`);

      // CRITICAL FIX: Don't create tracker here - create it AFTER getting Replicate prediction ID
      // to avoid ID mismatch issues. Pass generationId for response, get Replicate ID in startFluxGeneration
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Start FLUX generation asynchronously - will create tracker with correct Replicate prediction ID
      const { trackerId } = await this.startFluxGeneration(internalUserId, request, generationId, userModel);

      // Update user profile stats using Stack Auth ID
      await this.db.updateMayaProfile(user.stackAuthId, {
        totalGenerations: (userProfile.totalGenerations || 0) + 1,
        monthlyGenerations: (userProfile.monthlyGenerations || 0) + 1,
      });

      return {
        generationId,
        status: 'processing',
        message: 'Image generation started successfully'
      };

    } catch (error) {
      console.error('❌ MAYA: Image generation failed:', error);
      throw error;
    }
  }

  /**
   * Start FLUX API generation
   */
  private async startFluxGeneration(
    userId: string,
    request: MayaGenerationRequest,
    generationId: string,
    userModel?: UserModel | null
  ): Promise<{ trackerId: number }> {
    try {
      // CRITICAL: Get complete user data including gender
      const user = await this.db.getUser(userId);
      if (!user) {
        throw new Error('User not found in database');
      }

      // Get user's trained model data for personalized generation
      if (!userModel || userModel.trainingStatus !== 'completed') {
        throw new Error('User must have a completed trained model for image generation');
      }

      // CRITICAL: Use user's custom LoRA model, not generic FLUX
      if (!userModel.replicateVersionId) {
        throw new Error('User model missing replicateVersionId - cannot generate personalized images');
      }

      // Build personalized prompt with gender injection and trigger word
      const { enforceGender } = await import('../utils/gender-prompt.js');
      
      // Start with the concept prompt
      let fluxPrompt = request.conceptCard.fluxPrompt;
      console.log(`🔍 MAYA FLUX: Original prompt: ${fluxPrompt.substring(0, 150)}...`);
      
      // CRITICAL: Add trigger word and enforce gender for proper personalization
      if (userModel.triggerWord) {
        console.log(`🔍 MAYA FLUX: Adding trigger word "${userModel.triggerWord}" and enforcing gender "${user.gender}"`);
        fluxPrompt = enforceGender(userModel.triggerWord, fluxPrompt, user.gender);
        console.log(`🔍 MAYA FLUX: Enhanced prompt: ${fluxPrompt.substring(0, 150)}...`);
      } else {
        console.warn(`⚠️ MAYA FLUX: No trigger word found for user model ${userModel.id}`);
      }

      console.log(`🎯 MAYA FLUX: Starting Replicate generation with LoRA model ${userModel.replicateVersionId}`);

      // Validate Replicate API token
      const replicateToken = process.env['REPLICATE_API_TOKEN'];
      console.log(`🔍 MAYA FLUX: Token validation:`, {
        hasToken: !!replicateToken,
        tokenLength: replicateToken?.length || 0,
        tokenPrefix: replicateToken?.substring(0, 8) + '...' || 'N/A'
      });
      
      if (!replicateToken) {
        console.error('❌ MAYA FLUX: REPLICATE_API_TOKEN not configured in environment');
        throw new Error('Replicate API not configured - missing REPLICATE_API_TOKEN environment variable');
      }

      // � CRITICAL FIX: Construct full model version format
      const modelVersion = userModel.replicateModelId && userModel.replicateVersionId 
        ? `${userModel.replicateModelId}:${userModel.replicateVersionId}`
        : userModel.replicateVersionId;

      // �🔍 CRITICAL DEBUG: Log user model details before API call
      console.log(`🔍 MAYA FLUX: User model details:`, {
        replicateModelId: userModel.replicateModelId,
        replicateVersionId: userModel.replicateVersionId,
        combinedVersion: modelVersion,
        triggerWord: userModel.triggerWord,
        trainingStatus: userModel.trainingStatus,
        modelType: userModel.modelType
      });

      const requestBody = {
        version: modelVersion,
        input: {
          prompt: fluxPrompt,
          guidance: 5,
          num_inference_steps: 50,
          lora_scale: 1.05,  // ✅ RESTORED: For extracted LoRA weights
          num_outputs: 2,
          aspect_ratio: "3:4",  // Changed from 1:1
          output_format: "png", // Changed from webp
          output_quality: 95,   // Changed from 80
          safety_tolerance: 2,
        }
      };

      // 🎯 IMPROVEMENT: Use official Replicate SDK for better reliability
      console.log(`🔍 MAYA FLUX: Using Replicate SDK with model: ${userModel.replicateVersionId}`);
      console.log(`🔍 MAYA FLUX: Generation parameters:`, JSON.stringify(requestBody.input, null, 2));

      // 🎯 TRY: Use official Replicate SDK first
      let predictionData: any;
      
      try {
        const { ReplicateClient } = await import('./replicate-client.js');
        const replicateClient = new ReplicateClient();
        
        // Convert parameters to SDK format
        const generationConfig = {
          modelVersionId: modelVersion,
          prompt: fluxPrompt,
          numOutputs: requestBody.input.num_outputs,
          aspectRatio: requestBody.input.aspect_ratio,
          outputFormat: requestBody.input.output_format,
          outputQuality: requestBody.input.output_quality,
          guidanceScale: requestBody.input.guidance,
          numInferenceSteps: requestBody.input.num_inference_steps,
          loraScale: requestBody.input.lora_scale
          // 🚫 TEMPORARILY DISABLED: Webhook causing "Invalid webhook URL" error
          // webhookUrl: `https://sselfie.ai/api/webhooks/replicate/predictions`,
          // webhookEvents: ['completed' as 'completed']
        };

        console.log(`✅ MAYA FLUX: Using official Replicate SDK`);
        const { predictionId, prediction } = await replicateClient.startGeneration(generationConfig);
        
        predictionData = {
          id: predictionId,
          status: prediction.status,
          input: prediction.input,
          output: prediction.output
        };

        console.log(`✅ MAYA FLUX: SDK prediction created: ${predictionId}`);
        
      } catch (sdkError) {
        console.warn('⚠️ MAYA FLUX: SDK unavailable, using fallback fetch:', sdkError);
        
        // 🔄 FALLBACK: Raw fetch if SDK fails
        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env['REPLICATE_API_TOKEN']}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SSELFIE-Studio/1.0'
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`🔍 MAYA FLUX: Fallback response status: ${replicateResponse.status}`);

        if (!replicateResponse.ok) {
          const errorText = await replicateResponse.text();
          console.error(`❌ MAYA FLUX: Fallback API error ${replicateResponse.status}: ${errorText}`);
          throw new Error(`Replicate API error: ${replicateResponse.status} - ${errorText}`);
        }

        predictionData = await replicateResponse.json();
      }
      console.log(`✅ MAYA FLUX: Replicate prediction created: ${predictionData.id}`);

      // CRITICAL FIX: Create tracker with correct Replicate prediction ID to avoid ID mismatch
      const enhancedPrompt = `${request.conceptCard.fluxPrompt}||REPLICATE_ID:${predictionData.id}||SDK:${!!predictionData.sdkUsed}||WEBHOOK:enabled`;
      
      const tracker = await this.db.createGenerationTracker({
        userId: userId, // Use internal database user ID
        predictionId: predictionData.id, // CRITICAL: Use actual Replicate prediction ID, not generated ID
        prompt: enhancedPrompt,
        style: 'editorial',
        status: 'processing',
      } as InsertGenerationTracker);

      console.log(`✅ MAYA FLUX: Generation tracker created successfully - Prediction: ${predictionData.id}, Tracker: ${tracker.id}`);

      // 🎯 ADD: Cancellation support method for future use
      // Store the prediction ID for potential cancellation
      const cancellationInfo = {
        predictionId: predictionData.id,
        trackerId: tracker.id,
        userId: tracker.userId,
        startTime: Date.now()
      };
      
      // Store in memory for quick cancellation access (could be moved to Redis in production)
      if (!(global as any).activeGenerations) {
        (global as any).activeGenerations = new Map();
      }
      (global as any).activeGenerations.set(predictionData.id, cancellationInfo);

      // Force immediate check in development/testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 MAYA FLUX DEV: Forcing immediate completion check for testing`);
        setTimeout(async () => {
          const { GenerationCompletionMonitor } = await import('../generation-completion-monitor.js');
          await GenerationCompletionMonitor.checkAndUpdateGeneration(predictionData.id, tracker.id);
        }, 5000); // Check after 5 seconds for testing
      }

      // Trigger the completion monitor to check this specific generation
      try {
        const { GenerationCompletionMonitor } = await import('../generation-completion-monitor.js');
        // Start monitoring this specific generation (non-blocking)
        setTimeout(async () => {
          await GenerationCompletionMonitor.checkAndUpdateGeneration(predictionData.id, tracker.id);
        }, 10000); // Check after 10 seconds
      } catch (error) {
        console.error('❌ MAYA: Failed to trigger completion monitor:', error);
      }

      return { trackerId: tracker.id };

    } catch (error) {
      console.error('❌ MAYA: FLUX generation start failed:', error);

      // Can't update tracker if creation failed - error will be caught in generateImages
      throw error;
    }
  }

  /**
   * REMOVED: Old monitoring method replaced by GenerationCompletionMonitor
   * The GenerationCompletionMonitor service automatically:
   * 1. Polls Replicate API for completion
   * 2. Updates generation tracker status
   * 3. Saves images to Maya chat previews (not gallery)
   * 4. Migrates URLs to permanent S3 storage
   * This ensures proper concept card → generation → preview → gallery flow
   */

  /**
   * Get generation status
   */
  async getGenerationStatus(userId: string, generationId: string): Promise<{
    generationId: string;
    status: string;
    images?: string[];
    completedAt?: Date;
    progress?: number;
  }> {
    try {
      console.log(`🔍 MAYA STATUS: Looking for generation ${generationId} for user ${userId}`);
      
      // CRITICAL FIX: Find tracker by Replicate prediction ID (which is now stored in predictionId field)
      const trackers = await this.db.getUserGenerationTrackers(userId);
      console.log(`🔍 MAYA STATUS: Found ${trackers.length} trackers for user`);
      
      const tracker = trackers.find(t => 
        t.predictionId === generationId // FIXED: Now stored as actual Replicate prediction ID
      );

      if (!tracker) {
        console.error(`❌ MAYA STATUS: Generation ${generationId} not found for user ${userId}`);
        console.error(`❌ MAYA STATUS: Available trackers:`, trackers.map(t => ({
          id: t.id,
          predictionId: t.predictionId,
          status: t.status
        })));
        throw new Error('Generation not found');
      }

      console.log(`✅ MAYA STATUS: Found tracker ${tracker.id} with status ${tracker.status}`);

      if (tracker.status === 'completed') {
        const imageUrls = tracker.imageUrls ? JSON.parse(tracker.imageUrls) : [];
        console.log(`✅ MAYA STATUS: Returning ${imageUrls.length} completed images:`, imageUrls.map((url: string) => url.substring(0, 50) + '...'));
        console.log(`✅ MAYA STATUS: Full tracker data:`, {
          id: tracker.id,
          status: tracker.status,
          imageUrls: tracker.imageUrls,
          prompt: tracker.prompt?.substring(0, 100) + '...',
          updatedAt: tracker.updatedAt
        });
        return {
          generationId,
          status: 'completed',
          images: imageUrls,
          completedAt: tracker.updatedAt || undefined,
        };
      }

      return {
        generationId,
        status: tracker.status || 'processing',
        progress: 50, // Estimated progress
      };

    } catch (error) {
      console.error('❌ MAYA: Status check failed:', error);
      throw error;
    }
  }

  /**
   * Extract concept cards from Maya response with multiple robust patterns
   * Handles various formatting variations in Maya's personality responses
   */
  /**
   * UNIFIED CONCEPT CARD EXTRACTION - Single Source of Truth
   * Consolidates best patterns from all Maya services for robust extraction
   * Returns standardized ConceptCard objects matching shared/types/concept-card.ts
   */
  private extractConceptCards(response: string): ConceptCard[] {
    const conceptCards = [];

    try {
      console.log('🔍 MAYA SERVICE: Extracting concept cards from response:', response.substring(0, 500));
      
      // Use same robust extraction as main index.ts with enhancements
      const conceptSections = response.split(/---+/).filter(section => section.trim().length > 50);
      console.log(`🔍 MAYA SERVICE: Found ${conceptSections.length} concept sections`);
      
      for (let i = 0; i < conceptSections.length && conceptCards.length < 5; i++) {
        const section = conceptSections[i].trim();
        
        // Enhanced extraction patterns for maximum robustness
        const patterns = [
          // Pattern 1: Full Maya format [EMOJI] **CONCEPT** \n Description \n FLUX_PROMPT: [prompt]
          /([^\w\s])\s*\*\*([^*]+)\*\*\s*[\r\n]+([^*]+?)[\r\n]+\s*FLUX_PROMPT:\s*\[([^\]]+)\]/g,
          
          // Pattern 2: Simplified emoji format
          /([📸🎯✨💼🌟💫🏆🎬🏔️🎿☕🤍🖤🌊🎭💎])\s*\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g,
          
          // Pattern 3: Any emoji + title format
          /([^\w\s\[\]])\s*\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g,
          
          // Pattern 4: Just title + FLUX_PROMPT
          /\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g,
          
          // Pattern 5: Numbered lists with description
          /(\d+\.\s*)([^\n\r]+)[\r\n]+([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g
        ];
        
        let sectionMatched = false;
        
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(section)) !== null && conceptCards.length < 5) {
            let emoji = '📸', title = '', description = '', fluxPrompt = '';
            
            if (match.length >= 4) {
              if (match.length === 5) {
                // Full format with emoji or numbered
                if (match[1].match(/\d+\.\s*/)) {
                  // Numbered format
                  title = match[2]?.trim();
                  description = match[3]?.trim();
                  fluxPrompt = match[4]?.trim();
                  emoji = this.selectEmojiFromContent(title, description);
                } else {
                  // Emoji format
                  emoji = match[1] || '📸';
                  title = match[2]?.trim();
                  description = match[3]?.trim();
                  fluxPrompt = match[4]?.trim();
                }
              } else {
                // Without emoji
                title = match[1]?.trim();
                description = match[2]?.trim();
                fluxPrompt = match[3]?.trim();
                emoji = this.selectEmojiFromContent(title, description);
              }
              
              // Clean up text
              description = description?.replace(/\s+/g, ' ').substring(0, 300) || '';
              fluxPrompt = fluxPrompt?.replace(/[\[\]]/g, '').trim() || '';
              
              if (title && title.length > 3 && (description.length > 10 || fluxPrompt.length > 10)) {
                console.log(`✅ MAYA SERVICE: Extracted concept - ${emoji} ${title}`);
                
                const creativeLook = this.determineCreativeLook(title, description);
                const conceptCard = {
                  id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  title: title,
                  description: description || `Professional ${title.toLowerCase()} concept`,
                  fluxPrompt: fluxPrompt || this.generateEnhancedFluxPrompt(title, description, creativeLook),
                  creativeLook: creativeLook,
                  emoji: emoji,
                  category: this.categorizeCard(title, description),
                  tags: this.extractTags(title + ' ' + description),
                  type: this.determineConceptType(title, description),
                  createdAt: new Date().toISOString()
                };
                
                conceptCards.push(conceptCard);
                sectionMatched = true;
              }
            }
          }
          
          if (sectionMatched) break; // Found matches with this pattern, move to next section
        }
      }

      // Enhanced fallback: Intelligent text analysis for concept keywords
      if (conceptCards.length === 0) {
        console.log('🔄 MAYA SERVICE: No structured concepts found, analyzing text with enhanced intelligence...');
        
        const conceptKeywords = [
          'professional', 'business', 'creative', 'lifestyle', 'portrait', 'headshot', 
          'flatlay', 'editorial', 'luxury', 'elegant', 'sophisticated', 'modern',
          'classic', 'timeless', 'scandinavian', 'urban', 'coastal', 'avant-garde'
        ];
        
        const lines = response.split('\n').filter(line => line.trim().length > 20);
        
        for (const line of lines.slice(0, 10)) {
          for (const keyword of conceptKeywords) {
            if (line.toLowerCase().includes(keyword) && conceptCards.length < 3) {
              const title = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Concept`;
              const creativeLook = this.determineCreativeLook(title, line);
              
              console.log(`✅ MAYA SERVICE: Generated concept from keyword - ${title}`);
              conceptCards.push({
                id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: title,
                description: line.trim().substring(0, 200),
                fluxPrompt: this.generateEnhancedFluxPrompt(title, line, creativeLook),
                creativeLook: creativeLook,
                emoji: this.selectEmojiFromContent(title, line),
                category: this.categorizeCard(title, line),
                tags: this.extractTags(title + ' ' + line),
                type: this.determineConceptType(title, line),
                createdAt: new Date().toISOString()
              });
              break;
            }
          }
        }
      }

      console.log(`🎯 MAYA SERVICE: Extracted ${conceptCards.length} concept cards total`);

    } catch (parseError) {
      console.error('❌ MAYA SERVICE: Concept card extraction error:', parseError);
    }

    return conceptCards.slice(0, 5); // Allow up to 5 concepts as per Maya personality config
  }

  /**
   * Enhanced emoji selection based on content analysis
   * Consolidated from MayaConceptCardService with additional patterns
   */
  private selectEmojiFromContent(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    // Content-based emoji selection (enhanced)
    if (content.includes('strategy') || content.includes('plan')) return '🎯';
    if (content.includes('brand') || content.includes('identity')) return '✨';
    if (content.includes('social') || content.includes('media')) return '📱';
    if (content.includes('network') || content.includes('connection')) return '🤝';
    if (content.includes('creative') || content.includes('design')) return '🎨';
    if (content.includes('leadership') || content.includes('executive')) return '👑';
    if (content.includes('innovation') || content.includes('tech')) return '💡';
    if (content.includes('growth') || content.includes('success')) return '📈';
    
    // Style-based patterns from UnifiedMayaIntelligenceService
    if (content.includes('scandinavian') || content.includes('minimalist') || content.includes('nordic')) return '🤍';
    if (content.includes('urban') || content.includes('moody') || content.includes('dramatic')) return '🖤';
    if (content.includes('coastal') || content.includes('ocean') || content.includes('seaside')) return '🌊';
    if (content.includes('editorial') || content.includes('avant-garde') || content.includes('artistic')) return '🎭';
    if (content.includes('classic') || content.includes('timeless') || content.includes('elegant')) return '💎';
    if (content.includes('luxury') || content.includes('high-end') || content.includes('sophisticated')) return '💫';
    
    return '📸'; // Default professional photography emoji
  }

  /**
   * Determine creative look classification
   * Enhanced from MayaConceptCardService with UnifiedMayaIntelligenceService patterns
   */
  private determineCreativeLook(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    // Maya's sophisticated Creative Look system
    if (content.includes('scandinavian') || content.includes('minimalist') || content.includes('nordic') || content.includes('clean')) {
      return 'Scandinavian Minimalist';
    } else if (content.includes('urban') || content.includes('moody') || content.includes('dramatic') || content.includes('edge')) {
      return 'Urban Moody';
    } else if (content.includes('coastal') || content.includes('ocean') || content.includes('seaside') || content.includes('flowing')) {
      return 'High-End Coastal';
    } else if (content.includes('editorial') || content.includes('avant-garde') || content.includes('artistic') || content.includes('bold')) {
      return 'Editorial Avant-Garde';
    } else if (content.includes('classic') || content.includes('timeless') || content.includes('traditional') || content.includes('heritage')) {
      return 'Classic Timeless';
    } else if (content.includes('luxury') || content.includes('elegant') || content.includes('sophisticated') || content.includes('refined')) {
      return 'Luxury Refined';
    } else if (content.includes('creative') || content.includes('artistic') || content.includes('innovative') || content.includes('unique')) {
      return 'Creative Artistic';
    } else if (content.includes('business') || content.includes('corporate') || content.includes('professional') || content.includes('executive')) {
      return 'Professional Corporate';
    } else if (content.includes('modern') || content.includes('contemporary') || content.includes('tech') || content.includes('innovative')) {
      return 'Modern Contemporary';
    }
    
    return 'Professional'; // Default
  }

  /**
   * Categorize concept cards for better organization
   * Enhanced from MayaConceptCardService
   */
  private categorizeCard(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('brand') || content.includes('identity')) return 'branding';
    if (content.includes('social') || content.includes('media')) return 'social-media';
    if (content.includes('leadership') || content.includes('executive')) return 'leadership';
    if (content.includes('strategy') || content.includes('plan')) return 'strategy';
    if (content.includes('network') || content.includes('relationship')) return 'networking';
    if (content.includes('creative') || content.includes('design') || content.includes('artistic')) return 'creative';
    if (content.includes('professional') || content.includes('career') || content.includes('business')) return 'professional';
    if (content.includes('lifestyle') || content.includes('personal')) return 'lifestyle';
    if (content.includes('editorial') || content.includes('fashion')) return 'editorial';
    
    return 'general';
  }

  /**
   * Extract relevant tags from content
   * Enhanced from MayaConceptCardService
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const tagKeywords = [
      'professional', 'luxury', 'creative', 'modern', 'classic', 'timeless',
      'brand', 'strategy', 'leadership', 'social', 'network', 'business',
      'corporate', 'executive', 'innovative', 'elegant', 'sophisticated',
      'scandinavian', 'minimalist', 'urban', 'moody', 'coastal', 'editorial',
      'avant-garde', 'artistic', 'refined', 'contemporary', 'lifestyle'
    ];
    
    const lowercaseContent = content.toLowerCase();
    
    tagKeywords.forEach(keyword => {
      if (lowercaseContent.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Limit to top 5 tags
    return tags.slice(0, 5);
  }

  /**
   * Determine concept type for UI organization
   */
  private determineConceptType(title: string, description: string): 'portrait' | 'flatlay' | 'lifestyle' {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('flatlay') || content.includes('overhead') || content.includes('product') || content.includes('accessories')) {
      return 'flatlay';
    } else if (content.includes('lifestyle') || content.includes('candid') || content.includes('action') || content.includes('environment')) {
      return 'lifestyle';
    }
    
    return 'portrait'; // Default - most Maya concepts are portraits
  }

  /**
   * Generate enhanced FLUX prompts with professional photography elements
   * Enhanced from MayaConceptCardService with style integration
   */
  private generateEnhancedFluxPrompt(title: string, description: string, creativeLook: string): string {
    const basePrompt = `Professional portrait photography of sandra, ${title.toLowerCase()}`;
    
    // Creative look specific styling
    let styleElements = [];
    switch (creativeLook) {
      case 'Scandinavian Minimalist':
        styleElements = ['clean Nordic aesthetic', 'soft natural lighting', 'understated elegance', 'soft whites and beiges'];
        break;
      case 'Urban Moody':
        styleElements = ['dramatic city aesthetic', 'bold contrasts', 'sophisticated edge', 'deep blacks and charcoal'];
        break;
      case 'High-End Coastal':
        styleElements = ['luxurious seaside elegance', 'flowing textures', 'ocean-inspired tones', 'ocean blues and pearl whites'];
        break;
      case 'Editorial Avant-Garde':
        styleElements = ['high-fashion editorial', 'bold creative elements', 'artistic vision', 'dramatic lighting'];
        break;
      case 'Classic Timeless':
        styleElements = ['elegant traditional aesthetic', 'refined sophistication', 'heritage appeal', 'navy and cream tones'];
        break;
      default:
        styleElements = ['high-quality professional photography', 'studio lighting', 'modern aesthetic', 'clean composition'];
    }
    
    const technicalElements = [
      'sharp focus',
      'professional lighting',
      '8k resolution',
      'luxury fashion editorial style',
      'perfect composition'
    ];
    
    return `${basePrompt}, ${styleElements.join(', ')}, ${technicalElements.join(', ')}`;
  }

  /**
   * Update conversation summary
   */
  private async updateConversationSummary(conversationId: string): Promise<void> {
    try {
      // Get recent messages for summary
      const messages = await this.db.getConversationMessages(conversationId, 10);

      if (messages.length > 0) {
        // Create simple summary from last message
        const lastMessage = messages[messages.length - 1];
        const summary = lastMessage.content.substring(0, 200) + (lastMessage.content.length > 200 ? '...' : '');

        await this.db.upsertConversationSummary({
          conversationId,
          summary,
          lastMessageId: lastMessage.id,
          messageCount: messages.length,
        } as InsertConversationSummary);
      }
    } catch (error) {
      console.error('❌ MAYA: Failed to update conversation summary:', error);
    }
  }

  /**
   * Update user profile statistics
   */
  private async updateUserProfileStats(): Promise<void> {
    try {
      // This would update various stats like conversation count, etc.
      // Implementation depends on what stats we want to track
    } catch (error) {
      console.error('❌ MAYA: Failed to update user profile stats:', error);
    }
  }

  /**
   * Clean emoji characters to prevent JSON encoding issues in database
   */
  private cleanEmojiForDatabase(emoji: string): string {
    if (!emoji) return '';
    
    try {
      // Remove or replace problematic Unicode characters that cause JSON parsing issues
      // This specifically handles surrogate pairs that cause the "low surrogate must follow high surrogate" error
      const cleaned = emoji
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove surrogate pairs
        .replace(/[\uD800-\uDFFF]/g, '') // Remove any remaining surrogates
        .replace(/[^\u0000-\u007F\u00A0-\u024F\u1E00-\u1EFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u2100-\u214F\u2190-\u21FF\u2200-\u22FF]/g, ''); // Keep basic Latin, extended Latin, and common symbols
      
      // If emoji is completely cleaned out, provide a fallback
      return cleaned || '🎯';
    } catch (error) {
      console.warn('⚠️ MAYA: Error cleaning emoji, using fallback:', error);
      return '🎯'; // Safe fallback emoji
    }
  }

  /**
   * Generate fallback response when Claude API is unavailable
   */
  private generateFallbackResponse(message: string, user: any): string {
    console.log('🔄 MAYA: Generating fallback response for API key issue');
    
    return `Hello! I'm Maya, your AI Creative Director at SSELFIE Studio.

I'm currently experiencing a temporary technical issue with my AI capabilities, but I'm still here to help! 

The issue is related to my connection with Claude AI - specifically an invalid API key that needs to be updated by the development team. 

Once this is resolved, I'll be back to my full capabilities:
• Creating personalized concept cards with detailed styling
• Professional headshot and lifestyle photography direction
• Fashion expertise across 12 signature aesthetic looks
• Location scouting and creative direction

Please check back soon, or contact support if this issue persists. I'm excited to help you create stunning visuals for your brand once I'm back online!

Thank you for your patience! 🎨✨`;
  }
}

// Export singleton instance using database provider
export const mayaService = new MayaService(getDatabase());

// Register with service container for dependency injection
import { serviceContainer, ServiceTokens } from '../../shared/service-container.js';
serviceContainer.register(ServiceTokens.MAYA_SERVICE, () => mayaService, true);