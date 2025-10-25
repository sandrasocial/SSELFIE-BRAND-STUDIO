/**
 * GET /api/user-model - Pure Serverless Implementation
 * 
 * Returns user's model training status with bulletproof user lookup.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendSuccess, sendUnauthorized, sendMethodNotAllowed, sendError, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    // ✅ FIXED: When called through withAuth middleware, req.user is already set as AuthenticatedUser
    // When called directly (legacy), fall back to getUserFromRequest
    let dbUser = (req as any).user;

    if (!dbUser) {
      console.log('⚠️ No user attached to request, attempting getUserFromRequest fallback');
      dbUser = await getUserFromRequest(req);
    }

    if (!dbUser) {
      console.log('❌ No authenticated user found');
      return sendUnauthorized(res);
    }

    console.log(`✅ User resolved: ${dbUser.id}, email: ${dbUser.email}, stackAuthId: ${dbUser.stackAuthId || 'none'}`);

    let userModel: any = null;

    // 🔥 CRITICAL FIX: Enhanced user model lookup with bulletproof linking
    // Try multiple lookup strategies to ensure existing models are found
    const queryUserId = dbUser.id;

    console.log(`🔍 Starting model lookup for user ID: ${queryUserId}`);

    // Fetch user model using multiple strategies
    try {
      // Strategy 1: Direct user ID lookup
      userModel = await storage.getUserModel(queryUserId);
      console.log(`📊 Direct model lookup result: ${userModel ? 'found' : 'not found'}`);
      if (userModel) {
        console.log(`📊 Model details: id=${userModel.id}, trainingStatus=${userModel.trainingStatus}, userId=${userModel.userId}`);
      }

      // Strategy 2: If no model found and user has email, try bulletproof lookup
      if (!userModel && dbUser.email && dbUser.stackAuthId) {
        console.log(`🔍 Attempting bulletproof lookup with stackAuthId: ${dbUser.stackAuthId.substring(0, 8)}... and email: ${dbUser.email}`);
        const bulletproofResult = await storage.getUserModelByStackAuthAndEmail(dbUser.stackAuthId, dbUser.email);
        if (bulletproofResult.model) {
          userModel = bulletproofResult.model;
          console.log(`✅ Bulletproof lookup found model: ${userModel.id}, status: ${userModel.trainingStatus}`);
        } else {
          console.log(`❌ Bulletproof lookup found no model`);
        }
      }

      // Strategy 3: Legacy email-based lookup for pre-Stack Auth users
      if (!userModel && dbUser.email) {
        console.log(`🔍 Attempting legacy email-based lookup for: ${dbUser.email}`);
        const userByEmail = await storage.getUserByEmail(dbUser.email);
        if (userByEmail && userByEmail.id !== queryUserId) {
          const legacyModel = await storage.getUserModel(userByEmail.id);
          if (legacyModel) {
            console.log(`� Found legacy model for user ${userByEmail.id}, linking to current user ${queryUserId}`);
            userModel = legacyModel;
          }
        }
      }

    } catch (error) {
      console.warn('📊 Model fetch failed:', error);
    }

    const trainingStatus = userModel?.trainingStatus || 'not_started';
    const needsTraining = trainingStatus !== 'completed';
    const canRetrain = !!userModel;

    console.log(`✅ Final model status: trainingStatus=${trainingStatus}, needsTraining=${needsTraining}, canRetrain=${canRetrain}`);

    // Parse onboarding source safely
    let onboardingSource = 'unknown';
    try {
      const op = dbUser.onboardingProgress;
      if (op) {
        const obj = typeof op === 'string' ? JSON.parse(op) : op;
        onboardingSource = obj?.source || 'unknown';
      }
    } catch {
      // Ignore parsing errors
    }

    const modelStatus = {
      id: userModel?.id || null,
      userId: queryUserId,
      trainingStatus,
      needsTraining,
      canRetrain,
      modelType: 'sselfie-studio',
      createdAt: userModel?.createdAt || null,
      updatedAt: userModel?.updatedAt || null,
      userPlan: dbUser.plan,
      hasActiveSubscription: dbUser.monthlyGenerationLimit === -1 || (dbUser.monthlyGenerationLimit && dbUser.monthlyGenerationLimit > 0),
      onboardingSource,
      // DEBUG: Add debug information
      debug: {
        userId: queryUserId,
        userEmail: dbUser.email,
        stackAuthId: dbUser.stackAuthId,
        modelFound: !!userModel,
        modelId: userModel?.id,
        modelUserId: userModel?.userId,
        modelTrainingStatus: userModel?.trainingStatus
      }
    };

    console.log(`✅ Returning model status:`, {
      userId: queryUserId,
      trainingStatus,
      needsTraining,
      canRetrain,
      hasModel: !!userModel
    });

    setNoCacheHeaders(res);
    return sendSuccess(res, modelStatus);

  } catch (error) {
    console.error('❌ Error in /api/user-model:', error);
    return sendError(res, 'Failed to retrieve user model', 500);
  }
}
