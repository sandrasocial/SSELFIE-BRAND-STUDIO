/**
 * Authentication middleware for Vercel serverless functions
 * Validates Stack Auth tokens and attaches user to request
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AuthenticatedRequest } from '../_shared/auth-types.js';

export async function withAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<VercelResponse | void>
): Promise<VercelResponse | void> {
  try {
    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    // Verify token with Stack Auth
    // This is a simplified version - in production, you'd validate the token properly
    const user = await verifyStackAuthToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    // Call the handler
    return await handler(req as AuthenticatedRequest, res);
  } catch (error: unknown) {
    console.error('[ERROR] Auth middleware:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

async function verifyStackAuthToken(token: string): Promise<any> {
  try {
    // In production, validate the token with Stack Auth
    // For now, we'll do a basic check
    if (!token || token.length < 10) {
      return null;
    }

    // TODO: Implement proper Stack Auth token verification
    // This should call Stack Auth's verification endpoint or use their SDK
    
    // Placeholder: return user object if token exists
    return {
      id: 'user-from-token',
      email: 'user@example.com',
    };
  } catch (error) {
    console.error('[ERROR] Token verification failed:', error);
    return null;
  }
}

