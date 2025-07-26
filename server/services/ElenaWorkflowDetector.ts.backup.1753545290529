import { AgentPersonality } from '../types/agent-types';

export interface WorkflowDetection {
  id: string;
  agents: string[];
  task: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'coordination' | 'implementation' | 'emergency' | 'workflow';
  timestamp: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  elenaMessage: string;
}

export class ElenaWorkflowDetector {
  private stagedWorkflows: Map<string, WorkflowDetection> = new Map();
  
  private readonly WORKFLOW_PATTERNS = [
    {
      pattern: /coordinate\s+([^.]+?)\s+(?:to|and)\s+([^.]+)/i,
      type: 'coordination' as const,
      priority: 'high' as const
    },
    {
      pattern: /(aria|zara|victoria|elena|maya|sophie|luna|kai|nova|phoenix|sage|raven|ember)\s+(?:create|build|implement|fix|deploy)\s+([^.]+)/i,
      type: 'implementation' as const,
      priority: 'medium' as const
    },
    {
      pattern: /CRITICAL\s+([^.]+)/i,
      type: 'emergency' as const,
      priority: 'critical' as const
    },
    {
      pattern: /elena\s+workflow\s+([^.]+)/i,
      type: 'workflow' as const,
      priority: 'high' as const
    }
  ];

  detectWorkflow(message: string): WorkflowDetection | null {
    console.log('🔍 ELENA WORKFLOW DETECTION: Analyzing message:', message);
    
    for (const { pattern, type, priority } of this.WORKFLOW_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        console.log('✅ WORKFLOW PATTERN MATCHED:', type, pattern);
        
        const agents = this.extractAgents(message);
        const task = this.extractTask(message, match);
        
        const workflow: WorkflowDetection = {
          id: this.generateWorkflowId(),
          agents,
          task,
          priority,
          type,
          timestamp: new Date(),
          status: 'staged',
          elenaMessage: message
        };

        this.stagedWorkflows.set(workflow.id, workflow);
        
        console.log('🎯 ELENA WORKFLOW DETECTED:', {
          id: workflow.id,
          agents: workflow.agents,
          task: workflow.task,
          priority: workflow.priority
        });
        
        return workflow;
      }
    }

    return null;
  }

  private extractAgents(message: string): string[] {
    const agentNames = ['aria', 'zara', 'victoria', 'elena', 'maya', 'sophie', 'luna', 'kai', 'nova', 'phoenix', 'sage', 'raven', 'ember'];
    const foundAgents: string[] = [];
    
    const lowerMessage = message.toLowerCase();
    for (const agent of agentNames) {
      if (lowerMessage.includes(agent)) {
        foundAgents.push(agent);
      }
    }
    
    return foundAgents.length > 0 ? foundAgents : ['elena'];
  }

  private extractTask(message: string, match: RegExpMatchArray): string {
    // Extract meaningful task description from the matched pattern
    if (match[1]) {
      return match[1].trim();
    }
    
    // Fallback: extract everything after action words
    const actionMatch = message.match(/(?:create|build|implement|fix|deploy|coordinate)\s+(.+)/i);
    return actionMatch ? actionMatch[1].trim() : 'workflow task';
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Dashboard integration methods
  getStagedWorkflows(): WorkflowDetection[] {
    return Array.from(this.stagedWorkflows.values())
      .filter(w => w.status === 'staged')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getWorkflow(id: string): WorkflowDetection | undefined {
    return this.stagedWorkflows.get(id);
  }

  updateWorkflowStatus(id: string, status: WorkflowDetection['status']): boolean {
    const workflow = this.stagedWorkflows.get(id);
    if (workflow) {
      workflow.status = status;
      console.log(`📋 WORKFLOW ${id} STATUS UPDATED:`, status);
      return true;
    }
    return false;
  }

  getAllWorkflows(): WorkflowDetection[] {
    return Array.from(this.stagedWorkflows.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Execute workflow with multiple agents
  async executeWorkflow(id: string): Promise<{ success: boolean; results: any[] }> {
    const workflow = this.getWorkflow(id);
    if (!workflow) {
      return { success: false, results: [] };
    }

    this.updateWorkflowStatus(id, 'executing');
    
    console.log('🚀 EXECUTING ELENA WORKFLOW:', {
      id: workflow.id,
      agents: workflow.agents,
      task: workflow.task
    });

    const results = [];
    
    try {
      // Deploy agents for workflow execution
      for (const agentName of workflow.agents) {
        const result = await this.deployAgent(agentName, workflow.task);
        results.push(result);
      }
      
      this.updateWorkflowStatus(id, 'completed');
      return { success: true, results };
    } catch (error) {
      console.error('❌ WORKFLOW EXECUTION FAILED:', error);
      this.updateWorkflowStatus(id, 'failed');
      return { success: false, results };
    }
  }

  private async deployAgent(agentName: string, task: string): Promise<any> {
    console.log(`🤖 DEPLOYING AGENT ${agentName.toUpperCase()} for task:`, task);
    
    // This would integrate with the actual agent deployment system
    // For now, return a success indicator
    return {
      agent: agentName,
      task,
      status: 'deployed',
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const elenaWorkflowDetector = new ElenaWorkflowDetector();