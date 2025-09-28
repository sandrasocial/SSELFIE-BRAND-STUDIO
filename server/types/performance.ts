export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  slowThreshold: number;
  errorThreshold: number;
  collectMemoryMetrics: boolean;
  collectCPUMetrics: boolean;
}

export interface PerformanceMetric {
  timestamp: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalRequests?: number;
  totalErrors?: number;
  totalCalls?: number;
  averageResponseTime?: number;
  p95ResponseTime?: number;
  p99ResponseTime?: number;
  errorRate?: number;
  averageMemoryUsage?: number;
  averageCpuUsage?: number;
  requestsPerMinute?: number;
  lastUpdated?: string;
}

export interface OperationStats extends Partial<PerformanceStats> {
  operationId: string;
  category: string;
}

export interface MonitoringAlertConfig {
  responseTimeThreshold: number;
  errorRateThreshold: number;
  cpuThreshold: number;
  memoryThreshold: number;
}

export interface AlertNotification {
  level: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface RealTimeSummary {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  averageResponseTime?: number;
  errorRate?: number;
  activeUsers?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface HistoricalStats {
  average: number;
  median: number;
  p95: number;
  p99: number;
}

export interface DashboardMetrics {
  requests: {
    total: number;
    rate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  realtime: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  response: {
    average: number;
    median: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
  };
  resources: {
    memory: {
      total: number;
      used: number;
      free: number;
    };
    cpu: {
      usage: number;
      load: number[];
    };
    connections: {
      active: number;
      idle: number;
    };
  };
}