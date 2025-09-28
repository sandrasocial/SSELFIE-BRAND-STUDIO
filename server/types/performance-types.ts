/**
 * Performance Monitor Types
 * Type definitions for performance monitoring and metrics
 */

export interface PerformanceMetric {
  timestamp: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  success: boolean;
  responseTime?: number;
  errorRate?: number;
  metadata?: Record<string, unknown> | undefined;
}

export interface PerformanceData {
  operation: string;
  totalCalls: number;
  successRate: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  averageMemoryUsage: number;
  averageCpuUsage: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface BasePerformanceStats {
  // Core metrics
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  
  // Resource usage
  memoryUsage: number;
  cpuUsage: number;
  
  // Real-time metrics
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface DetailedPerformanceStats extends BasePerformanceStats {
  // Core metrics
  maxResponseTime: number;
  minResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // Operational metrics
  operation?: string;
  totalCalls?: number;
  averageDuration?: number;
  successRate?: number;
  minDuration?: number;
  
  // Extended resource usage
  averageMemoryUsage: number;
  averageCpuUsage: number;
  
  // Extended metrics
  activeUsers: number;
  
  // Analysis
  slowestEndpoints?: Array<{
    endpoint: string;
    averageResponseTime: number;
    totalCalls: number;
  }>;
}

export type PerformanceStats = BasePerformanceStats & Partial<DetailedPerformanceStats>;