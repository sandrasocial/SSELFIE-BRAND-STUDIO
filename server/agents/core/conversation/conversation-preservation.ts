/**
 * CONVERSATION PRESERVATION SYSTEM
 * OLGA's Step B: Fix context preservation with personality awareness
 * Prevents unnecessary state resets and maintains natural conversation flow
 */

import { storage } from '../../../storage';
import { PersonalityManager } from '../../personalities/personality-config';

// Storage interface extensions
interface StorageWithConversations {
  getConversation(id: string): Promise<any>;
  saveConversation(id: string, data: any): Promise<void>;
  getAgentMemory(agentId: string, userId: string): Promise<any>;
}

export interface PersonalityContext {
  agentId: string;
  userId: string;
  personalityState: any;
  conversationFlow: string[];
  lastPersonalityUpdate: Date;
  naturalContext: string;
}

export interface ConversationSession {
  conversationId: string;
  agentId: string;
  userId: string;
  messageHistory: any[];
  personalityContext: PersonalityContext;
  createdAt: Date;
  lastActivity: Date;
  shouldPreserve: boolean;
}

/**
 * Enhanced conversation preservation with personality awareness
 */
export class ConversationPreservation {
  private static readonly PRESERVE_THRESHOLD = 50; // Increased from 30 for natural flow
  private static readonly PERSONALITY_CACHE = new Map<string, PersonalityContext>();
  
  /**
   * OLGA'S FIX: Check if conversation exists before creating new
   * Prevents duplicate conversations and maintains continuity
   */
  static async getOrCreateConversation(
    agentId: string, 
    userId: string,
    conversationId?: string
  ): Promise<ConversationSession> {
    
    const sessionId = conversationId || `${agentId}_${userId}`;
    
    // STEP 1: Check if conversation already exists
    try {
      const storageWithConversations = storage as any;
      const existing = await storageWithConversations.getConversation(sessionId);
      if (existing && existing.messageHistory) {
        console.log(`🔄 PRESERVED: Found existing conversation for ${agentId} (${existing.messageHistory.length} messages)`);
        
        // Restore personality context
        await this.restorePersonalityContext(existing);
        
        return existing as ConversationSession;
      }
    } catch (error) {
      console.log(`🔍 No existing conversation found for ${sessionId}, creating new`);
    }
    
    // STEP 2: Create new conversation with personality initialization
    const personalityContext = await this.initializePersonalityContext(agentId, userId);
    
    const newSession: ConversationSession = {
      conversationId: sessionId,
      agentId,
      userId,
      messageHistory: [],
      personalityContext,
      createdAt: new Date(),
      lastActivity: new Date(),
      shouldPreserve: true
    };
    
    // Save immediately to prevent duplicates
    try {
      const storageWithConversations = storage as any;
      await storageWithConversations.saveConversation(sessionId, newSession);
      console.log(`✨ CREATED: New conversation for ${agentId} with personality preservation`);
    } catch (error) {
      console.log(`⚠️ Could not save conversation to storage, using in-memory session`);
    }
    
    return newSession;
  }
  
  /**
   * OLGA'S FIX: Initialize personality context without technical constraints
   */
  private static async initializePersonalityContext(
    agentId: string, 
    userId: string
  ): Promise<PersonalityContext> {
    
    const cacheKey = `${agentId}_${userId}`;
    
    // Check cache first
    const cached = this.PERSONALITY_CACHE.get(cacheKey);
    if (cached && this.isPersonalityCacheValid(cached)) {
      return cached;
    }
    
    // Create fresh personality context
    const personalityContext: PersonalityContext = {
      agentId,
      userId,
      personalityState: {
        naturalPrompt: PersonalityManager.getNaturalPrompt(agentId),
        conversationMode: 'natural',
        preservedTraits: await this.loadPreservedTraits(agentId, userId)
      },
      conversationFlow: [],
      lastPersonalityUpdate: new Date(),
      naturalContext: `Authentic ${agentId} personality active`
    };
    
    // Cache for quick access
    this.PERSONALITY_CACHE.set(cacheKey, personalityContext);
    
    console.log(`🎨 PERSONALITY: Initialized natural context for ${agentId}`);
    return personalityContext;
  }
  
  /**
   * OLGA'S FIX: Restore personality context from saved conversations
   */
  private static async restorePersonalityContext(session: ConversationSession): Promise<void> {
    if (!session.personalityContext) {
      // Rebuild personality context if missing
      session.personalityContext = await this.initializePersonalityContext(
        session.agentId, 
        session.userId
      );
    }
    
    // Update personality cache
    const cacheKey = `${session.agentId}_${session.userId}`;
    this.PERSONALITY_CACHE.set(cacheKey, session.personalityContext);
    
    console.log(`🎨 RESTORED: Personality context for ${session.agentId}`);
  }
  
  /**
   * OLGA'S FIX: Save conversation with personality preservation
   * Only saves when meaningful changes occur - prevents unnecessary writes
   */
  static async saveConversationWithPersonality(
    session: ConversationSession,
    newMessage?: any
  ): Promise<void> {
    
    // Add message if provided
    if (newMessage) {
      session.messageHistory.push(newMessage);
      session.lastActivity = new Date();
      
      // Update personality flow
      session.personalityContext.conversationFlow.push(
        `${newMessage.role}: ${newMessage.content.substring(0, 100)}...`
      );
    }
    
    // OLGA'S FIX: Intelligent preservation - only clear when truly necessary
    const shouldPreserve = this.shouldPreserveConversation(session);
    
    if (!shouldPreserve && session.messageHistory.length > this.PRESERVE_THRESHOLD) {
      await this.intelligentConversationTrimming(session);
    }
    
    // Save to database
    try {
      const storageWithConversations = storage as any;
      await storageWithConversations.saveConversation(session.conversationId, session);
      console.log(`💾 PRESERVED: Conversation saved for ${session.agentId} (${session.messageHistory.length} messages)`);
    } catch (error) {
      console.error(`❌ Failed to save conversation for ${session.agentId}:`, error);
    }
  }
  
  /**
   * OLGA'S FIX: Intelligent conversation preservation logic
   */
  private static shouldPreserveConversation(session: ConversationSession): boolean {
    // Always preserve personality-driven conversations
    if (PersonalityManager.shouldPreserveContext(
      session.messageHistory[session.messageHistory.length - 1]?.content || ''
    )) {
      return true;
    }
    
    // Preserve active creative sessions
    const recentActivity = new Date().getTime() - session.lastActivity.getTime();
    const isActive = recentActivity < 30 * 60 * 1000; // 30 minutes
    
    return isActive && session.messageHistory.length < this.PRESERVE_THRESHOLD;
  }
  
  /**
   * OLGA'S FIX: Intelligent trimming that preserves personality essence
   */
  private static async intelligentConversationTrimming(session: ConversationSession): Promise<void> {
    console.log(`🧠 SMART TRIM: Preserving personality essence for ${session.agentId}`);
    
    // Extract personality essence from conversation
    const personalityEssence = await this.extractPersonalityEssence(session);
    
    // Keep recent messages + personality summary
    const recentMessages = session.messageHistory.slice(-10);
    
    const personalitySummary = {
      role: 'system',
      content: `**PERSONALITY CONTEXT PRESERVED**\n\n${personalityEssence}\n\n**Continuing natural conversation...**`
    };
    
    session.messageHistory = [personalitySummary, ...recentMessages];
    
    console.log(`✂️ TRIMMED: Conversation preserved with personality essence (${session.messageHistory.length} messages)`);
  }
  
  /**
   * Extract personality essence without technical constraints
   */
  private static async extractPersonalityEssence(session: ConversationSession): Promise<string> {
    const flow = session.personalityContext.conversationFlow.slice(-10);
    const naturalContext = session.personalityContext.naturalContext;
    
    return `${naturalContext}\n\nRecent conversation flow:\n${flow.join('\n')}`;
  }
  
  /**
   * Load preserved personality traits from previous sessions
   */
  private static async loadPreservedTraits(agentId: string, userId: string): Promise<any> {
    try {
      const stored = await storage.getAgentMemory(agentId, userId);
      return stored?.personalityTraits || {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * Check if personality cache is still valid
   */
  private static isPersonalityCacheValid(context: PersonalityContext): boolean {
    const age = new Date().getTime() - context.lastPersonalityUpdate.getTime();
    return age < 2 * 60 * 60 * 1000; // 2 hours
  }
  
  /**
   * OLGA'S FIX: Clear personality cache when needed (removes unnecessary resets)
   */
  static clearPersonalityCache(agentId?: string, userId?: string): void {
    if (agentId && userId) {
      const cacheKey = `${agentId}_${userId}`;
      this.PERSONALITY_CACHE.delete(cacheKey);
      console.log(`🧹 CLEARED: Personality cache for ${agentId}`);
    } else {
      this.PERSONALITY_CACHE.clear();
      console.log(`🧹 CLEARED: All personality cache`);
    }
  }
}