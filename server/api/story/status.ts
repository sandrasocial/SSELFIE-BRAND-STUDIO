/**
 * GET /api/story/status/:jobId
 * 
 * Check the status of a story generation job
 * ✅ MIGRATED from server/routes/modules/ai-generation.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth';
import type { AuthenticatedRequest } from '../../_shared/auth-types';

interface StoryStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const { jobId } = req.query;
      const userId = req.user.id;

      if (!jobId || typeof jobId !== 'string') {
        return res.status(400).json({ error: 'Job ID is required' });
      }

      // TODO: Implement story status checking
      const status: StoryStatus = {
        jobId,
        status: 'processing',
        progress: 50,
        message: 'Story generation in progress'
      };

      const responseData = {
        data: { status }
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('❌ GET /api/story/status failed:', error);
      return res.status(500).json({
        error: 'Failed to fetch story status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

