import type { JWTPayload } from 'jose';

export interface AuthInfo extends JWTPayload {
  sub?: string;
  user_id?: string;
  id?: string;
  email?: string;
  primary_email?: string;
  primaryEmail?: string;
  email_address?: string;
  user_email?: string;
  displayName?: string;
  display_name?: string;
  name?: string;
  given_name?: string;
  full_name?: string;
  profileImageUrl?: string;
  profile_image_url?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface StackAuthUser {
  id: string;
  stackAuthId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastSignIn: Date | null;
  plan: string | null;
  monthlyGenerationLimit: number | null;
  mayaAiAccess: boolean | null;
  brandStrategyContext?: Record<string, unknown>;
  role?: string;
  isAdmin?: boolean;
}