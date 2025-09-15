/**
 * Structured Logger
 * Enhanced logging with structured data and multiple outputs
 */

import { Logger } from './logger';

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
    this.fs = require('fs');
    this.path = logPath;
  }

  write(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    this.fs.appendFileSync(this.path, logLine);
  }
}

export class StructuredLogger {
  private outputs: LogOutput[];
  private service: string;
  private requestId?: string;
  private userId?: string;

  constructor(service: string, outputs: LogOutput[] = []) {
    this.service = service;
    this.outputs = outputs.length > 0 ? outputs : [new ConsoleLogOutput()];
  }

  setContext(requestId?: string, userId?: string): void {
    this.requestId = requestId;
    this.userId = userId;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
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
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      requestId: this.requestId,
      userId: this.userId,
      metadata
    };

    this.outputs.forEach(output => {
      try {
        output.write(entry);
      } catch (error) {
        console.error('Failed to write log entry:', error);
      }
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

// Export factory function
export function createStructuredLogger(service: string, outputs?: LogOutput[]): StructuredLogger {
  return new StructuredLogger(service, outputs);
}