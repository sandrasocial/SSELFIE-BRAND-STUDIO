/* Shared Stack Auth configuration and helpers for server and api middleware */

export const STACK_PROJECT_ID: string =
  process.env.STACK_PROJECT_ID ||
  process.env.STACK_AUTH_PROJECT_ID ||
  process.env.VITE_STACK_PROJECT_ID ||
  '253d7343-a0d4-43a1-be5c-822f590d40be';

export const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';

export const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`;

export const STACK_ISSUER = `${STACK_AUTH_API_URL}/projects/${STACK_PROJECT_ID}`;

export function isProd(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

