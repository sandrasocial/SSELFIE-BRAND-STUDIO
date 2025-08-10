import { simpleMemoryService } from '../services/simple-memory-service';

export interface WorkflowState {
  workflowId: string;
  currentStage: string;
  previousStages: string[];
  contextData: any;
  lastUpdateTime: Date;
  agentAssignments: {
    agentId: string;
    task: string;
    status: 'active' | 'completed' | 'pending';
  }[];
}

export class WorkflowStateManager {
  private static readonly WORKFLOW_TIMEOUT = 300; // seconds

  static async initializeWorkflow(workflowId: string, initialContext: any): Promise<WorkflowState> {
    const newState: WorkflowState = {
      workflowId,
      currentStage: 'initialized',
      previousStages: [],
      contextData: initialContext,
      lastUpdateTime: new Date(),
      agentAssignments: []
    };

    await simpleMemoryService.saveWorkflowState(workflowId, newState);
    return newState;
  }

  static async updateWorkflowState(
    workflowId: string,
    updates: Partial<WorkflowState>
  ): Promise<WorkflowState> {
    const currentState = await simpleMemoryService.getWorkflowState(workflowId);
    
    if (!currentState) {
      throw new Error(`No active workflow found for ID: ${workflowId}`);
    }

    // Preserve previous stage
    if (updates.currentStage && updates.currentStage !== currentState.currentStage) {
      updates.previousStages = [...currentState.previousStages, currentState.currentStage];
    }

    const updatedState: WorkflowState = {
      ...currentState,
      ...updates,
      lastUpdateTime: new Date()
    };

    await simpleMemoryService.saveWorkflowState(workflowId, updatedState);
    return updatedState;
  }

  static async getWorkflowContext(workflowId: string): Promise<any> {
    const state = await simpleMemoryService.getWorkflowState(workflowId);
    return state?.contextData || null;
  }

  static async assignAgentTask(
    workflowId: string,
    agentId: string,
    task: string
  ): Promise<void> {
    const state = await simpleMemoryService.getWorkflowState(workflowId);
    
    if (!state) {
      throw new Error(`No active workflow found for ID: ${workflowId}`);
    }

    const assignment = {
      agentId,
      task,
      status: 'active' as const
    };

    await this.updateWorkflowState(workflowId, {
      agentAssignments: [...state.agentAssignments, assignment]
    });
  }

  static async completeAgentTask(
    workflowId: string,
    agentId: string
  ): Promise<void> {
    const state = await simpleMemoryService.getWorkflowState(workflowId);
    
    if (!state) {
      throw new Error(`No active workflow found for ID: ${workflowId}`);
    }

    const updatedAssignments = state.agentAssignments.map(assignment => 
      assignment.agentId === agentId
        ? { ...assignment, status: 'completed' as const }
        : assignment
    );

    await this.updateWorkflowState(workflowId, {
      agentAssignments: updatedAssignments
    });
  }

  static async isWorkflowActive(workflowId: string): Promise<boolean> {
    const state = await simpleMemoryService.getWorkflowState(workflowId);
    
    if (!state) return false;

    const now = new Date();
    const timeSinceUpdate = (now.getTime() - state.lastUpdateTime.getTime()) / 1000;
    
    return timeSinceUpdate < this.WORKFLOW_TIMEOUT;
  }
}