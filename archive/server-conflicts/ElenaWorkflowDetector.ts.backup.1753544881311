import { Request, Response } from 'express';

interface WorkflowPattern {
  pattern: RegExp;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  taskType: string;
}

interface DetectedWorkflow {
  id: string;
  agents: string[];
  task: string;
  priority: string;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  originalMessage: string;
}

class ElenaWorkflowDetector {
  private workflows: Map<string, DetectedWorkflow> = new Map();
  
  private workflowPatterns: WorkflowPattern[] = [
    {
      pattern: /coordinate\s+(.*?)\s+(?:and|,)\s+(.*?)\s+to\s+(.+)/i,
      agents: [],
      priority: 'high',
      taskType: 'coordination'
    },
    {
      pattern: /(?:aria|victoria|zara|elena|maya|jade|nova|iris|sage|luna|echo|kai|river)\s+(?:create|build|implement|fix)\s+(.+)/i,
      agents: [],
      priority: 'medium',
      taskType: 'implementation'
    },
    {
      pattern: /CRITICAL.*?(?:fix|repair|build|create)\s+(.+)/i,
      agents: ['zara', 'aria'],
      priority: 'critical',
      taskType: 'emergency'
    },
    {
      pattern: /elena.*?workflow.*?(?:create|execute|deploy)/i,
      agents: ['elena'],
      priority: 'high',
      taskType: 'workflow_management'
    }
  ];

  detectWorkflow(message: string): DetectedWorkflow | null {
    console.log('🔍 ELENA WORKFLOW DETECTION analyzing:', message);
    
    for (const pattern of this.workflowPatterns) {
      const match = message.match(pattern.pattern);
      if (match) {
        const workflowId = this.generateWorkflowId();
        let agents = pattern.agents;
        
        // Extract agents from coordination patterns
        if (pattern.taskType === 'coordination' && match[1] && match[2]) {
          agents = this.extractAgentNames(`${match[1]} ${match[2]}`);
        }
        
        // Extract single agent from implementation patterns
        if (pattern.taskType === 'implementation') {
          const agentMatch = message.match(/(?:aria|victoria|zara|elena|maya|jade|nova|iris|sage|luna|echo|kai|river)/i);
          if (agentMatch) {
            agents = [agentMatch[0].toLowerCase()];
          }
        }

        const workflow: DetectedWorkflow = {
          id: workflowId,
          agents: agents,
          task: match[1] || match[0],
          priority: pattern.priority,
          status: 'staged',
          createdAt: new Date(),
          originalMessage: message
        };

        this.workflows.set(workflowId, workflow);
        
        console.log('✅ ELENA WORKFLOW CREATED:', agents.length, 'agents,', agents.join(', '));
        console.log('🎯 ELENA WORKFLOW DETECTED: staging for manual execution');
        console.log('📋 WORKFLOW DETAILS:', {
          agents: agents.join(', '),
          priority: pattern.priority,
          task: workflow.task
        });

        return workflow;
      }
    }

    return null;
  }

  private extractAgentNames(text: string): string[] {
    const agentNames = ['aria', 'victoria', 'zara', 'elena', 'maya', 'jade', 'nova', 'iris', 'sage', 'luna', 'echo', 'kai', 'river'];
    const foundAgents: string[] = [];
    
    agentNames.forEach(agent => {
      if (text.toLowerCase().includes(agent)) {
        foundAgents.push(agent);
      }
    });
    
    return foundAgents.length > 0 ? foundAgents : ['aria']; // Default to Aria if no agents found
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStagedWorkflows(): DetectedWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.status === 'staged');
  }

  getWorkflow(id: string): DetectedWorkflow | undefined {
    return this.workflows.get(id);
  }

  updateWorkflowStatus(id: string, status: DetectedWorkflow['status']): boolean {
    const workflow = this.workflows.get(id);
    if (workflow) {
      workflow.status = status;
      return true;
    }
    return false;
  }

  getAllWorkflows(): DetectedWorkflow[] {
    return Array.from(this.workflows.values());
  }
}

export const elenaWorkflowDetector = new ElenaWorkflowDetector();
export { DetectedWorkflow };