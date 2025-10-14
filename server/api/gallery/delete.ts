/**
 * DELETE /api/ai-images/:id
 * Pure serverless endpoint for deleting AI images
 * 
 * Migration from Express Router: server/routes/modules/gallery.ts (lines 308-324)
 * Authenticated endpoint - requires Stack Auth JWT
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

// ===========================
// ID Extraction Helper
// ===========================

/**
 * Extract image ID from URL path
 * Supports: /api/ai-images/123
 */
function extractImageId(req: VercelRequest): number | null {
  // Try URL path extraction: /api/ai-images/123
  const urlMatch = req.url?.match(/\/api\/ai-images\/(\d+)/);
  if (urlMatch) {
    const id = parseInt(urlMatch[1], 10);
    return Number.isNaN(id) ? null : id;
  }

  // Fallback to query parameter
  const idParam = req.query?.id;
  if (typeof idParam === 'string') {
    const id = parseInt(idParam, 10);
    return Number.isNaN(id) ? null : id;
  }

  return null;
}

// ===========================
// Timeout Utility
// ===========================

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// ===========================
// Main Handler
// ===========================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    // Only allow DELETE method
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = user.id;

      // ===========================
      // 2. Extract & Validate Image ID
      // ===========================
      const imageId = extractImageId(req);

      if (!imageId) {
        return res.status(400).json({ error: 'Invalid image id' });
      }

      // ===========================
      // 3. Delete Image (4s timeout)
      // ===========================
      const ok = await withTimeout(
        storage.deleteAIImage(userId, imageId),
        4000,
        'deleteAIImage'
      );

      // ===========================
      // 4. Return Success
      // ===========================
      return res.status(200).json({ 
        ok, 
        id: imageId 
      });

    } catch (error) {
      console.error('Delete AI image error:', error);
      
      // Handle timeout errors
      if (error instanceof Error && error.message.includes('timed out')) {
        return res.status(504).json({
          error: 'Request timeout',
          message: error.message
        });
      }

      // Generic error response
      return res.status(500).json({
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
