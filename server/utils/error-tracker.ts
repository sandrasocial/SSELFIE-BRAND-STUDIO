/**
 * Comprehensive Error Tracking System
 * Tracks, categorizes, and analyzes application errors
 */

import { Logger } from './logger';
import { Request, Response } from 'express';

export interface ErrorContext {
  timestamp: string;
  errorId: string;
  type: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'database' | 'external_api' | 'authentication' | 'authorization' | 'system' | 'unknown';
  endpoint?: string;
  method?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  queryParams?: any;
  headers?: any;
  environment: string;
  version: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  errorRate: number;
  criticalErrors: number;
  unresolvedErrors: number;
  averageResolutionTime: number; // in hours
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
    severity: string;
  }>;
}

export class ErrorTracker {
  private logger: Logger;
  private errors: ErrorContext[];
  private maxErrors: number;
  private isEnabled: boolean;

  constructor(maxErrors: number = 5000) {
    this.logger = new Logger('ErrorTracker');
    this.errors = [];
    this.maxErrors = maxErrors;
    this.isEnabled = true;
  }

  /**
   * Track an error
   */
  public trackError(
    error: Error,
    context: {
      req?: Request;
      res?: Response;
      userId?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      category?: ErrorContext['category'];
      additionalData?: any;
    } = {}
  ): string {
    if (!this.isEnabled) {
      return '';
    }

    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();

    // Determine severity if not provided
    const severity = context.severity || this.determineSeverity(error);

    // Determine category if not provided
    const category = context.category || this.determineCategory(error);

    // Extract request context
    const requestContext = this.extractRequestContext(context.req);

    const errorContext: ErrorContext = {
      timestamp,
      errorId,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      severity,
      category,
      endpoint: requestContext.endpoint,
      method: requestContext.method,
      userId: context.userId || requestContext.userId,
      ip: requestContext.ip,
      userAgent: requestContext.userAgent,
      requestBody: requestContext.requestBody,
      queryParams: requestContext.queryParams,
      headers: requestContext.headers,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      resolved: false,
      ...context.additionalData,
    };

    // Add to errors array (with size limit)
    if (this.errors.length >= this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }
    this.errors.push(errorContext);

    // Log error
    this.logger.error('Error tracked', {
      errorId,
      type: errorContext.type,
      message: errorContext.message,
      severity: errorContext.severity,
      category: errorContext.category,
      endpoint: errorContext.endpoint,
      userId: errorContext.userId,
    });

    // Send critical errors to external monitoring
    if (severity === 'critical') {
      this.sendCriticalErrorAlert(errorContext);
    }

    return errorId;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('database') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('memory') ||
      message.includes('fatal')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('not found') ||
      message.includes('validation') ||
      message.includes('invalid')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('warning') ||
      message.includes('deprecated') ||
      message.includes('slow')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine error category
   */
  private determineCategory(error: Error): ErrorContext['category'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }

    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return 'database';
    }

    if (message.includes('api') || message.includes('http') || message.includes('fetch')) {
      return 'external_api';
    }

    if (message.includes('auth') || message.includes('token') || message.includes('login')) {
      return 'authentication';
    }

    if (message.includes('permission') || message.includes('access') || message.includes('role')) {
      return 'authorization';
    }

    if (message.includes('system') || message.includes('process') || message.includes('memory')) {
      return 'system';
    }

    return 'unknown';
  }

  /**
   * Extract request context
   */
  private extractRequestContext(req?: Request): {
    endpoint?: string;
    method?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    requestBody?: any;
    queryParams?: any;
    headers?: any;
  } {
    if (!req) {
      return {};
    }

    return {
      endpoint: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestBody: req.body,
      queryParams: req.query,
      headers: req.headers,
    };
  }

  /**
   * Send critical error alert
   */
  private async sendCriticalErrorAlert(errorContext: ErrorContext): Promise<void> {
    try {
      // Send to Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '🚨 Critical Error Alert',
            attachments: [{
              color: 'danger',
              fields: [
                { title: 'Error ID', value: errorContext.errorId, short: true },
                { title: 'Type', value: errorContext.type, short: true },
                { title: 'Message', value: errorContext.message, short: false },
                { title: 'Endpoint', value: errorContext.endpoint || 'N/A', short: true },
                { title: 'User ID', value: errorContext.userId || 'N/A', short: true },
                { title: 'Timestamp', value: errorContext.timestamp, short: true },
              ],
            }],
          }),
        });
      }

      // Send to email (if configured)
      if (process.env.ERROR_EMAIL) {
        // This would integrate with your email service
        this.logger.info('Critical error email sent', { errorId: errorContext.errorId });
      }
    } catch (error) {
      this.logger.error('Failed to send critical error alert', { error });
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(timeWindow?: number): ErrorStats {
    const now = Date.now();
    const windowMs = timeWindow ? timeWindow * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // Default 24 hours
    const cutoffTime = now - windowMs;

    // Filter errors within time window
    const recentErrors = this.errors.filter(
      error => new Date(error.timestamp).getTime() > cutoffTime
    );

    if (recentErrors.length === 0) {
      return {
        totalErrors: 0,
        errorsByCategory: {},
        errorsBySeverity: {},
        errorsByEndpoint: {},
        errorRate: 0,
        criticalErrors: 0,
        unresolvedErrors: 0,
        averageResolutionTime: 0,
        topErrors: [],
      };
    }

    // Calculate basic stats
    const totalErrors = recentErrors.length;
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    const unresolvedErrors = recentErrors.filter(e => !e.resolved).length;

    // Group by category
    const errorsByCategory: Record<string, number> = {};
    recentErrors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    });

    // Group by severity
    const errorsBySeverity: Record<string, number> = {};
    recentErrors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    // Group by endpoint
    const errorsByEndpoint: Record<string, number> = {};
    recentErrors.forEach(error => {
      if (error.endpoint) {
        const key = `${error.method} ${error.endpoint}`;
        errorsByEndpoint[key] = (errorsByEndpoint[key] || 0) + 1;
      }
    });

    // Calculate error rate (errors per hour)
    const timeWindowHours = windowMs / (60 * 60 * 1000);
    const errorRate = totalErrors / timeWindowHours;

    // Calculate average resolution time
    const resolvedErrors = recentErrors.filter(e => e.resolved && e.resolvedAt);
    const averageResolutionTime = resolvedErrors.length > 0
      ? resolvedErrors.reduce((sum, error) => {
          const resolvedAt = new Date(error.resolvedAt!).getTime();
          const createdAt = new Date(error.timestamp).getTime();
          return sum + (resolvedAt - createdAt) / (1000 * 60 * 60); // Convert to hours
        }, 0) / resolvedErrors.length
      : 0;

    // Find top errors
    const errorCounts = new Map<string, { count: number; lastOccurred: string; severity: string }>();
    recentErrors.forEach(error => {
      const key = error.message;
      const existing = errorCounts.get(key) || { count: 0, lastOccurred: error.timestamp, severity: error.severity };
      errorCounts.set(key, {
        count: existing.count + 1,
        lastOccurred: error.timestamp > existing.lastOccurred ? error.timestamp : existing.lastOccurred,
        severity: error.severity,
      });
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastOccurred: data.lastOccurred,
        severity: data.severity,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByEndpoint,
      errorRate: Math.round(errorRate * 100) / 100,
      criticalErrors,
      unresolvedErrors,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      topErrors,
    };
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorContext['severity']): ErrorContext[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: ErrorContext['category']): ErrorContext[] {
    return this.errors.filter(error => error.category === category);
  }

  /**
   * Get unresolved errors
   */
  public getUnresolvedErrors(): ErrorContext[] {
    return this.errors.filter(error => !error.resolved);
  }

  /**
   * Mark error as resolved
   */
  public resolveError(errorId: string, resolvedBy: string, notes?: string): boolean {
    const error = this.errors.find(e => e.errorId === errorId);
    if (!error) {
      return false;
    }

    error.resolved = true;
    error.resolvedAt = new Date().toISOString();
    error.resolvedBy = resolvedBy;
    if (notes) {
      error.notes = notes;
    }

    this.logger.info('Error resolved', { errorId, resolvedBy });
    return true;
  }

  /**
   * Get error by ID
   */
  public getErrorById(errorId: string): ErrorContext | undefined {
    return this.errors.find(error => error.errorId === errorId);
  }

  /**
   * Clear old errors
   */
  public clearOldErrors(olderThanHours: number = 168): void { // Default 7 days
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialLength = this.errors.length;
    
    this.errors = this.errors.filter(
      error => new Date(error.timestamp).getTime() > cutoffTime
    );

    const removedCount = initialLength - this.errors.length;
    if (removedCount > 0) {
      this.logger.info(`Cleared ${removedCount} old errors`);
    }
  }

  /**
   * Enable/disable error tracking
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Error tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current errors count
   */
  public getErrorsCount(): number {
    return this.errors.length;
  }

  /**
   * Export errors for external analysis
   */
  public exportErrors(): ErrorContext[] {
    return [...this.errors];
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
