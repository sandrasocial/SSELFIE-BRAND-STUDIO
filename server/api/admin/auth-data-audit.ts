/**
 * Admin Auth/Data Audit (read-only)
 * GET /api/admin/auth-data-audit
 *
 * Produces a summary of authentication/data integrity for users → userModels → generatedImages.
 * Requires STACK_ADMIN_KEY via header `x-admin-key` to run.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
} as const;

function isAdminAuthorized(req: VercelRequest): boolean {
  const headerKey = (req.headers['x-admin-key'] || req.headers['x-admin-token'] || '') as string;
  const envKey = process.env['STACK_ADMIN_KEY'] || process.env['ADMIN_TOKEN'] || '';
  return !!envKey && headerKey === envKey;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Optional auth to resolve req.user if header token present; do not block
  return withAuth(req, res, async (_req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      res.setHeader('Cache-Control', 'no-store');

      // Pull top-level user list; storage exposes list helpers via custom queries
      const users = await storage.getAllUsers?.();
      if (!users) {
        return res.status(200).json({
          summary: { usersCount: 0, modelsCompleted: 0, imagesCount: 0 },
          issues: [{ type: 'missing-method', message: 'storage.getAllUsers() not available in this build' }],
          details: [],
        });
      }

      // Load models and images in parallel per user (batched to avoid timeouts)
      const details: any[] = [];
      let modelsCompleted = 0;
      let imagesCount = 0;
      const issues: Array<{ type: string; message: string; userId?: string } > = [];

      for (const u of users) {
        const userId = u.id as string;
        const m = await (storage.getUserModel ? storage.getUserModel(userId) : Promise.resolve(undefined));

        // Count images
        let imgs: any[] = [];
        try {
          imgs = await storage.getGeneratedImages(userId);
        } catch (e) {
          issues.push({ type: 'generated-images-query', message: (e as Error).message, userId });
        }
        imagesCount += imgs.length;

        // Model checks
        const trainingStatus = (m?.trainingStatus as string) || null;
        if (trainingStatus === 'completed') modelsCompleted += 1;

        // URL validation for a small sample
        const sample = imgs.slice(0, 5).map((g) => ({
          id: g.id,
          selectedUrl: g.selectedUrl,
          firstUrl: g.imageUrls ? safeFirst(JSON.parse(g.imageUrls as any)) : null,
        }));

        details.push({
          userId,
          email: u.email ?? null,
          hasModel: !!m,
          trainingStatus,
          replicateVersionId: m?.replicateVersionId ?? null,
          generatedImages: imgs.length,
          sampleImages: sample,
        });

        const model = m;

        // Linkage checks
        if (!u.stackAuthId && !u.stackAuthUserId) {
          issues.push({ type: 'missing-stack-auth-id', message: 'User has no stackAuthId/stackAuthUserId', userId });
        }
        if (model && model.userId !== userId) {
          issues.push({ type: 'model-user-mismatch', message: `userModels.userId (${model.userId}) != users.id (${userId})`, userId });
        }
      }

      return res.status(200).json({
        summary: {
          usersCount: users.length,
          modelsCompleted,
          imagesCount,
        },
        issues,
        details,
      });
    } catch (error) {
      console.error('❌ Admin auth/data audit failed:', error);
      return res.status(500).json({ error: 'Audit failed', message: error instanceof Error ? error.message : String(error) });
    }
  }, { optional: true });
}

function safeFirst(arr: unknown): string | null {
  try {
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0] as string;
    return null;
  } catch {
    return null;
  }
}

