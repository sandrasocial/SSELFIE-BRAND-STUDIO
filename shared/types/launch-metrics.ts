export interface LaunchMetrics {
  systemStatus: string;
  performanceScore: number;
  securityStatus: string;
  lastChecked: string;
  criticalChecks: {
    database: boolean;
    api: boolean;
    security: boolean;
    performance: boolean;
  };
}
