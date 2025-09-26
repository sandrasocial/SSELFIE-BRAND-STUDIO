// Re-export everything from schema and typesexport interface User {

export * from './user-schema';  id: string;

export * from './user-types';  email: string;

  primaryEmail?: string;

// Export a unified User type that combines schema and interface types  email_address?: string;

import type { User as SchemaUser } from './user-schema';  user_email?: string;

import type { UserBase } from './user-types';  displayName?: string;

  display_name?: string;

// Unified User type that combines both schema and interface properties  name?: string;

export type User = SchemaUser & UserBase;  given_name?: string;
  full_name?: string;
  profileImageUrl?: string;
  profile_image_url?: string;
  avatar_url?: string;
  createdAt: Date;
  updatedAt: Date;
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