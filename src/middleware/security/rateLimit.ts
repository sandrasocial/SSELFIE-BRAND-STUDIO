import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later',
  statusCode: 429
};

export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore = {};

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private getKey(req: Request): string {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanupStore(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = this.getKey(req);
    const now = Date.now();

    // Clean up expired entries
    this.cleanupStore();

    // Initialize or reset if window expired
    if (!this.store[key] || this.store[key].resetTime <= now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return next();
    }

    // Increment count
    this.store[key].count++;

    // Check if over limit
    if (this.store[key].count > this.config.maxRequests) {
      return res.status(this.config.statusCode!).json({
        success: false,
        error: this.config.message,
        retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000)
      });
    }

    next();
  };
}

// Express middleware setup
export const rateLimit = (config?: Partial<RateLimitConfig>) => {
  const limiter = new RateLimiter(config);
  return limiter.middleware;
};