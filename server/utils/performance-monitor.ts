/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics
 */

import { Logger, LogLevel } from './logger';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface PerformanceThresholds {
  warning: number; // ms
  error: number; // ms
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThresholds> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // Set performance thresholds for operations
  setThreshold(operation: string, thresholds: PerformanceThresholds): void {
    this.thresholds.set(operation, thresholds);
  }

  // Start timing an operation
  startTiming(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  // Record a performance metric
  recordMetric(operation: string, duration: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      context
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);
  }

  // Check if metric exceeds thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const thresholds = this.thresholds.get(metric.operation);
    if (!thresholds) return;

    if (metric.duration >= thresholds.error) {
      this.logger.error(`Performance error: ${metric.operation} took ${metric.duration}ms`, {
        operation: metric.operation,
        duration: metric.duration,
        threshold: thresholds.error,
        context: metric.context
      });
    } else if (metric.duration >= thresholds.warning) {
      this.logger.warn(`Performance warning: ${metric.operation} took ${metric.duration}ms`, {
        operation: metric.operation,
        duration: metric.duration,
        threshold: thresholds.warning,
        context: metric.context
      });
    }
  }

  // Get metrics for a specific operation
  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  // Get performance statistics
  getStats(operation?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(operation);
    
    if (metrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const average = durations.reduce((sum, d) => sum + d, 0) / count;
    const min = durations[0];
    const max = durations[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);
    const p95 = durations[p95Index];
    const p99 = durations[p99Index];

    return { count, average, min, max, p95, p99 };
  }

  // Clear old metrics (keep last N)
  clearOldMetrics(keepLast: number = 1000): void {
    if (this.metrics.length > keepLast) {
      this.metrics = this.metrics.slice(-keepLast);
    }
  }

  // Get health status based on recent performance
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    metrics: Record<string, any>;
  } {
    const issues: string[] = [];
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const operations = [...new Set(recentMetrics.map(m => m.operation))];
    const metrics: Record<string, any> = {};

    for (const operation of operations) {
      const operationMetrics = recentMetrics.filter(m => m.operation === operation);
      const stats = this.getStats(operation);
      metrics[operation] = stats;

      const thresholds = this.thresholds.get(operation);
      if (thresholds) {
        if (stats.average > thresholds.error) {
          issues.push(`${operation} average performance exceeds error threshold`);
        } else if (stats.average > thresholds.warning) {
          issues.push(`${operation} average performance exceeds warning threshold`);
        }
      }
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.some(issue => issue.includes('error threshold'))) {
      status = 'unhealthy';
    } else if (issues.length > 0) {
      status = 'degraded';
    }

    return { status, issues, metrics };
  }
}

// Create global performance monitor
export const performanceMonitor = new PerformanceMonitor(new Logger('Performance'));

// Set default thresholds
performanceMonitor.setThreshold('database_query', { warning: 100, error: 500 });
performanceMonitor.setThreshold('api_request', { warning: 200, error: 1000 });
performanceMonitor.setThreshold('ai_generation', { warning: 5000, error: 30000 });
performanceMonitor.setThreshold('file_upload', { warning: 1000, error: 5000 });

// Performance decorator for methods
export function measurePerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(operation);
      try {
        const result = await method.apply(this, args);
        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    };
  };
}
