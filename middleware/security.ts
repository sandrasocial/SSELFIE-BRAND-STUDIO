/**
 * Enhanced Security Middleware for Production Readiness
 * Implements comprehensive security measures including rate limiting and request validation
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum requests per window
  message?: string; // Error message
  standardHeaders?: boolean; // Return rate limit info in headers
  legacyHeaders?: boolean; // Return rate limit info in legacy headers
}

interface RequestValidationOptions {
  maxBodySize?: number; // Maximum body size in bytes
  allowedMethods?: string[]; // Allowed HTTP methods
  requiredHeaders?: string[]; // Required request headers
}

interface SecurityHeaders {
  [key: string]: string;
}

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      windowMs: 60000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    };

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    this.requests.forEach((data, ip) => {
      if (data.resetTime < now) {
        this.requests.delete(ip);
      }
    });
  }

  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  check(req: Request, res: Response): boolean {
    const ip = this.getClientIP(req);
    const now = Date.now();
    const resetTime = now + this.options.windowMs;

    let requestData = this.requests.get(ip);

    if (!requestData) {
      requestData = { count: 1, resetTime };
      this.requests.set(ip, requestData);
    } else if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = resetTime;
    } else {
      requestData.count++;
    }

    const remaining = Math.max(0, this.options.max - requestData.count);
    const resetTimeSeconds = Math.ceil((requestData.resetTime - now) / 1000);

    // Set rate limit headers
    if (this.options.standardHeaders) {
      res.setHeader('RateLimit-Limit', this.options.max.toString());
      res.setHeader('RateLimit-Remaining', remaining.toString());
      res.setHeader('RateLimit-Reset', new Date(requestData.resetTime).toISOString());
    }

    if (this.options.legacyHeaders) {
      res.setHeader('X-RateLimit-Limit', this.options.max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());
    }

    return requestData.count <= this.options.max;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.check(req, res)) {
        return res.status(429).json({
          error: this.options.message,
          retryAfter: Math.ceil(this.options.windowMs / 1000)
        });
      }
      next();
    };
  }
}

class RequestValidator {
  private options: Required<RequestValidationOptions>;

  constructor(options: RequestValidationOptions = {}) {
    this.options = {
      maxBodySize: 10 * 1024 * 1024, // 10MB
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      requiredHeaders: [],
      ...options
    };
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check HTTP method
      if (!this.options.allowedMethods.includes(req.method)) {
        return res.status(405).json({
          error: 'Method not allowed',
          allowed: this.options.allowedMethods
        });
      }

      // Check required headers
      for (const header of this.options.requiredHeaders) {
        if (!req.get(header)) {
          return res.status(400).json({
            error: `Missing required header: ${header}`
          });
        }
      }

      // Check content length
      const contentLength = parseInt(req.get('content-length') || '0', 10);
      if (contentLength > this.options.maxBodySize) {
        return res.status(413).json({
          error: 'Request body too large',
          maxSize: this.options.maxBodySize
        });
      }

      // Sanitize request body
      if (req.body) {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = this.sanitizeObject(req.query);
      }

      next();
    };
  }
}

/**
 * Security headers middleware
 */
export function securityHeaders(customHeaders: SecurityHeaders = {}) {
  const defaultHeaders: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; upgrade-insecure-requests"
  };

  const headers = { ...defaultHeaders, ...customHeaders };

  return (req: Request, res: Response, next: NextFunction) => {
    // Set security headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // CORS headers for API endpoints
    if (req.path.startsWith('/api/')) {
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
      const origin = req.get('Origin');
      
      if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };
}

/**
 * API key validation middleware
 */
export function apiKeyValidation(options: { header?: string; required?: boolean } = {}) {
  const { header = 'x-api-key', required = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.get(header);

    if (required && !apiKey) {
      return res.status(401).json({
        error: 'API key required',
        header
      });
    }

    if (apiKey) {
      // Validate API key format (basic validation)
      if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
        return res.status(401).json({
          error: 'Invalid API key format'
        });
      }
    }

    next();
  };
}

/**
 * Request logging middleware for security monitoring
 */
export function securityLogging() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Log suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i, // Javascript protocol
      /%3Cscript/i // Encoded script tags
    ];

    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || '';
    
    let suspicious = false;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(JSON.stringify(req.body)) || pattern.test(userAgent)) {
        suspicious = true;
        break;
      }
    }

    if (suspicious) {
      console.warn('🚨 Suspicious request detected:', {
        ip: clientIP,
        method: req.method,
        url,
        userAgent,
        timestamp: new Date().toISOString()
      });
    }

    // Log response time and status
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode >= 400 || responseTime > 5000) {
        console.log('🔍 Security event:', {
          ip: clientIP,
          method: req.method,
          url,
          status: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    });

    next();
  };
}

// Create instances with default configurations
export const rateLimiter = {
  strict: new RateLimiter({ max: 10, windowMs: 60000 }), // 10 requests per minute
  normal: new RateLimiter({ max: 100, windowMs: 60000 }), // 100 requests per minute
  lenient: new RateLimiter({ max: 1000, windowMs: 60000 }), // 1000 requests per minute
};

export const requestValidator = new RequestValidator({
  maxBodySize: 10 * 1024 * 1024, // 10MB
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

// Default export with common security configurations
export default {
  // Basic security headers
  headers: securityHeaders(),
  
  // Rate limiting
  rateLimit: {
    strict: rateLimiter.strict.middleware(),
    normal: rateLimiter.normal.middleware(),
    lenient: rateLimiter.lenient.middleware()
  },
  
  // Request validation and sanitization
  validation: requestValidator.middleware(),
  
  // API key validation
  apiKey: apiKeyValidation,
  
  // Security logging
  logging: securityLogging,
  
  // Combined security middleware
  full: [
    securityHeaders(),
    rateLimiter.normal.middleware(),
    requestValidator.middleware(),
    securityLogging()
  ]
};