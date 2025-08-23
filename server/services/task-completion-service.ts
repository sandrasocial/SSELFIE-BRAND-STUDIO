// Task Completion Protocol Service
// Handles automatic task completion and status management

import { db } from '../db';
import { agentTasks } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export class TaskCompletionService {
  
  /**
   * Mark a task as completed by agent
   */
  async completeTask(taskId: string, agentName: string, completionNotes?: string): Promise<boolean> {
    try {
      const result = await db
        .update(agentTasks)
        .set({
          status: 'completed',
          updatedAt: new Date(),
          completionNotes: completionNotes || 'Task completed successfully'
        })
        .where(and(
          eq(agentTasks.taskId, taskId),
          eq(agentTasks.agentName, agentName)
        ));

      console.log(`✅ TASK COMPLETED: ${taskId} by ${agentName}`);
      return true;
    } catch (error) {
      console.error(`❌ TASK COMPLETION ERROR:`, error);
      return false;
    }
  }

  /**
   * Auto-complete tasks that agents have been working on for too long
   */
  async autoCompleteStuckTasks(): Promise<number> {
    try {
      // Mark tasks as completed if they've been in_progress for over 30 minutes without updates
      const result = await db
        .update(agentTasks)
        .set({
          status: 'auto_completed',
          updatedAt: new Date(),
          completionNotes: 'Auto-completed due to inactivity timeout'
        })
        .where(and(
          eq(agentTasks.status, 'in_progress'),
          sql`updated_at < NOW() - INTERVAL '30 minutes'`
        ));

      const completedCount = result.rowCount || 0;
      console.log(`🔄 AUTO-COMPLETED: ${completedCount} stuck tasks`);
      return completedCount;
    } catch (error) {
      console.error(`❌ AUTO-COMPLETION ERROR:`, error);
      return 0;
    }
  }

  /**
   * Get completion statistics
   */
  async getCompletionStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    assigned: number;
    abandoned: number;
  }> {
    try {
      const stats = await db
        .select({
          status: agentTasks.status,
          count: sql<number>`count(*)`
        })
        .from(agentTasks)
        .groupBy(agentTasks.status);

      const result = {
        total: 0,
        completed: 0,
        inProgress: 0,
        assigned: 0,
        abandoned: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        switch (stat.status) {
          case 'completed':
          case 'auto_completed':
            result.completed += stat.count;
            break;
          case 'in_progress':
            result.inProgress += stat.count;
            break;
          case 'assigned':
            result.assigned += stat.count;
            break;
          case 'abandoned':
            result.abandoned += stat.count;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error(`❌ STATS ERROR:`, error);
      return { total: 0, completed: 0, inProgress: 0, assigned: 0, abandoned: 0 };
    }
  }

  /**
   * Clean up old completed tasks (keep for history but archive)
   */
  async archiveOldTasks(daysOld: number = 7): Promise<number> {
    try {
      const result = await db
        .update(agentTasks)
        .set({
          status: 'archived',
          updatedAt: new Date()
        })
        .where(and(
          sql`status IN ('completed', 'auto_completed', 'abandoned')`,
          sql`updated_at < NOW() - INTERVAL '${daysOld} days'`
        ));

      const archivedCount = result.rowCount || 0;
      console.log(`📦 ARCHIVED: ${archivedCount} old tasks`);
      return archivedCount;
    } catch (error) {
      console.error(`❌ ARCHIVE ERROR:`, error);
      return 0;
    }
  }
}

// Export singleton instance
export const taskCompletionService = new TaskCompletionService();