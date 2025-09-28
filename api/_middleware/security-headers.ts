import type { VercelRequest, VercelResponse } from '@vercel/node';
import helmet from 'helmet';

/**
 * Security headers middleware configuration
 */
export const securityHeaders = helmet({
  // HSTS configuration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stack-auth.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // XSS Protection
  xssFilter: true,
  
  // No Sniff
  noSniff: true,
  
  // Frame Options
  frameguard: {
    action: 'deny',
  },
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions Policy
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
});

/**
 * Apply security headers middleware
 */
export function applySecurityHeaders(
  req: VercelRequest,
  res: VercelResponse,
  next: () => void
) {
  // Apply helmet middleware
  securityHeaders(req, res, () => {
    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    return next();
  });
}