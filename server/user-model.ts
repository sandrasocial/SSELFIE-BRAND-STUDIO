import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';

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

      // FIXED: Use the same storage service as /api/me for consistency
      const { storage } = await import('../server/storage.js');
      
      try {
        // Get user model from the correct table (userModels, not mayaModels)
        const existingModel = await storage.getUserModel(user.id);

        if (existingModel) {
          // Return existing model data in the format expected by the client
          const userModel = {
            id: existingModel.id,
            userId: existingModel.userId,
            trainingStatus: existingModel.trainingStatus,
            trainingProgress: existingModel.trainingProgress || 0,
            modelType: existingModel.modelType,
            needsTraining: existingModel.trainingStatus !== 'completed',
            canRetrain: existingModel.trainingStatus === 'completed',
            createdAt: existingModel.createdAt?.toISOString(),
            updatedAt: existingModel.updatedAt?.toISOString(),
            // Add fields that PostLoginHandler might check
            replicateModelId: existingModel.replicateModelId,
            replicateVersionId: existingModel.replicateVersionId,
            modelName: existingModel.modelName
          };

          console.log('✅ Found user model:', { 
            userId: user.id, 
            trainingStatus: userModel.trainingStatus,
            needsTraining: userModel.needsTraining
          });

          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).json(userModel);
        } else {
          // No model exists yet - return default status that will route to training
          const userModel = {
            id: null,
            userId: user.id,
            trainingStatus: 'not_started',
            trainingProgress: 0,
            needsTraining: true,
            canRetrain: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          console.log('ℹ️ No model found for user, returning default:', { 
            userId: user.id, 
            trainingStatus: userModel.trainingStatus 
          });

          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).json(userModel);
        }
      } catch (modelError) {
        console.error('❌ Error fetching user model:', modelError);
        
        // Return safe fallback that routes to training
        const userModel = {
          id: null,
          userId: user.id,
          trainingStatus: 'not_started',
          trainingProgress: 0,
          needsTraining: true,
          canRetrain: false,
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