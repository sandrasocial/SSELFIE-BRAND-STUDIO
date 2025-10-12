/* eslint-disable no-console */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withTimeout, withDatabaseTimeout, withDatabaseTimeoutAndRetry, withExternalApiTimeout, isTimeoutError } from './_utils/timing.js';
import type { ConceptCard } from '../shared/types/concept-card.js';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 40
} as const;

import { StackAuthUserInfo } from './_shared/stack-auth-types.js';

// Lazy-load jose at runtime to avoid bootstrap issues
type JoseModule = typeof import('jose');
let _jose: Pick<JoseModule, 'jwtVerify' | 'createLocalJWKSet' | 'createRemoteJWKSet'> | null = null;

async function getJose() {
  if (_jose) return _jose;
  const mod: JoseModule = await import('jose');
  _jose = { jwtVerify: mod.jwtVerify, createLocalJWKSet: mod.createLocalJWKSet, createRemoteJWKSet: mod.createRemoteJWKSet };
  return _jose;
}

// Types
// Minimal User type for local use
interface User {
  id: string;
  email?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  plan?: string;
  role?: string;
  monthlyGenerationLimit?: number;
  mayaAiAccess?: boolean;
  victoriaAiAccess?: boolean;
  onboardingProgress?: any;
  preferredOnboardingMode?: string;
  lastLoginAt?: Date | null;
  stackAuthId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Minimal InsertUser type for local use
interface InsertUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  plan?: string;
  role?: string;
  monthlyGenerationLimit?: number;
  mayaAiAccess?: boolean;
  victoriaAiAccess?: boolean;
  onboardingProgress?: string;
  preferredOnboardingMode?: string;
  lastLoginAt?: Date;
}

// Minimal UserModel type for local use
interface UserModel {
  id: string | number;
  userId: string;
  trainingStatus?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Minimal AiImage type for local use
interface AiImage {
  id: number;
  isFavorite?: boolean;
  isSelected?: boolean;
  userId: string;
  imageUrl?: string;
  style?: string;
  prompt?: string;
  createdAt: Date;
  imageUrls?: string;
  selectedUrl?: string;
  category?: string;
}


interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  message?: string;
}

interface AuthenticatedUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  role: string;
  stackUser: StackAuthUserInfo;
}

// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = process.env['STACK_AUTH_PROJECT_ID'] || process.env['VITE_STACK_PROJECT_ID'] || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
let JWKS: any;

// Timed fetch helper
type FetchInit = { method?: string; headers?: Record<string, string>; body?: string };

async function timedFetch(url: string, ms = 3000, init?: FetchInit) {
  return withExternalApiTimeout(
    async () => {
      const AbortCtor = typeof AbortController !== 'undefined' ? AbortController : (globalThis as any).AbortController;
      const ac = new AbortCtor();
      const id = setTimeout(() => ac.abort(), ms);
      try {
        const f = (globalThis as any).fetch || fetch;
        return await f(url, { ...(init || {}), signal: ac.signal });
      } finally {
        clearTimeout(id);
      }
    },
    // Create a Node.js compatible response object instead of using Response constructor
    { 
      ok: false, 
      status: 408, 
      statusText: 'Request Timeout',
      json: async () => ({ error: 'Network timeout' }),
      text: async () => 'Network timeout'
    } as any,
    ms,
    1,
    `fetch-${url}`
  );
}

// Cookie management
function setLogoutCookies(res: VercelResponse) {
  const expired = [
    'stack-access',
    'stack-access-token',
    'stack_session',
    '__Secure-next-auth.session-token'
  ].map(name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  
  const existing = res.getHeader('Set-Cookie');
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, ...expired]);
  } else if (typeof existing === 'string' && existing.length > 0) {
    res.setHeader('Set-Cookie', [existing, ...expired]);
  } else {
    res.setHeader('Set-Cookie', expired);
  }
}

// Circuit breaker for database operations
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 60000;

function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  if (circuitBreaker.isOpen && now - circuitBreaker.lastFailure > CIRCUIT_BREAKER_RESET_TIME) {
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
  }
  
  return !circuitBreaker.isOpen;
}

function recordCircuitBreakerFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.isOpen = true;
  }
}

function recordCircuitBreakerSuccess() {
  if (circuitBreaker.failures > 0) {
    circuitBreaker.failures = 0;
  }
}

// Logging utilities
function nowMs(): number {
  const perf = (globalThis as unknown as { performance?: { now: () => number } }).performance;
  return typeof perf?.now === 'function' ? perf.now() : Date.now();
}

function logStart(route: string, meta?: Record<string, unknown>) {
  const start = nowMs();
  try { 
  } catch {
    // Ignore logging errors
  }
  return {
    end: (outcome: string, extra?: Record<string, unknown>) => {
      const elapsed = Math.round(nowMs() - start);
      try { 
      } catch {
        // Ignore logging errors
      }
      return elapsed;
    }
  };
}



// Categorize concepts
function getCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('professional') || titleLower.includes('headshot') || titleLower.includes('business')) {
    return 'Professional';
  } else if (titleLower.includes('lifestyle') || titleLower.includes('casual') || titleLower.includes('relaxed')) {
    return 'Lifestyle';
  } else if (titleLower.includes('executive') || titleLower.includes('authority') || titleLower.includes('commanding')) {
    return 'Executive';
  } else if (titleLower.includes('creative') || titleLower.includes('artistic')) {
    return 'Creative';
  } else if (titleLower.includes('editorial') || titleLower.includes('fashion') || titleLower.includes('street')) {
    return 'Editorial';
  } else {
    return 'General';
  }
}

// JWT verification
async function verifyJWTToken(token: string): Promise<StackAuthUserInfo> {
  try {
    const jose = await getJose();
    const { jwtVerify, createLocalJWKSet } = jose;
    
    if (!JWKS) {
      const resp = await timedFetch(JWKS_URL, 3000);
      if (!resp.ok) throw new Error(`JWKS HTTP ${resp.status}`);
      const jwks = await resp.json();
      JWKS = createLocalJWKSet(jwks);
    }
    
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
      audience: STACK_AUTH_PROJECT_ID,
    });
    
    return payload as unknown as StackAuthUserInfo;
  } catch (error) {
    throw new Error(`JWT verification failed: ${(error as Error).message}`);
  }
}

// Default user fields
function getDefaultUserFields(overrides: Partial<InsertUser> = {}): InsertUser {
  return {
    id: overrides.id ?? '',
    email: overrides.email ?? null,
    displayName: overrides.displayName ?? null,
    firstName: overrides.firstName ?? null,
    lastName: overrides.lastName ?? null,
    profileImageUrl: overrides.profileImageUrl ?? null,
    plan: overrides.plan ?? 'sselfie-studio',
    role: overrides.role ?? 'user',
    monthlyGenerationLimit: overrides.monthlyGenerationLimit ?? 100,
    mayaAiAccess: overrides.mayaAiAccess ?? true,
    victoriaAiAccess: overrides.victoriaAiAccess ?? false,
    onboardingProgress: overrides.onboardingProgress ?? JSON.stringify({ source: 'direct-signup' }),
    preferredOnboardingMode: overrides.preferredOnboardingMode ?? 'conversational',
    lastLoginAt: overrides.lastLoginAt ?? new Date(),
  };
}

// Parse cookie header
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

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {

    // Vercel Skew Protection
    if (process.env['VERCEL_SKEW_PROTECTION_ENABLED'] === '1' && process.env['VERCEL_DEPLOYMENT_ID']) {
      try {
        const cookieValue = `__vdpl=${process.env['VERCEL_DEPLOYMENT_ID']}; Path=/; HttpOnly; Secure; SameSite=Lax`;
        const existing = res.getHeader('Set-Cookie');
        if (Array.isArray(existing)) {
          res.setHeader('Set-Cookie', [...existing, cookieValue]);
        } else if (typeof existing === 'string' && existing.length > 0) {
          res.setHeader('Set-Cookie', [existing, cookieValue]);
        } else {
          res.setHeader('Set-Cookie', cookieValue);
        }
      } catch (e) {
      }
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Safe JSON responder
    const json = (response: unknown, status: number, body: unknown) => {
      const r = response as { status?: (code: number) => { json: (b: unknown) => unknown } };
      if (typeof r?.status === 'function') {
        return (response as any).status(status).json(body);
      }
      const NodeResponse = (globalThis as any).Response;
      try {
        return new NodeResponse(JSON.stringify(body), { 
          status, 
          headers: { 'content-type': 'application/json' } 
        });
      } catch {
        return { 
          status, 
          headers: { 'content-type': 'application/json' }, 
          body: JSON.stringify(body) 
        };
      }
    };

    // Health check
    if (req.url?.includes('/api/health')) {
      return res.status(200).json({
        status: 'healthy',
        service: 'SSELFIE Studio API',
        timestamp: new Date().toISOString(),
      });
    }

    // Sandra Images API - Public access for image serving
    if (req.url?.startsWith('/api/sandra-images/')) {
      const sandraImagesHandler = await import('./sandra-images.js');
      return sandraImagesHandler.default(req, res);
    }

    // Replicate Webhooks - Public endpoints for webhook notifications
    if (req.url?.startsWith('/api/webhooks/replicate')) {
      const replicateWebhookHandler = await import('./webhooks/replicate.js');
      return replicateWebhookHandler.default(req, res);
    }

    // Logout endpoint
    if (req.url === '/api/logout') {
      setLogoutCookies(res);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, loggedOut: true });
    }
    
    // Get authenticated user helper function
    async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
      let accessToken: string | undefined;
      
      // Check Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
      
      // Check cookies
      const cookiesSource: Record<string, string> = (req as unknown as { cookies?: Record<string, string> }).cookies || parseCookieHeader(req.headers.cookie as string);
      if (!accessToken && cookiesSource) {
        
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
              // Try parsing as JSON array
              if (cookieValue.startsWith('[')) {
                const stackAccessArray = JSON.parse(cookieValue);
                if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
                  accessToken = stackAccessArray[1];
                  break;
                }
              }
              
              // Try parsing as JSON object
              if (cookieValue.startsWith('{')) {
                const stackAccessObj = JSON.parse(cookieValue);
                if (stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt) {
                  accessToken = stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt;
                  break;
                }
              }
              
              // Try as direct token
              if (cookieValue.length > 20 && cookieValue.includes('.')) {
                accessToken = cookieValue;
                break;
              }
              
            } catch (parseError) {
              
              if (cookieValue.length > 20) {
                accessToken = cookieValue;
                break;
              }
            }
          }
        }
        
        if (!accessToken) {
        }
      }
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      
      // Verify JWT token
      const userInfo = await verifyJWTToken(accessToken);
      
      
      // Extract user information
      const userId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
      const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
      const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');
      
      console.log('🔍 ENHANCED DEBUG: User info extracted:', {
        id: userId,
        email: userEmail,
        name: userName
      });
      
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

    // Ensure DB user exists
    async function ensureDbUserFromStack(stackUser: { 
      id?: string; 
      email?: string | null; 
      displayName?: string | null; 
      firstName?: string | null; 
      lastName?: string | null; 
      profileImageUrl?: string | null; 
    }) {
      const { storage } = await import('../server/storage.js');
      const stackId = (stackUser.id || '') as string;
      const email = (stackUser.email || '') as string;

      // Try by ID
      let dbUser = stackId ? await storage.getUser(stackId) : undefined;
      if (dbUser) return dbUser;

      // Try by linked stack auth id
      if (!dbUser && stackId) {
        dbUser = await storage.getUserByStackAuthId(stackId);
        if (dbUser) return dbUser;
      }

      // Try by email, then link
      if (!dbUser && email) {
        const byEmail = await storage.getUserByEmail(email);
        if (byEmail) {
          return await storage.linkStackAuthId(byEmail.id, stackId || byEmail.id);
        }
      }

      // Create new user
      return await storage.upsertUser(getDefaultUserFields({
        id: stackId || email || `user_${Date.now()}`,
        email: email || null,
        displayName: stackUser.displayName || null,
        firstName: stackUser.firstName || (stackUser.displayName ? stackUser.displayName.split(' ')[0] : null),
        lastName: stackUser.lastName || (stackUser.displayName ? stackUser.displayName.split(' ').slice(1).join(' ') : null),
        profileImageUrl: stackUser.profileImageUrl || null,
      }));
    }

    // Admin export: trained users document
    if (req.url === '/api/admin/export-trained-users-doc') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      
      try {
        const adminToken = req.headers['x-admin-token'] as string;
        const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
        if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });

        const { storage } = await import('../server/storage.js');
        const models = await storage.getAllCompletedTrainings();

        const header = [
          '# Trained Users Export',
          '',
          'Copy/paste this table into your Stack dashboard import or keep as a reference.',
          '',
          '| Email | LegacyUserId | StackId | TriggerWord | ModelStatus | ModelName | ReplicateModelId | ReplicateVersionId | CompletedAt |',
          '|---|---:|---|---|---|---|---|---|---|'
        ].join('\n');

        const rows: string[] = [];
        for (const m of models) {
          const u = await storage.getUser(m.userId);
          const email = (u as { email?: string } | undefined)?.email || '';
          const legacyId = (u as { id?: string } | undefined)?.id || m.userId;
          const stackId = (u as { stackAuthId?: string } | undefined)?.stackAuthId || '';
          const trigger = (m as { triggerWord?: string } | undefined)?.triggerWord || '';
          const status = (m as { trainingStatus?: string } | undefined)?.trainingStatus || '';
          const modelName = (m as { modelName?: string } | undefined)?.modelName || '';
          const replicateModelId = (m as { replicateModelId?: string } | undefined)?.replicateModelId || '';
          const replicateVersionId = (m as { replicateVersionId?: string } | undefined)?.replicateVersionId || '';
          const completedAt = (m as { completedAt?: string | Date } | undefined)?.completedAt ? new Date((m as { completedAt?: string | Date }).completedAt as string).toISOString() : '';
          rows.push(`| ${email} | ${legacyId} | ${stackId} | ${trigger} | ${status} | ${modelName} | ${replicateModelId} | ${replicateVersionId} | ${completedAt} |`);
        }

        const markdown = `${header}\n${rows.join('\n')}\n`;
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(markdown);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to export trained users', message: (error as Error).message });
      }
    }

    // Auto-registration endpoint
    if (req.url === '/api/auth/auto-register') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const { email, plan, source } = req.body || {};
        
        if (!email || !plan) {
          return res.status(400).json({ error: 'Email and plan are required' });
        }
        
        
        const { storage } = await import('../server/storage.js');
        const existingUser = await storage.getUserByEmail(email);
        
        if (existingUser) {
          
          const updatedUser = await storage.updateUserProfile(existingUser.id, {
            plan: plan,
            monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
            mayaAiAccess: true,
            lastLoginAt: new Date()
          });
          
          return res.status(200).json({
            success: true,
            message: 'Account updated successfully',
            userId: updatedUser.id,
            email: updatedUser.email,
            action: 'updated'
          });
        }
        
        const newUserId = `user_${Date.now()}_${email.split('@')[0]}`;
        const newUser = await storage.upsertUser(getDefaultUserFields({
          id: newUserId,
          email: email,
          displayName: email.split('@')[0],
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          plan: plan,
          monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
          onboardingProgress: JSON.stringify({ source: source || 'payment-success' })
        }));
        
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(201).json({
          success: true,
          message: 'Account pre-created successfully',
          userId: newUser.id,
          email: newUser.email,
          plan: newUser.plan,
          action: 'created'
        });
        
      } catch (error) {
        console.error('❌ AUTO-REGISTRATION: Failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create account',
          message: (error as Error).message
        });
      }
    }

    // Stack Auth API proxy endpoints
    if (req.url?.startsWith('/api/auth/') && !req.url.includes('auto-register')) {
      
      try {
        const stackAuthPath = req.url.replace('/api/auth', '');
        const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${STACK_AUTH_PROJECT_ID}${stackAuthPath}`;
        
        
        const proxyResponse = await fetch(stackAuthUrl, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || '',
            'x-stack-project-id': STACK_AUTH_PROJECT_ID,
            'x-stack-access-type': 'client', // 🔥 CRITICAL FIX: Required header for Stack Auth API
            'x-stack-publishable-client-key': process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '',
            ...(req.body ? {} : {})
          },
          body: req.body ? JSON.stringify(req.body) : undefined
        });
        
        const responseData = await proxyResponse.text();
        
        res.setHeader('Content-Type', proxyResponse.headers.get('content-type') || 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        
        return res.status(proxyResponse.status).send(responseData);
        
      } catch (error) {
        return res.status(500).json({ 
          error: 'Stack Auth proxy failed',
          message: (error as Error).message
        });
      }
    }

    // ✅ REMOVED /api/auth/user ENDPOINT - Now handled by server/routes/modules/auth.ts

    // Admin endpoints
    if (req.url === '/api/admin/backfill-stack-users') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      
      const users = (req.body && (req.body as { users?: Array<{ id: string; email?: string | null; displayName?: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null }> }).users) || [];
      if (!Array.isArray(users)) return res.status(400).json({ error: 'users array required' });
      
      const results: Array<{ id: string; email: string | null }> = [];
      for (const u of users) {
        const dbUser = await ensureDbUserFromStack({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          firstName: u.firstName,
          lastName: u.lastName,
          profileImageUrl: u.profileImageUrl,
        });
        results.push({ id: dbUser.id, email: dbUser.email });
      }
      
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, count: results.length, users: results });
    }

    if (req.url === '/api/admin/link-legacy-user') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      
      const { legacyUserId, stackId } = (req.body || {}) as { legacyUserId?: string | number; stackId?: string };
      if (!legacyUserId || !stackId) return res.status(400).json({ error: 'legacyUserId and stackId required' });
      
      const { storage } = await import('../server/storage.js');
      const linked = await storage.linkStackAuthId(String(legacyUserId), String(stackId));
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, linkedUserId: linked.id, email: linked.email });
    }

    if (req.url === '/api/admin/export-user-metadata') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });
      
      const { storage } = await import('../server/storage.js');
      const users = await storage.getAllUsers();
      const result: Array<{ email: string | null; stackId: string | null; legacyUserId: string; triggerWord: string; modelStatus: string; modelName: string | null }> = [];
      
      for (const u of users as Array<{ id: string; stackAuthId?: string; email?: string }>) {
        const legacyUserId = u.id;
        const stackId = u.stackAuthId || null;
        const model = await storage.getUserModelByUserId(String(legacyUserId));
        const triggerWord = model?.triggerWord || `user${String(legacyUserId).replace(/[^a-zA-Z0-9]/g, '')}`;
        result.push({
          email: u.email || null,
          stackId,
          legacyUserId,
          triggerWord,
          modelStatus: model?.trainingStatus || 'not_started',
          modelName: model?.modelName || null
        });
      }
      
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ count: result.length, users: result });
    }

    if (req.url === '/api/admin/push-stack-metadata') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });

      const PROJECT_ID = process.env['STACK_AUTH_PROJECT_ID'] || process.env['VITE_STACK_PROJECT_ID'];
      const STACK_KEY = process.env['STACK_ADMIN_KEY'] || process.env['STACK_SERVER_KEY'] || '';
      if (!PROJECT_ID || !STACK_KEY) {
        return res.status(500).json({ error: 'Missing STACK_AUTH_PROJECT_ID or STACK_ADMIN_KEY on server' });
      }

      try {
        const { storage } = await import('../server/storage.js');
        const trainedModels = await storage.getAllCompletedTrainings();
        const updated: Array<{ stackId: string; legacyUserId: string; email: string | null; ok: boolean; status: number }> = [];
        const skipped: Array<{ userId: string; reason: string }> = [];

        for (const m of trainedModels as Array<{ userId: string; triggerWord?: string; trainingStatus?: string; modelName?: string; replicateModelId?: string; replicateVersionId?: string }>) {
          const userId = m.userId;
          const u = await storage.getUser(userId);
          const email = (u as { email?: string } | undefined)?.email || null;
          const stackId = (u as { stackAuthId?: string } | undefined)?.stackAuthId || null;
          
          if (!stackId) {
            skipped.push({ userId, reason: 'No stackAuthId' });
            continue;
          }
          
          const triggerWord = m.triggerWord || `user${String(userId).replace(/[^a-zA-Z0-9]/g, '')}`;
          const modelStatus = m.trainingStatus || 'completed';
          const modelName = m.modelName || '';
          const replicateModelId = m.replicateModelId || '';
          const replicateVersionId = m.replicateVersionId || '';

          const body = {
            metadata: {
              legacyUserId: userId,
              triggerWord,
              modelStatus,
              modelName,
              replicateModelId,
              replicateVersionId,
            },
          };

          let status = 0;
          try {
            const resp = await timedFetch(`https://api.stack-auth.com/api/v1/projects/${PROJECT_ID}/users/${stackId}`, 8000, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${STACK_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            });
            status = resp.status;
            updated.push({ stackId, legacyUserId: userId, email, ok: resp.ok, status });
          } catch {
            updated.push({ stackId, legacyUserId: userId, email, ok: false, status });
          }
        }

        return res.status(200).json({
          ok: true,
          projectId: PROJECT_ID,
          updatedCount: updated.filter(x => x.ok).length,
          failedCount: updated.filter(x => !x.ok).length,
          skippedCount: skipped.length,
          updated,
          skipped,
        });
      } catch (error) {
        return res.status(500).json({ error: 'Push to Stack failed', message: (error as Error).message });
      }
    }

    // Admin user repair endpoint
    if (req.url === '/api/admin/repair-users') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      const adminToken = req.headers['x-admin-token'] as string;
      const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
      if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });

      try {
        const { userSyncRepair } = await import('../server/user-sync-repair.js');
        const { action = 'check', userIdentifier } = req.body;

        switch (action) {
          case 'check': {
            const status = await userSyncRepair.checkUserSyncStatus();
            return res.json({
              success: true,
              status,
              message: `Found ${status.issuesFound.length} synchronization issues`
            });
          }

          case 'repair-all': {
            const result = await userSyncRepair.repairAllUsers();
            return res.json({
              success: true,
              result,
              message: `Repaired ${result.repaired} users with ${result.errors.length} errors`
            });
          }

          case 'repair-user': {
            if (!userIdentifier) {
              return res.status(400).json({
                success: false,
                message: 'userIdentifier required for repair-user action'
              });
            }

            const success = await userSyncRepair.repairUser(userIdentifier);
            return res.json({
              success,
              message: success 
                ? `User ${userIdentifier} repaired successfully`
                : `Failed to repair user ${userIdentifier}`
            });
          }

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Use: check, repair-all, or repair-user'
            });
        }
      } catch (error) {
        console.error('❌ User repair endpoint error:', error);
        return res.status(500).json({
          success: false,
          message: 'User repair operation failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // ✅ REMOVED DUPLICATE /api/me ENDPOINT - Now using dedicated api/me.ts with hardened middleware
    
    // ✅ REMOVED /api/user-model ENDPOINT - Now handled by server/routes/modules/training.ts (Day 3, Phase 2)

    // ✅ REMOVED MAYA ENDPOINTS - Now handled by server/routes/modules/maya.ts (Day 5, Phase 4)
    // - /api/maya/get-video-prompt (video direction with Claude API)
    // - /api/maya/generate (image generation via mayaService)
    // - /api/maya/heart-image (save chat previews to gallery)
    // - /api/maya/status (system status check)
    // - /api/maya/models (list available models)
    // - /api/maya/env-check (environment validation)
    // - /api/maya/chat + aliases /api/maya-chat, /api/maya-generate (main conversational AI)
    // - /api/maya-chats (list conversations)
    // - /api/maya/chat-history (get conversation messages)

    // Cron endpoints
    if (req.url === '/api/cron/training-completion-monitor') {
      try {
        const { TrainingCompletionMonitor } = await import('../server/training-completion-monitor.js');
        await TrainingCompletionMonitor.checkAllInProgressTrainings();
        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({ ok: false, error: (error as Error).message });
      }
    }

    // ✅ REMOVED TRAINING STATUS ENDPOINTS - Now handled by server/routes/modules/training.ts (Day 3, Phase 2)
    // - /api/training/status
    // - /api/training-status (alias)
    // - /api/training-progress/:userId

    // Cron endpoints
    if (req.url === '/api/cron/training-completion-monitor') {
      try {
        const { TrainingCompletionMonitor } = await import('../server/training-completion-monitor.js');
        await TrainingCompletionMonitor.checkAllInProgressTrainings();
        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({ ok: false, error: (error as Error).message });
      }
    }

    // ADDED: Generation completion monitor cron endpoint
    if (req.url === '/api/cron/generation-completion-monitor') {
      try {
        const { GenerationCompletionMonitor } = await import('../server/generation-completion-monitor.js');
        const monitor = GenerationCompletionMonitor.getInstance();
        await monitor.checkAllInProgressGenerations();
        return res.status(200).json({ ok: true, message: 'Generation monitoring complete' });
      } catch (error) {
        return res.status(500).json({ ok: false, error: (error as Error).message });
      }
    }

    // ✅ REMOVED GALLERY ENDPOINTS - Now handled by server/routes/modules/gallery.ts (Day 4, Phase 3)
    // - /api/gallery
    // - /api/gallery-images

    // ✅ REMOVED /api/user/update-gender ENDPOINT - Now handled by server/routes/modules/auth.ts

    // Test database connection endpoint
    if (req.url === '/api/test-db') {
      try {
        const { storage } = await import('../server/storage.js');
        const user = await getAuthenticatedUser();
        
        const dbUser = await storage.getUser(user.id as string);
        const aiImages = await storage.getAIImages(user.id as string);
        const generatedImages = await storage.getGeneratedImages(user.id as string);
        
        return res.status(200).json({
          message: 'Database connection test',
          user: {
            id: user.id,
            email: user.email,
            dbUser: dbUser ? { id: dbUser.id, email: dbUser.email } : null
          },
          counts: {
            aiImages: aiImages.length,
            generatedImages: generatedImages.length
          },
          sampleAiImages: aiImages.slice(0, 3),
          sampleGeneratedImages: generatedImages.slice(0, 3)
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Database connection failed',
          error: (error as Error).message,
          stack: (error as Error).stack
        });
      }
    }

    // ✅ REMOVED FAVORITES ENDPOINTS - Now handled by server/routes/modules/gallery.ts (Day 4, Phase 3)
    // - GET /api/images/favorites
    // - POST /api/images/:id/favorite
    // - DELETE /api/ai-images/:id

    // 🔥 CRITICAL FIX: Stack Auth API Proxy for /api/v1/ requests
    if (req.url?.startsWith('/api/v1/')) {
      console.log('🔍 ENHANCED DEBUG: Stack Auth API Proxy request:', {
        url: req.url,
        method: req.method,
        headers: {
          'x-stack-access-type': req.headers['x-stack-access-type'],
          'x-stack-project-id': req.headers['x-stack-project-id'],
          'x-stack-publishable-client-key': req.headers['x-stack-publishable-client-key']?.toString().substring(0, 20) + '...'
        }
      });

      try {
        // Forward request to Stack Auth API
        const stackAuthUrl = `https://api.stack-auth.com${req.url}`;
        const stackAuthHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Forward all Stack Auth headers
        const stackHeaders = [
          'x-stack-access-type',
          'x-stack-project-id', 
          'x-stack-publishable-client-key',
          'x-stack-random-nonce',
          'x-stack-allow-anonymous-user',
          'x-stack-override-error-status',
          'x-stack-client-version'
        ];

        stackHeaders.forEach(header => {
          if (req.headers[header]) {
            stackAuthHeaders[header] = req.headers[header] as string;
          }
        });


        const stackAuthResponse = await fetch(stackAuthUrl, {
          method: req.method,
          headers: stackAuthHeaders,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        const responseData = await stackAuthResponse.json();

        console.log('🔍 ENHANCED DEBUG: Stack Auth response:', {
          status: stackAuthResponse.status,
          hasConfig: !!responseData.config,
          hasSignUpEnabled: responseData.config?.sign_up_enabled !== undefined
        });

        // Return Stack Auth response with proper headers
        res.setHeader('Content-Type', 'application/json');
        return res.status(stackAuthResponse.status).json(responseData);

      } catch (error) {
        console.error('❌ Stack Auth API Proxy Error:', error);
        return res.status(500).json({
          error: 'Stack Auth API proxy failed',
          message: (error as Error).message
        });
      }
    }

    // Default response for non-Stack Auth requests
    return res.status(200).json({
      message: 'SSELFIE Studio API',
      endpoint: req.url
    });
    
  } catch (error) {
    console.error('❌ API Handler Error:', error);
    const body = { error: 'Internal server error', message: (error as Error).message };
    
    if (typeof (res as any).status === 'function') {
      return res.status(500).json(body);
    } else {
      const NodeResponse = (globalThis as any).Response;
      return new NodeResponse(JSON.stringify(body), { 
        status: 500, 
        headers: { 'content-type': 'application/json' } 
      });
    }
  }
}