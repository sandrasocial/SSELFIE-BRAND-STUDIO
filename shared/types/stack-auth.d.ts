declare module '@stackframe/stack-auth' {
  export interface StackAuthUser {
    claims?: {
      sub: string;
      name?: string;
      email?: string;
      picture?: string;
    };
    isAuthenticated: boolean;
  }

  export interface StackAuthConfig {
    apiKey: string;
    projectId: string;
    env?: 'development' | 'production';
  }

  export interface StackAuthResponse {
    token: string;
    user: StackAuthUser;
  }

  export function initStackAuth(config: StackAuthConfig): void;
  export function getUser(): StackAuthUser | null;
  export function signIn(): Promise<StackAuthResponse>;
  export function signOut(): Promise<void>;
  export function isAuthenticated(): boolean;
}