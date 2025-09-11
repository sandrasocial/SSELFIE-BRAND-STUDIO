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

const express = require('express');
const router = express.Router();

// Import the existing messy internal functions (temporary during migration)
// These will be cleaned up in subsequent steps
let mayaUnified;
let modelTrainingService;

try {
  mayaUnified = require('../maya-unified.ts');
} catch (error) {
  console.log('⚠️ Maya Unified not found, will handle gracefully');
}

try {
  modelTrainingService = require('../model-training-service.ts');
} catch (error) {
  console.log('⚠️ Model Training Service not found, will handle gracefully');
}

/**
 * POST /api/maya/chat
 * 
 * Clean entry point for Photo Studio interactions
 * Handles all Maya conversations and concept generation for photo creation
 */
router.post('/chat', async (req, res) => {
  try {
    console.log('🎨 MAYA FAÇADE: Photo Studio chat request received');
    
    const { message, userId, conversationHistory } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: message and userId'
      });
    }

    // For now, call the existing messy internal functions
    // This will be cleaned up in subsequent steps
    let response;
    
    if (mayaUnified && mayaUnified.processChatRequest) {
      response = await mayaUnified.processChatRequest({
        message,
        userId,
        conversationHistory: conversationHistory || []
      });
    } else {
      // Fallback response if unified service not available
      response = {
        reply: "Maya is temporarily unavailable. Please try again shortly.",
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
router.post('/draft-storyboard', async (req, res) => {
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
    
    if (mayaUnified && mayaUnified.processStoryboardRequest) {
      response = await mayaUnified.processStoryboardRequest({
        concept,
        userId,
        preferences: preferences || {}
      });
    } else {
      // Fallback response if unified service not available
      response = {
        storyboard: [],
        narrative: "Story Studio is temporarily unavailable. Please try again shortly.",
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
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    façade: 'active',
    timestamp: new Date().toISOString(),
    message: 'Maya Façade API is protecting core intelligence'
  });
});

module.exports = router;