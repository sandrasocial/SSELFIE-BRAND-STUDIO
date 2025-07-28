
/**
 * ELENA UNIFIED ORCHESTRATOR
 * Consolidated workflow detection, staging, and execution system
 * Single source of truth for all Elena coordination
 */

import { v4 as uuidv4 } from 'uuid';

export interface UnifiedWorkflow {
  id: string;
  title: string;
  description: string;
  agents: string[];
  tasks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  createdAt: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  results?: string[];
}

export interface WorkflowAnalysis {
  hasWorkflow: boolean;
  confidence: number;
  workflow?: UnifiedWorkflow;
  patterns: string[];
}

export class ElenaUnifiedOrchestrator {
  private static instance: ElenaUnifiedOrchestrator;
  private workflows: Map<string, UnifiedWorkflow> = new Map();
  
  // Agent names for detection
  private readonly AGENT_NAMES = [
    'elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 
    'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'
  ];

  // Optimized coordination patterns
  private readonly COORDINATION_PATTERNS = [
    /I'll coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /Let's have (.*?) (?:and|with) (.*?) work on (.*)/i,
    /(.*?) (?:and|with) (.*?) should (.*)/i,
    /Deploy (.*?) (?:and|with) (.*?) for (.*)/i,
    /I need (.*?) (?:and|with) (.*?) to (.*)/i
  ];

  static getInstance(): ElenaUnifiedOrchestrator {
    if (!ElenaUnifiedOrchestrator.instance) {
      ElenaUnifiedOrchestrator.instance = new ElenaUnifiedOrchestrator();
    }
    return ElenaUnifiedOrchestrator.instance;
  }

  /**
   * Unified workflow analysis - single entry point
   */
  analyzeMessage(message: string, agentName: string): WorkflowAnalysis {
    if (agentName.toLowerCase() !== 'elena') {
      return { hasWorkflow: false, confidence: 0, patterns: [] };
    }

    const workflow = this.parseElenaMessage(message);
    if (workflow) {
      this.workflows.set(workflow.id, workflow);
      console.log(`✅ ELENA UNIFIED: Workflow created - ${workflow.title} (${workflow.agents.length} agents)`);
      
      return {
        hasWorkflow: true,
        confidence: 0.95,
        workflow,
        patterns: ['Elena Coordination Detected']
      };
    }

    return { hasWorkflow: false, confidence: 0, patterns: [] };
  }

  /**
   * Parse Elena's message for coordination patterns
   */
  private parseElenaMessage(message: string): UnifiedWorkflow | null {
    const agents: string[] = [];
    const tasks: string[] = [];
    let title = 'Elena Coordination Workflow';
    let description = 'Workflow created from Elena coordination';

    // Extract agents mentioned in message
    for (const agentName of this.AGENT_NAMES) {
      if (message.toLowerCase().includes(agentName.toLowerCase())) {
        agents.push(agentName);
      }
    }

    if (agents.length < 2) return null;

    // Parse coordination patterns
    for (const pattern of this.COORDINATION_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        description = match[0];
        tasks.push(match[3] || 'Coordination task');
        break;
      }
    }

    // Extract title from message patterns
    const titleMatch = message.match(/[*"](.*?(?:workflow|coordination|breakthrough).*?)[*"]/i);
    if (titleMatch) {
      title = titleMatch[1];
    }

    return {
      id: `elena_${Date.now()}_${uuidv4().slice(0, 8)}`,
      title,
      description,
      agents: [...new Set(agents)],
      tasks: tasks.length > 0 ? tasks : [`Coordinate ${agents.join(' and ')}`],
      priority: this.determinePriority(message),
      estimatedDuration: this.estimateDuration(agents.length),
      createdAt: new Date(),
      status: 'staged'
    };
  }

  /**
   * Execute workflow with unified execution engine
   */
  async executeWorkflow(workflowId: string): Promise<{ success: boolean; message: string }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, message: 'Workflow not found' };
    }

    workflow.status = 'executing';
    console.log(`🚀 ELENA UNIFIED: Executing workflow ${workflow.title}`);

    try {
      const results: string[] = [];
      
      // Execute each agent task
      for (const agent of workflow.agents) {
        if (agent === 'elena') continue;
        
        try {
          // Import Claude API service for agent execution
          const { ClaudeApiService } = await import('./services/claude-api-service');
          const { CONSULTING_AGENT_PERSONALITIES } = await import('./agent-personalities-consulting');
          
          const claudeService = new ClaudeApiService();
          const agentPersonality = CONSULTING_AGENT_PERSONALITIES[agent.toLowerCase()];
          
          if (!agentPersonality) {
            throw new Error(`No personality found for agent ${agent}`);
          }

          const taskMessage = `ELENA AUTONOMOUS WORKFLOW EXECUTION
Task: ${workflow.description}
Context: Part of Elena's coordinated workflow "${workflow.title}"

Execute your specialized task as part of this coordination.`;

          const response = await claudeService.sendMessage(
            '42585527',
            agent.toLowerCase(),
            `elena_unified_${workflowId}_${Date.now()}`,
            taskMessage,
            agentPersonality.systemPrompt,
            ['search_filesystem', 'str_replace_based_edit_tool', 'bash'],
            true,
            false,
            { workflowContext: true, elenaAutonomousExecution: true }
          );

          if (response) {
            results.push(`✅ ${agent}: Task completed`);
            console.log(`✅ ELENA UNIFIED: ${agent} completed task`);
          } else {
            results.push(`❌ ${agent}: No response`);
          }

        } catch (error) {
          console.error(`❌ ELENA UNIFIED: ${agent} execution error:`, error);
          results.push(`❌ ${agent}: Execution error`);
        }
      }

      workflow.status = 'completed';
      workflow.results = results;
      
      const successCount = results.filter(r => r.startsWith('✅')).length;
      return {
        success: successCount > 0,
        message: `Workflow completed: ${successCount}/${workflow.agents.length - 1} agents successful`
      };

    } catch (error) {
      workflow.status = 'failed';
      console.error('❌ ELENA UNIFIED: Workflow execution failed:', error);
      return { success: false, message: `Execution error: ${error.message}` };
    }
  }

  /**
   * Get staged workflows
   */
  getStagedWorkflows(): UnifiedWorkflow[] {
    return Array.from(this.workflows.values())
      .filter(w => w.status === 'staged')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clear all workflows
   */
  clearAllWorkflows(): void {
    this.workflows.clear();
    console.log('🧹 ELENA UNIFIED: All workflows cleared');
  }

  private determinePriority(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
      return 'critical';
    } else if (lowerMessage.includes('important') || lowerMessage.includes('high priority') || lowerMessage.includes('asap')) {
      return 'high';
    } else if (lowerMessage.includes('low priority') || lowerMessage.includes('when possible')) {
      return 'low';
    }
    
    return 'medium';
  }

  private estimateDuration(agentCount: number): string {
    const baseMinutes = 20;
    const additionalPerAgent = 5;
    const totalMinutes = baseMinutes + (agentCount * additionalPerAgent);
    return `${totalMinutes} minutes`;
  }
}

// Export singleton instance
export const elenaUnifiedOrchestrator = ElenaUnifiedOrchestrator.getInstance();
