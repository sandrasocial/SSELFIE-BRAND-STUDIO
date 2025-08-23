import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';
import { DatabaseStorage } from '../services/database-service';

// Initialize rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Security middleware
export const securityMiddleware = [
  // Basic security headers
  helmet(),
  
  // Rate limiting
  limiter,
  
  // CSRF Protection for non-GET requests
  csrfProtection,
  
  // Custom security headers
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  }
];

// Authentication check middleware
export const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token and attach user to request
    const db = new DatabaseStorage();
    const user = await db.verifyAuthToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Role-based access control middleware
export const requireRole = (role: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    
    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// File upload security middleware
export const fileUploadSecurity = [
  // Limit file size
  express.json({ limit: '10mb' }),
  express.urlencoded({ extended: true, limit: '10mb' }),

  // Validate file types
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.files) return next();
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const files = Array.isArray(req.files) ? req.files : [req.files];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }
    }
    
    next();
  }
];