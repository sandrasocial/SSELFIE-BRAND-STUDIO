import { StackAuthUserInfo } from './stack-auth-types.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Define User interface based on the actual database schema
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
  onboardingProgress: any; // JSON data
  preferredOnboardingMode: string | null; // conversational, guided, completed
  
  // Essential profile data for Maya personalization
  gender: string | null; // "man" | "woman" | "non-binary" - CRITICAL for image generation
  profession: string | null; // User's business/profession
  brandStyle: string | null; // "professional" | "creative" | "lifestyle" | "luxury"
  photoGoals: string | null; // What they want photos for (business use case)
  
  // Training-time coaching system for brand strategy discovery
  trainingCoachingStarted: boolean | null;
  trainingCoachingCompleted: boolean | null;
  trainingCoachingPhase: string | null; // businessGoals, platformStrategy, brandPositioning, completed
  trainingCoachingStep: number | null;
  brandStrategyContext: any; // JSON data - Stores coaching responses and brand strategy insights
}

export interface StackAuthUser extends StackAuthUserInfo {
  id: string; // Make id required
  email: string; // Make email required
}

export interface AuthenticatedUser extends DatabaseUser {
  stackUser: StackAuthUser; // Use the non-optional version
}

export interface AuthenticatedRequest extends VercelRequest {
  user: AuthenticatedUser;
  cookies: Record<string, string>;
}

// Handler that requires authentication
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: VercelResponse
) => Promise<void>;

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