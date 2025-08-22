import rateLimit from 'express-rate-limit';
import { Redis } from 'ioredis';
import { config } from '../config';

const redis = new Redis(config.redis);

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  store: {
    increment: async (key: string) => {
      await redis.incr(key);
      await redis.expire(key, 15 * 60);
    },
    decrement: async (key: string) => {
      await redis.decr(key);
    },
    resetKey: async (key: string) => {
      await redis.del(key);
    }
  }
});