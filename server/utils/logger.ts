/**
 * Structured Logging Utility
 * Provides consistent logging across the application
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  service?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export class Logger {
  private service: string;
  private context: LogContext;

  constructor(service: string, context: LogContext = {}) {
    this.service = service;
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(this.context).length > 0 
      ? ` [${Object.entries(this.context).map(([k, v]) => `${k}=${v}`).join(', ')}]`
      : '';
    
    return `[${timestamp}] ${level.toUpperCase()} ${this.service}: ${message}${contextStr}${data ? ` ${JSON.stringify(data, null, 2)}` : ''}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  // Create a child logger with additional context
  child(additionalContext: LogContext): Logger {
    return new Logger(this.service, { ...this.context, ...additionalContext });
  }

  // Performance logging
  time(label: string): void {
    console.time(`[${this.service}] ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`[${this.service}] ${label}`);
  }
}

// Create default logger instances
export const logger = new Logger('App');
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');
export const aiLogger = new Logger('AI');

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  
  const startTime = Date.now();
  
  const childLogger = apiLogger.child({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  childLogger.info('Request started');

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    childLogger.info('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

// Error logging utility
export const logError = (error: Error, context: LogContext = {}) => {
  const errorLogger = logger.child(context);
  errorLogger.error('Unhandled error', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
};