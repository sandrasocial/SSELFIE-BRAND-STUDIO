import { spawn } from 'child_process';
export async function mark_completed_and_get_feedback(params) {
    try {
        console.log(`✅ COMPLETION FEEDBACK: ${params.query}`);
        const feedback = {
            success: true,
            message: "Task completed successfully",
            query: params.query,
            feedback: generateCompletionSummary(params.query),
            workflow_status: 'completed',
            screenshot_available: false
        };
        if (params.workflow_name) {
            const workflowStatus = await checkWorkflowStatus(params.workflow_name);
            feedback.workflow_status = workflowStatus;
        }
        return feedback;
    }
    catch (error) {
        console.error('❌ COMPLETION FEEDBACK ERROR:', error);
        return {
            success: false,
            message: `Completion feedback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            query: params.query,
            feedback: "Error in completion feedback system"
        };
    }
}
function generateCompletionSummary(query) {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('created') || queryLower.includes('built') || queryLower.includes('added')) {
        return "✅ Creation/implementation task completed. New functionality has been added to the project.";
    }
    if (queryLower.includes('fixed') || queryLower.includes('resolved') || queryLower.includes('repaired')) {
        return "✅ Fix/resolution task completed. Issue has been addressed and resolved.";
    }
    if (queryLower.includes('optimized') || queryLower.includes('improved') || queryLower.includes('enhanced')) {
        return "✅ Optimization task completed. System performance and efficiency have been improved.";
    }
    if (queryLower.includes('tested') || queryLower.includes('verified') || queryLower.includes('validated')) {
        return "✅ Testing/validation task completed. Functionality has been verified to work correctly.";
    }
    return "✅ Task completed successfully. The requested work has been finished and is ready for review.";
}
async function checkWorkflowStatus(workflowName) {
    return new Promise((resolve) => {
        const ps = spawn('ps', ['aux'], { stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';
        ps.stdout.on('data', (data) => {
            output += data.toString();
        });
        ps.on('close', () => {
            if (output.includes('npm run dev') || output.includes('node server')) {
                resolve('running');
            }
            else {
                resolve('stopped');
            }
        });
        setTimeout(() => {
            ps.kill('SIGTERM');
            resolve('unknown');
        }, 3000);
    });
}
//# sourceMappingURL=mark_completed_and_get_feedback.js.map