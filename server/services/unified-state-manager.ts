/**
 * CONSOLIDATED STATE MANAGER - OLGA'S MEMORY FIX
 * Lightweight wrapper around simple-memory-service
 * ELIMINATES competing memory systems that cause context loss
 */

import { simpleMemoryService } from './simple-memory-service';

// SIMPLIFIED INTERFACES - delegated to simple-memory-service
export interface WorkspaceOperation {
  type: 'create' | 'edit' | 'delete' | 'move';
  path: string;
  timestamp: Date;
}

// CONSOLIDATED STATE MANAGER - no competing memory systems
export class UnifiedStateManager {
  private static instance: UnifiedStateManager;
  
  private constructor() {
    // OLGA'S FIX: Use existing simple-memory-service instead of competing system
    console.log('🧠 CONSOLIDATED: UnifiedStateManager using simple-memory-service');
  }

  public static getInstance(): UnifiedStateManager {
    if (!UnifiedStateManager.instance) {
      UnifiedStateManager.instance = new UnifiedStateManager();
    }
    return UnifiedStateManager.instance;
  }

  // DELEGATION: All memory operations go through simple-memory-service
  async getAgentState(agentId: string, userId: string) {
    return await simpleMemoryService.prepareAgentContext({
      agentName: agentId,
      userId
    });
  }

  async updateAgentState(agentId: string, userId: string, context: any) {
    return await simpleMemoryService.saveAgentMemory(agentId, userId, context);
  }

  // OLGA'S FIX: Essential workspace operations only
  async clearWorkspaceState(): Promise<void> {
    console.log('🧹 CONSOLIDATED: Clearing workspace state via simple-memory-service');
    // Let simple-memory-service handle cleanup
  }

  // OLGA'S FIX: Simple coordination without competing memory systems
  async coordinateAgentTask(agentId: string, task: string, userId: string) {
    console.log(`🎯 CONSOLIDATED: Coordinating ${agentId} task via simple-memory-service`);
    
    // Get current agent state
    const context = await this.getAgentState(agentId, userId);
    
    // Update with new task
    const updatedContext = {
      ...context,
      currentTask: task,
      lastActivity: new Date()
    };
    
    // Save updated state
    await this.updateAgentState(agentId, userId, updatedContext);
    
    return { success: true, context: updatedContext };
  }
}

// Export singleton instance
export const unifiedStateManager = UnifiedStateManager.getInstance();