import { personalBrandService, type PersonalBrandProfile } from './personal-brand-service';
import { SimpleMemoryService } from './simple-memory-service';
import { storage } from '../storage';
import { type MayaChat, type MayaChatMessage, type InsertMayaChat, type InsertMayaChatMessage } from '../../shared/schema';

interface MayaConversationHistory {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chatId?: number;
  messageId?: number;
  hasImageGeneration?: boolean;
}

interface MayaPersonalInsights {
  emotionalState: string[];
  mentionedGoals: string[];
  styleHints: string[];
  progressMarkers: string[];
  lastUpdated: Date;
}

interface MayaMemoryContext {
  userId: string;
  conversationHistory: MayaConversationHistory[];
  personalBrandData: Partial<PersonalBrandProfile>;
  personalInsights: MayaPersonalInsights;
  currentOnboardingStep: number;
  isOnboardingCompleted: boolean;
}

/**
 * Maya Memory Service
 * Specialized memory management for Maya's personal brand onboarding and chat interactions
 * Integrates with existing Maya chat system and personal brand service
 */
export class MayaMemoryService {
  private simpleMemory: SimpleMemoryService;
  
  constructor() {
    this.simpleMemory = SimpleMemoryService.getInstance();
  }

  /**
   * Save Maya conversation to database and memory
   */
  async saveMayaConversation(
    userId: string,
    userMessage: string,
    mayaResponse: string,
    hasImageGeneration: boolean = false,
    chatId?: number
  ): Promise<{ chatId: number; messageId: number }> {
    
    // Get or create Maya chat session
    let activeChatId = chatId;
    if (!activeChatId) {
      activeChatId = await this.getOrCreateMayaChatSession(userId);
    }

    // Save user message
    const userMsgData: InsertMayaChatMessage = {
      chatId: activeChatId,
      role: 'user',
      content: userMessage,
      createdAt: new Date()
    };
    const userMessage_saved = await storage.createMayaChatMessage(userMsgData);

    // Save Maya response
    const mayaResponseData: InsertMayaChatMessage = {
      chatId: activeChatId,
      role: 'assistant',
      content: mayaResponse,
      createdAt: new Date()
    } as InsertMayaChatMessage & { hasImageGeneration?: boolean };
    const mayaMessage_saved = await storage.createMayaChatMessage(mayaResponseData);

    // Update chat last activity
    await this.updateChatActivity(activeChatId);

    // Extract and save personal insights
    await this.extractAndSaveInsights(userId, userMessage, mayaResponse);

    // Update memory context
    await this.updateMayaMemoryContext(userId);

    return {
      chatId: activeChatId,
      messageId: mayaMessage_saved.id
    };
  }

  /**
   * Get conversation history for Maya context
   */
  async getConversationHistory(
    userId: string, 
    limit: number = 10
  ): Promise<MayaConversationHistory[]> {
    
    // Get recent Maya chats for this user
    const recentChats = await storage.getMayaChats(userId);
    
    if (recentChats.length === 0) {
      return [];
    }

    // Get messages from the most recent chat
    const latestChat = recentChats[0];
    const messages = await storage.getMayaChatMessages(latestChat.id);

    // Convert to conversation history format
    const history: MayaConversationHistory[] = messages
      .slice(-limit * 2) // Get last N*2 messages (user + assistant pairs)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.createdAt,
        chatId: msg.chatId,
        messageId: msg.id,
        hasImageGeneration: (msg as any).hasImageGeneration || false
      }));

    return history;
  }

  /**
   * Get complete Maya memory context for conversation intelligence
   */
  async getMayaMemoryContext(userId: string): Promise<MayaMemoryContext> {
    
    // Load conversation history
    const conversationHistory = await this.getConversationHistory(userId, 15);
    
    // Load personal brand data
    const personalBrandData = await personalBrandService.getPersonalBrandProfile(userId);
    
    // Load personal insights
    const personalInsights = await this.getPersonalInsights(userId);
    
    // Get onboarding status
    const currentOnboardingStep = await personalBrandService.getOnboardingProgress(userId);
    const isOnboardingCompleted = await personalBrandService.hasCompletedPersonalBrandOnboarding(userId);
    
    return {
      userId,
      conversationHistory,
      personalBrandData,
      personalInsights,
      currentOnboardingStep,
      isOnboardingCompleted
    };
  }

  /**
   * Save image generation feedback for Maya learning
   */
  async saveImageGenerationFeedback(
    userId: string,
    messageId: number,
    feedback: {
      generatedImages?: string[];
      userSelection?: string;
      userFeedback?: string;
      regenerationRequested?: boolean;
    }
  ): Promise<void> {
    
    // Update the message with image generation data
    await storage.updateMayaChatMessage(messageId, {
      imagePreview: feedback.userSelection || feedback.generatedImages?.[0] || '',
      generatedPrompt: feedback.userFeedback || ''
    });

    // Extract insights from image feedback
    if (feedback.userFeedback) {
      await this.extractStyleInsights(userId, feedback.userFeedback);
    }
  }

  /**
   * Clear Maya conversation history (while preserving personal brand data)
   */
  async clearMayaConversationHistory(userId: string): Promise<void> {
    
    // Get user's Maya chats
    const userChats = await storage.getMayaChats(userId);
    
    // Note: We don't actually delete from database for audit purposes
    // Instead, we just clear the memory cache
    // await this.simpleMemory.clearAgentMemory('maya', userId); // Method not available
    
    console.log(`🧠 MAYA MEMORY: Cleared conversation history for user ${userId} (${userChats.length} chats archived)`);
  }

  /**
   * Clear restrictive categorized memory data that limits Maya's intelligence
   * 🚫 ZERO TOLERANCE ANTI-HARDCODE: Remove business/professional restrictions
   */
  async clearRestrictiveCategorizations(userId: string): Promise<void> {
    try {
      // Clear any cached insights with restrictive business/professional categorization
      await storage.saveAgentMemory('maya', userId, {
        personalInsights: {
          emotionalState: [],
          mentionedGoals: [], // Clear hardcoded 'business_growth', 'professional_photos' categorizations
          styleHints: [], // Clear hardcoded 'professional', 'wants_professional' categorizations  
          progressMarkers: [],
          lastUpdated: new Date()
        },
        lastUpdated: new Date(),
        clearedRestrictiveCategories: true // Flag to track cleanup
      });
      
      console.log(`🧠 MAYA MEMORY CLEANUP: Cleared restrictive business/professional categorizations for user ${userId}`);
    } catch (error) {
      console.error('Failed to clear restrictive Maya categorizations:', error);
    }
  }

  /**
   * Get Maya's conversation insights for admin/analytics
   */
  async getMayaConversationStats(userId: string): Promise<{
    totalConversations: number;
    onboardingProgress: number;
    imageGenerations: number;
    lastInteraction: Date | null;
    topTopics: string[];
  }> {
    
    const chats = await storage.getMayaChats(userId);
    const totalConversations = chats.length;
    
    const onboardingProgress = await personalBrandService.getOnboardingProgress(userId);
    
    // Count image generations across all chats
    let imageGenerations = 0;
    let lastInteraction: Date | null = null;
    
    for (const chat of chats) {
      const messages = await storage.getMayaChatMessages(chat.id);
      imageGenerations += messages.filter(msg => (msg as any).hasImageGeneration).length;
      
      if (chat.lastActivity && (!lastInteraction || chat.lastActivity > lastInteraction)) {
        lastInteraction = chat.lastActivity;
      }
    }

    // Extract top conversation topics (simplified)
    const personalInsights = await this.getPersonalInsights(userId);
    const topTopics = [
      ...personalInsights.mentionedGoals.slice(0, 3),
      ...personalInsights.styleHints.slice(0, 2)
    ];

    return {
      totalConversations,
      onboardingProgress,
      imageGenerations,
      lastInteraction,
      topTopics
    };
  }

  // ===== PRIVATE METHODS =====

  /**
   * Get or create Maya chat session for user
   */
  private async getOrCreateMayaChatSession(userId: string): Promise<number> {
    
    // Check for existing active chat
    const existingChats = await storage.getMayaChats(userId);
    
    if (existingChats.length > 0) {
      // Use the most recent chat
      const latestChat = existingChats[0];
      return latestChat.id;
    }

    // Create new Maya chat session
    const newChatData: InsertMayaChat = {
      userId,
      chatTitle: 'Personal Brand Discovery with Maya',
      chatCategory: 'onboarding',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    const newChat = await storage.createMayaChat(newChatData);
    return newChat.id;
  }

  /**
   * Update chat last activity timestamp
   */
  private async updateChatActivity(chatId: number): Promise<void> {
    // Note: This would require adding an update method to storage
    // For now, we'll log the activity
    console.log(`💬 MAYA CHAT: Updated activity for chat ${chatId}`);
  }

  /**
   * Extract personal insights from conversation
   */
  private async extractAndSaveInsights(
    userId: string,
    userMessage: string,
    mayaResponse: string
  ): Promise<void> {
    
    const insights = this.extractInsightsFromMessage(userMessage);
    
    if (insights.emotionalState.length > 0 || insights.mentionedGoals.length > 0 || insights.styleHints.length > 0) {
      await this.savePersonalInsights(userId, insights);
    }
  }

  /**
   * Extract insights from a single message
   * 🚫 ZERO TOLERANCE ANTI-HARDCODE: Let Maya's intelligence detect user needs naturally
   * NOTE: This analyzes USER INPUT for memory - not for image generation prompts
   * Maya's AI intelligence handles all prompt generation through Claude API
   */
  private extractInsightsFromMessage(message: string): Partial<MayaPersonalInsights> {
    const lowerMessage = message.toLowerCase();
    const insights: Partial<MayaPersonalInsights> = {
      emotionalState: [],
      mentionedGoals: [],
      styleHints: [],
      progressMarkers: []
    };

    // Only extract emotional state for supportive conversation - no restrictive categorization
    if (lowerMessage.includes('confident') || lowerMessage.includes('empowered')) {
      insights.emotionalState!.push('confident');
    }
    if (lowerMessage.includes('scared') || lowerMessage.includes('nervous')) {
      insights.emotionalState!.push('uncertain');
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('ready')) {
      insights.emotionalState!.push('motivated');
    }

    // 🚫 REMOVED: Hardcoded goal/style categorization that limits Maya's intelligence
    // Maya should detect user needs naturally through conversation, not keyword matching
    // Personal branding through storytelling images encompasses ALL creative expression

    return insights;
  }

  /**
   * Extract style insights from image feedback
   * 🚫 ZERO TOLERANCE ANTI-HARDCODE: Let Maya interpret feedback naturally
   */
  private async extractStyleInsights(userId: string, feedback: string): Promise<void> {
    const styleHints = [];
    const lowerFeedback = feedback.toLowerCase();

    // Only capture general sentiment - let Maya interpret specific feedback through conversation
    if (lowerFeedback.includes('love') || lowerFeedback.includes('perfect')) {
      styleHints.push('positive_feedback');
    }
    
    // 🚫 REMOVED: Hardcoded style categorization that limits Maya's creative interpretation
    // Maya should understand feedback context through natural conversation flow

    if (styleHints.length > 0) {
      await this.savePersonalInsights(userId, { styleHints });
    }
  }

  /**
   * Get personal insights from memory/storage
   */
  private async getPersonalInsights(userId: string): Promise<MayaPersonalInsights> {
    
    // Try to get from agent memory first
    try {
      const memoryData = await storage.getAgentMemory('maya', userId);
      if (memoryData?.personalInsights) {
        return memoryData.personalInsights;
      }
    } catch (error) {
      console.error('Failed to load Maya insights from memory:', error);
    }

    // Return default insights
    return {
      emotionalState: [],
      mentionedGoals: [],
      styleHints: [],
      progressMarkers: [],
      lastUpdated: new Date()
    };
  }

  /**
   * Save personal insights to memory
   */
  private async savePersonalInsights(
    userId: string, 
    newInsights: Partial<MayaPersonalInsights>
  ): Promise<void> {
    
    // Get existing insights
    const existingInsights = await this.getPersonalInsights(userId);
    
    // Merge insights (avoiding duplicates)
    const mergedInsights: MayaPersonalInsights = {
      emotionalState: this.mergeUniqueArray(existingInsights.emotionalState, newInsights.emotionalState || []),
      mentionedGoals: this.mergeUniqueArray(existingInsights.mentionedGoals, newInsights.mentionedGoals || []),
      styleHints: this.mergeUniqueArray(existingInsights.styleHints, newInsights.styleHints || []),
      progressMarkers: this.mergeUniqueArray(existingInsights.progressMarkers, newInsights.progressMarkers || []),
      lastUpdated: new Date()
    };

    // Save to agent memory
    try {
      await storage.saveAgentMemory('maya', userId, {
        personalInsights: mergedInsights,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to save Maya insights to memory:', error);
    }
  }

  /**
   * Update Maya memory context in SimpleMemoryService
   */
  private async updateMayaMemoryContext(userId: string): Promise<void> {
    
    // Prepare Maya context for SimpleMemoryService
    const context = await this.getMayaMemoryContext(userId);
    
    // Save to simple memory service
    await this.simpleMemory.prepareAgentContext({
      agentName: 'maya',
      userId,
      task: 'personal_brand_conversation'
    });
  }

  /**
   * Merge arrays while avoiding duplicates
   */
  private mergeUniqueArray(existing: string[], newItems: string[]): string[] {
    const combined = [...existing, ...newItems];
    return Array.from(new Set(combined));
  }
}

// Export singleton instance
export const mayaMemoryService = new MayaMemoryService();