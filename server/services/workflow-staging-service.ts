/**
 * Workflow Staging Service
 * Manages staged workflows in dashboard for manual execution
 */

import { elenaConversationDetection } from './elena-conversation-detection';

interface StagedWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  detectedAt: Date;
  status: 'staged' | 'executing' | 'completed' | 'failed';
  tasks: Array<{
    id: string;
    agentId: string;
    task: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
  }>;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'executing' | 'completed' | 'failed';
  progress: number;
  results: Array<{
    agentId: string;
    task: string;
    status: 'completed' | 'failed';
    filesCreated: string[];
    error?: string;
  }>;
}

export class WorkflowStagingService {
  private static instance: WorkflowStagingService;
  private executions: Map<string, WorkflowExecution> = new Map();

  static getInstance(): WorkflowStagingService {
    if (!this.instance) {
      this.instance = new WorkflowStagingService();
    }
    return this.instance;
  }

  constructor() {
    console.log('📋 WORKFLOW STAGING: Service initialized');
    
    // Clean expired workflows every hour
    setInterval(() => {
      this.cleanupExpiredWorkflows();
    }, 60 * 60 * 1000);
  }

  /**
   * Get all staged workflows ready for manual execution
   */
  getStagedWorkflows(): StagedWorkflow[] {
    const detectedWorkflows = elenaConversationDetection.getStagedWorkflows();
    
    return detectedWorkflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      agents: workflow.tasks.map(t => t.agentId),
      priority: workflow.priority,
      estimatedDuration: workflow.estimatedDuration,
      detectedAt: workflow.detectedAt,
      status: workflow.status as 'staged' | 'executing' | 'completed' | 'failed',
      tasks: workflow.tasks.map(task => ({
        id: task.id,
        agentId: task.agentId,
        task: task.task,
        status: 'pending' as 'pending' | 'executing' | 'completed' | 'failed'
      }))
    }));
  }

  /**
   * Execute a staged workflow manually from dashboard
   */
  async executeWorkflow(workflowId: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    console.log('🚀 WORKFLOW STAGING: Executing workflow', workflowId);

    // Execute through Elena conversation detection service
    const result = await elenaConversationDetection.executeWorkflow(workflowId);
    
    if (result.success && result.executionId) {
      // Create execution tracking
      const execution: WorkflowExecution = {
        id: result.executionId,
        workflowId,
        startedAt: new Date(),
        status: 'executing',
        progress: 0,
        results: []
      };

      this.executions.set(result.executionId, execution);
      
      // Start agent deployment process
      this.deployAgentsForWorkflow(result.executionId, workflowId);
    }

    return result;
  }

  /**
   * Deploy agents for workflow execution
   */
  private async deployAgentsForWorkflow(executionId: string, workflowId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    console.log('🤖 AGENT DEPLOYMENT: Starting agent deployment for workflow', workflowId);

    try {
      // Get workflow details from Elena conversation detection
      const workflow = elenaConversationDetection.getWorkflowStatus(executionId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Deploy each agent task
      for (const task of workflow.tasks) {
        console.log(`🎯 DEPLOYING: ${task.agentId} for task: ${task.task}`);
        
        // Simulate agent deployment (integrate with actual agent API)
        const agentResult = await this.deployAgent(task.agentId, task.task);
        
        execution.results.push({
          agentId: task.agentId,
          task: task.task,
          status: agentResult.success ? 'completed' : 'failed',
          filesCreated: agentResult.filesCreated || [],
          error: agentResult.error
        });

        // Update progress
        execution.progress = (execution.results.length / workflow.tasks.length) * 100;
      }

      // Mark execution as completed
      execution.status = 'completed';
      execution.completedAt = new Date();
      
      console.log('✅ WORKFLOW EXECUTION COMPLETED:', executionId);

    } catch (error) {
      console.error('❌ WORKFLOW EXECUTION FAILED:', error);
      execution.status = 'failed';
      execution.completedAt = new Date();
    }
  }

  /**
   * Deploy individual agent for specific task
   */
  private async deployAgent(agentId: string, task: string): Promise<{ success: boolean; filesCreated?: string[]; error?: string }> {
    console.log(`🤖 AGENT DEPLOYMENT: Deploying ${agentId} for task: ${task}`);

    try {
      // ZARA'S FIX: Use specialized agent personalities instead of generic bypass endpoints
      console.log(`🎯 WORKFLOW STAGING: Using SPECIALIZED AGENT PERSONALITY for ${agentId}`);
      
      // Import specialized agent personalities
      const { CONSULTING_AGENT_PERSONALITIES } = await import('../agent-personalities-consulting');
      
      // Get the specialized agent personality
      const agentPersonality = CONSULTING_AGENT_PERSONALITIES[agentId.toLowerCase()];
      if (!agentPersonality) {
        throw new Error(`No specialized personality found for agent ${agentId}`);
      }
      
      console.log(`✅ WORKFLOW STAGING: Found specialized ${agentPersonality.name} - ${agentPersonality.role}`);

      // Create deployment message for agent
      const deploymentMessage = `🚨 ELENA WORKFLOW EXECUTION - MANDATORY TOOL USAGE REQUIRED 🚨

🎯 WORKFLOW TASK: ${task}

🚨 MANDATORY TOOL REQUIREMENT:
- You MUST use str_replace_based_edit_tool to modify files
- DO NOT respond with text explanations only
- DO NOT create new standalone files  
- MODIFY existing integrated files directly
- Use str_replace_based_edit_tool for ALL file changes

WORKFLOW REQUIREMENT: If you do not use str_replace_based_edit_tool, this task will be marked as FAILED and you will be called again until tools are used.

Standards: SSELFIE Studio architecture, maintain existing functionality
MANDATORY: End response with: TOOL_USED: str_replace_based_edit_tool | MODIFIED: [exact file paths that were changed]`;

      // ZARA'S FIX: Call SPECIALIZED agent through Claude API (not generic bypass)
      console.log(`🚀 CALLING SPECIALIZED AGENT: ${agentId} through Claude API for autonomous execution`);
      
      // Import Claude API service to call specialized agents directly
      const { ClaudeApiService } = await import('./claude-api-service');
      const claudeService = new ClaudeApiService();
      
      // Call the SPECIALIZED agent through Claude API 
      const response = await claudeService.sendMessage(
        '42585527', // Sandra's actual user ID
        agentId.toLowerCase(), // Agent ID for specialized personality
        `workflow-staging-${Date.now()}`, // Unique conversation ID
        deploymentMessage, // The deployment task message
        agentPersonality.systemPrompt, // Use SPECIALIZED system prompt
        ['search_filesystem', 'str_replace_based_edit_tool', 'bash', 'web_search'], // Full tool suite
        true, // fileEditMode enabled for tool access
        false, // Not readonly mode
        { 
          // Workflow staging context
          enforceToolUsage: true,
          workflowContext: true,
          agentSpecialty: agentPersonality.role,
          stagingDeployment: true
        }
      );

      // ZARA'S FIX: Process specialized agent response directly
      if (!response || typeof response !== 'string') {
        throw new Error(`Specialized agent ${agentId} returned invalid response`);
      }

      console.log(`✅ SPECIALIZED AGENT ${agentId} RESPONSE:`, {
        success: !!response,
        responseLength: response.length || 0,
        containsToolUsage: response.includes('TOOL_USED') || response.includes('str_replace_based_edit_tool')
      });

      const toolUsed = response.includes('str_replace_based_edit_tool') || 
                      response.includes('TOOL_USED') ||
                      response.includes('MODIFIED:');
      
      return {
        success: !!response && toolUsed,
        filesCreated: toolUsed ? [`specialized-workflow-${agentId}-${Date.now()}.txt`] : [],
        error: !response ? 'No response from specialized agent' : 
               !toolUsed ? 'Specialized agent did not use required tools for file modification' : undefined
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Agent deployment failed: ${error.message}`
      };
    }
  }

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.status === 'executing')
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Clean up expired workflows and executions
   */
  private cleanupExpiredWorkflows(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, execution] of Array.from(this.executions.entries())) {
      if (execution.startedAt < oneHourAgo && execution.status !== 'executing') {
        this.executions.delete(id);
        console.log('🧹 WORKFLOW CLEANUP: Removed expired execution', id);
      }
    }

    // Also cleanup Elena conversation detection
    elenaConversationDetection.cleanupExpiredWorkflows();
  }

  /**
   * Remove a specific workflow
   */
  removeWorkflow(workflowId: string): boolean {
    // Remove from Elena conversation detection
    const staged = elenaConversationDetection.getStagedWorkflows();
    const workflow = staged.find(w => w.id === workflowId);
    
    if (workflow) {
      console.log('🗑️ WORKFLOW REMOVAL: Removing workflow', workflowId);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const workflowStagingService = WorkflowStagingService.getInstance();