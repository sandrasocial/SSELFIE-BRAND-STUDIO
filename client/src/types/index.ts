// src/types/index.ts

/**
 * @deprecated Use the User type from './auth.js' instead
 * This legacy interface is kept for backward compatibility
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
  gender?: string; // Added to fix simple-training error
  monthlyGenerationLimit: number;
  generationsUsedThisMonth: number;
}

export interface UserModel {
  trainingStatus?: string;
  hasRetrainingAccess?: boolean; // Added to fix simple-training error
  // Add any other userModel properties you need
}

import type { BaseChatMessage, MayaChatMessage } from '../../../shared/types/unified-chat.js';

export interface ClientChatMessage extends BaseChatMessage {
  sender: 'user' | 'ai';
  type: 'text' | 'concept';
  content: string | Record<string, unknown>; // Can be string or a concept card object
}

export interface UseMayaChatReturn {
  messages: ClientChatMessage[];
  sendMessage: (message: string, context?: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication Types - Centralized exports
 * 
 * This section provides all authentication-related types and utilities
 * for use throughout the application.
 */

// Core authentication types
export type {
  // User and authentication state types
  User as AuthUser, // Renamed to avoid conflict with legacy User
  UserPlan,
  UserRole,
  AuthenticationState,
  LoadingState,
  OAuthCallbackState,
  UseAuthReturn,
  
  // Error types
  AuthError,
  AuthErrorType,
  NetworkAuthError,
  ValidationAuthError,
  SessionAuthError,
  UnknownAuthError,
  
  // Session types
  AuthSession,
  SessionStorage,
  
  // Context and provider types
  AuthContextValue,
  AuthStateHandler,
} from './auth.js';

// Type guards
export {
  isAuthError,
  isNetworkAuthError,
  isValidationAuthError,
  isSessionAuthError,
  isUserPlan,
  isUserRole,
} from './auth.js';

// Re-export for convenience
export * from './photoshoot.js';