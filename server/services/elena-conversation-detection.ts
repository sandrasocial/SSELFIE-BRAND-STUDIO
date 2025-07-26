/**
 * Elena Conversation Detection Service
 * Parses Elena's responses for workflow coordination patterns and creates executable workflows
 */

interface WorkflowTask {
  id: string;
  agentId: string;
  task: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  requirements: string[];
}

interface DetectedWorkflow {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  detectedAt: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  elenaMessage: string;
  conversationId?: string;
}

export class ElenaConversationDetectionService {
  private static instance: ElenaConversationDetectionService;
  private stagedWorkflows: Map<string, DetectedWorkflow> = new Map();
  private executedWorkflows: Map<string, DetectedWorkflow> = new Map();

  static getInstance(): ElenaConversationDetectionService {
    if (!this.instance) {
      this.instance = new ElenaConversationDetectionService();
    }
    return this.instance;
  }

  constructor() {
    console.log('🧠 ELENA CONVERSATION DETECTION: Service initialized');
  }

  /**
   * Parse Elena's response for workflow coordination patterns
   */
  detectWorkflowFromConversation(elenaResponse: string, conversationId?: string): DetectedWorkflow | null {
    console.log('🔍 ELENA WORKFLOW DETECTION: Analyzing conversation for coordination patterns');
    console.log('🔍 Elena response preview:', elenaResponse.substring(0, 200) + '...');

    // Enhanced coordination detection patterns
    const coordinationPatterns = [
      /I'll coordinate\s+(\w+)(?:\s+and\s+(\w+))?/gi,
      /Let me coordinate\s+(\w+)(?:\s+and\s+(\w+))?/gi,
      /I'm assigning\s+(\w+)\s+to\s+(.+)/gi,
      /I need\s+(\w+)\s+to\s+(.+)/gi,
      /(\w+)\s+will\s+handle\s+(.+)/gi,
      /I'll assign\s+(\w+)\s+to\s+(.+)/gi,
      /I've started coordinating the (.*?) workflow/gi,
      /I've started coordinating (.*?) (?:and|with) (.*?)/gi,
      /started coordinating the (.*?) workflow/gi,
      /coordinating the (.*?) workflow/gi,
      /I'm on it.*coordinating.*workflow/gi,
      /agents are actively making.*changes/gi,
      /making sure everything stays in sync/gi,
      /I'm coordinating (.*?) (?:and|with) (.*?)/gi,
      /coordinate (.*?) (?:and|with) (.*?) to (.*)/gi
    ];

    // Task delegation patterns
    const taskPatterns = [
      /redesign\s+(.+)/gi,
      /create\s+(.+)/gi,
      /implement\s+(.+)/gi,
      /optimize\s+(.+)/gi,
      /fix\s+(.+)/gi,
      /build\s+(.+)/gi,
      /develop\s+(.+)/gi,
    ];

    // Priority detection
    const priorityMatch = elenaResponse.match(/Priority:\s*(Critical|High|Medium|Low)/i);
    const priority = priorityMatch ? priorityMatch[1].toLowerCase() as 'critical' | 'high' | 'medium' | 'low' : 'medium';

    // Duration detection
    const durationMatch = elenaResponse.match(/Duration:\s*(\d+)\s*minutes?/i);
    const estimatedDuration = durationMatch ? parseInt(durationMatch[1]) : 30;

    // Extract agents and tasks
    const detectedTasks: WorkflowTask[] = [];
    let workflowName = 'Elena Coordination Workflow';
    let workflowDescription = 'Workflow created from Elena conversation';

    // Find coordination patterns
    coordinationPatterns.forEach(pattern => {
      const matches = [...elenaResponse.matchAll(pattern)];
      matches.forEach(match => {
        const agent1 = match[1]?.toLowerCase();
        const agent2 = match[2]?.toLowerCase();
        const taskDescription = match[3] || 'coordination task';

        if (agent1) {
          detectedTasks.push({
            id: `task_${Date.now()}_${agent1}`,
            agentId: agent1,
            task: taskDescription,
            priority,
            estimatedDuration: Math.floor(estimatedDuration / (agent2 ? 2 : 1)),
            requirements: []
          });
        }

        if (agent2) {
          detectedTasks.push({
            id: `task_${Date.now()}_${agent2}`,
            agentId: agent2,
            task: taskDescription,
            priority,
            estimatedDuration: Math.floor(estimatedDuration / 2),
            requirements: []
          });
        }
      });
    });

    // Extract workflow name from common patterns
    if (elenaResponse.includes('dashboard')) {
      workflowName = 'Admin Dashboard Enhancement';
      workflowDescription = 'Coordinate agents to enhance admin dashboard functionality';
    } else if (elenaResponse.includes('design')) {
      workflowName = 'Design System Coordination';
      workflowDescription = 'Coordinate design improvements across platform';
    } else if (elenaResponse.includes('component')) {
      workflowName = 'Component Development';
      workflowDescription = 'Create and implement new components';
    }

    // Only create workflow if we detected coordination patterns
    if (detectedTasks.length === 0) {
      console.log('🔍 ELENA DETECTION: No coordination patterns found');
      return null;
    }

    const workflow: DetectedWorkflow = {
      id: `elena_workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      tasks: detectedTasks,
      priority,
      estimatedDuration,
      detectedAt: new Date(),
      status: 'staged',
      elenaMessage: elenaResponse,
      conversationId
    };

    // Stage the workflow
    this.stagedWorkflows.set(workflow.id, workflow);
    
    console.log('✅ ELENA WORKFLOW CREATED:', {
      id: workflow.id,
      name: workflow.name,
      tasks: workflow.tasks.length,
      agents: workflow.tasks.map(t => t.agentId)
    });

    return workflow;
  }

  /**
   * Get all staged workflows ready for manual execution
   */
  getStagedWorkflows(): DetectedWorkflow[] {
    return Array.from(this.stagedWorkflows.values())
      .filter(w => w.status === 'staged')
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Execute a staged workflow
   */
  async executeWorkflow(workflowId: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    const workflow = this.stagedWorkflows.get(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

    workflow.status = 'executing';
    const executionId = `exec_${workflowId}_${Date.now()}`;

    console.log('🚀 ELENA WORKFLOW EXECUTION:', {
      workflowId,
      executionId,
      tasks: workflow.tasks.length
    });

    // Move to executed workflows
    this.executedWorkflows.set(executionId, workflow);
    this.stagedWorkflows.delete(workflowId);

    return { success: true, executionId };
  }

  /**
   * Get workflow execution status
   */
  getWorkflowStatus(executionId: string): DetectedWorkflow | null {
    return this.executedWorkflows.get(executionId) || null;
  }

  /**
   * Remove expired staged workflows (older than 1 hour)
   */
  cleanupExpiredWorkflows(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, workflow] of this.stagedWorkflows) {
      if (workflow.detectedAt < oneHourAgo) {
        this.stagedWorkflows.delete(id);
        console.log('🧹 ELENA CLEANUP: Removed expired workflow', id);
      }
    }
  }
}

// Export singleton instance
export const elenaConversationDetection = ElenaConversationDetectionService.getInstance();