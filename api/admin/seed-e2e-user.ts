import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 } as const;

function isAdminAuthorized(req: VercelRequest): boolean {
  const headerKey = (req.headers['x-admin-key'] || req.headers['x-admin-token'] || '') as string;
  const envKey = process.env['STACK_ADMIN_KEY'] || process.env['ADMIN_TOKEN'] || '';
  return !!envKey && headerKey === envKey;
}

function param<T>(v: unknown, fallback: T): T {
  return (v !== undefined && v !== null && v !== '') ? (v as T) : fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'method_not_allowed' });
    }
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    res.setHeader('Cache-Control', 'no-store');

    const q = (req.method === 'GET' ? req.query : (req.body || {})) as any;
    const email = param<string>(q.email, 'test-user-e2e@sselfie.studio');
    const displayName = param<string>(q.displayName, 'E2E Test User');
    const role = param<string>(q.role, 'user');
    const imagesToEnsure = Math.min(parseInt(param<string>(q.images || q.count, '6')), 24) || 6;

    // 1) Upsert user
    let user = await storage.getUserByEmail(email);
    if (!user) {
      user = await storage.upsertUser({
        email,
        displayName,
        plan: 'sselfie-studio',
        role,
        hasRetrainingAccess: true,
        monthlyGenerationLimit: 100,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        onboardingProgress: JSON.stringify({ seeded: true }),
        lastLoginAt: new Date(),
      } as any);
    }

    // 2) Ensure model exists and is completed
    let model = await storage.getUserModel(user.id);
    if (!model) {
      model = await storage.createUserModel({
        userId: user.id,
        triggerWord: `user${String(user.id).replace(/[^a-zA-Z0-9]/g, '')}`,
        trainingStatus: 'completed',
        replicateModelId: 'e2e-model',
        replicateVersionId: 'e2e-version',
        trainedModelPath: 'e2e/path',
        isLuxury: false,
      } as any);
    } else if (model.trainingStatus !== 'completed') {
      model = await storage.updateUserModel(user.id, {
        trainingStatus: 'completed',
        replicateModelId: model.replicateModelId || 'e2e-model',
        replicateVersionId: model.replicateVersionId || 'e2e-version',
        trainedModelPath: model.trainedModelPath || 'e2e/path',
      } as any);
    }

    // 3) Seed generated images up to imagesToEnsure
    const existing = await storage.getGeneratedImages(user.id);
    const need = Math.max(0, imagesToEnsure - existing.length);

    const urlsForIndex = (i: number) => {
      const base = `https://placehold.co/1024x1024/jpg?text=E2E+${i+1}`;
      return [base, `${base}+B`, `${base}+C`, `${base}+D`];
    };

    const created: any[] = [];
    for (let i = 0; i < need; i++) {
      const imgs = urlsForIndex(i);
      const rec = await storage.saveGeneratedImage({
        userId: user.id,
        modelId: (model as any).id,
        category: 'Lifestyle',
        subcategory: 'Working',
        prompt: `E2E seeded image ${i+1}`,
        imageUrls: JSON.stringify(imgs),
        selectedUrl: imgs[0],
        saved: i % 2 === 0,
      } as any);
      created.push({ id: rec.id, selectedUrl: rec.selectedUrl });
    }

    return res.status(200).json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role, plan: user.plan },
      model: { id: (model as any).id, trainingStatus: (model as any).trainingStatus, replicateVersionId: (model as any).replicateVersionId },
      gallery: { existing: existing.length, created: created.length },
    });
  } catch (error) {
    console.error('❌ seed-e2e-user failed:', error);
    return res.status(500).json({ ok: false, error: (error as Error).message });
  }
}

