/**
 * Deployment Tracking Service
 * Tracks active deployments from Elena workflows and autonomous orchestrator
 */

export interface ActiveDeployment {
  id: string;
  name: string;
  type: 'elena-workflow' | 'autonomous-orchestrator' | 'manual';
  status: 'starting' | 'running' | 'completing' | 'completed' | 'failed';
  startTime: Date;
  estimatedCompletion: Date;
  agents: string[];
  tasks: string[];
  progress: number; // 0-100
  metadata: {
    workflowId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  };
}

export class DeploymentTrackingService {
  private activeDeployments = new Map<string, ActiveDeployment>();
  private deploymentHistory: ActiveDeployment[] = [];

  /**
   * Create a new deployment tracking entry for Elena workflows
   */
  startElenaWorkflowDeployment(
    workflowId: string,
    workflowTitle: string,
    agents: string[],
    tasks: string[],
    priority: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    estimatedDurationMinutes: number = 30
  ): string {
    const deploymentId = `elena-${workflowId}-${Date.now()}`;
    const startTime = new Date();
    const estimatedCompletion = new Date(startTime.getTime() + (estimatedDurationMinutes * 60 * 1000));

    const deployment: ActiveDeployment = {
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
  updateDeploymentProgress(deploymentId: string, progress: number, status?: ActiveDeployment['status']): void {
    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) return;

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
  completeDeployment(deploymentId: string, success: boolean): void {
    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) return;

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
  getActiveDeployments(): ActiveDeployment[] {
    return Array.from(this.activeDeployments.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Get deployment by ID
   */
  getDeployment(deploymentId: string): ActiveDeployment | undefined {
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
  getDeploymentHistory(): ActiveDeployment[] {
    return this.deploymentHistory.slice(-50) // Return last 50 deployments
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Clean up old completed deployments (older than 24 hours)
   */
  cleanupOldDeployments(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    this.deploymentHistory = this.deploymentHistory.filter(
      deployment => deployment.startTime > cutoffTime
    );
    
    console.log(`🧹 DEPLOYMENT TRACKING: Cleaned up old deployments, ${this.deploymentHistory.length} remaining`);
  }
}

// Export singleton instance
export const deploymentTracker = new DeploymentTrackingService();