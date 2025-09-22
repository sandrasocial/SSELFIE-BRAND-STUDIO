/**
 * Security Middleware Tests
 * Tests for CSP and iframe security middleware
 */

import { Request, Response, NextFunction } from 'express';
import { SecurityMiddleware } from '../middleware/security';

// Mock environment variables
process.env.ALLOWED_EMBED_HOSTS = 'mentimeter.com,*.mentimeter.com,canva.com,*.canva.com';

describe('SecurityMiddleware', () => {
  let securityMiddleware: SecurityMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    securityMiddleware = new SecurityMiddleware();
    req = {
      path: '/test',
    };
    res = {
      set: jest.fn(),
    };
    next = jest.fn();
  });

  describe('securityHeaders', () => {
    it('should set basic security headers', () => {
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.set).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(next).toHaveBeenCalled();
    });

    it('should set X-Frame-Options to DENY for non-stage routes', () => {
      req.path = '/regular-route';
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should set X-Frame-Options to SAMEORIGIN for stage routes', () => {
      req.path = '/hair/live/session123';
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
    });

    it('should set X-Frame-Options to SAMEORIGIN for guest routes', () => {
      req.path = '/hair/guest/session123';
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
    });

    it('should set comprehensive CSP headers', () => {
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy', 
        expect.stringContaining("frame-ancestors 'self'")
      );
      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy', 
        expect.stringContaining('https://mentimeter.com')
      );
      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy', 
        expect.stringContaining('https://canva.com')
      );
      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy', 
        expect.stringContaining('upgrade-insecure-requests')
      );
    });

    it('should allow WebSocket connections in CSP', () => {
      const middleware = securityMiddleware.securityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy', 
        expect.stringContaining('wss:')
      );
    });
  });

  describe('inputValidation', () => {
    it('should pass valid requests', () => {
      req.body = { title: 'Test Session', deckUrl: 'https://example.com/deck' };
      req.get = jest.fn().mockReturnValue('1000');

      const middleware = securityMiddleware.inputValidation();
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject oversized requests', () => {
      req.get = jest.fn().mockReturnValue('50000000'); // 50MB
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      const middleware = securityMiddleware.inputValidation();
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Request entity too large', code: 'PAYLOAD_TOO_LARGE' }
      });
    });

    it('should sanitize malicious input', () => {
      req.body = { 
        title: 'Test<script>alert("xss")</script>Session',
        description: 'javascript:alert("xss")'
      };
      req.get = jest.fn().mockReturnValue('1000');

      const middleware = securityMiddleware.inputValidation();
      middleware(req as Request, res as Response, next);

      expect(req.body.title).not.toContain('<script>');
      expect(req.body.description).not.toContain('javascript:');
      expect(next).toHaveBeenCalled();
    });

    it('should handle validation errors gracefully', () => {
      req.body = null;
      req.get = jest.fn().mockImplementation(() => {
        throw new Error('Invalid header');
      });
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      const middleware = securityMiddleware.inputValidation();
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Input validation failed', code: 'VALIDATION_ERROR' }
      });
    });
  });
});
