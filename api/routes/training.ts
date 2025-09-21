/**
 * Training status and model-related route handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../middleware/auth';

export async function handleTrainingStatus(req: VercelRequest, res: VercelResponse) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { storage } = await import('../../server/storage');
    const user = await storage.getUserByStackId(authenticatedUser.sub);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's training status
    const trainingData = await storage.getUserTrainingData(user.id);
    return res.status(200).json(trainingData);
  } catch (error) {
    console.error('❌ Training status error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch training status', 
      details: (error as Error).message 
    });
  }
}

export async function handleLegacyTrainingStatus(req: VercelRequest, res: VercelResponse) {
  // Legacy endpoint - redirect to new one
  return handleTrainingStatus(req, res);
}