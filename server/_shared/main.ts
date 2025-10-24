/* eslint-disable no-console */
import { VercelRequest, VercelResponse } from '@vercel/node';

// ⚠️ DEPRECATED: This file contains legacy inline authentication
// JWT verification is now handled by server/_middleware/auth.ts
// This file is kept for backward compatibility only

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

    // ⚠️ DEPRECATED: /api/me endpoint moved to api/me.ts with modern middleware
    // This handler is kept for backward compatibility only
    if (req.url === '/api/me' || req.url?.startsWith('/api/me?')) {
      return res.status(301).json({
        message: 'Moved to /api/me',
        error: 'This endpoint has been migrated. Please use /api/me instead.'
      });
    }

    // Default
    return res.status(200).json({ message: 'SSELFIE Studio API', endpoint: req.url });
  } catch (error: unknown) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Internal error' });
  }
}
