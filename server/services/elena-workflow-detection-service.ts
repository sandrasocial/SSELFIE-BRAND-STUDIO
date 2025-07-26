/**
 * ELENA WORKFLOW DETECTION SERVICE
 * Revolutionary conversational-to-autonomous bridge system
 * Detects Elena's strategic coordination language and converts to executable workflows
 */

interface DetectedWorkflow {
  id: string;
  title: string;
  description: string;
  agents: string[];
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  createdAt: Date;
  status: 'staged' | 'executing' | 'completed';
}

interface WorkflowAnalysis {
  hasWorkflow: boolean;
  confidence: number;
  workflow?: DetectedWorkflow;
  patterns: string[];
  extractedText: string;
}

class ElenaWorkflowDetectionService {
  private static instance: ElenaWorkflowDetectionService;
  private stagedWorkflows: Map<string, DetectedWorkflow> = new Map();

  // Agent names for detection
  private readonly AGENT_NAMES = [
    'elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 
    'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'
  ];

  // Workflow detection patterns - Elena's coordination language
  private readonly WORKFLOW_PATTERNS = [
    /I'll coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /Let's have (.*?) (?:and|with) (.*?) work on (.*)/i,
    /(.*?) (?:and|with) (.*?) should (.*)/i,
    /Deploy (.*?) (?:and|with) (.*?) for (.*)/i,
    /I'll get (.*?) (?:and|with) (.*?) to (.*)/i,
    /Activate (.*?) (?:and|with) (.*?) for (.*)/i,
    /Coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /Task (.*?) (?:and|with) (.*?) with (.*)/i
  ];

  // Priority keywords
  private readonly PRIORITY_KEYWORDS = {
    high: ['urgent', 'critical', 'immediately', 'asap', 'emergency', 'fix', 'broken'],
    medium: ['important', 'should', 'needs', 'required', 'update'],
    low: ['when possible', 'eventually', 'consider', 'maybe', 'could']
  };

  static getInstance(): ElenaWorkflowDetectionService {
    if (!ElenaWorkflowDetectionService.instance) {
      ElenaWorkflowDetectionService.instance = new ElenaWorkflowDetectionService();
    }
    return ElenaWorkflowDetectionService.instance;
  }

  /**
   * Analyze Elena's conversation for workflow patterns
   */
  analyzeConversation(message: string, agentName: string): WorkflowAnalysis {
    if (agentName.toLowerCase() !== 'elena') {
      return { hasWorkflow: false, confidence: 0, patterns: [], extractedText: '' };
    }

    const patterns: string[] = [];
    let confidence = 0;
    let extractedAgents: string[] = [];
    let extractedTasks: string[] = [];

    // Check for workflow patterns
    for (const pattern of this.WORKFLOW_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        patterns.push(pattern.source);
        confidence += 0.3;

        // Extract agents and tasks from matches
        if (match[1]) extractedAgents.push(...this.extractAgentNames(match[1]));
        if (match[2]) extractedAgents.push(...this.extractAgentNames(match[2]));
        if (match[3]) extractedTasks.push(match[3]);
      }
    }

    // Check for agent mentions
    const mentionedAgents = this.extractAgentNames(message);
    if (mentionedAgents.length >= 2) {
      confidence += 0.2;
      extractedAgents.push(...mentionedAgents);
    }

    // Check for coordination keywords
    const coordinationKeywords = ['coordinate', 'deploy', 'activate', 'task', 'assign', 'work together'];
    for (const keyword of coordinationKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        confidence += 0.1;
      }
    }

    // Remove duplicates
    extractedAgents = [...new Set(extractedAgents)];
    extractedTasks = [...new Set(extractedTasks)];

    const hasWorkflow = confidence >= 0.4 && extractedAgents.length >= 1;

    let workflow: DetectedWorkflow | undefined;
    if (hasWorkflow) {
      workflow = this.createWorkflowFromAnalysis(message, extractedAgents, extractedTasks);
    }

    return {
      hasWorkflow,
      confidence,
      workflow,
      patterns,
      extractedText: message
    };
  }

  /**
   * Extract agent names from text
   */
  private extractAgentNames(text: string): string[] {
    const agents: string[] = [];
    const lowerText = text.toLowerCase();

    for (const agentName of this.AGENT_NAMES) {
      if (lowerText.includes(agentName.toLowerCase())) {
        agents.push(agentName);
      }
    }

    return agents;
  }

  /**
   * Determine priority from message content
   */
  private determinePriority(message: string): 'high' | 'medium' | 'low' {
    const lowerMessage = message.toLowerCase();

    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return priority as 'high' | 'medium' | 'low';
        }
      }
    }

    return 'medium'; // default
  }

  /**
   * Create workflow from analysis
   */
  private createWorkflowFromAnalysis(
    message: string, 
    agents: string[], 
    tasks: string[]
  ): DetectedWorkflow {
    const workflowId = `elena-workflow-${Date.now()}`;
    const priority = this.determinePriority(message);
    
    // Generate title from first task or message
    let title = tasks[0] || 'Multi-agent coordination task';
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    // Estimate duration based on agent count and task complexity
    let estimatedDuration = '30 minutes';
    if (agents.length >= 3) estimatedDuration = '45 minutes';
    if (tasks.length >= 3) estimatedDuration = '1 hour';
    if (priority === 'high') estimatedDuration = '15 minutes';

    return {
      id: workflowId,
      title: `Coordinate ${agents.join(' & ')} - ${title}`,
      description: message.length > 200 ? message.substring(0, 197) + '...' : message,
      agents,
      tasks: tasks.length > 0 ? tasks : ['Implement strategic coordination'],
      priority,
      estimatedDuration,
      createdAt: new Date(),
      status: 'staged'
    };
  }

  /**
   * Stage workflow for manual execution
   */
  stageWorkflow(workflow: DetectedWorkflow): void {
    this.stagedWorkflows.set(workflow.id, workflow);
    console.log(`🎯 ELENA WORKFLOW STAGED: ${workflow.title} (${workflow.agents.length} agents, ${workflow.priority} priority)`);
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
   * Execute workflow by ID
   */
  async executeWorkflow(workflowId: string): Promise<{ success: boolean; message: string }> {
    const workflow = this.stagedWorkflows.get(workflowId);
    if (!workflow) {
      return { success: false, message: 'Workflow not found' };
    }

    workflow.status = 'executing';
    this.stagedWorkflows.set(workflowId, workflow);

    try {
      // Integration with autonomous orchestrator
      const { autonomousOrchestrator } = await import('./autonomous-orchestrator');
      
      const deployment = await autonomousOrchestrator.deployAgents({
        agents: workflow.agents,
        mission: workflow.description,
        priority: workflow.priority,
        estimatedDuration: workflow.estimatedDuration
      });

      if (deployment.success) {
        workflow.status = 'completed';
        this.stagedWorkflows.set(workflowId, workflow);
        return { success: true, message: `Workflow executed successfully. Deployment ID: ${deployment.deploymentId}` };
      } else {
        workflow.status = 'staged'; // revert to staged
        this.stagedWorkflows.set(workflowId, workflow);
        return { success: false, message: deployment.error || 'Deployment failed' };
      }
    } catch (error) {
      workflow.status = 'staged'; // revert to staged
      this.stagedWorkflows.set(workflowId, workflow);
      console.error('❌ ELENA WORKFLOW EXECUTION ERROR:', error);
      return { success: false, message: `Execution error: ${error.message}` };
    }
  }

  /**
   * Remove completed or cancelled workflows
   */
  removeWorkflow(workflowId: string): boolean {
    return this.stagedWorkflows.delete(workflowId);
  }

  /**
   * Clear all workflows (for testing)
   */
  clearAllWorkflows(): void {
    this.stagedWorkflows.clear();
    console.log('🧹 ELENA WORKFLOWS: All workflows cleared');
  }
}

// Export singleton instance
export const elenaWorkflowDetectionService = ElenaWorkflowDetectionService.getInstance();
export type { DetectedWorkflow, WorkflowAnalysis };