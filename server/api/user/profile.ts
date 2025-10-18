import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25
} as const;

interface ProfileResponse {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  plan: string | null;
  stats: {
    photos: number;
    followers: number;
    following: number;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const [generatedImages] = await Promise.all([
        storage.getGeneratedImages(user.id)
      ]);

      const fullName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

      const response: ProfileResponse = {
        id: user.id,
        name: fullName,
        email: user.email ?? null,
        avatarUrl: user.profileImageUrl ?? null,
        plan: user.plan ?? null,
        stats: {
          photos: generatedImages.length,
          followers: 0, // Placeholder for future social features
          following: 0  // Placeholder for future social features
        }
      };

      // No-cache for live stats
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(response);
    } catch (error) {
      console.error('❌ /api/user/profile error:', error);
      return res.status(500).json({ error: 'Failed to load profile' });
    }
  });
}

