import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StackAuthUserInfo } from './stack-auth-types.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: 'sselfie-studio';
  role: 'user' | 'admin';
  stackUser: StackAuthUserInfo;
}

export interface AuthenticatedRequest extends VercelRequest {
  user: AuthenticatedUser;
}

export interface AuthResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

export type AuthenticatedHandler<T = any> = (
  req: AuthenticatedRequest,
  res: VercelResponse
) => Promise<T>;

export interface AuthOptions {
  bypass?: boolean;
  optional?: boolean;
}