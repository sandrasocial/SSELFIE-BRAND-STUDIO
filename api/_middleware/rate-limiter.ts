import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  RateLimitConfig,
  RateLimitInfo,
  RateLimitError,
  SecurityEventType,
  SecurityEventSeverity
} from '../../shared/security/types.js';
import { securityLogger } from '../monitoring/security-logger.js';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || '');

// Rate limiter configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  default: {
    windowMs: 60000,
    maxRequests: 100,
    blockDuration: 300000,
    keyPrefix: 'rl_default'
  },
  auth: {
    windowMs: 300000,    // 5 minutes
    maxRequests: 5,      // 5 attempts
    blockDuration: 900000, // 15 minutes block
    keyPrefix: 'rl_auth'
  },
  api: {
    windowMs: 60000,     // 1 minute
    maxRequests: 30,     // 30 requests
    blockDuration: 300000, // 5 minutes block
    keyPrefix: 'rl_api'
  }
};

// Create rate limiters
const rateLimiters: Record<string, RateLimiterRedis> = {};

// Initialize rate limiters
Object.entries(rateLimitConfigs).forEach(([key, config]) => {
  rateLimiters[key] = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: config.keyPrefix,
    points: config.maxRequests,
    duration: config.windowMs / 1000, // Convert to seconds
    blockDuration: config.blockDuration / 1000, // Convert to seconds
  });
});

/**
 * Get rate limiter key from request
 */
function getRateLimiterKey(req: VercelRequest): string {
  // Prefer authenticated user ID if available
  const userId = req.user?.id;
  if (userId) {
    return `user_${userId}`;
  }
  
  // Fall back to IP address
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) 
    ? forwardedFor[0] 
    : forwardedFor?.split(',')[0] || req.socket.remoteAddress;
    
  return `ip_${ip}`;
}

/**
 * Get rate limit info
 */
async function getRateLimitInfo(
  limiter: RateLimiterRedis,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitInfo> {
  try {
    const res = await limiter.get(key);
    return {
      limit: config.maxRequests,
      current: res.consumedPoints,
      remaining: Math.max(0, config.maxRequests - res.consumedPoints),
      resetTime: new Date(Date.now() + res.msBeforeNext)
    };
  } catch {
    return {
      limit: config.maxRequests,
      current: 0,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs)
    };
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimiter(type: keyof typeof rateLimitConfigs = 'default') {
  const config = rateLimitConfigs[type];
  const limiter = rateLimiters[type];

  return async (req: VercelRequest, res: VercelResponse, next: () => void) => {
    const key = getRateLimiterKey(req);
    
    try {
      // Attempt to consume a point
      const rateLimiterRes = await limiter.consume(key);
      
      // Set rate limit headers
      const info = await getRateLimitInfo(limiter, key, config);
      res.setHeader('X-RateLimit-Limit', info.limit);
      res.setHeader('X-RateLimit-Remaining', info.remaining);
      res.setHeader('X-RateLimit-Reset', info.resetTime.getTime());
      
      return next();
    } catch (rateLimitError) {
      // Log security event
      securityLogger.log({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecurityEventSeverity.MEDIUM,
        details: {
          endpoint: req.url,
          rateLimitType: type,
          key
        },
        userId: req.user?.id,
        ip: req.socket.remoteAddress
      });

      // Return rate limit exceeded error
      const retryAfter = Math.ceil(config.blockDuration / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + retryAfter);
      
      const errorResponse: RateLimitError = {
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
        limit: config.maxRequests,
        windowMs: config.windowMs
      };

      res.status(429).json(errorResponse);
    }
  };
}