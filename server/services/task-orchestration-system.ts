/**
 * TASK ORCHESTRATION SYSTEM
 * Central coordination system for effort-based agent execution
 * Manages task distribution, validation, and checkpoint creation
 */

import { effortBasedExecutor, type TaskExecutionRequest, type TaskExecutionResult } from './effort-based-agent-executor';
import { smartContextManager } from './smart-context-manager';
import { directWorkspaceAccess } from './direct-workspace-access';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';

export interface OrchestrationRequest {
  userId: string;
  workflow: {
    title: string;
    description: string;
    tasks: {
      agentName: string;
      task: string;
      priority: 'low' | 'medium' | 'high';
      dependencies?: string[];
    }[];
  };
  maxTotalEffort?: number;
}

export interface OrchestrationResult {
  success: boolean;
  workflowId: string;
  totalCost: number;
  totalEffort: number;
  completedTasks: number;
  taskResults: TaskExecutionResult[];
  checkpointIds: string[];
  error?: string;
}

export interface TaskQueueItem {
  id: string;
  agentName: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'executing' | 'completed' | 'failed';
  dependencies: string[];
  result?: TaskExecutionResult;
  startTime?: Date;
  endTime?: Date;
}

export class TaskOrchestrationSystem {
  private activeWorkflows = new Map<string, TaskQueueItem[]>();
  private workflowResults = new Map<string, OrchestrationResult>();

  /**
   * Execute a complete workflow with multiple agents
   * Handles task dependencies and optimal execution order
   */
  async executeWorkflow(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎭 WORKFLOW ORCHESTRATION: Starting workflow ${workflowId} with ${request.workflow.tasks.length} tasks`);

    try {
      // Initialize task queue
      const taskQueue = this.initializeTaskQueue(request.workflow.tasks, workflowId);
      this.activeWorkflows.set(workflowId, taskQueue);

      // Execute tasks with dependency management
      const taskResults: TaskExecutionResult[] = [];
      let totalCost = 0;
      let totalEffort = 0;
      let completedTasks = 0;
      const checkpointIds: string[] = [];

      // Process tasks in optimal order
      const executionOrder = this.calculateOptimalExecutionOrder(taskQueue);

      for (const taskId of executionOrder) {
        const task = taskQueue.find(t => t.id === taskId);
        if (!task) continue;

        // Check if dependencies are satisfied
        if (!this.areDependenciesSatisfied(task, taskQueue)) {
          console.log(`⏳ DEPENDENCY WAIT: Task ${task.id} waiting for dependencies`);
          continue;
        }

        // Execute task
        console.log(`🚀 TASK EXECUTION: Starting ${task.agentName} - ${task.task.substring(0, 50)}...`);
        task.status = 'executing';
        task.startTime = new Date();

        const taskRequest: TaskExecutionRequest = {
          agentName: task.agentName,
          userId: request.userId,
          task: task.task,
          priority: task.priority,
          maxEffort: Math.min(10, Math.floor((request.maxTotalEffort || 50) / request.workflow.tasks.length))
        };

        try {
          const result = await effortBasedExecutor.executeTask(taskRequest);
          
          task.result = result;
          task.status = result.taskCompleted ? 'completed' : 'failed';
          task.endTime = new Date();

          taskResults.push(result);
          totalCost += result.costEstimate;
          totalEffort += result.effortUsed;

          if (result.taskCompleted) {
            completedTasks++;
            if (result.checkpointId) {
              checkpointIds.push(result.checkpointId);
            }
          }

          console.log(`✅ TASK COMPLETED: ${task.agentName} - Cost: $${result.costEstimate.toFixed(2)}, Completed: ${result.taskCompleted}`);

        } catch (error) {
          console.error(`❌ TASK FAILED: ${task.agentName}:`, error);
          task.status = 'failed';
          task.endTime = new Date();
          task.result = {
            success: false,
            taskCompleted: false,
            result: '',
            effortUsed: 0,
            costEstimate: 0,
            apiCallsUsed: 0,
            toolsUsed: [],
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          taskResults.push(task.result);
        }
      }

      // Create workflow checkpoint
      const workflowCheckpointId = await this.createWorkflowCheckpoint(
        workflowId,
        request.workflow,
        taskResults,
        totalCost,
        totalEffort
      );

      if (workflowCheckpointId) {
        checkpointIds.push(workflowCheckpointId);
      }

      const result: OrchestrationResult = {
        success: completedTasks > 0,
        workflowId,
        totalCost,
        totalEffort,
        completedTasks,
        taskResults,
        checkpointIds
      };

      this.workflowResults.set(workflowId, result);

      console.log(`🎭 WORKFLOW COMPLETED: ${workflowId}`);
      console.log(`💰 Total Cost: $${totalCost.toFixed(2)} (${completedTasks}/${request.workflow.tasks.length} tasks completed)`);

      return result;

    } catch (error) {
      console.error(`❌ WORKFLOW ORCHESTRATION ERROR: ${workflowId}:`, error);
      
      return {
        success: false,
        workflowId,
        totalCost: 0,
        totalEffort: 0,
        completedTasks: 0,
        taskResults: [],
        checkpointIds: [],
        error: error instanceof Error ? error.message : 'Unknown workflow error'
      };
    } finally {
      // Cleanup
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    const activeWorkflow = this.activeWorkflows.get(workflowId);
    const completedWorkflow = this.workflowResults.get(workflowId);

    if (activeWorkflow) {
      return {
        status: 'active',
        workflowId,
        tasks: activeWorkflow.map(task => ({
          id: task.id,
          agentName: task.agentName,
          status: task.status,
          startTime: task.startTime,
          endTime: task.endTime,
          cost: task.result?.costEstimate || 0
        })),
        progress: {
          total: activeWorkflow.length,
          completed: activeWorkflow.filter(t => t.status === 'completed').length,
          executing: activeWorkflow.filter(t => t.status === 'executing').length,
          failed: activeWorkflow.filter(t => t.status === 'failed').length
        }
      };
    }

    if (completedWorkflow) {
      return {
        status: 'completed',
        workflowId,
        result: completedWorkflow
      };
    }

    return {
      status: 'not_found',
      workflowId
    };
  }

  /**
   * Cancel running workflow
   */
  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const activeWorkflow = this.activeWorkflows.get(workflowId);
    
    if (activeWorkflow) {
      // Mark all non-completed tasks as cancelled
      activeWorkflow.forEach(task => {
        if (task.status === 'queued' || task.status === 'executing') {
          task.status = 'failed';
          task.endTime = new Date();
        }
      });

      this.activeWorkflows.delete(workflowId);
      
      console.log(`🛑 WORKFLOW CANCELLED: ${workflowId}`);
      return true;
    }

    return false;
  }

  /**
   * Initialize task queue with dependencies
   */
  private initializeTaskQueue(tasks: any[], workflowId: string): TaskQueueItem[] {
    return tasks.map((task, index) => ({
      id: `${workflowId}_task_${index}`,
      agentName: task.agentName,
      task: task.task,
      priority: task.priority || 'medium',
      status: 'queued' as const,
      dependencies: task.dependencies || []
    }));
  }

  /**
   * Calculate optimal task execution order
   */
  private calculateOptimalExecutionOrder(taskQueue: TaskQueueItem[]): string[] {
    const order: string[] = [];
    const processed = new Set<string>();

    // Topological sort for dependency resolution
    const visit = (taskId: string) => {
      if (processed.has(taskId)) return;

      const task = taskQueue.find(t => t.id === taskId);
      if (!task) return;

      // Visit dependencies first
      task.dependencies.forEach(depId => {
        if (!processed.has(depId)) {
          visit(depId);
        }
      });

      processed.add(taskId);
      order.push(taskId);
    };

    // Start with tasks that have no dependencies
    const independentTasks = taskQueue.filter(t => t.dependencies.length === 0);
    
    // Process all tasks
    taskQueue.forEach(task => visit(task.id));

    console.log(`📋 EXECUTION ORDER: ${order.length} tasks planned`);
    
    return order;
  }

  /**
   * Check if task dependencies are satisfied
   */
  private areDependenciesSatisfied(task: TaskQueueItem, taskQueue: TaskQueueItem[]): boolean {
    return task.dependencies.every(depId => {
      const depTask = taskQueue.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  }

  /**
   * Create workflow checkpoint for billing
   */
  private async createWorkflowCheckpoint(
    workflowId: string,
    workflow: any,
    taskResults: TaskExecutionResult[],
    totalCost: number,
    totalEffort: number
  ): Promise<string | null> {
    try {
      const checkpointId = `workflow_checkpoint_${workflowId}`;
      
      const checkpoint = {
        id: checkpointId,
        workflowId,
        workflow,
        taskResults: taskResults.map(r => ({
          agentName: r.result.substring(0, 100), // Truncate for storage
          completed: r.taskCompleted,
          cost: r.costEstimate,
          effort: r.effortUsed,
          toolsUsed: r.toolsUsed
        })),
        totalCost,
        totalEffort,
        completedTasks: taskResults.filter(r => r.taskCompleted).length,
        timestamp: new Date().toISOString()
      };

      // TODO: Save to database
      console.log(`📸 WORKFLOW CHECKPOINT: ${checkpointId} created - Cost: $${totalCost.toFixed(2)}`);
      
      return checkpointId;

    } catch (error) {
      console.error('❌ WORKFLOW CHECKPOINT ERROR:', error);
      return null;
    }
  }

  /**
   * Get orchestration analytics
   */
  async getOrchestrationAnalytics(): Promise<any> {
    const completedWorkflows = Array.from(this.workflowResults.values());
    
    return {
      totalWorkflows: completedWorkflows.length,
      totalCost: completedWorkflows.reduce((sum, w) => sum + w.totalCost, 0),
      totalEffort: completedWorkflows.reduce((sum, w) => sum + w.totalEffort, 0),
      averageCost: completedWorkflows.length > 0 
        ? completedWorkflows.reduce((sum, w) => sum + w.totalCost, 0) / completedWorkflows.length 
        : 0,
      successRate: completedWorkflows.length > 0
        ? (completedWorkflows.filter(w => w.success).length / completedWorkflows.length) * 100
        : 0,
      taskCompletionRate: completedWorkflows.length > 0
        ? (completedWorkflows.reduce((sum, w) => sum + w.completedTasks, 0) / 
           completedWorkflows.reduce((sum, w) => sum + w.taskResults.length, 0)) * 100
        : 0,
      mostUsedAgents: this.getMostUsedAgents(completedWorkflows),
      costSavingsAnalysis: this.calculateCostSavings(completedWorkflows)
    };
  }

  /**
   * Get most frequently used agents
   */
  private getMostUsedAgents(workflows: OrchestrationResult[]): any[] {
    const agentUsage = new Map<string, { count: number; totalCost: number }>();

    workflows.forEach(workflow => {
      workflow.taskResults.forEach(result => {
        // Extract agent name from result (would need to be stored properly)
        const agentName = 'unknown'; // TODO: Fix this by storing agent name in result
        const current = agentUsage.get(agentName) || { count: 0, totalCost: 0 };
        agentUsage.set(agentName, {
          count: current.count + 1,
          totalCost: current.totalCost + result.costEstimate
        });
      });
    });

    return Array.from(agentUsage.entries())
      .map(([agent, stats]) => ({ agent, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calculate cost savings vs traditional approach
   */
  private calculateCostSavings(workflows: OrchestrationResult[]): any {
    const totalEffortCost = workflows.reduce((sum, w) => sum + w.totalCost, 0);
    const totalApiCalls = workflows.reduce((sum, w) => 
      sum + w.taskResults.reduce((taskSum, r) => taskSum + r.apiCallsUsed, 0), 0
    );
    const traditionalCost = totalApiCalls * 25; // Estimated traditional cost per API call

    return {
      effortBasedCost: totalEffortCost,
      traditionalCost,
      totalSavings: traditionalCost - totalEffortCost,
      savingsPercentage: traditionalCost > 0 ? Math.round(((traditionalCost - totalEffortCost) / traditionalCost) * 100) : 0
    };
  }
}

export const taskOrchestrationSystem = new TaskOrchestrationSystem();