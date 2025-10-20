import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../server/[...route].js';

// Proxy all dynamic API routes (including /api/v1/*) to the unified handler
// This ensures Stack Auth API calls are properly routed in production
export default function routeHandler(req: VercelRequest, res: VercelResponse) {
  return (handler as any)(req, res);
}