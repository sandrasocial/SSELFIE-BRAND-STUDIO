import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25
} as const;

interface RecentImage {
  id: number;
  url: string;
  createdAt?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const limitParam = Array.isArray(req.query?.limit) ? req.query.limit[0] : (req.query?.limit as string | undefined);
      const limit = Math.max(1, Math.min(24, Number(limitParam) || 6));

      const images = await storage.getGeneratedImages(user.id);
      const recent = images.slice(0, limit).map((img) => {
        let firstUrl: string | undefined;
        try {
          const arr = JSON.parse(img.imageUrls || '[]');
          firstUrl = Array.isArray(arr) ? arr[0] : undefined;
        } catch {
          firstUrl = undefined;
        }
        const url = img.selectedUrl || firstUrl || '';
        return {
          id: img.id,
          url,
          createdAt: (img.createdAt as unknown as Date)?.toISOString?.() || undefined
        } as RecentImage;
      }).filter(i => i.url);

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ images: recent });
    } catch (error) {
      console.error('\u274c /api/user/recent-images error:', error);
      return res.status(500).json({ error: 'Failed to load recent images' });
    }
  });
}

