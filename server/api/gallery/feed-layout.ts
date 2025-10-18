import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';
import type { SaveFeedLayoutRequest } from '../../../shared/types/feed-layout.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      try {
        const record = await storage.getFeedLayout(user.id);
        if (!record) {
          return res.status(200).json({ layout: [], updatedAt: new Date().toISOString() });
        }
        return res.status(200).json({ layout: record.layout || [], updatedAt: (record.updatedAt || new Date()).toISOString() });
      } catch (error) {
        console.error('❌ Feed Layout GET error:', error);
        return res.status(500).json({ error: 'Failed to load feed layout' });
      }
    }

    if (req.method === 'POST') {
      try {
        const body = (req.body || {}) as SaveFeedLayoutRequest;
        const layout = Array.isArray(body.layout) ? body.layout : [];
        if (!Array.isArray(layout)) {
          return res.status(400).json({ error: 'Invalid layout format' });
        }
        await storage.upsertFeedLayout(user.id, layout);
        return res.status(200).json({ success: true, savedAt: new Date().toISOString() });
      } catch (error) {
        console.error('❌ Feed Layout POST error:', error);
        return res.status(500).json({ error: 'Failed to save feed layout' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  });
}

