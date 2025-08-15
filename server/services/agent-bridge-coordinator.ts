/**
 * AGENT BRIDGE COORDINATOR - Integration layer for bridge system
 * This connects the bridge UI to the backend coordination systems
 */

import { multiAgentCoordinator } from './multi-agent-coordinator';
import { taskExecutionEngine } from './task-execution-engine';
import { workflowExecutionSystem } from './workflow-execution-system';
import { PersonalityManager } from '../agents/personalities/personality-config';

export interface BridgeRequest {
  type: 'task' | 'workflow' | 'coordination';
  agentId: string;
  instruction: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  workflowContext?: string;
  expectedDeliverables?: string[];
}

export interface BridgeResponse {
  success: boolean;
  requestId: string;
  agentId: string;
  status: 'submitted' | 'executing' | 'completed' | 'failed';
  message: string;
  result?: string;
  progress?: number;
  timestamp: string;
}

export class AgentBridgeCoordinator {
  private static instance: AgentBridgeCoordinator;
  private requestHistory: Map<string, BridgeRequest> = new Map();
  private responseHistory: Map<string, BridgeResponse> = new Map();

  constructor() {
    console.log('🌉 AGENT BRIDGE COORDINATOR: Initialized');
  }

  static getInstance(): AgentBridgeCoordinator {
    if (!AgentBridgeCoordinator.instance) {
      AgentBridgeCoordinator.instance = new AgentBridgeCoordinator();
    }
    return AgentBridgeCoordinator.instance;
  }

  /**
   * Process a bridge request through the appropriate coordination system
   */
  async processBridgeRequest(request: BridgeRequest): Promise<BridgeResponse> {
    try {
      const requestId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🌉 BRIDGE REQUEST: ${request.type} for ${request.agentId.toUpperCase()}`);
      
      // Store request in history
      this.requestHistory.set(requestId, request);

      let response: BridgeResponse;

      switch (request.type) {
        case 'task':
          response = await this.processTaskRequest(requestId, request);
          break;
        case 'workflow':
          response = await this.processWorkflowRequest(requestId, request);
          break;
        case 'coordination':
          response = await this.processCoordinationRequest(requestId, request);
          break;
        default:
          response = {
            success: false,
            requestId,
            agentId: request.agentId,
            status: 'failed',
            message: 'Unknown request type',
            timestamp: new Date().toISOString()
          };
      }

      // Store response in history
      this.responseHistory.set(requestId, response);

      console.log(`✅ BRIDGE RESPONSE: ${response.status} for ${request.agentId}`);
      return response;

    } catch (error) {
      console.error('❌ BRIDGE REQUEST FAILED:', error);
      
      const errorResponse: BridgeResponse = {
        success: false,
        requestId: 'error',
        agentId: request.agentId,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      return errorResponse;
    }
  }

  /**
   * Process a task request
   */
  private async processTaskRequest(requestId: string, request: BridgeRequest): Promise<BridgeResponse> {
    try {
      console.log(`🎯 BRIDGE TASK: Processing for ${request.agentId}`);

      // Create task request
      const taskRequest = {
        id: requestId,
        agentId: request.agentId,
        instruction: request.instruction,
        priority: request.priority,
        userId: request.userId,
        status: 'pending' as const,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Execute through task execution engine
      const taskResult = await taskExecutionEngine.executeTask(taskRequest);

      return {
        success: taskResult.success,
        requestId,
        agentId: request.agentId,
        status: taskResult.success ? 'completed' : 'failed',
        message: taskResult.success ? 'Task completed successfully' : 'Task execution failed',
        result: taskResult.result,
        progress: taskResult.progress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ BRIDGE TASK FAILED: ${request.agentId}`, error);
      
      return {
        success: false,
        requestId,
        agentId: request.agentId,
        status: 'failed',
        message: 'Task processing failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process a workflow request
   */
  private async processWorkflowRequest(requestId: string, request: BridgeRequest): Promise<BridgeResponse> {
    try {
      console.log(`🔄 BRIDGE WORKFLOW: Processing for ${request.agentId}`);

      // Create workflow steps (for single agent workflow)
      const workflowSteps = [{
        id: 'step_1',
        agentId: request.agentId,
        instruction: request.instruction,
        priority: request.priority,
        estimatedDuration: 15 // 15 minutes estimate
      }];

      // Create workflow
      const workflow = workflowExecutionSystem.createWorkflow(
        `Bridge Workflow - ${request.agentId}`,
        `Workflow execution through bridge system: ${request.instruction}`,
        'elena', // Elena coordinates workflows
        request.userId,
        workflowSteps
      );

      // Execute workflow
      const success = await workflowExecutionSystem.executeWorkflow(workflow);

      return {
        success,
        requestId,
        agentId: request.agentId,
        status: success ? 'completed' : 'failed',
        message: success ? 'Workflow completed successfully' : 'Workflow execution failed',
        result: success ? 'Workflow completed' : 'Workflow failed',
        progress: success ? 100 : 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ BRIDGE WORKFLOW FAILED: ${request.agentId}`, error);
      
      return {
        success: false,
        requestId,
        agentId: request.agentId,
        status: 'failed',
        message: 'Workflow processing failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process a coordination request
   */
  private async processCoordinationRequest(requestId: string, request: BridgeRequest): Promise<BridgeResponse> {
    try {
      console.log(`🎯 BRIDGE COORDINATION: Processing for ${request.agentId}`);

      // Create coordination request
      const coordinationRequest = {
        targetAgent: request.agentId,
        taskDescription: request.instruction,
        priority: request.priority,
        requestingAgent: 'bridge_system',
        userId: request.userId,
        expectedDeliverables: request.expectedDeliverables || [`Complete ${request.agentId} task from bridge`]
      };

      // Execute through multi-agent coordinator
      const success = await multiAgentCoordinator.coordinateAgent(coordinationRequest);

      return {
        success,
        requestId,
        agentId: request.agentId,
        status: success ? 'submitted' : 'failed',
        message: success ? 'Coordination request submitted successfully' : 'Coordination failed',
        result: success ? 'Agent coordinated' : 'Coordination failed',
        progress: success ? 50 : 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ BRIDGE COORDINATION FAILED: ${request.agentId}`, error);
      
      return {
        success: false,
        requestId,
        agentId: request.agentId,
        status: 'failed',
        message: 'Coordination processing failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available agents for bridge system
   */
  getAvailableAgents(): Array<{ id: string; name: string; role: string; status: string }> {
    const agents = [
      { id: 'elena', name: 'Elena', role: 'Master Coordinator', status: 'active' },
      { id: 'zara', name: 'Zara', role: 'Technical Architect', status: 'active' },
      { id: 'aria', name: 'Aria', role: 'UI/UX Designer', status: 'active' },
      { id: 'olga', name: 'Olga', role: 'System Architect', status: 'active' },
      { id: 'victoria', name: 'Victoria', role: 'Business Strategist', status: 'active' },
      { id: 'maya', name: 'Maya', role: 'AI Specialist', status: 'active' },
      { id: 'quinn', name: 'Quinn', role: 'Data Analyst', status: 'active' },
      { id: 'rachel', name: 'Rachel', role: 'Content Strategist', status: 'active' },
      { id: 'diana', name: 'Diana', role: 'Marketing Expert', status: 'active' },
      { id: 'sophia', name: 'Sophia', role: 'Product Manager', status: 'active' },
      { id: 'martha', name: 'Martha', role: 'Operations Manager', status: 'active' },
      { id: 'ava', name: 'Ava', role: 'Quality Assurance', status: 'active' },
      { id: 'wilma', name: 'Wilma', role: 'Security Specialist', status: 'active' },
      { id: 'flux', name: 'Flux', role: 'DevOps Engineer', status: 'active' }
    ];

    // Check queue status from coordinator
    const queueStatus = multiAgentCoordinator.getAgentQueueStatus();
    
    return agents.map(agent => ({
      ...agent,
      status: queueStatus[agent.id] > 0 ? 'working' : 'idle'
    }));
  }

  /**
   * Get request history
   */
  getRequestHistory(limit: number = 10): BridgeRequest[] {
    const requests = Array.from(this.requestHistory.values());
    return requests.slice(-limit);
  }

  /**
   * Get response history
   */
  getResponseHistory(limit: number = 10): BridgeResponse[] {
    const responses = Array.from(this.responseHistory.values());
    return responses.slice(-limit);
  }

  /**
   * Get bridge system status
   */
  getBridgeStatus(): {
    coordinatorActive: boolean;
    taskEngineActive: boolean;
    workflowSystemActive: boolean;
    activeRequests: number;
    totalRequests: number;
  } {
    return {
      coordinatorActive: true,
      taskEngineActive: true,
      workflowSystemActive: true,
      activeRequests: this.requestHistory.size,
      totalRequests: this.requestHistory.size
    };
  }
}

// Export singleton instance
export const agentBridgeCoordinator = AgentBridgeCoordinator.getInstance();