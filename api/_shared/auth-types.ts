import { StackAuthUserInfo } from './stack-auth-types.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// JSON data types for flexible storage
export interface OnboardingProgress {
  step?: number;
  completedSteps?: string[];
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

// Define User interface based on the actual database schema
// This matches the `users` table in shared/schema.ts
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

export interface AuthenticatedUser extends DatabaseUser {
  stackUser: StackAuthUserInfo;
}

export interface AuthenticatedRequest extends VercelRequest {
  user: AuthenticatedUser;
}

// Handler that requires authentication
export type AuthenticatedHandler<T = void> = (
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