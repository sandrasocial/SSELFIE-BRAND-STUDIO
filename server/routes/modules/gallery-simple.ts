/**
 * Gallery Routes - SIMPLE Implementation
 * Basic gallery endpoints without complex dependencies to test route loading
 */

import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth';

const router = Router();

// Simple gallery endpoint for testing
router.get('/api/gallery-images', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📸 GALLERY SIMPLE: Request from user:', userId);
    
    // Return empty gallery for now - just to test JSON response
    res.setHeader('Cache-Control', 'no-store');
    res.json([]);

  } catch (error) {
    console.error('❌ GALLERY SIMPLE: Error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Alternative gallery endpoint
router.get('/api/gallery', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📸 GALLERY SIMPLE: Gallery request from user:', userId);
    
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      gallery: [],
      count: 0
    });

  } catch (error) {
    console.error('❌ GALLERY SIMPLE: Error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

export default router;
