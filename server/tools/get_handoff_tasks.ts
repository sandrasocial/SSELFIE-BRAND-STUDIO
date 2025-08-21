/**
 * GET HANDOFF TASKS TOOL
 * Retrieve tasks that are being handed off between agents
 */

import { WorkflowPersistence } from '../workflows/active/workflow-persistence';

interface GetHandoffTasksInput {
  agent_name?: string;
  include_completed?: boolean;
}

export async function get_handoff_tasks(input: GetHandoffTasksInput = {}): Promise<string> {
  try {
    const { agent_name, include_completed = false } = input;
    
    console.log(`🤝 HANDOFF RETRIEVAL: Getting handoff tasks${agent_name ? ` for ${agent_name}` : ''}`);
    
    // Get all handoff tasks
    const handoffTasks = WorkflowPersistence.getHandoffTasks(agent_name);
    
    if (handoffTasks.length === 0) {
      return `🤝 HANDOFF STATUS: No active handoffs${agent_name ? ` for ${agent_name}` : ''}

**Current Status:** All tasks are assigned directly
**Coordination Bridge:** Connected and monitoring for new handoffs
**Action:** Use agent_handoff tool to create handoffs or coordinate_agent for direct assignments`;
    }
    
    let response = `🤝 ACTIVE HANDOFFS${agent_name ? ` FOR ${agent_name.toUpperCase()}` : ''}:

**Total Active Handoffs:** ${handoffTasks.length}
`;

    handoffTasks.forEach((handoff, index) => {
      response += `
**Handoff ${index + 1}:** ${handoff.handoffId}
- **From:** ${handoff.fromAgent}
- **To:** ${handoff.toAgent}
- **Task:** ${handoff.taskDescription}
- **Status:** ${handoff.status}
- **Created:** ${handoff.createdAt ? new Date(handoff.createdAt).toLocaleDateString() : 'Recently'}
- **Priority:** ${handoff.priority || 'Normal'}`;

      if (handoff.expectedDeliverables?.length > 0) {
        response += `\n- **Deliverables:** ${handoff.expectedDeliverables.join(', ')}`;
      }
      
      if (handoff.workflowContext) {
        response += `\n- **Context:** ${handoff.workflowContext}`;
      }
    });

    response += `

**Next Steps:**
- Complete handoff execution for pending tasks
- Update handoff status when receiving or completing work
- Coordinate with agents for smooth task transitions
- Use agent_handoff tool to create new handoffs as needed`;

    return response;
    
  } catch (error) {
    console.error('❌ HANDOFF RETRIEVAL ERROR:', error);
    return `❌ HANDOFF RETRIEVAL FAILED: Unable to get handoff tasks${input.agent_name ? ` for ${input.agent_name}` : ''}

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Verify agent name is correct
- Check if coordination bridge is operational
- Ensure WorkflowPersistence is accessible
- Contact system administrator if error persists`;
  }
}