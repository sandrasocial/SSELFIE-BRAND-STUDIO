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
      return sendUnauthorized(res);
    }

    console.log(`✅ User resolved: ${dbUser.id}, email: ${dbUser.email}`);

    let userModel: any = null;

    // 🔥 CRITICAL FIX: Use dbUser.id for database queries
    // - For OLD users (pre-Stack Auth): id is the original numeric ID where models were created
    // - For NEW users (Stack Auth): id is already the Stack Auth ID
    // - stackAuthId is only used for linking old users to Stack Auth, NOT for queries
    const queryUserId = dbUser.id;

    // Fetch user model using the correct user ID
    try {
      userModel = await storage.getUserModel(queryUserId);
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
      userId: queryUserId,
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
      userId: queryUserId,
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
