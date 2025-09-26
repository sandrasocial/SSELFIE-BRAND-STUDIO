/**
 * Performance Monitor
 * Real-time performance monitoring and metrics collection
 */

import { Logger } from './logger';

export interface PerformanceMetric {
  timestamp: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  success: boolean;
  responseTime?: number; // ms, for compatibility with stats calculations
  errorRate?: number; // for compatibility with stats calculations
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  // Existing fields
  operation?: string;
  totalCalls?: number;
  successRate?: number;
  averageDuration?: number;
  minDuration?: number;
  maxDuration?: number;
  p95Duration?: number;
  p99Duration?: number;
  averageMemoryUsage?: number;
  averageCpuUsage?: number;

  // Added for dashboard/health-check compatibility
  averageResponseTime?: number;
  maxResponseTime?: number;
  minResponseTime?: number;
  errorRate?: number;
  throughput?: number;
  totalRequests?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  p95?: number;
  p99?: number;
  slowestEndpoints?: any;
  activeUsers?: number;
}

export class PerformanceMonitor {
  private logger: Logger;
  private metrics: PerformanceMetric[];
  private maxMetrics: number;
  private enabled: boolean;

  constructor(maxMetrics: number = 10000) {
    this.logger = new Logger('PerformanceMonitor');
    this.metrics = [];
    this.maxMetrics = maxMetrics;
    this.enabled = true;
  }

  /**
   * Start timing an operation
   */
  startTiming(operation: string): () => void {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();

    return (success: boolean = true, metadata?: Record<string, any>) => {
      if (!this.isEnabled) return;

      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage();

      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryUsage = endMemory.heapUsed - startMemory.heapUsed;
      const cpuUsage = (endCpu.user + endCpu.system) / 1000000; // Convert to seconds

      const metric: PerformanceMetric = {
        timestamp: new Date().toISOString(),
        operation,
        duration,
        memoryUsage,
        cpuUsage,
        success,
        metadata
      };

      this.addMetric(metric);
    };
  }

  /**
   * Add a performance metric
   */
  addMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 5000) { // 5 seconds
      this.logger.warn(`Slow operation detected: ${metric.operation} took ${metric.duration}ms`);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string, timeWindow?: number): PerformanceStats | null {
    let relevantMetrics = this.metrics.filter(m => m.operation === operation);

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantMetrics = relevantMetrics.filter(m => 
        new Date(m.timestamp).getTime() > cutoff
      );
    }

    if (relevantMetrics.length === 0) {
      return null;
    }

    const durations = relevantMetrics.map(m => m.duration);
    const memoryUsages = relevantMetrics.map(m => m.memoryUsage);
    const cpuUsages = relevantMetrics.map(m => m.cpuUsage);

    durations.sort((a, b) => a - b);

    const totalCalls = relevantMetrics.length;
    const successCount = relevantMetrics.filter(m => m.success).length;
    const successRate = (successCount / totalCalls) * 100;

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = durations[0];
    const maxDuration = durations[durations.length - 1];
    const p95Duration = durations[Math.floor(durations.length * 0.95)];
    const p99Duration = durations[Math.floor(durations.length * 0.99)];

    const averageMemoryUsage = memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length;
    const averageCpuUsage = cpuUsages.reduce((sum, c) => sum + c, 0) / cpuUsages.length;

    return {
      operation,
      totalCalls,
      successRate,
      averageDuration,
      minDuration,
      maxDuration,
      p95Duration,
      p99Duration,
      averageMemoryUsage,
      averageCpuUsage
    };
  }

  /**
   * Get performance statistics for all operations
   */
  getAllStats(timeWindow?: number): PerformanceStats[] {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    return operations
      .map(op => this.getStats(op, timeWindow))
      .filter((stats): stats is PerformanceStats => stats !== null)
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }

  /**
   * Get system performance summary
   */
  getSystemSummary(): {
    totalOperations: number;
    averageResponseTime: number;
    successRate: number;
    memoryUsage: {
      current: number;
      average: number;
      peak: number;
    };
    cpuUsage: {
      current: number;
      average: number;
    };
    slowOperations: Array<{
      operation: string;
      count: number;
      averageDuration: number;
    }>;
  } {
    const totalOperations = this.metrics.length;
    const successfulOperations = this.metrics.filter(m => m.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    const durations = this.metrics.map(m => m.duration);
    const averageResponseTime = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const memoryUsages = this.metrics.map(m => m.memoryUsage);
    const currentMemory = process.memoryUsage().heapUsed;
    const averageMemory = memoryUsages.length > 0 
      ? memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length 
      : 0;
    const peakMemory = Math.max(...memoryUsages, currentMemory);

    const cpuUsages = this.metrics.map(m => m.cpuUsage);
    const currentCpu = process.cpuUsage();
    const averageCpu = cpuUsages.length > 0 
      ? cpuUsages.reduce((sum, c) => sum + c, 0) / cpuUsages.length 
      : 0;

    // Find slow operations
    const operationStats = this.getAllStats();
    const slowOperations = operationStats
      .filter(stats => stats.averageDuration > 1000) // > 1 second
      .map(stats => ({
        operation: stats.operation,
        count: stats.totalCalls,
        averageDuration: stats.averageDuration
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10);

    return {
      totalOperations,
      averageResponseTime,
      successRate,
      memoryUsage: {
        current: currentMemory,
        average: averageMemory,
        peak: peakMemory
      },
      cpuUsage: {
        current: (currentCpu.user + currentCpu.system) / 1000000,
        average: averageCpu
      },
      slowOperations
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
    
    const removedCount = initialLength - this.metrics.length;
    if (removedCount > 0) {
      this.logger.info(`Cleared ${removedCount} old performance metrics`);
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
  this.enabled = enabled;
    this.logger.info(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current metrics count
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Get performance statistics for a given duration (in hours)
   */
  getPerformanceStats(hours: number = 1): PerformanceStats {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    if (relevantMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        errorRate: 0,
        throughput: 0,
        totalRequests: 0,
      };
    }

    const totalResponseTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const totalCpuUsage = relevantMetrics.reduce((sum, m) => sum + m.cpuUsage, 0);
    const totalMemoryUsage = relevantMetrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalErrorRate = relevantMetrics.reduce((sum, m) => sum + m.errorRate, 0);

    const averageResponseTime = totalResponseTime / relevantMetrics.length;
    const averageCpuUsage = totalCpuUsage / relevantMetrics.length;
    const averageMemoryUsage = totalMemoryUsage / relevantMetrics.length;
    const errorRate = totalErrorRate / relevantMetrics.length;

    const maxResponseTime = Math.max(...relevantMetrics.map(m => m.responseTime));
    const minResponseTime = Math.min(...relevantMetrics.map(m => m.responseTime));

    // Calculate throughput based on the duration
    const durationInSeconds = (Date.now() - new Date(relevantMetrics[0].timestamp).getTime()) / 1000;
    const throughput = relevantMetrics.length / (durationInSeconds / 3600); // requests per hour

    return {
      averageResponseTime,
      maxResponseTime,
      minResponseTime,
      averageCpuUsage,
      averageMemoryUsage,
      errorRate,
      throughput,
      totalRequests: relevantMetrics.length,
    };
  }

  /**
   * Get real-time summary of current performance
   */
  getRealTimeSummary(): PerformanceStats {
    return this.getPerformanceStats(1); // Last hour
  }

  /**
   * Get performance alerts based on thresholds
   */
  getPerformanceAlerts(): string[] {
    const alerts: string[] = [];
    const stats = this.getPerformanceStats(1);

    if (stats.averageResponseTime > 2000) {
      alerts.push('High response time detected');
    }
    if (stats.errorRate > 5) {
      alerts.push('High error rate detected');
    }
    if (stats.averageCpuUsage > 80) {
      alerts.push('High CPU usage detected');
    }
    if (stats.averageMemoryUsage > 1000) {
      alerts.push('High memory usage detected');
    }

    return alerts;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();