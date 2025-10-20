/**
 * Test Authentication Endpoint
 * Simple endpoint to test if authentication middleware is working
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../server/_middleware/auth.js';
import type { AuthenticatedRequest } from '../server/_shared/auth-types.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test with optional auth to see if middleware works
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    const user = req.user;
    
    return res.status(200).json({
      success: true,
      message: 'Authentication test successful',
      user: {
        id: user?.id?.substring(0, 8) + '...' || 'no-id',
        email: user?.email || 'no-email',
        stackAuthId: user?.stackAuthId?.substring(0, 8) + '...' || 'no-stack-id'
      }
    });
  }, { optional: true });
}