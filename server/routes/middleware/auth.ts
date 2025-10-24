/**
 * Authentication Middleware
 * ⚠️ DEPRECATED: This file uses legacy Stack Auth imports
 *
 * Authentication is now handled by:
 * - api/_middleware/auth.ts (Vercel serverless)
 * - server/_middleware/auth.ts (Express handlers)
 *
 * This file is kept for reference only and should not be used in new code.
 */

import { Request, Response, NextFunction } from 'express';

// Legacy middleware stubs (kept for backward compatibility)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  return res.status(501).json({
    error: 'Deprecated middleware',
    message: 'Use server/_middleware/auth.ts instead'
  });
};

export const requireStackAuth = (req: Request, res: Response, next: NextFunction) => {
  return res.status(501).json({
    error: 'Deprecated middleware',
    message: 'Use server/_middleware/auth.ts instead'
  });
};

export const requireActiveSubscription = (req: Request, res: Response, next: NextFunction) => {
  return res.status(501).json({
    error: 'Deprecated middleware',
    message: 'Use server/_middleware/auth.ts instead'
  });
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
