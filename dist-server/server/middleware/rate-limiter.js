import { Logger } from '../utils/logger.js';
class RateLimiter {
    requests = new Map();
    logger;
    constructor() {
        this.logger = new Logger('RateLimiter');
        setInterval(() => {
            this.cleanup();
        }, 60000);
    }
    create(options) {
        return (req, res, next) => {
            const key = options.keyGenerator ? options.keyGenerator(req) : this.getDefaultKey(req);
            const now = Date.now();
            const windowStart = now - options.windowMs;
            let record = this.requests.get(key);
            if (!record || record.resetTime < now) {
                record = {
                    count: 0,
                    resetTime: now + options.windowMs
                };
                this.requests.set(key, record);
            }
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
            record.count++;
            const remaining = Math.max(0, options.maxRequests - record.count);
            res.set({
                'X-RateLimit-Limit': options.maxRequests.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
            });
            if (options.skipSuccessfulRequests || options.skipFailedRequests) {
                const originalSend = res.send;
                res.send = function (body) {
                    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
                    if ((options.skipSuccessfulRequests && isSuccess) ||
                        (options.skipFailedRequests && !isSuccess)) {
                        record.count = Math.max(0, record.count - 1);
                    }
                    return originalSend.call(this, body);
                };
            }
            next();
        };
    }
    getDefaultKey(req) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        return `${ip}:${userAgent}`;
    }
    cleanup() {
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
    getInfo(key) {
        const record = this.requests.get(key);
        if (!record)
            return null;
        return {
            limit: 0,
            remaining: 0,
            reset: record.resetTime,
            retryAfter: record.resetTime > Date.now() ?
                Math.ceil((record.resetTime - Date.now()) / 1000) : undefined
        };
    }
    reset(key) {
        return this.requests.delete(key);
    }
    getAllInfo() {
        const results = [];
        for (const [key, record] of this.requests.entries()) {
            const info = this.getInfo(key);
            if (info) {
                results.push({ key, info });
            }
        }
        return results;
    }
}
export const rateLimiter = new RateLimiter();
export const rateLimits = {
    general: rateLimiter.create({
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        message: 'Too many requests, please try again later'
    }),
    auth: rateLimiter.create({
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
        message: 'Too many authentication attempts, please try again later'
    }),
    aiGeneration: rateLimiter.create({
        windowMs: 60 * 60 * 1000,
        maxRequests: 10,
        message: 'AI generation rate limit exceeded, please try again later'
    }),
    upload: rateLimiter.create({
        windowMs: 60 * 60 * 1000,
        maxRequests: 20,
        message: 'File upload rate limit exceeded, please try again later'
    }),
    admin: rateLimiter.create({
        windowMs: 5 * 60 * 1000,
        maxRequests: 50,
        message: 'Admin rate limit exceeded'
    }),
    strict: rateLimiter.create({
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        message: 'Rate limit exceeded for sensitive operation'
    })
};
export const rateLimitByUser = (options) => {
    return rateLimiter.create({
        ...options,
        keyGenerator: (req) => {
            const userId = req.user?.id;
            return userId ? `user:${userId}` : `ip:${req.ip}`;
        }
    });
};
export const rateLimitByIP = (options) => {
    return rateLimiter.create({
        ...options,
        keyGenerator: (req) => `ip:${req.ip || req.connection.remoteAddress}`
    });
};
//# sourceMappingURL=rate-limiter.js.map