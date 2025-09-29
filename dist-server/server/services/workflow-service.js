import { promises as fs } from 'fs';
import path from 'path';
import { WorkflowExecutor } from './workflow-executor.js';
export class WorkflowService {
    executor;
    workflowsPath = '../../workflows';
    constructor() {
        this.executor = new WorkflowExecutor();
    }
    async executeWorkflow(workflowName, userId) {
        let workflow = null;
        try {
            workflow = await this.loadWorkflow(workflowName);
            if (!await this.verifyPermissions(userId, workflow.requiredRole)) {
                throw new Error('Insufficient permissions');
            }
            for (const step of workflow.steps) {
                await this.executeStep(step);
            }
        }
        catch (error) {
            await this.handleError(error, workflow);
        }
    }
    async loadWorkflow(name) {
        const workflowPath = path.join(__dirname, this.workflowsPath, `${name}.workflow`);
        const content = await fs.readFile(workflowPath, 'utf-8');
        return JSON.parse(content);
    }
    async verifyPermissions(userId, requiredRoles) {
        return true;
    }
    async executeStep(step) {
        switch (step.type) {
            case 'database_backup':
                await this.executor.createDatabaseBackup(step.config.tables);
                break;
            case 'schema_verification':
                await this.executor.verifySchema(step.config.schemaPath, step.config.tables);
                break;
            case 'database_fix':
                await this.executor.executeFixes(step.config.operations);
                break;
            case 'verification':
                await this.executor.verifyFixes(step.config.checks);
                break;
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }
    async handleError(error, workflow) {
        if (workflow.errorHandling.onFailure === 'rollback') {
            await this.executor.rollback('last_backup_file.sql');
        }
        console.error(`Workflow error: ${error.message}`);
    }
}
//# sourceMappingURL=workflow-service.js.map