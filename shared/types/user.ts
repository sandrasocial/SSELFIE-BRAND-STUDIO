// Re-export everything from schema and types
export * from './user-schema.js';
export * from './user-types.js';

// Export a unified User type that combines schema and interface types
import type { User as SchemaUser } from './user-schema.js';
import type { UserBase } from './user-types.js';

// Unified User type that combines both schema and interface properties
export type User = SchemaUser & UserBase;

export interface User {
  id: string;
  email: string;
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
  createdAt: Date;
  updatedAt: Date;
  plan?: string;
  subscriptionStatus?: string;
  subscription_status?: string;
}

export interface UserProfile extends User {
  settings: Record<string, unknown>;
  preferences: Record<string, unknown>;
  roles: string[];
}

export interface AuthInfo {
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
}