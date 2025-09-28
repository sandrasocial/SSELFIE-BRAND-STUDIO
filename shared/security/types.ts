/**
 * Shared security types and constants
 */

import { z } from 'zod';

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
  keyPrefix: string;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

export interface RateLimitError {
  error: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number;
  limit: number;
  windowMs: number;
}

// Input Validation Types
export type ValidationSchema = z.ZodSchema;

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Security Headers
export interface SecurityHeadersConfig {
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  csp: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
  };
  frameGuard: {
    action: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    domain?: string;
  };
  xssProtection: boolean;
  noSniff: boolean;
}

// Security Event Types
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  severity: SecurityEventSeverity;
  details: Record<string, unknown>;
  userId?: string;
  ip?: string;
}

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  HEADER_VIOLATION = 'HEADER_VIOLATION',
  AUTH_FAILURE = 'AUTH_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Feature Flags
export const securityFlags = {
  USE_RATE_LIMITING: 'security.rateLimiting.enabled',
  USE_INPUT_VALIDATION: 'security.inputValidation.enabled',
  USE_SECURITY_HEADERS: 'security.headers.enabled',
  USE_SECURITY_MONITORING: 'security.monitoring.enabled'
} as const;

// Default Configurations
export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  blockDuration: 300000, // 5 minutes
  keyPrefix: 'rl'
};

export const defaultSecurityHeadersConfig: SecurityHeadersConfig = {
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.stack-auth.com'],
    fontSrc: ["'self'", 'https:', 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"]
  },
  frameGuard: {
    action: 'DENY'
  },
  xssProtection: true,
  noSniff: true
};