/**
 * Base Service Class
 * Provides common functionality for all service classes
 */

import { storage } from '../storage.js';

export abstract class BaseService {
  protected storage = storage;

  /**
   * Generate a unique ID
   */
  protected generateId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(data: unknown): unknown {
    if (typeof data === 'string') {
      return data.trim();
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return data;
  }

  /**
   * Log service operations
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const serviceName = this.constructor.name;

    console[level](`[${timestamp}] ${serviceName}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Handle service errors
   */
  protected handleError(error: unknown, operation: string): never {
    this.log('error', `Error in ${operation}`, { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}