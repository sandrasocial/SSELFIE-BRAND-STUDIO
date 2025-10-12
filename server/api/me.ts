/**
 * GET /api/me - Pure Serverless Implementation
 * 
 * Returns current authenticated user profile.
 * This is a template example of pure serverless pattern.
 * 
 * KEY DIFFERENCES FROM EXPRESS ROUTER:
 * - No Router(), just export default handler
 * - No middleware chain, direct auth function calls
 * - No asyncHandler, native try/catch
 * - No Express types, only Vercel types
 * - Direct res.status().json() calls
 * - Method guards at function start
 * - Early returns for errors
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../_utils/auth-helpers.js';
import { 
  sendSuccess, 
  sendUnauthorized, 
  sendMethodNotAllowed,
  sendError,
  setNoCacheHeaders 
} from '../_utils/response-helpers.js';
import { storage } from '../storage.js';

// Vercel serverless configuration
export const config = {
  runtime: 'nodejs',
  maxDuration: 25, // 25 seconds timeout
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method guard - only allow GET
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    // 2. Authentication - pure function, no middleware
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return sendUnauthorized(res);
    }

    // 3. Business logic - get user profile
    const userProfile = await storage.getUser(user.id);
    
    if (!userProfile) {
      return sendError(res, 'User profile not found', 404);
    }

    // 4. Response - no cache headers + success
    setNoCacheHeaders(res);
    return sendSuccess(res, { user: userProfile });
    
  } catch (error) {
    // 5. Error handling - clean, simple logging
    console.error('[ERROR] /api/me:', error);
    
    return sendError(
      res,
      'Failed to retrieve user profile',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}
