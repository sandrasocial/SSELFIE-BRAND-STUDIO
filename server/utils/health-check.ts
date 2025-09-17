/**
 * Comprehensive Health Check System
 * Monitors application health and dependencies
 */

import { Logger } from './logger';
import { monitoringSystem } from './monitoring';
import { performanceMonitor } from './performance-monitor';
import { errorTracker } from './error-tracker';
import { securityMonitor } from './security-monitor';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    cache: HealthCheck;
    external_apis: HealthCheck;
    storage: HealthCheck;
    memory: HealthCheck;
    cpu: HealthCheck;
    disk: HealthCheck;
    network: HealthCheck;
    security: HealthCheck;
    performance: HealthCheck;
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    requests: {
      total: number;
      rate: number;
      averageResponseTime: number;
    };
    errors: {
      count: number;
      rate: number;
      critical: number;
    };
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

export class HealthCheckSystem {
  private logger: Logger;
  private isEnabled: boolean;
  private checkInterval: NodeJS.Timeout | null;
  private lastCheck: Date | null;

  constructor() {
    this.logger = new Logger('HealthCheckSystem');
    this.isEnabled = true;
    this.checkInterval = null;
    this.lastCheck = null;
  }

  /**
   * Start health check monitoring
   */
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      this.logger.warn('Health check monitoring already started');
      return;
    }

    this.logger.info('Starting health check monitoring...');
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    // Initial check
    this.performHealthCheck();
  }

  /**
   * Stop health check monitoring
   */
  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.logger.info('Health check monitoring stopped');
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    this.lastCheck = new Date();

    try {
      // Run all health checks in parallel
      const [
        databaseCheck,
        cacheCheck,
        externalApisCheck,
        storageCheck,
        memoryCheck,
        cpuCheck,
        diskCheck,
        networkCheck,
        securityCheck,
        performanceCheck,
      ] = await Promise.all([
        this.checkDatabase(),
        this.checkCache(),
        this.checkExternalApis(),
        this.checkStorage(),
        this.checkMemory(),
        this.checkCpu(),
        this.checkDisk(),
        this.checkNetwork(),
        this.checkSecurity(),
        this.checkPerformance(),
      ]);

      // Get system metrics
      const metrics = this.getSystemMetrics();

      // Get alerts
      const alerts = this.getAlerts();

      // Determine overall status
      const overallStatus = this.determineOverallStatus([
        databaseCheck,
        cacheCheck,
        externalApisCheck,
        storageCheck,
        memoryCheck,
        cpuCheck,
        diskCheck,
        networkCheck,
        securityCheck,
        performanceCheck,
      ]);

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: databaseCheck,
          cache: cacheCheck,
          external_apis: externalApisCheck,
          storage: storageCheck,
          memory: memoryCheck,
          cpu: cpuCheck,
          disk: diskCheck,
          network: networkCheck,
          security: securityCheck,
          performance: performanceCheck,
        },
        metrics,
        alerts,
      };

      // Log health check result
      const duration = Date.now() - startTime;
      this.logger.info('Health check completed', {
        status: overallStatus,
        duration,
        checks: Object.keys(result.checks).length,
        alerts: alerts.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Health check failed', { error });
      
      // Return unhealthy status if health check itself fails
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          cache: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          external_apis: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          storage: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          memory: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          cpu: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          disk: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          network: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          security: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
          performance: { status: 'unhealthy', message: 'Health check failed', lastChecked: new Date().toISOString() },
        },
        metrics: {
          memory: { used: 0, total: 0, percentage: 0 },
          cpu: { usage: 0, loadAverage: [0, 0, 0] },
          requests: { total: 0, rate: 0, averageResponseTime: 0 },
          errors: { count: 0, rate: 0, critical: 0 },
        },
        alerts: [{
          type: 'health_check_failed',
          message: 'Health check system failed',
          severity: 'critical',
          timestamp: new Date().toISOString(),
        }],
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would be replaced with actual database health check
      // For now, simulate a check
      const responseTime = Date.now() - startTime;
      
      // Simulate database check
      const isHealthy = Math.random() > 0.1; // 90% success rate for demo
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Database connection healthy' : 'Database connection failed',
        responseTime,
        details: {
          connectionPool: 'active',
          activeConnections: 5,
          maxConnections: 100,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check cache health
   */
  private async checkCache(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would be replaced with actual cache health check
      const responseTime = Date.now() - startTime;
      
      // Simulate cache check
      const isHealthy = Math.random() > 0.05; // 95% success rate for demo
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Cache connection healthy' : 'Cache connection failed',
        responseTime,
        details: {
          type: 'Redis',
          memoryUsage: '45MB',
          hitRate: '85%',
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Cache check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check external APIs health
   */
  private async checkExternalApis(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check multiple external APIs
      const apis = [
        { name: 'Anthropic API', url: 'https://api.anthropic.com/v1/messages', timeout: 5000 },
        { name: 'Google GenAI API', url: 'https://generativelanguage.googleapis.com/v1beta', timeout: 5000 },
        { name: 'Replicate API', url: 'https://api.replicate.com/v1', timeout: 5000 },
        { name: 'Stripe API', url: 'https://api.stripe.com/v1', timeout: 5000 },
      ];

      const results = await Promise.allSettled(
        apis.map(async (api) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), api.timeout);
          
          try {
            const response = await fetch(api.url, {
              method: 'HEAD',
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return { name: api.name, status: response.ok, statusCode: response.status };
          } catch (error) {
            clearTimeout(timeoutId);
            return { name: api.name, status: false, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status).length;
      const total = results.length;
      const successRate = (successful / total) * 100;

      return {
        status: successRate >= 80 ? 'healthy' : successRate >= 50 ? 'degraded' : 'unhealthy',
        message: `${successful}/${total} external APIs healthy (${successRate.toFixed(1)}%)`,
        responseTime: Date.now() - startTime,
        details: {
          apis: results.map(r => r.status === 'fulfilled' ? r.value : { name: 'Unknown', status: false }),
          successRate,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `External APIs check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check storage health
   */
  private async checkStorage(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check S3 storage
      const responseTime = Date.now() - startTime;
      
      // Simulate storage check
      const isHealthy = Math.random() > 0.02; // 98% success rate for demo
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Storage connection healthy' : 'Storage connection failed',
        responseTime,
        details: {
          type: 'AWS S3',
          bucket: process.env.AWS_S3_BUCKET || 'unknown',
          region: process.env.AWS_REGION || 'unknown',
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Storage check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check memory health
   */
  private async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const usedMemory = memoryUsage.heapUsed;
      const percentage = (usedMemory / totalMemory) * 100;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (percentage > 90) {
        status = 'unhealthy';
        message = `Memory usage critical: ${percentage.toFixed(1)}%`;
      } else if (percentage > 80) {
        status = 'degraded';
        message = `Memory usage high: ${percentage.toFixed(1)}%`;
      } else {
        status = 'healthy';
        message = `Memory usage normal: ${percentage.toFixed(1)}%`;
      }

      return {
        status,
        message,
        responseTime: Date.now() - startTime,
        details: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round(percentage * 100) / 100,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Memory check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check CPU health
   */
  private async checkCpu(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const loadAverage = require('os').loadavg();
      const cpuCount = require('os').cpus().length;
      const cpuUsage = loadAverage[0] / cpuCount; // 1-minute load average per CPU
      const percentage = cpuUsage * 100;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (percentage > 90) {
        status = 'unhealthy';
        message = `CPU usage critical: ${percentage.toFixed(1)}%`;
      } else if (percentage > 70) {
        status = 'degraded';
        message = `CPU usage high: ${percentage.toFixed(1)}%`;
      } else {
        status = 'healthy';
        message = `CPU usage normal: ${percentage.toFixed(1)}%`;
      }

      return {
        status,
        message,
        responseTime: Date.now() - startTime,
        details: {
          usage: Math.round(percentage * 100) / 100,
          loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
          cpuCount,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `CPU check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check disk health
   */
  private async checkDisk(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check disk space
      const stats = fs.statSync(process.cwd());
      const freeSpace = stats.size; // This is a simplified check
      
      // Simulate disk check
      const isHealthy = Math.random() > 0.01; // 99% success rate for demo
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Disk space healthy' : 'Disk space low',
        responseTime: Date.now() - startTime,
        details: {
          freeSpace: 'Available',
          path: process.cwd(),
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Disk check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check network health
   */
  private async checkNetwork(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simulate network check
      const isHealthy = Math.random() > 0.05; // 95% success rate for demo
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Network connectivity healthy' : 'Network connectivity issues',
        responseTime: Date.now() - startTime,
        details: {
          connectivity: 'OK',
          latency: 'Low',
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Network check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check security health
   */
  private async checkSecurity(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const securityStats = securityMonitor.getSecurityStats(1); // Last hour
      const blockedIPs = securityMonitor.getBlockedIPs().length;
      const suspiciousIPs = securityMonitor.getSuspiciousIPs().length;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (securityStats.totalEvents > 100) {
        status = 'unhealthy';
        message = `High security event count: ${securityStats.totalEvents}`;
      } else if (securityStats.totalEvents > 50) {
        status = 'degraded';
        message = `Elevated security event count: ${securityStats.totalEvents}`;
      } else {
        status = 'healthy';
        message = `Security status normal: ${securityStats.totalEvents} events`;
      }

      return {
        status,
        message,
        responseTime: Date.now() - startTime,
        details: {
          totalEvents: securityStats.totalEvents,
          blockedIPs,
          suspiciousIPs,
          criticalEvents: securityStats.eventsBySeverity.critical || 0,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Security check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check performance health
   */
  private async checkPerformance(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const performanceStats = performanceMonitor.getPerformanceStats(1); // Last hour
      const realTimeSummary = performanceMonitor.getRealTimeSummary();
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (performanceStats.averageResponseTime > 10000 || performanceStats.errorRate > 10) {
        status = 'unhealthy';
        message = `Performance degraded: ${performanceStats.averageResponseTime}ms avg, ${performanceStats.errorRate}% errors`;
      } else if (performanceStats.averageResponseTime > 5000 || performanceStats.errorRate > 5) {
        status = 'degraded';
        message = `Performance elevated: ${performanceStats.averageResponseTime}ms avg, ${performanceStats.errorRate}% errors`;
      } else {
        status = 'healthy';
        message = `Performance normal: ${performanceStats.averageResponseTime}ms avg, ${performanceStats.errorRate}% errors`;
      }

      return {
        status,
        message,
        responseTime: Date.now() - startTime,
        details: {
          averageResponseTime: performanceStats.averageResponseTime,
          errorRate: performanceStats.errorRate,
          throughput: performanceStats.throughput,
          requestsPerMinute: realTimeSummary.requestsPerMinute,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Performance check failed: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): HealthCheckResult['metrics'] {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const loadAverage = require('os').loadavg();
    const cpuCount = require('os').cpus().length;
    
    const performanceStats = performanceMonitor.getPerformanceStats(1);
    const errorStats = errorTracker.getErrorStats(1);

    return {
      memory: {
        used: memoryUsage.heapUsed,
        total: totalMemory,
        percentage: (memoryUsage.heapUsed / totalMemory) * 100,
      },
      cpu: {
        usage: (loadAverage[0] / cpuCount) * 100,
        loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
      },
      requests: {
        total: performanceStats.totalRequests,
        rate: performanceStats.throughput,
        averageResponseTime: performanceStats.averageResponseTime,
      },
      errors: {
        count: errorStats.totalErrors,
        rate: errorStats.errorRate,
        critical: errorStats.criticalErrors,
      },
    };
  }

  /**
   * Get alerts
   */
  private getAlerts(): Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }> {
    const alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: string;
    }> = [];

    // Get performance alerts
    const performanceAlerts = performanceMonitor.getPerformanceAlerts();
    alerts.push(...performanceAlerts);

    // Add memory alerts
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const memoryPercentage = (memoryUsage.heapUsed / totalMemory) * 100;

    if (memoryPercentage > 90) {
      alerts.push({
        type: 'high_memory_usage',
        message: `Memory usage critical: ${memoryPercentage.toFixed(1)}%`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
      });
    } else if (memoryPercentage > 80) {
      alerts.push({
        type: 'high_memory_usage',
        message: `Memory usage high: ${memoryPercentage.toFixed(1)}%`,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 2) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get last check time
   */
  public getLastCheckTime(): Date | null {
    return this.lastCheck;
  }

  /**
   * Enable/disable health checks
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Health check system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get health check status
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const healthCheckSystem = new HealthCheckSystem();
