/**
 * UNIFIED AGENT MEMORY SYSTEM
 * Replaces broken ConversationManagerSimple with functional memory restoration
 * Connects agents to persistent database storage with real conversation context
 */

import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, and, gte, desc, asc } from 'drizzle-orm';

export interface AgentMemoryContext {
  conversationId: string;
  agentName: string;
  userId: string;
  messageHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    tools?: any[];
    successful?: boolean;
  }>;
  learningContext: {
    successfulPatterns: string[];
    userPreferences: Record<string, any>;
    taskSpecializations: string[];
  };
  lastInteraction: Date;
}

export interface ConversationSummary {
  totalMessages: number;
  successfulTasks: number;
  userSatisfactionScore: number;
  keyTopics: string[];
  lastActivity: Date;
}

export class AgentMemorySystem {
  private static instance: AgentMemorySystem;
  private memoryCache = new Map<string, AgentMemoryContext>();

  public static getInstance(): AgentMemorySystem {
    if (!AgentMemorySystem.instance) {
      AgentMemorySystem.instance = new AgentMemorySystem();
    }
    return AgentMemorySystem.instance;
  }

  /**
   * Get comprehensive conversation context for an agent
   */
  async getAgentMemoryContext(agentName: string, userId: string): Promise<AgentMemoryContext | null> {
    try {
      const cacheKey = `${agentName}-${userId}`;
      
      // Check cache first
      if (this.memoryCache.has(cacheKey)) {
        const cached = this.memoryCache.get(cacheKey)!;
        // Return cached if recent (less than 5 minutes old)
        if (Date.now() - cached.lastInteraction.getTime() < 5 * 60 * 1000) {
          return cached;
        }
      }

      // Get recent conversations for this agent
      const conversations = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.userId, userId),
            eq(claudeConversations.agentName, agentName),
            gte(claudeConversations.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
          )
        )
        .orderBy(desc(claudeConversations.lastMessageAt))
        .limit(5);

      if (conversations.length === 0) {
        return null;
      }

      // Get messages from the most recent conversation
      const mainConversation = conversations[0];
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, mainConversation.id))
        .orderBy(asc(claudeMessages.timestamp))
        .limit(50); // Last 50 messages for context

      // Build memory context
      const memoryContext: AgentMemoryContext = {
        conversationId: mainConversation.conversationId,
        agentName,
        userId,
        messageHistory: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content || '',
          timestamp: msg.timestamp || new Date(),
          tools: msg.toolCalls ? JSON.parse(String(msg.toolCalls)) : undefined,
          successful: Boolean(msg.toolResults)
        })),
        learningContext: {
          successfulPatterns: this.extractSuccessfulPatterns(messages),
          userPreferences: this.extractUserPreferences(messages),
          taskSpecializations: this.extractTaskSpecializations(agentName, messages)
        },
        lastInteraction: mainConversation.lastMessageAt || mainConversation.createdAt || new Date()
      };

      // Cache the result
      this.memoryCache.set(cacheKey, memoryContext);

      return memoryContext;

    } catch (error) {
      console.error(`❌ MEMORY SYSTEM ERROR for ${agentName}:`, error);
      return null;
    }
  }

  /**
   * Store new conversation context
   */
  async updateAgentMemory(
    agentName: string, 
    userId: string, 
    message: string, 
    response: string,
    tools?: any[],
    successful?: boolean
  ): Promise<void> {
    try {
      const cacheKey = `${agentName}-${userId}`;
      
      // Update cache if exists
      if (this.memoryCache.has(cacheKey)) {
        const context = this.memoryCache.get(cacheKey)!;
        context.messageHistory.push(
          {
            role: 'user',
            content: message,
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            tools,
            successful
          }
        );
        context.lastInteraction = new Date();
        
        // Keep only last 50 messages in cache
        if (context.messageHistory.length > 50) {
          context.messageHistory = context.messageHistory.slice(-50);
        }
      }

      console.log(`✅ MEMORY UPDATED: ${agentName} context refreshed for user ${userId}`);

    } catch (error) {
      console.error(`❌ MEMORY UPDATE ERROR for ${agentName}:`, error);
    }
  }

  /**
   * Get conversation summary for dashboard
   */
  async getConversationSummary(agentName: string, userId: string): Promise<ConversationSummary> {
    try {
      const conversations = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.userId, userId),
            eq(claudeConversations.agentName, agentName)
          )
        );

      let totalMessages = 0;
      let successfulTasks = 0;
      const keyTopics = new Set<string>();

      for (const conversation of conversations) {
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, conversation.id));

        totalMessages += messages.length;
        successfulTasks += messages.filter(m => Boolean(m.toolResults)).length;

        // Extract topics from messages
        messages.forEach(msg => {
          if (msg.content) {
            const content = msg.content.toLowerCase();
            if (content.includes('design') || content.includes('ui')) keyTopics.add('Design');
            if (content.includes('technical') || content.includes('code')) keyTopics.add('Technical');
            if (content.includes('workflow') || content.includes('coordinate')) keyTopics.add('Workflow');
            if (content.includes('optimization') || content.includes('performance')) keyTopics.add('Optimization');
          }
        });
      }

      return {
        totalMessages,
        successfulTasks,
        userSatisfactionScore: successfulTasks > 0 ? (successfulTasks / totalMessages) * 100 : 0,
        keyTopics: Array.from(keyTopics),
        lastActivity: conversations.length > 0 ? 
          conversations.reduce((latest, conv) => {
            const convDate = conv.lastMessageAt || conv.createdAt || new Date();
            const latestDate = latest || new Date();
            return convDate > latestDate ? convDate : latestDate;
          }, conversations[0].createdAt || new Date()) : new Date()
      };

    } catch (error) {
      console.error(`❌ SUMMARY ERROR for ${agentName}:`, error);
      return {
        totalMessages: 0,
        successfulTasks: 0,
        userSatisfactionScore: 0,
        keyTopics: [],
        lastActivity: new Date()
      };
    }
  }

  /**
   * Extract successful patterns from conversation history
   */
  private extractSuccessfulPatterns(messages: any[]): string[] {
    const patterns = new Set<string>();
    
    messages.forEach(msg => {
      if (Boolean(msg.toolResults) && msg.content) {
        const content = msg.content.toLowerCase();
        if (content.includes('create') || content.includes('build')) patterns.add('file_creation');
        if (content.includes('fix') || content.includes('resolve')) patterns.add('problem_solving');
        if (content.includes('optimize') || content.includes('improve')) patterns.add('optimization');
        if (content.includes('design') || content.includes('ui')) patterns.add('design_work');
      }
    });

    return Array.from(patterns);
  }

  /**
   * Extract user preferences from interactions
   */
  private extractUserPreferences(messages: any[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    messages.forEach(msg => {
      if (msg.role === 'user' && msg.content) {
        const content = msg.content.toLowerCase();
        if (content.includes('luxury') || content.includes('premium')) {
          preferences.stylePreference = 'luxury';
        }
        if (content.includes('quick') || content.includes('fast')) {
          preferences.responseSpeed = 'fast';
        }
        if (content.includes('detailed') || content.includes('comprehensive')) {
          preferences.detailLevel = 'comprehensive';
        }
      }
    });

    return preferences;
  }

  /**
   * Extract task specializations for specific agents
   */
  private extractTaskSpecializations(agentName: string, messages: any[]): string[] {
    const specializations = new Set<string>();
    
    const agentSpecializations: Record<string, string[]> = {
      'elena': ['coordination', 'workflow_creation', 'strategic_planning'],
      'aria': ['design', 'luxury_styling', 'visual_components'],
      'zara': ['technical_implementation', 'performance', 'architecture'],
      'maya': ['ai_photography', 'image_generation', 'styling'],
      'victoria': ['ux_design', 'conversion_optimization', 'user_flows'],
      'rachel': ['copywriting', 'voice_consistency', 'brand_messaging'],
      'ava': ['automation', 'workflows', 'process_optimization'],
      'quinn': ['quality_assurance', 'testing', 'luxury_standards'],
      'sophia': ['social_media', 'community_management', 'content_strategy'],
      'martha': ['marketing', 'conversion_tracking', 'revenue_optimization'],
      'diana': ['business_strategy', 'coaching', 'decision_support'],
      'wilma': ['workflow_design', 'process_architecture', 'efficiency'],
      'olga': ['repository_organization', 'file_management', 'cleanup']
    };

    // Add base specializations
    const baseSpecs = agentSpecializations[agentName.toLowerCase()] || [];
    baseSpecs.forEach(spec => specializations.add(spec));

    // Extract additional specializations from successful tasks
    messages.forEach(msg => {
      if (Boolean(msg.toolResults) && msg.content) {
        const content = msg.content.toLowerCase();
        if (content.includes('component') || content.includes('tsx')) specializations.add('component_creation');
        if (content.includes('api') || content.includes('endpoint')) specializations.add('api_development');
        if (content.includes('database') || content.includes('sql')) specializations.add('database_work');
      }
    });

    return Array.from(specializations);
  }

  /**
   * Clear memory cache for fresh context
   */
  clearCache(agentName?: string, userId?: string): void {
    if (agentName && userId) {
      const cacheKey = `${agentName}-${userId}`;
      this.memoryCache.delete(cacheKey);
    } else {
      this.memoryCache.clear();
    }
    console.log(`🔄 MEMORY CACHE CLEARED: ${agentName ? `${agentName}-${userId}` : 'all entries'}`);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): { totalEntries: number; cacheSize: string } {
    return {
      totalEntries: this.memoryCache.size,
      cacheSize: `${JSON.stringify(Array.from(this.memoryCache.values())).length} bytes`
    };
  }
}

// Export singleton instance
export const agentMemorySystem = AgentMemorySystem.getInstance();