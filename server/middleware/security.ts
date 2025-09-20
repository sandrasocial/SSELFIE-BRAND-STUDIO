/**
 * Security Middleware
 * Provides security headers and input validation
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { ALLOWED_EMBED_HOSTS } from '../env';

export class SecurityMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('SecurityMiddleware');
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.set('Access-Control-Max-Age', '86400');

      // Security headers
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-XSS-Protection', '1; mode=block');
      res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // For Stage Mode routes, use SAMEORIGIN for iframe compatibility
      // For other routes, use DENY for maximum security
      const isStageRoute = req.path.startsWith('/hair/live') || req.path.startsWith('/hair/guest');
      res.set('X-Frame-Options', isStageRoute ? 'SAMEORIGIN' : 'DENY');

      // Enhanced Content Security Policy for Stage Mode
      const allowedHosts = ALLOWED_EMBED_HOSTS.split(',').map(host => host.trim());
      const mentimeterHosts = allowedHosts.filter(host => host.includes('mentimeter')).map(host => `https://${host.replace(/^\*\./, '')}`);
      const canvaHosts = allowedHosts.filter(host => host.includes('canva')).map(host => `https://${host.replace(/^\*\./, '')}`);
      
      const cspDirectives = [
        "frame-ancestors 'self'",
        `frame-src 'self' ${mentimeterHosts.join(' ')} ${canvaHosts.join(' ')}`,
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${mentimeterHosts.join(' ')} ${canvaHosts.join(' ')}`,
        "img-src 'self' data: https:",
        `connect-src 'self' ${mentimeterHosts.join(' ')} ${canvaHosts.join(' ')} wss:`,
        "upgrade-insecure-requests",
        "style-src 'self' 'unsafe-inline'"
      ];

      res.set('Content-Security-Policy', cspDirectives.join('; '));

      next();
    };
  }

  /**
   * Input validation middleware
   */
  inputValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate request body size
        const contentLength = parseInt(req.get('Content-Length') || '0');
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (contentLength > maxSize) {
          return res.status(413).json({
            success: false,
            error: { message: 'Request entity too large', code: 'PAYLOAD_TOO_LARGE' }
          });
        }

        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
          req.body = this.sanitizeObject(req.body);
        }

        next();
      } catch (error) {
        this.logger.error('Input validation error', { error: error.message });
        return res.status(400).json({
          success: false,
          error: { message: 'Input validation failed', code: 'VALIDATION_ERROR' }
        });
      }
    };
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(item => this.sanitizeObject(item));
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  /**
   * Sanitize string
   */
  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}

// Create global security middleware instance
export const securityMiddleware = new SecurityMiddleware();
export const securityHeaders = securityMiddleware.securityHeaders();
export const inputValidation = securityMiddleware.inputValidation();