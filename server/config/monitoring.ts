import * as prometheus from 'prom-client';

// Initialize Prometheus metrics
prometheus.register.clear();

export const metrics = {
  httpRequestDurationMicroseconds: new prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status']
  }),
  
  activeUsers: new prometheus.Gauge({
    name: 'active_users',
    help: 'Number of currently active users'
  })
};

// Simple logger
export const logger = {
  info: (data: any) => console.log('INFO:', data),
  error: (data: any) => console.error('ERROR:', data),
  warn: (data: any) => console.warn('WARN:', data)
};