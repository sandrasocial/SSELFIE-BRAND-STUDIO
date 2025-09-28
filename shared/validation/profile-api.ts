// Profile API Validation Schemas
import { z } from 'zod';

export const subscriptionDetailsSchema = z.object({
  plan: z.enum(['free', 'basic', 'premium', 'enterprise']),
  status: z.enum(['active', 'cancelled', 'expired', 'past_due']),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
  features: z.array(z.string()),
  limits: z.object({
    monthlyGenerations: z.number().int().min(0),
    storageGb: z.number().min(0),
    modelTraining: z.boolean(),
  }),
});

export const trainingStatusSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  modelId: z.string().optional(),
});

export const userPreferencesSchema = z.object({
  stylePreferences: z.array(z.string()).optional(),
  brandGuidelines: z.string().max(5000).optional(),
  contentTone: z.string().max(100).optional(),
  targetAudience: z.string().max(500).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    trainingComplete: z.boolean(),
    newFeatures: z.boolean(),
  }).optional(),
});

export const updateProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  preferences: userPreferencesSchema.partial().optional(),
});

export const updatePreferencesRequestSchema = z.object({
  stylePreferences: z.array(z.string().max(100)).max(10).optional(),
  brandGuidelines: z.string().max(5000).optional(),
  contentTone: z.string().max(100).optional(),
  targetAudience: z.string().max(500).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    trainingComplete: z.boolean(),
    newFeatures: z.boolean(),
  }).partial().optional(),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmPassword: z.string().min(8).max(128),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateSubscriptionRequestSchema = z.object({
  plan: z.enum(['free', 'basic', 'premium', 'enterprise']),
  paymentMethodId: z.string().optional(),
});

// Validation functions
export function validateUpdateProfileRequest(data: unknown) {
  return updateProfileRequestSchema.safeParse(data);
}

export function validateUpdatePreferencesRequest(data: unknown) {
  return updatePreferencesRequestSchema.safeParse(data);
}

export function validateChangePasswordRequest(data: unknown) {
  return changePasswordRequestSchema.safeParse(data);
}

export function validateUpdateSubscriptionRequest(data: unknown) {
  return updateSubscriptionRequestSchema.safeParse(data);
}

// Additional validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}