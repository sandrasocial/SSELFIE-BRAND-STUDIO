/**
 * Monitoring Configuration for Production Readiness
 * Sets up Sentry, performance monitoring, and logging
 */

import type { Request, Response, NextFunction } from 'express';

interface MonitoringConfig {
  sentry: {
    dsn?: string;
    environment: string;
    debug: boolean;
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
  analytics: {
    enabled: boolean;
    id?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    structured: boolean;
    includeStackTrace: boolean;
  };
  performance: {
    enabled: boolean;
    slowRequestThreshold: number; // in milliseconds
    memoryThreshold: number; // percentage
  };
  alerts: {
    enabled: boolean;
    webhookUrl?: string;
    channels: string[];
  };
}

const config: MonitoringConfig = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env['NODE_ENV'] || 'development',
    debug: process.env['NODE_ENV'] === 'development',
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
  },
  analytics: {
    enabled: process.env['NODE_ENV'] === 'production',
    id: process.env.ANALYTICS_ID,
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    structured: true,
    includeStackTrace: process.env['NODE_ENV'] !== 'production',
  },
  performance: {
    enabled: true,
    slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '1000', 10),
    memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || '80', 10),
  },
  alerts: {
    enabled: process.env['NODE_ENV'] === 'production',
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
    channels: (process.env.ALERT_CHANNELS || '').split(',').filter(Boolean),
  },
};

// Sentry-like error tracking interface
interface ErrorContext {
  user?: { id: string; email?: string };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'error' | 'warning' | 'info' | 'debug';
}

class ErrorTracker {
  private config: MonitoringConfig['sentry'];

  constructor(sentryConfig: MonitoringConfig['sentry']) {
    this.config = sentryConfig;
  }

  captureException(error: Error, context?: ErrorContext) {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
    };

    // In production, this would send to Sentry
    if (this.config.debug) {
      console.error('🚨 Error captured:', logData);
    }

    // Log to structured format
    this.logStructured('error', 'Exception captured', logData);
  }

  captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', context?: ErrorContext) {
    const logData = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
    };

    this.logStructured(level, message, logData);
  }

  private logStructured(level: string, message: string, data: Record<string, unknown>) {
    const logEntry = {
      level,
      message,
      ...data,
    };

    switch (level) {
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
      case 'warning':
        console.warn(JSON.stringify(logEntry));
        break;
      case 'debug':
        if (this.config.debug) {
          console.debug(JSON.stringify(logEntry));
        }
        break;
      default:
    }
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
    if (this.config.debug) {
    }
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (this.config.debug) {
    }
  }

  setTag(key: string, value: string) {
    if (this.config.debug) {
    }
  }

  setExtra(key: string, value: unknown) {
    if (this.config.debug) {
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  private config: MonitoringConfig['performance'];
  private metrics: Map<string, { count: number; totalTime: number; maxTime: number }> = new Map();

  constructor(performanceConfig: MonitoringConfig['performance']) {
    this.config = performanceConfig;
  }

  startTransaction(name: string, op: string = 'request') {
    const startTime = Date.now();
    
    return {
      setName: (newName: string) => name = newName,
      setTag: (key: string, value: string) => {
        if (config.sentry.debug) {
        }
      },
      setData: (key: string, value: unknown) => {
        if (config.sentry.debug) {
        }
      },
      finish: () => {
        const duration = Date.now() - startTime;
        this.recordMetric(name, duration);
        
        if (duration > this.config.slowRequestThreshold) {
          errorTracker.captureMessage(
            `Slow ${op}: ${name}`,
            'warning',
            { extra: { duration, threshold: this.config.slowRequestThreshold } }
          );
        }

        return { duration };
      }
    };
  }

  private recordMetric(name: string, duration: number) {
    const existing = this.metrics.get(name) || { count: 0, totalTime: 0, maxTime: 0 };
    
    this.metrics.set(name, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      maxTime: Math.max(existing.maxTime, duration)
    });
  }

  getMetrics() {
    const metrics: Record<string, {
      count: number;
      avgTime: number;
      maxTime: number;
      totalTime: number;
    }> = {};
    
    this.metrics.forEach((data, name) => {
      metrics[name] = {
        count: data.count,
        avgTime: Math.round(data.totalTime / data.count),
        maxTime: data.maxTime,
        totalTime: data.totalTime
      };
    });

    return {
      requests: metrics,
      memory: this.getMemoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  private getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const percentage = Math.round((usedMemory / totalMemory) * 100);

    if (percentage > this.config.memoryThreshold) {
      errorTracker.captureMessage(
        `High memory usage: ${percentage}%`,
        'warning',
        { extra: { memoryUsage, threshold: this.config.memoryThreshold } }
      );
    }

    return {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage,
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
    };
  }
}

// Alert system
class AlertManager {
  private config: MonitoringConfig['alerts'];

  constructor(alertConfig: MonitoringConfig['alerts']) {
    this.config = alertConfig;
  }

  sendAlert(level: 'critical' | 'warning' | 'info', title: string, message: string, context?: Record<string, unknown>) {
    if (!this.config.enabled) {
      return;
    }

    const alert = {
      level,
      title,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: config.sentry.environment
    };

    // Log the alert

    // In production, this would send to webhook/Slack/etc.
    if (this.config.webhookUrl) {
      this.sendWebhookAlert(alert);
    }
  }

  private async sendWebhookAlert(alert: { level: string; title: string; message: string; context?: Record<string, unknown>; timestamp: string; environment: string }) {
    try {
      // In a real implementation, you would make an HTTP request to the webhook
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
}

// Logger with structured logging
class StructuredLogger {
  private config: MonitoringConfig['logging'];

  constructor(loggingConfig: MonitoringConfig['logging']) {
    this.config = loggingConfig;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex <= currentLevelIndex;
  }

  error(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      this.log('error', message, meta);
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      this.log('warn', message, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      this.log('info', message, meta);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      this.log('debug', message, meta);
    }
  }

  private log(level: string, message: string, meta?: Record<string, unknown>) {
    const logEntry: {
      level: string;
      message: string;
      timestamp: string;
      environment: string;
      meta?: Record<string, unknown>;
      stack?: string;
    } = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: config.sentry.environment
    };

    if (meta) {
      logEntry.meta = meta;
    }

    if (this.config.includeStackTrace && level === 'error') {
      logEntry.stack = new Error().stack;
    }

    const output = this.config.structured 
      ? JSON.stringify(logEntry)
      : `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
    }
  }
}

// Initialize monitoring instances
export const errorTracker = new ErrorTracker(config.sentry);
export const performanceMonitor = new PerformanceMonitor(config.performance);
export const alertManager = new AlertManager(config.alerts);
export const logger = new StructuredLogger(config.logging);

// Monitoring middleware for Express
export function monitoringMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const transaction = performanceMonitor.startTransaction(
      `${req.method} ${req.route?.path || req.path}`,
      'http.request'
    );

    // Add request context
    transaction.setTag('method', req.method);
    transaction.setTag('route', req.route?.path || req.path);
    
    if (req.user?.id) {
      errorTracker.setUser({ id: req.user.id, email: req.user.email || undefined });
    }

    // Add breadcrumb
    errorTracker.addBreadcrumb(
      `${req.method} ${req.path}`,
      'http',
      { url: req.originalUrl, method: req.method }
    );

    // Monitor response
    res.on('finish', () => {
      const { duration } = transaction.finish();
      
      // Log request completion
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Alert on errors
      if (res.statusCode >= 500) {
        alertManager.sendAlert(
          'critical',
          `Server Error: ${res.statusCode}`,
          `${req.method} ${req.path} returned ${res.statusCode}`,
          { duration, path: req.path, method: req.method }
        );
      }
    });

    // Handle uncaught errors in middleware
    res.on('error', (error: Error) => {
      errorTracker.captureException(error, {
        tags: { route: req.path, method: req.method },
        extra: { url: req.originalUrl, body: req.body }
      });
    });

    next();
  };
}

// Global error handler
export function globalErrorHandler() {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    errorTracker.captureException(error, {
      tags: { route: req.path, method: req.method },
      extra: { url: req.originalUrl, body: req.body, query: req.query }
    });

    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    alertManager.sendAlert(
      'critical',
      'Unhandled Error',
      error.message,
      { path: req.path, method: req.method, stack: error.stack }
    );

    res.status(500).json({
      error: 'Internal server error',
      requestId: 'unknown'
    });
  };
}

// Health check for monitoring
export function getMonitoringHealth() {
  return {
    sentry: {
      configured: !!config.sentry.dsn,
      environment: config.sentry.environment
    },
    analytics: {
      enabled: config.analytics.enabled,
      configured: !!config.analytics.id
    },
    logging: {
      level: config.logging.level,
      structured: config.logging.structured
    },
    performance: config.performance,
    alerts: {
      enabled: config.alerts.enabled,
      configured: !!config.alerts.webhookUrl
    }
  };
}

// Export configuration and instances
export { config };
export default {
  config,
  errorTracker,
  performanceMonitor,
  alertManager,
  logger,
  middleware: monitoringMiddleware,
  errorHandler: globalErrorHandler,
  health: getMonitoringHealth
};