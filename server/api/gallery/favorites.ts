/**
 * Gallery Favorites GET API - Pure Serverless
 * GET /api/images/favorites
 * 
 * Returns array of favorite image IDs for the authenticated user
 * Filters AI images by isFavorite OR isSelected flags
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10
} as const;

// Types from Express Router version
interface AiImage {
  id: number;
  userId: string;
  imageUrl: string;
  prompt?: string | null;
  style?: string | null;
  category?: string | null;
  source?: string | null;
  createdAt?: Date | null;
  isFavorite?: boolean | null;
  isSelected?: boolean | null;
}

/**
 * Timeout wrapper with fallback
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate with Stack Auth (JWT verification)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // JWT verification with jose
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env['STACK_SECRET_SERVER_KEY']);
    
    let userId: string;
    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.sub as string;
      
      if (!userId) {
        return res.status(401).json({ error: 'Invalid token: missing user ID' });
      }
    } catch (error) {
      console.error('❌ Favorites GET: JWT verification failed:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log(`⭐ Favorites GET: Fetching for user ${userId}`);

    // 2. Set response headers (no-cache for fresh data)
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 3. Fetch AI images with timeout and graceful fallback
    try {
      const ai = await withTimeout(
        storage.getAIImages(userId), 
        5000, 
        'getAIImages'
      ) as unknown as AiImage[];
      
      // 4. Filter for favorites (isFavorite OR isSelected)
      const favIds = ai
        .filter((img: AiImage) => Boolean(img.isFavorite || img.isSelected))
        .map((img: AiImage) => img.id);
      
      console.log(`✅ Favorites GET: Found ${favIds.length} favorites for user ${userId}`);
      
      // 5. Return response
      return res.status(200).json({ favorites: favIds });
      
    } catch (fetchError) {
      // Graceful fallback: return empty array on error
      console.warn('⚠️  Favorites GET: Fetch failed, returning empty array:', (fetchError as Error).message);
      return res.status(200).json({ favorites: [] });
    }

  } catch (error) {
    console.error('❌ Favorites GET: Unexpected error:', error);
    // Even on unexpected error, return empty array (graceful degradation)
    return res.status(200).json({ favorites: [] });
  }
}
