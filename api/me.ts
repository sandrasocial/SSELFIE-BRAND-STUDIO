import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

/**
 * GET /api/me - Get current user information
 * 
 * This endpoint returns the authenticated user's information,
 * syncing Stack Auth data with the database automatically.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    return await withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: 'Not authenticated',
          message: 'User not found in request'
        });
      }

      console.log('✅ /api/me success:', {
        userId: user.id,
        email: user.email,
        plan: user.plan,
        hasStackAuth: !!user.stackUser
      });

      // Return user data (excluding sensitive information)
      const userData = {
        ...user,
        // Remove sensitive fields
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        stackUser: undefined, // Don't expose raw Stack Auth data
      };

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        success: true,
        user: userData
      });
    }, { 
      optional: false // Auth is required for /api/me
    });

  } catch (error) {
    console.error('❌ /api/me error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


