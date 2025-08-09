import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf from 'csrf';
import cors from 'cors';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // CSRF protection
  const csrfProtection = new csrf();
  app.use((req, res, next) => {
    if (req.method === 'GET') return next();
    if (csrfProtection.verify(process.env.CSRF_SECRET, req.body._csrf)) {
      next();
    } else {
      res.status(403).json({ error: 'Invalid CSRF token' });
    }
  });

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};