import { ConversationManager } from './agents/ConversationManager';
import { loadPersistedWorkflows, saveWorkflowsToDisk } from './elena-workflow-system';

export interface ElenaMemorySystem {
  loadMemory(): Promise<any>;
  saveMemory(conversationData: any): Promise<void>;
  integrateWithWorkflows(): Promise<void>;
}

class ElenaMemoryIntegration implements ElenaMemorySystem {
  private agentId = 'elena';
  
  async loadMemory(): Promise<any> {
    try {
      // Load from conversation manager
      const conversationMemory = await ConversationManager.retrieveAgentMemory(this.agentId);
      
      // Load from workflow system
      const workflowMemory = await loadPersistedWorkflows();
      
      // Integrate both memory sources
      return {
        conversationHistory: conversationMemory,
        workflowContext: workflowMemory,
        combinedContext: this.mergeMemorySources(conversationMemory, workflowMemory)
      };
    } catch (error) {
      console.error('Elena memory loading failed:', error);
      return null;
    }
  }
  
  async saveMemory(conversationData: any): Promise<void> {
    try {
      // Save to conversation manager
      await ConversationManager.saveAgentMemory(this.agentId, conversationData);
      
      // Save to workflow system if workflow-related
      if (conversationData.isWorkflowRelated) {
        await saveWorkflowsToDisk();
      }
    } catch (error) {
      console.error('Elena memory saving failed:', error);
    }
  }
  
  async integrateWithWorkflows(): Promise<void> {
    // Connect Elena's conversations to workflow memory system
    const workflowContext = await loadPersistedWorkflows();
    
    if (workflowContext && workflowContext.elenaUpdates) {
      // Merge workflow updates into conversation memory
      await this.saveMemory({
        isWorkflowRelated: true,
        workflowUpdates: workflowContext.elenaUpdates,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private mergeMemorySources(conversationMemory: any, workflowMemory: any): string {
    let context = '';
    
    if (conversationMemory) {
      context += `Previous conversations: ${JSON.stringify(conversationMemory)}\n`;
    }
    
    if (workflowMemory && workflowMemory.elenaUpdates) {
      context += `Workflow history: ${JSON.stringify(workflowMemory.elenaUpdates)}\n`;
    }
    
    return context;
  }
}

export const elenaMemorySystem = new ElenaMemoryIntegration();

// Auto-initialization function
export async function initializeElenaMemory(): Promise<string> {
  try {
    const memory = await elenaMemorySystem.loadMemory();
    await elenaMemorySystem.integrateWithWorkflows();
    
    return memory ? memory.combinedContext : '';
  } catch (error) {
    console.error('Elena memory initialization failed:', error);
    return '';
  }
}