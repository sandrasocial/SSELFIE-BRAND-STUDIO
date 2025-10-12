/**
 * Gallery Favorite Toggle API - Pure Serverless
 * POST /api/images/:id/favorite
 * 
 * Toggles favorite status for a specific image
 * Returns updated favorite status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../storage.js';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 15
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

/**
 * Extract image ID from URL path
 * Supports both /api/images/123/favorite and query params
 */
function extractImageId(req: VercelRequest): number | null {
  // Try URL path first: /api/images/:id/favorite
  const urlMatch = req.url?.match(/\/api\/images\/(\d+)\/favorite/);
  if (urlMatch) {
    const id = parseInt(urlMatch[1], 10);
    if (!isNaN(id)) return id;
  }
  
  // Fallback: check query params
  const queryId = req.query.id;
  if (queryId) {
    const id = parseInt(queryId as string, 10);
    if (!isNaN(id)) return id;
  }
  
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate with Stack Auth (using shared auth helper)
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = user.id;

    // 2. Extract and validate image ID
    const imageId = extractImageId(req);
    
    if (!imageId) {
      console.warn('⚠️  Favorite Toggle: Invalid or missing image ID');
      return res.status(400).json({ error: 'Invalid image id' });
    }

    console.log(`⭐ Favorite Toggle: User ${userId} toggling image ${imageId}`);

    // 3. Set response headers (no-cache for fresh data)
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 4. Get current image to check favorite status
    const img = await withTimeout(
      storage.getAIImage(userId, imageId),
      4000,
      'getAIImage'
    ) as unknown as AiImage | undefined;
    
    if (!img) {
      console.warn(`⚠️  Favorite Toggle: Image ${imageId} not found for user ${userId}`);
      return res.status(404).json({ error: 'Image not found' });
    }

    // 5. Toggle favorite status
    const currentStatus = img.isFavorite ?? false;
    const newStatus = !currentStatus;
    
    console.log(`🔄 Favorite Toggle: Image ${imageId} - ${currentStatus} → ${newStatus}`);

    // 6. Update in database
    await withTimeout(
      storage.updateAIImage(imageId, { isFavorite: newStatus } as Partial<AiImage>),
      4000,
      'updateAIImage'
    );

    console.log(`✅ Favorite Toggle: Successfully updated image ${imageId}`);

    // 7. Return success response
    return res.status(200).json({ 
      ok: true, 
      id: imageId, 
      isFavorite: newStatus 
    });

  } catch (error) {
    console.error('❌ Favorite Toggle: Error:', error);
    return res.status(500).json({ 
      error: 'Failed to toggle favorite', 
      message: (error as Error).message 
    });
  }
}
