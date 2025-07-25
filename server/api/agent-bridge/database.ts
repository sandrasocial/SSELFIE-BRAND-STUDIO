// SSELFIE Studio Agent Bridge - Database Operations
// Luxury agent task storage and execution tracking

import { db } from '../../db.js';
import { agentTasks } from '../../../shared/schema.js';
import { AgentTask, ReplitExecution, ValidationResult } from './types.js';
import { eq } from 'drizzle-orm';

// Store agent task in database
export async function storeTask(task: AgentTask): Promise<string> {
  try {
    const [inserted] = await db
      .insert(agentTasks)
      .values({
        taskId: task.taskId,
        agentName: task.agentName,
        instruction: task.instruction,
        conversationContext: task.conversationContext,
        priority: task.priority,
        completionCriteria: task.completionCriteria,
        qualityGates: task.qualityGates,
        estimatedDuration: task.estimatedDuration,
        status: 'received',
        progress: 0,
        implementations: {
          filesCreated: [],
          filesModified: [],
          componentsBuilt: []
        },
        rollbackPlan: [],
        validationResults: [],
        createdAt: task.createdAt
      })
      .returning({ taskId: agentTasks.taskId });

    console.log('🎯 AGENT BRIDGE: Task stored successfully:', inserted.taskId);
    return inserted.taskId;
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Failed to store task:', error);
    throw new Error(`Failed to store agent task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update task execution status
export async function updateTaskExecution(
  taskId: string, 
  updates: Partial<ReplitExecution>
): Promise<void> {
  try {
    await db
      .update(agentTasks)
      .set({
        status: updates.status,
        progress: updates.progress,
        implementations: updates.implementations,
        rollbackPlan: updates.rollbackPlan,
        validationResults: updates.validationResults,
        completedAt: updates.completedAt
      })
      .where(eq(agentTasks.taskId, taskId));

    console.log('🔄 AGENT BRIDGE: Task execution updated:', taskId, updates.status);
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Failed to update task execution:', error);
    throw new Error(`Failed to update task execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get task execution details
export async function getTaskExecution(taskId: string): Promise<ReplitExecution | null> {
  try {
    const [task] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.taskId, taskId));

    if (!task) {
      return null;
    }

    return {
      taskId: task.taskId,
      status: task.status as ReplitExecution['status'],
      progress: task.progress || 0,
      context: {
        taskId: task.taskId,
        agentName: task.agentName,
        instruction: task.instruction,
        conversationContext: task.conversationContext as string[],
        priority: task.priority as 'high' | 'medium' | 'low',
        completionCriteria: task.completionCriteria as string[],
        qualityGates: task.qualityGates as string[],
        estimatedDuration: task.estimatedDuration,
        createdAt: task.createdAt!
      },
      implementations: task.implementations as ReplitExecution['implementations'],
      rollbackPlan: task.rollbackPlan as string[],
      validationResults: task.validationResults as ValidationResult[],
      completedAt: task.completedAt || undefined
    };
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Failed to get task execution:', error);
    throw new Error(`Failed to get task execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get all active tasks for Elena monitoring
export async function getActiveTasks(): Promise<ReplitExecution[]> {
  try {
    const tasks = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.status, 'executing'));

    return tasks.map(task => ({
      taskId: task.taskId,
      status: task.status as ReplitExecution['status'],
      progress: task.progress || 0,
      context: {
        taskId: task.taskId,
        agentName: task.agentName,
        instruction: task.instruction,
        conversationContext: task.conversationContext as string[],
        priority: task.priority as 'high' | 'medium' | 'low',
        completionCriteria: task.completionCriteria as string[],
        qualityGates: task.qualityGates as string[],
        estimatedDuration: task.estimatedDuration,
        createdAt: task.createdAt!
      },
      implementations: task.implementations as ReplitExecution['implementations'],
      rollbackPlan: task.rollbackPlan as string[],
      validationResults: task.validationResults as ValidationResult[],
      completedAt: task.completedAt || undefined
    }));
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Failed to get active tasks:', error);
    return [];
  }
}