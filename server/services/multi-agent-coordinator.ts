/**
 * MULTI-AGENT COORDINATOR - Core coordination system for admin agents
 * This is the missing heart of your agent coordination system
 */

import { claudeApiServiceSimple } from './claude-api-service-simple';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { WorkflowPersistence } from '../workflows/active/workflow-persistence';
import { AutoTaskExecutor } from '../workflows/automation/auto-task-executor';
import { storage } from '../storage';
import { db } from '../db';
import { agentTasks } from '../../shared/schema';

export interface CoordinationRequest {
  targetAgent: string;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestingAgent: string;
  userId: string;
  workflowId?: string;
  dependencies?: string[];
  expectedDeliverables?: string[];
}

export interface WorkflowExecution {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  agents: string[];
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  results: Record<string, any>;
}

export class MultiAgentCoordinator {
  private static instance: MultiAgentCoordinator;
  private activeWorkflows: Map<string, WorkflowExecution> = new Map();
  private agentQueue: Map<string, CoordinationRequest[]> = new Map();

  constructor() {
    console.log('🎯 MULTI-AGENT COORDINATOR: Initialized');
  }

  static getInstance(): MultiAgentCoordinator {
    if (!MultiAgentCoordinator.instance) {
      MultiAgentCoordinator.instance = new MultiAgentCoordinator();
    }
    return MultiAgentCoordinator.instance;
  }

  /**
   * Execute a workflow with multiple agents
   */
  async executeWorkflow(workflowName: string, userId: string, agents: string[], taskDescription: string): Promise<string> {
    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🚀 WORKFLOW EXECUTION: Starting ${workflowName} with agents: ${agents.join(', ')}`);

      // Create workflow execution record
      const workflow: WorkflowExecution = {
        id: workflowId,
        name: workflowName,
        status: 'active',
        agents,
        currentStep: 0,
        totalSteps: agents.length,
        startedAt: new Date(),
        results: {}
      };

      this.activeWorkflows.set(workflowId, workflow);

      // Coordinate each agent in the workflow
      for (let i = 0; i < agents.length; i++) {
        const agentId = agents[i];
        const conversationId = `admin_${agentId}_${userId}`;
        
        console.log(`🎯 COORDINATING: ${agentId.toUpperCase()} (Step ${i + 1}/${agents.length})`);

        // Create coordination request
        const coordinationRequest: CoordinationRequest = {
          targetAgent: agentId,
          taskDescription,
          priority: 'high',
          requestingAgent: 'elena',
          userId,
          workflowId,
          expectedDeliverables: [`Complete ${agentId} specialized tasks for ${workflowName}`]
        };

        // Add to agent queue
        if (!this.agentQueue.has(agentId)) {
          this.agentQueue.set(agentId, []);
        }
        this.agentQueue.get(agentId)!.push(coordinationRequest);

        // Trigger auto-execution for the agent
        await AutoTaskExecutor.triggerAutoExecution({
          agentId,
          conversationId,
          taskDescription: `WORKFLOW COORDINATION FROM ELENA:\n\n${taskDescription}`,
          priority: 'high'
        });

        // Update workflow progress
        workflow.currentStep = i + 1;
        this.activeWorkflows.set(workflowId, workflow);
      }

      // Mark workflow as completed
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      this.activeWorkflows.set(workflowId, workflow);

      console.log(`✅ WORKFLOW COMPLETED: ${workflowName} with ${agents.length} agents`);
      return workflowId;

    } catch (error) {
      console.error(`❌ WORKFLOW EXECUTION FAILED: ${workflowName}`, error);
      throw error;
    }
  }

  /**
   * Coordinate a specific agent with a task
   */
  async coordinateAgent(request: CoordinationRequest): Promise<boolean> {
    try {
      const { targetAgent, taskDescription, priority, userId } = request;
      
      console.log(`🔄 AGENT COORDINATION: ${targetAgent.toUpperCase()} - ${priority} priority`);

      // Create conversation ID
      const conversationId = `admin_${targetAgent}_${userId}`;

      // Add task to database
      const taskId = await this.createAgentTask(request);

      // Send coordination message
      const coordinationMessage = `
🎯 COORDINATION REQUEST FROM ELENA (Master Coordinator)

**URGENT: IMMEDIATE TASK EXECUTION REQUIRED**

**Workflow Context:** ${request.workflowId ? `Part of workflow ${request.workflowId}` : 'Direct coordination request'}

**Your Task:** ${taskDescription}

**Priority Level:** ${priority.toUpperCase()}

**Expected Deliverables:**
${request.expectedDeliverables?.map(d => `• ${d}`).join('\n') || '• Complete the assigned task using your specialized expertise'}

**IMMEDIATE ACTIONS REQUIRED:**
1. ✅ Acknowledge this coordination request
2. 🔍 Begin systematic work using your available tools
3. 📊 Provide progress updates as you work
4. 🎯 Complete your specialized role in this coordination

**COORDINATION MODE:** This is Elena's direct coordination. Begin work immediately using all necessary tools to complete your assigned task.

START WORKING NOW.
`;

      // Trigger auto-execution
      await AutoTaskExecutor.triggerAutoExecution({
        agentId: targetAgent,
        conversationId,
        taskDescription: coordinationMessage,
        priority: priority as 'high' | 'medium' | 'low'
      });

      console.log(`✅ COORDINATION SENT: ${targetAgent} has been coordinated successfully`);
      return true;

    } catch (error) {
      console.error(`❌ COORDINATION FAILED for ${request.targetAgent}:`, error);
      return false;
    }
  }

  /**
   * Create agent task record in database
   */
  private async createAgentTask(request: CoordinationRequest): Promise<string> {
    try {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const taskData = {
        agentName: request.targetAgent,
        instruction: request.taskDescription,
        priority: request.priority === 'critical' ? 'high' : request.priority as 'high' | 'medium' | 'low',
        status: 'active',
        progress: 0,
        estimatedDuration: 30, // 30 minutes default
        completionCriteria: [request.expectedDeliverables?.join(', ') || 'Complete assigned task'],
        conversationContext: [`requesting_agent: ${request.requestingAgent}`, `user_id: ${request.userId}`, 'coordination_type: multi_agent_workflow']
      };

      const [insertedTask] = await db.insert(agentTasks).values([taskData]).returning({ taskId: agentTasks.taskId });
      console.log(`📝 TASK CREATED: ${insertedTask.taskId} for ${request.targetAgent}`);
      
      return insertedTask.taskId;

    } catch (error) {
      console.error('❌ TASK CREATION FAILED:', error);
      throw error;
    }
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get agent queue status
   */
  getAgentQueueStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    for (const [agentId, queue] of this.agentQueue.entries()) {
      status[agentId] = queue.length;
    }
    return status;
  }

  /**
   * Clear completed workflows (cleanup)
   */
  clearCompletedWorkflows(): void {
    for (const [id, workflow] of this.activeWorkflows.entries()) {
      if (workflow.status === 'completed' || workflow.status === 'failed') {
        this.activeWorkflows.delete(id);
      }
    }
    console.log('🧹 CLEANUP: Cleared completed workflows');
  }
}

// Export singleton instance
export const multiAgentCoordinator = MultiAgentCoordinator.getInstance();