/**
 * Gallery Images API - Pure Serverless
 * GET /api/gallery-images
 * 
 * Returns all user gallery images (AI generated + Generated images combined)
 * Replaces Express Router version with circuit breaker removed (rely on Vercel + NeonDB protections)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../storage.js';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
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

interface GeneratedImage {
  id: number;
  userId: string;
  prompt?: string | null;
  category?: string | null;
  selectedUrl?: string | null;
  imageUrls?: string | null;
  createdAt?: Date | null;
}

interface GalleryImageResponse {
  id: string;
  userId: string;
  type: 'ai_generated' | 'generated';
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  tags: string[];
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
    // 1. Authenticate with Stack Auth (using shared auth helper)
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = user.id;
    console.log(`🖼️  Gallery Images: Fetching for user ${userId}`);

    // 2. Set response headers (no-cache for fresh data)
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 3. Parallel fetch with timeout and error recovery
    // Note: Circuit breaker removed - relying on Vercel timeout + NeonDB connection pooling
    const [aiImages, generatedImages] = await Promise.all([
      withTimeout(storage.getAIImages(userId), 2500, 'getAIImages').catch(err => {
        console.warn('⚠️  Gallery Images: AI images fetch failed:', (err as Error).message);
        return [] as AiImage[];
      }),
      withTimeout(storage.getGeneratedImages(userId), 2500, 'getGeneratedImages').catch(err => {
        console.warn('⚠️  Gallery Images: Generated images fetch failed:', (err as Error).message);
        return [] as GeneratedImage[];
      })
    ]);

    console.log(`📊 Gallery Images: Found ${aiImages.length} AI images, ${generatedImages.length} generated images`);

    // 4. Format images for frontend (identical to Express Router version)
    const galleryImages: GalleryImageResponse[] = [
      // AI Generated Images
      ...aiImages.map(img => ({
        id: img.id.toString(),
        userId: img.userId,
        type: 'ai_generated' as const,
        title: img.style || 'AI Generated Image',
        description: img.prompt || 'AI-generated image',
        imageUrl: img.imageUrl,
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: img.style ? [img.style] : ['ai-generated']
      })),
      // Generated Images
      ...generatedImages.map(img => ({
        id: `gen_${img.id}`,
        userId: img.userId,
        type: 'generated' as const,
        title: 'Generated Image',
        description: img.prompt || 'Generated image',
        imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: [img.category || 'generated']
      }))
    ];

    // 5. Sort by creation date (newest first)
    galleryImages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`✅ Gallery Images: Returning ${galleryImages.length} total images`);

    // 6. Return response
    return res.status(200).json(galleryImages);

  } catch (error) {
    console.error('❌ Gallery Images: Unexpected error:', error);
    return res.status(500).json({
      message: 'Failed to fetch gallery images',
      error: (error as Error).message
    });
  }
}
