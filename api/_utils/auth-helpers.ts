/**
 * Authentication helper utilities for Vercel serverless functions
 */

import type { VercelRequest } from '@vercel/node';
import type { DatabaseUser } from '../_shared/auth-types.js';
import { getHeader } from './request-helpers.js';

export function getUserFromRequest(req: VercelRequest): DatabaseUser | null {
  const authHeader = getHeader(req, 'authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // In production, validate the token and extract user info
  // For now, return a placeholder
  return {
    id: 'user-id',
    stackAuthId: null,
    email: 'user@example.com',
    firstName: null,
    lastName: null,
    displayName: null,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
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
  };
}

export function getAuthToken(req: VercelRequest): string | null {
  const authHeader = getHeader(req, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

export function isAuthenticated(req: VercelRequest): boolean {
  return !!getAuthToken(req);
}

