/**
 * Admin route handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function handleExportTrainedUsersDoc(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const adminToken = req.headers['x-admin-token'] as string;
    const expected = process.env.ADMIN_TOKEN || 'sandra-admin-2025';
    if (adminToken !== expected) return res.status(401).json({ error: 'Unauthorized' });

    const { storage } = await import('../../server/storage');
    const models = await storage.getAllCompletedTrainings();

    const header = [
      '# Trained Users Export',
      '',
      'Copy/paste this table into your Stack dashboard import or keep as a reference.',
      '',
      '| Email | LegacyUserId | StackId | TriggerWord | ModelStatus | ModelName | ReplicateModelId | ReplicateVersionId | CompletedAt |',
      '|---|---:|---|---|---|---|---|---|---|'
    ].join('\n');

    const rows: string[] = [];
    for (const model of models) {
      const userId = model.userId;
      const stackId = model.stackId || '';
      const email = model.email || 'unknown@example.com';
      
      rows.push(`| ${email} | ${userId} | ${stackId} | ${model.triggerWord} | ${model.status} | ${model.modelName || ''} | ${model.replicateModelId || ''} | ${model.replicateVersionId || ''} | ${model.completedAt ? new Date(model.completedAt).toISOString() : ''} |`);
    }

    const output = [header, ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="trained-users-export.md"');
    return res.status(200).send(output);
  } catch (error) {
    console.error('❌ Export trained users error:', error);
    return res.status(500).json({ error: 'Failed to export trained users', details: (error as Error).message });
  }
}

export async function handleBackfillStackUsers(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'users must be an array' });
    }

    const { storage } = await import('../../server/storage');
    
    const results = [];
    for (const user of users) {
      try {
        const result = await storage.createUser({
          id: user.id,
          email: user.email,
          stackId: user.id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          profileImageUrl: user.profileImageUrl || null,
        });
        results.push({ success: true, user: result });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message, userId: user.id });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Backfill failed', details: (error as Error).message });
  }
}

export async function handleLinkLegacyUser(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { legacyUserId, stackUserId } = req.body;
    if (!legacyUserId || !stackUserId) {
      return res.status(400).json({ error: 'legacyUserId and stackUserId are required' });
    }

    const { storage } = await import('../../server/storage');
    const result = await storage.linkLegacyUserToStack(legacyUserId, stackUserId);
    
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: 'Link failed', details: (error as Error).message });
  }
}

export async function handleExportUserMetadata(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { storage } = await import('../../server/storage');
    const users = await storage.getAllUsers();
    
    const metadata = users.map(user => ({
      id: user.id,
      email: user.email,
      stackId: user.stackId,
      displayName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="user-metadata.json"');
    return res.status(200).json(metadata);
  } catch (error) {
    return res.status(500).json({ error: 'Export failed', details: (error as Error).message });
  }
}

export async function handlePushStackMetadata(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }

    const { storage } = await import('../../server/storage');
    
    const results = [];
    for (const update of updates) {
      try {
        if (update.stackId) {
          const result = await storage.updateUserByStackId(update.stackId, {
            firstName: update.firstName,
            lastName: update.lastName,
            profileImageUrl: update.profileImageUrl,
          });
          results.push({ success: true, stackId: update.stackId, result });
        } else {
          results.push({ success: false, error: 'stackId is required', update });
        }
      } catch (error) {
        results.push({ success: false, error: (error as Error).message, update });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Push failed', details: (error as Error).message });
  }
}