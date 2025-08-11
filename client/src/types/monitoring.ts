export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeUsers: number;
  responseTime: number;
  diskUsage: number;
  networkLatency: number;
}

export interface AgentMetrics {
  activeAgents: number;
  avgResponseTime: number;
  successRate: number;
  memoryUsage: number;
  taskCompletion: number;
  errorRate: number;
}

export interface GrafanaResponse {
  data: AgentMetrics;
  loading: boolean;
  error?: Error;
}