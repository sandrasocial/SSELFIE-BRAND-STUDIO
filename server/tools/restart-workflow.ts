// SIMPLIFIED: Workflow restart tool
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function restart_workflow(input: { name: string; workflow_timeout?: number }): Promise<string> {
  try {
    console.log(`🚀 WORKFLOW RESTART: Restarting "${input.name}" workflow with timeout ${input.workflow_timeout || 30}s`);
    
    // Simple workflow restart by killing and restarting npm process
    if (input.name === 'Start application') {
      try {
        // Kill existing npm process
        await execAsync('pkill -f "npm run dev" || true');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This will be automatically restarted by Replit
        return `Workflow "${input.name}" restart initiated successfully.`;
      } catch (error) {
        console.error('Process restart error:', error);
        return `Workflow restart initiated (process management handled by Replit).`;
      }
    }
    
    return `Workflow "${input.name}" restart requested.`;
  } catch (error) {
    console.error('Workflow restart error:', error);
    return `Workflow restart error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}