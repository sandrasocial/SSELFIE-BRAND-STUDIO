/**
 * GET /api/profile - Pure Serverless Implementation
 *
 * Get public profile information for the authenticated user.
 *
 * ✅ PATTERN 1: Accepts middleware-attached user from withAuth wrapper
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../_utils/auth-helpers.js';
import {
  sendSuccess,
  sendUnauthorized,
  sendNotFound,
  sendMethodNotAllowed,
  sendError
} from '../_utils/response-helpers.js';
import { userService } from '../services/user-service.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

interface PublicProfile {
  id: string;
  email: string;
  name?: string;
  gender?: string;
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

    // Get user profile
    const user = await userService.getUser(authUser.id);

    if (!user) {
      return sendNotFound(res, 'User profile');
    }

    // Build public profile response
    const profile: PublicProfile = {
      id: user.id,
      email: user.email || '',
      name: user.displayName ?? undefined,
      gender: (user as any).gender,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, profile);
    
  } catch (error) {
    console.error('[ERROR] /api/profile:', error);
    return sendError(
      res,
      'Failed to retrieve profile',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}
