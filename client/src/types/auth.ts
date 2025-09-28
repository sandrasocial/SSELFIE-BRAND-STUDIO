/**
 * Comprehensive TypeScript types for authentication system
 * Ensures type safety across the entire auth flow
 */

import type { User as StackUser } from '@stackframe/react';

// Error types hierarchy for better error handling
export interface AuthError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: number;
  readonly retryable: boolean;
}

export interface NetworkAuthError extends AuthError {
  readonly code: 'NETWORK_ERROR';
  readonly statusCode?: number;
}

export interface ValidationAuthError extends AuthError {
  readonly code: 'VALIDATION_ERROR';
  readonly field?: string;
}

export interface SessionAuthError extends AuthError {
  readonly code: 'SESSION_EXPIRED' | 'SESSION_INVALID';
}

export interface UnknownAuthError extends AuthError {
  readonly code: 'UNKNOWN_ERROR';
  readonly originalError?: Error;
}

export type AuthErrorType = NetworkAuthError | ValidationAuthError | SessionAuthError | UnknownAuthError;

// User plan types
export type UserPlan = 'sselfie-studio';
export type UserRole = 'user' | 'admin';

// Complete user interface with all possible fields
export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string;
  readonly profileImageUrl?: string;
  readonly plan: UserPlan;
  readonly role: UserRole;
  
  // User preferences and profile data
  readonly gender?: string;
  readonly profession?: string;
  readonly brandStyle?: string;
  readonly photoGoals?: string;
  readonly preferredOnboardingMode?: string;
  
  // Training and access flags
  readonly trainingCoachingCompleted?: boolean;
  readonly mayaAiAccess?: boolean;
  readonly victoriaAiAccess?: boolean;
  readonly hasRetrainingAccess?: boolean;
  
  // Usage tracking
  readonly monthlyGenerationLimit: number;
  readonly generationsUsedThisMonth: number;
}

// Authentication states
export type AuthenticationState = 
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'session_expired'
  | 'error';

export type LoadingState = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

// Session types
export interface AuthSession {
  readonly isValid: boolean;
  readonly expiresAt?: number;
  readonly refreshToken?: string;
  readonly accessToken?: string;
}

// OAuth callback states
export type OAuthCallbackState = 
  | 'idle'
  | 'processing'
  | 'success'
  | 'error';

// Main auth hook return type
export interface UseAuthReturn {
  readonly user: User | undefined;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly hasStackAuthUser: boolean;
  readonly hasActiveSubscription: boolean;
  readonly requiresPayment: boolean;
  readonly error: AuthErrorType | null;
  readonly stackUser: StackUser | undefined;
  readonly session: AuthSession | null;
  readonly authState: AuthenticationState;
  readonly loadingState: LoadingState;
}

// Type guards
export const isAuthError = (error: unknown): error is AuthErrorType => {
  return typeof error === 'object' && 
         error !== null && 
         'code' in error && 
         'message' in error && 
         'timestamp' in error && 
         'retryable' in error;
};

export const isNetworkAuthError = (error: AuthErrorType): error is NetworkAuthError => {
  return error.code === 'NETWORK_ERROR';
};

export const isValidationAuthError = (error: AuthErrorType): error is ValidationAuthError => {
  return error.code === 'VALIDATION_ERROR';
};

export const isSessionAuthError = (error: AuthErrorType): error is SessionAuthError => {
  return error.code === 'SESSION_EXPIRED' || error.code === 'SESSION_INVALID';
};

export const isUserPlan = (plan: string): plan is UserPlan => {
  return plan === 'sselfie-studio';
};

export const isUserRole = (role: string): role is UserRole => {
  return role === 'user' || role === 'admin';
};

// Utility type to ensure all auth states are handled
export type AuthStateHandler<T> = {
  readonly [K in AuthenticationState]: (state: K) => T;
};

// Session storage utilities
export interface SessionStorage {
  readonly getSession: () => AuthSession | null;
  readonly setSession: (session: AuthSession) => void;
  readonly clearSession: () => void;
  readonly isSessionValid: () => boolean;
}

// Auth context interface for providers
export interface AuthContextValue extends UseAuthReturn {
  readonly signIn: () => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly refreshAuth: () => Promise<void>;
}