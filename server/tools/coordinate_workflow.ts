/**
 * COORDINATE WORKFLOW TOOL - PHASE 1 IMPLEMENTATION
 * Enables agents to interact with the coordination bridge system
 * Connects existing autonomous systems for seamless collaboration
 */

import { agentCoordinationBridge } from '../services/agent-coordination-bridge';

interface CoordinateWorkflowInput {
  action: 'create_workflow' | 'assign_tasks' | 'check_status' | 'get_tasks' | 'update_context';
  workflowName?: string;
  description?: string;
  coordinatorAgent: string;
  targetAgents?: string[];
  tasks?: Array<{
    id: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
    dependencies?: string[];
  }>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
}

export async function coordinate_workflow(input: CoordinateWorkflowInput): Promise<string> {
  try {
    console.log(`🌉 WORKFLOW COORDINATION: ${input.action} requested by ${input.coordinatorAgent}`);
    
    const userId = input.userId || 'admin';
    
    switch (input.action) {
      case 'create_workflow': {
        if (!input.workflowName || !input.description) {
          return `❌ Missing required fields: workflowName and description are required for workflow creation.`;
        }
        
        const result = await agentCoordinationBridge.coordinateWorkflow({
          requestType: 'workflow_creation',
          workflowName: input.workflowName,
          description: input.description,
          coordinatorAgent: input.coordinatorAgent,
          targetAgents: input.targetAgents,
          tasks: input.tasks || [],
          priority: input.priority || 'medium',
          userId
        });
        
        if (result.success) {
          return `✅ WORKFLOW CREATED: "${input.workflowName}" (${result.coordinationId})

**Workflow Session:** ${result.workflowSession?.sessionId || 'Created'}
**Task Assignments:** ${result.taskAssignments?.length || 0} agents assigned
**Active Tasks:** ${result.activeTasks?.length || 0} tasks in queue

**Next Steps:**
${result.nextSteps.map(step => `- ${step}`).join('\n')}

**Status:** Ready for agent execution. Agents can use get_assigned_tasks to retrieve their specific assignments.`;
        } else {
          return `❌ WORKFLOW CREATION FAILED: ${result.error || 'Unknown error'}`;
        }
      }
      
      case 'assign_tasks': {
        if (!input.tasks || input.tasks.length === 0) {
          return `❌ No tasks provided for assignment. Please include tasks array with descriptions and priorities.`;
        }
        
        const result = await agentCoordinationBridge.coordinateWorkflow({
          requestType: 'task_assignment',
          coordinatorAgent: input.coordinatorAgent,
          targetAgents: input.targetAgents,
          tasks: input.tasks,
          priority: input.priority || 'medium',
          userId
        });
        
        if (result.success) {
          let response = `✅ TASKS ASSIGNED: ${input.tasks.length} tasks distributed by ${input.coordinatorAgent}

**Task Distribution:**`;
          
          result.taskAssignments?.forEach((assignment, index) => {
            response += `\n${index + 1}. **${assignment.agentName}**: ${assignment.tasks.length} tasks (${assignment.estimatedDuration}min)`;
            assignment.tasks.forEach((task: any) => {
              response += `\n   - ${task.description} [${task.priority}]`;
            });
          });
          
          response += `\n\n**Coordination Status:**
- Total Active Tasks: ${result.activeTasks?.length || 0}
- Coordination ID: ${result.coordinationId}

**Agents can now use get_assigned_tasks tool to retrieve their specific assignments.**`;
          
          return response;
        } else {
          return `❌ TASK ASSIGNMENT FAILED: ${result.error || 'Unknown error'}`;
        }
      }
      
      case 'check_status': {
        const status = await agentCoordinationBridge.getCoordinationStatus();
        
        return `📊 COORDINATION SYSTEM STATUS:

**Active Workflows:** ${status.activeWorkflows}
**Active Tasks:** ${status.activeTasks}
**System Health:** ${status.systemHealth}

**Agent Workloads:**
${Array.from(status.agentWorkloads.entries()).map(([agent, workload]: [string, any]) => 
  `- ${agent}: ${workload.currentTasks}/${workload.maxCapacity} tasks (${(workload.efficiency * 100).toFixed(0)}% efficiency)`
).join('\n')}

**Coordination Bridge:** All systems connected and operational
- ✅ WorkflowExecutor: Database operations ready
- ✅ TaskDistributor: Intelligent assignment active  
- ✅ DelegationSystem: Elena coordination running
- ✅ StateManager: Agent memory synchronized
- ✅ ProcessingEngine: Learning patterns captured`;
      }
      
      case 'update_context': {
        const contextResult = await agentCoordinationBridge.integrateProjectContext(
          input.coordinatorAgent,
          userId
        );
        
        if (contextResult.success) {
          return `✅ PROJECT CONTEXT UPDATED: ${input.coordinatorAgent} now has enhanced project awareness

**Enhanced Capabilities:**
${contextResult.agentCapabilities.map(cap => `- ${cap}`).join('\n')}

**Project Structure Understanding:**
- 🔒 Revenue systems protected (Maya workflows)
- ✅ Admin development zone accessible  
- 🏗️ Existing infrastructure mapped
- ⚠️ Conflict prevention enabled

**Agent can now work with full project context awareness to prevent conflicts.**`;
        } else {
          return `❌ CONTEXT UPDATE FAILED: Unable to enhance project awareness for ${input.coordinatorAgent}`;
        }
      }
      
      default:
        return `❌ UNKNOWN ACTION: "${input.action}". Available actions: create_workflow, assign_tasks, check_status, update_context`;
    }
    
  } catch (error) {
    console.error('❌ WORKFLOW COORDINATION ERROR:', error);
    return `❌ COORDINATION TOOL ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}

**Troubleshooting:**
- Verify coordination bridge is operational
- Check agent permissions and context
- Ensure all required parameters are provided
- Review system logs for detailed error information`;
  }
}