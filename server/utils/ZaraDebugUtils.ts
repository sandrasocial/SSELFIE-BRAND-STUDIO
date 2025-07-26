/**
 * ZaraDebugUtils.ts
 * Luxury Debug & Monitoring Utilities for SSELFIE Platform
 * Created: July 2025
 */

import { performance } from 'perf_hooks';

// Performance Monitoring Types
export interface PerformanceMetric {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface DebugContext {
  userId?: string;
  sessionId?: string;
  timestamp: number;
  environment: 'development' | 'staging' | 'production';
}

// Error Types with Luxury Platform Context
export interface EnhancedError extends Error {
  code?: string;
  context?: DebugContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  timestamp: number;
}

// Performance Monitoring
export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static MAX_METRICS = 1000; // Prevent memory leaks

  static startOperation(name: string, metadata?: Record<string, any>): string {
    const operationId = `${name}-${Date.now()}`;
    this.metrics.push({
      operationName: name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      metadata
    });

    // Maintain buffer size
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    return operationId;
  }

  static endOperation(operationId: string): PerformanceMetric | null {
    const metric = this.metrics.find(m => `${m.operationName}-${m.startTime}` === operationId);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric;
    }
    return null;
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Error Handler with Luxury Context
export class LuxuryErrorHandler {
  static createError(
    message: string,
    code: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    component?: string
  ): EnhancedError {
    const error = new Error(message) as EnhancedError;
    error.code = code;
    error.severity = severity;
    error.component = component;
    error.timestamp = Date.now();
    error.context = {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    };
    return error;
  }

  static async handleError(error: EnhancedError): Promise<void> {
    // Log error with context
    console.error({
      message: error.message,
      code: error.code,
      severity: error.severity,
      component: error.component,
      context: error.context,
      stack: error.stack
    });

    // TODO: Add error reporting service integration
    if (error.severity === 'critical') {
      // Implement critical error notification
    }
  }
}

// Debug Context Manager
export class DebugContextManager {
  private static currentContext: DebugContext | null = null;

  static setContext(context: Partial<DebugContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...context,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    };
  }

  static getContext(): DebugContext | null {
    return this.currentContext;
  }

  static clearContext(): void {
    this.currentContext = null;
  }
}

// Performance Thresholds
export const LUXURY_PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: 100, // ms
  DATABASE_QUERY: 50, // ms
  MODEL_INFERENCE: 200, // ms
  IMAGE_PROCESSING: 300, // ms
} as const;

// Debug Utilities
export const debugUtils = {
  isPerformanceIssue: (duration: number, threshold: number): boolean => {
    return duration > threshold;
  },

  formatDuration: (duration: number): string => {
    return duration < 1000 ? `${duration.toFixed(2)}ms` : `${(duration / 1000).toFixed(2)}s`;
  },

  measureAsync: async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }
};