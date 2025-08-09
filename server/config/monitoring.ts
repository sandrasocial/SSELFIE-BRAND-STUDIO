import * as Sentry from '@sentry/node';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { client as PrometheusClient } from 'prom-client';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Initialize Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

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