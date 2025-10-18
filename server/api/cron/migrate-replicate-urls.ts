/**
 * Cron: Migrate Replicate URLs to S3 (read/write)
 * Path: /api/cron/migrate-replicate-urls
 *
 * Scans all users' generated images and migrates any Replicate temp URLs
 * (replicate.delivery or replicate.com) to permanent S3 URLs via ImageStorageService.
 *
 * Safety:
 * - Idempotent: Skips URLs already on S3
 * - Bounded: Processes up to BATCH_LIMIT images per run (default 50)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';
import { ImageStorageService } from '../../image-storage-service.js';

const BATCH_LIMIT = Number(process.env['MIGRATE_BATCH_LIMIT'] || 50);

function isReplicateUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes('replicate.delivery') || u.includes('replicate.com');
}

export const config = { runtime: 'nodejs', maxDuration: 60 } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow both cron and manual (admin) invocation. Optional auth used only to populate req.user.
  return withAuth(req, res, async (_req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      res.setHeader('Cache-Control', 'no-store');

      const users = await storage.getAllUsers?.();
      if (!users) {
        return res.status(200).json({ migrated: 0, checkedImages: 0, updatedRecords: 0, message: 'storage.getAllUsers() not available' });
      }

      let migratedCount = 0;
      let checkedImages = 0;
      let updatedRecords = 0;

      outer: for (const u of users) {
        const list = await storage.getGeneratedImages(u.id as string);
        for (const img of list) {
          if (migratedCount >= BATCH_LIMIT) break outer;
          checkedImages++;

          // Parse imageUrls JSON array
          let urls: string[] = [];
          try {
            urls = Array.isArray(img.imageUrls) ? (img.imageUrls as any) : JSON.parse(String(img.imageUrls || '[]'));
          } catch { urls = []; }

          const newUrls: string[] = [];
          let changed = false;
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (isReplicateUrl(url)) {
              const s3 = await ImageStorageService.storeImagePermanently(url, u.id as string, `${img.id}_${i}`);
              newUrls.push(s3);
              changed = true;
              migratedCount++;
            } else {
              newUrls.push(url);
            }
            if (migratedCount >= BATCH_LIMIT) break;
          }

          // selectedUrl migration
          let newSelected = img.selectedUrl || null;
          if (isReplicateUrl(newSelected)) {
            // Prefer the first migrated URL, else keep original
            newSelected = newUrls.find((x) => !!x) || newSelected;
            changed = true;
          }

          if (changed) {
            await storage.updateGeneratedImage(img.id as number, {
              imageUrls: JSON.stringify(newUrls),
              selectedUrl: newSelected || undefined,
            } as any);
            updatedRecords++;
          }
        }
      }

      return res.status(200).json({ migrated: migratedCount, checkedImages, updatedRecords, batchLimit: BATCH_LIMIT });
    } catch (error) {
      console.error('❌ migrate-replicate-urls cron failed:', error);
      return res.status(500).json({ error: 'migration_failed', message: error instanceof Error ? error.message : String(error) });
    }
  }, { optional: true });
}

