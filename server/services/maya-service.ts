/**
 * Maya AI Service - Complete Integration
 * Handles all Maya AI operations with full database integration and FLUX API
 */

import { DatabaseStorage } from '../storage.js';
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
import { 
  InsertMayaConcept
} from '../../shared/schema-maya.js';
import { InsertMessage } from '../../shared/schema.js';
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
  conceptCards: Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }>;
  conversationId: string;
}

export interface MayaGenerationResponse {
  generationId: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
}

export class MayaService {
  private db: DatabaseStorage;
  private anthropic: Anthropic;

  constructor(db: DatabaseStorage) {
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

      // Get or create conversation
      let conversation: Conversation;
      if (request.conversationId) {
        const foundConversation = await this.db.getConversation(request.conversationId);
        if (!foundConversation || foundConversation.userId !== user.id) {
          throw new Error('Conversation not found or access denied');
        }
        conversation = foundConversation;
      } else {
        // Create new conversation
        const newConversation: InsertConversation = {
          userId: user.id,
          agentName: 'maya',
          title: `Maya Chat ${new Date().toLocaleDateString()}`,
        };
        conversation = await this.db.createConversation(newConversation);
      }

      // Get Maya's personality prompt
      const systemPrompt = PersonalityManager.getNaturalPrompt('maya');

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

      // Save user message to database
      const userMessage: InsertMessage = {
        conversationId: conversation.id,
        role: 'user',
        content: request.message,
      };
      await this.db.createMessage(userMessage);

      // Save Maya response to database
      const mayaMessage: InsertMessage = {
        conversationId: conversation.id,
        role: 'assistant',
        content: mayaResponse,
      };
      await this.db.createMessage(mayaMessage);

      // Extract concept cards from response
      const conceptCards = this.extractConceptCards(mayaResponse);

      // Save concept cards to Maya concepts database
      for (const concept of conceptCards) {
        const mayaConcept = {
          userId: user.id,
          title: concept.title,
          description: concept.description,
          prompt: concept.fluxPrompt,
          type: 'portrait', // Default type for Maya conversations
          metadata: {
            conversationId: conversation.id,
            source: 'maya_chat',
            creativeLook: concept.creativeLook,
            emoji: concept.emoji
          },
          tags: [],
          status: 'draft',
          isTemplate: false,
        } as InsertMayaConcept;
        await this.db.insertMayaConcept(mayaConcept);
      }

      // Update conversation summary
      await this.updateConversationSummary(conversation.id);

      // Update user profile stats
      await this.updateUserProfileStats();


      return {
        response: mayaResponse,
        conceptCards,
        conversationId: conversation.id,
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
    conceptCards: Array<{
      id: string;
      title: string;
      description: string;
      fluxPrompt: string;
      creativeLook: string;
      emoji: string;
    }>;
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
      const mayaChatId = request.conversationId || `maya_${Date.now()}_${user.id}`;

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
          title: card.title,
          description: card.description,
          prompt: card.fluxPrompt,
          type: 'professional',
          metadata: { emoji: card.emoji },
          tags: [card.creativeLook],
          status: 'active',
          isTemplate: false
        }))
      };
      await this.db.createMayaChatMessage(mayaMessage);

      // Save individual concept cards to the concepts table
      for (const conceptCard of conceptCards) {
        try {
          const conceptData = {
            userId: user.id,
            title: conceptCard.title,
            description: conceptCard.description || '',
            prompt: conceptCard.fluxPrompt,
            type: 'professional' as const,
            metadata: { emoji: conceptCard.emoji },
            tags: [conceptCard.creativeLook],
            status: 'active' as const,
            isTemplate: false
          };
          await this.db.insertMayaConcept(conceptData as InsertMayaConcept);
        } catch (conceptError) {
          console.error('❌ MAYA: Failed to save concept card:', conceptError);
          // Continue processing other concepts
        }
      }

      console.log(`✅ MAYA: Processed ${conceptCards.length} concept cards for pre-generated response`);

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
   * Generate images using FLUX API
   */
  async generateImages(userId: string, request: MayaGenerationRequest): Promise<MayaGenerationResponse> {
    try {

      // Validate user has access
      const userProfile: MayaProfile = await this.getOrCreateUserProfile(userId);
      if (!(userProfile.featureAccess as { basicGeneration?: boolean })?.basicGeneration) {
        throw new Error('User does not have generation access');
      }

      // Check generation limits
      if ((userProfile.monthlyGenerations || 0) >= 100) { // Default limit
        throw new Error('Monthly generation limit exceeded');
      }

      // Get user's trained model for personalization
      const userModel = await this.getUserModel(userId);

      // Create generation tracker
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tracker = await this.db.createGenerationTracker({
        userId,
        predictionId: generationId,
        prompt: request.conceptCard.fluxPrompt,
        style: 'editorial',
        status: 'processing',
      } as InsertGenerationTracker);

      // Start FLUX generation asynchronously
      this.startFluxGeneration(userId, request, generationId, tracker, userModel);

      // Update user profile stats
      await this.db.updateMayaProfile(userId, {
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
    tracker: GenerationTracker,
    userModel?: UserModel | null
  ): Promise<void> {
    try {
      // Prepare FLUX prompt with user model if available
      let fluxPrompt = request.conceptCard.fluxPrompt;

      if (userModel?.triggerWord && userModel.trainingStatus === 'completed') {
        // Add trigger word for personalized generation
        fluxPrompt = `${userModel.triggerWord}, ${fluxPrompt}`;
      }

      // Call Replicate FLUX API
      const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "flux-dev", // or flux-pro for premium
          input: {
            prompt: fluxPrompt,
            num_outputs: 4,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80,
            safety_tolerance: 2,
          }
        })
      });

      if (!replicateResponse.ok) {
        throw new Error(`Replicate API error: ${replicateResponse.status}`);
      }

      const predictionData = await replicateResponse.json();

      // Update tracker with prediction ID
      await this.db.updateGenerationTracker(tracker.id, {
        predictionId: predictionData.id,
        status: 'processing',
      });

      // Store generation result when complete
      this.monitorGenerationCompletion(userId, predictionData.id, tracker, request.conceptCard);

    } catch (error) {
      console.error('❌ MAYA: FLUX generation start failed:', error);

      // Update tracker with failure
      await this.db.updateGenerationTracker(tracker.id, {
        status: 'failed',
      });
    }
  }

  /**
   * Monitor generation completion
   */
  private async monitorGenerationCompletion(
    userId: string,
    predictionId: string,
    tracker: GenerationTracker,
    conceptCard: MayaGenerationRequest['conceptCard']
  ): Promise<void> {
    try {
      // Poll for completion (simplified - in production use webhooks)
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'succeeded') {
          // Generation completed successfully
          const imageUrls = statusData.output || [];

          // Update tracker
          await this.db.updateGenerationTracker(tracker.id, {
            status: 'completed',
            imageUrls: JSON.stringify(imageUrls),
            updatedAt: new Date(),
          });

          // Save images to database
          for (let i = 0; i < imageUrls.length; i++) {
            const imageData: InsertMayaImage = {
              userId,
              url: imageUrls[i],
              category: 'concept',
              subcategory: conceptCard.title.toLowerCase(),
              metadata: {
                conceptId: conceptCard.id,
                generationId: tracker.predictionId || `gen_${tracker.id}`,
                prompt: conceptCard.fluxPrompt,
                modelUsed: 'flux-dev',
              },
              viewCount: 0,
              shareCount: 0,
              downloadCount: 0,
            };
            await this.db.insertMayaImage(imageData);
          }

          return;
        } else if (statusData.status === 'failed') {
          // Generation failed
          await this.db.updateGenerationTracker(tracker.id, {
            status: 'failed',
          });
          console.error('❌ MAYA: Generation failed for', tracker.id);
          return;
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
        attempts++;
      }

      // Timeout
      await this.db.updateGenerationTracker(tracker.id, {
        status: 'failed',
      });
      console.error('❌ MAYA: Generation timeout for', tracker.id);

    } catch (error) {
      console.error('❌ MAYA: Generation monitoring failed:', error);
      await this.db.updateGenerationTracker(tracker.id, {
        status: 'failed',
      });
    }
  }

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
      // Find tracker by predictionId (which is stored in the predictionId field)
      const trackers = await this.db.getUserGenerationTrackers(userId);
      const tracker = trackers.find(t => t.predictionId === generationId);

      if (!tracker) {
        throw new Error('Generation not found');
      }

      if (tracker.status === 'completed') {
        const imageUrls = tracker.imageUrls ? JSON.parse(tracker.imageUrls) : [];
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
   * Extract concept cards from Maya response using the CORRECT format
   * Matches the Maya personality config format exactly:
   * [EMOJI] **CONCEPT NAME IN ALL CAPS**
   * [Description...]
   * FLUX_PROMPT: [Detailed prompt...]
   */
  private extractConceptCards(response: string): Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }> {
    const conceptCards = [];

    try {
      console.log('🔍 MAYA: Extracting concept cards from response:', response.substring(0, 500));
      
      // Split response by concept separators first
      const conceptSections = response.split(/---+/);
      
      for (const section of conceptSections) {
        if (section.trim().length < 50) continue; // Skip short sections
        
        // Enhanced regex pattern for more robust concept card extraction with flexible whitespace and newlines
        const emojiConceptPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*[\r\n]+([^*]+?)[\r\n]+\s*FLUX_PROMPT:\s*\[([^\]]+)\]/g;
        
        let match;
        while ((match = emojiConceptPattern.exec(section)) !== null) {
          const emoji = match[1].trim();
          const title = match[2].trim();
          let description = match[3].trim();
          let fluxPrompt = match[4].trim();
          
          // Clean up text
          description = description.replace(/\n+/g, ' ').trim();
          fluxPrompt = fluxPrompt.replace(/\[|\]/g, '').trim();
          
          if (title && description && title.length > 3 && description.length > 10) {
            console.log(`✅ MAYA: Found concept card - ${emoji} ${title}`);
            conceptCards.push({
              id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title,
              description,
              fluxPrompt,
              creativeLook: 'Professional',
              emoji,
            });
          }
        }
      }

      // Fallback: Try to find any concept-like patterns if no structured concepts found
      if (conceptCards.length === 0) {
        console.log('🔄 MAYA: No structured concepts found, trying fallback patterns...');
        
        const fallbackPatterns = [
          // Pattern for emoji + title format
          /([^\w\s])\s*\*\*([^*\n]+)\*\*([^]+?)(?=\n\n|$)/g,
          // Pattern for concepts with "concept" keyword
          /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi
        ];

        for (const pattern of fallbackPatterns) {
          let match;
          while ((match = pattern.exec(response)) !== null && conceptCards.length < 3) {
            let emoji = '📸', title = '', description = '';

            if (match.length === 4) {
              // Emoji + title + description format
              emoji = match[1];
              title = match[2].trim();
              description = match[3].trim().substring(0, 200);
            } else if (match.length === 3) {
              // Title + description format
              title = match[1].trim();
              description = match[2].trim();
            }

            if (title && description && title.length > 3 && description.length > 10) {
              conceptCards.push({
                id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                description,
                fluxPrompt: `Professional photo of sandra, ${title.toLowerCase()}, ${description.substring(0, 100)}`,
                creativeLook: 'Creative',
                emoji,
              });
            }
          }
        }
      }

      console.log(`🎯 MAYA: Extracted ${conceptCards.length} concept cards`);

    } catch (parseError) {
      console.error('❌ MAYA: Concept card extraction error:', parseError);
    }

    return conceptCards.slice(0, 5); // Allow up to 5 concepts as per Maya personality config
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

// Export singleton instance
export const mayaService = new MayaService(new DatabaseStorage());