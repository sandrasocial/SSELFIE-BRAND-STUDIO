/**
 * Authentication utilities and middleware
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withExternalApiTimeout } from '../_utils/timing.js';

// Stack Auth configuration - use environment variables
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let JWKS: any; // JWKS type from jose library - complex type that's not worth importing

// Lazy-load jose at runtime to avoid bootstrap issues
type JoseModule = typeof import('jose');
let _jose: Pick<JoseModule, 'jwtVerify' | 'createLocalJWKSet' | 'createRemoteJWKSet'> | null = null;

async function getJose() {
  if (_jose) return _jose;
  const mod: JoseModule = await import('jose');
  _jose = { jwtVerify: mod.jwtVerify, createLocalJWKSet: mod.createLocalJWKSet, createRemoteJWKSet: mod.createRemoteJWKSet };
  return _jose;
}

// Timed fetch helper to avoid hard timeouts on external calls
const timedFetch = async (url: string, options: RequestInit = {}, timeoutMs = 3000) => {
  // Declare AbortController for environments where it might not be available
  let controller: AbortController | undefined;
  try {
    controller = new AbortController();
  } catch (e) {
    // AbortController might not be available in some environments
  }

  // Use the enhanced external API timeout utility
  return withExternalApiTimeout(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchOptions: any = {
        ...options,
        signal: controller?.signal,
      };
      
      // Use global fetch; if types are missing, fall back to any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (globalThis as any).fetch(url, fetchOptions);
    },
    null, // fallback for failed requests
    timeoutMs,
    1, // retries
    'jwks-fetch'
  );
};

// Helper function to get authenticated user
export async function getAuthenticatedUser(req: VercelRequest): Promise<any> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-stack-access-token'] as string;
    
    if (!token) {
      console.log('❌ No token found in request');
      return null;
    }

    console.log('🔍 Token found, verifying...');
    
    // Initialize JWKS if needed
    if (!JWKS) {
      const jose = await getJose();
      try {
        console.log('🔍 Fetching JWKS from:', JWKS_URL);
        const response = await timedFetch(JWKS_URL);
        if (!response) {
          console.log('❌ Failed to fetch JWKS');
          return null;
        }
        
        const jwks = await response.json();
        console.log('✅ JWKS fetched successfully');
        JWKS = jose.createLocalJWKSet(jwks);
      } catch (jwksError) {
        console.log('❌ JWKS fetch error:', (jwksError as Error).message);
        return null;
      }
    }

    const jose = await getJose();
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: STACK_AUTH_API_URL,
      audience: STACK_AUTH_PROJECT_ID,
    });

    console.log('✅ Token verified successfully');
    return payload;
  } catch (error) {
    console.log('❌ Auth verification failed:', (error as Error).message);
    return null;
  }
}

// Set CORS headers for authentication
export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Set Vercel Skew Protection cookie
export function setSkewProtectionCookie(res: VercelResponse) {
  if (
    process.env.VERCEL_SKEW_PROTECTION_ENABLED === '1' &&
    process.env.VERCEL_DEPLOYMENT_ID
  ) {
    try {
      const cookieValue = `__vdpl=${process.env.VERCEL_DEPLOYMENT_ID}; Path=/; HttpOnly; Secure; SameSite=Lax`;
      const existing = res.getHeader('Set-Cookie');
      if (Array.isArray(existing)) {
        res.setHeader('Set-Cookie', [...existing, cookieValue]);
      } else if (typeof existing === 'string' && existing.length > 0) {
        res.setHeader('Set-Cookie', [existing, cookieValue]);
      } else {
        res.setHeader('Set-Cookie', cookieValue);
      }
    } catch (e) {
      console.log('⚠️ Failed to set __vdpl cookie:', (e as Error).message);
    }
  }
}