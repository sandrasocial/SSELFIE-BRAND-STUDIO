/**
 * Gallery and image-related route handlers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../middleware/auth';

export async function handleGallery(req: VercelRequest, res: VercelResponse) {
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

    // Get user's images/gallery
    const images = await storage.getUserImages(user.id);
    return res.status(200).json({ images });
  } catch (error) {
    console.error('❌ Gallery error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch gallery', 
      details: (error as Error).message 
    });
  }
}

export async function handleGalleryImages(req: VercelRequest, res: VercelResponse) {
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

    if (req.method === 'GET') {
      const images = await storage.getUserImages(user.id);
      return res.status(200).json(images);
    }

    if (req.method === 'POST') {
      const { imageUrl, prompt, category } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: 'imageUrl is required' });
      }

      const newImage = await storage.createUserImage({
        userId: user.id,
        imageUrl,
        prompt: prompt || '',
        category: category || 'generated',
      });

      return res.status(201).json(newImage);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Gallery images error:', error);
    return res.status(500).json({ 
      error: 'Gallery images operation failed', 
      details: (error as Error).message 
    });
  }
}

export async function handleImagesFavorites(req: VercelRequest, res: VercelResponse) {
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

    if (req.method === 'GET') {
      const favorites = await storage.getUserFavoriteImages(user.id);
      return res.status(200).json(favorites);
    }

    if (req.method === 'POST') {
      const { imageId } = req.body;
      if (!imageId) {
        return res.status(400).json({ error: 'imageId is required' });
      }

      await storage.addImageToFavorites(user.id, imageId);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { imageId } = req.body;
      if (!imageId) {
        return res.status(400).json({ error: 'imageId is required' });
      }

      await storage.removeImageFromFavorites(user.id, imageId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Images favorites error:', error);
    return res.status(500).json({ 
      error: 'Favorites operation failed', 
      details: (error as Error).message 
    });
  }
}