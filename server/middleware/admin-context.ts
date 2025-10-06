/**
 * ADMIN CONTEXT MIDDLEWARE
 * Simple admin detection for Maya system separation
 * Only one admin user: ssa@ssasocial.com (42585527)
 * All others are paying members (€47/month)
 */

import type { Request, Response, NextFunction } from 'express';

// Admin user identification
const ADMIN_USER_ID = '42585527';
const ADMIN_EMAIL = 'ssa@ssasocial.com';

export interface AdminContextRequest extends Request {
  isAdmin?: boolean;
  userType?: 'admin' | 'member';
  adminContext?: {
    isPlatformOwner: boolean;
    canAccessPlatformFeatures: boolean;
    separateAnalytics: boolean;
  };
}

/**
 * Middleware to detect admin vs member context for Maya system
 * Adds admin flags without blocking access
 */
export function adminContextDetection(req: AdminContextRequest, res: Response, next: NextFunction): void {
  try {
    // Get user info from authenticated session
    const userId = (req.user as any)?.claims?.sub;
    const userEmail = (req.user as any)?.claims?.email;

    // Detect admin user (platform owner)
    const isAdmin = userId === ADMIN_USER_ID || userEmail === ADMIN_EMAIL;

    // Add admin context to request
    req.isAdmin = isAdmin;
    req.userType = isAdmin ? 'admin' : 'member';

    if (isAdmin) {
      req.adminContext = {
        isPlatformOwner: true,
        canAccessPlatformFeatures: true,
        separateAnalytics: true
      };

    } else {
    }

    next();
  } catch (error) {
    console.error('❌ Admin context detection error:', error);
    // Fallback to member context on error
    req.isAdmin = false;
    req.userType = 'member';
    next();
  }
}

/**
 * Generate conversation ID based on user type and context
 * PHASE 1: Added context support for separate styling vs support conversations
 */
export function getConversationId(userId: string, isAdmin: boolean, chatId?: number, context?: string): string {
  const contextSuffix = context === 'support' ? '_support' : '';

  if (isAdmin) {
    return `maya_admin_platform_${userId}${contextSuffix}`;
  }

  if (chatId) {
    return `maya_member_${userId}_${chatId}${contextSuffix}`;
  }

  return `maya_member_${userId}${contextSuffix}`;
}

/**
 * Check if user is the platform admin
 */
export function isPlatformAdmin(userId?: string, email?: string): boolean {
  return userId === ADMIN_USER_ID || email === ADMIN_EMAIL;
}