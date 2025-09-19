/* eslint-disable no-console */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Types
interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt: string;
  category: string;
  emoji: string;
}

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  message?: string;
}

// Stack Auth configuration - use environment variables
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS resolver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JWKS = createRemoteJWKSet(new (globalThis as any).URL(JWKS_URL));

// Helper function to apply gender context to concept cards
async function applyGenderContext(conceptCards: ConceptCard[], userId: string): Promise<ConceptCard[]> {
  try {
    const { storage } = await import('../../server/storage');
    const { enforceGender, normalizeGender } = await import('../../server/utils/gender-prompt');

    const [user, userModel] = await Promise.all([
      storage.getUser(userId),
      storage.getUserModelByUserId(userId)
    ]);

    if (!user?.gender || !userModel?.triggerWord) {
      return conceptCards;
    }

    const secureGender = normalizeGender(user.gender);
    if (!secureGender) return conceptCards;

    return conceptCards.map((concept) => {
      let updatedPrompt = concept.fluxPrompt;
      let updatedDescription = concept.description;

      if (updatedPrompt) {
        const enforcedPrompt = enforceGender(userModel.triggerWord!, updatedPrompt, secureGender);
        updatedPrompt = enforcedPrompt;
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

      return { ...concept, fluxPrompt: updatedPrompt, description: updatedDescription };
    });
  } catch {
    return conceptCards;
  }
}

async function verifyJWTToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
    audience: STACK_AUTH_PROJECT_ID,
  });
  return payload;
}

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
          const v = (req.cookies as any)[n];
          if (!v) continue;
          if (v.startsWith('[')) { try { const a = JSON.parse(v); if (Array.isArray(a) && a[1]) { accessToken = a[1]; break; } } catch {} }
          if (!accessToken && v.startsWith('{')) { try { const o = JSON.parse(v); accessToken = o.accessToken || o.token || o.jwt; if (accessToken) break; } catch {} }
          if (!accessToken && v.includes('.')) { accessToken = v; break; }
        }
      }
      if (!accessToken) throw new Error('No access token found');
      const userInfo = await verifyJWTToken(accessToken);
      return { id: userInfo.sub || userInfo.user_id || userInfo.id, email: (userInfo as any).email };
    }

    // /api/me minimal
    if (req.url === '/api/me' || req.url?.startsWith('/api/me?')) {
      try {
        const user = await getAuthenticatedUser();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ user });
      } catch (e: any) {
        return res.status(401).json({ message: 'Authentication required', error: e?.message });
      }
    }

    // Default
    return res.status(200).json({ message: 'SSELFIE Studio API', endpoint: req.url });
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Internal error' });
  }
}


