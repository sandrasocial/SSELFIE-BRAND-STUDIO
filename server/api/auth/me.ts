/**
 * GET /api/me
 * 
 * Returns the current authenticated user's profile
 * ✅ MIGRATED from server/routes/modules/auth.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth';
import type { AuthenticatedRequest } from '../../_shared/auth-types';

interface UserProfile {
  id: string;
  email: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  gender?: string | null;
  plan?: string | null;
  role?: string | null;
  monthlyGenerationLimit?: number | null;
  createdAt: Date;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      // Set no-cache headers
      res.setHeader('Cache-Control', 'no-store');

      const dbUser = req.user;

      if (!dbUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Convert to UserProfile format
      const user: UserProfile = {
        id: dbUser.id,
        email: dbUser.email ?? null,
        displayName: dbUser.displayName ?? undefined,
        firstName: dbUser.firstName ?? undefined,
        lastName: dbUser.lastName ?? undefined,
        gender: dbUser.gender ?? undefined,
        profileImageUrl: dbUser.profileImageUrl ?? undefined,
        plan: dbUser.plan ?? undefined,
        role: dbUser.role ?? undefined,
        monthlyGenerationLimit: dbUser.monthlyGenerationLimit ?? undefined,
        createdAt: dbUser.createdAt
      };

      return res.status(200).json({
        data: { user }
      });
    } catch (error) {
      console.error('❌ GET /api/me failed:', error);
      return res.status(500).json({
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

