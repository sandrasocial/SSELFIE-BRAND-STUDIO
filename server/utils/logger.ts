/**
 * Comprehensive Logging System
 * Structured logging with different levels and outputs
 */

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
  environment: string;
  version: string;
}

export class Logger {
  private service: string;
  private enabled: boolean;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  constructor(service: string) {
    this.service = service;
    this.enabled = true;
    this.logLevel = (process.env.LOG_LEVEL as any) || 'info';
  }

  /**
   * Log debug message
   */
  public debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log info message
   */
  public info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Log warning message
   */
  public warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log error message
   */
  public error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  /**
   * Log fatal message
   */
  public fatal(message: string, metadata?: Record<string, any>): void {
    this.log('fatal', message, metadata);
  }

  /**
   * Log message with specified level
   */
  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled || !this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      ...metadata,
    };

    this.outputLog(logEntry);
  }

  /**
   * Check if should log based on level
   */
  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Output log entry
   */
  private outputLog(entry: LogEntry): void {
    const { timestamp, level, message, service, ...rest } = entry;
    
    const logMessage = {
      timestamp,
      level: level.toUpperCase(),
      service,
      message,
      ...rest,
    };

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logMessage, null, 2));
        break;
      case 'info':
        console.info(JSON.stringify(logMessage, null, 2));
        break;
      case 'warn':
        console.warn(JSON.stringify(logMessage, null, 2));
        break;
      case 'error':
      case 'fatal':
        console.error(JSON.stringify(logMessage, null, 2));
        break;
    }
  }

  /**
   * Create child logger with additional context
   */
  public child(additionalContext: Record<string, any>): Logger {
    const childLogger = new Logger(this.service);
    childLogger.log = (level, message, metadata) => {
      this.log(level, message, { ...additionalContext, ...metadata });
    };
    return childLogger;
  }

  /**
   * Set log level
   */
  public setLogLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'): void {
    this.logLevel = level;
  }

  /**
   * Enable/disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export default logger instance
export const logger = new Logger('SSELFIE Studio');