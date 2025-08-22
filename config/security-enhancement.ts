import helmet from 'helmet';
import csrf from 'csurf';
import { RequestHandler } from 'express';

/**
 * Enhanced security middleware configuration for SSELFIE
 */
export const securityEnhancements = {
  // CSRF Protection
  csrfProtection: csrf({ cookie: true }),
  
  // Security Headers
  securityHeaders: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"]
      }
    },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    xssFilter: true
  }),

  // Token Validation
  validateToken: (token: string): boolean => {
    try {
      // TODO: Implement proper JWT validation
      return false; // Temporary strict security
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Session Security
  sessionConfig: {
    secret: process.env.SESSION_SECRET || 'temporary-secret-change-in-production',
    name: 'sselfie_session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    resave: false,
    saveUninitialized: false
  }
};

// Auth Flow Protection Middleware
export const authProtection: RequestHandler = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, ''); // Basic XSS protection
};