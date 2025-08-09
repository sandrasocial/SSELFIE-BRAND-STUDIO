import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cors from 'cors';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://sselfie.studio',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // CSRF protection
  app.use(csrf({ cookie: true }));

  // Error handler for CSRF token errors
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).json({ error: 'Invalid CSRF token' });
  });
};