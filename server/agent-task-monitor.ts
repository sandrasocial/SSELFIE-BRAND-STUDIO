/**
 * Agent Task Monitor - Automatically executes assigned agent tasks
 * Similar to training-completion-monitor.ts and generation-completion-monitor.ts
 * Checks database every 60 seconds for assigned tasks and triggers agent execution
 */

import { db } from './db';
import { sql, eq } from 'drizzle-orm';

class AgentTaskMonitor {
  private static instance: AgentTaskMonitor;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AgentTaskMonitor {
    if (!AgentTaskMonitor.instance) {
      AgentTaskMonitor.instance = new AgentTaskMonitor();
    }
    return AgentTaskMonitor.instance;
  }

  /**
   * Check all assigned agent tasks and trigger execution
   */
  async checkAndExecuteAssignedTasks(): Promise<void> {
    try {
      console.log('🤖 AGENT TASK MONITOR: Checking for assigned tasks...');

      // Get all tasks with status='assigned' from last 24 hours  
      const result = await db.execute(sql`
        SELECT task_id, agent_name, instruction, priority, created_at
        FROM agent_tasks 
        WHERE status = 'assigned' 
        AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY priority DESC, created_at ASC
        LIMIT 10
      `);
      const assignedTasks = result.rows;

      if (assignedTasks.length === 0) {
        console.log('✅ AGENT TASK MONITOR: No assigned tasks found');
        return;
      }

      console.log(`📋 AGENT TASK MONITOR: Found ${assignedTasks.length} assigned tasks to execute`);

      // Execute tasks for each agent
      for (const task of assignedTasks) {
        await this.triggerAgentExecution(task);
        
        // Mark task as in_progress
        await db.execute(sql`
          UPDATE agent_tasks 
          SET status = 'in_progress', updated_at = NOW() 
          WHERE task_id = ${task.task_id}
        `);

        // Small delay between agent triggers
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('❌ AGENT TASK MONITOR: Error checking assigned tasks:', error);
    }
  }

  /**
   * Trigger agent to execute their assigned task
   */
  private async triggerAgentExecution(task: any): Promise<void> {
    try {
      console.log(`🚀 AGENT TASK MONITOR: Triggering ${task.agent_name} for task: ${task.task_id}`);

      const autoExecutionMessage = `
⚡ AUTOMATIC TASK EXECUTION ⚡

You have an assigned ${task.priority.toUpperCase()} priority task. Start working immediately.

**Your Task:** ${task.instruction}

**IMMEDIATE ACTIONS:**
1. ✅ Use your tools to begin work RIGHT NOW
2. 🔍 Execute your task systematically 
3. 📊 Complete all deliverables
4. 🎯 Focus on your specialized expertise

**AUTO-EXECUTION MODE:** This is automatic. Begin work immediately using all necessary tools.

START WORKING NOW.
`;

      // Trigger agent via consulting API
      const response = await fetch('http://0.0.0.0:5000/api/consulting-agents/admin/consulting-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({
          agentId: task.agent_name,
          message: autoExecutionMessage,
          conversationId: `auto_exec_${task.task_id}`,
          adminToken: 'sandra-admin-2025'
        })
      });

      if (response.ok) {
        console.log(`✅ AGENT TASK MONITOR: Successfully triggered ${task.agent_name}`);
      } else {
        console.error(`❌ AGENT TASK MONITOR: Failed to trigger ${task.agent_name}: ${response.status}`);
      }

    } catch (error) {
      console.error(`❌ AGENT TASK MONITOR: Error triggering ${task.agent_name}:`, error);
    }
  }

  /**
   * Start automatic monitoring (every 60 seconds)
   */
  startMonitoring(): void {
    if (this.intervalId) {
      console.log('⚠️ AGENT TASK MONITOR: Already running');
      return;
    }

    console.log('🚀 AGENT TASK MONITOR: Starting automatic agent task monitoring...');
    
    // Check immediately on start
    this.checkAndExecuteAssignedTasks();
    
    // Then check every 60 seconds
    this.intervalId = setInterval(() => {
      this.checkAndExecuteAssignedTasks();
    }, 60 * 1000); // 60 seconds
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 AGENT TASK MONITOR: Stopped automatic monitoring');
    }
  }
}

// Export singleton instance
export const agentTaskMonitor = AgentTaskMonitor.getInstance();

// Auto-start monitoring when imported
agentTaskMonitor.startMonitoring();