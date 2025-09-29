/**
 * Structured Logger
 * Enhanced logging with structured data and multiple outputs
 */

import { Logger } from './logger.js';
import * as fs from 'fs';

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  filePath?: string;
  remoteEndpoint?: string;
  maxFileSize: number;
  maxFiles: number;
  enableRequestLogging: boolean;
  enableErrorLogging: boolean;
  enablePerformanceLogging: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogOutput {
  write(entry: LogEntry): void;
}

export class ConsoleLogOutput implements LogOutput {
  write(entry: LogEntry): void {
    const logMethod = console[entry.level] || console.log;
    logMethod(JSON.stringify(entry, null, 2));
  }
}

export class FileLogOutput implements LogOutput {
  private fs: any;
  private path: string;

  constructor(logPath: string) {
    this.fs = fs;
    this.path = logPath;
  }

  write(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    this.fs.appendFileSync(this.path, logLine);
  }
}

export class RemoteLogOutput implements LogOutput {
  constructor(private endpoint: string) {}

  async write(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }
}

export class StructuredLogger {
  private baseLogger: Logger;
  private outputs: LogOutput[];
  private requestId?: string;
  private userId?: string;
  private config: LoggerConfig;

  constructor(service: string, outputs: LogOutput[] = []) {
    this.baseLogger = new Logger(service);
    this.outputs = outputs.length > 0 ? outputs : [new ConsoleLogOutput()];
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10,
      maxFiles: 5,
      enableRequestLogging: true,
      enableErrorLogging: true,
      enablePerformanceLogging: true
    };
  }

  setEnabled(enabled: boolean): void {
    this.baseLogger.setEnabled(enabled);
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.reconfigureOutputs();
  }

  setContext(requestId?: string, userId?: string): void {
    this.requestId = requestId || undefined;
    this.userId = userId || undefined;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.config.level !== 'debug') return;
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (!['debug', 'info'].includes(this.config.level)) return;
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (!['debug', 'info', 'warn'].includes(this.config.level)) return;
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (!['debug', 'info', 'warn', 'error'].includes(this.config.level)) return;
    this.log('error', message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: Record<string, any>): void {
    if (!this.baseLogger.isEnabled()) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'StructuredLogger',
      requestId: this.requestId,
      userId: this.userId,
      metadata: metadata || undefined
    };

    // Write to base logger
    this.baseLogger[level](message, metadata);

    // Write to configured outputs
    this.outputs.forEach(output => {
      try {
        output.write(entry);
      } catch (error) {
        console.error('Failed to write log entry:', error);
      }
    });
  }

  private reconfigureOutputs(): void {
    this.outputs = [];
    if (this.config.enableConsole) {
      this.outputs.push(new ConsoleLogOutput());
    }
    if (this.config.enableFile && this.config.filePath) {
      this.outputs.push(new FileLogOutput(this.config.filePath));
    }
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.outputs.push(new RemoteLogOutput(this.config.remoteEndpoint));
    }
  }

  logRequest(req: any, res: any, responseTime?: number): void {
    if (!this.baseLogger.isEnabled() || !this.config?.enableRequestLogging) return;
    this.log('info', 'HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime
    });
  }

  logError(error: Error, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled() || !this.config?.enableErrorLogging) return;
    this.error(error.message, error, context);
  }

  logPerformance(operation: string, duration: number, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled() || !this.config?.enablePerformanceLogging) return;
    this.info(`Performance: ${operation}`, {
      ...context,
      duration,
      operation
    });
  }

  logDatabase(operation: string, table: string, duration: number, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled()) return;
    this.info(`Database: ${operation} on ${table}`, {
      ...context,
      operation,
      table,
      duration
    });
  }

  logExternalApi(service: string, endpoint: string, method: string, statusCode: number, duration: number, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled()) return;
    this.info(`External API: ${service} ${method} ${endpoint}`, {
      ...context,
      service,
      endpoint,
      method,
      statusCode,
      duration
    });
  }

  logAuth(event: string, userId: string, success: boolean, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled()) return;
    const level = success ? 'info' : 'warn';
    this.log(level as 'info' | 'warn', `Auth: ${event}`, {
      ...context,
      event,
      userId,
      success
    });
  }

  logBusiness(event: string, entity: string, entityId: string, action: string, context: Record<string, any> = {}): void {
    if (!this.baseLogger.isEnabled()) return;
    this.info(`Business: ${event} - ${action} ${entity}`, {
      ...context,
      event,
      entity,
      entityId,
      action
    });
  }

  addOutput(output: LogOutput): void {
    this.outputs.push(output);
  }

  removeOutput(output: LogOutput): void {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }
}

export function createStructuredLogger(service: string, outputs?: LogOutput[]): StructuredLogger {
  return new StructuredLogger(service, outputs);
}