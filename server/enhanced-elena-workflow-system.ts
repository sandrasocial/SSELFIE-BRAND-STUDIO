/**
 * ENHANCED ELENA WORKFLOW SYSTEM WITH MULTI-AGENT COMMUNICATION
 * 
 * Enterprise-ready workflow orchestration with real agent-to-agent communication
 * ZARA'S FIX: Connected to specialized agent personalities
 */

import { MultiAgentCommunicationSystem, WorkflowContext } from './agents/multi-agent-communication-system.js';
// ZARA'S FIX: Import specialized agent personalities
import { CONSULTING_AGENT_PERSONALITIES } from './agent-personalities-consulting';

interface EnhancedWorkflowStep {
  stepId: string;
  agentId: string;
  description: string;
  estimatedMinutes: number;
  dependencies?: string[];
  collaborators?: string[];
  sharedData?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

interface EnhancedWorkflow {
  id: string;
  name: string;
  description: string;
  steps: EnhancedWorkflowStep[];
  participants: string[];
  sharedContext: Record<string, any>;
  status: 'created' | 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

class EnhancedElenaWorkflowSystem {
  private static instance: EnhancedElenaWorkflowSystem;
  private workflows: Map<string, EnhancedWorkflow> = new Map();
  private workflowProgress: Map<string, any> = new Map();
  private communicationSystem: MultiAgentCommunicationSystem;

  constructor() {
    this.communicationSystem = MultiAgentCommunicationSystem.getInstance();
    this.loadWorkflowsFromDisk();
  }

  static getInstance(): EnhancedElenaWorkflowSystem {
    if (!EnhancedElenaWorkflowSystem.instance) {
      EnhancedElenaWorkflowSystem.instance = new EnhancedElenaWorkflowSystem();
    }
    return EnhancedElenaWorkflowSystem.instance;
  }

  /**
   * Create enhanced workflow with multi-agent coordination
   */
  createEnhancedWorkflow(
    name: string,
    description: string,
    steps: Array<{
      agentId: string;
      description: string;
      estimatedMinutes: number;
      dependencies?: string[];
      collaborators?: string[];
      sharedData?: Record<string, any>;
    }>
  ): string {
    const workflowId = `enhanced_workflow_${Date.now()}`;
    
    const enhancedSteps: EnhancedWorkflowStep[] = steps.map((step, index) => ({
      stepId: `step_${index + 1}`,
      agentId: step.agentId,
      description: step.description,
      estimatedMinutes: step.estimatedMinutes,
      dependencies: step.dependencies || [],
      collaborators: step.collaborators || [],
      sharedData: step.sharedData || {},
      status: 'pending',
    }));

    const workflow: EnhancedWorkflow = {
      id: workflowId,
      name,
      description,
      steps: enhancedSteps,
      participants: [...new Set(steps.map(s => s.agentId))],
      sharedContext: {},
      status: 'created',
      createdAt: Date.now(),
    };

    this.workflows.set(workflowId, workflow);
    
    // Create multi-agent communication context
    this.communicationSystem.createWorkflowContext(
      workflowId,
      workflow.participants,
      workflow.sharedContext
    );

    this.saveWorkflowsToDisk();
    
    console.log(`🎯 ENHANCED WORKFLOW CREATED: ${workflowId} with ${workflow.participants.length} agents`);
    return workflowId;
  }

  /**
   * Execute enhanced workflow with real-time agent coordination
   */
  async executeEnhancedWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Enhanced workflow not found: ${workflowId}`);
    }

    workflow.status = 'running';
    console.log(`🚀 EXECUTING ENHANCED WORKFLOW: ${workflowId} - ${workflow.name}`);

    try {
      // Execute steps with dependency management and real-time coordination
      for (const step of workflow.steps) {
        // Check dependencies
        if (step.dependencies?.length) {
          const incompleteDeps = step.dependencies.filter(depId => {
            const depStep = workflow.steps.find(s => s.stepId === depId);
            return depStep?.status !== 'completed';
          });

          if (incompleteDeps.length > 0) {
            console.log(`⏳ STEP ${step.stepId} waiting for dependencies: ${incompleteDeps.join(', ')}`);
            continue;
          }
        }

        // Execute step with multi-agent coordination
        step.status = 'in_progress';
        this.updateWorkflowProgress(workflowId, step.stepId, 'in_progress', `${step.agentId} working...`);

        try {
          const stepResult = await this.executeWorkflowStep(workflow, step);
          step.result = stepResult;
          step.status = 'completed';
          
          this.updateWorkflowProgress(workflowId, step.stepId, 'completed', `${step.agentId} completed successfully`);
          console.log(`✅ STEP COMPLETED: ${step.stepId} by ${step.agentId}`);
        } catch (error) {
          step.status = 'failed';
          step.result = { error: error.message };
          
          this.updateWorkflowProgress(workflowId, step.stepId, 'failed', `${step.agentId} failed: ${error.message}`);
          console.error(`❌ STEP FAILED: ${step.stepId}:`, error);
        }
      }

      // Check if workflow completed
      const allCompleted = workflow.steps.every(step => step.status === 'completed');
      if (allCompleted) {
        workflow.status = 'completed';
        workflow.completedAt = Date.now();
        console.log(`🎉 ENHANCED WORKFLOW COMPLETED: ${workflowId}`);
      } else {
        workflow.status = 'failed';
        console.log(`💥 ENHANCED WORKFLOW FAILED: ${workflowId}`);
      }

    } catch (error) {
      workflow.status = 'failed';
      console.error(`💥 ENHANCED WORKFLOW ERROR: ${workflowId}:`, error);
    }

    this.saveWorkflowsToDisk();
  }

  /**
   * Execute individual workflow step with agent coordination
   */
  private async executeWorkflowStep(workflow: EnhancedWorkflow, step: EnhancedWorkflowStep): Promise<any> {
    const workflowContext = this.communicationSystem.getWorkflowContext(workflow.id);
    
    // Prepare comprehensive step context
    const stepMessage = `
**ENHANCED WORKFLOW STEP EXECUTION**

**Workflow:** ${workflow.name}
**Description:** ${workflow.description}
**Step ID:** ${step.stepId}
**Your Task:** ${step.description}
**Estimated Time:** ${step.estimatedMinutes} minutes

**Workflow Participants:** ${workflow.participants.join(', ')}
**Your Collaborators:** ${step.collaborators?.join(', ') || 'None'}

**Shared Workflow Context:**
${JSON.stringify(workflowContext?.sharedData || {}, null, 2)}

**Step-Specific Data:**
${JSON.stringify(step.sharedData || {}, null, 2)}

**COLLABORATION INSTRUCTIONS:**
- You can coordinate with other agents using the multi-agent communication system
- All agents have access to the same shared workflow context
- Use real file creation and codebase modification capabilities
- Coordinate with collaborators as needed for complex tasks

**DEPENDENCIES COMPLETED:** ${step.dependencies?.join(', ') || 'None'}

Please execute this step and coordinate with other agents as necessary. Update shared context if needed.
    `;

    // ZARA'S FIX: Use specialized agent personalities instead of generic communication
    console.log(`🎯 ENHANCED ELENA: Using SPECIALIZED AGENT PERSONALITY for ${step.agentId}`);
    
    // Get the specialized agent personality from consulting configuration
    const agentPersonality = CONSULTING_AGENT_PERSONALITIES[step.agentId.toLowerCase()];
    if (!agentPersonality) {
      console.error(`❌ ENHANCED ELENA: No specialized personality found for agent ${step.agentId}`);
      throw new Error(`Specialized agent ${step.agentId} not found`);
    }
    
    console.log(`✅ ENHANCED ELENA: Found specialized ${agentPersonality.name} - ${agentPersonality.role}`);
    
    // Import Claude API service to call specialized agents directly
    const { ClaudeApiService } = await import('./services/claude-api-service');
    const claudeService = new ClaudeApiService();
    
    // Call the SPECIALIZED agent through Claude API (not generic communication)
    console.log(`🚀 ENHANCED ELENA: Calling SPECIALIZED ${step.agentId} through Claude API with tool enforcement`);
    
    const response = await claudeService.sendMessage(
      '42585527', // Sandra's actual user ID
      step.agentId.toLowerCase(), // Agent ID for specialized personality
      `enhanced-workflow-${workflow.id}-${step.stepId}`, // Unique conversation ID
      stepMessage, // The enhanced workflow step message
      agentPersonality.systemPrompt, // Use SPECIALIZED system prompt
      ['search_filesystem', 'str_replace_based_edit_tool', 'bash', 'web_search'], // Full tool suite
      true, // fileEditMode enabled for tool access
      false, // Not readonly mode
      { 
        // Enhanced workflow context
        enforceToolUsage: true,
        workflowContext: true,
        agentSpecialty: agentPersonality.role,
        enhancedWorkflow: true,
        workflowParticipants: workflow.participants
      }
    );

    return response;
  }

  /**
   * Get enhanced workflow status with detailed progress
   */
  getEnhancedWorkflowStatus(workflowId: string): any {
    const workflow = this.workflows.get(workflowId);
    const progress = this.workflowProgress.get(workflowId);
    
    if (!workflow) {
      return { error: 'Enhanced workflow not found' };
    }

    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    const totalSteps = workflow.steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      workflow,
      progress: progress || {},
      progressPercentage,
      completedSteps,
      totalSteps,
      agentStatuses: this.communicationSystem.getAgentStatuses(),
      workflowContext: this.communicationSystem.getWorkflowContext(workflowId)
    };
  }

  /**
   * Update workflow progress
   */
  private updateWorkflowProgress(workflowId: string, stepId: string, status: string, message: string): void {
    if (!this.workflowProgress.has(workflowId)) {
      this.workflowProgress.set(workflowId, {});
    }
    
    const progress = this.workflowProgress.get(workflowId);
    progress[stepId] = {
      status,
      message,
      timestamp: Date.now()
    };
    
    this.saveWorkflowsToDisk();
  }

  /**
   * Load workflows from disk
   */
  private async loadWorkflowsFromDisk(): Promise<void> {
    try {
      const fs = await import('fs');
      if (fs.existsSync('enhanced-workflow-storage.json')) {
        const data = fs.readFileSync('enhanced-workflow-storage.json', 'utf8');
        const parsed = JSON.parse(data);
        
        if (parsed.workflows) {
          this.workflows = new Map(parsed.workflows);
        }
        if (parsed.progress) {
          this.workflowProgress = new Map(parsed.progress);
        }
        
        console.log(`💾 ENHANCED WORKFLOWS LOADED: ${this.workflows.size} workflows, ${this.workflowProgress.size} progress entries`);
      }
    } catch (error) {
      console.error('Error loading enhanced workflows from disk:', error);
    }
  }

  /**
   * Save workflows to disk
   */
  private async saveWorkflowsToDisk(): Promise<void> {
    try {
      const fs = await import('fs');
      const data = {
        workflows: Array.from(this.workflows.entries()),
        progress: Array.from(this.workflowProgress.entries())
      };
      
      fs.writeFileSync('enhanced-workflow-storage.json', JSON.stringify(data, null, 2));
      console.log(`💾 ENHANCED WORKFLOWS SAVED: ${this.workflows.size} workflows, ${this.workflowProgress.size} progress entries`);
    } catch (error) {
      console.error('Error saving enhanced workflows to disk:', error);
    }
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): EnhancedWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Send message between agents in workflow context
   */
  async coordinateAgents(
    fromAgent: string,
    toAgent: string,
    message: string,
    workflowId?: string
  ): Promise<any> {
    return await this.communicationSystem.sendAgentMessage(
      fromAgent,
      toAgent,
      message,
      { workflowId, priority: 'medium' }
    );
  }
}

export { EnhancedElenaWorkflowSystem, EnhancedWorkflow, EnhancedWorkflowStep };