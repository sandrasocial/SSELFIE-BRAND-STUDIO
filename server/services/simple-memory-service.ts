/**
 * SIMPLE MEMORY SERVICE
 * Consolidates essential memory functionality from 4 competing systems into one clean interface
 * Eliminates: UnifiedMemoryController, AdvancedMemorySystem, ContextPreservationSystem, TokenOptimizationEngine
 */

interface AgentMemoryOptions {
  agentName: string;
  userId: string;
  task?: string;
  isAdminBypass?: boolean;
}

interface AgentContext {
  agentName: string;
  userId: string;
  currentTask: string;
  adminPrivileges: boolean;
  memories: any[];
  timestamp: Date;
}

/**
 * Single memory service that replaces all competing systems
 * Focuses on essential functionality only
 */
export class SimpleMemoryService {
  private static instance: SimpleMemoryService;
  private contextCache = new Map<string, AgentContext>();

  private constructor() {}

  public static getInstance(): SimpleMemoryService {
    if (!SimpleMemoryService.instance) {
      SimpleMemoryService.instance = new SimpleMemoryService();
    }
    return SimpleMemoryService.instance;
  }

  /**
   * EMERGENCY FIX: Enhanced agent context preparation with persistence loading
   * Replaces all the complex memory loading from 4 systems
   */
  async prepareAgentContext(options: AgentMemoryOptions): Promise<AgentContext> {
    const { agentName, userId, task = '', isAdminBypass = false } = options;
    const cacheKey = `${agentName}-${userId}`;

    // Check cache first (simple, single cache)
    const cached = this.contextCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      // Update task and timestamp for current interaction
      cached.currentTask = task;
      cached.timestamp = new Date();
      console.log(`🧠 MEMORY: Using cached context for ${agentName} (${cached.memories.length} memories)`);
      return cached;
    }

    // EMERGENCY FIX: Load persisted memories for better continuity
    const persistedMemories = await this.loadPersistedMemories(agentName, userId);

    // Build enhanced context with persisted memories
    const context: AgentContext = {
      agentName,
      userId,
      currentTask: task,
      adminPrivileges: isAdminBypass,
      memories: persistedMemories, // Load from persistence
      timestamp: new Date()
    };

    // Cache for reuse (single cache, no conflicts)
    this.contextCache.set(cacheKey, context);
    console.log(`🧠 MEMORY: Enhanced context prepared for ${agentName}${isAdminBypass ? ' [ADMIN]' : ''} with ${persistedMemories.length} persisted memories`);

    return context;
  }

  /**
   * EMERGENCY FIX: Enhanced memory saving with persistence
   * Saves both to cache and attempts database persistence
   */
  async saveAgentMemory(context: AgentContext, data: any): Promise<void> {
    const cacheKey = `${context.agentName}-${context.userId}`;
    
    // Update context with enhanced data
    const memoryEntry = {
      data,
      timestamp: new Date(),
      task: context.currentTask,
      conversationId: data.conversationId || 'admin-session',
      messageText: data.userMessage || data.currentTask || '',
      sessionType: data.sessionType || 'admin'
    };
    
    context.memories.push(memoryEntry);
    
    // Keep only last 20 memories to prevent memory bloat
    if (context.memories.length > 20) {
      context.memories = context.memories.slice(-20);
    }

    // Update cache (single source of truth)
    this.contextCache.set(cacheKey, context);
    
    // ENHANCED: Try to persist to database for better persistence
    try {
      await this.persistMemoryToDatabase(context.agentName, context.userId, memoryEntry);
    } catch (error) {
      console.warn(`🧠 MEMORY: Database persistence failed for ${context.agentName}, using cache only`);
    }
    
    console.log(`🧠 MEMORY: Enhanced memory saved for ${context.agentName} (${context.memories.length} total memories)`);
  }

  /**
   * ESSENTIAL: Clear memory when needed
   * Replaces complex cache invalidation from multiple systems
   */
  clearAgentMemory(agentName: string, userId: string): void {
    const cacheKey = `${agentName}-${userId}`;
    this.contextCache.delete(cacheKey);
    console.log(`🧠 MEMORY: Cleared memory for ${agentName}`);
  }

  /**
   * Check if cached context is still valid (simple logic)
   */
  private isCacheValid(context: AgentContext): boolean {
    const now = new Date();
    const age = now.getTime() - context.timestamp.getTime();
    const maxAge = 12 * 60 * 60 * 1000; // EMERGENCY FIX: Extended to 12 hours for long admin sessions
    return age < maxAge;
  }

  /**
   * COMPATIBILITY: Methods to replace the old complex systems
   */
  
  // Replaces ContextPreservationSystem.prepareAgentWorkspace
  async prepareAgentWorkspace(agentName: string, userId: string, task: string, isAdminBypass: boolean = false) {
    return this.prepareAgentContext({ agentName, userId, task, isAdminBypass });
  }

  // Replaces AdvancedMemorySystem.getAgentMemoryProfile  
  async getAgentMemoryProfile(agentName: string, userId: string, adminBypass: boolean = false) {
    const context = await this.prepareAgentContext({ agentName, userId, isAdminBypass: adminBypass });
    // FIXED: Return actual context data instead of empty profile
    return {
      agentName,
      userId,
      memoryStrength: 1.0,
      learningPatterns: context.memories.slice(-5), // Include recent memories
      intelligenceLevel: adminBypass ? 10 : 7,
      adminBypass,
      context: context, // CRITICAL: Include actual context for use
      memoryCount: context.memories.length
    };
  }

  // EMERGENCY FIX: Liberal message analysis - treat ALL non-greetings as work tasks
  analyzeMessage(message: string) {
    const isGreeting = /^(hey|hi|hello)$/i.test(message.trim());
    const isContinuation = /^(yes|ok|perfect|continue|proceed|great|excellent)$/i.test(message.trim());
    
    // EMERGENCY FIX: Treat ALL admin messages as work tasks to ensure memory saving
    const isWorkTask = !isGreeting || message.length > 5; // Almost everything is a work task
    
    return {
      isContinuation,
      isWorkTask: true, // FORCE all admin interactions to be saved
      contextLevel: 'full' // Always use full context for admin agents
    };
  }

  /**
   * EMERGENCY FIX: Enhanced persistence layer
   * Attempts to persist admin agent memories to database
   */
  private async persistMemoryToDatabase(agentName: string, userId: string, memoryEntry: any): Promise<void> {
    try {
      // Import database dynamically to avoid circular dependencies
      const { db } = await import('../db');
      const { claudeConversations, claudeMessages } = await import('@shared/schema');
      
      // Store in existing conversation tables with admin markers
      const conversationId = `admin_${agentName}_${userId}_${Date.now()}`;
      
      // Generate proper UUID for admin messages
      const { nanoid } = await import('nanoid');
      const messageId = `admin_${nanoid()}_${Date.now()}`;
      
      await db.insert(claudeMessages).values({
        id: messageId,
        conversationId: conversationId,
        role: 'user',
        content: memoryEntry.messageText || memoryEntry.data?.currentTask || 'Admin interaction',
        createdAt: new Date(),
        metadata: {
          agentName,
          sessionType: 'admin_memory',
          isAdminBypass: true,
          memoryData: memoryEntry.data
        }
      });
      
      console.log(`💾 PERSISTENCE: Admin memory saved to database for ${agentName}`);
    } catch (error) {
      // Fail silently - cache will still work
      console.warn(`💾 PERSISTENCE: Database save failed for ${agentName}:`, error.message);
    }
  }

  /**
   * EMERGENCY FIX: Load persisted memories on startup
   */
  async loadPersistedMemories(agentName: string, userId: string): Promise<any[]> {
    try {
      const { db } = await import('../db');
      const { claudeMessages } = await import('@shared/schema');
      const { eq, and, desc } = await import('drizzle-orm');
      
      // Fix metadata query - use proper JSON path querying
      const { sql } = await import('drizzle-orm');
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(and(
          sql`${claudeMessages.metadata}->>'agentName' = ${agentName}`,
          eq(claudeMessages.role, 'user')
        ))
        .orderBy(desc(claudeMessages.createdAt))
        .limit(10);
        
      return messages.map(msg => ({
        data: {
          currentTask: msg.content,
          userMessage: msg.content,
          timestamp: msg.createdAt
        },
        timestamp: msg.createdAt,
        task: msg.content
      }));
    } catch (error) {
      console.warn(`💾 PERSISTENCE: Could not load persisted memories for ${agentName}`);
      return [];
    }
  }
}

// Export singleton instance
export const simpleMemoryService = SimpleMemoryService.getInstance();