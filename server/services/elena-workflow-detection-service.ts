/**
 * Elena Workflow Detection Service
 * Automatically detects when Elena creates workflows through conversation
 * and stages them for autonomous execution
 */

export interface DetectedWorkflow {
  id: string;
  title: string;
  description: string;
  agents: string[];
  tasks: WorkflowTask[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  createdAt: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
}

export interface WorkflowTask {
  id: string;
  agentId: string;
  description: string;
  dependencies: string[];
  estimatedTime: string;
  files?: string[];
  commands?: string[];
}

export interface ConversationAnalysis {
  hasWorkflow: boolean;
  workflowType: string;
  confidence: number;
  workflow?: DetectedWorkflow;
  reasoning: string;
}

class ElenaWorkflowDetectionService {
  private stagedWorkflows: Map<string, DetectedWorkflow> = new Map();

  /**
   * Analyze Elena's conversation response for workflow patterns
   */
  analyzeConversation(message: string, agentId: string): ConversationAnalysis {
    if (agentId !== 'elena') {
      return {
        hasWorkflow: false,
        workflowType: 'none',
        confidence: 0,
        reasoning: 'Not Elena - workflow detection only applies to Elena'
      };
    }

    // Enhanced workflow detection patterns
    const workflowPatterns = [
      {
        type: 'launch_readiness',
        keywords: ['launch', 'readiness', 'platform audit', 'production check', 'deployment validation'],
        agents: ['quinn', 'zara', 'victoria', 'maya', 'rachel'],
        priority: 'critical' as const
      },
      {
        type: 'design_overhaul',
        keywords: ['redesign', 'luxury upgrade', 'visual improvement', 'UI enhancement', 'brand consistency'],
        agents: ['aria', 'victoria', 'rachel', 'quinn'],
        priority: 'high' as const
      },
      {
        type: 'technical_optimization',
        keywords: ['performance', 'optimization', 'technical review', 'code quality', 'architecture'],
        agents: ['zara', 'maya', 'quinn', 'ava'],
        priority: 'high' as const
      },
      {
        type: 'marketing_campaign',
        keywords: ['marketing', 'campaign', 'social media', 'content creation', 'user acquisition'],
        agents: ['sophia', 'martha', 'rachel', 'maya'],
        priority: 'medium' as const
      },
      {
        type: 'business_strategy',
        keywords: ['strategy', 'business plan', 'revenue optimization', 'user journey', 'conversion'],
        agents: ['diana', 'martha', 'ava', 'quinn'],
        priority: 'high' as const
      }
    ];

    const messageLower = message.toLowerCase();
    
    for (const pattern of workflowPatterns) {
      const matchingKeywords = pattern.keywords.filter(keyword => 
        messageLower.includes(keyword.toLowerCase())
      );

      if (matchingKeywords.length >= 2) {
        const workflow = this.createWorkflowFromPattern(pattern, message, matchingKeywords);
        
        return {
          hasWorkflow: true,
          workflowType: pattern.type,
          confidence: Math.min(0.9, matchingKeywords.length * 0.3),
          workflow,
          reasoning: `Detected ${pattern.type} workflow based on keywords: ${matchingKeywords.join(', ')}`
        };
      }
    }

    // Fallback: Look for coordination language
    const coordinationKeywords = [
      'coordinate', 'agents', 'workflow', 'implement', 'execute', 
      'deploy', 'team effort', 'multi-agent', 'collaboration'
    ];

    const coordinationMatches = coordinationKeywords.filter(keyword =>
      messageLower.includes(keyword.toLowerCase())
    );

    if (coordinationMatches.length >= 2) {
      const workflow = this.createGenericWorkflow(message);
      
      return {
        hasWorkflow: true,
        workflowType: 'coordination',
        confidence: 0.6,
        workflow,
        reasoning: `Generic coordination workflow detected: ${coordinationMatches.join(', ')}`
      };
    }

    return {
      hasWorkflow: false,
      workflowType: 'conversation',
      confidence: 0,
      reasoning: 'No workflow patterns detected - standard conversation'
    };
  }

  /**
   * Create workflow from detected pattern
   */
  private createWorkflowFromPattern(pattern: any, message: string, keywords: string[]): DetectedWorkflow {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tasks: WorkflowTask[] = pattern.agents.map((agentId: string, index: number) => ({
      id: `task_${index + 1}`,
      agentId,
      description: this.generateTaskDescription(agentId, pattern.type, keywords),
      dependencies: index === 0 ? [] : [`task_${index}`],
      estimatedTime: this.estimateTaskTime(agentId, pattern.type),
      files: this.suggestRelevantFiles(agentId, pattern.type),
      commands: this.suggestCommands(agentId, pattern.type)
    }));

    return {
      id: workflowId,
      title: this.generateWorkflowTitle(pattern.type, keywords),
      description: `Auto-detected workflow: ${pattern.type}. Keywords found: ${keywords.join(', ')}`,
      agents: pattern.agents,
      tasks,
      priority: pattern.priority,
      estimatedDuration: this.estimateWorkflowDuration(tasks),
      createdAt: new Date(),
      status: 'staged'
    };
  }

  /**
   * Create generic coordination workflow
   */
  private createGenericWorkflow(message: string): DetectedWorkflow {
    const workflowId = `generic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: workflowId,
      title: 'Elena Coordination Workflow',
      description: 'Generic multi-agent coordination workflow detected from conversation',
      agents: ['quinn', 'zara', 'victoria'],
      tasks: [
        {
          id: 'task_1',
          agentId: 'quinn',
          description: 'Quality assessment and validation',
          dependencies: [],
          estimatedTime: '15 minutes'
        },
        {
          id: 'task_2',
          agentId: 'zara',
          description: 'Technical implementation and testing',
          dependencies: ['task_1'],
          estimatedTime: '30 minutes'
        },
        {
          id: 'task_3',
          agentId: 'victoria',
          description: 'User experience validation',
          dependencies: ['task_2'],
          estimatedTime: '20 minutes'
        }
      ],
      priority: 'medium',
      estimatedDuration: '65 minutes',
      createdAt: new Date(),
      status: 'staged'
    };
  }

  /**
   * Stage workflow for manual execution
   */
  stageWorkflow(workflow: DetectedWorkflow): void {
    this.stagedWorkflows.set(workflow.id, workflow);
    console.log(`🎯 ELENA WORKFLOW STAGED: ${workflow.title} (${workflow.agents.length} agents)`);
  }

  /**
   * Get all staged workflows
   */
  getStagedWorkflows(): DetectedWorkflow[] {
    return Array.from(this.stagedWorkflows.values())
      .filter(w => w.status === 'staged')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Execute staged workflow
   */
  async executeWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.stagedWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    try {
      workflow.status = 'executing';
      
      // Call autonomous orchestrator
      const { executeAutonomousDeployment } = await import('./autonomous-orchestrator-service');
      
      const deploymentResult = await executeAutonomousDeployment({
        missionType: workflow.title,
        agentList: workflow.agents,
        taskDescription: workflow.description,
        priority: workflow.priority
      });

      workflow.status = deploymentResult.success ? 'completed' : 'failed';
      
      console.log(`✅ ELENA WORKFLOW EXECUTED: ${workflow.title} - ${workflow.status}`);
      return deploymentResult.success;
      
    } catch (error) {
      workflow.status = 'failed';
      console.error(`❌ ELENA WORKFLOW FAILED: ${workflow.title}`, error);
      return false;
    }
  }

  /**
   * Remove completed workflows older than 24 hours
   */
  cleanupOldWorkflows(): void {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [id, workflow] of this.stagedWorkflows.entries()) {
      if (workflow.createdAt < dayAgo && workflow.status !== 'staged') {
        this.stagedWorkflows.delete(id);
      }
    }
  }

  // Helper methods
  private generateWorkflowTitle(type: string, keywords: string[]): string {
    const titles = {
      launch_readiness: 'Platform Launch Readiness Validation',
      design_overhaul: 'Luxury Design System Overhaul',
      technical_optimization: 'Technical Performance Optimization',
      marketing_campaign: 'Strategic Marketing Campaign Launch',
      business_strategy: 'Business Strategy Implementation'
    };
    return titles[type as keyof typeof titles] || `Elena Workflow: ${keywords[0]}`;
  }

  private generateTaskDescription(agentId: string, workflowType: string, keywords: string[]): string {
    const descriptions = {
      quinn: `Quality validation and luxury standards verification for ${workflowType}`,
      zara: `Technical implementation and performance optimization for ${workflowType}`,
      aria: `Luxury design implementation and visual enhancement for ${workflowType}`,
      victoria: `User experience optimization and interface design for ${workflowType}`,
      rachel: `Voice consistency and content optimization for ${workflowType}`,
      maya: `AI photography and visual content enhancement for ${workflowType}`,
      sophia: `Social media and community engagement for ${workflowType}`,
      martha: `Marketing optimization and conversion enhancement for ${workflowType}`,
      diana: `Business strategy and revenue optimization for ${workflowType}`,
      ava: `Automation and workflow optimization for ${workflowType}`,
      wilma: `Process design and efficiency optimization for ${workflowType}`,
      olga: `Repository organization and architectural cleanup for ${workflowType}`
    };
    return descriptions[agentId as keyof typeof descriptions] || `${agentId} specialized task for ${workflowType}`;
  }

  private estimateTaskTime(agentId: string, workflowType: string): string {
    const times = {
      quinn: '15-20 minutes',
      zara: '30-45 minutes',
      aria: '25-35 minutes',
      victoria: '20-30 minutes',
      rachel: '15-25 minutes',
      maya: '20-30 minutes',
      sophia: '15-25 minutes',
      martha: '20-30 minutes',
      diana: '15-25 minutes',
      ava: '25-35 minutes',
      wilma: '15-25 minutes',
      olga: '20-30 minutes'
    };
    return times[agentId as keyof typeof times] || '20-30 minutes';
  }

  private estimateWorkflowDuration(tasks: WorkflowTask[]): string {
    // Rough estimation - could be made more sophisticated
    const totalMinutes = tasks.length * 25; // Average 25 minutes per task
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  private suggestRelevantFiles(agentId: string, workflowType: string): string[] {
    const fileMap = {
      quinn: ['client/src/components/', 'server/routes.ts'],
      zara: ['server/', 'package.json', 'vite.config.ts'],
      aria: ['client/src/components/ui/', 'client/src/styles/'],
      victoria: ['client/src/pages/', 'client/src/components/'],
      rachel: ['client/src/pages/', 'shared/'],
      maya: ['server/services/'],
      sophia: ['client/src/components/social/'],
      martha: ['client/src/components/marketing/'],
      diana: ['server/api/', 'shared/schema.ts'],
      ava: ['server/workflows/'],
      wilma: ['server/templates/'],
      olga: ['/', 'archive/']
    };
    return fileMap[agentId as keyof typeof fileMap] || [];
  }

  private suggestCommands(agentId: string, workflowType: string): string[] {
    const commandMap = {
      quinn: ['npm run type-check', 'npm run lint'],
      zara: ['npm run build', 'npm test', 'npm run db:push'],
      aria: ['npm run dev'],
      victoria: ['npm run dev'],
      rachel: [],
      maya: [],
      sophia: [],
      martha: [],
      diana: ['npm run db:push'],
      ava: [],
      wilma: [],
      olga: []
    };
    return commandMap[agentId as keyof typeof commandMap] || [];
  }
}

// Export singleton instance
export const elenaWorkflowDetectionService = new ElenaWorkflowDetectionService();