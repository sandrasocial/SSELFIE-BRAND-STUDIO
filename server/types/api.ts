// Common type for HTTP request context
export interface RequestContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
}

// Common API response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Performance metrics
export interface PerformanceMetric {
  timestamp: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  success: boolean;
  metadata?: Record<string, any>;
}

// Service response with optional fields
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Log entry with optional metadata
export interface LogEntry {
  timestamp: string;
  level: 'error' | 'debug' | 'info' | 'warn';
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Security event interface with optional properties
export interface SecurityEvent {
  eventId: string;
  timestamp: string;
  environment: string;
  version: string;
  details: {
    endpoint?: string;
    method?: string;
    requestBody?: any;
    queryParams?: any;
    headers?: any;
    responseCode?: number;
    attackVector?: string;
    payload?: string;
  };
}

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  headers?: boolean;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  content: string;
  role: string;
  timestamp: Date;
  context?: string;
}

// Configuration manager interface
export interface ConfigValue<T = any> {
  value: T;
  isSecret?: boolean;
  isRequired?: boolean;
  category?: string;
}

// Performance statistics interface
export interface PerformanceStats {
  totalRequests?: number;
  throughput?: number;
  averageResponseTime?: number;
  errorRate?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

// Real-time monitoring summary
export interface RealTimeSummary {
  requestsPerMinute?: number;
  averageResponseTime?: number;
  errorRate?: number;
  activeUsers?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}