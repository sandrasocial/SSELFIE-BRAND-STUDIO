/**
 * Comprehensive Dashboard System
 * Provides real-time insights and analytics
 */

import { Logger } from './logger';
import { monitoringSystem } from './monitoring';
import { performanceMonitor } from './performance-monitor';
import { errorTracker } from './error-tracker';
import { securityMonitor } from './security-monitor';
import { healthCheckSystem } from './health-check';

export interface DashboardData {
  timestamp: string;
  overview: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: string;
    version: string;
    environment: string;
    lastUpdated: string;
  };
  health: {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
      lastChecked: string;
    }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: string;
    }>;
  };
  performance: {
    requests: {
      total: number;
      rate: number;
      averageResponseTime: number;
      p95ResponseTime: number;
      p99ResponseTime: number;
    };
    throughput: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    responseTime: {
      average: number;
      median: number;
      p95: number;
      p99: number;
    };
    errors: {
      count: number;
      rate: number;
      critical: number;
      byEndpoint: Array<{
        endpoint: string;
        method: string;
        errorCount: number;
        errorRate: number;
      }>;
    };
    slowestEndpoints: Array<{
      endpoint: string;
      method: string;
      averageTime: number;
      count: number;
    }>;
  };
  security: {
    events: {
      total: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      blocked: number;
      riskScore: {
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
    };
    threats: {
      topAttackVectors: Array<{
        vector: string;
        count: number;
        lastSeen: string;
      }>;
      topSourceIPs: Array<{
        ip: string;
        count: number;
        riskScore: number;
        lastSeen: string;
      }>;
      blockedIPs: string[];
      suspiciousIPs: Array<{
        ip: string;
        count: number;
        riskScore: number;
        lastSeen: string;
      }>;
    };
    alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: string;
    }>;
  };
  system: {
    memory: {
  used: number;
  total: number;
  percentage: number;
  usage: number;
  loadAverage: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    network: {
      inbound: number;
      outbound: number;
      connections: number;
    };
  };
  business: {
    users: {
      total: number;
      active: number;
      new: number;
      growth: number;
    };
    revenue: {
      total: number;
      monthly: number;
      growth: number;
    };
    features: {
      mostUsed: Array<{
        name: string;
        usage: number;
        growth: number;
      }>;
      leastUsed: Array<{
        name: string;
        usage: number;
        decline: number;
      }>;
    };
  };
  trends: {
    performance: Array<{
      timestamp: string;
      responseTime: number;
      throughput: number;
      errorRate: number;
    }>;
    security: Array<{
      timestamp: string;
      events: number;
      blocked: number;
      riskScore: number;
    }>;
    system: Array<{
      timestamp: string;
      memory: number;
      cpu: number;
      disk: number;
    }>;
  };
}

export class DashboardSystem {
  private logger: Logger;
  private _isEnabled: boolean;
  private updateInterval: NodeJS.Timeout | null;
  private lastUpdate: Date | null;
  private cachedData: DashboardData | null;

  constructor() {
  this.logger = new Logger('DashboardSystem');
  this._isEnabled = true;
  this.updateInterval = null;
  this.lastUpdate = null;
  this.cachedData = null;
  }

  /**
   * Start dashboard monitoring
   */
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.updateInterval) {
      this.logger.warn('Dashboard monitoring already started');
      return;
    }

    this.logger.info('Starting dashboard monitoring...');
    this.updateInterval = setInterval(() => {
      this.updateDashboardData();
    }, intervalMs);

    // Initial update
    this.updateDashboardData();
  }

  /**
   * Stop dashboard monitoring
   */
  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.logger.info('Dashboard monitoring stopped');
    }
  }

  /**
   * Get dashboard data
   */
  public getDashboardData(): DashboardData | null {
    return this.cachedData;
  }

  /**
   * Update dashboard data
   */
  public async updateDashboardData(): Promise<DashboardData> {
    try {
      const timestamp = new Date().toISOString();
      this.lastUpdate = new Date();

      // Get health data
      const healthData = await healthCheckSystem.performHealthCheck();

      // Get performance data
      const performanceStats = performanceMonitor.getPerformanceStats(24); // Last 24 hours
      const realTimeSummary = performanceMonitor.getRealTimeSummary();

      // Get error data
      const errorStats = errorTracker.getErrorStats(24); // Last 24 hours

      // Get security data
      const securityStats = securityMonitor.getSecurityStats(24); // Last 24 hours

      // Get system metrics
      const systemMetrics = this.getSystemMetrics();

      // Get business metrics
      const businessMetrics = await this.getBusinessMetrics();

      // Get trend data
      const trendData = this.getTrendData();

      const dashboardData: DashboardData = {
        timestamp,
        overview: {
          status: healthData.status,
          uptime: this.formatUptime(process.uptime()),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          lastUpdated: timestamp,
        },
        health: {
          overall: healthData.status,
          checks: Object.entries(healthData.checks).map(([name, check]) => ({
            name: name.replace(/_/g, ' ').toUpperCase(),
            status: check.status,
            message: check.message,
            lastChecked: check.lastChecked,
          })),
          alerts: healthData.alerts,
        },
        performance: {
          requests: {
            total: performanceStats.totalRequests,
            rate: performanceStats.throughput,
            averageResponseTime: performanceStats.averageResponseTime,
            p95ResponseTime: performanceStats.maxResponseTime ?? 0,
            p99ResponseTime: performanceStats.maxResponseTime ?? 0,
          },
          throughput: {
            requestsPerMinute: realTimeSummary.requestsPerMinute,
            requestsPerHour: Math.round(realTimeSummary.requestsPerMinute * 60),
            requestsPerDay: Math.round(realTimeSummary.requestsPerMinute * 60 * 24),
          },
          responseTime: {
            average: performanceStats.averageResponseTime,
            median: performanceStats.averageResponseTime, // Simplified
            p95: performanceStats.maxResponseTime ?? 0,
            p99: performanceStats.maxResponseTime ?? 0,
          },
          errors: {
            count: errorStats.totalErrors,
            rate: errorStats.errorRate,
            critical: errorStats.criticalErrors,
            byEndpoint: Array.isArray(errorStats.errorsByEndpoint)
              ? errorStats.errorsByEndpoint
              : Object.entries(errorStats.errorsByEndpoint).map(([endpoint, errorCount]) => ({
                  endpoint,
                  method: '',
                  errorCount,
                  errorRate: 0
                })),
          },
          slowestEndpoints: performanceStats.slowestEndpoints,
        },
        security: {
          events: {
            total: securityStats.totalEvents,
            byType: securityStats.eventsByType,
            bySeverity: securityStats.eventsBySeverity,
            blocked: securityStats.blockedRequests,
            riskScore: securityStats.riskScoreDistribution,
          },
          threats: {
            topAttackVectors: securityStats.topAttackVectors,
            topSourceIPs: securityStats.topSourceIPs,
            blockedIPs: securityMonitor.getBlockedIPs(),
            suspiciousIPs: securityMonitor.getSuspiciousIPs().map(ip => ({
              ip: ip.ip,
                  p95: performanceStats.maxResponseTime ?? 0,
                  p99: performanceStats.maxResponseTime ?? 0,
              count: ip.count,
              riskScore: ip.riskScore,
              lastSeen: ip.lastSeen.toISOString(),
            })),
          },
          alerts: this.getSecurityAlerts(),
        },
        system: {
          memory: {
            used: systemMetrics.memory.used,
            total: systemMetrics.memory.total,
            percentage: systemMetrics.memory.percentage,
            usage: systemMetrics.memory.usage ?? 0,
            loadAverage: systemMetrics.memory.loadAverage ?? [],
            trend: this.calculateTrend('memory', systemMetrics.memory.percentage),
          },
          // cpu property removed; not part of expected type
          disk: {
            used: systemMetrics.disk.used,
            total: systemMetrics.disk.total,
            percentage: systemMetrics.disk.percentage,
            trend: this.calculateTrend('disk', systemMetrics.disk.percentage),
          },
          network: {
            inbound: systemMetrics.network.inbound,
            outbound: systemMetrics.network.outbound,
            connections: systemMetrics.network.connections,
          },
        },
        business: businessMetrics,
        trends: trendData,
      };

      this.cachedData = dashboardData;
      this.logger.debug('Dashboard data updated', { timestamp });

      return dashboardData;
    } catch (error) {
      this.logger.error('Failed to update dashboard data', { error });
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): {
  memory: { used: number; total: number; percentage: number; usage: number; loadAverage: number[] };
    cpu: { usage: number; loadAverage: number[] };
    disk: { used: number; total: number; percentage: number };
    network: { inbound: number; outbound: number; connections: number };
  } {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const loadAverage = require('os').loadavg();
    const cpuCount = require('os').cpus().length;

    return {
      memory: {
        used: memoryUsage.heapUsed,
        total: totalMemory,
        percentage: (memoryUsage.heapUsed / totalMemory) * 100,
        usage: (loadAverage[0] / cpuCount) * 100,
        loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
      },
      cpu: {
        usage: (loadAverage[0] / cpuCount) * 100,
        loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
      },
      disk: {
        used: 0, // This would be calculated from actual disk usage
        total: 0,
        percentage: 0,
      },
      network: {
        inbound: 0, // This would be calculated from network stats
        outbound: 0,
        connections: 0,
      },
    };
  }

  /**
   * Get business metrics
   */
  private async getBusinessMetrics(): Promise<DashboardData['business']> {
    // This would integrate with your business logic
    // For now, return mock data
    return {
      users: {
        total: 1250,
        active: 890,
        new: 45,
        growth: 12.5,
      },
      revenue: {
        total: 125000,
        monthly: 15000,
        growth: 8.3,
      },
      features: {
        mostUsed: [
          { name: 'AI Image Generation', usage: 85, growth: 15.2 },
          { name: 'Video Creation', usage: 72, growth: 8.7 },
          { name: 'Brand Studio', usage: 68, growth: 12.1 },
        ],
        leastUsed: [
          { name: 'Advanced Analytics', usage: 15, decline: 5.2 },
          { name: 'Custom Templates', usage: 22, decline: 2.1 },
        ],
      },
    };
  }

  /**
   * Get trend data
   */
  private getTrendData(): DashboardData['trends'] {
    // This would calculate actual trends from historical data
    // For now, return mock data
    const now = Date.now();
    const hours = 24;
    const interval = 60 * 60 * 1000; // 1 hour

    return {
      performance: Array.from({ length: hours }, (_, i) => ({
        timestamp: new Date(now - (hours - i) * interval).toISOString(),
        responseTime: Math.random() * 1000 + 500,
        throughput: Math.random() * 100 + 50,
        errorRate: Math.random() * 5,
      })),
      security: Array.from({ length: hours }, (_, i) => ({
        timestamp: new Date(now - (hours - i) * interval).toISOString(),
        events: Math.floor(Math.random() * 20),
        blocked: Math.floor(Math.random() * 5),
        riskScore: Math.random() * 100,
      })),
      system: Array.from({ length: hours }, (_, i) => ({
        timestamp: new Date(now - (hours - i) * interval).toISOString(),
        memory: Math.random() * 20 + 60,
        cpu: Math.random() * 30 + 40,
        disk: Math.random() * 10 + 70,
      })),
    };
  }

  /**
   * Calculate trend for a metric
   */
  private calculateTrend(metric: string, currentValue: number): 'increasing' | 'decreasing' | 'stable' {
    // This would compare with historical values
    // For now, return stable
    return 'stable';
  }

  /**
   * Get security alerts
   */
  private getSecurityAlerts(): Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }> {
    // This would get actual security alerts
    // For now, return empty array
    return [];
  }

  /**
   * Format uptime
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Get dashboard summary
   */
  public getDashboardSummary(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: string;
  requests: number;
  errors: number;
  memory: number;
  lastUpdated: string;
  } {
    if (!this.cachedData) {
      return {
        status: 'unhealthy',
        uptime: '0m',
        requests: 0,
        errors: 0,
        memory: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const { overview, performance, system } = this.cachedData;

    return {
      status: overview.status,
      uptime: overview.uptime,
      requests: performance.requests.total,
      errors: performance.errors.count,
      memory: system.memory.percentage,
  // cpu: system.cpu.usage, // Removed: system.cpu does not exist
      lastUpdated: overview.lastUpdated,
    };
  }

  /**
   * Get real-time metrics
   */
  public getRealTimeMetrics(): {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    activeUsers: number;
  } {
    const realTimeSummary = performanceMonitor.getRealTimeSummary();
    const systemMetrics = this.getSystemMetrics();

    return {
      requestsPerMinute: realTimeSummary.requestsPerMinute,
      averageResponseTime: realTimeSummary.averageResponseTime,
      errorRate: realTimeSummary.errorRate,
      memoryUsage: systemMetrics.memory.percentage,
      cpuUsage: systemMetrics.cpu.usage,
      activeUsers: realTimeSummary.activeUsers,
    };
  }

  /**
   * Get last update time
   */
  public getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  /**
   * Enable/disable dashboard
   */
  public setEnabled(enabled: boolean): void {
  this._isEnabled = enabled;
  this.logger.info(`Dashboard system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if dashboard is enabled
   */
  public isEnabled(): boolean {
  return this._isEnabled;
  }
}

// Export singleton instance
export const dashboardSystem = new DashboardSystem();
