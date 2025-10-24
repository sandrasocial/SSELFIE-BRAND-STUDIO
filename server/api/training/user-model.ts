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
    // ✅ FIXED: getUserFromRequest returns a properly linked database user
    // It already handles Stack Auth ID linking via resolveUserWithAutoLinking
    const dbUser = await getUserFromRequest(req);
    if (!dbUser) {
      return sendUnauthorized(res);
    }

    console.log(`✅ User resolved: ${dbUser.id}, email: ${dbUser.email}`);

    let userModel: any = null;

    // Fetch user model using the database user ID
    try {
      userModel = await storage.getUserModel(dbUser.id);
      console.log(`📊 Model lookup result: ${userModel ? 'found' : 'not found'}`);
    } catch (error) {
      console.warn('📊 Model fetch failed:', error);
    }

    const trainingStatus = userModel?.trainingStatus || 'not_started';
    const needsTraining = trainingStatus !== 'completed';
    const canRetrain = !!userModel;

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
      userId: dbUser.id,
      trainingStatus,
      needsTraining,
      canRetrain,
      modelType: 'sselfie-studio',
      createdAt: userModel?.createdAt || null,
      updatedAt: userModel?.updatedAt || null,
      userPlan: dbUser.plan,
      hasActiveSubscription: dbUser.monthlyGenerationLimit === -1 || (dbUser.monthlyGenerationLimit && dbUser.monthlyGenerationLimit > 0),
      onboardingSource
    };

    console.log(`✅ Returning model status:`, {
      userId: dbUser.id,
      trainingStatus,
      needsTraining,
      canRetrain
    });

    setNoCacheHeaders(res);
    return sendSuccess(res, modelStatus);

  } catch (error) {
    console.error('❌ Error in /api/user-model:', error);
    return sendError(res, 'Failed to retrieve user model', 500);
  }
}
