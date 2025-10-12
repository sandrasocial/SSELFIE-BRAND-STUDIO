/**
 * Training Routes
 * Handles model training, user models, and training status
 * 
 * Migrated from server/index.ts (Day 3, Phase 2)
 * Production code with bulletproof user lookup and timeout handling
 */

import { Router, type Response as ExpressResponse } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler } from '../middleware/error-handler.js';
import type { AuthenticatedRequest } from '../../../shared/types/ai-generation.js';
import { withDatabaseTimeout, withDatabaseTimeoutAndRetry, isTimeoutError } from '../../_utils/timing.js';
import { storage } from '../../storage.js';

const router = Router();

// Types for user model
interface UserModel {
  id: number;
  userId: string;
  trainingStatus: string | null;
  trainingProgress?: number | null;
  replicateModelId?: string | null;
  replicateVersionId?: string | null;
  triggerWord?: string | null;
  modelType?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Helper to get authenticated user from request
async function getAuthenticatedUser(req: AuthenticatedRequest) {
  if (!req.user || !req.user.id) {
    throw new Error('Authentication required');
  }
  return req.user;
}

// JSON response helper
function json(res: ExpressResponse, status: number, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(data);
}

// Timing helper
function logStart(label: string) {
  const start = Date.now();
  return {
    end: (status: string, meta?: any) => {
      const elapsed = Date.now() - start;
      console.log(`⏱️  ${label} [${status}] ${elapsed}ms`, meta || '');
      return elapsed;
    }
  };
}

// ============================================================================
// USER MODEL ENDPOINT - Critical for onboarding and training status
// ============================================================================
router.get('/api/user-model', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const t = logStart('GET /api/user-model');
  
  try {
    const user = await getAuthenticatedUser(req);
    
    let dbUser: any = null;
    let userModel: UserModel | null = null;
    
    // 🛡️ CRITICAL FIX: req.user is already the database user from stack-auth middleware
    // The stack-auth middleware already does the full lookup (by Stack Auth ID, then by email, then links)
    // So user.id is the database ID (e.g., "42585527"), not the Stack Auth UUID
    dbUser = user;
    
    console.log('✅ Using authenticated database user:', {
      userId: dbUser.id,
      email: dbUser.email,
      plan: dbUser.plan,
      stackAuthId: dbUser.stackAuthId
    });
    
    // Get their training model (cache hit returns instantly, no timeout needed)
    try {
      userModel = await storage.getUserModel(dbUser.id) || null;
      
      console.log('🔍 Model lookup result:', {
        foundModel: !!userModel,
        trainingStatus: userModel?.trainingStatus || 'not_started'
      });
    } catch (dbError) {
      console.error('❌ Error fetching user model:', {
        userId: dbUser.id,
        error: (dbError as Error).message
      });
      userModel = null;
    }
    
    // 🎯 If no database user found, create minimal fallback model for new users
    if (!dbUser) {
      console.warn(`❌ User ${user.id} authenticated but missing DB record. Creating minimal fallback model.`);
      
      const minimalModel = {
        id: null,
        userId: user.id,
        trainingStatus: 'not_started' as const,
        needsTraining: true,
        canRetrain: false,
        modelType: 'sselfie-studio',
        createdAt: null,
        updatedAt: null,
        userPlan: 'sselfie-studio',
        hasActiveSubscription: false,
        onboardingSource: 'unknown'
      };
      
      res.setHeader('Cache-Control', 'no-store');
      t.end('fallback');
      json(res, 200, minimalModel);
      return;
    }
    
    // Fetch user model if not already obtained from bulletproof lookup
    if (dbUser && !userModel) {
      try {
        const result = await withDatabaseTimeout(
          storage.getUserModel(dbUser.id), 
          null,
          8000,
          'getUserModel'
        );
        userModel = result ?? null;
      } catch (error) {
        console.warn('📊 Model fetch failed or timed out for:', dbUser.id, (error as Error).message);
        userModel = null;
      }
    }
    
    let trainingStatus = 'not_started';
    let needsTraining = true;
    let canRetrain = false;
    
    if (userModel) {
      trainingStatus = userModel.trainingStatus || 'not_started';
      needsTraining = trainingStatus !== 'completed';
      canRetrain = true;
    } else {
      needsTraining = true;
      canRetrain = false;
    }
    
    let onboardingSourceSafe = 'unknown';
    try {
      const op = (dbUser as any).onboardingProgress;
      if (op) {
        const obj = typeof op === 'string' ? JSON.parse(op) : op;
        onboardingSourceSafe = (obj && obj.source) || 'unknown';
      }
    } catch {
      // Ignore parsing errors
    }

    const modelStatus = {
      id: userModel?.id || null,
      userId: dbUser.id,
      trainingStatus: trainingStatus,
      needsTraining: needsTraining,
      canRetrain: canRetrain,
      modelType: 'sselfie-studio',
      createdAt: userModel?.createdAt || null,
      updatedAt: userModel?.updatedAt || null,
      userPlan: dbUser.plan,
      hasActiveSubscription: (dbUser.monthlyGenerationLimit === -1 || (dbUser.monthlyGenerationLimit && dbUser.monthlyGenerationLimit > 0)),
      onboardingSource: onboardingSourceSafe
    };
    
    res.setHeader('Cache-Control', 'no-store');
    t.end('ok');
    json(res, 200, modelStatus);
    
  } catch (error) {
    const elapsed = t.end('error', { error: (error as Error).message });
    console.error('❌ Critical Error in /api/user-model:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      elapsedMs: elapsed
    });
    
    if (isTimeoutError(error)) {
      json(res, 500, { 
        error: 'Database timeout - please try again',
        message: 'Service temporarily unavailable',
        code: 'TIMEOUT'
      });
      return;
    }
    
    json(res, 500, { 
      error: 'Failed to retrieve user data',
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// ============================================================================
// TRAINING STATUS ENDPOINT
// ============================================================================
router.get('/api/training/status', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const user = await getAuthenticatedUser(req);
    const model = await storage.getUserModelByUserId(user.id as string);
    const status = model?.trainingStatus || 'not_started';
    const progress = model?.trainingProgress || (status === 'completed' ? 100 : 0);
    const predictionId = (await storage.getUserGenerationTrackers(user.id as string))?.[0]?.predictionId || null;
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status, progress, predictionId, model });
  } catch (error) {
    res.status(401).json({ 
      error: 'Authentication required', 
      message: (error as Error).message 
    });
  }
}));

// ============================================================================
// TRAINING PROGRESS ENDPOINT (User-specific)
// ============================================================================
router.get('/api/training-progress/:userId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const user = await getAuthenticatedUser(req);
    const targetUserId = req.params.userId;
    
    // Ensure user can only access their own progress
    if ((user.id as string) !== targetUserId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    
    const model = await storage.getUserModelByUserId(targetUserId);
    const progress = model?.trainingProgress || (model?.trainingStatus === 'completed' ? 100 : 0);
    
    res.status(200).json({ progress });
  } catch (error) {
    res.status(401).json({ error: 'Authentication required' });
  }
}));

export default router;