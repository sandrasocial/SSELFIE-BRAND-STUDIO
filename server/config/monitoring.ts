import * as PrometheusClient from 'prom-client';

// Simple console logger replacement
const logger = {
  info: (data: any) => {
    if (typeof data === 'object') {
      console.log(`[INFO] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.log(`[INFO] ${new Date().toISOString()}: ${data}`);
    }
  },
  error: (data: any) => {
    if (typeof data === 'object') {
      console.error(`[ERROR] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.error(`[ERROR] ${new Date().toISOString()}: ${data}`);
    }
  },
  warn: (data: any) => {
    if (typeof data === 'object') {
      console.warn(`[WARN] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.warn(`[WARN] ${new Date().toISOString()}: ${data}`);
    }
  }
};

// Mock Sentry for compatibility
const Sentry = {
  Handlers: {
    requestHandler: () => (req: any, res: any, next: any) => next(),
    errorHandler: () => (err: any, req: any, res: any, next: any) => next(err)
  },
  captureException: (error: any) => {
    logger.error(`Sentry Mock - Exception: ${error.message || error}`);
  }
};

// Initialize Prometheus metrics
const metrics = {
  httpRequestDurationMicroseconds: new PrometheusClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code']
  }),
  
  aiAgentExecutionTime: new PrometheusClient.Histogram({
    name: 'ai_agent_execution_seconds',
    help: 'AI Agent execution time in seconds',
    labelNames: ['agent_name', 'task_type']
  }),

  databaseQueryDuration: new PrometheusClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['query_type']
  }),

  memoryUsage: new PrometheusClient.Gauge({
    name: 'node_memory_usage_bytes',
    help: 'Node.js memory usage in bytes',
  }),

  activeUsers: new PrometheusClient.Gauge({
    name: 'active_users_total',
    help: 'Total number of active users',
  })
};

// Update memory usage every 30 seconds
setInterval(() => {
  metrics.memoryUsage.set(process.memoryUsage().heapUsed);
}, 30000);

export { logger, metrics, Sentry };