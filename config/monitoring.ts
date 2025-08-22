import { MonitoringConfig } from '../types/monitoring';

export const monitoringConfig: MonitoringConfig = {
  errorTracking: {
    enabled: true,
    criticalAlertThreshold: 5, // Alert after 5 critical errors within timeWindow
    timeWindow: 300000, // 5 minutes in milliseconds
    modules: {
      gallery: {
        enabled: true,
        errorTypes: ['runtime', 'network', 'resource'],
      },
      train: {
        enabled: true,
        errorTypes: ['runtime', 'model', 'processing'],
      }
    },
    alertChannels: ['email', 'slack'],
  },
  responsiveAnalytics: {
    enabled: true,
    breakpoints: {
      mobile: 320,
      tablet: 768,
      desktop: 1024,
      wide: 1440
    },
    tracking: {
      deviceTypes: true,
      screenSizes: true,
      orientations: true,
      interactions: true,
    },
    reportingInterval: 86400000, // Daily in milliseconds
    retentionPeriod: 2592000000, // 30 days in milliseconds
  },
  dashboards: {
    errorRate: {
      refreshInterval: 300000, // 5 minutes
      metrics: ['count', 'impactedUsers', 'errorType', 'module'],
    },
    responsivePerformance: {
      refreshInterval: 900000, // 15 minutes
      metrics: ['deviceType', 'breakpoint', 'successRate', 'viewportSize'],
    }
  }
};