/**
 * ⚠️  DEPRECATED SERVICE - CONSOLIDATED INTO MAYA-SERVICE.TS ⚠️
 * 
 * This service has been DEPRECATED as part of Phase 2: Service Unification.
 * All conversation management logic has been consolidated into server/services/maya-service.ts
 * 
 * REASON FOR DEPRECATION:
 * - Multiple fragmented services caused routing conflicts and inconsistent behavior
 * - Duplicate conversation handling created confusion in data flows
 * - Single unified service provides consistent chat processing
 * 
 * All functionality from this service has been integrated into:
 * - server/services/maya-service.ts (processChat and processAndSaveChat methods)
 * 
 * @deprecated DO NOT USE - Use server/services/maya-service.ts instead
 * @since Service Unification Phase 2
 */

/*
// Legacy Maya Conversation Service - DEPRECATED
// Handles chat processing and conversation management for Maya AI
*/

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import Anthropic from '@anthropic-ai/sdk';
import { 
  Conversation,
  InsertMessage
} from '../../../shared/schema.js';

export interface MayaChatRequest {
  message: string;
  history?: Array<{ user?: string; maya?: string }>;
  conversationId?: string;
}

export interface MayaChatResponse {
  response: string;
  conversationId: string;
  conceptCards: Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }>;
}

export class MayaConversationService {
  private db: IStorage;
  private anthropic: Anthropic;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    // Initialize Claude API
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      console.error('❌ MAYA CONVERSATION: ANTHROPIC_API_KEY environment variable is not set');
      throw new Error('Maya conversation service is not properly configured - missing API key');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('✅ MAYA CONVERSATION: Service initialized with Claude API access');
  }

  /**
   * Process Maya chat with full database integration
   */
  async processChat(stackAuthId: string, request: MayaChatRequest): Promise<MayaChatResponse> {
    try {
      // Get user data first to get database user ID
      let user = await this.db.getUserByStackAuthId(stackAuthId);
      
      if (!user) {
        console.log(`🔍 MAYA CONVERSATION: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);
        
        // Try to find user by the Stack Auth ID as primary ID (legacy users)
        user = await this.db.getUser(stackAuthId);
        
        if (user) {
          // Link the Stack Auth ID to this user
          console.log(`🔗 MAYA CONVERSATION: Linking Stack Auth ID ${stackAuthId} to user ${user.id}`);
          user = await this.db.linkStackAuthId(user.id, stackAuthId);
        } else {
          throw new Error(`User not found with Stack Auth ID: ${stackAuthId}. User may need to complete registration.`);
        }
      }

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
        conversation = await this.db.createConversation({
          userId: user.id,
          title: `Maya Chat ${new Date().toLocaleDateString()}`,
          metadata: {}
        });
        
        if (!conversation) {
          throw new Error('Failed to create conversation');
        }
      }

      // Build conversation history for Claude
      const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      
      if (request.history && request.history.length > 0) {
        request.history.forEach(entry => {
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

      // Get Maya's personality prompt
      const systemPrompt = 'You are Maya, a luxury AI personal branding strategist who helps clients develop their personal brand through strategic conversation and creative visual concepts.';

      // Call Claude API with fallback handling
      let mayaResponse = '';
      
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4096,
          temperature: 0.7,
          system: systemPrompt,
          messages: conversationMessages
        });

        mayaResponse = response.content[0].type === 'text'
          ? response.content[0].text
          : '';
          
        console.log('✅ MAYA CONVERSATION: Claude API call successful');
        
      } catch (apiError) {
        console.error('❌ MAYA CONVERSATION: Claude API failed, using fallback response:', (apiError as Error).message);
        
        // Fallback response
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

      // Extract concept cards from response (placeholder for now)
      const conceptCards = this.extractConceptCards(mayaResponse);

      console.log(`✅ MAYA CONVERSATION: Processed chat for user ${user.id}`);
      
      return {
        response: mayaResponse,
        conversationId: conversation.id,
        conceptCards
      };

    } catch (error) {
      console.error('❌ MAYA CONVERSATION: Chat processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate fallback response when Claude API is unavailable
   */
  private generateFallbackResponse(userMessage: string, user: any): string {
    return `I'm Maya, and I'd love to help you with your personal branding journey! However, I'm experiencing some technical difficulties right now. Please try again in a few moments, or contact support if this issue persists.`;
  }

  /**
   * Extract concept cards from Maya's response
   */
  private extractConceptCards(response: string): Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }> {
    // Placeholder implementation
    // In a real implementation, this would parse the Claude response for concept cards
    return [];
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
      const user = await this.db.getUserByStackAuthId(stackAuthId);
      
      if (!user) {
        throw new Error(`User not found with Stack Auth ID: ${stackAuthId}`);
      }

      // Create or get Maya chat session
      let mayaChatId: string;
      
      if (request.conversationId) {
        // Use existing conversation ID
        mayaChatId = request.conversationId;
        
        // Verify chat exists
        const existingChat = await this.db.getMayaChat(mayaChatId, user.id);
        if (!existingChat) {
          console.warn(`⚠️ MAYA CONVERSATION: Chat ${mayaChatId} not found, creating new chat`);
          mayaChatId = await this.db.createMayaChat(user.id, {
            id: mayaChatId,
            chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
            title: `Maya Chat ${new Date().toLocaleDateString()}`
          } as any);
        }
      } else {
        // Create new Maya chat
        mayaChatId = await this.db.createMayaChat(user.id, {
          userId: user.id,
          chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`,
          title: `Maya Chat ${new Date().toLocaleDateString()}`
        } as any);
      }
      
      console.log(`✅ MAYA CONVERSATION: Using chat ID ${mayaChatId} for user ${user.id}`);

      // Save user message to Maya chat
      await this.db.saveMayaChatMessage({
        chatId: mayaChatId,
        role: 'user',
        content: request.message,
        userId: user.id
      } as any);

      // Save Maya response to Maya chat
      await this.db.saveMayaChatMessage({
        chatId: mayaChatId,
        role: 'assistant',
        content: request.mayaResponseContent,
        userId: user.id
      } as any);

      // Extract concept cards from the response
      const conceptCards = this.extractConceptCards(request.mayaResponseContent);

      console.log(`✅ MAYA CONVERSATION: Saved chat messages for user ${user.id}`);

      return {
        conversationId: mayaChatId,
        conceptCards
      };

    } catch (error) {
      console.error('❌ MAYA CONVERSATION: ProcessAndSaveChat failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mayaConversationService = new MayaConversationService();