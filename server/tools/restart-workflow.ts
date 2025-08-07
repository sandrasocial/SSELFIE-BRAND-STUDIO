import { multiAgentCoordinator } from '../services/multi-agent-coordinator';

export async function restart_workflow(input: { name: string; workflow_timeout?: number }): Promise<string> {
  try {
    console.log(`🚀 WORKFLOW RESTART: Executing workflow "${input.name}"`);
    
    const success = await multiAgentCoordinator.executeWorkflow(input.name);
    
    if (success) {
      return `Tool restart_workflow executed with: ${JSON.stringify(input)}`;
    } else {
      return `Tool restart_workflow failed: Workflow "${input.name}" not found or execution failed`;
    }
  } catch (error) {
    console.error('Workflow restart error:', error);
    return `Tool restart_workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}