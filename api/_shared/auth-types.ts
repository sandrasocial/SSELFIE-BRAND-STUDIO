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

// Augment VercelRequest type to include authenticated user
declare module '@vercel/node' {
  interface VercelRequest {
    user?: AuthenticatedUser;
  }
}