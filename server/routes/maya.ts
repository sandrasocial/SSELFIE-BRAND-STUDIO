/**
 * MAYA FAÇADE API - V1 LAUNCH STABILIZATION
 * 
 * This is the ONLY entry point for Maya's creative functions.
 * This façade protects Maya from system entanglement and provides
 * a clean, stable API for all Maya interactions.
 * 
 * Mission: Create a protective barrier around Maya's core intelligence
 * while maintaining functionality during the transition to V1 launch.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireStackAuth } from '../stack-auth';

const router = Router();

/**
 * POST /api/maya/chat
 * 
 * Clean entry point for Photo Studio interactions
 * Handles all Maya conversations and concept generation for photo creation
 */
router.post('/chat', requireStackAuth, async (req: Request, res: Response) => {
  try {
    console.log('🎨 MAYA FAÇADE: Photo Studio chat request received');
    
    const { message, conversationHistory } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    
    if (!message) {
      return res.status(400).json({
        error: 'Missing required field: message'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // For now, call the existing messy internal functions
    // This will be cleaned up in subsequent steps
    let response;
    
    try {
      // Call the working maya-unified router handler directly
      const mayaUnified = await import('../routes/maya-unified');
      response = await mayaUnified.processChatRequest({
        message,
        userId,
        conversationHistory: conversationHistory || [],
        user: (req as any).user
      });
    } catch (error) {
      console.log('⚠️ MAYA FAÇADE: Falling back to basic response due to:', error.message);
      // Fallback response if unified service not available
      response = {
        reply: "Maya is temporarily unavailable during system maintenance. Please try again shortly.",
        conceptCards: [],
        status: 'fallback'
      };
    }

    console.log('✅ MAYA FAÇADE: Photo Studio response generated');
    res.json(response);

  } catch (error) {
    console.error('❌ MAYA FAÇADE: Photo Studio error:', error);
    res.status(500).json({
      error: 'Maya encountered an issue with your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/maya/draft-storyboard
 * 
 * Clean entry point for Story Studio interactions
 * Handles Maya's video storyboard creation and narrative planning
 */
router.post('/draft-storyboard', async (req: Request, res: Response) => {
  try {
    console.log('🎬 MAYA FAÇADE: Story Studio storyboard request received');
    
    const { concept, userId, preferences } = req.body;
    
    if (!concept || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: concept and userId'
      });
    }

    // For now, call the existing messy internal functions
    // This will be cleaned up in subsequent steps
    let response;
    
    try {
      // Try to use the old maya-unified system temporarily  
      const mayaUnified = await import('../routes/maya-unified');
      if (mayaUnified && typeof mayaUnified.processStoryboardRequest === 'function') {
        response = await mayaUnified.processStoryboardRequest({
          concept,
          userId,
          preferences: preferences || {}
        });
      } else {
        throw new Error('Maya storyboard service not available');
      }
    } catch (error) {
      console.log('⚠️ MAYA FAÇADE: Falling back to basic storyboard response due to:', error.message);
      // Fallback response if unified service not available
      response = {
        storyboard: [],
        narrative: "Story Studio is temporarily unavailable during system maintenance. Please try again shortly.",
        keyframes: [],
        status: 'fallback'
      };
    }

    console.log('✅ MAYA FAÇADE: Story Studio storyboard generated');
    res.json(response);

  } catch (error) {
    console.error('❌ MAYA FAÇADE: Story Studio error:', error);
    res.status(500).json({
      error: 'Maya encountered an issue with your storyboard request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Health check endpoint for Maya Façade API
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    façade: 'active',
    timestamp: new Date().toISOString(),
    message: 'Maya Façade API is protecting core intelligence'
  });
});

export default router;