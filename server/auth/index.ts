import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Stack Auth Handler - Comprehensive authentication endpoint proxy
 *
 * This handler provides proper routing for all Stack Auth endpoints including:
 * - Sign in/Sign up flows
 * - OAuth callbacks
 * - Token refresh
 * - User management
 */

const STACK_PROJECT_ID = process.env.STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID;
const STACK_SECRET_SERVER_KEY = process.env.STACK_SECRET_SERVER_KEY || process.env.STACK_AUTH_SECRET_KEY;
const STACK_PUBLISHABLE_CLIENT_KEY = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
const STACK_AUTH_API_BASE = 'https://api.stack-auth.com/api/v1';
// One-time debug of selected envs
console.log('🔧 Stack Auth Proxy Env:', { projectId: STACK_PROJECT_ID, hasSecret: !!STACK_SECRET_SERVER_KEY, hasPCK: !!STACK_PUBLISHABLE_CLIENT_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Stack Auth with credentials-safe origin handling
  const originHeader = (req.headers.origin as string) || '';
  const refererHeader = (req.headers.referer as string) || '';
  const inferredOrigin = (() => {
    try {
      if (!refererHeader) return '';
      const u = new URL(refererHeader);
      return `${u.protocol}//${u.host}`;
    } catch {
      return '';
    }
  })();
  const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const candidateOrigin = originHeader || inferredOrigin;
  let allowOrigin = '';
  if (candidateOrigin && (allowedOrigins.length === 0 || allowedOrigins.includes(candidateOrigin))) {
    allowOrigin = candidateOrigin;
  } else if (process.env.VERCEL_ENV === 'production') {
    allowOrigin = 'https://www.sselfie.ai';
  } else {
    allowOrigin = candidateOrigin || 'http://localhost:5173';
  }
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token, x-stack-project-id, x-stack-publishable-client-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[StackAuthProxy] OPTIONS ${req.url} allowOrigin=${allowOrigin}`);
    return res.status(200).end();
  }

  console.log(`[StackAuthProxy] ${req.method} ${req.url} origin=${originHeader} allowOrigin=${allowOrigin}`);

  // Validate Stack Auth configuration
  if (!STACK_PROJECT_ID) {
    return res.status(500).json({
      error: 'Stack Auth configuration error',
      message: 'Missing project ID'
    });
  }

  // Extract the path after /api/auth/
  const authPath = req.url?.replace('/api/auth', '') || '';
  const stackAuthUrl = `${STACK_AUTH_API_BASE}/projects/${STACK_PROJECT_ID}${authPath}`;

  try {
    // Prepare headers for Stack Auth API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-stack-project-id': STACK_PROJECT_ID,
      'User-Agent': req.headers['user-agent'] || 'SSELFIE-Studio/1.0',
      'x-stack-access-type': 'client',
    };

    // Add publishable client key if available
    if (STACK_PUBLISHABLE_CLIENT_KEY) {
      headers['x-stack-publishable-client-key'] = STACK_PUBLISHABLE_CLIENT_KEY;
    }

    // 🔥 ENHANCED: Use server-side authentication if secret key is available and request requires it
    if (STACK_SECRET_SERVER_KEY && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
      headers['x-stack-access-type'] = 'server';
      headers['x-stack-secret-server-key'] = STACK_SECRET_SERVER_KEY;
    }

    // Forward relevant headers
    const forwardHeaders = [
      'authorization',
      'x-stack-access-token',
      'x-stack-refresh-token',
      'x-stack-admin-access-token',
      'cookie'
    ];

    forwardHeaders.forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    });

    // Make request to Stack Auth API


    const response = await fetch(stackAuthUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
    });

    // Get response data
    const contentType = response.headers.get('content-type') || 'application/json';
    const responseData = await response.text();

    // Forward response headers
    res.setHeader('Content-Type', contentType);

    console.log(`[StackAuthProxy] -> ${response.status} path=${authPath || '/'} setCookieHeader=${!!response.headers.get('set-cookie')}`);

    res.setHeader('Cache-Control', 'no-store');

    // Forward authentication cookies (support multiple Set-Cookie headers)

    const headersAny: any = response.headers as any;
    const setCookies: string[] | undefined = typeof headersAny.getSetCookie === 'function' ? headersAny.getSetCookie() : undefined;
    if (Array.isArray(setCookies) && setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    } else {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        res.setHeader('Set-Cookie', setCookie);
      }
    }

    // Forward other important headers
    const forwardResponseHeaders = [
      'x-stack-request-id',
      'x-stack-actual-status',
      'x-stack-known-error'
    ];

    forwardResponseHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    return res.status(response.status).send(responseData);

  } catch (error) {
    return res.status(500).json({
      error: 'Authentication service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}