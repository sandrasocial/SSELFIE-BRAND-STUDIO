/**
 * Comprehensive Middleware System
 * Security, performance, and utility middleware
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';
import { middlewareSystem } from './middleware';

export class MiddlewareSystem {
  private logger: Logger;
  private isEnabled: boolean;

  constructor() {
    this.logger = new Logger('MiddlewareSystem');
    this.isEnabled = true;
  }

  /**
   * Security headers middleware
   */
  public securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https:; " +
        "frame-ancestors 'none';"
      );

      // HSTS for HTTPS
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      next();
    };
  }

  /**
   * Input validation middleware
   */
  public inputValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      // Validate request size
      const contentLength = parseInt(req.headers['content-length'] || '0');
      const maxSize = 10 * 1024 * 1024; // 10MB

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

      // Validate content type for POST/PUT requests
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

  /**
   * Rate limiting middleware
   */
  public rateLimiter(requests: number = 100, windowMs: number = 60000) {
    const requestCounts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      const ip = req.ip || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      for (const [key, value] of requestCounts.entries()) {
        if (value.resetTime < now) {
          requestCounts.delete(key);
        }
      }

      // Check current request count
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

  /**
   * CORS middleware
   */
  public cors() {
    return (req: Request, res: Response, next: NextFunction) => {
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

  /**
   * Request logging middleware
   */
  public requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Add request ID to request object
      (req as any).requestId = requestId;

      // Log request
      this.logger.info('Request received', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        
        // Log response
        this.logger.info('Request completed', {
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userId: (req as any).user?.id,
        });

        // Call original end method
        originalEnd.call(this, chunk, encoding);
      }.bind(this);

      next();
    };
  }

  /**
   * Authentication middleware
   */
  public requireAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
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

      // This would validate the token
      // For now, just add a mock user
      (req as any).user = { id: 'user_123', email: 'user@example.com' };
      next();
    };
  }

  /**
   * Admin authorization middleware
   */
  public requireAdmin() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      const user = (req as any).user;
      
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

  /**
   * Subscription validation middleware
   */
  public requireSubscription() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      const user = (req as any).user;
      
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

  /**
   * Request validation middleware
   */
  public validateRequest(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        return next();
      }

      try {
        // This would validate the request against the schema
        // For now, just pass through
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.message,
            timestamp: new Date().toISOString(),
          },
        });
      }
    };
  }

  /**
   * Request timeout middleware
   */
  public timeout(timeoutMs: number = 30000) {
    return (req: Request, res: Response, next: NextFunction) => {
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

      // Clear timeout when response is sent
      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));

      next();
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable middleware system
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Middleware system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if middleware system is enabled
   */
  public isEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const middlewareSystem = new MiddlewareSystem();