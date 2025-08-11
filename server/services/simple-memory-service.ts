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
    
    // OLGA'S FIX: Enhanced database persistence
    try {
      await storage.saveAgentMemory(context.agentName, context.userId, { context });
      console.log(`💾 SAVED: Memory persisted for ${context.agentName}`);
    } catch (error) {
      console.error(`⚠️ Failed to persist memory for ${context.agentName}:`, error);
    }
  }

  /**
   * ZARA'S TOKEN OPTIMIZATION: Enhanced bypass logic for local execution
   */
  shouldBypassClaude(message: string, agentId: string): boolean {
    // Simple tool requests that can be handled locally
    if (message.includes('npm run') || message.includes('cat ') || message.includes('ls ')) {
      return true;
    }
    
    // JSON tool calls
    if (message.startsWith('{') && (message.includes('"command"') || message.includes('"query_description"'))) {
      return true;
    }
    
    // Simple debug/check commands
    if (message.length < 100 && (message.includes('check') || message.includes('debug') || message.includes('analyze'))) {
      return true;
    }
    
    // Pattern extraction and learning operations
    if (message.includes('extract patterns') || message.includes('update learning') || message.includes('process result')) {
      return true;
    }
    
    // Error validation requests
    if (message.includes('validate code') || message.includes('check syntax') || message.includes('fix suggestions')) {
      return true;
    }
    
    // Intent classification requests
    if (message.includes('identify intent') || message.includes('classify task') || message.includes('extract type')) {
      return true;
    }
    
    return false;
  }

  /**
   * ZARA'S OPTIMIZATION: Get workspace context locally (no Claude API)
   */
  async getWorkspaceContext(agentName: string, userId: string): Promise<string> {
    try {
      const context = await this.prepareAgentContext({ agentName, userId, isAdminBypass: true });
      
      if (context.memories.length > 0) {
        const recentMemories = context.memories.slice(-3)
          .map(mem => `- ${mem.data?.pattern || mem.data?.currentTask || 'Previous task'}`)
          .join('\n');
        return `Recent workspace context for ${agentName}:\n${recentMemories}`;
      }
      
      return `Agent ${agentName} workspace ready for new tasks`;
    } catch (error) {
      console.error(`Failed to get workspace context for ${agentName}:`, error);
      return `Agent ${agentName} workspace context unavailable`;
    }
  }

  /**
   * Consolidate agent memory - merge and optimize stored memories
   */
  async consolidateMemory(agentId: string, userId: string): Promise<void> {
    const context = await this.prepareAgentContext({
      agentName: agentId,
      userId
    });

    // Remove duplicates and old entries
    context.memories = context.memories
      .filter((memory, index, self) => 
        index === self.findIndex(m => 
          JSON.stringify(m.data) === JSON.stringify(memory.data)
        )
      )
      .filter(memory => 
        new Date().getTime() - new Date(memory.timestamp).getTime() < 12 * 60 * 60 * 1000 // 12 hours
      );

    // Save consolidated memories
    await storage.saveAgentMemory(agentId, userId, { context });
    console.log(`🧠 CONSOLIDATED: Memory optimized for ${agentId} (${context.memories.length} entries)`);
  }

  /**
   * ESSENTIAL: Clear memory when needed
   * Replaces complex cache invalidation from multiple systems
   */
  /**
   * OLGA'S FIX: Gentle memory refresh instead of aggressive clearing
   * Only clears when absolutely necessary to prevent context loss
   */
  refreshAgentMemory(agentName: string, userId: string, preserveContext: boolean = true): void {
    const cacheKey = `${agentName}-${userId}`;
    
    if (preserveContext) {
      // SOFT REFRESH: Keep the context but mark as refreshed
      const existing = this.contextCache.get(cacheKey);
      if (existing) {
        existing.timestamp = new Date();
        console.log(`🔄 MEMORY: Refreshed timestamp for ${agentName} (context preserved)`);
        return;
      }
    }
    
    // HARD CLEAR: Only when explicitly requested
    this.contextCache.delete(cacheKey);
    console.log(`⚠️ MEMORY: Hard cleared memory for ${agentName} (context lost)`);
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
      memoryCount: context.memories.length,
      lastOptimization: new Date() // Fix for ConversationManager compatibility
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

  /**
   * ZARA'S WORKFLOW STATE TRACKING: Fix admin agent context loss between coordination calls
   */
  private workflowStates = new Map<string, any>();

  async saveWorkflowState(workflowId: string, state: any): Promise<void> {
    this.workflowStates.set(workflowId, {
      ...state,
      lastUpdateTime: new Date()
    });
    console.log(`💾 WORKFLOW: Saved state for workflow ${workflowId}`);
  }

  async getWorkflowState(workflowId: string): Promise<any> {
    const state = this.workflowStates.get(workflowId);
    if (!state) {
      console.log(`❌ WORKFLOW: No state found for workflow ${workflowId}`);
      return null;
    }
    console.log(`📖 WORKFLOW: Retrieved state for workflow ${workflowId}`);
    return state;
  }

  clearWorkflowState(workflowId: string): void {
    this.workflowStates.delete(workflowId);
    console.log(`🗑️ WORKFLOW: Cleared state for workflow ${workflowId}`);
  }
}

// Export singleton instance
export const simpleMemoryService = SimpleMemoryService.getInstance();