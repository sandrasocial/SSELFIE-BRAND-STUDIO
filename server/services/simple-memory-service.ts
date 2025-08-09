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
    const maxAge = 5 * 60 * 1000; // 5 minutes
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
    return {
      agentName,
      userId,
      memoryStrength: 1.0,
      learningPatterns: [],
      intelligenceLevel: adminBypass ? 10 : 7,
      adminBypass
    };
  }

  // Replaces ConversationContextDetector.analyzeMessage (simplified)
  analyzeMessage(message: string) {
    const isGreeting = /^(hey|hi|hello)/i.test(message.trim());
    const isContinuation = /^(yes|ok|perfect|continue|proceed|great|excellent)/i.test(message.trim());
    const isWorkTask = !isGreeting && (message.length > 50 || /create|build|fix|update|analyze/.test(message));

    return {
      isContinuation,
      isWorkTask,
      contextLevel: isWorkTask ? 'full' : isContinuation ? 'minimal' : 'none'
    };
  }
}

// Export singleton instance
export const simpleMemoryService = SimpleMemoryService.getInstance();