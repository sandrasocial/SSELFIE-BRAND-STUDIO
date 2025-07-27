/**
 * LIVE PERFORMANCE MONITORING DASHBOARD
 * Real-time learning metrics, agent improvement tracking,
 * and user satisfaction monitoring
 */

import { agentMemorySystem } from '../memory/AgentMemorySystem';
import { agentLearningEngine } from '../learning/AgentLearningEngine';
import { agentCollaborationNetwork } from '../collaboration/AgentCollaborationNetwork';

export interface PerformanceMetrics {
  agentName: string;
  responseTime: number;
  successRate: number;
  userSatisfaction: number;
  tasksCompleted: number;
  errorsEncountered: number;
  improvementTrend: number;
  specializations: string[];
  recentActivity: Date;
}

export interface SystemOverview {
  totalAgents: number;
  activeAgents: number;
  averagePerformance: number;
  totalInteractions: number;
  systemHealth: number;
  memoryUtilization: string;
  learningEfficiency: number;
  collaborationScore: number;
}

export interface LearningProgress {
  agentName: string;
  skillDevelopment: Array<{
    skill: string;
    proficiencyLevel: number;
    improvementRate: number;
    lastImprovement: Date;
  }>;
  weaknessAreas: string[];
  recommendedTraining: string[];
  nextMilestone: string;
}

export interface RealTimeAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  agentName: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export class LivePerformanceMonitor {
  private static instance: LivePerformanceMonitor;
  private performanceHistory = new Map<string, PerformanceMetrics[]>();
  private realTimeAlerts: RealTimeAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): LivePerformanceMonitor {
    if (!LivePerformanceMonitor.instance) {
      LivePerformanceMonitor.instance = new LivePerformanceMonitor();
    }
    return LivePerformanceMonitor.instance;
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalSeconds: number = 30): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectPerformanceMetrics();
      this.analyzeAlerts();
    }, intervalSeconds * 1000);

    console.log(`✅ LIVE PERFORMANCE MONITORING: Started with ${intervalSeconds}s intervals`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🔄 LIVE PERFORMANCE MONITORING: Stopped');
  }

  /**
   * Get current performance metrics for all agents
   */
  async getCurrentPerformance(userId: string = '42585527'): Promise<PerformanceMetrics[]> {
    const agentNames = ['elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
    const metrics: PerformanceMetrics[] = [];

    for (const agentName of agentNames) {
      try {
        // Get learning metrics
        const learningMetrics = await agentLearningEngine.getLearningMetrics(agentName, userId);
        
        // Get memory summary
        const memorySummary = await agentMemorySystem.getConversationSummary(agentName, userId);
        
        // Get collaboration data
        const agentSpec = agentCollaborationNetwork.getAgentSpecialization(agentName);

        // Calculate response time (simulated based on recent activity)
        const responseTime = this.calculateResponseTime(memorySummary.lastActivity);

        // Calculate improvement trend
        const history = this.performanceHistory.get(agentName) || [];
        const improvementTrend = this.calculateImprovementTrend(history);

        const performanceMetric: PerformanceMetrics = {
          agentName,
          responseTime,
          successRate: learningMetrics.averageConfidenceScore,
          userSatisfaction: memorySummary.userSatisfactionScore,
          tasksCompleted: learningMetrics.successfulTasks,
          errorsEncountered: learningMetrics.totalInteractions - learningMetrics.successfulTasks,
          improvementTrend,
          specializations: agentSpec?.primarySkills || [],
          recentActivity: memorySummary.lastActivity
        };

        metrics.push(performanceMetric);

        // Store in history
        if (!this.performanceHistory.has(agentName)) {
          this.performanceHistory.set(agentName, []);
        }
        this.performanceHistory.get(agentName)!.push(performanceMetric);

        // Keep only last 100 entries
        const agentHistory = this.performanceHistory.get(agentName)!;
        if (agentHistory.length > 100) {
          this.performanceHistory.set(agentName, agentHistory.slice(-100));
        }

      } catch (error) {
        console.error(`❌ PERFORMANCE METRICS ERROR for ${agentName}:`, error);
      }
    }

    return metrics;
  }

  /**
   * Get system overview
   */
  async getSystemOverview(userId: string = '42585527'): Promise<SystemOverview> {
    try {
      const currentMetrics = await this.getCurrentPerformance(userId);
      const collaborationMetrics = agentCollaborationNetwork.getCollaborationMetrics();
      const memoryStats = agentMemorySystem.getMemoryStats();
      const learningStats = agentLearningEngine.getLearningStats();

      // Calculate averages
      const totalAgents = currentMetrics.length;
      const activeAgents = currentMetrics.filter(m => 
        Date.now() - m.recentActivity.getTime() < 24 * 60 * 60 * 1000 // Active in last 24 hours
      ).length;

      const averagePerformance = currentMetrics.length > 0 ? 
        currentMetrics.reduce((sum, m) => sum + m.successRate, 0) / currentMetrics.length : 0;

      const totalInteractions = currentMetrics.reduce((sum, m) => sum + m.tasksCompleted, 0);

      // Calculate system health
      const healthFactors = [
        Math.min(100, averagePerformance),
        Math.min(100, (activeAgents / totalAgents) * 100),
        Math.min(100, collaborationMetrics.collaborativeSuccessRate),
        Math.min(100, collaborationMetrics.networkEfficiency)
      ];
      const systemHealth = healthFactors.reduce((sum, factor) => sum + factor, 0) / healthFactors.length;

      // Learning efficiency (patterns learned vs total interactions)
      const learningEfficiency = learningStats.totalPatterns > 0 && totalInteractions > 0 ? 
        Math.min(100, (learningStats.totalPatterns / totalInteractions) * 100) : 0;

      return {
        totalAgents,
        activeAgents,
        averagePerformance,
        totalInteractions,
        systemHealth,
        memoryUtilization: memoryStats.cacheSize,
        learningEfficiency,
        collaborationScore: collaborationMetrics.collaborativeSuccessRate
      };

    } catch (error) {
      console.error('❌ SYSTEM OVERVIEW ERROR:', error);
      return {
        totalAgents: 13,
        activeAgents: 0,
        averagePerformance: 0,
        totalInteractions: 0,
        systemHealth: 0,
        memoryUtilization: '0 bytes',
        learningEfficiency: 0,
        collaborationScore: 0
      };
    }
  }

  /**
   * Get learning progress for specific agent
   */
  async getLearningProgress(agentName: string, userId: string = '42585527'): Promise<LearningProgress> {
    try {
      const learningMetrics = await agentLearningEngine.getLearningMetrics(agentName, userId);
      const agentSpec = agentCollaborationNetwork.getAgentSpecialization(agentName);
      const performanceHistory = this.performanceHistory.get(agentName) || [];

      // Analyze skill development
      const skillDevelopment = (agentSpec?.primarySkills || []).map(skill => {
        // Calculate proficiency based on success rate in that skill area
        const skillTasks = performanceHistory.filter(h => 
          h.specializations.includes(skill)
        );
        
        const proficiencyLevel = skillTasks.length > 0 ? 
          skillTasks.reduce((sum, task) => sum + task.successRate, 0) / skillTasks.length : 70;

        // Calculate improvement rate
        const recentTasks = skillTasks.slice(-10);
        const improvementRate = recentTasks.length > 1 ? 
          (recentTasks[recentTasks.length - 1].successRate - recentTasks[0].successRate) : 0;

        return {
          skill,
          proficiencyLevel,
          improvementRate,
          lastImprovement: recentTasks.length > 0 ? 
            recentTasks[recentTasks.length - 1].recentActivity : new Date()
        };
      });

      // Determine next milestone
      const averageProficiency = skillDevelopment.length > 0 ? 
        skillDevelopment.reduce((sum, skill) => sum + skill.proficiencyLevel, 0) / skillDevelopment.length : 0;

      let nextMilestone = 'Skill Development';
      if (averageProficiency > 90) {
        nextMilestone = 'Expert Mastery';
      } else if (averageProficiency > 80) {
        nextMilestone = 'Advanced Proficiency';
      } else if (averageProficiency > 70) {
        nextMilestone = 'Intermediate Competency';
      } else {
        nextMilestone = 'Basic Competency';
      }

      return {
        agentName,
        skillDevelopment,
        weaknessAreas: learningMetrics.weaknesses,
        recommendedTraining: learningMetrics.recommendedTraining,
        nextMilestone
      };

    } catch (error) {
      console.error(`❌ LEARNING PROGRESS ERROR for ${agentName}:`, error);
      return {
        agentName,
        skillDevelopment: [],
        weaknessAreas: [],
        recommendedTraining: [],
        nextMilestone: 'System Check Required'
      };
    }
  }

  /**
   * Get real-time alerts
   */
  getRealTimeAlerts(): RealTimeAlert[] {
    return this.realTimeAlerts.slice().reverse(); // Most recent first
  }

  /**
   * Add custom alert
   */
  addAlert(
    severity: RealTimeAlert['severity'],
    agentName: string,
    message: string
  ): void {
    const alert: RealTimeAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      agentName,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.realTimeAlerts.push(alert);

    // Keep only last 50 alerts
    if (this.realTimeAlerts.length > 50) {
      this.realTimeAlerts = this.realTimeAlerts.slice(-50);
    }

    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${agentName} - ${message}`);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.realTimeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ ALERT RESOLVED: ${alertId}`);
    }
  }

  /**
   * Collect performance metrics automatically
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      await this.getCurrentPerformance();
      console.log('📊 PERFORMANCE METRICS: Collected successfully');
    } catch (error) {
      console.error('❌ PERFORMANCE COLLECTION ERROR:', error);
    }
  }

  /**
   * Analyze and generate alerts
   */
  private analyzeAlerts(): void {
    try {
      for (const [agentName, history] of this.performanceHistory.entries()) {
        if (history.length === 0) continue;

        const latest = history[history.length - 1];
        const previous = history.length > 1 ? history[history.length - 2] : null;

        // Low success rate alert
        if (latest.successRate < 50) {
          this.addAlert('warning', agentName, `Low success rate: ${latest.successRate.toFixed(1)}%`);
        }

        // Performance degradation alert
        if (previous && latest.successRate < previous.successRate - 20) {
          this.addAlert('error', agentName, `Performance dropped by ${(previous.successRate - latest.successRate).toFixed(1)}%`);
        }

        // High error rate alert
        if (latest.errorsEncountered > latest.tasksCompleted) {
          this.addAlert('critical', agentName, `Error rate exceeds task completion rate`);
        }

        // Inactivity alert
        const daysSinceActivity = (Date.now() - latest.recentActivity.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceActivity > 3) {
          this.addAlert('info', agentName, `No activity for ${daysSinceActivity.toFixed(0)} days`);
        }

        // Improvement celebration
        if (previous && latest.successRate > previous.successRate + 15) {
          this.addAlert('info', agentName, `Significant improvement: +${(latest.successRate - previous.successRate).toFixed(1)}%`);
        }
      }

    } catch (error) {
      console.error('❌ ALERT ANALYSIS ERROR:', error);
    }
  }

  /**
   * Calculate response time based on activity
   */
  private calculateResponseTime(lastActivity: Date): number {
    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (60 * 60 * 1000);
    
    // Simulate response time based on recency
    if (hoursSinceActivity < 1) return Math.random() * 2 + 1; // 1-3 seconds
    if (hoursSinceActivity < 24) return Math.random() * 5 + 2; // 2-7 seconds
    return Math.random() * 10 + 5; // 5-15 seconds
  }

  /**
   * Calculate improvement trend
   */
  private calculateImprovementTrend(history: PerformanceMetrics[]): number {
    if (history.length < 2) return 0;

    const recent = history.slice(-5); // Last 5 measurements
    if (recent.length < 2) return 0;

    const oldAverage = recent.slice(0, Math.floor(recent.length / 2))
      .reduce((sum, m) => sum + m.successRate, 0) / Math.floor(recent.length / 2);
    
    const newAverage = recent.slice(Math.floor(recent.length / 2))
      .reduce((sum, m) => sum + m.successRate, 0) / Math.ceil(recent.length / 2);

    return newAverage - oldAverage;
  }

  /**
   * Clear performance history
   */
  clearHistory(): void {
    this.performanceHistory.clear();
    this.realTimeAlerts = [];
    console.log('🔄 PERFORMANCE HISTORY CLEARED');
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    totalDataPoints: number;
    monitoredAgents: number;
    alertsGenerated: number;
    monitoringActive: boolean;
  } {
    const totalDataPoints = Array.from(this.performanceHistory.values())
      .reduce((sum, history) => sum + history.length, 0);

    return {
      totalDataPoints,
      monitoredAgents: this.performanceHistory.size,
      alertsGenerated: this.realTimeAlerts.length,
      monitoringActive: this.monitoringInterval !== null
    };
  }
}

// Export singleton instance
export const livePerformanceMonitor = LivePerformanceMonitor.getInstance();