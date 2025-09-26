/**
 * Comprehensive Monitoring System
 * Real-time monitoring of application health, performance, and errors
 */

import { Logger } from './logger';
import { monitoringSystem } from './monitoring';
import { performanceMonitor } from './performance-monitor';
import { errorTracker } from './error-tracker';
import { securityMonitor } from './security-monitor';
import { healthCheckSystem } from './health-check';
import { dashboardSystem } from './dashboard';

export class MonitoringSystem {
  private logger: Logger;
  private isEnabled: boolean;
  private monitoringInterval: NodeJS.Timeout | null;

  constructor() {
    this.logger = new Logger('MonitoringSystem');
    this.isEnabled = true;
    this.monitoringInterval = null;
  }

  /**
   * Start monitoring
   */
  public startMonitoring(): void {
    if (!this.isEnabled) {
      this.logger.warn('Monitoring system is disabled');
      return;
    }

    if (this.monitoringInterval) {
      this.logger.warn('Monitoring already started');
      return;
    }

    this.logger.info('Starting comprehensive monitoring system...');

    // Start individual monitoring systems
    monitoringSystem.startMonitoring();
    performanceMonitor.setEnabled(true);
    errorTracker.setEnabled(true);
    securityMonitor.setEnabled(true);
    healthCheckSystem.startMonitoring();
    dashboardSystem.startMonitoring();

    // Start overall monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCycle();
    }, 30000); // Every 30 seconds

    this.logger.info('Monitoring system started successfully');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (!this.monitoringInterval) {
      this.logger.warn('Monitoring not started');
      return;
    }

    this.logger.info('Stopping monitoring system...');

    // Stop individual monitoring systems
    monitoringSystem.stopMonitoring();
    performanceMonitor.setEnabled(false);
    errorTracker.setEnabled(false);
    securityMonitor.setEnabled(false);
    healthCheckSystem.stopMonitoring();
    dashboardSystem.stopMonitoring();

    // Stop overall monitoring interval
    clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;

    this.logger.info('Monitoring system stopped');
  }

  /**
   * Perform monitoring cycle
   */
  private async performMonitoringCycle(): Promise<void> {
    try {
      // Get system health
      const healthCheck = await healthCheckSystem.performHealthCheck();
      
      // Get performance metrics
      const performanceStats = performanceMonitor.getPerformanceStats(1); // Last hour
      const realTimeSummary = performanceMonitor.getRealTimeSummary();
      
      // Get error statistics
      const errorStats = errorTracker.getErrorStats(1); // Last hour
      
      // Get security statistics
      const securityStats = securityMonitor.getSecurityStats(1); // Last hour
      
      // Get dashboard data
      const dashboardData = dashboardSystem.getDashboardData();

      // Log monitoring summary
      this.logger.info('Monitoring cycle completed', {
        health: healthCheck.status,
        performance: {
          averageResponseTime: performanceStats.averageResponseTime,
          errorRate: performanceStats.errorRate,
          throughput: performanceStats.throughput,
        },
        errors: {
          total: errorStats.totalErrors,
          rate: errorStats.errorRate,
          critical: errorStats.criticalErrors,
        },
        security: {
          events: securityStats.totalEvents,
          blocked: securityStats.blockedRequests,
          riskScore: securityStats.riskScoreDistribution,
        },
        system: {
          memory: dashboardData?.system.memory.percentage || 0,
          cpu: dashboardData?.system.cpu.usage || 0,
        },
      });

      // Check for alerts
      this.checkAlerts(healthCheck, performanceStats, errorStats, securityStats);

    } catch (error) {
      this.logger.error('Monitoring cycle failed', { error: error.message });
    }
  }

  /**
   * Check for alerts
   */
  private checkAlerts(
    healthCheck: any,
    performanceStats: any,
    errorStats: any,
    securityStats: any
  ): void {
    const alerts: string[] = [];

    // Health alerts
    if (healthCheck.status === 'unhealthy') {
      alerts.push('System health is unhealthy');
    } else if (healthCheck.status === 'degraded') {
      alerts.push('System health is degraded');
    }

    // Performance alerts
    if (performanceStats.averageResponseTime > 5000) {
      alerts.push(`High average response time: ${performanceStats.averageResponseTime}ms`);
    }
    if (performanceStats.errorRate > 10) {
      alerts.push(`High error rate: ${performanceStats.errorRate}%`);
    }

    // Error alerts
    if (errorStats.criticalErrors > 0) {
      alerts.push(`${errorStats.criticalErrors} critical errors in the last hour`);
    }
    if (errorStats.errorRate > 5) {
      alerts.push(`High error rate: ${errorStats.errorRate}%`);
    }

    // Security alerts
    if (securityStats.totalEvents > 50) {
      alerts.push(`High security event count: ${securityStats.totalEvents}`);
    }
    if (securityStats.blockedRequests > 10) {
      alerts.push(`${securityStats.blockedRequests} requests blocked in the last hour`);
    }

    // Log alerts
    if (alerts.length > 0) {
      this.logger.warn('Monitoring alerts detected', { alerts });
    }
  }

  /**
   * Get monitoring status
   */
  public getMonitoringStatus(): {
    enabled: boolean;
    running: boolean;
    systems: {
      monitoring: boolean;
      performance: boolean;
      errors: boolean;
      security: boolean;
      health: boolean;
      dashboard: boolean;
    };
  } {
    return {
      enabled: this.isEnabled,
      running: this.monitoringInterval !== null,
      systems: {
        monitoring: monitoringSystem.isEnabled(),
        performance: performanceMonitor.isEnabled(),
        errors: errorTracker.isEnabled(),
        security: securityMonitor.isEnabled(),
        health: healthCheckSystem.isEnabled(),
        dashboard: dashboardSystem.isEnabled(),
      },
    };
  }

  /**
   * Get monitoring summary
   */
  public async getMonitoringSummary(): Promise<{
    health: string;
    performance: {
      averageResponseTime: number;
      errorRate: number;
      throughput: number;
    };
    errors: {
      total: number;
      rate: number;
      critical: number;
    };
    security: {
      events: number;
      blocked: number;
      riskScore: {
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
    };
    system: {
      memory: number;
      cpu: number;
      uptime: string;
    };
  }> {
    const healthCheck = await healthCheckSystem.performHealthCheck();
    const performanceStats = performanceMonitor.getPerformanceStats(1);
    const errorStats = errorTracker.getErrorStats(1);
    const securityStats = securityMonitor.getSecurityStats(1);
    const dashboardData = dashboardSystem.getDashboardData();

    return {
      health: healthCheck.status,
      performance: {
        averageResponseTime: performanceStats.averageResponseTime,
        errorRate: performanceStats.errorRate,
        throughput: performanceStats.throughput,
      },
      errors: {
        total: errorStats.totalErrors,
        rate: errorStats.errorRate,
        critical: errorStats.criticalErrors,
      },
      security: {
        events: securityStats.totalEvents,
        blocked: securityStats.blockedRequests,
        riskScore: securityStats.riskScoreDistribution,
      },
      system: {
        memory: dashboardData?.system.memory.percentage || 0,
        cpu: dashboardData?.system.cpu.usage || 0,
        uptime: dashboardData?.overview.uptime || '0m',
      },
    };
  }

  /**
   * Get monitoring data for external systems
   */
  public async getMonitoringData(): Promise<{
    timestamp: string;
    health: any;
    performance: any;
    errors: any;
    security: any;
    system: any;
  }> {
    const timestamp = new Date().toISOString();
    
    const healthCheck = await healthCheckSystem.performHealthCheck();
    const performanceStats = performanceMonitor.getPerformanceStats(1);
    const errorStats = errorTracker.getErrorStats(1);
    const securityStats = securityMonitor.getSecurityStats(1);
    const dashboardData = dashboardSystem.getDashboardData();

    return {
      timestamp,
      health: healthCheck,
      performance: performanceStats,
      errors: errorStats,
      security: securityStats,
      system: dashboardData,
    };
  }

  /**
   * Export monitoring data
   */
  public async exportMonitoringData(): Promise<{
    timestamp: string;
    health: any;
    performance: any;
    errors: any;
    security: any;
    system: any;
    monitoring: any;
  }> {
    const timestamp = new Date().toISOString();
    
    const healthCheck = await healthCheckSystem.performHealthCheck();
    const performanceStats = performanceMonitor.getPerformanceStats(24); // Last 24 hours
    const errorStats = errorTracker.getErrorStats(24); // Last 24 hours
    const securityStats = securityMonitor.getSecurityStats(24); // Last 24 hours
    const dashboardData = dashboardSystem.getDashboardData();
    const monitoringData = monitoringSystem.getHealthMetrics();

    return {
      timestamp,
      health: healthCheck,
      performance: performanceStats,
      errors: errorStats,
      security: securityStats,
      system: dashboardData,
      monitoring: monitoringData,
    };
  }

  /**
   * Clear monitoring data
   */
  public clearMonitoringData(): void {
    this.logger.info('Clearing monitoring data...');
    
    // Clear old data from individual systems
    performanceMonitor.clearOldMetrics(24); // Keep last 24 hours
    errorTracker.clearOldErrors(168); // Keep last 7 days
    securityMonitor.clearOldEvents(168); // Keep last 7 days
    
    this.logger.info('Monitoring data cleared');
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Monitoring system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if monitoring is enabled
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem();