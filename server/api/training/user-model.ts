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
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    let dbUser: any = null;
    let userModel: any = null;

    // Bulletproof user lookup with Stack Auth ID
    try {
      const foundUser = await storage.getUserByStackAuthId(user.id);
      dbUser = foundUser || null;

      if (dbUser?.id) {
        const foundModel = await storage.getUserModel(dbUser.id);
        userModel = foundModel || null;
      }
    } catch (error) {
      console.error('❌ User lookup failed:', error);
      
      // Fallback to traditional lookup
      try {
        dbUser = await storage.getUser(user.id);
        if (!dbUser && user.email) {
          dbUser = await storage.getUserByEmail(user.email);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback lookup failed:', fallbackError);
      }
    }

    // If no DB user, return minimal fallback model
    if (!dbUser) {
      const minimalModel = {
        id: null,
        userId: user.id,
        trainingStatus: 'not_started',
        needsTraining: true,
        canRetrain: false,
        modelType: 'sselfie-studio',
        createdAt: null,
        updatedAt: null,
        userPlan: 'sselfie-studio',
        hasActiveSubscription: false,
        onboardingSource: 'unknown'
      };

      setNoCacheHeaders(res);
      return sendSuccess(res, minimalModel);
    }

    // Fetch model if not already obtained
    if (dbUser && !userModel) {
      try {
        userModel = await storage.getUserModel(dbUser.id);
      } catch (error) {
        console.warn('📊 Model fetch failed:', error);
      }
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

    setNoCacheHeaders(res);
    return sendSuccess(res, modelStatus);

  } catch (error) {
    console.error('❌ Error in /api/user-model:', error);
    return sendError(res, 'Failed to retrieve user model', 500);
  }
}
