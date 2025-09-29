import { taskDependencyMapping } from './task-dependency-mapping.js';
export class ProgressTrackingService {
    metrics = [];
    snapshots = [];
    realTimeUpdates = [];
    subscribers = new Map();
    trackingInterval = null;
    isTracking = false;
    constructor() {
        this.startTracking();
    }
    startTracking() {
        if (this.isTracking)
            return;
        this.isTracking = true;
        this.trackingInterval = setInterval(() => {
            this.createProgressSnapshot();
            this.cleanupOldData();
        }, 5 * 60 * 1000);
        this.createProgressSnapshot();
    }
    stopTracking() {
        if (!this.isTracking)
            return;
        this.isTracking = false;
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        console.log('⏹️ PROGRESS TRACKING: Monitoring stopped');
    }
    recordMetric(workflowId, metric, value, unit = '', agentId, taskId, metadata = {}) {
        const progressMetric = {
            timestamp: new Date(),
            workflowId,
            agentId,
            taskId,
            metric,
            value,
            unit,
            metadata
        };
        this.metrics.push(progressMetric);
        this.broadcastUpdate({
            type: 'task_update',
            timestamp: new Date(),
            source: agentId || 'system',
            message: `${metric}: ${value} ${unit}`,
            data: progressMetric,
            priority: 'medium'
        });
        console.log(`📈 METRIC RECORDED: ${metric} = ${value} ${unit} (${workflowId})`);
    }
    createProgressSnapshot() {
        const snapshot = {
            id: `snapshot_${Date.now()}`,
            timestamp: new Date(),
            workflowProgress: this.captureWorkflowProgress(),
            agentStatus: this.captureAgentStatus(),
            systemMetrics: this.captureSystemMetrics(),
            milestones: this.captureMilestones()
        };
        this.snapshots.push(snapshot);
        if (this.snapshots.length > 100) {
            this.snapshots = this.snapshots.slice(-100);
        }
    }
    getDashboardData() {
        const latestSnapshot = this.snapshots[this.snapshots.length - 1];
        return {
            currentProgress: latestSnapshot ? latestSnapshot.workflowProgress : {},
            recentUpdates: this.realTimeUpdates.slice(-20).reverse(),
            performanceMetrics: this.calculatePerformanceMetrics(),
            agentActivity: this.calculateAgentActivity(),
            trends: this.calculateTrends()
        };
    }
    getWorkflowHistory(workflowId, timeRange = 24) {
        const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
        const filteredSnapshots = this.snapshots.filter(snapshot => snapshot.timestamp >= cutoffTime);
        const filteredMetrics = this.metrics.filter(metric => metric.workflowId === workflowId && metric.timestamp >= cutoffTime);
        const milestones = filteredSnapshots
            .flatMap(snapshot => snapshot.milestones)
            .filter((milestone, index, self) => self.findIndex(m => m.name === milestone.name) === index);
        return {
            snapshots: filteredSnapshots,
            metrics: filteredMetrics,
            milestones
        };
    }
    subscribe(subscriberId, callback, filter) {
        this.subscribers.set(subscriberId, (update) => {
            if (filter) {
                if (filter.types && !filter.types.includes(update.type))
                    return;
                if (filter.sources && !filter.sources.includes(update.source))
                    return;
                if (filter.priority && !filter.priority.includes(update.priority))
                    return;
            }
            callback(update);
        });
        console.log(`🔔 SUBSCRIPTION: ${subscriberId} subscribed to real-time updates`);
    }
    unsubscribe(subscriberId) {
        this.subscribers.delete(subscriberId);
        console.log(`🔕 UNSUBSCRIBED: ${subscriberId} removed from updates`);
    }
    broadcastUpdate(update) {
        this.realTimeUpdates.push(update);
        if (this.realTimeUpdates.length > 1000) {
            this.realTimeUpdates = this.realTimeUpdates.slice(-1000);
        }
        this.subscribers.forEach(callback => {
            try {
                callback(update);
            }
            catch (error) {
                console.error('Error in subscriber callback:', error);
            }
        });
    }
    captureWorkflowProgress() {
        const enhancementProgress = taskDependencyMapping.getWorkflowProgress('enhancement_implementation');
        return {
            enhancement_implementation: enhancementProgress,
            summary: {
                totalWorkflows: 1,
                activeWorkflows: enhancementProgress.progressPercentage < 100 ? 1 : 0,
                completedWorkflows: enhancementProgress.progressPercentage === 100 ? 1 : 0
            }
        };
    }
    captureAgentStatus() {
        const systemStatus = taskDependencyMapping.getSystemStatus();
        const agentStatus = {};
        Object.entries(systemStatus.agentUtilization).forEach(([agentId, taskCount]) => {
            const agentTasks = taskDependencyMapping.getAgentTasks(agentId);
            const nextTask = taskDependencyMapping.getNextTask(agentId);
            agentStatus[agentId] = {
                activeTasks: taskCount,
                totalAssignedTasks: agentTasks.length,
                completedTasks: agentTasks.filter(t => t.status === 'completed').length,
                nextTask: nextTask ? {
                    id: nextTask.id,
                    name: nextTask.name,
                    priority: nextTask.priority,
                    estimatedDuration: nextTask.estimatedDuration
                } : null,
                status: taskCount > 0 ? 'active' : 'idle',
                lastActivity: new Date()
            };
        });
        return agentStatus;
    }
    captureSystemMetrics() {
        const systemStatus = taskDependencyMapping.getSystemStatus();
        return {
            tasks: systemStatus.tasksByStatus,
            performance: {
                averageTaskDuration: systemStatus.averageTaskDuration,
                totalTasks: systemStatus.totalTasks,
                activeWorkflows: systemStatus.activeWorkflows
            },
            checkpoints: {
                total: 0,
                milestones: 0,
                isMonitoring: false,
                lastCheckpoint: null
            },
            memory: {
                metricsCount: this.metrics.length,
                snapshotsCount: this.snapshots.length,
                subscribersCount: this.subscribers.size
            }
        };
    }
    captureMilestones() {
        const checkpoints = [];
        return checkpoints.map(checkpoint => ({
            name: checkpoint.name,
            completedAt: checkpoint.timestamp,
            duration: checkpoint.metadata.estimatedDuration || 0
        }));
    }
    calculatePerformanceMetrics() {
        const recentMetrics = this.metrics.filter(metric => metric.timestamp >= new Date(Date.now() - 60 * 60 * 1000));
        const taskCompletionMetrics = recentMetrics.filter(m => m.metric === 'task_completed');
        const tasksPerHour = taskCompletionMetrics.length;
        const durationMetrics = recentMetrics.filter(m => m.metric === 'task_duration');
        const averageDuration = durationMetrics.length > 0
            ? durationMetrics.reduce((sum, m) => sum + m.value, 0) / durationMetrics.length
            : 0;
        return {
            tasksPerHour,
            averageTaskDuration: Math.round(averageDuration),
            systemEfficiency: this.calculateEfficiency(),
            uptime: this.calculateUptime(),
            errorRate: this.calculateErrorRate()
        };
    }
    calculateAgentActivity() {
        const systemStatus = taskDependencyMapping.getSystemStatus();
        const totalTasks = Object.values(systemStatus.agentUtilization).reduce((sum, count) => sum + count, 0);
        const activeAgents = Object.values(systemStatus.agentUtilization).filter(count => count > 0).length;
        return {
            totalActiveAgents: activeAgents,
            totalActiveTasks: totalTasks,
            agentEfficiency: Object.fromEntries(Object.entries(systemStatus.agentUtilization).map(([agent, tasks]) => [
                agent,
                tasks > 0 ? 'active' : 'idle'
            ])),
            collaborationIndex: this.calculateCollaborationIndex()
        };
    }
    calculateTrends() {
        if (this.snapshots.length < 2) {
            return {
                velocityTrend: 'stable',
                progressVelocity: 0,
                estimatedCompletion: null
            };
        }
        const recent = this.snapshots.slice(-10);
        const progressPoints = recent.map(snapshot => {
            const enhancementProgress = snapshot.workflowProgress.enhancement_implementation;
            return enhancementProgress ? enhancementProgress.progressPercentage : 0;
        });
        const velocity = this.calculateVelocity(progressPoints);
        const trend = velocity > 1 ? 'accelerating' : velocity < -1 ? 'decelerating' : 'stable';
        return {
            velocityTrend: trend,
            progressVelocity: Math.round(velocity * 100) / 100,
            estimatedCompletion: this.estimateCompletion(progressPoints, velocity),
            recentMilestones: recent.flatMap(s => s.milestones).slice(-5)
        };
    }
    calculateVelocity(progressPoints) {
        if (progressPoints.length < 2)
            return 0;
        const differences = progressPoints.slice(1).map((point, index) => point - progressPoints[index]);
        return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    }
    estimateCompletion(progressPoints, velocity) {
        if (velocity <= 0)
            return null;
        const currentProgress = progressPoints[progressPoints.length - 1];
        const remainingProgress = 100 - currentProgress;
        if (remainingProgress <= 0)
            return new Date();
        const snapshotInterval = 5;
        const estimatedSnapshots = remainingProgress / velocity;
        const estimatedMinutes = estimatedSnapshots * snapshotInterval;
        return new Date(Date.now() + estimatedMinutes * 60 * 1000);
    }
    calculateEfficiency() {
        const systemStatus = taskDependencyMapping.getSystemStatus();
        const totalTasks = systemStatus.totalTasks;
        const completedTasks = systemStatus.tasksByStatus.completed;
        const failedTasks = systemStatus.tasksByStatus.failed;
        if (totalTasks === 0)
            return 100;
        const efficiency = ((completedTasks - failedTasks) / totalTasks) * 100;
        return Math.max(0, Math.min(100, Math.round(efficiency)));
    }
    calculateUptime() {
        const trackingStart = this.snapshots[0]?.timestamp || new Date();
        const uptimeMs = Date.now() - trackingStart.getTime();
        return Math.round(uptimeMs / (1000 * 60 * 60));
    }
    calculateErrorRate() {
        const recentUpdates = this.realTimeUpdates.filter(update => update.timestamp >= new Date(Date.now() - 60 * 60 * 1000));
        const errorUpdates = recentUpdates.filter(update => update.type === 'error');
        if (recentUpdates.length === 0)
            return 0;
        return Math.round((errorUpdates.length / recentUpdates.length) * 100);
    }
    calculateCollaborationIndex() {
        const systemStatus = taskDependencyMapping.getSystemStatus();
        const activeAgents = Object.values(systemStatus.agentUtilization).filter(count => count > 0).length;
        const maxAgents = Object.keys(systemStatus.agentUtilization).length;
        if (maxAgents === 0)
            return 0;
        return Math.round((activeAgents / maxAgents) * 100);
    }
    cleanupOldData() {
        const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime);
        this.realTimeUpdates = this.realTimeUpdates.filter(update => update.timestamp >= cutoffTime);
        console.log('🧹 DATA CLEANUP: Removed old tracking data');
    }
    getHealthSummary() {
        const performanceMetrics = this.calculatePerformanceMetrics();
        const agentActivity = this.calculateAgentActivity();
        const issues = [];
        const recommendations = [];
        let status = 'healthy';
        if (performanceMetrics.errorRate > 10) {
            issues.push('High error rate detected');
            status = 'warning';
        }
        if (agentActivity.totalActiveAgents === 0) {
            issues.push('No agents currently active');
            recommendations.push('Check agent system connectivity');
            status = 'warning';
        }
        if (performanceMetrics.systemEfficiency < 50) {
            issues.push('Low system efficiency');
            recommendations.push('Review task allocation and dependencies');
            status = 'critical';
        }
        return {
            status,
            issues,
            recommendations,
            metrics: {
                ...performanceMetrics,
                ...agentActivity
            }
        };
    }
}
export const progressTracking = new ProgressTrackingService();
//# sourceMappingURL=progress-tracking.js.map