import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const rateLimitConfig = {
  login: {
    points: 5, // 5 attempts
    duration: 60 * 15 // 15 minutes
  },
  api: {
    points: 100, // 100 requests
    duration: 60 // 1 minute
  },
  signup: {
    points: 3, // 3 attempts
    duration: 60 * 60 // 1 hour
  }
};

export class RateLimiter {
  private static limiters: Record<string, RateLimiterRedis> = {
    login: new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'login_attempt',
      points: rateLimitConfig.login.points,
      duration: rateLimitConfig.login.duration
    }),
    api: new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'api_request',
      points: rateLimitConfig.api.points,
      duration: rateLimitConfig.api.duration
    }),
    signup: new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'signup_attempt',
      points: rateLimitConfig.signup.points,
      duration: rateLimitConfig.signup.duration
    })
  };

  static async checkRateLimit(type: keyof typeof rateLimitConfig, key: string): Promise<boolean> {
    try {
      await this.limiters[type].consume(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getRemainingAttempts(type: keyof typeof rateLimitConfig, key: string): Promise<number> {
    try {
      const res = await this.limiters[type].get(key);
      return rateLimitConfig[type].points - res.consumedPoints;
    } catch (error) {
      return 0;
    }
  }
}