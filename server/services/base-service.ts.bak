/**
 * Base Service Class
 * Provides common functionality for all service classes
 */

import { storage } from '../storage';

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
  protected validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data.trim();
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
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
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const serviceName = this.constructor.name;
    
    console[level](`[${timestamp}] ${serviceName}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Handle service errors
   */
  protected handleError(error: any, operation: string): never {
    this.log('error', `Error in ${operation}`, { error: error.message, stack: error.stack });
    throw error;
  }
}
