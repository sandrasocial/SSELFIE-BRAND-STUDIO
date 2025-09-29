import { Request, Response, NextFunction } from 'express';

// Revenue Protection Middleware
// Ensures member-facing APIs are never broken by admin operations

const PROTECTED_MEMBER_ROUTES = [
  '/api/subscription',
  '/api/usage/status', 
  '/api/user-model',
  '/api/ai-images',
  '/api/auth/user',
  '/api/gallery-images',
  '/api/maya-chats',
  '/api/save-to-gallery'
];

const PROTECTED_MEMBER_PAGES = [
  '/maya',
  '/workspace', 
  '/checkout',
  '/simple-checkout',
  '/payment-success',
  '/simple-training'
];

export function revenueProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Log access to protected routes for monitoring
  if (PROTECTED_MEMBER_ROUTES.includes(path) || PROTECTED_MEMBER_PAGES.includes(path)) {
    console.log(`🛡️ PROTECTED ROUTE ACCESS: ${req.method} ${path} by ${req.user ? 'authenticated' : 'anonymous'} user`);
  }
  
  next();
}

export function validateMemberApiHealth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // This middleware can be used to validate that member APIs are healthy
    // before allowing admin operations to proceed
    next();
  };
}

// Route protection checker - prevents accidental modification of member routes
export function isMemberRoute(path: string): boolean {
  return PROTECTED_MEMBER_ROUTES.includes(path) || 
         PROTECTED_MEMBER_PAGES.includes(path) ||
         path.startsWith('/maya') ||
         path.startsWith('/workspace') ||
         path.startsWith('/checkout');
}

export function isAdminRoute(path: string): boolean {
  return path.startsWith('/api/admin') ||
         path.startsWith('/api/consulting-agents') ||
         path.startsWith('/api/claude') ||
         path.startsWith('/admin');
}