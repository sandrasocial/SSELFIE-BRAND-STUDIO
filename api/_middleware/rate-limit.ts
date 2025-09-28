import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Redis client
const redisClient = new Redis(process.env.REDIS_URL || '');

// Rate limiter configurations
const rateLimitConfigs = {
  auth: {
    points: 5, // 5 requests
    duration: 60, // per 60 seconds
    blockDuration: 600, // Block for 10 minutes
  },
  api: {
    points: 30, // 30 requests
    duration: 60, // per 60 seconds
    blockDuration: 300, // Block for 5 minutes
  }
};

// Create rate limiters
const rateLimiters = {
  auth: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl_auth',
    ...rateLimitConfigs.auth,
  }),
  api: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl_api',
    ...rateLimitConfigs.api,
  }),
};

/**
 * Get rate limiter key from request
 */
function getRateLimiterKey(req: VercelRequest): string {
  // Prefer authenticated user ID
  if (req.user?.id) {
    return `user_${req.user.id}`;
  }
  
  // Fall back to IP address
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) 
    ? forwardedFor[0] 
    : forwardedFor?.split(',')[0] || req.socket.remoteAddress;
    
  return `ip_${ip}`;
}

/**
 * Rate limiting middleware
 */
export async function rateLimiter(
  req: VercelRequest,
  res: VercelResponse,
  next: () => void
) {
  const isAuthEndpoint = req.url?.startsWith('/api/auth');
  const limiter = isAuthEndpoint ? rateLimiters.auth : rateLimiters.api;
  const config = isAuthEndpoint ? rateLimitConfigs.auth : rateLimitConfigs.api;
  
  try {
    const key = getRateLimiterKey(req);
    const rateLimiterRes = await limiter.consume(key);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.points);
    res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext));
    
    return next();
  } catch (error) {
    if (error instanceof Error) {
      // Rate limit exceeded
      res.setHeader('Retry-After', Math.floor(config.blockDuration));
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: config.blockDuration,
      });
    } else {
      // Unexpected error
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
      });
    }
  }
}