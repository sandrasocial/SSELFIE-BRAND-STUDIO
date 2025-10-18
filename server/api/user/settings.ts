import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { storage } from '../../storage.js';
import { db } from '../../drizzle.js';
import { mayaProfile } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25
} as const;

export type UserSettings = {
  notifications: {
    photoComplete: boolean;
    mayaUpdates: 'off' | 'daily' | 'weekly';
    tips: boolean;
  };
  photoQuality: {
    resolution: 'standard' | 'high';
    autoEnhance: boolean;
    backgroundRemoval: 'off' | 'auto';
  };
  account: {
    profileVisibility: 'private' | 'public';
    dataBackup: 'cloud' | 'local';
    photoSharing: boolean;
  };
};

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    photoComplete: true,
    mayaUpdates: 'weekly',
    tips: true
  },
  photoQuality: {
    resolution: 'high',
    autoEnhance: true,
    backgroundRemoval: 'auto'
  },
  account: {
    profileVisibility: 'public',
    dataBackup: 'cloud',
    photoSharing: true
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.method === 'GET') {
        // Ensure profile exists, then read preferences json
        await storage.ensureMayaProfile(user.id);
        const rows = await db.select().from(mayaProfile).where(eq(mayaProfile.userId, user.id)).limit(1);
        const prefs = (rows[0]?.preferences as unknown as UserSettings) || DEFAULT_SETTINGS;
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ settings: { ...DEFAULT_SETTINGS, ...prefs } });
      }

      if (req.method === 'PUT') {
        const incoming = (req.body || {}) as Partial<UserSettings>;
        // Ensure profile exists
        await storage.ensureMayaProfile(user.id);
        const rows = await db.select().from(mayaProfile).where(eq(mayaProfile.userId, user.id)).limit(1);
        const current = (rows[0]?.preferences as unknown as UserSettings) || DEFAULT_SETTINGS;
        const merged: UserSettings = {
          notifications: { ...DEFAULT_SETTINGS.notifications, ...current?.notifications, ...incoming?.notifications },
          photoQuality: { ...DEFAULT_SETTINGS.photoQuality, ...current?.photoQuality, ...incoming?.photoQuality },
          account: { ...DEFAULT_SETTINGS.account, ...current?.account, ...incoming?.account }
        };
        await db.update(mayaProfile).set({ preferences: merged, updatedAt: new Date() } as any).where(eq(mayaProfile.userId, user.id));
        return res.status(200).json({ success: true, settings: merged });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
      console.error('\u274c /api/user/settings error:', error);
      return res.status(500).json({ error: 'Failed to process settings' });
    }
  });
}

