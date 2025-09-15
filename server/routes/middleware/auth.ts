/**
 * Authentication Middleware
 * Centralized authentication and authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import { requireStackAuth, requireActiveSubscription } from '../../stack-auth';

// Re-export existing middleware for consistency
export { requireStackAuth, requireActiveSubscription };

// Additional authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // This can be extended with additional auth logic
  return requireStackAuth(req, res, next);
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is admin (assuming admin role is stored in user data)
  if (!req.user || !(req.user as any).isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Subscription validation middleware
export const requireSubscription = (req: Request, res: Response, next: NextFunction) => {
  // This can be extended with subscription validation logic
  return requireActiveSubscription(req, res, next);
};
