import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

/**
 * GET /api/me - Get current user information
 * 
 * This endpoint returns the authenticated user's information,
 * syncing Stack Auth data with the database automatically.
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

      // Get user's training status from database with proper user sync
      let modelStatus = 'not_started';
      let debugInfo: any = {};
      
      try {
        const { storage } = await import('../server/storage.js');
        
        console.log('🔍 DEBUG: Looking up training status for user:', user.id);
        
        // First, ensure the user exists in our database (auto-sync)
        let dbUser = await storage.getUser(user.id);
        if (!dbUser) {
          console.log('🔄 User not found in database, creating from Stack Auth data...');
          
          // Create user from Stack Auth data
          dbUser = await storage.upsertUser({
            id: user.id,
            stackAuthId: user.id, // Link to Stack Auth
            email: user.email,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            plan: user.plan || 'sselfie-studio',
            monthlyGenerationLimit: user.monthlyGenerationLimit || 100,
            mayaAiAccess: true,
            lastLoginAt: new Date()
          } as any);
          
          console.log('✅ Created database user:', dbUser.id);
        }
        
        // Now get training status
        const userModel = await storage.getUserModel(user.id);
        if (userModel && userModel.trainingStatus) {
          modelStatus = userModel.trainingStatus;
          console.log('🎯 Found training status:', modelStatus);
        }
        
        debugInfo = {
          userSynced: true,
          dbUserId: dbUser.id,
          modelFound: !!userModel,
          trainingStatus: modelStatus
        };
        
      } catch (error) {
        console.error('🔍 Error in user sync and training lookup:', error);
        debugInfo = { error: (error as Error).message };
      }

      console.log('🔍 ENHANCED DEBUG: User authenticated for /api/me:', {
        userId: user.id,
        email: user.email,
        plan: user.plan,
        hasStackAuth: !!user.stackUser,
        modelStatus,
        lookupDebug: debugInfo
      });

      // Return user data (excluding sensitive information)
      const userData = {
        ...user,
        // Remove sensitive fields
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        stackUser: undefined, // Don't expose raw Stack Auth data
        // Add training status for routing
        modelStatus
      };

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        success: true,
        user: userData
      });
    }, { 
      optional: false // Auth is required for /api/me
    });

  } catch (error) {
    console.error('❌ /api/me error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


