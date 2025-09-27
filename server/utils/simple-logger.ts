/**
 * Simple logging utility
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string) {
    this.context = context;
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  info(message: string, data?: Record<string, any>): void {
    console.log(`[${this.context}] INFO: ${message}`, data || '');
  }

  error(message: string, data?: Record<string, any>): void {
    console.error(`[${this.context}] ERROR: ${message}`, data || '');
  }

  warn(message: string, data?: Record<string, any>): void {
    console.warn(`[${this.context}] WARN: ${message}`, data || '');
  }

  debug(message: string, data?: Record<string, any>): void {
    if (this.logLevel === 'debug') {
      console.debug(`[${this.context}] DEBUG: ${message}`, data || '');
    }
  }
}