// Type definitions for @stackframe/stack
// Declarations for the StackAuth class and related types

export interface StackAuthConfig {
  projectId: string;
  publishableClientKey: string;
  secretServerKey: string;
}

export interface StackAuthContext {
  request: any; // Can be Express.Request or VercelRequest
}

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

export class StackAuth {
  constructor(config: StackAuthConfig);
  getUser(context: StackAuthContext): Promise<StackAuthUserInfo | null>;
}