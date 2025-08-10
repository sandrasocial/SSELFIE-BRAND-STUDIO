/**
 * AGENT COORDINATION TOOL
 * Bridges Elena to existing coordination systems
 * Avoids duplicating existing MultiAgentCoordinator and IntelligentTaskDistributor
 */

import { MultiAgentCoordinator } from '../services/multi-agent-coordinator';
import { intelligentTaskDistributor } from '../services/intelligent-task-distributor';
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';

interface CoordinationRequest {
  action: 'assign_task' | 'coordinate_workflow' | 'send_message' | 'distribute_tasks';
  agents?: string[];
  task?: string;
  message?: string;
  targetAgent?: string;
  workflowType?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface CoordinationResponse {
  success: boolean;
  result?: any;
  message: string;
  executingAgents?: string[];
}

class AgentCoordinationTool {
  private multiAgentCoordinator: MultiAgentCoordinator;

  constructor() {
    this.multiAgentCoordinator = new MultiAgentCoordinator();
  }

  /**
   * MAIN COORDINATION ENTRY POINT
   * Routes coordination requests to appropriate existing systems
   */
  async coordinate(request: CoordinationRequest): Promise<CoordinationResponse> {
    console.log(`🎯 ELENA COORDINATION: ${request.action} requested`);

    try {
      switch (request.action) {
        case 'send_message':
          return await this.sendAgentMessage(request);
        
        case 'assign_task':
          return await this.assignTask(request);
        
        case 'coordinate_workflow':
          return await this.coordinateWorkflow(request);
        
        case 'distribute_tasks':
          return await this.distributeTasks(request);
        
        default:
          return {
            success: false,
            message: `Unknown coordination action: ${request.action}`
          };
      }
    } catch (error) {
      console.error(`❌ COORDINATION ERROR: ${error}`);
      return {
        success: false,
        message: `Coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * SEND MESSAGE TO SPECIFIC AGENT
   * Uses existing claudeApiServiceSimple
   */
  private async sendAgentMessage(request: CoordinationRequest): Promise<CoordinationResponse> {
    if (!request.targetAgent || !request.message) {
      return {
        success: false,
        message: 'Target agent and message are required for send_message action'
      };
    }

    const conversationId = `elena_coordination_${Date.now()}`;
    
    try {
      const response = await claudeApiServiceSimple.sendMessage(
        request.message,
        conversationId,
        request.targetAgent,
        true
      );

      return {
        success: true,
        result: response,
        message: `Message sent to ${request.targetAgent}`,
        executingAgents: [request.targetAgent]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send message to ${request.targetAgent}: ${error}`
      };
    }
  }

  /**
   * ASSIGN SINGLE TASK TO AGENT
   * Uses existing claudeApiServiceSimple for direct assignment
   */
  private async assignTask(request: CoordinationRequest): Promise<CoordinationResponse> {
    if (!request.targetAgent || !request.task) {
      return {
        success: false,
        message: 'Target agent and task are required for assign_task action'
      };
    }

    const conversationId = `elena_task_${request.targetAgent}_${Date.now()}`;
    const taskMessage = `TASK ASSIGNMENT: ${request.task}`;

    try {
      const response = await claudeApiServiceSimple.sendMessage(
        taskMessage,
        conversationId,
        request.targetAgent,
        true
      );

      return {
        success: true,
        result: response,
        message: `Task assigned to ${request.targetAgent}: ${request.task}`,
        executingAgents: [request.targetAgent]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to assign task to ${request.targetAgent}: ${error}`
      };
    }
  }

  /**
   * COORDINATE WORKFLOW
   * Uses existing MultiAgentCoordinator for complex workflows
   */
  private async coordinateWorkflow(request: CoordinationRequest): Promise<CoordinationResponse> {
    if (!request.agents || !request.task) {
      return {
        success: false,
        message: 'Agents and task are required for coordinate_workflow action'
      };
    }

    const coordinationRequest = {
      id: `elena_workflow_${Date.now()}`,
      type: 'collaborative' as const,
      objective: request.task,
      constraints: {
        maxAgents: request.agents.length,
        timeoutMs: 300000, // 5 minutes
        qualityThreshold: 0.8
      },
      context: {
        workflowType: request.workflowType || 'general',
        priority: request.priority || 'medium',
        coordinatedBy: 'elena'
      }
    };

    try {
      const result = await this.multiAgentCoordinator.coordinateAgents(coordinationRequest);

      return {
        success: true,
        result,
        message: `Workflow coordinated with ${request.agents.join(', ')}`,
        executingAgents: request.agents
      };
    } catch (error) {
      return {
        success: false,
        message: `Workflow coordination failed: ${error}`
      };
    }
  }

  /**
   * DISTRIBUTE TASKS INTELLIGENTLY
   * Uses existing IntelligentTaskDistributor
   */
  private async distributeTasks(request: CoordinationRequest): Promise<CoordinationResponse> {
    if (!request.agents || !request.task) {
      return {
        success: false,
        message: 'Agents and task description are required for distribute_tasks action'
      };
    }

    // Convert single task into distribution format
    const tasks = [{
      id: `task_${Date.now()}`,
      description: request.task,
      assignedAgent: '', // Will be assigned by distributor
      dependencies: [],
      estimatedDuration: 30, // Default 30 minutes
      priority: request.priority || 'medium' as const
    }];

    const distributionRequest = {
      agents: request.agents,
      tasks,
      workflowType: request.workflowType || 'general',
      priority: request.priority || 'medium' as const
    };

    try {
      const result = await intelligentTaskDistributor.distributeTasks(distributionRequest);

      // Execute assignments by sending messages to assigned agents
      const executionPromises = result.assignments.map(async (assignment) => {
        const conversationId = `elena_distributed_${assignment.agentName}_${Date.now()}`;
        const taskDescriptions = assignment.tasks.map(t => t.description).join('; ');
        
        return claudeApiServiceSimple.sendMessage(
          `DISTRIBUTED TASK: ${taskDescriptions}`,
          conversationId,
          assignment.agentName,
          true
        );
      });

      await Promise.allSettled(executionPromises);

      return {
        success: true,
        result,
        message: `Tasks distributed to ${result.assignments.map(a => a.agentName).join(', ')}`,
        executingAgents: result.assignments.map(a => a.agentName)
      };
    } catch (error) {
      return {
        success: false,
        message: `Task distribution failed: ${error}`
      };
    }
  }
}

// Export singleton instance
export const agentCoordinationTool = new AgentCoordinationTool();

/**
 * TOOL FUNCTION FOR ELENA
 * This function will be exposed as a tool Elena can call
 */
export async function coordinateAgents(request: CoordinationRequest): Promise<CoordinationResponse> {
  return agentCoordinationTool.coordinate(request);
}