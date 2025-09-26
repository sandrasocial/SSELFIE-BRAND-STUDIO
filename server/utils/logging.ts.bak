/**
 * Comprehensive Logging System
 * Structured logging with different levels and outputs
 */

import { Logger } from './logger';
import { structuredLogger } from './structured-logger';

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

export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  filePath?: string;
  remoteEndpoint?: string;
  maxFileSize: number; // in MB
  maxFiles: number;
  enableRequestLogging: boolean;
  enableErrorLogging: boolean;
  enablePerformanceLogging: boolean;
}

export class LoggingSystem {
  private logger: Logger;
  private isEnabled: boolean;
  private config: LogConfig;

  constructor() {
    this.logger = new Logger('LoggingSystem');
    this.isEnabled = true;
    this.config = {
      level: (process.env.LOG_LEVEL as any) || 'info',
      enableConsole: true,
      enableFile: process.env.NODE_ENV === 'production',
      enableRemote: !!process.env.LOG_REMOTE_ENDPOINT,
      remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT,
      maxFileSize: 10,
      maxFiles: 5,
      enableRequestLogging: true,
      enableErrorLogging: true,
      enablePerformanceLogging: true,
    };
  }

  /**
   * Initialize logging system
   */
  public async initialize(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn('Logging system is disabled');
      return;
    }

    this.logger.info('Initializing logging system...');

    try {
      // Configure structured logger
      structuredLogger.updateConfig(this.config);

      this.logger.info('Logging system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize logging system', { error: error.message });
      throw error;
    }
  }

  /**
   * Log message
   */
  public log(
    level: LogEntry['level'],
    message: string,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }

    structuredLogger.log(level, message, context);
  }

  /**
   * Log debug message
   */
  public debug(message: string, context?: Partial<LogEntry>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Partial<LogEntry>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Partial<LogEntry>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  public error(message: string, context?: Partial<LogEntry>): void {
    this.log('error', message, context);
  }

  /**
   * Log fatal message
   */
  public fatal(message: string, context?: Partial<LogEntry>): void {
    this.log('fatal', message, context);
  }

  /**
   * Log HTTP request
   */
  public logRequest(req: any, res: any, responseTime?: number): void {
    if (!this.isEnabled || !this.config.enableRequestLogging) {
      return;
    }

    structuredLogger.logRequest(req, res, responseTime);
  }

  /**
   * Log error with context
   */
  public logError(error: Error, context: Partial<LogEntry> = {}): void {
    if (!this.isEnabled || !this.config.enableErrorLogging) {
      return;
    }

    structuredLogger.logError(error, context);
  }

  /**
   * Log performance metrics
   */
  public logPerformance(
    operation: string,
    duration: number,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled || !this.config.enablePerformanceLogging) {
      return;
    }

    structuredLogger.logPerformance(operation, duration, context);
  }

  /**
   * Log database operation
   */
  public logDatabase(
    operation: string,
    table: string,
    duration: number,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }

    structuredLogger.logDatabase(operation, table, duration, context);
  }

  /**
   * Log external API call
   */
  public logExternalApi(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }

    structuredLogger.logExternalApi(service, endpoint, method, statusCode, duration, context);
  }

  /**
   * Log authentication event
   */
  public logAuth(
    event: 'login' | 'logout' | 'register' | 'password_reset' | 'token_refresh',
    userId: string,
    success: boolean,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }

    structuredLogger.logAuth(event, userId, success, context);
  }

  /**
   * Log business logic event
   */
  public logBusiness(
    event: string,
    entity: string,
    entityId: string,
    action: string,
    context: Partial<LogEntry> = {}
  ): void {
    if (!this.isEnabled) {
      return;
    }

    structuredLogger.logBusiness(event, entity, entityId, action, context);
  }

  /**
   * Get logging configuration
   */
  public getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * Update logging configuration
   */
  public updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
    structuredLogger.updateConfig(this.config);
    this.logger.info('Logging configuration updated', { config: this.config });
  }

  /**
   * Create child logger with additional context
   */
  public child(additionalContext: Partial<LogEntry>): LoggingSystem {
    const childLogger = new LoggingSystem();
    childLogger.log = (level, message, context) => {
      this.log(level, message, { ...additionalContext, ...context });
    };
    return childLogger;
  }

  /**
   * Enable/disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    structuredLogger.setEnabled(enabled);
    this.logger.info(`Logging system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if logging is enabled
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const loggingSystem = new LoggingSystem();
