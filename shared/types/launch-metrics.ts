export interface LaunchMetrics {
  overallReadiness: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  systemStatus: {
    database: boolean;
    authentication: boolean;
    payment: boolean;
    ai: boolean;
    storage: boolean;
  };
  performanceMetrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  securityStatus: {
    vulnerabilities: number;
    compliance: boolean;
    encryption: boolean;
  };
  userExperience: {
    onboarding: boolean;
    navigation: boolean;
    mobile: boolean;
  };
}
