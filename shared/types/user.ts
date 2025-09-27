// Re-export everything from schema and types
export * from './user-schema.js';
export * from './user-types.js';

// Import types we need to reference
import type { User as SchemaUser } from './user-schema.js';
import type { UserBase as ImportedUserBase } from './user-types.js';

// Unified User type that combines both schema and interface properties
export interface UserBase {
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
}

// Export unified type
export type User = SchemaUser & UserBase;

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