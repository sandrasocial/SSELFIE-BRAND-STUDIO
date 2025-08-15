/**
 * TASK EXECUTION ENGINE - Missing component for admin agent task processing
 * This engine manages the actual execution of agent tasks and coordination
 */

import { multiAgentCoordinator } from './multi-agent-coordinator';
import { AutoTaskExecutor } from '../workflows/automation/auto-task-executor';
import { claudeApiServiceSimple } from './claude-api-service-simple';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { db } from '../db';
import { agentTasks } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface TaskRequest {
  id: string;
  agentId: string;
  instruction: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  workflowId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  result: string;
  progress: number;
  completedAt?: Date;
  error?: string;
}

export class TaskExecutionEngine {
  private static instance: TaskExecutionEngine;
  private executingTasks: Map<string, TaskRequest> = new Map();
  private taskTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    console.log('🎯 TASK EXECUTION ENGINE: Initialized');
  }

  static getInstance(): TaskExecutionEngine {
    if (!TaskExecutionEngine.instance) {
      TaskExecutionEngine.instance = new TaskExecutionEngine();
    }
    return TaskExecutionEngine.instance;
  }

  /**
   * Execute a task for a specific agent
   */
  async executeTask(taskRequest: TaskRequest): Promise<TaskResult> {
    try {
      const { id: taskId, agentId, instruction, userId, priority } = taskRequest;
      
      console.log(`🚀 TASK EXECUTION: Starting task ${taskId} for ${agentId.toUpperCase()}`);

      // Mark task as executing
      this.executingTasks.set(taskId, taskRequest);
      
      // Update task status in database
      await this.updateTaskStatus(taskId, 'active', 10);

      // Create conversation ID for the agent
      const conversationId = `admin_${agentId}_${userId}`;

      // Get agent personality for context
      const agentPersonality = PersonalityManager.getNaturalPrompt(agentId);

      // Create enhanced instruction with execution context
      const enhancedInstruction = `
🎯 TASK EXECUTION REQUEST

**Agent:** ${agentId.toUpperCase()}
**Task ID:** ${taskId}
**Priority:** ${priority.toUpperCase()}

**INSTRUCTION:**
${instruction}

**EXECUTION REQUIREMENTS:**
✅ Use your specialized expertise and available tools
✅ Provide step-by-step progress updates
✅ Complete the task systematically
✅ Report final results clearly

**CONTEXT:** This is part of the admin agent system coordination. Execute this task immediately using your specialized capabilities.

BEGIN TASK EXECUTION NOW.
`;

      // Start task execution with timeout
      const timeout = this.setTaskTimeout(taskId, agentId);

      try {
        // Use Claude API to send task to agent
        const response = await claudeApiServiceSimple.sendMessage(
          enhancedInstruction,
          conversationId,
          agentId,
          false
        );

        // Update progress to 50% after initial response
        await this.updateTaskStatus(taskId, 'active', 50);

        // Trigger auto-execution for the agent
        await AutoTaskExecutor.triggerAutoExecution({
          agentId,
          conversationId,
          taskDescription: instruction,
          priority: priority as 'high' | 'medium' | 'low'
        });

        // Update progress to 80% after auto-execution trigger
        await this.updateTaskStatus(taskId, 'active', 80);

        // Coordinate through multi-agent coordinator if needed
        await multiAgentCoordinator.coordinateAgent({
          targetAgent: agentId,
          taskDescription: instruction,
          priority,
          requestingAgent: 'task_engine',
          userId,
          expectedDeliverables: [`Complete task ${taskId} successfully`]
        });

        // Clear timeout
        this.clearTaskTimeout(taskId);

        // Mark task as completed
        await this.updateTaskStatus(taskId, 'completed', 100);

        const result: TaskResult = {
          taskId,
          agentId,
          success: true,
          result: response,
          progress: 100,
          completedAt: new Date()
        };

        // Remove from executing tasks
        this.executingTasks.delete(taskId);

        console.log(`✅ TASK COMPLETED: ${taskId} for ${agentId.toUpperCase()}`);
        return result;

      } catch (executionError) {
        console.error(`❌ TASK EXECUTION FAILED: ${taskId} for ${agentId}`, executionError);

        // Clear timeout
        this.clearTaskTimeout(taskId);

        // Mark task as failed
        await this.updateTaskStatus(taskId, 'failed', 0);

        const result: TaskResult = {
          taskId,
          agentId,
          success: false,
          result: 'Task execution failed',
          progress: 0,
          error: executionError instanceof Error ? executionError.message : 'Unknown error'
        };

        // Remove from executing tasks
        this.executingTasks.delete(taskId);

        return result;
      }

    } catch (error) {
      console.error(`❌ TASK ENGINE ERROR: ${taskRequest.id}`, error);
      
      const result: TaskResult = {
        taskId: taskRequest.id,
        agentId: taskRequest.agentId,
        success: false,
        result: 'Engine error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      return result;
    }
  }

  /**
   * Update task status in database
   */
  private async updateTaskStatus(taskId: string, status: string, progress: number): Promise<void> {
    try {
      await db
        .update(agentTasks)
        .set({
          status,
          progress,
          updated_at: new Date()
        })
        .where(eq(agentTasks.task_id, taskId));

      console.log(`📊 TASK UPDATE: ${taskId} - ${status} (${progress}%)`);

    } catch (error) {
      console.error(`❌ TASK STATUS UPDATE FAILED: ${taskId}`, error);
    }
  }

  /**
   * Set task timeout
   */
  private setTaskTimeout(taskId: string, agentId: string): NodeJS.Timeout {
    const timeout = setTimeout(async () => {
      console.log(`⏰ TASK TIMEOUT: ${taskId} for ${agentId} (5 minute limit exceeded)`);
      
      // Mark task as failed due to timeout
      await this.updateTaskStatus(taskId, 'failed', 0);
      
      // Remove from executing tasks
      this.executingTasks.delete(taskId);
      
      // Clear timeout reference
      this.taskTimeouts.delete(taskId);
      
    }, 5 * 60 * 1000); // 5 minute timeout

    this.taskTimeouts.set(taskId, timeout);
    return timeout;
  }

  /**
   * Clear task timeout
   */
  private clearTaskTimeout(taskId: string): void {
    const timeout = this.taskTimeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.taskTimeouts.delete(taskId);
    }
  }

  /**
   * Get status of all executing tasks
   */
  getExecutingTasks(): TaskRequest[] {
    return Array.from(this.executingTasks.values());
  }

  /**
   * Get status of a specific task
   */
  getTaskStatus(taskId: string): TaskRequest | undefined {
    return this.executingTasks.get(taskId);
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      const task = this.executingTasks.get(taskId);
      if (!task) {
        return false;
      }

      // Clear timeout
      this.clearTaskTimeout(taskId);

      // Mark as failed
      await this.updateTaskStatus(taskId, 'failed', 0);

      // Remove from executing tasks
      this.executingTasks.delete(taskId);

      console.log(`🚫 TASK CANCELLED: ${taskId} for ${task.agentId}`);
      return true;

    } catch (error) {
      console.error(`❌ TASK CANCELLATION FAILED: ${taskId}`, error);
      return false;
    }
  }

  /**
   * Get task execution statistics
   */
  getExecutionStats(): { active: number; completed: number; failed: number } {
    return {
      active: this.executingTasks.size,
      completed: 0, // Would need database query for historical data
      failed: 0 // Would need database query for historical data
    };
  }
}

// Export singleton instance
export const taskExecutionEngine = TaskExecutionEngine.getInstance();