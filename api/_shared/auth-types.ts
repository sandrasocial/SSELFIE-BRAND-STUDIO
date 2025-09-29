import { StackAuthUserInfo } from './stack-auth-types.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

export type AuthenticatedRequest = VercelRequest & {
  user: AuthenticatedUser;
};

export interface AuthenticatedUser {
  id: string;
  stackAuthId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: string;
  role: 'user' | 'admin';
  monthlyGenerationLimit: number;
  generationsUsedThisMonth: number;
  mayaAiAccess: boolean;
  victoriaAiAccess: boolean;
  hasRetrainingAccess: boolean;
  retrainingSessionId?: string;
  retrainingPaidAt?: Date;
  onboardingProgress: unknown;
  preferredOnboardingMode: string;
  gender?: string;
  profession?: string;
  brandStyle?: string;
  photoGoals?: string;
  trainingCoachingStarted: boolean;
  trainingCoachingCompleted: boolean;
  trainingCoachingPhase?: string;
  trainingCoachingStep: number;
  brandStrategyContext?: unknown;
  stackUser: StackAuthUserInfo;
}

import { Request } from 'express';

// Legacy interface for Express - using VercelRequest version instead

// Handler that requires authentication
export type AuthenticatedHandler<T = any> = (
  req: AuthenticatedRequest,
  res: VercelResponse
) => Promise<T>;

// Options for auth middleware
export interface AuthOptions {
  bypass?: boolean;
  optional?: boolean;
}

// Standard response type for auth endpoints
export interface AuthResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

// Augment VercelRequest type to include authenticated user
// declare module '@vercel/node' {
//   interface VercelRequest {
//     user?: AuthenticatedUser;
//   }
// }