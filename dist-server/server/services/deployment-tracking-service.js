export class DeploymentTrackingService {
    activeDeployments = new Map();
    deploymentHistory = [];
    startElenaWorkflowDeployment(workflowId, workflowTitle, agents, tasks, priority, description, estimatedDurationMinutes = 30) {
        const deploymentId = `elena-${workflowId}-${Date.now()}`;
        const startTime = new Date();
        const estimatedCompletion = new Date(startTime.getTime() + (estimatedDurationMinutes * 60 * 1000));
        const deployment = {
            id: deploymentId,
            name: workflowTitle,
            type: 'elena-workflow',
            status: 'starting',
            startTime,
            estimatedCompletion,
            agents,
            tasks,
            progress: 0,
            metadata: {
                workflowId,
                priority,
                description
            }
        };
        this.activeDeployments.set(deploymentId, deployment);
        console.log(`🚀 DEPLOYMENT TRACKING: Started deployment ${deploymentId} with ${agents.length} agents`);
        return deploymentId;
    }
    updateDeploymentProgress(deploymentId, progress, status) {
        const deployment = this.activeDeployments.get(deploymentId);
        if (!deployment)
            return;
        deployment.progress = Math.min(100, Math.max(0, progress));
        if (status) {
            deployment.status = status;
        }
        this.activeDeployments.set(deploymentId, deployment);
        console.log(`📈 DEPLOYMENT TRACKING: ${deploymentId} progress: ${progress}% (${status || deployment.status})`);
    }
    completeDeployment(deploymentId, success) {
        const deployment = this.activeDeployments.get(deploymentId);
        if (!deployment)
            return;
        deployment.status = success ? 'completed' : 'failed';
        deployment.progress = 100;
        this.deploymentHistory.push({ ...deployment });
        this.activeDeployments.delete(deploymentId);
        console.log(`✅ DEPLOYMENT TRACKING: ${deploymentId} ${success ? 'completed' : 'failed'}`);
    }
    getActiveDeployments() {
        return Array.from(this.activeDeployments.values())
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }
    getDeployment(deploymentId) {
        return this.activeDeployments.get(deploymentId) ||
            this.deploymentHistory.find(d => d.id === deploymentId);
    }
    getDeploymentMetrics() {
        const activeCount = this.activeDeployments.size;
        const totalCount = activeCount + this.deploymentHistory.length;
        const completedCount = this.deploymentHistory.filter(d => d.status === 'completed').length;
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        return {
            activeDeployments: activeCount,
            totalDeployments: totalCount,
            completionRate: Math.round(completionRate)
        };
    }
    getDeploymentHistory() {
        return this.deploymentHistory.slice(-50)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }
    cleanupOldDeployments() {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.deploymentHistory = this.deploymentHistory.filter(deployment => deployment.startTime > cutoffTime);
        console.log(`🧹 DEPLOYMENT TRACKING: Cleaned up old deployments, ${this.deploymentHistory.length} remaining`);
    }
}
export const deploymentTracker = new DeploymentTrackingService();
//# sourceMappingURL=deployment-tracking-service.js.map