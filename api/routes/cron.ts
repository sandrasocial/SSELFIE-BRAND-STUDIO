/**
 * Cron job handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function handleTrainingCompletionMonitor(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if this is a legitimate cron request
    const cronSecret = req.headers['x-cron-secret'] as string;
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    const { storage } = await import('../../server/storage');
    
    // Check for completed trainings that need processing
    const pendingTrainings = await storage.getPendingTrainingCompletions();
    let processed = 0;

    for (const training of pendingTrainings) {
      try {
        await storage.processTrainingCompletion(training.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process training ${training.id}:`, error);
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed,
      total: pendingTrainings.length 
    });
  } catch (error) {
    console.error('❌ Training completion monitor error:', error);
    return res.status(500).json({ 
      error: 'Cron job failed', 
      details: (error as Error).message 
    });
  }
}

export async function handleGenerationCompletionMonitor(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cronSecret = req.headers['x-cron-secret'] as string;
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    const { storage } = await import('../../server/storage');
    
    // Check for completed generations that need processing
    const pendingGenerations = await storage.getPendingGenerationCompletions();
    let processed = 0;

    for (const generation of pendingGenerations) {
      try {
        await storage.processGenerationCompletion(generation.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process generation ${generation.id}:`, error);
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed,
      total: pendingGenerations.length 
    });
  } catch (error) {
    console.error('❌ Generation completion monitor error:', error);
    return res.status(500).json({ 
      error: 'Cron job failed', 
      details: (error as Error).message 
    });
  }
}