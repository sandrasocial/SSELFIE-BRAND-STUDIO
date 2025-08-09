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
   * ESSENTIAL: Prepare agent context for conversation
   * Replaces all the complex memory loading from 4 systems
   */
  async prepareAgentContext(options: AgentMemoryOptions): Promise<AgentContext> {
    const { agentName, userId, task = '', isAdminBypass = false } = options;
    const cacheKey = `${agentName}-${userId}`;

    // Check cache first (simple, single cache)
    const cached = this.contextCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`🧠 MEMORY: Using cached context for ${agentName}`);
      return cached;
    }

    // Build essential context (no competing systems)
    const context: AgentContext = {
      agentName,
      userId,
      currentTask: task,
      adminPrivileges: isAdminBypass,
      memories: [], // Simple array, no complex patterns
      timestamp: new Date()
    };

    // Cache for reuse (single cache, no conflicts)
    this.contextCache.set(cacheKey, context);
    console.log(`🧠 MEMORY: Prepared context for ${agentName}${isAdminBypass ? ' [ADMIN]' : ''}`);

    return context;
  }

  /**
   * ESSENTIAL: Save agent memory (simplified)
   * Replaces complex memory persistence from competing systems
   */
  async saveAgentMemory(context: AgentContext, data: any): Promise<void> {
    const cacheKey = `${context.agentName}-${context.userId}`;
    
    // Update context with new data
    context.memories.push({
      data,
      timestamp: new Date(),
      task: context.currentTask
    });

    // Update cache (single source of truth)
    this.contextCache.set(cacheKey, context);
    console.log(`🧠 MEMORY: Saved memory for ${context.agentName}`);
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
    const maxAge = 2 * 60 * 60 * 1000; // WORKFLOW FIX: Extended to 2 hours for long workflows
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

  // Replaces ConversationContextDetector.analyzeMessage (simplified)
  analyzeMessage(message: string) {
    const isGreeting = /^(hey|hi|hello)/i.test(message.trim());
    const isContinuation = /^(yes|ok|perfect|continue|proceed|great|excellent)/i.test(message.trim());
    // FIXED: More liberal work task detection - agents need context for most interactions
    const isWorkTask = !isGreeting && (message.length > 20 || /create|build|fix|update|analyze|show|check|find|test|help|can you|please|look/.test(message.toLowerCase()));

    return {
      isContinuation,
      isWorkTask: isWorkTask || isContinuation, // CRITICAL: Continuations also need context
      contextLevel: (isWorkTask || isContinuation) ? 'full' : isGreeting ? 'minimal' : 'none'
    };
  }

  /**
   * CACHE CLEARING FOR FRESH START - REMOVES CONFUSION
   */
  clearCache(agentName?: string): void {
    if (agentName) {
      // Clear specific agent cache
      for (const [key, value] of this.contextCache.entries()) {
        if (value.agentName === agentName) {
          this.contextCache.delete(key);
        }
      }
      console.log(`🧠 MEMORY: Cleared cache for ${agentName}`);
    } else {
      // Clear all cache
      this.contextCache.clear();
      console.log('🧠 MEMORY: Cleared all cache');
    }
  }

  /**
   * CLEAR DEMONSTRATION CONTEXT THAT BLOCKS NEW WORK
   */
  clearDemonstrationContext(): void {
    // Clear all cached contexts to remove demonstration blocking
    this.contextCache.clear();
    console.log('🧠 MEMORY: Cleared demonstration context for fresh work start');
  }

  /**
   * FORCE FRESH CONTEXT FOR AGENT
   */
  forceFreshContext(agentName: string, userId: string): void {
    const cacheKey = `${agentName}-${userId}`;
    this.contextCache.delete(cacheKey);
    console.log(`🧠 MEMORY: Forced fresh context for ${agentName}`);
  }
}

// Export singleton instance
export const simpleMemoryService = SimpleMemoryService.getInstance();