import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/auth/index.js';

// Proxy all /api/auth/* requests to the unified Stack Auth proxy under server/auth/index.ts
// Ensures OAuth callbacks and token exchanges happen on our domain and cookies are set correctly
export default function authHandler(req: VercelRequest, res: VercelResponse) {
  return (handler as any)(req, res);
}

