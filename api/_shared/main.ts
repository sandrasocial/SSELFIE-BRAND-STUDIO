/* eslint-disable no-console */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

// Stack Auth configuration - use environment variables
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function verifyJWTToken(token: string): Promise<JWTPayload & { sub?: string; user_id?: string; id?: string; email?: string }> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
    audience: STACK_AUTH_PROJECT_ID,
  });
  return payload;

export default async function mainHandler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS / preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Simple health
    if (req.url?.includes('/api/health')) {
      return res.status(200).json({ ok: true, runtime: 'node', ts: Date.now() });
    }

    async function getAuthenticatedUser() {
      let accessToken: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) accessToken = authHeader.substring(7);
      if (!accessToken && req.cookies) {
        const names = ['stack-access', 'stack-access-token', 'stack_session'];
        for (const n of names) {
          const v = (req.cookies as Record<string, string | undefined>)[n];
          if (!v) continue;
          if (v.startsWith('[')) { try { const a = JSON.parse(v); if (Array.isArray(a) && a[1]) { accessToken = a[1]; break; } } catch {} }
          if (!accessToken && v.startsWith('{')) { try { const o = JSON.parse(v); accessToken = o.accessToken || o.token || o.jwt; if (accessToken) break; } catch {} }
          if (!accessToken && v.includes('.')) { accessToken = v; break; }
        }
      }
      if (!accessToken) throw new Error('No access token found');
      const userInfo = await verifyJWTToken(accessToken);
      return { id: userInfo.sub || userInfo.user_id || userInfo.id, email: userInfo.email };
    }

    // /api/me minimal
    if (req.url === '/api/me' || req.url?.startsWith('/api/me?')) {
      try {
        const user = await getAuthenticatedUser();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ user });
      } catch (e: unknown) {
        return res.status(401).json({ message: 'Authentication required', error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }

    // Default
    return res.status(200).json({ message: 'SSELFIE Studio API', endpoint: req.url });
  } catch (error: unknown) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Internal error' });
  }
}


