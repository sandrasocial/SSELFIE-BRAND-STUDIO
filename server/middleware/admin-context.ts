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
      
      console.log(`🎯 ADMIN CONTEXT: Platform owner (${userEmail}) detected - enhanced Maya context enabled`);
    } else {
      console.log(`👤 MEMBER CONTEXT: Subscriber user (${userId}) - standard Maya experience`);
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
 * Generate conversation ID based on user type
 */
export function getConversationId(userId: string, isAdmin: boolean, chatId?: number): string {
  if (isAdmin) {
    return `maya_admin_platform_${userId}`;
  }
  
  if (chatId) {
    return `maya_member_${userId}_${chatId}`;
  }
  
  return `maya_member_${userId}`;
}

/**
 * Check if user is the platform admin
 */
export function isPlatformAdmin(userId?: string, email?: string): boolean {
  return userId === ADMIN_USER_ID || email === ADMIN_EMAIL;
}