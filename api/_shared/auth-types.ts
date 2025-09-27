import { StackAuthUserInfo } from './stack-auth-types.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

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

// Handler that requires authentication
export type AuthenticatedHandler<T = any> = (
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