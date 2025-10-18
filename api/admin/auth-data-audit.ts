import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { storage } from '../../server/storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 } as const;

function isAdminAuthorized(req: VercelRequest): boolean {
  const headerKey = (req.headers['x-admin-key'] || req.headers['x-admin-token'] || '') as string;
  const envKey = process.env['STACK_ADMIN_KEY'] || process.env['ADMIN_TOKEN'] || '';
  return !!envKey && headerKey === envKey;
}

function safeFirst(arr: unknown): string | null {
  try {
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0] as string;
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  res.setHeader('Cache-Control', 'no-store');

  return withAuth(req, res, async (_req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const users = await storage.getAllUsers?.();
      if (!users) {
        return res.status(200).json({
          summary: { usersCount: 0, modelsCompleted: 0, imagesCount: 0 },
          issues: [{ type: 'missing-method', message: 'storage.getAllUsers() not available in this build' }],
          details: [],
        });
      }

      const details: any[] = [];
      let modelsCompleted = 0;
      let imagesCount = 0;
      const issues: Array<{ type: string; message: string; userId?: string }> = [];

      for (const u of users) {
        const userId = u.id as string;
        const m = await (storage.getUserModel ? storage.getUserModel(userId) : Promise.resolve(undefined));

        let imgs: any[] = [];
        try {
          imgs = await storage.getGeneratedImages(userId);
        } catch (e) {
          issues.push({ type: 'generated-images-query', message: (e as Error).message, userId });
        }
        imagesCount += imgs.length;

        const trainingStatus = (m?.trainingStatus as string) || null;
        if (trainingStatus === 'completed') modelsCompleted += 1;

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
        if (!u.stackAuthId && !u.stackAuthUserId) {
          issues.push({ type: 'missing-stack-auth-id', message: 'User has no stackAuthId/stackAuthUserId', userId });
        }
        if (model && model.userId !== userId) {
          issues.push({ type: 'model-user-mismatch', message: `userModels.userId (${model.userId}) != users.id (${userId})`, userId });
        }
      }

      return res.status(200).json({
        summary: { usersCount: users.length, modelsCompleted, imagesCount },
        issues,
        details,
      });
    } catch (error) {
      console.error('❌ Admin auth/data audit failed:', error);
      return res.status(500).json({ error: 'audit_failed', message: error instanceof Error ? error.message : String(error) });
    }
  }, { optional: true });
}

