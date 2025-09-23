/**
 * Deployment Tracking Service
 * Tracks active deployments from Elena workflows and autonomous orchestrator
 */
export class DeploymentTrackingService {
    activeDeployments = new Map();
    deploymentHistory = [];
    /**
     * Create a new deployment tracking entry for Elena workflows
     */
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
    /**
     * Update deployment progress
     */
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
    /**
     * Complete deployment
     */
    completeDeployment(deploymentId, success) {
        const deployment = this.activeDeployments.get(deploymentId);
        if (!deployment)
            return;
        deployment.status = success ? 'completed' : 'failed';
        deployment.progress = 100;
        // Move to history
        this.deploymentHistory.push({ ...deployment });
        this.activeDeployments.delete(deploymentId);
        console.log(`✅ DEPLOYMENT TRACKING: ${deploymentId} ${success ? 'completed' : 'failed'}`);
    }
    /**
     * Get all active deployments
     */
    getActiveDeployments() {
        return Array.from(this.activeDeployments.values())
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }
    /**
     * Get deployment by ID
     */
    getDeployment(deploymentId) {
        return this.activeDeployments.get(deploymentId) ||
            this.deploymentHistory.find(d => d.id === deploymentId);
    }
    /**
     * Get deployment metrics for dashboard
     */
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
    /**
     * Get deployment history
     */
    getDeploymentHistory() {
        return this.deploymentHistory.slice(-50) // Return last 50 deployments
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }
    /**
     * Clean up old completed deployments (older than 24 hours)
     */
    cleanupOldDeployments() {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        this.deploymentHistory = this.deploymentHistory.filter(deployment => deployment.startTime > cutoffTime);
        console.log(`🧹 DEPLOYMENT TRACKING: Cleaned up old deployments, ${this.deploymentHistory.length} remaining`);
    }
}
// Export singleton instance
export const deploymentTracker = new DeploymentTrackingService();
