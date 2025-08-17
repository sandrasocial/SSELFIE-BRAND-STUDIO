import { multiAgentCoordinator } from '../services/multi-agent-coordinator';

export async function restart_workflow(input: { name: string; workflow_timeout?: number }): Promise<string> {
  try {
    console.log(`🚀 WORKFLOW RESTART: Executing workflow "${input.name}" with timeout ${input.workflow_timeout || 300}s`);
    
    // FIXED: Use dynamic workflow creation if storage doesn't exist
    const success = await multiAgentCoordinator.executeWorkflow(input.name, input.workflow_timeout || 300);
    
    if (success) {
      return `Workflow "${input.name}" executed successfully.`;
    } else {
      return `Workflow "${input.name}" not found or execution failed.`;
    }
  } catch (error) {
    console.error('Workflow restart error:', error);
    return `Workflow restart error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}