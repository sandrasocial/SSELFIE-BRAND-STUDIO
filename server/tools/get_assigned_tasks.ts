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
    
    // Get active tasks for the agent
    const activeTasks = WorkflowPersistence.getAgentTasks(agent_name);
    
    if (activeTasks.length === 0) {
      return `📋 TASK STATUS: No active tasks assigned to ${agent_name}

**Current Status:** Available for new assignments
**Coordination Bridge:** Connected and monitoring for new tasks
**Action:** Use coordinate_workflow tool to create new workflows or assignments`;
    }
    
    let response = `📋 ACTIVE TASKS FOR ${agent_name.toUpperCase()}:

**Total Active Tasks:** ${activeTasks.length}
`;

    activeTasks.forEach((task, index) => {
      response += `
**Task ${index + 1}:** ${task.taskId}
- **Description:** ${task.taskDescription}
- **Priority:** ${task.priority}
- **Status:** ${task.status}
- **Assigned:** ${task.assignedAt?.toLocaleDateString()}
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
- Coordinate with ${activeTasks[0]?.coordinatorAgent || 'coordinator'} for any dependencies`;

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