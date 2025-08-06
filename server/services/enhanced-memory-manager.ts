/**
 * ENHANCED MEMORY MANAGER
 * Research-based conversation memory optimization for Claude API
 * Implements best practices: Local storage + minimal API context + smart summarization
 */

import { db } from '../db';
import { claudeMessages, claudeConversations } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface MemoryContext {
  recentMessages: any[];
  conversationSummary?: string;
  keyContext: string[];
  tokenEstimate: number;
}

export class EnhancedMemoryManager {
  private static instance: EnhancedMemoryManager;

  private constructor() {}

  public static getInstance(): EnhancedMemoryManager {
    if (!EnhancedMemoryManager.instance) {
      EnhancedMemoryManager.instance = new EnhancedMemoryManager();
    }
    return EnhancedMemoryManager.instance;
  }

  /**
   * SMART CONTEXT RETRIEVAL
   * Get optimal context for Claude API while maintaining full local memory access
   */
  async getSmartContext(
    conversationId: string,
    currentMessage: string,
    maxMessages: number = 3
  ): Promise<MemoryContext> {
    try {
      // Get recent messages for immediate context (minimal API tokens)
      const recentMessages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conversationId))
        .orderBy(desc(claudeMessages.timestamp))
        .limit(maxMessages);

      // Get conversation metadata for long-term context (stored locally)
      const [conversation] = await db
        .select()
        .from(claudeConversations)
        .where(eq(claudeConversations.conversationId, conversationId))
        .limit(1);

      // Extract key context without sending everything to API
      const keyContext = this.extractKeyContext(currentMessage, conversation?.context as any);
      
      // Estimate token usage (for monitoring)
      const tokenEstimate = this.estimateTokens(recentMessages, keyContext);

      console.log(`🧠 SMART CONTEXT: ${recentMessages.length} recent messages, ${keyContext.length} key contexts, ~${tokenEstimate} tokens`);

      return {
        recentMessages: recentMessages.reverse(), // Chronological order
        conversationSummary: conversation?.context?.summary,
        keyContext,
        tokenEstimate
      };

    } catch (error) {
      console.error('❌ Smart context retrieval failed:', error);
      return {
        recentMessages: [],
        keyContext: [],
        tokenEstimate: 0
      };
    }
  }

  /**
   * EXTRACT KEY CONTEXT
   * Identify relevant context based on current message without sending to API
   */
  private extractKeyContext(currentMessage: string, conversationContext: any): string[] {
    const keyContext: string[] = [];
    
    if (!conversationContext) return keyContext;

    // Extract relevant context based on message patterns
    const message = currentMessage.toLowerCase();
    
    // Code-related context
    if (message.includes('file') || message.includes('code') || message.includes('create')) {
      if (conversationContext.lastFiles) {
        keyContext.push(`Recent files: ${conversationContext.lastFiles.join(', ')}`);
      }
    }

    // Task continuity context
    if (message.includes('continue') || message.includes('next') || message.includes('then')) {
      if (conversationContext.lastTask) {
        keyContext.push(`Last task: ${conversationContext.lastTask}`);
      }
    }

    // Project context (minimal, not full project structure)
    if (message.includes('project') || message.includes('app') || message.includes('system')) {
      keyContext.push('Project: SSELFIE Studio AI platform');
    }

    return keyContext;
  }

  /**
   * ESTIMATE TOKENS
   * Rough token estimation for monitoring (not precise, but good enough)
   */
  private estimateTokens(messages: any[], keyContext: string[]): number {
    let estimate = 0;
    
    // Rough estimation: 1 token ≈ 4 characters
    messages.forEach(msg => {
      estimate += Math.ceil(msg.content.length / 4);
    });
    
    keyContext.forEach(context => {
      estimate += Math.ceil(context.length / 4);
    });

    return estimate;
  }

  /**
   * UPDATE CONVERSATION CONTEXT
   * Store key information locally for future context retrieval
   */
  async updateConversationContext(
    conversationId: string,
    newContext: {
      lastTask?: string;
      lastFiles?: string[];
      summary?: string;
    }
  ): Promise<void> {
    try {
      // Get existing context
      const [existing] = await db
        .select()
        .from(claudeConversations)
        .where(eq(claudeConversations.conversationId, conversationId))
        .limit(1);

      if (existing) {
        const updatedContext = {
          ...existing.context as any,
          ...newContext,
          lastUpdated: new Date().toISOString()
        };

        await db
          .update(claudeConversations)
          .set({ 
            context: updatedContext,
            updatedAt: new Date()
          })
          .where(eq(claudeConversations.conversationId, conversationId));

        console.log(`💾 CONTEXT UPDATED: Stored locally for ${conversationId}`);
      }
    } catch (error) {
      console.error('❌ Context update failed:', error);
    }
  }

  /**
   * GENERATE CONVERSATION SUMMARY
   * Create smart summaries for long conversations (using local processing)
   */
  async generateConversationSummary(conversationId: string): Promise<string> {
    try {
      // Get all messages for summarization
      const allMessages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conversationId))
        .orderBy(claudeMessages.timestamp);

      if (allMessages.length < 10) {
        return ''; // No summary needed for short conversations
      }

      // Simple local summarization (no API tokens used)
      const tasks = allMessages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .slice(-5); // Last 5 user requests

      const summary = `Recent conversation topics: ${tasks.join('; ')}`;
      
      console.log(`📝 SUMMARY GENERATED: Local processing for ${conversationId}`);
      return summary;

    } catch (error) {
      console.error('❌ Summary generation failed:', error);
      return '';
    }
  }
}

export const enhancedMemoryManager = EnhancedMemoryManager.getInstance();