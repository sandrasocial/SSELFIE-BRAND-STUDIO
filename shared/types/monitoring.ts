export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
    usage: number;
    loadAverage: number[];
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  cpu: {
    used: number;
    total: number;
    percentage: number;
    usage: number;
    cores: number;
    loadAverage: number[];
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
    errors: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
}

export interface MonitoringSystem {
  enabled: boolean;
  running: boolean;
  metrics: {
    memory: number;
    cpu: number;
  };
  systems: {
    monitoring: boolean;
    performance: boolean;
    errors: boolean;
    security: boolean;
    health: boolean;
    dashboard: boolean;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency: number;
  }>;
  issues: Array<{
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low' | 'critical';
    timestamp: string;
  }>;
}

export interface PerformanceStats {
  averageResponseTime?: number;
  errorRate: number;
  throughput: number;
  latencyP95?: number;
  concurrentRequests?: number;
}

export interface ErrorStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  trends: {
    daily: number[];
    weekly: number[];
  };
}

export interface SecurityStats {
  totalEvents: number;
  blockedRequests: number;
  riskScoreDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentThreats?: string[];
  lastScan?: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  lastUpdated: Date;
}