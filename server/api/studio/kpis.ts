/**
 * Studio KPIs API - Pure Serverless
 * GET /api/studio/kpis
 * 
 * Returns lightweight KPI counts for the Studio dashboard
 * - activeSessions: number of processing generation trackers
 * - queueCount: number of pending/processing trackers
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 15
} as const;

function isQueueStatus(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'pending' || s === 'processing' || s === 'starting';
}

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

      // 🔥 CRITICAL FIX: Use user.id for database queries
      // - For OLD users (pre-Stack Auth): id is the original numeric ID where data was created
      // - For NEW users (Stack Auth): id is already the Stack Auth ID
      // - stackAuthId is only used for linking old users to Stack Auth, NOT for queries
      const userId = user.id;

      // Small timeout safety to avoid hanging in serverless env
      const withTimeout = <T,>(p: Promise<T>, ms: number) => {
        return Promise.race<T>([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)) as Promise<T>
        ]);
      };

      const trackers = await withTimeout(storage.getUserGenerationTrackers(userId), 2000).catch(() => [] as any[]);

      const activeSessions = trackers.filter(t => (t?.status || '').toLowerCase() === 'processing').length;
      const queueCount = trackers.filter(t => isQueueStatus(t?.status)).length;

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ activeSessions, queueCount });
    } catch (error) {
      console.error('❌ Studio KPIs: error', error);
      return res.status(200).json({ activeSessions: 0, queueCount: 0 });
    }
  });
}

