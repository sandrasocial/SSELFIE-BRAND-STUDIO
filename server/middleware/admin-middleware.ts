import type { Request, Response, NextFunction } from 'express';

// Admin credentials - these should be moved to environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ssa@ssasocial.com';
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '42585527';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'sandra-admin-2025';

export interface AdminUser extends Request {
  user?: {
    claims: {
      sub: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    role?: string;
  };
  isAdminBypass?: boolean;
}

/**
 * Standardized admin authorization check
 * Supports multiple admin validation patterns:
 * 1. Session-based authentication (preferred)
 * 2. Admin token bypass (for API access)
 * 3. Role-based authorization
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;

  // Check admin token bypass
  if (user.isAdminBypass) return true;

  // Check session authentication
  if (user.claims) {
    // Method 1: Check email
    if (user.claims.email === ADMIN_EMAIL) return true;
    
    // Method 2: Check user ID
    if (user.claims.sub === ADMIN_USER_ID) return true;
  }

  // Method 3: Check role
  if (user.role === 'admin') return true;

  return false;
}

/**
 * Express middleware for admin route protection
 * Use this instead of inline admin checks
 */
export function requireAdmin(req: AdminUser, res: Response, next: NextFunction): void {
  try {
    // Check for admin token in headers, body, or query
    const adminToken = req.headers.authorization || 
                      (req.body && req.body.adminToken) || 
                      req.query.adminToken;

    // Handle admin token bypass
    if (adminToken === `Bearer ${ADMIN_TOKEN}` || adminToken === ADMIN_TOKEN) {
      req.user = {
        claims: {
          sub: ADMIN_USER_ID,
          email: ADMIN_EMAIL,
          first_name: 'Sandra',
          last_name: 'Sigurjonsdottir'
        }
      };
      req.isAdminBypass = true;
    }

    // Validate admin access
    if (!isAdmin(req.user)) {
      res.status(403).json({ 
        success: false, 
        message: 'Admin access required',
        error: 'Insufficient privileges'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Lightweight admin check for conditional logic
 * Use this for optional admin features
 */
export function checkAdminAccess(req: AdminUser): boolean {
  const adminToken = req.headers.authorization || 
                    (req.body && req.body.adminToken) || 
                    req.query.adminToken;

  if (adminToken === `Bearer ${ADMIN_TOKEN}` || adminToken === ADMIN_TOKEN) {
    return true;
  }

  return isAdmin(req.user);
}

/**
 * Validate and normalize user ID format
 * Handles mixed ID types: numeric strings, timestamped strings, etc.
 */
export function validateUserId(userId: string | undefined): { 
  isValid: boolean; 
  normalizedId: string | null; 
  idType: 'replit' | 'custom' | 'admin' | 'invalid';
} {
  if (!userId || typeof userId !== 'string') {
    return { isValid: false, normalizedId: null, idType: 'invalid' };
  }

  const trimmedId = userId.trim();

  // Admin user ID
  if (trimmedId === ADMIN_USER_ID) {
    return { isValid: true, normalizedId: trimmedId, idType: 'admin' };
  }

  // Replit user ID (pure numeric string)
  if (/^\d+$/.test(trimmedId)) {
    return { isValid: true, normalizedId: trimmedId, idType: 'replit' };
  }

  // Custom user ID (contains non-numeric characters, typically timestamped)
  if (/^[a-zA-Z0-9\-_]+$/.test(trimmedId) && trimmedId.length > 0) {
    return { isValid: true, normalizedId: trimmedId, idType: 'custom' };
  }

  return { isValid: false, normalizedId: null, idType: 'invalid' };
}

/**
 * Get normalized admin user data
 * Standardizes admin user representation across the app
 */
export function getAdminUserData() {
  return {
    id: ADMIN_USER_ID,
    email: ADMIN_EMAIL,
    firstName: 'Sandra',
    lastName: 'Sigurjonsdottir',
    role: 'admin',
    plan: 'sselfie-studio'
  };
}