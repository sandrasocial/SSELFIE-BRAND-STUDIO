import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';
import { db } from '../server/drizzle.js';
import { mayaModels } from '../shared/schema-maya.js';
import { eq } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25
} as const;

/**
 * GET /api/user-model - Get current user's model training status
 *
 * This endpoint returns the authenticated user's model training information,
 * including training status and progress.
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

      console.log('🔍 User model request for user:', user.id);

      // Check if user has a trained model
      const existingModel = await db
        .select()
        .from(mayaModels)
        .where(eq(mayaModels.userId, user.id))
        .orderBy(mayaModels.createdAt)
        .limit(1);

      if (existingModel && existingModel.length > 0) {
        // Return existing model data
        const model = existingModel[0];
        const userModel = {
          id: model.id,
          userId: model.userId,
          trainingStatus: model.trainingStatus,
          trainingProgress: model.trainingProgress || 0,
          modelType: model.modelType,
          qualityScore: model.qualityScore,
          createdAt: model.createdAt?.toISOString(),
          updatedAt: model.updatedAt?.toISOString()
        };

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(userModel);
      } else {
        // No model exists yet - return default pending status
        const userModel = {
          id: null,
          userId: user.id,
          trainingStatus: 'pending',
          trainingProgress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(userModel);
      }
    }, {
      optional: false // Auth is required for /api/user-model
    });

  } catch (error) {
    console.error('❌ /api/user-model error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}