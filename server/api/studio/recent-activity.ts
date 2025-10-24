/**
 * Studio Recent Activity API - Pure Serverless
 * GET /api/studio/recent-activity
 *
 * Returns a lightweight recent activity feed for the Studio dashboard.
 * Currently uses generation trackers completed/failed within the last 72 hours.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = user.id;

      // Limit window to last 72 hours for a concise feed
      const windowHours = 72;
      const windowMs = windowHours * 60 * 60 * 1000;
      const cutoff = Date.now() - windowMs;

      // Fetch trackers and gallery images in parallel
      const [trackers, aiImages, generatedImages] = await Promise.all([
        storage.getCompletedGenerationTrackersForUser(userId, windowHours).catch(() => []),
        storage.getAIImages(userId).catch(() => [] as any[]),
        storage.getGeneratedImages(userId).catch(() => [] as any[]),
      ]);

      // Build tracker activities
      const trackerActivities = (trackers || []).map((t: any) => {
        let count = 0;
        try {
          if (t?.imageUrls) {
            const arr = JSON.parse(String(t.imageUrls));
            if (Array.isArray(arr)) count = arr.length;
          }
        } catch {
      // Intentionally ignoring errors
    }
        return {
          id: `tracker_${String(t?.id ?? Math.random())}`,
          createdAt: new Date(t?.updatedAt || t?.createdAt || Date.now()),
          action: count > 0
            ? `Generated ${count} photo${count === 1 ? '' : 's'}${t?.prompt ? ` • ${String(t.prompt).slice(0, 40)}` : ''}`
            : (t?.status === 'failed' ? 'Generation failed' : 'Generation completed')
        };
      });

      // Build gallery image activities (AI images)
      const aiActivities = (aiImages || [])
        .filter((img: any) => {
          const ts = new Date(img?.createdAt || Date.now()).getTime();
          return ts >= cutoff;
        })
        .map((img: any) => ({
          id: `ai_${String(img?.id ?? Math.random())}`,
          createdAt: new Date(img?.createdAt || Date.now()),
          action: `Photo added to gallery${img?.style ? ` • ${String(img.style)}` : ''}`
        }));

      // Build generated image activities (multiple URLs per record)
      const genActivities = (generatedImages || [])
        .filter((img: any) => {
          const ts = new Date(img?.createdAt || Date.now()).getTime();
          return ts >= cutoff;
        })
        .map((img: any) => {
          let count = 0;
          try {
            const arr = img?.imageUrls ? JSON.parse(String(img.imageUrls)) : [];
            if (Array.isArray(arr)) count = arr.length;
          } catch {
      // Intentionally ignoring errors
    }
          return {
            id: `gen_${String(img?.id ?? Math.random())}`,
            createdAt: new Date(img?.createdAt || Date.now()),
            action: count > 0
              ? `Added ${count} photo${count === 1 ? '' : 's'} to gallery${img?.category ? ` • ${String(img.category)}` : ''}`
              : `Photo added to gallery${img?.category ? ` • ${String(img.category)}` : ''}`
          };
        });

      // Merge and sort
      const activities = [...trackerActivities, ...aiActivities, ...genActivities]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ activities });
    } catch (error) {
      console.error('❌ Studio Recent Activity: error', error);
      return res.status(200).json({ activities: [] });
    }
  });
}

