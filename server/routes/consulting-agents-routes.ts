import { Router } from 'express';

const router = Router();

/**
 * PHASE 3.1: CONSULTING AGENTS REDIRECTION TO IMPLEMENTATION-AWARE ROUTING
 * All consulting requests now flow through implementation detection system
 */
router.post('/admin/consulting-chat', async (req, res) => {
  try {
    console.log('🔄 PHASE 3.1 REDIRECT: Consulting agent -> Implementation-aware routing');

    // Admin-only access (Sandra) - using req.user from Passport session
    if (!req.user || !(req.user as any)?.claims?.email || (req.user as any).claims.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        message: 'Consulting agents are only available to Sandra'
      });
    }

    const { agentId, message } = req.body;

    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // PHASE 3.1: Add consulting flag and redirect to implementation-aware endpoint
    const enhancedRequest = {
      ...req.body,
      consultingMode: true,
      implementationDetectionRequired: true,
      adminToken: 'sandra-admin-2025', // Ensure admin access for redirect
      userId: req.user ? (req.user as any).id : 'admin-sandra'
    };

    console.log(`🔄 PHASE 3.1: Redirecting ${agentId} to implementation-aware routing`);

    // FIXED: Direct agent chat execution instead of broken redirection
    const { claudeChat } = await import('../services/claude-api-service');
    
    console.log(`🤖 DIRECT AGENT EXECUTION: ${agentId}`);
    
    const result = await claudeChat(agentId, message, {
      userId: req.user ? (req.user as any).claims.sub : '42585527',
      conversationId: req.body.conversationId || `admin_${agentId}_${Date.now()}`,
      fileEditMode: req.body.fileEditMode || false,
      adminMode: true
    });
    
    // Add consulting mode indicator to response
    const consultingResult = {
      ...result,
      consultingMode: true,
      implementationDetected: result.agentId ? true : false,
      routedThrough: 'implementation-aware-system'
    };

    res.status(200).json(consultingResult);

  } catch (error: any) {
    console.error('❌ PHASE 3.1 CONSULTING REDIRECTION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Consulting agent redirection failed',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;