/**
 * Stack Auth Type Definitions
 * 
 * These types represent the JWT payload structure from Stack Auth
 * and are used for type-safe token verification
 */

export interface StackAuthUserInfo {
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

