/**
 * GET ASSIGNED TASKS TOOL
 * Allows agents to retrieve their assigned workflow tasks
 */

import { WorkflowPersistence } from '../workflows/active/workflow-persistence';

export async function get_assigned_tasks(input: { agent_name?: string }): Promise<string> {
  try {
    // Get agent name from input or context (this would be passed by the calling agent)
    const agentName = input.agent_name;
    
    if (!agentName) {
      return "❌ Error: Agent name is required to retrieve assigned tasks.";
    }

    console.log(`📋 RETRIEVING TASKS: Getting assigned tasks for ${agentName}`);
    
    // Get all active tasks for this agent
    const tasks = WorkflowPersistence.getAgentTasks(agentName);
    
    if (tasks.length === 0) {
      return `📋 No active tasks assigned to ${agentName} at this time.

**To get new task assignments:**
- Check with ELENA (master coordinator) for new workflows
- Verify if there are any pending coordination requests
- Contact the admin team if you expect to have tasks assigned

**Available Actions:**
- Request task assignment from ELENA
- Check workflow status
- Review completed tasks`;
    }

    // Format the tasks for the agent
    let result = `📋 ACTIVE TASKS FOR ${agentName.toUpperCase()}\n\n`;
    
    tasks.forEach((task, index) => {
      result += `**Task ${index + 1}: ${task.taskId}**
- **Assigned By:** ${task.coordinatorAgent.toUpperCase()}
- **Priority:** ${task.priority.toUpperCase()}
- **Status:** ${task.status}
- **Assigned:** ${new Date(task.assignedAt).toLocaleString()}

**Description:**
${task.taskDescription}

**Workflow Context:**
${task.workflowContext}

**Expected Deliverables:**
${task.expectedDeliverables.map(d => `- ${d}`).join('\n')}

${task.workflowType ? `**Workflow Type:** ${task.workflowType}` : ''}

---

`;
    });

    result += `**Total Active Tasks:** ${tasks.length}

**Next Steps:**
1. Review the task descriptions and expected deliverables
2. Update task status to 'in_progress' when you start working
3. Use your specialized tools to complete the assigned work
4. Report back to the coordinator (${tasks[0]?.coordinatorAgent || 'ELENA'}) when tasks are complete

**Available Tools:** Use your standard agent toolset to complete these tasks systematically.`;

    console.log(`✅ TASKS RETRIEVED: Found ${tasks.length} active tasks for ${agentName}`);
    
    return result;

  } catch (error) {
    console.error('❌ TASK RETRIEVAL FAILED:', error);
    return `❌ Failed to retrieve assigned tasks: ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Verify the agent name is correct
- Check if the workflow persistence system is operational
- Ensure tasks have been properly assigned by coordinators

**Alternative Actions:**
- Contact ELENA for task coordination
- Check with system administrators
- Verify workflow system status`;
  }
}