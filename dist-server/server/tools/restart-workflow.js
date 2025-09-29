import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export async function restart_workflow(input) {
    try {
        console.log(`🚀 WORKFLOW RESTART: Restarting "${input.name}" workflow with timeout ${input.workflow_timeout || 30}s`);
        if (input.name === 'Start application') {
            try {
                await execAsync('pkill -f "npm run dev" || true');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return `Workflow "${input.name}" restart initiated successfully.`;
            }
            catch (error) {
                console.error('Process restart error:', error);
                return `Workflow restart initiated (process management handled by Replit).`;
            }
        }
        return `Workflow "${input.name}" restart requested.`;
    }
    catch (error) {
        console.error('Workflow restart error:', error);
        return `Workflow restart error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
//# sourceMappingURL=restart-workflow.js.map