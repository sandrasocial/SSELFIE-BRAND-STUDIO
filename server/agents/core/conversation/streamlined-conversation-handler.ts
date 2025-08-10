/**
 * STREAMLINED CONVERSATION HANDLER
 * OLGA's System Streamlining: Fast personality-first responses
 * Removes redundant validation and focuses on natural conversation flow
 */

import { PersonalityManager } from '../../personalities/personality-config';
import { ConversationPreservation } from './conversation-preservation';
import { claudeApiServiceSimple } from '../../../services/claude-api-service-simple';

export interface StreamlinedRequest {
  agentId: string;
  message: string;
  userId: string;
  conversationId?: string;
}

export interface StreamlinedResponse {
  success: boolean;
  response?: string;
  conversationId?: string;
  error?: string;
  processingTime?: number;
}

/**
 * STREAMLINED CONVERSATION PROCESSOR
 * Removes redundant validation layers for faster personality responses
 */
export class StreamlinedConversationHandler {
  
  /**
   * FAST PATH: Process conversation with minimal overhead
   * Prioritizes personality response over complex validation
   */
  static async processConversation(request: StreamlinedRequest): Promise<StreamlinedResponse> {
    const startTime = Date.now();
    
    try {
      // STEP 1: Quick validation (essential only)
      if (!request.agentId || !request.message?.trim() || !request.userId) {
        return {
          success: false,
          error: 'Missing required fields',
          processingTime: Date.now() - startTime
        };
      }

      console.log(`🚀 STREAMLINED: ${request.agentId} processing message (fast path)`);

      // STEP 2: Get or create conversation (optimized)
      const conversation = await ConversationPreservation.getOrCreateConversation(
        request.agentId,
        request.userId,
        request.conversationId
      );

      // STEP 3: Get personality prompt (no technical constraints)
      const personalityPrompt = PersonalityManager.getNaturalPrompt(request.agentId);

      // STEP 4: Process with Claude (direct path)
      const response = await claudeApiServiceSimple.processMessage({
        agentId: request.agentId,
        userId: request.userId,
        message: request.message,
        systemPrompt: personalityPrompt,
        conversationHistory: conversation.messageHistory.slice(-10) // Keep recent context only
      });

      // STEP 5: Save conversation (async - don't wait)
      this.saveConversationAsync(conversation, {
        role: 'user',
        content: request.message
      }, {
        role: 'assistant', 
        content: response
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ STREAMLINED: ${request.agentId} responded in ${processingTime}ms`);

      return {
        success: true,
        response,
        conversationId: conversation.conversationId,
        processingTime
      };

    } catch (error) {
      console.error(`❌ STREAMLINED ERROR for ${request.agentId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * ASYNC SAVE: Don't block personality response for database operations
   */
  private static async saveConversationAsync(
    conversation: any,
    userMessage: any,
    assistantMessage: any
  ): Promise<void> {
    try {
      // Add messages to conversation
      await ConversationPreservation.saveConversationWithPersonality(conversation, userMessage);
      await ConversationPreservation.saveConversationWithPersonality(conversation, assistantMessage);
    } catch (error) {
      console.error(`⚠️ ASYNC SAVE failed:`, error);
      // Don't throw - this shouldn't interrupt the response flow
    }
  }

  /**
   * PERSONALITY CHECK: Validate agent exists (minimal check)
   */
  static isValidAgent(agentId: string): boolean {
    // Simple check - if personality exists, agent is valid
    try {
      PersonalityManager.getNaturalPrompt(agentId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * HEALTH CHECK: Minimal system health validation
   */
  static async healthCheck(): Promise<{ healthy: boolean; issues?: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test Claude API
      await claudeApiServiceSimple.testConnection();
    } catch (error) {
      issues.push('Claude API connection');
    }

    // Test personality system
    try {
      PersonalityManager.getNaturalPrompt('maya');
    } catch (error) {
      issues.push('Personality system');
    }

    return {
      healthy: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }
}