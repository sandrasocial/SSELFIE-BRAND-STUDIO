import { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';

// CORS configuration
export const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CSRF protection
export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Request validation
export const validateRequest = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  // Validate content type
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type' });
  }

  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ error: 'Request Entity Too Large' });
  }

  next();
};