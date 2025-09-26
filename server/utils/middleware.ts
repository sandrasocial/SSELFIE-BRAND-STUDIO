/**
 * Comprehensive Middleware System
 * Security, performance, and utility middleware
 */

import { Request, Response, NextFunction } from "express";
import { Logger } from "./logger.js";
import validator from 'validator';
import { verify as verifyToken } from 'jsonwebtoken';

class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message || 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

class BadRequestError extends Error {
  constructor(message?: string) {
    super(message || 'Bad Request');
    this.name = 'BadRequestError';
  }
}

class RequestTimeoutError extends Error {
  constructor(message?: string) {
    super(message || 'Request Timeout');
    this.name = 'RequestTimeoutError';
  }
}

declare module 'express' {
  interface Request {
    user?: any;
  }
}
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
  securityHeaders(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        next();
        return;
      }

      // Set security headers
      res.set({
        'Content-Security-Policy': 'default-src * data: blob:; script-src * \'unsafe-eval\' \'unsafe-inline\' blob:; style-src * \'unsafe-inline\' blob:; img-src * data: blob:; font-src * data: blob:; connect-src * data: blob:; frame-src *;',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });

      next();
    };
  }

  /**
   * CORS middleware
   */
  cors(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        next();
        return;
      }

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      // Handle preflight requests
      if ('OPTIONS' === req.method) {
        res.send(200);
      } else {
        next();
      }
    };
  }

  /**
   * Request logging middleware
   */
  requestLogger(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        next();
        return;
      }

      const start = process.hrtime();
      
      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        this.logger.info('Request processed', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration.toFixed(2)}ms`
        });
      });

      next();
    };
  }

  /**
   * Input validation middleware
   */
  validateUuidParam(param: string): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        next();
        return;
      }

      try {
        const uuid = req.params[param];
        if (!uuid) {
          MiddlewareSystem.throwBadRequest('UUID parameter is required');
        }
        MiddlewareSystem.validateUuid(uuid);
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Authentication middleware
   */
  authenticate(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.isEnabled) {
        next();
        return;
      }

      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          MiddlewareSystem.throwUnauthorized();
        }

        // Extract and validate token
        const token = authHeader.split(' ')[1];
        if (!token) {
          MiddlewareSystem.throwUnauthorized();
        }

        // Verify token
        // Replace 'your-secret-key' with actual secret key from config
        const decoded = await verifyToken(token, 'your-secret-key');
        req.user = decoded;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static throwUnauthorized(): never {
    throw new UnauthorizedError();
  }

  static throwBadRequest(message?: string): never {
    throw new BadRequestError(message);
  }

  private static validateUuid(uuid: string): void {
    if (!uuid || !validator.isUUID(uuid)) {
      this.throwBadRequest('Invalid UUID format');
    }
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
            timestamp: new Date().toISOString()
          }
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
              timestamp: new Date().toISOString()
            }
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
            timestamp: new Date().toISOString()
          },
        });
      }

      current.count++;
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
            timestamp: new Date().toISOString()
          }
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
            timestamp: new Date().toISOString()
          }
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
            timestamp: new Date().toISOString()
          }
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
      } catch (error: unknown) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
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
            timestamp: new Date().toISOString()
          }
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
  getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const middlewareSys = new MiddlewareSystem();

// Export singleton instance
export const middlewareSystem = new MiddlewareSystem();