// Profile API Type Definitions
// Based on User Journey Doc Section 7

export interface SubscriptionDetails {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  features: string[];
  limits: {
    monthlyGenerations: number;
    storageGb: number;
    modelTraining: boolean;
  };
}

export interface TrainingStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  modelId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences: UserPreferences;
  trainingStatus: TrainingStatus;
  subscription: SubscriptionDetails;
  usage: {
    monthlyGenerations: number;
    storageUsed: number;
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  stylePreferences?: string[];
  brandGuidelines?: string;
  contentTone?: string;
  targetAudience?: string;
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    trainingComplete: boolean;
    newFeatures: boolean;
  };
}

export interface ProfileError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Request types
export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdatePreferencesRequest {
  stylePreferences?: string[];
  brandGuidelines?: string;
  contentTone?: string;
  targetAudience?: string;
  language?: string;
  timezone?: string;
  notifications?: Partial<UserPreferences['notifications']>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateSubscriptionRequest {
  plan: SubscriptionDetails['plan'];
  paymentMethodId?: string;
}

// Response types
export interface ProfileResponse {
  profile: UserProfile;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
}

export interface SubscriptionResponse {
  subscription: SubscriptionDetails;
}

export interface UsageResponse {
  usage: UserProfile['usage'];
  limits: SubscriptionDetails['limits'];
  percentUsed: {
    generations: number;
    storage: number;
  };
}

export interface ProfileUpdateResponse {
  profile: UserProfile;
  message: string;
}

// Validation types
export interface ProfileValidationResult {
  isValid: boolean;
  errors: ProfileError[];
  warnings?: string[];
}

export interface PreferencesValidationResult {
  isValid: boolean;
  errors: ProfileError[];
  sanitized: UserPreferences;
}