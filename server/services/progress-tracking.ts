/**
 * Progress Tracking Service
 * Real-time progress monitoring and analytics for multi-agent workflows
 * SSELFIE Studio Enhancement Project - Maya Implementation
 */

import { taskDependencyMapping } from './task-dependency-mapping';
// REMOVED: Old checkpoint-automation - replaced with advanced workflow orchestration

interface ProgressMetrics {
  timestamp: Date;
  workflowId: string;
  agentId?: string;
  taskId?: string;
  metric: string;
  value: number;
  unit: string;
  metadata: Record<string, any>;
}

interface ProgressSnapshot {
  id: string;
  timestamp: Date;
  workflowProgress: Record<string, any>;
  agentStatus: Record<string, any>;
  systemMetrics: Record<string, any>;
  milestones: Array<{
    name: string;
    completedAt: Date;
    duration: number;
  }>;
}

interface RealTimeUpdate {
  type: 'task_update' | 'agent_status' | 'milestone' | 'error' | 'warning';
  timestamp: Date;
  source: string;
  message: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class ProgressTrackingService {
  private metrics: ProgressMetrics[] = [];
  private snapshots: ProgressSnapshot[] = [];
  private realTimeUpdates: RealTimeUpdate[] = [];
  private subscribers: Map<string, (update: RealTimeUpdate) => void> = new Map();
  private trackingInterval: NodeJS.Timeout | null = null;
  private isTracking = false;

  constructor() {
    // REMOVED: Auto-start tracking that was causing server restarts
    // Manual initialization only
  }

  /**
   * Start real-time progress tracking
   */
  startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    // console.log('📊 PROGRESS TRACKING: Real-time monitoring started');

    // DISABLED: Progress tracking interval was causing server instability
    // Create snapshot every 5 minutes - DISABLED FOR STABILITY
    // this.trackingInterval = setInterval(() => {
    //   this.createProgressSnapshot();
    //   this.cleanupOldData();
    // }, 5 * 60 * 1000);
    //   this.cleanupOldData();
    // }, 5 * 60 * 1000);

    // Record initial snapshot
    this.createProgressSnapshot();
  }

  /**
   * Stop progress tracking
   */
  stopTracking(): void {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    console.log('⏹️ PROGRESS TRACKING: Monitoring stopped');
  }

  /**
   * Record a progress metric
   */
  recordMetric(
    workflowId: string,
    metric: string,
    value: number,
    unit: string = '',
    agentId?: string,
    taskId?: string,
    metadata: Record<string, any> = {}
  ): void {
    const progressMetric: ProgressMetrics = {
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
    
    // Broadcast real-time update
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

  /**
   * Create progress snapshot
   */
  private createProgressSnapshot(): void {
    const snapshot: ProgressSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date(),
      workflowProgress: this.captureWorkflowProgress(),
      agentStatus: this.captureAgentStatus(),
      systemMetrics: this.captureSystemMetrics(),
      milestones: this.captureMilestones()
    };

    this.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    // console.log(`📸 SNAPSHOT CREATED: ${snapshot.id}`);
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): {
    currentProgress: Record<string, any>;
    recentUpdates: RealTimeUpdate[];
    performanceMetrics: Record<string, any>;
    agentActivity: Record<string, any>;
    trends: Record<string, any>;
  } {
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];
    
    return {
      currentProgress: latestSnapshot ? latestSnapshot.workflowProgress : {},
      recentUpdates: this.realTimeUpdates.slice(-20).reverse(),
      performanceMetrics: this.calculatePerformanceMetrics(),
      agentActivity: this.calculateAgentActivity(),
      trends: this.calculateTrends()
    };
  }

  /**
   * Get progress history for specific workflow
   */
  getWorkflowHistory(workflowId: string, timeRange: number = 24): {
    snapshots: ProgressSnapshot[];
    metrics: ProgressMetrics[];
    milestones: Array<{
      name: string;
      completedAt: Date;
      duration: number;
    }>;
  } {
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    
    const filteredSnapshots = this.snapshots.filter(
      snapshot => snapshot.timestamp >= cutoffTime
    );
    
    const filteredMetrics = this.metrics.filter(
      metric => metric.workflowId === workflowId && metric.timestamp >= cutoffTime
    );

    const milestones = filteredSnapshots
      .flatMap(snapshot => snapshot.milestones)
      .filter((milestone, index, self) => 
        self.findIndex(m => m.name === milestone.name) === index
      );

    return {
      snapshots: filteredSnapshots,
      metrics: filteredMetrics,
      milestones
    };
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(
    subscriberId: string,
    callback: (update: RealTimeUpdate) => void,
    filter?: {
      types?: string[];
      sources?: string[];
      priority?: string[];
    }
  ): void {
    this.subscribers.set(subscriberId, (update) => {
      // Apply filters if provided
      if (filter) {
        if (filter.types && !filter.types.includes(update.type)) return;
        if (filter.sources && !filter.sources.includes(update.source)) return;
        if (filter.priority && !filter.priority.includes(update.priority)) return;
      }
      
      callback(update);
    });

    console.log(`🔔 SUBSCRIPTION: ${subscriberId} subscribed to real-time updates`);
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
    console.log(`🔕 UNSUBSCRIBED: ${subscriberId} removed from updates`);
  }

  /**
   * Broadcast update to all subscribers
   */
  private broadcastUpdate(update: RealTimeUpdate): void {
    this.realTimeUpdates.push(update);
    
    // Keep only last 1000 updates
    if (this.realTimeUpdates.length > 1000) {
      this.realTimeUpdates = this.realTimeUpdates.slice(-1000);
    }

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Capture current workflow progress
   */
  private captureWorkflowProgress(): Record<string, any> {
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

  /**
   * Capture current agent status
   */
  private captureAgentStatus(): Record<string, any> {
    const systemStatus = taskDependencyMapping.getSystemStatus();
    
    const agentStatus: Record<string, any> = {};
    
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

  /**
   * Capture system performance metrics
   */
  private captureSystemMetrics(): Record<string, any> {
    const systemStatus = taskDependencyMapping.getSystemStatus();
    // const checkpointStatus = checkpointSystem.getSystemStatus(); // Temporarily disabled for integration
    
    return {
      tasks: systemStatus.tasksByStatus,
      performance: {
        averageTaskDuration: systemStatus.averageTaskDuration,
        totalTasks: systemStatus.totalTasks,
        activeWorkflows: systemStatus.activeWorkflows
      },
      checkpoints: {
        total: 0, // checkpointStatus disabled for integration
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

  /**
   * Capture milestone information
   */
  private captureMilestones(): Array<{
    name: string;
    completedAt: Date;
    duration: number;
  }> {
    // const checkpoints = checkpointSystem.getCheckpointsByType('milestone'); // Disabled
    const checkpoints: any[] = []; // Temporary for integration
    
    return checkpoints.map(checkpoint => ({
      name: checkpoint.name,
      completedAt: checkpoint.timestamp,
      duration: checkpoint.metadata.estimatedDuration || 0
    }));
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(): Record<string, any> {
    const recentMetrics = this.metrics.filter(
      metric => metric.timestamp >= new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

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

  /**
   * Calculate agent activity metrics
   */
  private calculateAgentActivity(): Record<string, any> {
    const systemStatus = taskDependencyMapping.getSystemStatus();
    
    const totalTasks = Object.values(systemStatus.agentUtilization).reduce((sum, count) => sum + count, 0);
    const activeAgents = Object.values(systemStatus.agentUtilization).filter(count => count > 0).length;
    
    return {
      totalActiveAgents: activeAgents,
      totalActiveTasks: totalTasks,
      agentEfficiency: Object.fromEntries(
        Object.entries(systemStatus.agentUtilization).map(([agent, tasks]) => [
          agent,
          tasks > 0 ? 'active' : 'idle'
        ])
      ),
      collaborationIndex: this.calculateCollaborationIndex()
    };
  }

  /**
   * Calculate progress trends
   */
  private calculateTrends(): Record<string, any> {
    if (this.snapshots.length < 2) {
      return {
        velocityTrend: 'stable',
        progressVelocity: 0,
        estimatedCompletion: null
      };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
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

  /**
   * Calculate velocity between progress points
   */
  private calculateVelocity(progressPoints: number[]): number {
    if (progressPoints.length < 2) return 0;
    
    const differences = progressPoints.slice(1).map((point, index) => 
      point - progressPoints[index]
    );
    
    return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  }

  /**
   * Estimate completion time based on velocity
   */
  private estimateCompletion(progressPoints: number[], velocity: number): Date | null {
    if (velocity <= 0) return null;
    
    const currentProgress = progressPoints[progressPoints.length - 1];
    const remainingProgress = 100 - currentProgress;
    
    if (remainingProgress <= 0) return new Date();
    
    const snapshotInterval = 5; // 5 minutes between snapshots
    const estimatedSnapshots = remainingProgress / velocity;
    const estimatedMinutes = estimatedSnapshots * snapshotInterval;
    
    return new Date(Date.now() + estimatedMinutes * 60 * 1000);
  }

  /**
   * Calculate system efficiency
   */
  private calculateEfficiency(): number {
    const systemStatus = taskDependencyMapping.getSystemStatus();
    const totalTasks = systemStatus.totalTasks;
    const completedTasks = systemStatus.tasksByStatus.completed;
    const failedTasks = systemStatus.tasksByStatus.failed;
    
    if (totalTasks === 0) return 100;
    
    const efficiency = ((completedTasks - failedTasks) / totalTasks) * 100;
    return Math.max(0, Math.min(100, Math.round(efficiency)));
  }

  /**
   * Calculate system uptime
   */
  private calculateUptime(): number {
    // This would track actual system uptime
    // For now, return tracking uptime
    const trackingStart = this.snapshots[0]?.timestamp || new Date();
    const uptimeMs = Date.now() - trackingStart.getTime();
    return Math.round(uptimeMs / (1000 * 60 * 60)); // Hours
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    const recentUpdates = this.realTimeUpdates.filter(
      update => update.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
    );
    
    const errorUpdates = recentUpdates.filter(update => update.type === 'error');
    
    if (recentUpdates.length === 0) return 0;
    
    return Math.round((errorUpdates.length / recentUpdates.length) * 100);
  }

  /**
   * Calculate collaboration index
   */
  private calculateCollaborationIndex(): number {
    const systemStatus = taskDependencyMapping.getSystemStatus();
    const activeAgents = Object.values(systemStatus.agentUtilization).filter(count => count > 0).length;
    const maxAgents = Object.keys(systemStatus.agentUtilization).length;
    
    if (maxAgents === 0) return 0;
    
    return Math.round((activeAgents / maxAgents) * 100);
  }

  /**
   * Clean up old data to prevent memory bloat
   */
  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Clean old metrics
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime);
    
    // Clean old updates
    this.realTimeUpdates = this.realTimeUpdates.filter(update => update.timestamp >= cutoffTime);
    
    console.log('🧹 DATA CLEANUP: Removed old tracking data');
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: Record<string, any>;
  } {
    const performanceMetrics = this.calculatePerformanceMetrics();
    const agentActivity = this.calculateAgentActivity();
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check for issues
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