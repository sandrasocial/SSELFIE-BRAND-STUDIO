/**
 * GET ASSIGNED TASKS TOOL
 * Allows agents to retrieve their assigned tasks from the coordination bridge
 */

import { WorkflowPersistence } from '../workflows/active/workflow-persistence';

interface GetAssignedTasksInput {
  agent_name: string;
  include_completed?: boolean;
}

export async function get_assigned_tasks(input: GetAssignedTasksInput): Promise<string> {
  try {
    const { agent_name, include_completed = false } = input;
    
    console.log(`📋 TASK RETRIEVAL: Getting assigned tasks for ${agent_name}`);
    
    // SYSTEM INTEGRATION: Check ALL task sources
    let allTasks: any[] = [];
    
    // 1. Get tasks from WorkflowPersistence
    try {
      const workflowTasks = WorkflowPersistence.getAgentTasks(agent_name);
      allTasks.push(...workflowTasks);
      console.log(`📋 WORKFLOW: Found ${workflowTasks.length} tasks from WorkflowPersistence`);
    } catch (error) {
      console.warn(`⚠️ WORKFLOW: Could not get tasks from WorkflowPersistence:`, error);
    }
    
    // 2. Get tasks from database
    try {
      const { db } = await import('../db');
      const { agentTasks } = await import('../../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const dbTasks = await db.select().from(agentTasks).where(
        and(
          eq(agentTasks.agentName, agent_name),
          eq(agentTasks.status, 'assigned')
        )
      );
      
      // Convert database tasks to unified format
      const formattedDbTasks = dbTasks.map(task => ({
        taskId: task.taskId,
        taskDescription: task.instruction,
        priority: task.priority,
        status: task.status,
        assignedAt: task.createdAt,
        coordinatorAgent: 'elena',
        expectedDeliverables: task.completionCriteria || [],
        workflowType: 'database',
        workflowContext: Array.isArray(task.conversationContext) ? task.conversationContext.join(', ') : 'Database task'
      }));
      
      allTasks.push(...formattedDbTasks);
      console.log(`📋 DATABASE: Found ${dbTasks.length} tasks from database`);
    } catch (error) {
      console.warn(`⚠️ DATABASE: Could not get tasks from database:`, error);
    }
    
    // 3. Get tasks from in-memory coordination system
    try {
      if (global.agentCoordinations) {
        const coordinationTasks = Array.from(global.agentCoordinations.values())
          .filter(coord => coord.target_agent === agent_name && coord.status === 'queued')
          .map(coord => ({
            taskId: coord.coordination_id,
            taskDescription: coord.task_description,
            priority: coord.priority,
            status: 'assigned',
            assignedAt: new Date(coord.created_at),
            coordinatorAgent: coord.coordinating_agent,
            expectedDeliverables: coord.expected_deliverables,
            workflowType: 'coordination',
            workflowContext: coord.workflow_context
          }));
        
        allTasks.push(...coordinationTasks);
        console.log(`📋 COORDINATION: Found ${coordinationTasks.length} tasks from coordination system`);
      }
    } catch (error) {
      console.warn(`⚠️ COORDINATION: Could not get tasks from coordination system:`, error);
    }
    
    // Remove duplicates by taskId
    const uniqueTasks = allTasks.filter((task, index, self) => 
      index === self.findIndex(t => t.taskId === task.taskId)
    );
    
    console.log(`📋 TOTAL: Found ${uniqueTasks.length} unique tasks for ${agent_name}`);
    
    if (uniqueTasks.length === 0) {
      return `📋 TASK STATUS: No active tasks assigned to ${agent_name}

**Current Status:** Available for new assignments
**Coordination Bridge:** Connected and monitoring for new tasks
**Action:** Use coordinate_workflow tool to create new workflows or assignments`;
    }
    
    let response = `📋 ACTIVE TASKS FOR ${agent_name.toUpperCase()}:

**Total Active Tasks:** ${uniqueTasks.length}
**Sources:** Database, WorkflowPersistence, Coordination System
`;

    uniqueTasks.forEach((task, index) => {
      response += `
**Task ${index + 1}:** ${task.taskId}
- **Description:** ${task.taskDescription}
- **Priority:** ${task.priority}
- **Status:** ${task.status}
- **Assigned:** ${task.assignedAt ? (typeof task.assignedAt === 'string' ? new Date(task.assignedAt).toLocaleDateString() : task.assignedAt.toLocaleDateString()) : 'Recently'}
- **Coordinator:** ${task.coordinatorAgent}
- **Deliverables:** ${task.expectedDeliverables.join(', ')}`;

      if (task.workflowType) {
        response += `\n- **Workflow Type:** ${task.workflowType}`;
      }
      
      if (task.workflowContext) {
        response += `\n- **Context:** ${task.workflowContext}`;
      }
    });

    response += `

**Next Steps:**
- Begin working on tasks based on priority level
- Update task status when starting: coordinate_workflow with action 'update_status'
- Complete tasks and mark as finished when done
- Coordinate with ${uniqueTasks[0]?.coordinatorAgent || 'coordinator'} for any dependencies`;

    return response;
    
  } catch (error) {
    console.error('❌ TASK RETRIEVAL ERROR:', error);
    return `❌ TASK RETRIEVAL FAILED: Unable to get assigned tasks for ${input.agent_name}

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Verify agent name is correct
- Check if coordination bridge is operational
- Ensure WorkflowPersistence is accessible
- Contact system administrator if error persists`;
  }
}