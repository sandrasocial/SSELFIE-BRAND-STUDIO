// Auth middleware for serverless functions
import type { Request, Response, NextFunction } from 'express';
import { stackServerApp } from '../../stack/server.js';
import type { AuthenticatedRequest, AuthenticatedUser } from '../_shared/auth-types.js';

// Main withAuth function that accepts Express-style or Vercel parameters
export const withAuth = async (
  req: any, // Accept any request type (Express or Vercel)
  res: any, // Accept any response type
  handler: (req: AuthenticatedRequest, res: any) => Promise<any>,
  options?: { optional?: boolean }
) => {
  try {
    // Get the Stack Auth user from the request
    const user = await stackServerApp.getUser();
    
    if (!user && !options?.optional) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user info to request if user exists
    if (user) {
      // Create minimal AuthenticatedUser object
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        stackAuthId: user.id,
        email: user.primaryEmail || null,
        firstName: null,
        lastName: null,
        displayName: user.displayName || null,
        profileImageUrl: user.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        plan: null,
        role: null,
        monthlyGenerationLimit: null,
        generationsUsedThisMonth: null,
        mayaAiAccess: null,
        victoriaAiAccess: null,
        hasRetrainingAccess: null,
        retrainingSessionId: null,
        retrainingPaidAt: null,
        onboardingProgress: null,
        preferredOnboardingMode: null,
        gender: null,
        profession: null,
        brandStyle: null,
        photoGoals: null,
        stackUser: user as any
      };
      (req as AuthenticatedRequest).user = authenticatedUser;
    }

    return await handler(req as AuthenticatedRequest, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (options?.optional) {
      return await handler(req as AuthenticatedRequest, res);
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default withAuth;
