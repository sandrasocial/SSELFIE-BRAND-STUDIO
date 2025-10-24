/**
 * GET /api/auth/user - Pure Serverless Implementation
 *
 * Get current authenticated user information.
 * Auto-creates user in database if they exist in Stack Auth but not in DB.
 *
 * ✅ PATTERN 1: Accepts middleware-attached user from withAuth wrapper
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import {
  sendSuccess,
  sendUnauthorized,
  sendMethodNotAllowed,
  sendError,
  setNoCacheHeaders
} from '../../_utils/response-helpers.js';
import { userService } from '../../services/user-service.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

interface UserResponse {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
  monthlyGenerationLimit?: number;
  createdAt: Date;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    // ✅ PATTERN 1: User already attached by withAuth middleware
    // Fallback to getUserFromRequest for legacy compatibility
    let authUser = (req as any).user;

    if (!authUser) {
      console.log('⚠️ No user attached to request, attempting getUserFromRequest fallback');
      authUser = await getUserFromRequest(req);
    }

    if (!authUser) {
      return sendUnauthorized(res);
    }

    // Get or create user
    let user = await userService.getUser(authUser.id);

    // Auto-create if doesn't exist
    if (!user && authUser) {
      user = await userService.createUser(authUser.email || authUser.id, {
        id: authUser.id,
        email: authUser.email,
        displayName: authUser.displayName,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        profileImageUrl: authUser.profileImageUrl,
      });
    }

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Build response (exclude sensitive fields)
    const responseData: UserResponse = {
      id: user.id,
      email: user.email || '',
      displayName: user.displayName ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      plan: (user as any).plan,
      role: (user as any).role,
      monthlyGenerationLimit: (user as any).monthlyGenerationLimit,
      createdAt: user.createdAt,
    };

    setNoCacheHeaders(res);
    return sendSuccess(res, responseData);
    
  } catch (error) {
    console.error('[ERROR] /api/auth/user:', error);
    return sendError(
      res,
      'Failed to retrieve user',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}
