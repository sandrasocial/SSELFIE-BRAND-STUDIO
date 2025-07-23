/**
 * ENTERPRISE MULTI-AGENT COMMUNICATION SYSTEM
 * 
 * Enables real-time agent-to-agent communication within workflows
 * All 11 admin agents can coordinate directly with each other
 */

interface AgentMessage {
  fromAgent: string;
  toAgent: string;
  message: string;
  workflowId?: string;
  taskId?: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  conversationId: string;
}

interface AgentResponse {
  success: boolean;
  response: string;
  agentId: string;
  timestamp: number;
  fileOperations?: any[];
}

interface WorkflowContext {
  workflowId: string;
  participants: string[];
  currentPhase: string;
  sharedData: Record<string, any>;
  completedTasks: string[];
  pendingTasks: string[];
}

class MultiAgentCommunicationSystem {
  private static instance: MultiAgentCommunicationSystem;
  private activeConversations: Map<string, AgentMessage[]> = new Map();
  private workflowContexts: Map<string, WorkflowContext> = new Map();
  private agentStatuses: Map<string, 'idle' | 'working' | 'waiting' | 'completed'> = new Map();

  static getInstance(): MultiAgentCommunicationSystem {
    if (!MultiAgentCommunicationSystem.instance) {
      MultiAgentCommunicationSystem.instance = new MultiAgentCommunicationSystem();
    }
    return MultiAgentCommunicationSystem.instance;
  }

  /**
   * Send message from one agent to another
   */
  async sendAgentMessage(
    fromAgent: string,
    toAgent: string,
    message: string,
    options: {
      workflowId?: string;
      taskId?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      requiresResponse?: boolean;
    } = {}
  ): Promise<AgentResponse> {
    const conversationId = `${fromAgent}-${toAgent}-${Date.now()}`;
    
    const agentMessage: AgentMessage = {
      fromAgent,
      toAgent,
      message,
      workflowId: options.workflowId,
      taskId: options.taskId,
      timestamp: Date.now(),
      priority: options.priority || 'medium',
      requiresResponse: options.requiresResponse ?? true,
      conversationId
    };

    // Store conversation
    if (!this.activeConversations.has(conversationId)) {
      this.activeConversations.set(conversationId, []);
    }
    this.activeConversations.get(conversationId)!.push(agentMessage);

    // Update agent status
    this.agentStatuses.set(fromAgent, 'waiting');
    this.agentStatuses.set(toAgent, 'working');

    console.log(`🤖 MULTI-AGENT: ${fromAgent} → ${toAgent}: ${message.substring(0, 100)}...`);

    try {
      // Call the target agent with context
      const agentResponse = await this.callAgent(toAgent, message, {
        fromAgent,
        workflowId: options.workflowId,
        taskId: options.taskId,
        conversationId,
        priority: options.priority
      });

      // Update statuses
      this.agentStatuses.set(toAgent, 'completed');
      this.agentStatuses.set(fromAgent, 'idle');

      return agentResponse;
    } catch (error) {
      console.error(`❌ MULTI-AGENT ERROR: ${fromAgent} → ${toAgent}:`, error);
      this.agentStatuses.set(toAgent, 'idle');
      this.agentStatuses.set(fromAgent, 'idle');
      
      return {
        success: false,
        response: `Error communicating with ${toAgent}: ${error.message}`,
        agentId: toAgent,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Create workflow context for multi-agent coordination
   */
  createWorkflowContext(workflowId: string, participants: string[], sharedData: Record<string, any> = {}): WorkflowContext {
    const context: WorkflowContext = {
      workflowId,
      participants,
      currentPhase: 'initialization',
      sharedData,
      completedTasks: [],
      pendingTasks: []
    };

    this.workflowContexts.set(workflowId, context);
    console.log(`🔗 WORKFLOW CONTEXT CREATED: ${workflowId} with ${participants.length} agents`);
    
    return context;
  }

  /**
   * Coordinate multi-agent workflow execution
   */
  async executeMultiAgentWorkflow(
    workflowId: string,
    tasks: Array<{
      taskId: string;
      assignedAgent: string;
      description: string;
      dependencies?: string[];
      collaborators?: string[];
    }>
  ): Promise<{ success: boolean; results: Record<string, any> }> {
    const context = this.workflowContexts.get(workflowId);
    if (!context) {
      throw new Error(`Workflow context not found: ${workflowId}`);
    }

    console.log(`🚀 EXECUTING MULTI-AGENT WORKFLOW: ${workflowId}`);
    const results: Record<string, any> = {};

    // Execute tasks with dependency management
    for (const task of tasks) {
      // Check dependencies
      if (task.dependencies?.length) {
        const unfinishedDependencies = task.dependencies.filter(dep => !context.completedTasks.includes(dep));
        if (unfinishedDependencies.length > 0) {
          console.log(`⏳ WAITING FOR DEPENDENCIES: ${task.taskId} waiting for ${unfinishedDependencies.join(', ')}`);
          continue;
        }
      }

      // Prepare task context for agent
      const taskContext = {
        workflowId,
        taskId: task.taskId,
        description: task.description,
        sharedData: context.sharedData,
        collaborators: task.collaborators || []
      };

      // Execute task with primary agent
      const taskMessage = `
**MULTI-AGENT WORKFLOW TASK**

**Workflow ID:** ${workflowId}
**Task ID:** ${task.taskId}
**Description:** ${task.description}

**Shared Context:** ${JSON.stringify(context.sharedData, null, 2)}

**Collaborators Available:** ${task.collaborators?.join(', ') || 'None'}

Please complete this task and coordinate with collaborators if needed. Use the multi-agent communication system to collaborate.
      `;

      try {
        const taskResult = await this.callAgent(task.assignedAgent, taskMessage, {
          workflowId,
          taskId: task.taskId,
          conversationId: `workflow-${workflowId}-${task.taskId}`,
          priority: 'high'
        });

        results[task.taskId] = taskResult;
        context.completedTasks.push(task.taskId);
        
        console.log(`✅ TASK COMPLETED: ${task.taskId} by ${task.assignedAgent}`);
      } catch (error) {
        console.error(`❌ TASK FAILED: ${task.taskId}:`, error);
        results[task.taskId] = { success: false, error: error.message };
      }
    }

    return { success: true, results };
  }

  /**
   * Internal method to call agent with context
   */
  private async callAgent(
    agentId: string, 
    message: string, 
    context: {
      fromAgent?: string;
      workflowId?: string;
      taskId?: string;
      conversationId: string;
      priority?: string;
    }
  ): Promise<AgentResponse> {
    // Import the agent routes to make direct API calls
    const fetch = (await import('node-fetch')).default;
    
    const agentMessage = `
**MULTI-AGENT COORDINATION CONTEXT**
${context.fromAgent ? `From Agent: ${context.fromAgent}` : ''}
${context.workflowId ? `Workflow ID: ${context.workflowId}` : ''}
${context.taskId ? `Task ID: ${context.taskId}` : ''}
Conversation ID: ${context.conversationId}
Priority: ${context.priority || 'medium'}

**MESSAGE:**
${message}

**COLLABORATION TOOLS AVAILABLE:**
- Use MultiAgentCommunicationSystem.sendAgentMessage() to coordinate with other agents
- Access shared workflow context and data
- All agents have full codebase read/write access
- Real-time file creation and modification capabilities
    `;

    try {
      // Make internal API call to agent
      const response = await fetch('http://localhost:5000/api/admin/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          message: agentMessage,
          adminToken: 'sandra-admin-2025'
        })
      });

      const result = await response.json();
      
      return {
        success: result.success,
        response: result.message || result.response,
        agentId,
        timestamp: Date.now(),
        fileOperations: result.fileOperations || []
      };
    } catch (error) {
      throw new Error(`Failed to call agent ${agentId}: ${error.message}`);
    }
  }

  /**
   * Get conversation history between agents
   */
  getConversationHistory(conversationId: string): AgentMessage[] {
    return this.activeConversations.get(conversationId) || [];
  }

  /**
   * Get current agent statuses
   */
  getAgentStatuses(): Record<string, string> {
    const statuses: Record<string, string> = {};
    for (const [agentId, status] of this.agentStatuses.entries()) {
      statuses[agentId] = status;
    }
    return statuses;
  }

  /**
   * Get workflow context
   */
  getWorkflowContext(workflowId: string): WorkflowContext | undefined {
    return this.workflowContexts.get(workflowId);
  }

  /**
   * Update shared workflow data
   */
  updateWorkflowData(workflowId: string, data: Record<string, any>): void {
    const context = this.workflowContexts.get(workflowId);
    if (context) {
      context.sharedData = { ...context.sharedData, ...data };
      console.log(`📊 WORKFLOW DATA UPDATED: ${workflowId}`);
    }
  }
}

export { MultiAgentCommunicationSystem, AgentMessage, AgentResponse, WorkflowContext };