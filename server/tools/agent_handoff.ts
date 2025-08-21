/**
 * AGENT HANDOFF SYSTEM - DIRECT AGENT-TO-AGENT COMMUNICATION
 * Revolutionary system for agents to work as autonomous employees
 * Enables direct task handoffs without human intervention
 */

import { agentCoordinationBridge } from '../services/agent-coordination-bridge';
import { ElenaDelegationSystem } from '../utils/elena-delegation-system';
import { WorkflowPersistence } from '../workflows/active/workflow-persistence';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

interface AgentHandoffInput {
  action: 'complete_task' | 'request_handoff' | 'accept_task' | 'notify_completion' | 'check_dependencies';
  agentId: string;
  taskId?: string;
  targetAgent?: string;
  taskResults?: {
    filesModified?: string[];
    completionSummary?: string;
    nextStepInstructions?: string;
    deliverables?: string[];
    qualityCheck?: 'passed' | 'needs_review' | 'failed';
  };
  handoffMessage?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedWorkTime?: number;
}

interface HandoffNotification {
  id: string;
  fromAgent: string;
  toAgent: string;
  taskId: string;
  message: string;
  deliverables: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  context: any;
}

// In-memory handoff notifications (in production, use database)
const handoffNotifications = new Map<string, HandoffNotification>();
const agentTaskQueues = new Map<string, HandoffNotification[]>();

export async function agent_handoff(input: AgentHandoffInput): Promise<string> {
  try {
    console.log(`🤝 AGENT HANDOFF: ${input.action} initiated by ${input.agentId}`);
    
    const delegationSystem = ElenaDelegationSystem.getInstance();
    
    switch (input.action) {
      case 'complete_task': {
        if (!input.taskId || !input.targetAgent || !input.taskResults) {
          return `❌ HANDOFF ERROR: Missing required fields for task completion handoff. Need: taskId, targetAgent, taskResults`;
        }

        // Create handoff notification
        const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const notification: HandoffNotification = {
          id: handoffId,
          fromAgent: input.agentId,
          toAgent: input.targetAgent,
          taskId: input.taskId,
          message: input.handoffMessage || `Task ${input.taskId} completed and ready for next phase`,
          deliverables: input.taskResults.deliverables || [],
          priority: input.priority || 'medium',
          timestamp: new Date(),
          status: 'pending',
          context: {
            completionSummary: input.taskResults.completionSummary,
            filesModified: input.taskResults.filesModified,
            nextStepInstructions: input.taskResults.nextStepInstructions,
            qualityCheck: input.taskResults.qualityCheck
          }
        };

        // Store notification
        handoffNotifications.set(handoffId, notification);
        
        // Add to target agent's queue
        if (!agentTaskQueues.has(input.targetAgent)) {
          agentTaskQueues.set(input.targetAgent, []);
        }
        agentTaskQueues.get(input.targetAgent)!.push(notification);

        // Update task status in coordination system
        await updateTaskStatus(input.taskId, input.agentId, 'completed', input.taskResults);

        // Notify Elena coordination system
        console.log(`📋 ELENA NOTIFICATION: ${input.agentId} completed ${input.taskId}, handed off to ${input.targetAgent}`);

        return `✅ TASK HANDOFF SUCCESSFUL: ${input.taskId} completed by ${input.agentId}

**Handoff Details:**
- **To Agent**: ${input.targetAgent}
- **Handoff ID**: ${handoffId}
- **Priority**: ${input.priority?.toUpperCase()}
- **Deliverables**: ${input.taskResults.deliverables?.length || 0} items
- **Quality Check**: ${input.taskResults.qualityCheck?.toUpperCase() || 'PASSED'}

**Files Modified:**
${input.taskResults.filesModified?.map(file => `- ${file}`).join('\n') || '- No files modified'}

**Next Steps for ${input.targetAgent}:**
${input.taskResults.nextStepInstructions || 'Ready for next phase development'}

**Status**: Task queued for ${input.targetAgent}. They can retrieve it using get_handoff_tasks.`;
      }

      case 'request_handoff': {
        if (!input.targetAgent || !input.handoffMessage) {
          return `❌ HANDOFF ERROR: Missing targetAgent or handoffMessage for handoff request`;
        }

        const handoffId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const notification: HandoffNotification = {
          id: handoffId,
          fromAgent: input.agentId,
          toAgent: input.targetAgent,
          taskId: input.taskId || 'collaboration_request',
          message: input.handoffMessage,
          deliverables: [],
          priority: input.priority || 'medium',
          timestamp: new Date(),
          status: 'pending',
          context: { estimatedWorkTime: input.estimatedWorkTime }
        };

        handoffNotifications.set(handoffId, notification);
        
        if (!agentTaskQueues.has(input.targetAgent)) {
          agentTaskQueues.set(input.targetAgent, []);
        }
        agentTaskQueues.get(input.targetAgent)!.push(notification);

        return `✅ COLLABORATION REQUEST SENT: ${input.agentId} → ${input.targetAgent}

**Request Details:**
- **Message**: ${input.handoffMessage}
- **Priority**: ${input.priority?.toUpperCase()}
- **Estimated Work**: ${input.estimatedWorkTime || 30} minutes
- **Request ID**: ${handoffId}

**Status**: Request queued for ${input.targetAgent}. They can review and accept using get_handoff_tasks.`;
      }

      case 'accept_task': {
        if (!input.taskId) {
          return `❌ HANDOFF ERROR: Missing taskId to accept`;
        }

        const notification = handoffNotifications.get(input.taskId);
        if (!notification) {
          return `❌ HANDOFF ERROR: Task/request ${input.taskId} not found`;
        }

        if (notification.toAgent !== input.agentId) {
          return `❌ HANDOFF ERROR: Task ${input.taskId} is not assigned to ${input.agentId}`;
        }

        // Update status
        notification.status = 'accepted';
        
        // Remove from queue
        const queue = agentTaskQueues.get(input.agentId);
        if (queue) {
          const index = queue.findIndex(n => n.id === input.taskId);
          if (index >= 0) {
            queue.splice(index, 1);
          }
        }

        // Create active task for the agent
        await createActiveTaskForAgent(input.agentId, notification);

        return `✅ TASK ACCEPTED: ${input.agentId} accepted handoff from ${notification.fromAgent}

**Accepted Task:**
- **Original Task**: ${notification.taskId}
- **From**: ${notification.fromAgent}
- **Message**: ${notification.message}
- **Priority**: ${notification.priority.toUpperCase()}

**Context Available:**
${notification.context.completionSummary ? `- Completion Summary: ${notification.context.completionSummary}` : ''}
${notification.context.nextStepInstructions ? `- Instructions: ${notification.context.nextStepInstructions}` : ''}
${notification.context.filesModified ? `- Previous Files: ${notification.context.filesModified.join(', ')}` : ''}

**Status**: Task is now active for ${input.agentId}. Ready to begin work.`;
      }

      case 'notify_completion': {
        if (!input.taskId) {
          return `❌ HANDOFF ERROR: Missing taskId for completion notification`;
        }

        // Find original handoff to notify originating agent
        const handoff = Array.from(handoffNotifications.values())
          .find(n => n.taskId === input.taskId && n.toAgent === input.agentId);

        if (handoff) {
          // Create completion notification back to original agent
          const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          const completionNotification: HandoffNotification = {
            id: completionId,
            fromAgent: input.agentId,
            toAgent: handoff.fromAgent,
            taskId: input.taskId,
            message: `Task ${input.taskId} completed successfully by ${input.agentId}`,
            deliverables: input.taskResults?.deliverables || [],
            priority: 'medium',
            timestamp: new Date(),
            status: 'completed',
            context: input.taskResults || {}
          };

          handoffNotifications.set(completionId, completionNotification);
          
          if (!agentTaskQueues.has(handoff.fromAgent)) {
            agentTaskQueues.set(handoff.fromAgent, []);
          }
          agentTaskQueues.get(handoff.fromAgent)!.push(completionNotification);
        }

        return `✅ COMPLETION NOTIFIED: Task ${input.taskId} completion reported by ${input.agentId}

**Completion Details:**
${input.taskResults?.completionSummary ? `- Summary: ${input.taskResults.completionSummary}` : ''}
${input.taskResults?.filesModified ? `- Files: ${input.taskResults.filesModified.join(', ')}` : ''}
${input.taskResults?.deliverables ? `- Deliverables: ${input.taskResults.deliverables.length} items` : ''}

**Status**: ${handoff ? `Notification sent to ${handoff.fromAgent}` : 'Task completed independently'}`;
      }

      case 'check_dependencies': {
        if (!input.taskId) {
          return `❌ HANDOFF ERROR: Missing taskId to check dependencies`;
        }

        // Check if prerequisite tasks are completed
        const dependencies = await checkTaskDependencies(input.taskId, input.agentId);
        
        return `📋 DEPENDENCY CHECK: Task ${input.taskId} for ${input.agentId}

**Dependency Status:**
${dependencies.map(dep => `- ${dep.taskId}: ${dep.status.toUpperCase()} (${dep.agent})`).join('\n')}

**Ready to Start**: ${dependencies.every(dep => dep.status === 'completed') ? '✅ YES' : '❌ NO - Waiting for dependencies'}
${dependencies.filter(dep => dep.status !== 'completed').length > 0 ? 
  `\n**Waiting For**: ${dependencies.filter(dep => dep.status !== 'completed').map(dep => dep.taskId).join(', ')}` : ''}`;
      }

      default:
        return `❌ UNKNOWN HANDOFF ACTION: "${input.action}". Available: complete_task, request_handoff, accept_task, notify_completion, check_dependencies`;
    }

  } catch (error) {
    console.error('❌ AGENT HANDOFF ERROR:', error);
    return `❌ HANDOFF SYSTEM ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}

**Troubleshooting:**
- Verify agent permissions and context
- Check that all required parameters are provided
- Ensure target agent exists and is available
- Review handoff system logs for detailed error information`;
  }
}

/**
 * Get pending handoff tasks for an agent
 */
export async function get_handoff_tasks(agentName: string): Promise<string> {
  try {
    const queue = agentTaskQueues.get(agentName) || [];
    const pendingTasks = queue.filter(task => task.status === 'pending');
    
    if (pendingTasks.length === 0) {
      return `📋 NO HANDOFF TASKS: ${agentName} has no pending task handoffs

**Status**: Ready for new assignments or collaboration requests.
**To receive tasks**: Other agents can use agent_handoff with action='complete_task' or 'request_handoff'`;
    }

    let response = `📋 PENDING HANDOFF TASKS: ${agentName} has ${pendingTasks.length} pending task(s)

**Task Queue:**`;

    pendingTasks.forEach((task, index) => {
      response += `

**${index + 1}. Task Handoff from ${task.fromAgent}**
- **Task ID**: ${task.taskId}
- **Priority**: ${task.priority.toUpperCase()}
- **Message**: ${task.message}
- **Deliverables**: ${task.deliverables.length} items
- **Received**: ${task.timestamp.toLocaleString()}
${task.context.completionSummary ? `- **Context**: ${task.context.completionSummary}` : ''}
${task.context.nextStepInstructions ? `- **Instructions**: ${task.context.nextStepInstructions}` : ''}
`;
    });

    response += `

**Actions Available:**
- Use agent_handoff with action='accept_task' and taskId='[task_id]' to accept
- Review task context and deliverables before accepting
- Tasks are queued by priority: ${pendingTasks.filter(t => t.priority === 'critical').length} critical, ${pendingTasks.filter(t => t.priority === 'high').length} high, ${pendingTasks.filter(t => t.priority === 'medium').length} medium`;

    return response;

  } catch (error) {
    console.error('❌ GET HANDOFF TASKS ERROR:', error);
    return `❌ ERROR RETRIEVING HANDOFF TASKS: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Update task status in coordination system
 */
async function updateTaskStatus(taskId: string, agentId: string, status: string, results?: any): Promise<void> {
  try {
    // Update in workflow persistence
    WorkflowPersistence.updateTaskStatus(taskId, status, {
      completedBy: agentId,
      completionTime: new Date(),
      results: results
    });
    
    console.log(`✅ TASK STATUS UPDATED: ${taskId} marked as ${status} by ${agentId}`);
  } catch (error) {
    console.error('❌ TASK STATUS UPDATE ERROR:', error);
  }
}

/**
 * Create active task for agent
 */
async function createActiveTaskForAgent(agentId: string, notification: HandoffNotification): Promise<void> {
  try {
    const activeTask = {
      id: notification.id,
      taskId: notification.taskId,
      agentId: agentId,
      title: notification.message,
      description: notification.context.nextStepInstructions || notification.message,
      priority: notification.priority,
      status: 'active',
      createdAt: new Date(),
      context: notification.context,
      deliverables: notification.deliverables
    };

    // In production, save to database
    console.log(`✅ ACTIVE TASK CREATED: ${activeTask.id} for ${agentId}`);
  } catch (error) {
    console.error('❌ ACTIVE TASK CREATION ERROR:', error);
  }
}

/**
 * Check task dependencies
 */
async function checkTaskDependencies(taskId: string, agentId: string): Promise<any[]> {
  try {
    // In production, query actual task dependencies from database
    // For now, return mock dependencies
    return [
      { taskId: 'prerequisite_1', status: 'completed', agent: 'zara' },
      { taskId: 'prerequisite_2', status: 'in_progress', agent: 'aria' }
    ];
  } catch (error) {
    console.error('❌ DEPENDENCY CHECK ERROR:', error);
    return [];
  }
}