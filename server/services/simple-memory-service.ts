/**
 * CONSOLIDATED MEMORY SERVICE - OLGA'S PLAN IMPLEMENTATION
 * Single memory service with database persistence and 12-hour cache
 * Replaces all competing memory systems with unified approach
 */

import { storage } from '../storage';

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
   * OLGA'S FIX: Enhanced context preparation with database memory loading
   * Restores persisted memories and eliminates memory loss between sessions
   */
  async prepareAgentContext(options: AgentMemoryOptions): Promise<AgentContext> {
    const { agentName, userId, task = '', isAdminBypass = false } = options;
    const cacheKey = `${agentName}-${userId}`;

    // Check cache first (fast path)
    const cached = this.contextCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`🧠 MEMORY: Using cached context for ${agentName} (${cached.memories.length} memories)`);
      return cached;
    }

    // OLGA'S FIX: Load persisted memories from database
    let persistedMemories = [];
    try {
      const persistedData = await storage.getAgentMemory(agentName, userId);
      if (persistedData && persistedData.context && persistedData.context.memories) {
        persistedMemories = persistedData.context.memories;
        console.log(`💾 LOADED: ${persistedMemories.length} persisted memories for ${agentName}`);
      }
    } catch (error) {
      console.error(`⚠️ Failed to load persisted memories for ${agentName}:`, error);
    }

    // Build context with restored memories
    const context: AgentContext = {
      agentName,
      userId,
      currentTask: task,
      adminPrivileges: isAdminBypass,
      memories: persistedMemories, // OLGA'S FIX: Start with persisted memories
      timestamp: new Date()
    };

    // Cache for reuse (single cache, no conflicts)
    this.contextCache.set(cacheKey, context);
    console.log(`🧠 MEMORY: Prepared context for ${agentName}${isAdminBypass ? ' [ADMIN]' : ''} (${persistedMemories.length} restored)`);

    return context;
  }

  /**
   * OLGA'S FIX: Save agent memory with database persistence
   * Replaces in-memory only storage with reliable database backup
   */
  async saveAgentMemory(context: AgentContext, data: any): Promise<void> {
    const cacheKey = `${context.agentName}-${context.userId}`;
    
    // Update context with new data
    const memoryItem = {
      data,
      timestamp: new Date(),
      task: context.currentTask
    };
    
    context.memories.push(memoryItem);

    // Update cache (keep for speed)
    this.contextCache.set(cacheKey, context);
    
    // OLGA'S FIX: Add database persistence for reliability
    try {
      await storage.saveAgentMemory(context.agentName, context.userId, {
        context: context,
        latestMemory: memoryItem,
        totalMemories: context.memories.length
      });
      console.log(`💾 PERSISTENCE: Admin memory saved to database for ${context.agentName}`);
    } catch (error) {
      console.error(`❌ Database persistence failed for ${context.agentName}:`, error);
    }
    
    console.log(`🧠 MEMORY: Saved memory for ${context.agentName} (${context.memories.length} total)`);
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
   * OLGA'S FIX: Extended cache duration from 2 hours to 12 hours
   * Prevents conversation losses during long development sessions
   */
  private isCacheValid(context: AgentContext): boolean {
    const now = new Date();
    const age = now.getTime() - context.timestamp.getTime();
    const maxAge = 12 * 60 * 60 * 1000; // OLGA'S FIX: 12-hour cache for admin sessions
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

  // OLGA'S FIX: Enhanced message analysis for better context retention
  analyzeMessage(message: string) {
    const isGreeting = /^(hey|hi|hello)\s*[,!]?\s*[a-z]*$/i.test(message.trim());
    const isContinuation = /^(yes|ok|perfect|continue|proceed|great|excellent|sounds good)/i.test(message.trim());
    
    // OLGA'S FIX: Much more liberal work task detection - preserve context for most interactions
    const workKeywords = ['create', 'build', 'fix', 'update', 'analyze', 'show', 'check', 'find', 'test', 
                         'help', 'can you', 'please', 'look', 'status', 'ready', 'implement', 'plan', 
                         'consolidation', 'memory', 'agent', 'system', 'issue', 'problem', 'error'];
    
    const hasWorkKeywords = workKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // CRITICAL: Most interactions need context unless they're pure greetings
    const isWorkTask = !isGreeting && (message.length > 15 || hasWorkKeywords);

    return {
      isContinuation,
      isWorkTask: isWorkTask || isContinuation, // CRITICAL: Continuations also need context
      contextLevel: (isWorkTask || isContinuation) ? 'full' : isGreeting ? 'minimal' : 'basic'
    };
  }
}

// Export singleton instance
export const simpleMemoryService = SimpleMemoryService.getInstance();