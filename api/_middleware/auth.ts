import { VercelRequest, VercelResponse } from '@vercel/node';

// Constants
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// JWKS cache
let JWKS: any = null;
let JWKS_LAST_FETCH = 0;
const JWKS_CACHE_TIME = 3600000; // 1 hour

// Parse cookie header helper
function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

// Timed fetch helper
async function timedFetch(url: string, ms = 3000, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
  const AbortCtor = typeof AbortController !== 'undefined' ? AbortController : (globalThis as any).AbortController;
  const ac = new AbortCtor();
  const id = setTimeout(() => ac.abort(), ms);
  try {
    const f = (globalThis as any).fetch || fetch;
    return await f(url, { ...(init || {}), signal: ac.signal });
  } finally {
    clearTimeout(id);
  }
}

// Get JWKS with caching
async function getJWKS() {
  const now = Date.now();
  
  // Use cached JWKS if available and not expired
  if (JWKS && (now - JWKS_LAST_FETCH) < JWKS_CACHE_TIME) {
    return JWKS;
  }

  try {
    const jose = await import('jose');
    const resp = await timedFetch(JWKS_URL, 3000);
    if (!resp.ok) throw new Error(`JWKS HTTP ${resp.status}`);
    const jwks = await resp.json();
    JWKS = jose.createLocalJWKSet(jwks);
    JWKS_LAST_FETCH = now;
    return JWKS;
  } catch (error) {
    console.error('Failed to fetch JWKS:', error);
    // Return cached JWKS even if expired, as fallback
    return JWKS;
  }
}

// Verify JWT token
async function verifyJWTToken(token: string) {
  try {
    const jose = await import('jose');
    const jwks = await getJWKS();
    
    if (!jwks) {
      throw new Error('No JWKS available');
    }

    const { payload } = await jose.jwtVerify(token, jwks, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
    });
    
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${(error as Error).message}`);
  }
}

// Get authenticated user helper 
export async function getAuthenticatedUser(req: VercelRequest) {
  let accessToken: string | undefined;
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
    console.log('🔐 Found Bearer token in Authorization header');
  }
  
  // Check cookies if no auth header
  if (!accessToken) {
    const cookiesSource = (req as unknown as { cookies?: Record<string, string> }).cookies || 
                         parseCookieHeader(req.headers.cookie as string);
    
    if (cookiesSource) {
      // Try common auth cookie names
      const cookiesToTry = [
        'stack-access',
        'stack-access-token', 
        'stack_session',
        '__Secure-next-auth.session-token',
      ];

      for (const cookieName of cookiesToTry) {
        const cookieValue = cookiesSource[cookieName];
        
        if (cookieValue) {
          try {
            // Try JSON array format
            if (cookieValue.startsWith('[')) {
              const stackAccessArray = JSON.parse(cookieValue);
              if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
                accessToken = stackAccessArray[1];
                break;
              }
            }
            
            // Try JSON object format
            if (cookieValue.startsWith('{')) {
              const stackAccessObj = JSON.parse(cookieValue);
              if (stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt) {
                accessToken = stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt;
                break;
              }
            }
            
            // Try direct token format
            if (cookieValue.length > 20 && cookieValue.includes('.')) {
              accessToken = cookieValue;
              break;
            }
            
          } catch {
            // If parse fails but value looks like a token, use it directly
            if (cookieValue.length > 20 && cookieValue.includes('.')) {
              accessToken = cookieValue;
              break;
            }
          }
        }
      }
    }
  }

  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Verify JWT token
  const userInfo = await verifyJWTToken(accessToken);

  // Extract user info
  const userId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
  const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
  const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');

  return {
    id: userId,
    email: userEmail,
    firstName: userName?.split(' ')[0] || null,
    lastName: userName?.split(' ').slice(1).join(' ') || null,
    plan: 'sselfie-studio',
    role: 'user',
    stackUser: userInfo
  };
}

// Auth middleware
export async function withAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  try {
    // Add user to request
    const user = await getAuthenticatedUser(req);
    (req as any).user = user;

    // Call handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth failed:', error);

    // Clear cookies on auth failure
    const expired = [
      'stack-access',
      'stack-access-token',
      'stack_session',
      '__Secure-next-auth.session-token' 
    ].map(name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    
    res.setHeader('Set-Cookie', expired);
    
    return res.status(401).json({ 
      message: 'Authentication required',
      error: (error as Error).message
    });
  }
}