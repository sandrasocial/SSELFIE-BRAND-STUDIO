import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '../../shared/types';

export interface AuthenticatedUser extends User {
  id: string;
  email: string;
  name?: string;
  plan: string | null;
  isAdmin?: boolean;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthenticatedUser;
}

export interface AuthResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type AuthenticatedHandler<T = any> = (
  req: AuthenticatedRequest,
  res: NextApiResponse<AuthResponse<T>>
) => Promise<NextApiResponse<AuthResponse<T>> | void>;

export interface AuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowMethods?: string[];
  roles?: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthError {
  code: string;
  message: string;
  status: number;
}

export interface AuthMiddlewareOptions extends AuthOptions {
  onError?: (error: AuthError, req: NextApiRequest, res: NextApiResponse) => void;
  onSuccess?: (user: AuthenticatedUser, req: AuthenticatedRequest, res: NextApiResponse) => void;
}

// Common auth error codes
export const AUTH_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED'
} as const;

export type AuthErrorCode = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];

// Session data interface
export interface SessionData {
  user: AuthenticatedUser;
  expires: string;
  accessToken: string;
  refreshToken?: string;
}

// API response helpers
export interface ApiSuccessResponse<T = any> extends AuthResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends AuthResponse<never> {
  success: false;
  error: string;
  code?: AuthErrorCode;
}