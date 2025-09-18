/**
 * Maya Routes - SIMPLE Implementation
 * Basic Maya endpoints without complex dependencies to test route loading
 */

import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth';

const router = Router();

// Simple Maya chat endpoint for testing
router.post('/api/maya/chat', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('🎨 MAYA SIMPLE: Chat request from user:', userId);
    
    // Simple response for testing - no Claude API calls
    const response = "Hi! I'm Maya, your AI Creative Director. I'm currently in testing mode. Your request has been received successfully!";
    
    res.json({
      response,
      message: response,
      agentName: 'Maya - AI Creative Director (Testing)',
      agentType: 'member',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ MAYA SIMPLE: Chat error:', error);
    res.status(500).json({ error: 'Failed to process Maya chat' });
  }
});

// Simple video prompt endpoint for testing
router.post('/api/maya/get-video-prompt', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    console.log('🎬 MAYA SIMPLE: Video prompt request from user:', userId);
    
    // Simple response for testing
    const videoPrompt = "Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.";
    
    res.json({
      videoPrompt,
      director: 'Maya - AI Creative Director (Testing)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ MAYA SIMPLE: Video prompt error:', error);
    res.status(500).json({ error: 'Failed to generate video direction' });
  }
});

// Health check for Maya routes
router.get('/api/maya/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Maya Simple Routes',
    timestamp: new Date().toISOString()
  });
});

export default router;
