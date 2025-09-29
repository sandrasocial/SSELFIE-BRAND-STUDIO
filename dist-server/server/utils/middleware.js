import { Logger } from './logger.js';
export class MiddlewareSystem {
    logger;
    isEnabled;
    constructor() {
        this.logger = new Logger('MiddlewareSystem');
        this.isEnabled = true;
    }
    securityHeaders() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            res.setHeader('Content-Security-Policy', "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' https:; " +
                "frame-ancestors 'none';");
            if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            }
            next();
        };
    }
    inputValidation() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const contentLength = parseInt(req.headers['content-length'] || '0');
            const maxSize = 10 * 1024 * 1024;
            if (contentLength > maxSize) {
                return res.status(413).json({
                    success: false,
                    error: {
                        code: 'PAYLOAD_TOO_LARGE',
                        message: 'Request payload too large',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const contentType = req.headers['content-type'];
                if (!contentType || !contentType.includes('application/json')) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_CONTENT_TYPE',
                            message: 'Content-Type must be application/json',
                            timestamp: new Date().toISOString(),
                        },
                    });
                }
            }
            next();
        };
    }
    rateLimiter(requests = 100, windowMs = 60000) {
        const requestCounts = new Map();
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const ip = req.ip || 'unknown';
            const now = Date.now();
            const windowStart = now - windowMs;
            for (const [key, value] of requestCounts.entries()) {
                if (value.resetTime < now) {
                    requestCounts.delete(key);
                }
            }
            const current = requestCounts.get(ip);
            if (!current) {
                requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
                return next();
            }
            if (current.count >= requests) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Too many requests',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            current.count++;
            next();
        };
    }
    cors() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const origin = req.headers.origin;
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:5173',
                'https://sselfie.com',
                'https://www.sselfie.com',
                'https://staging.sselfie.com',
            ];
            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400');
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }
            next();
        };
    }
    requestLogger() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const startTime = Date.now();
            const requestId = this.generateRequestId();
            req.requestId = requestId;
            this.logger.info('Request received', {
                requestId,
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id,
            });
            const originalEnd = res.end;
            const logger = this.logger;
            res.end = function (chunk, encoding) {
                const duration = Date.now() - startTime;
                logger.info('Request completed', {
                    requestId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    duration,
                    userId: req.user?.id,
                });
                return originalEnd.call(this, chunk, encoding);
            };
            next();
        };
    }
    requireAuth() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication token required',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            req.user = { id: 'user_123', email: 'user@example.com' };
            next();
        };
    }
    requireAdmin() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const user = req.user;
            if (!user || !user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Admin access required',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            next();
        };
    }
    requireSubscription() {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const user = req.user;
            if (!user || !user.subscription || user.subscription.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'SUBSCRIPTION_REQUIRED',
                        message: 'Active subscription required',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            next();
        };
    }
    validateRequest(schema) {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            try {
                next();
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Request validation failed',
                        details: error instanceof Error ? error.message : String(error),
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        };
    }
    timeout(timeoutMs = 30000) {
        return (req, res, next) => {
            if (!this.isEnabled) {
                return next();
            }
            const timeout = setTimeout(() => {
                if (!res.headersSent) {
                    res.status(408).json({
                        success: false,
                        error: {
                            code: 'REQUEST_TIMEOUT',
                            message: 'Request timeout',
                            timestamp: new Date().toISOString(),
                        },
                    });
                }
            }, timeoutMs);
            res.on('finish', () => clearTimeout(timeout));
            res.on('close', () => clearTimeout(timeout));
            next();
        };
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Middleware system ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEnabled() {
        return this.isEnabled;
    }
}
export const middlewareSystem = new MiddlewareSystem();
//# sourceMappingURL=middleware.js.map