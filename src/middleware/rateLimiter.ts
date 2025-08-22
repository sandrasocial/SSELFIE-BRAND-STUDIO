import { rateLimit } from 'express-rate-limit';
import { securityConfig } from '../config/security';
import { logSecurityEvent } from '../lib/securityLogger';

export const loginRateLimiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.maxAttempts,
    handler: async (req, res) => {
        await logSecurityEvent({
            eventType: 'RATE_LIMIT_EXCEEDED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestPath: req.path,
            additionalData: { attemptCount: req.rateLimit.current }
        });
        
        res.status(429).json({
            error: 'Too many login attempts. Please try again later.',
            retryAfter: Math.ceil(securityConfig.rateLimit.blockDuration / 1000)
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});