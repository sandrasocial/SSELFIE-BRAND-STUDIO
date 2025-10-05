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
    new Response(JSON.stringify({ error: 'Network timeout' }), { status: 408 }),
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
const CIRCUIT_BREAKER_TIMEOUT = 30000;
const CIRCUIT_BREAKER_RESET_TIME = 60000;

function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  if (circuitBreaker.isOpen && now - circuitBreaker.lastFailure > CIRCUIT_BREAKER_RESET_TIME) {
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
    console.log('🔄 Circuit breaker reset');
  }
  
  return !circuitBreaker.isOpen;
}

function recordCircuitBreakerFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.isOpen = true;
    console.log('⚠️ Circuit breaker opened due to repeated database failures');
  }
}

function recordCircuitBreakerSuccess() {
  if (circuitBreaker.failures > 0) {
    circuitBreaker.failures = 0;
    console.log('✅ Circuit breaker: database operations successful');
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
    console.log(`▶️ ${route} start`, meta || {}); 
  } catch {
    // Ignore logging errors
  }
  return {
    end: (outcome: string, extra?: Record<string, unknown>) => {
      const elapsed = Math.round(nowMs() - start);
      try { 
        console.log(`⏱️ ${route} ${outcome}`, { elapsedMs: elapsed, ...(extra || {}) }); 
      } catch {
        // Ignore logging errors
      }
      return elapsed;
    }
  };
}

// Gender context application
async function applyGenderContext(conceptCards: ConceptCard[], userId: string): Promise<ConceptCard[]> {
  try {
    console.log('🎯 Applying gender context to concept cards for user:', userId);
    
    const { storage } = await import('../server/storage.js');
    const { enforceGender, normalizeGender } = await import('../server/utils/gender-prompt.js');
    
    const [user, userModel] = await Promise.all([
      storage.getUser(userId),
      storage.getUserModelByUserId(userId)
    ]);
    
    if (!user?.gender || !userModel?.triggerWord) {
      console.log('⚠️ Gender or trigger word not available, skipping gender enforcement');
      return conceptCards;
    }
    
    const secureGender = normalizeGender(user.gender);
    if (!secureGender) {
      console.log('⚠️ Invalid gender format, skipping gender enforcement');
      return conceptCards;
    }
    
    console.log(`✅ Applying gender context: ${secureGender} with trigger: ${userModel.triggerWord}`);
    
    return conceptCards.map((concept, index) => {
      let updatedPrompt = concept.fluxPrompt;
      let updatedDescription = concept.description;
      
      if (updatedPrompt) {
        const enforcedPrompt = enforceGender(userModel.triggerWord!, updatedPrompt, secureGender);
        if (enforcedPrompt !== updatedPrompt) {
          console.log(`✅ Gender enforced in concept ${index + 1}: ${concept.title}`);
          updatedPrompt = enforcedPrompt;
        }
      }
      
      if (updatedDescription) {
        if (secureGender === 'man') {
          updatedDescription = updatedDescription
            .replace(/\bshe\b/gi, 'he')
            .replace(/\bher\b/gi, 'his')
            .replace(/\bwoman\b/gi, 'man')
            .replace(/\bwomen\b/gi, 'men');
        } else if (secureGender === 'woman') {
          updatedDescription = updatedDescription
            .replace(/\bhe\b/gi, 'she')
            .replace(/\bhis\b/gi, 'her')
            .replace(/\bman\b/gi, 'woman')
            .replace(/\bmen\b/gi, 'women');
        } else if (secureGender === 'non-binary') {
          updatedDescription = updatedDescription
            .replace(/\b(he|she)\b/gi, 'they')
            .replace(/\b(his|her)\b/gi, 'their')
            .replace(/\b(man|woman)\b/gi, 'person')
            .replace(/\b(men|women)\b/gi, 'people');
        }
      }
      
      return {
        ...concept,
        fluxPrompt: updatedPrompt,
        description: updatedDescription
      };
    });
    
  } catch (error) {
    console.log('❌ Gender context application failed (non-blocking):', error instanceof Error ? error.message : error);
    return conceptCards;
  }
}

// Extract concept cards from Maya's response
function extractConceptCards(response: string): ConceptCard[] {
  const conceptCards: ConceptCard[] = [];
  
  try {
    const conceptSections = response.split('---').filter(section => section.trim());
    
    conceptSections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      
      if (lines.length >= 2) {
        const titleLine = lines[0];
        const emojiMatch = titleLine.match(/^([🎯✨💼🌟💫🏆📸🎬])/u);
        const titleMatch = titleLine.match(/\*\*(.*?)\*\*/);
        
        const emoji = emojiMatch ? emojiMatch[1] : '🎯';
        const title = titleMatch ? titleMatch[1].trim() : `Concept ${index + 1}`;
        const description = lines[1] || '';
        
        let fluxPrompt = '';
        const fluxPromptLine = lines.find(line => line.includes('FLUX_PROMPT:'));
        if (fluxPromptLine) {
          fluxPrompt = fluxPromptLine.replace('FLUX_PROMPT:', '').trim();
        }
        
        if (title && description) {
          conceptCards.push({
            id: `concept_${Date.now()}_${index + 1}`,
            title: title,
            description: description,
            fluxPrompt: fluxPrompt,
            category: getCategoryFromTitle(title),
            emoji: emoji
          });
        }
      }
    });
  } catch (error) {
    console.log('❌ Error extracting concept cards:', (error as Error).message);
  }
  
  return conceptCards;
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
    console.log('🔍 API Handler: Request received', req.url);
    console.log('🔍 Method:', req.method);

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
        console.log('⚠️ Failed to set __vdpl cookie:', (e as Error).message);
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
        console.log('🔐 Found Bearer token in Authorization header');
      }
      
      // Check cookies
      const cookiesSource: Record<string, string> = (req as unknown as { cookies?: Record<string, string> }).cookies || parseCookieHeader(req.headers.cookie as string);
      if (!accessToken && cookiesSource) {
        console.log('🍪 All cookies received:', Object.keys(cookiesSource));
        
        const cookiesToTry = [
          'stack-access',
          'stack-access-token',
          'stack_session',
          '__Secure-next-auth.session-token',
        ];
        
        for (const cookieName of cookiesToTry) {
          const cookieValue = cookiesSource[cookieName];
          
          if (cookieValue) {
            console.log(`🍪 Found cookie: ${cookieName}`);
            
            try {
              // Try parsing as JSON array
              if (cookieValue.startsWith('[')) {
                const stackAccessArray = JSON.parse(cookieValue);
                if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
                  accessToken = stackAccessArray[1];
                  console.log('🔐 Found access token in JSON array format');
                  break;
                }
              }
              
              // Try parsing as JSON object
              if (cookieValue.startsWith('{')) {
                const stackAccessObj = JSON.parse(cookieValue);
                if (stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt) {
                  accessToken = stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt;
                  console.log('🔐 Found access token in JSON object format');
                  break;
                }
              }
              
              // Try as direct token
              if (cookieValue.length > 20 && cookieValue.includes('.')) {
                accessToken = cookieValue;
                console.log('🔐 Found access token in direct string format');
                break;
              }
              
            } catch (parseError) {
              console.log(`⚠️ Failed to parse ${cookieName} cookie:`, (parseError as Error).message);
              
              if (cookieValue.length > 20) {
                accessToken = cookieValue;
                console.log('🔐 Using raw cookie value as token');
                break;
              }
            }
          }
        }
        
        if (!accessToken) {
          console.log('🔍 No valid access token found in cookies');
        }
      }
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      console.log('🔐 Verifying JWT token...');
      
      // Verify JWT token
      const userInfo = await verifyJWTToken(accessToken);
      
      console.log('✅ JWT verified successfully');
      
      // Extract user information
      const userId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
      const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
      const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');
      
      console.log('📊 Extracted user info:', {
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
        
        console.log('🚀 AUTO-REGISTRATION: Creating database user for:', email, 'plan:', plan);
        
        const { storage } = await import('../server/storage.js');
        const existingUser = await storage.getUserByEmail(email);
        
        if (existingUser) {
          console.log('✅ AUTO-REGISTRATION: User already exists, updating plan:', existingUser.id);
          
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
        
        console.log('✅ AUTO-REGISTRATION: Database user created successfully:', newUser.id);
        
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
      console.log('🔍 Stack Auth API proxy called:', req.url);
      
      try {
        const stackAuthPath = req.url.replace('/api/auth', '');
        const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${STACK_AUTH_PROJECT_ID}${stackAuthPath}`;
        
        console.log('🔄 Proxying to Stack Auth:', stackAuthUrl);
        
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
        console.log('❌ Stack Auth proxy failed:', (error as Error).message);
        return res.status(500).json({ 
          error: 'Stack Auth proxy failed',
          message: (error as Error).message
        });
      }
    }

    // Auth user endpoint
    if (req.url?.includes('/api/auth/user')) {
      console.log('🔍 Auth user endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(user);
      } catch (error) {
        console.log('❌ Authentication failed:', (error as Error).message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: (error as Error).message
        });
      }
    }

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

    // ✅ REMOVED DUPLICATE /api/me ENDPOINT - Now using dedicated api/me.ts with hardened middleware

    // User model endpoint - Enhanced with robust error handling and fallback logic
    if (req.url?.includes('/api/user-model')) {
      const t = logStart('GET /api/user-model');
      
      try {
        const user = await getAuthenticatedUser();
        const { storage } = await import('../server/storage.js');
        
        console.log('🔍 Getting model for user:', user.id, user.email);
        
        let dbUser = null;
        let userModel: UserModel | null = null;
        
        // � BULLETPROOF: Use aggressive Stack Auth ID and email linking
        try {
          const result = await withDatabaseTimeoutAndRetry(
            () => storage.getUserModelByStackAuthAndEmail(user.id as string, user.email as string || ''), 
            { user: null, model: null }, 
            3000,
            1,
            'getUserModelByStackAuthAndEmail'
          );
          
          dbUser = result?.user || null;
          userModel = result?.model || null;
          
          console.log('✅ Bulletproof lookup result:', {
            foundUser: !!dbUser,
            foundModel: !!userModel,
            trainingStatus: userModel?.trainingStatus || 'not_started',
            userEmail: dbUser?.email
          });
          
        } catch (dbError) {
          console.error('❌ Bulletproof user lookup failed:', {
            userId: user.id,
            email: user.email,
            error: (dbError as Error).message
          });
          
          // Fallback to traditional lookup
          try {
            dbUser = await withDatabaseTimeout(
              storage.getUser(user.id as string), 
              null, 
              2000,
              'getUser'
            );
            
            if (!dbUser && user.email) {
              dbUser = await withDatabaseTimeout(
                storage.getUserByEmail(user.email as string), 
                null, 
                2000,
                'getUserByEmail'
              );
            }
          } catch (fallbackError) {
            console.error('❌ Fallback user lookup also failed:', (fallbackError as Error).message);
          }
        }
        
        // 🎯 FIX: If no database user found, create minimal fallback model for new users
        if (!dbUser) {
          console.warn(`❌ User ${user.id} authenticated but missing DB record. Creating minimal fallback model.`);
          
          const minimalModel = {
            id: null,
            userId: user.id,
            trainingStatus: 'not_started' as const,
            needsTraining: true,
            canRetrain: false,
            modelType: 'sselfie-studio',
            createdAt: null,
            updatedAt: null,
            userPlan: 'sselfie-studio',
            hasActiveSubscription: false,
            onboardingSource: 'unknown'
          };
          
          res.setHeader('Cache-Control', 'no-store');
          t.end('fallback');
          return json(res, 200, minimalModel);
        }
        
        // Fetch user model if not already obtained from bulletproof lookup
        if (dbUser && !userModel) {
          try {
            const result = await withDatabaseTimeout(
              storage.getUserModel(dbUser.id), 
              null,
              3000,
              'getUserModel'
            );
            userModel = result ?? null;
          } catch (error) {
            console.warn('📊 Model fetch failed or timed out for:', dbUser.id, (error as Error).message);
            // Continue with null model - will be handled as new user
            userModel = null;
          }
        }
        
        let trainingStatus = 'not_started';
        let needsTraining = true;
        let canRetrain = false;
        
        if (userModel) {
          trainingStatus = userModel.trainingStatus || 'not_started';
          needsTraining = trainingStatus !== 'completed';
          canRetrain = true;
          
          console.log('📊 Existing user model found:', {
            id: userModel.id,
            status: trainingStatus,
            needsTraining,
            canRetrain
          });
        } else {
          console.log('🆕 New user detected - no model exists');
          needsTraining = true;
          canRetrain = false;
        }
        
        let onboardingSourceSafe = 'unknown';
        try {
          const op = (dbUser as any).onboardingProgress;
          if (op) {
            const obj = typeof op === 'string' ? JSON.parse(op) : op;
            onboardingSourceSafe = (obj && obj.source) || 'unknown';
          }
        } catch {
          // Ignore parsing errors
        }

        const modelStatus = {
          id: userModel?.id || null,
          userId: dbUser.id,
          trainingStatus: trainingStatus,
          needsTraining: needsTraining,
          canRetrain: canRetrain,
          modelType: 'sselfie-studio',
          createdAt: userModel?.createdAt || null,
          updatedAt: userModel?.updatedAt || null,
          userPlan: dbUser.plan,
          hasActiveSubscription: (dbUser.monthlyGenerationLimit === -1 || (dbUser.monthlyGenerationLimit && dbUser.monthlyGenerationLimit > 0)),
          onboardingSource: onboardingSourceSafe
        };
        
        console.log('📊 Returning model status:', {
          trainingStatus,
          needsTraining,
          canRetrain,
          userPlan: dbUser.plan,
          onboardingSource: modelStatus.onboardingSource
        });
        
        res.setHeader('Cache-Control', 'no-store');
        t.end('ok');
        return json(res, 200, modelStatus);
        
      } catch (error) {
        const elapsed = t.end('error', { error: (error as Error).message });
        console.error('❌ Critical Error in /api/user-model:', {
          error: (error as Error).message,
          stack: (error as Error).stack,
          elapsedMs: elapsed
        });
        
        // 🛑 Server-side error reporting - log to unified error handler
        // TODO: Add Slack/Sentry notification here
        // await notifyError('Critical /api/user-model failure', error);
        
        if (isTimeoutError(error)) {
          return json(res, 500, { 
            error: 'Database timeout - please try again',
            message: 'Service temporarily unavailable',
            code: 'TIMEOUT'
          });
        }
        
        // Return clean 500 error for any other failures
        return json(res, 500, { 
          error: 'Failed to retrieve user data',
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    }

    // Maya video prompt endpoint
    if (req.url?.includes('/api/maya/get-video-prompt')) {
      const t = logStart('POST /api/maya/get-video-prompt');
      
      try {
        const user = await getAuthenticatedUser();
        
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { imageUrl } = req.body || {};
        
        if (!imageUrl) {
          return res.status(400).json({ error: 'Image URL is required' });
        }
        
        console.log('🎬 MAYA VIDEO DIRECTION: Creating motion prompt for user:', user.id);
        
        const videoDirectorPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Video Director. 

🎬 VIDEO DIRECTION MODE: You are analyzing the actual image provided to create the perfect motion prompt for VEO 3 video generation.

Your expertise includes:
- Cinematic storytelling and visual narrative
- Fashion and lifestyle video aesthetics
- Professional portrait cinematography
- Understanding of what makes compelling short-form video content

TASK: Analyze the provided image carefully and create ONE single, cinematic motion prompt that perfectly enhances what you see in the image.

ANALYSIS INSTRUCTIONS:
1. Study the subject's pose, expression, and mood
2. Observe the lighting, background, and overall composition
3. Consider the style and aesthetic of the image
4. Identify the best camera movement that would enhance the scene

MOTION PROMPT GUIDELINES:
- Keep it to 1-2 sentences maximum
- Focus on movements that specifically enhance THIS image
- Use the actual elements you see (lighting, pose, background, mood)
- Use professional cinematography terminology
- Make it suitable for high-end fashion/lifestyle content
- Be specific to what you observe in the image

Analyze the image and respond with ONLY the motion prompt that perfectly captures and enhances what you see - no explanation, no additional text.`;

        try {
          const claudeResponse = await timedFetch('https://api.anthropic.com/v1/messages', 15000, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env['ANTHROPIC_API_KEY'] || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 1000,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: videoDirectorPrompt
                    },
                    imageUrl.startsWith('data:')
                      ? {
                          type: 'image',
                          source: {
                            type: 'base64',
                            media_type: 'image/jpeg',
                            data: imageUrl.split(',')[1]
                          }
                        }
                      : {
                          type: 'image',
                          source: {
                            type: 'url',
                            url: imageUrl
                          }
                        }
                  ]
                }
              ]
            })
          });

          let videoPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
          
          if (claudeResponse.ok) {
            const data = await claudeResponse.json();
            videoPrompt = data.content[0].text;
            console.log('✅ MAYA VIDEO DIRECTION: Generated custom prompt via Claude Vision');
          } else {
            console.log('⚠️ MAYA VIDEO DIRECTION: Claude Vision failed, using fallback prompt');
          }
          
          res.setHeader('Cache-Control', 'no-store');
          t.end('ok');
          return res.status(200).json({
            videoPrompt,
            director: 'Maya - AI Creative Director',
            timestamp: new Date().toISOString()
          });
          
        } catch {
          const fallbackPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
          
          res.setHeader('Cache-Control', 'no-store');
          t.end('fallback');
          return res.status(200).json({
            videoPrompt: fallbackPrompt,
            director: 'Maya - AI Creative Director (Fallback)',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (authError) {
        t.end('unauthorized');
        console.log('❌ Maya video prompt auth failed:', (authError as Error).message);
        return res.status(401).json({ 
          error: 'Authentication required',
          message: (authError as Error).message
        });
      }
    }

    // Maya generate endpoint
    if (req.url?.includes('/api/maya/generate')) {
      console.log('🔍 Maya generate endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya generate for user:', user.id);
        
        const body = req.body || {};
        console.log('🔍 Maya generate request body:', JSON.stringify(body, null, 2));
        
        const { conceptCard } = body as {
          conceptCard?: {
            id: string;
            title: string;
            description?: string;
            fluxPrompt: string;
          };
        };
        
        if (!conceptCard || !conceptCard.fluxPrompt) {
          return res.status(400).json({ error: 'Concept card with fluxPrompt is required' });
        }
        
        // Use the new MayaService instead of old ModelTrainingService
        const { mayaService } = await import('../server/services/maya-service.js');
        
        console.log('🎨 MAYA: Starting image generation for user:', user.id);
        console.log('🎯 Concept:', conceptCard.title);
        console.log('🎯 Prompt:', conceptCard.fluxPrompt);
        
        const generationResult = await mayaService.generateImages(user.id as string, {
          conceptCard
        });
        
        console.log('✅ Generation result:', generationResult);
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          success: true,
          generationId: generationResult.generationId,
          status: generationResult.status,
          message: generationResult.message
        });
        
      } catch (error) {
        console.log('❌ Maya generate failed:', (error as Error).message);
        return res.status(500).json({ 
          message: 'Image generation failed',
          error: (error as Error).message
        });
      }
    }

    // Maya generation status endpoint
    if (req.url?.includes('/api/maya/status')) {
      console.log('🔍 Maya status endpoint called:', req.url);
      
      try {
        const user = await getAuthenticatedUser();
        const url = new (globalThis as any).URL(req.url || '', `http://${req.headers.host}`);
        const generationId = url.searchParams.get('generationId') || url.searchParams.get('predictionId');
        
        if (!generationId) {
          return res.status(400).json({ error: 'Generation ID is required' });
        }
        
        // Use the new MayaService instead of old ModelTrainingService
        const { mayaService } = await import('../server/services/maya-service.js');
        
        console.log('🔍 Checking generation status for generation:', generationId);
        
        const statusResult = await mayaService.getGenerationStatus(user.id as string, generationId);
        
        console.log('� Generation status result:', statusResult);
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(statusResult);
        
      } catch (error) {
        console.log('❌ Maya status check failed:', (error as Error).message);
        return res.status(500).json({ 
          message: 'Status check failed',
          error: (error as Error).message
        });
      }
    }

    // Maya chat endpoints
    if (req.url?.includes('/api/maya/chat') || req.url?.includes('/api/maya-chat') || req.url?.includes('/api/maya-generate')) {
      const t = logStart('POST /api/maya/chat');
      
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported.' });
      }
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Maya chat for user:', user.id, user.email);
        
        const body = req.body || {};
        console.log('🔍 Maya chat request body:', JSON.stringify(body, null, 2));
        
        const { message, context = 'styling', conversationHistory = [] } = body as {
          message?: string;
          context?: string;
          conversationHistory?: ConversationEntry[];
        };
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        // Use the new MayaService instead of direct Claude API calls
        const { mayaService } = await import('../server/services/maya-service.js');
        
        console.log('🎨 MAYA: Using MayaService for chat processing');
        
        const chatResult = await mayaService.processChat(user.id as string, {
          message,
          history: conversationHistory.map(entry => ({
            user: entry.role === 'user' ? (entry.content || entry.message || '') : undefined,
            maya: entry.role === 'assistant' ? (entry.content || entry.message || '') : undefined
          })).filter(entry => entry.user || entry.maya)
        });
        
        const response = {
          id: `maya_${Date.now()}`,
          userId: user.id,
          message: message,
          response: chatResult.response,
          conceptCards: chatResult.conceptCards,
          timestamp: new Date().toISOString(),
          context: context
        };
        
        console.log('📊 Returning Maya response:', JSON.stringify(response, null, 2));
        res.setHeader('Cache-Control', 'no-store');
        t.end('ok', { concepts: response.conceptCards?.length || 0 });
        return res.status(200).json(response);
        
      } catch (error) {
        t.end('error', { error: (error as Error).message });
        console.log('❌ Maya chat failed:', (error as Error).message);
        
        if (isTimeoutError(error)) {
          return res.status(503).json({ 
            message: 'Maya is temporarily unavailable, please try again',
            error: 'Service timeout',
            code: 'TIMEOUT'
          });
        }
        
        return res.status(401).json({ 
          message: 'Authentication required',
          error: (error as Error).message
        });
      }
    }

    // Maya chats list endpoint
    if (req.url?.includes('/api/maya-chats')) {
      console.log('🔍 Maya chats list endpoint called');
      
      try {
        const user = await getAuthenticatedUser();
        console.log('🔍 Getting Maya chats for user:', user.id);
        
        const chats = [
          {
            id: `chat_1_${user.id}`,
            userId: user.id,
            title: 'Professional Headshots',
            lastMessage: 'I\'ve generated some professional headshot concepts for you.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `chat_2_${user.id}`,
            userId: user.id,
            title: 'Creative Portraits',
            lastMessage: 'Here are some creative portrait ideas to explore.',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        
        console.log('📊 Returning Maya chats:', chats.length, 'chats');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(chats);
        
      } catch (error) {
        console.log('❌ Maya chats fetch failed:', (error as Error).message);
        return res.status(401).json({ 
          message: 'Authentication required',
          error: (error as Error).message
        });
      }
    }

    // Training status endpoints
    if (req.url === '/api/training/status' || req.url?.startsWith('/api/training/status?')) {
      try {
        const user = await getAuthenticatedUser();
        const { storage } = await import('../server/storage.js');
        const model = await storage.getUserModelByUserId(user.id as string);
        const status = model?.trainingStatus || 'not_started';
        const progress = model?.trainingProgress || (status === 'completed' ? 100 : 0);
        const predictionId = (await storage.getUserGenerationTrackers(user.id as string))?.[0]?.predictionId || null;
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ status, progress, predictionId, model });
      } catch (error) {
        return res.status(401).json({ error: 'Authentication required', message: (error as Error).message });
      }
    }

    // Training status alias
    if (req.url === '/api/training-status' || req.url?.startsWith('/api/training-status?')) {
      (req as any).url = '/api/training/status';
      return handler(req, res);
    }

    // Training progress endpoint
    if (req.url?.startsWith('/api/training-progress/')) {
      try {
        const user = await getAuthenticatedUser();
        const targetUserId = req.url.split('/').pop() as string;
        if ((user.id as string) !== targetUserId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        const { storage } = await import('../server/storage.js');
        const model = await storage.getUserModelByUserId(targetUserId);
        const progress = model?.trainingProgress || (model?.trainingStatus === 'completed' ? 100 : 0);
        return res.status(200).json({ progress });
      } catch {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

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

    if (req.url === '/api/cron/generation-completion-monitor') {
      try {
        const { GenerationCompletionMonitor } = await import('../server/generation-completion-monitor.js');
        const monitor = new GenerationCompletionMonitor();
        await monitor.checkAllInProgressGenerations();
        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({ ok: false, error: (error as Error).message });
      }
    }

    // Gallery endpoints
    if (req.url === '/api/gallery' || req.url?.startsWith('/api/gallery?') || req.url === '/api/gallery-images' || req.url?.startsWith('/api/gallery-images?')) {
      const t = logStart('GET /api/gallery-images');
      
      try {
        if (!checkCircuitBreaker()) {
          console.warn('⚠️ Circuit breaker open for gallery-images');
          return res.status(503).json({
            images: [],
            total: 0,
            message: 'Service temporarily unavailable',
            code: 'CIRCUIT_BREAKER_OPEN'
          });
        }

        const user = await getAuthenticatedUser();
        console.log('🔍 Getting gallery images for user:', user.id, user.email);
        
        const { storage } = await import('../server/storage.js');
        
        const [aiImages, generatedImages] = await Promise.all([
          withTimeout(storage.getAIImages(user.id as string), 2500, 'getAIImages').catch(err => {
            console.warn('⚠️ AI images fetch failed:', (err as Error).message);
            recordCircuitBreakerFailure();
            return [];
          }),
          withTimeout(storage.getGeneratedImages(user.id as string), 2500, 'getGeneratedImages').catch(err => {
            console.warn('⚠️ Generated images fetch failed:', (err as Error).message);
            recordCircuitBreakerFailure();
            return [];
          })
        ]);
        
        if (aiImages.length > 0 || generatedImages.length > 0) {
          recordCircuitBreakerSuccess();
        }
        
        console.log('📊 Found AI images:', aiImages.length);
        console.log('📊 Found generated images:', generatedImages.length);
        
        const galleryImages = [
          ...aiImages.map(img => ({
            id: img.id.toString(),
            userId: img.userId,
            type: 'ai_generated',
            title: img.style || 'AI Generated Image',
            description: img.prompt || 'AI-generated image',
            imageUrl: img.imageUrl,
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: img.style ? [img.style] : ['ai-generated']
          })),
          ...generatedImages.map(img => ({
            id: `gen_${img.id}`,
            userId: img.userId,
            type: 'generated',
            title: 'Generated Image',
            description: img.prompt || 'Generated image',
            imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
            createdAt: (img.createdAt || new Date()).toISOString(),
            tags: [img.category || 'generated']
          }))
        ];
        
        galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('📊 Returning gallery images:', galleryImages.length, 'total images');
        res.setHeader('Cache-Control', 'no-store');
        t.end('ok', { count: galleryImages.length });
        return res.status(200).json(galleryImages);
        
      } catch (error) {
        t.end('error', { error: (error as Error).message });
        console.log('❌ Gallery fetch failed:', (error as Error).message);
        return res.status(500).json({ 
          message: 'Failed to fetch gallery images',
          error: (error as Error).message
        });
      }
    }

    // User gender update endpoint
    if (req.url === '/api/user/update-gender') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const user = await getAuthenticatedUser();
        const { gender } = req.body || {};
        
        if (!gender) {
          return res.status(400).json({ error: 'Gender is required' });
        }
        
        if (!['man', 'woman', 'female', 'male', 'non-binary', 'other'].includes(gender.toLowerCase())) {
          return res.status(400).json({ error: 'Invalid gender value' });
        }
        
        const { storage } = await import('../server/storage.js');
        await storage.updateUserProfile(user.id as string, { gender });
        
        console.log(`✅ Updated gender for user ${user.id}: ${gender}`);
        
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ 
          success: true, 
          message: 'Gender updated successfully' 
        });
        
      } catch (error) {
        console.log('❌ Gender update failed:', (error as Error).message);
        return res.status(500).json({ 
          error: 'Failed to update gender',
          message: (error as Error).message 
        });
      }
    }

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

    // Favorites endpoints
    if (req.url === '/api/images/favorites' || req.url?.startsWith('/api/images/favorites?')) {
      try {
        const user = await getAuthenticatedUser();
        const { storage } = await import('../server/storage.js');
        const ai = await withTimeout(storage.getAIImages(user.id as string), 5000, 'getAIImages') as unknown as AiImage[];
        const favIds = ai
          .filter((img: AiImage) => Boolean(img.isFavorite || img.isSelected))
          .map((img: AiImage) => img.id);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ favorites: favIds });
      } catch {
        return res.status(200).json({ favorites: [] });
      }
    }

    if (req.url?.startsWith('/api/images/') && req.url?.endsWith('/favorite')) {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      try {
        const user = await getAuthenticatedUser();
        const url = new (globalThis as any).URL(req.url || '', `http://${req.headers.host}`);
        const parts = url.pathname.split('/');
        const idStr = parts[3];
        const imageId = parseInt(idStr, 10);
        if (!imageId || Number.isNaN(imageId)) return res.status(400).json({ error: 'Invalid image id' });
        
        const { storage } = await import('../server/storage.js');
        const img = await withTimeout(storage.getAIImage(user.id as string, imageId), 4000, 'getAIImage') as unknown as AiImage | undefined;
        const next = !(img?.isFavorite ?? false);
        await withTimeout(storage.updateAIImage(imageId, { isFavorite: next } as Partial<AiImage>), 4000, 'updateAIImage');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok: true, id: imageId, isFavorite: next });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to toggle favorite', message: (error as Error).message });
      }
    }

    // Delete AI image endpoint
    if (req.method === 'DELETE' && req.url?.startsWith('/api/ai-images/')) {
      try {
        const user = await getAuthenticatedUser();
        const url = new (globalThis as any).URL(req.url || '', `http://${req.headers.host}`);
        const parts = url.pathname.split('/');
        const idStr = parts[3];
        const imageId = parseInt(idStr, 10);
        if (!imageId || Number.isNaN(imageId)) return res.status(400).json({ error: 'Invalid image id' });
        
        const { storage } = await import('../server/storage.js');
        const ok = await storage.deleteAIImage(user.id as string, imageId);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok, id: imageId });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete image', message: (error as Error).message });
      }
    }

    // 🔥 CRITICAL FIX: Stack Auth API Proxy for /api/v1/ requests
    if (req.url?.startsWith('/api/v1/')) {
      console.log('🔍 Stack Auth API Proxy:', {
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

        console.log('🌐 Forwarding to Stack Auth:', stackAuthUrl);

        const stackAuthResponse = await fetch(stackAuthUrl, {
          method: req.method,
          headers: stackAuthHeaders,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        const responseData = await stackAuthResponse.json();

        console.log('✅ Stack Auth Response:', {
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