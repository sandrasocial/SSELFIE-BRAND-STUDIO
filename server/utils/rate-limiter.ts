/**
 * Rate Limiter
 * Advanced rate limiting with multiple strategies and storage backends
 */

import { Logger } from './logger';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: any) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
  standardHeaders?: boolean; // Add standard rate limit headers
  legacyHeaders?: boolean; // Add legacy rate limit headers
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
  message?: string;
}

export class RateLimiter {
  private logger: Logger;
  private requests: Map<string, number[]>;
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.logger = new Logger('RateLimiter');
    this.requests = new Map();
    this.options = {
      keyGenerator: (req) => req.ip || 'unknown',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    };
  }

  /**
   * Check if request is allowed
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    const isAllowed = recentRequests.length < this.options.maxRequests;
    
    if (isAllowed) {
      // Add current request
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
    }
    
    // Calculate reset time
    const reset = recentRequests.length > 0 ? recentRequests[0] + this.options.windowMs : now + this.options.windowMs;
    
    const info: RateLimitInfo = {
      limit: this.options.maxRequests,
      remaining: Math.max(0, this.options.maxRequests - recentRequests.length - (isAllowed ? 1 : 0)),
      reset: Math.ceil(reset / 1000) // Convert to seconds
    };
    
    if (!isAllowed) {
      info.retryAfter = Math.ceil((reset - now) / 1000);
    }
    
    return {
      allowed: isAllowed,
      info,
      message: isAllowed ? undefined : this.options.message
    };
  }

  /**
   * Clean up old entries
   */
  cleanup(): number {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    let cleanedCount = 0;
    
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
        cleanedCount++;
      } else {
        this.requests.set(key, recentRequests);
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} rate limit entries`);
    }
    
    return cleanedCount;
  }

  /**
   * Get rate limit statistics
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    averageRequestsPerKey: number;
    topKeys: Array<{ key: string; count: number }>;
  } {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    let totalRequests = 0;
    const keyStats: Array<{ key: string; count: number }> = [];
    
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      const count = recentRequests.length;
      totalRequests += count;
      
      if (count > 0) {
        keyStats.push({ key, count });
      }
    }
    
    keyStats.sort((a, b) => b.count - a.count);
    
    return {
      totalKeys: this.requests.size,
      totalRequests,
      averageRequestsPerKey: this.requests.size > 0 ? totalRequests / this.requests.size : 0,
      topKeys: keyStats.slice(0, 10)
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): boolean {
    return this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
    this.logger.info('All rate limits reset');
  }
}

/**
 * Multi-tier rate limiter
 */
export class MultiTierRateLimiter {
  private logger: Logger;
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.logger = new Logger('MultiTierRateLimiter');
    this.limiters = new Map();
  }

  /**
   * Add a rate limiter for a specific tier
   */
  addTier(name: string, options: RateLimitOptions): void {
    this.limiters.set(name, new RateLimiter(options));
    this.logger.info(`Added rate limiter tier: ${name}`);
  }

  /**
   * Check rate limit for a specific tier
   */
  checkTier(tierName: string, key: string): RateLimitResult {
    const limiter = this.limiters.get(tierName);
    if (!limiter) {
      throw new Error(`Rate limiter tier '${tierName}' not found`);
    }
    
    return limiter.check(key);
  }

  /**
   * Check all tiers (all must pass)
   */
  checkAll(key: string): {
    allowed: boolean;
    results: Record<string, RateLimitResult>;
    message?: string;
  } {
    const results: Record<string, RateLimitResult> = {};
    let allowed = true;
    let message: string | undefined;

    for (const [tierName, limiter] of this.limiters.entries()) {
      const result = limiter.check(key);
      results[tierName] = result;
      
      if (!result.allowed) {
        allowed = false;
        message = result.message;
        break;
      }
    }

    return { allowed, results, message };
  }

  /**
   * Get statistics for all tiers
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [tierName, limiter] of this.limiters.entries()) {
      stats[tierName] = limiter.getStats();
    }
    
    return stats;
  }

  /**
   * Cleanup all tiers
   */
  cleanupAll(): number {
    let totalCleaned = 0;
    
    for (const limiter of this.limiters.values()) {
      totalCleaned += limiter.cleanup();
    }
    
    return totalCleaned;
  }
}

/**
 * Express middleware factory
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);
  
  return (req: any, res: any, next: any) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip || 'unknown';
    const result = limiter.check(key);
    
    // Add rate limit headers
    if (options.standardHeaders) {
      res.set({
        'RateLimit-Limit': result.info.limit.toString(),
        'RateLimit-Remaining': result.info.remaining.toString(),
        'RateLimit-Reset': result.info.reset.toString()
      });
    }
    
    if (options.legacyHeaders) {
      res.set({
        'X-RateLimit-Limit': result.info.limit.toString(),
        'X-RateLimit-Remaining': result.info.remaining.toString(),
        'X-RateLimit-Reset': result.info.reset.toString()
      });
    }
    
    if (result.info.retryAfter) {
      res.set('Retry-After', result.info.retryAfter.toString());
    }
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: result.message,
        retryAfter: result.info.retryAfter
      });
      return;
    }
    
    next();
  };
}

// Export singleton instances
export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later'
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many requests from this IP, please try again later'
});

export const multiTierRateLimiter = new MultiTierRateLimiter();

// Add common tiers
multiTierRateLimiter.addTier('general', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

multiTierRateLimiter.addTier('strict', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10
});

multiTierRateLimiter.addTier('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5
});
