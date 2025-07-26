import { v4 as uuidv4 } from 'uuid';

export interface WorkflowDetection {
  id: string;
  agents: string[];
  task: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'coordination' | 'implementation' | 'emergency' | 'workflow';
  timestamp: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  results?: any[];
}

export class ElenaWorkflowDetector {
  private workflows: Map<string, WorkflowDetection> = new Map();

  // Detection patterns for Elena coordination language
  private detectionPatterns = [
    {
      pattern: /coordinate\s+([^\.]+?)\s+(?:to|and)\s+([^\.]+)/gi,
      type: 'coordination' as const,
      priority: 'high' as const
    },
    {
      pattern: /(aria|zara|victoria|elena|maya|sophie|luna|kai|nova|phoenix|sage|raven|ember)\s+(create|build|implement|fix|deploy)\s+([^\.]+)/gi,
      type: 'implementation' as const,
      priority: 'medium' as const
    },
    {
      pattern: /CRITICAL|URGENT|IMMEDIATE|EMERGENCY/gi,
      type: 'emergency' as const,
      priority: 'critical' as const
    },
    {
      pattern: /workflow\s+(create|execute|deploy|build)/gi,
      type: 'workflow' as const,
      priority: 'high' as const
    }
  ];

  private agentNames = [
    'aria', 'zara', 'victoria', 'elena', 'maya', 'sophie', 
    'luna', 'kai', 'nova', 'phoenix', 'sage', 'raven', 'ember'
  ];

  detectWorkflow(message: string): WorkflowDetection | null {
    console.log('🔍 ELENA WORKFLOW DETECTION:', message.substring(0, 100));

    // Check for workflow patterns
    for (const patternConfig of this.detectionPatterns) {
      const matches = Array.from(message.matchAll(patternConfig.pattern));
      
      if (matches.length > 0) {
        const agents = this.extractAgents(message);
        const task = this.extractTask(message, matches[0]);
        
        if (agents.length > 0) {
          const workflow: WorkflowDetection = {
            id: uuidv4(),
            agents,
            task,
            priority: patternConfig.priority,
            type: patternConfig.type,
            timestamp: new Date(),
            status: 'staged'
          };

          this.workflows.set(workflow.id, workflow);
          
          console.log('✅ ELENA WORKFLOW CREATED:', agents.length, 'agents,', agents.join(', '));
          console.log('🎯 ELENA WORKFLOW DETECTED: staging for manual execution');
          console.log('📋 WORKFLOW DETAILS:', `agents: ${agents.join(', ')}, priority: ${workflow.priority}`);
          
          return workflow;
        }
      }
    }

    return null;
  }

  private extractAgents(message: string): string[] {
    const agents: string[] = [];
    const lowerMessage = message.toLowerCase();

    for (const agent of this.agentNames) {
      if (lowerMessage.includes(agent)) {
        agents.push(agent);
      }
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  private extractTask(message: string, match: RegExpMatchArray): string {
    // Extract task from the match or use the full message context
    if (match.length > 3) {
      return match[3].trim();
    }
    
    // Fallback: extract task after common action words
    const taskMatch = message.match(/(?:create|build|implement|fix|deploy|coordinate.*?to)\s+([^\.]+)/i);
    return taskMatch ? taskMatch[1].trim() : message.substring(0, 100);
  }

  // Workflow management methods
  getStagedWorkflows(): WorkflowDetection[] {
    return Array.from(this.workflows.values()).filter(w => w.status === 'staged');
  }

  getWorkflow(id: string): WorkflowDetection | undefined {
    return this.workflows.get(id);
  }

  updateWorkflowStatus(id: string, status: WorkflowDetection['status'], results?: any[]): boolean {
    const workflow = this.workflows.get(id);
    if (workflow) {
      workflow.status = status;
      if (results) {
        workflow.results = results;
      }
      return true;
    }
    return false;
  }

  getAllWorkflows(): WorkflowDetection[] {
    return Array.from(this.workflows.values());
  }

  // Execute workflow (integrate with agent deployment)
  async executeWorkflow(id: string): Promise<boolean> {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;

    console.log('🚀 EXECUTING ELENA WORKFLOW:', workflow.id);
    console.log('👥 DEPLOYING AGENTS:', workflow.agents.join(', '));
    
    this.updateWorkflowStatus(id, 'executing');

    try {
      // TODO: Integrate with actual agent deployment system
      const results = await this.deployAgents(workflow.agents, workflow.task);
      this.updateWorkflowStatus(id, 'completed', results);
      
      console.log('✅ ELENA WORKFLOW COMPLETED:', workflow.id);
      return true;
    } catch (error) {
      console.error('❌ ELENA WORKFLOW FAILED:', error);
      this.updateWorkflowStatus(id, 'failed');
      return false;
    }
  }

  private async deployAgents(agents: string[], task: string): Promise<any[]> {
    // Placeholder for agent deployment logic
    // This will integrate with existing agent chat endpoints
    const results = [];
    
    for (const agent of agents) {
      console.log(`🎯 DEPLOYING AGENT: ${agent} for task: ${task}`);
      // TODO: Call agent deployment endpoint
      results.push({ agent, status: 'deployed', task });
    }
    
    return results;
  }
}

// Singleton instance for application-wide use
export const elenaWorkflowDetector = new ElenaWorkflowDetector();