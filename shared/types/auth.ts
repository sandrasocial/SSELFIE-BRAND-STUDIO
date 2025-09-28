/**
 * Authentication Types for Maya-Only Architecture
 * Stack Auth integration types and authentication flow definitions
 */

import { BaseUser } from './base.js';

// === Stack Auth Core Types ===

export interface StackAuthUser extends BaseUser {
  stackId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  profileImageUrl?: string;
  hasPassword: boolean;
  oauthProviders: OAuthProvider[];
  createdAt: Date;
  lastSignInAt?: Date;
  clientMetadata?: Record<string, unknown>;
  serverMetadata?: Record<string, unknown>;
}

export interface OAuthProvider {
  id: string;
  provider: 'google' | 'github' | 'facebook' | 'apple' | 'linkedin';
  providerUserId: string;
  email?: string;
  displayName?: string;
  profileImageUrl?: string;
  connectedAt: Date;
}

// === Authentication States ===

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StackAuthUser | null;
  error: AuthError | null;
  session: AuthSession | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

// === Authentication Actions ===

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SignUpRequest {
  email: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
  metadata?: Record<string, unknown>;
}

export interface OAuthSignInRequest {
  provider: OAuthProvider['provider'];
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
  redirectUrl?: string;
}

// === Authentication Responses ===

export interface AuthResponse {
  success: boolean;
  user?: StackAuthUser;
  session?: AuthSession;
  error?: AuthError;
  redirectUrl?: string;
  requiresVerification?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
  field?: string; // Field that caused the error
  recoverable?: boolean;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMITED'
  | 'OAUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// === User Profile Management ===

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  language?: string;
  preferences: ProfilePreferences;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  updatedAt: Date;
}

export interface ProfilePreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  timezone?: string;
  emailDigest?: 'never' | 'daily' | 'weekly' | 'monthly';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showLocation: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  dataProcessingConsent: boolean;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    generation: boolean;
    training: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    enabled: boolean;
    generation: boolean;
    training: boolean;
    reminders: boolean;
  };
  inApp: {
    enabled: boolean;
    all: boolean;
  };
}

// === User Update Requests ===

export interface ProfileUpdateRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  language?: string;
}

export interface PreferencesUpdateRequest {
  theme?: ProfilePreferences['theme'];
  language?: string;
  dateFormat?: string;
  timeFormat?: ProfilePreferences['timeFormat'];
  timezone?: string;
  emailDigest?: ProfilePreferences['emailDigest'];
}

export interface PrivacyUpdateRequest {
  profileVisibility?: PrivacySettings['profileVisibility'];
  showEmail?: boolean;
  showLocation?: boolean;
  allowAnalytics?: boolean;
  allowMarketing?: boolean;
}

export interface NotificationUpdateRequest {
  email?: Partial<NotificationSettings['email']>;
  push?: Partial<NotificationSettings['push']>;
  inApp?: Partial<NotificationSettings['inApp']>;
}

// === Authentication Hooks Types ===

export interface UseAuthReturn {
  user: StackAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (request: SignInRequest) => Promise<AuthResponse>;
  signUp: (request: SignUpRequest) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<void>;
  sendVerificationEmail: (request: EmailVerificationRequest) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: AuthError | null;
  updateProfile: (updates: ProfileUpdateRequest) => Promise<void>;
  updatePreferences: (updates: PreferencesUpdateRequest) => Promise<void>;
  updatePrivacy: (updates: PrivacyUpdateRequest) => Promise<void>;
  updateNotifications: (updates: NotificationUpdateRequest) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

// === Component Props ===

export interface AuthProviderProps {
  children: React.ReactNode;
  projectId: string;
  publishableClientKey: string;
  baseUrl?: string;
  debug?: boolean;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireVerification?: boolean;
  redirectTo?: string;
}

export interface SignInFormProps {
  onSuccess?: (user: StackAuthUser) => void;
  onError?: (error: AuthError) => void;
  redirectAfterSignIn?: string;
  showSignUpLink?: boolean;
  showForgotPassword?: boolean;
  showOAuthProviders?: boolean;
  enabledProviders?: OAuthProvider['provider'][];
}

export interface SignUpFormProps {
  onSuccess?: (user: StackAuthUser) => void;
  onError?: (error: AuthError) => void;
  redirectAfterSignUp?: string;
  showSignInLink?: boolean;
  showOAuthProviders?: boolean;
  enabledProviders?: OAuthProvider['provider'][];
  requireTermsAcceptance?: boolean;
  requireMarketingConsent?: boolean;
}

// === Middleware Types ===

export interface AuthMiddlewareConfig {
  publicPaths?: string[];
  protectedPaths?: string[];
  redirectAfterSignIn?: string;
  redirectAfterSignUp?: string;
  requireEmailVerification?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: StackAuthUser;
  session: AuthSession;
}

// === JWT & Token Types ===

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

export interface RefreshTokenPayload {
  sub: string;
  session_id: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

// === Stack Auth Configuration ===

export interface StackAuthConfig {
  projectId: string;
  publishableClientKey: string;
  secretServerKey: string;
  baseUrl: string;
  cookieName?: string;
  tokenExpirationTime?: number;
  refreshTokenExpirationTime?: number;
  enabledOAuthProviders?: OAuthProvider['provider'][];
  emailVerificationRequired?: boolean;
  passwordRequirements?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
  };
}