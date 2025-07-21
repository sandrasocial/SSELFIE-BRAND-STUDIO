/**
 * SHARED WORKFLOW CONTEXT SYSTEM - PERMANENT FIX FOR AGENT CONVERSATION PERSISTENCE
 * Ensures all agents maintain conversation continuity throughout entire workflows
 */

interface WorkflowContext {
  workflowId: string;
  coordinatorId: string; // Elena's user ID
  projectType: string;
  requirements: string[];
  currentStage: string;
  agentTasks: { [agentId: string]: AgentTask };
  sharedMemory: { [key: string]: any };
  startTime: number;
  lastUpdate: number;
}

interface AgentTask {
  agentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  description: string;
  filesCreated: string[];
  dependencies: string[];
  messages: ConversationMessage[];
  lastActivity: number;
}

interface ConversationMessage {
  role: 'coordinator' | 'agent';
  agentId: string;
  content: string;
  timestamp: number;
  filesCreated?: string[];
}

class SharedWorkflowContextManager {
  private static activeWorkflows: Map<string, WorkflowContext> = new Map();
  private static persistenceFile = 'server/workflows/active-contexts.json';

  /**
   * Initialize a new shared workflow context
   */
  static async initializeWorkflow(
    coordinatorId: string, 
    projectType: string, 
    requirements: string[]
  ): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: WorkflowContext = {
      workflowId,
      coordinatorId,
      projectType,
      requirements,
      currentStage: 'planning',
      agentTasks: {},
      sharedMemory: {
        projectGoals: requirements,
        designPreferences: {},
        technicalDecisions: {},
        completedComponents: []
      },
      startTime: Date.now(),
      lastUpdate: Date.now()
    };

    this.activeWorkflows.set(workflowId, context);
    await this.persistWorkflows();
    
    console.log(`🔧 SHARED CONTEXT: Initialized workflow ${workflowId} for ${projectType}`);
    return workflowId;
  }

  /**
   * Add agent task to shared workflow context
   */
  static async addAgentTask(
    workflowId: string,
    agentId: string,
    description: string,
    dependencies: string[] = []
  ): Promise<void> {
    const context = this.activeWorkflows.get(workflowId);
    if (!context) return;

    context.agentTasks[agentId] = {
      agentId,
      status: 'pending',
      description,
      filesCreated: [],
      dependencies,
      messages: [],
      lastActivity: Date.now()
    };

    context.lastUpdate = Date.now();
    await this.persistWorkflows();
    
    console.log(`📋 SHARED CONTEXT: Added task for ${agentId} in workflow ${workflowId}`);
  }

  /**
   * Update agent task status with conversation message
   */
  static async updateAgentProgress(
    workflowId: string,
    agentId: string,
    message: string,
    filesCreated: string[] = [],
    status?: 'in_progress' | 'completed' | 'blocked'
  ): Promise<void> {
    const context = this.activeWorkflows.get(workflowId);
    if (!context || !context.agentTasks[agentId]) return;

    const task = context.agentTasks[agentId];
    
    // Add message to shared conversation
    task.messages.push({
      role: 'agent',
      agentId,
      content: message,
      timestamp: Date.now(),
      filesCreated
    });

    // Update task status
    if (status) task.status = status;
    task.filesCreated.push(...filesCreated);
    task.lastActivity = Date.now();
    
    // Update shared memory with completed components
    if (filesCreated.length > 0) {
      context.sharedMemory.completedComponents.push(...filesCreated);
    }

    context.lastUpdate = Date.now();
    await this.persistWorkflows();
    
    console.log(`🔄 SHARED CONTEXT: Updated ${agentId} progress in workflow ${workflowId} - ${filesCreated.length} files created`);
  }

  /**
   * Get shared context for agent to maintain conversation continuity
   */
  static getAgentContext(workflowId: string, agentId: string): string {
    const context = this.activeWorkflows.get(workflowId);
    if (!context) return '';

    const task = context.agentTasks[agentId];
    if (!task) return '';

    // Build comprehensive context for agent
    let contextSummary = `**ACTIVE WORKFLOW CONTEXT:**\n`;
    contextSummary += `Project: ${context.projectType}\n`;
    contextSummary += `Stage: ${context.currentStage}\n`;
    contextSummary += `Your Task: ${task.description}\n\n`;

    // Include relevant conversation history
    if (task.messages.length > 0) {
      contextSummary += `**PREVIOUS CONVERSATION:**\n`;
      const recentMessages = task.messages.slice(-3); // Last 3 messages
      recentMessages.forEach(msg => {
        contextSummary += `${msg.role === 'coordinator' ? 'Elena' : 'You'}: ${msg.content.substring(0, 200)}...\n`;
      });
      contextSummary += `\n`;
    }

    // Include completed components by other agents
    if (context.sharedMemory.completedComponents.length > 0) {
      contextSummary += `**COMPLETED COMPONENTS:**\n`;
      context.sharedMemory.completedComponents.forEach(comp => {
        contextSummary += `• ${comp}\n`;
      });
      contextSummary += `\n`;
    }

    // Include dependencies
    if (task.dependencies.length > 0) {
      contextSummary += `**DEPENDENCIES:**\n`;
      task.dependencies.forEach(dep => {
        const depTask = context.agentTasks[dep];
        if (depTask) {
          contextSummary += `• ${dep}: ${depTask.status} - ${depTask.description}\n`;
        }
      });
    }

    return contextSummary;
  }

  /**
   * Add coordinator (Elena) message to shared context
   */
  static async addCoordinatorMessage(
    workflowId: string,
    agentId: string,
    message: string
  ): Promise<void> {
    const context = this.activeWorkflows.get(workflowId);
    if (!context || !context.agentTasks[agentId]) return;

    context.agentTasks[agentId].messages.push({
      role: 'coordinator',
      agentId: 'elena',
      content: message,
      timestamp: Date.now()
    });

    context.lastUpdate = Date.now();
    await this.persistWorkflows();
  }

  /**
   * Get workflow summary for Elena coordination
   */
  static getWorkflowSummary(workflowId: string): string {
    const context = this.activeWorkflows.get(workflowId);
    if (!context) return '';

    let summary = `**WORKFLOW STATUS SUMMARY:**\n`;
    summary += `Project: ${context.projectType}\n`;
    summary += `Stage: ${context.currentStage}\n`;
    summary += `Started: ${new Date(context.startTime).toLocaleString()}\n\n`;

    summary += `**AGENT TASKS:**\n`;
    Object.values(context.agentTasks).forEach(task => {
      const statusEmoji = {
        'pending': '⏳',
        'in_progress': '🔄', 
        'completed': '✅',
        'blocked': '🚫'
      }[task.status] || '❓';
      
      summary += `${statusEmoji} ${task.agentId}: ${task.description} (${task.filesCreated.length} files created)\n`;
    });

    return summary;
  }

  /**
   * Load workflows from persistence
   */
  static async loadWorkflows(): Promise<void> {
    try {
      const fs = await import('fs');
      const data = await fs.promises.readFile(this.persistenceFile, 'utf8');
      const workflowsData = JSON.parse(data);
      
      workflowsData.forEach((workflow: WorkflowContext) => {
        this.activeWorkflows.set(workflow.workflowId, workflow);
      });
      
      console.log(`🔧 SHARED CONTEXT: Loaded ${this.activeWorkflows.size} active workflows`);
    } catch (error) {
      console.log(`🔧 SHARED CONTEXT: No existing workflows to load (${error.message})`);
    }
  }

  /**
   * Persist workflows to file
   */
  private static async persistWorkflows(): Promise<void> {
    try {
      const fs = await import('fs');
      const workflowsArray = Array.from(this.activeWorkflows.values());
      await fs.promises.writeFile(this.persistenceFile, JSON.stringify(workflowsArray, null, 2));
    } catch (error) {
      console.error('Failed to persist workflows:', error);
    }
  }

  /**
   * Complete workflow and clean up
   */
  static async completeWorkflow(workflowId: string): Promise<void> {
    this.activeWorkflows.delete(workflowId);
    await this.persistWorkflows();
    console.log(`✅ SHARED CONTEXT: Completed and cleaned up workflow ${workflowId}`);
  }
}

// Load workflows on startup
SharedWorkflowContextManager.loadWorkflows();

export default SharedWorkflowContextManager;