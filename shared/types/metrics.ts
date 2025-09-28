// Performance metrics types
export interface PerformanceMetrics {
  id?: string;
  userId: string;
  timestamp: string;
  pageLoadTime?: number;
  timeToFirstByte?: number;
  timeToFirstPaint?: number;
  timeToFirstContentfulPaint?: number;
  timeToInteractive?: number;
  domContentLoaded?: number;
  resources?: ResourceMetrics[];
}

export interface ResourceMetrics {
  name: string;
  initiatorType: string;
  duration: number;
  size?: number;
}

export interface AggregatedMetrics {
  userId: string;
  avgPageLoadTime?: number;
  avgTimeToFirstByte?: number;
  avgTimeToFirstPaint?: number;
  avgTimeToFirstContentfulPaint?: number;
  avgTimeToInteractive?: number;
  totalSamples: number;
  updatedAt: string;
}

export interface MetricsPayload {
  metrics: Omit<PerformanceMetrics, 'id' | 'userId' | 'timestamp'>;
  resourceMetrics: ResourceMetrics[];
}