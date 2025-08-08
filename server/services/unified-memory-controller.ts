/**
 * UNIFIED MEMORY CONTROLLER
 * Single coordination layer for all memory systems to prevent conflicts and ensure proper integration
 */

import { ContextPreservationSystem } from '../agents/context-preservation-system';
import { AdvancedMemorySystem } from './advanced-memory-system';
import { TokenOptimizationEngine } from './token-optimization-engine';

export interface UnifiedMemoryOptions {
  agentName: string;
  userId: string;
  isAdminBypass?: boolean;
  task?: string;
  conversationId?: string;
}

export interface UnifiedMemoryResult {
  context: any;
  memories: any[];
  optimization: any;
  adminPrivileges: boolean;
}

/**
 * Single entry point for all memory operations
 * Coordinates between Context Preservation, Advanced Memory, and Token Optimization
 */
export class UnifiedMemoryController {
  private static instance: UnifiedMemoryController;
  
  private constructor() {}
  
  public static getInstance(): UnifiedMemoryController {
    if (!UnifiedMemoryController.instance) {
      UnifiedMemoryController.instance = new UnifiedMemoryController();
    }
    return UnifiedMemoryController.instance;
  }
  
  /**
   * UNIFIED MEMORY PREPARATION
   * Coordinates all memory systems for agent initialization
   */
  async prepareAgentMemory(options: UnifiedMemoryOptions): Promise<UnifiedMemoryResult> {
    const { agentName, userId, isAdminBypass = false, task = '', conversationId = '' } = options;
    
    console.log(`🧠 UNIFIED MEMORY: Preparing memory for ${agentName}${isAdminBypass ? ' [ADMIN]' : ''}`);
    
    try {
      // 1. CONTEXT PRESERVATION: Get workspace and task context
      const context = await ContextPreservationSystem.prepareAgentWorkspace(
        agentName, 
        userId, 
        task, 
        isAdminBypass
      );
      
      // 2. ADVANCED MEMORY: Get learning patterns and intelligence
      const memorySystem = AdvancedMemorySystem.getInstance();
      let memoryProfile = await memorySystem.getAgentMemoryProfile(agentName, userId, isAdminBypass);
      
      if (!memoryProfile) {
        memoryProfile = await memorySystem.initializeAgentMemory(agentName, userId, {
          baseIntelligence: isAdminBypass ? 10 : 7,
          specialization: agentName
        });
      }
      
      const relevantMemories = await memorySystem.getContextualMemories(
        agentName, 
        userId, 
        task, 
        'agent_conversation'
      );
      
      // 3. TOKEN OPTIMIZATION: Not needed for initial preparation
      // (Only used during conversation for API cost reduction)
      
      console.log(`🧠 UNIFIED MEMORY PREPARED:
  - Context: ${context ? 'loaded' : 'none'}
  - Intelligence Level: ${memoryProfile.intelligenceLevel}
  - Relevant Memories: ${relevantMemories.length}
  - Admin Bypass: ${isAdminBypass}`);
      
      return {
        context,
        memories: relevantMemories,
        optimization: null, // Applied later during conversation
        adminPrivileges: isAdminBypass
      };
      
    } catch (error) {
      console.error('🧠 UNIFIED MEMORY ERROR:', error);
      
      // Fallback: Return minimal memory setup
      return {
        context: null,
        memories: [],
        optimization: null,
        adminPrivileges: isAdminBypass
      };
    }
  }
  
  /**
   * UNIFIED MEMORY SAVE
   * Coordinates saving across all memory systems
   */
  async saveAgentMemory(options: UnifiedMemoryOptions, data: any): Promise<void> {
    const { agentName, userId, isAdminBypass = false, task = '' } = options;
    
    try {
      // 1. CONTEXT PRESERVATION: Save workspace state
      await ContextPreservationSystem.saveContext(agentName, userId, {
        currentTask: task,
        adminBypass: isAdminBypass,
        ...data.context
      }, isAdminBypass);
      
      // 2. ADVANCED MEMORY: Save learning patterns
      if (data.learningData) {
        const memorySystem = AdvancedMemorySystem.getInstance();
        await memorySystem.recordAgentLearning(agentName, userId, data.learningData);
      }
      
      console.log(`💾 UNIFIED MEMORY SAVED: ${agentName}${isAdminBypass ? ' [ADMIN]' : ''}`);
      
    } catch (error) {
      console.error('💾 UNIFIED MEMORY SAVE ERROR:', error);
    }
  }
  
  /**
   * SYSTEM HEALTH CHECK
   * Verify all memory systems are properly integrated
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'error';
    systems: {
      contextPreservation: boolean;
      advancedMemory: boolean;
      tokenOptimization: boolean;
    };
    conflicts: string[];
  }> {
    const systems = {
      contextPreservation: false,
      advancedMemory: false,
      tokenOptimization: false
    };
    
    const conflicts: string[] = [];
    
    try {
      // Test Context Preservation System
      await ContextPreservationSystem.getContextSummary('test', 'test');
      systems.contextPreservation = true;
    } catch (error) {
      conflicts.push('Context Preservation System error');
    }
    
    try {
      // Test Advanced Memory System
      const memorySystem = AdvancedMemorySystem.getInstance();
      await memorySystem.getAgentMemoryProfile('test', 'test');
      systems.advancedMemory = true;
    } catch (error) {
      conflicts.push('Advanced Memory System error');
    }
    
    try {
      // Test Token Optimization
      TokenOptimizationEngine.calculateTokenBudget('simple');
      systems.tokenOptimization = true;
    } catch (error) {
      conflicts.push('Token Optimization Engine error');
    }
    
    const healthyCount = Object.values(systems).filter(Boolean).length;
    const status = healthyCount === 3 ? 'healthy' : healthyCount >= 2 ? 'degraded' : 'error';
    
    return { status, systems, conflicts };
  }
}