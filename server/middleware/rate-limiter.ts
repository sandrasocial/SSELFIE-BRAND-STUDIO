/**
 * Rate Limiting Middleware
 * Provides rate limiting for API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
  message?: string; // Custom error message
  statusCode?: number; // Custom status code
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RateLimiter');
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Create rate limiting middleware
   */
  create(options: RateLimitOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : this.getDefaultKey(req);
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Get or create request record
      let record = this.requests.get(key);
      if (!record || record.resetTime < now) {
        record = {
          count: 0,
          resetTime: now + options.windowMs
        };
        this.requests.set(key, record);
      }

      // Check if limit exceeded
      if (record.count >= options.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        
        this.logger.warn('Rate limit exceeded', {
          key,
          limit: options.maxRequests,
          count: record.count,
          retryAfter
        });

        res.set({
          'X-RateLimit-Limit': options.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          'Retry-After': retryAfter.toString()
        });

        return res.status(options.statusCode || 429).json({
          success: false,
          error: {
            message: options.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter
          }
        });
      }

      // Increment counter
      record.count++;

      // Set rate limit headers
      const remaining = Math.max(0, options.maxRequests - record.count);
      res.set({
        'X-RateLimit-Limit': options.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      });

      // Track successful/failed requests if needed
      if (options.skipSuccessfulRequests || options.skipFailedRequests) {
        const originalSend = res.send;
        res.send = function (body: any) {
          const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
          
          if ((options.skipSuccessfulRequests && isSuccess) || 
              (options.skipFailedRequests && !isSuccess)) {
            record!.count = Math.max(0, record!.count - 1);
          }
          
          return originalSend.call(this, body);
        };
      }

      next();
    };
  }

  /**
   * Get default key for rate limiting
   */
  private getDefaultKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.requests.entries()) {
      if (record.resetTime < now) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  /**
   * Get rate limit info for a key
   */
  getInfo(key: string): RateLimitInfo | null {
    const record = this.requests.get(key);
    if (!record) return null;

    return {
      limit: 0, // Will be set by middleware
      remaining: 0, // Will be set by middleware
      reset: record.resetTime,
      retryAfter: record.resetTime > Date.now() ? 
        Math.ceil((record.resetTime - Date.now()) / 1000) : undefined
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): boolean {
    return this.requests.delete(key);
  }

  /**
   * Get all active rate limits
   */
  getAllInfo(): Array<{ key: string; info: RateLimitInfo }> {
    const results: Array<{ key: string; info: RateLimitInfo }> = [];
    
    for (const [key, record] of this.requests.entries()) {
      const info = this.getInfo(key);
      if (info) {
        results.push({ key, info });
      }
    }
    
    return results;
  }
}

// Create global rate limiter instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const rateLimits = {
  // General API rate limiting
  general: rateLimiter.create({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later'
  }),

  // Strict rate limiting for auth endpoints
  auth: rateLimiter.create({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later'
  }),

  // AI generation rate limiting
  aiGeneration: rateLimiter.create({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'AI generation rate limit exceeded, please try again later'
  }),

  // File upload rate limiting
  upload: rateLimiter.create({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'File upload rate limit exceeded, please try again later'
  }),

  // Admin endpoints rate limiting
  admin: rateLimiter.create({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    message: 'Admin rate limit exceeded'
  }),

  // Very strict rate limiting for sensitive operations
  strict: rateLimiter.create({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Rate limit exceeded for sensitive operation'
  })
};

// Rate limit by user ID
export const rateLimitByUser = (options: RateLimitOptions) => {
  return rateLimiter.create({
    ...options,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    }
  });
};

// Rate limit by IP
export const rateLimitByIP = (options: RateLimitOptions) => {
  return rateLimiter.create({
    ...options,
    keyGenerator: (req: Request) => `ip:${req.ip || req.connection.remoteAddress}`
  });
};
