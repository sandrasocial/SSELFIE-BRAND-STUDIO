export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxFileSize: number;
  maxFiles: number;
  enableRequestLogging: boolean;
  enableErrorLogging: boolean;
  enablePerformanceLogging: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface StructuredLoggerConfig {
  service: string;
  requestId?: string;
  userId?: string;
}

export interface LogContext {
  service?: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface ErrorLogEntry extends LogEntry {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface RequestLogEntry extends LogEntry {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  duration: number;
}