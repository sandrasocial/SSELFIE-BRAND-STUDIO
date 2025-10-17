/**
 * ✅ UNIFIED Authentication Type Definitions for Vercel Serverless Functions
 *
 * This file defines all authentication-related types used across the serverless API.
 * It mirrors the types in server/_shared/auth-types.ts for consistency.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { StackAuthUserInfo } from './stack-auth-types.js';

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export interface OnboardingProgress {
  step?: number;
  completedSteps?: string[];
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// DATABASE USER TYPES
// ============================================================================

/**
 * DatabaseUser - Matches the `users` table in shared/schema.ts
 * This is the core user object stored in the database
 */
export interface DatabaseUser {
  // Core user fields - Stack Auth compatible
  id: string;
  stackAuthId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  profileImageUrl: string | null;

  // Stack Auth managed timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;

  // Business logic - preserved from existing system
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string | null; // sselfie-studio for €47/month, admin for unlimited
  role: string | null; // user, admin
  monthlyGenerationLimit: number | null; // 100 for sselfie-studio plan, unlimited (-1) for admin
  generationsUsedThisMonth: number | null;
  mayaAiAccess: boolean | null; // Available on both tiers
  victoriaAiAccess: boolean | null; // Only for full-access tier

  // PHASE 3: Retraining access tracking
  hasRetrainingAccess: boolean | null;
  retrainingSessionId: string | null;
  retrainingPaidAt: Date | null;

  // Conversational onboarding tracking - Maya handles incomplete profiles gracefully
  onboardingProgress: OnboardingProgress | null; // JSON data
  preferredOnboardingMode: string | null; // conversational, guided, completed

  // Essential profile data for Maya personalization
  gender: string | null; // "man" | "woman" | "non-binary" - CRITICAL for image generation
  profession: string | null; // User's business/profession
  brandStyle: string | null; // "professional" | "creative" | "lifestyle" | "luxury"
  photoGoals: string | null; // What they want photos for (business use case)
}

/**
 * AuthenticatedUser - DatabaseUser + Stack Auth info
 * This is what gets attached to the request after authentication
 */
export interface AuthenticatedUser extends DatabaseUser {
  stackUser: StackAuthUserInfo;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * AuthenticatedRequest - VercelRequest with authenticated user
 */
export interface AuthenticatedRequest extends VercelRequest {
  user: AuthenticatedUser;
}

/**
 * AuthenticatedHandler - Function that handles authenticated requests
 */
export type AuthenticatedHandler<T = void> = (
  req: AuthenticatedRequest,
  res: VercelResponse
) => Promise<T>;

/**
 * AuthOptions - Options for authentication middleware
 */
export interface AuthOptions {
  bypass?: boolean;  // Bypass authentication (for cron jobs, webhooks)
  optional?: boolean; // Don't require authentication
}

/**
 * AuthResponse - Standard response type for auth endpoints
 */
export interface AuthResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

