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

export interface SecurityStats {
  totalEvents: number;
  blockedRequests: number;
  riskScoreDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}