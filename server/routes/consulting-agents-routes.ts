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

    // FIXED: Use existing agent-chat-bypass system for proper routing
    console.log(`🚀 ROUTING TO AGENT-CHAT-BYPASS: ${agentId}`);
    
    try {
      // Internal fetch to the existing agent-chat-bypass endpoint
      const bypassResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/admin/agent-chat-bypass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({
          agentId,
          message,
          fileEditMode: true,
          conversationId: req.body.conversationId
        })
      });
      
      const result = await bypassResponse.json();
      console.log('🎯 BYPASS ROUTING SUCCESS:', result.success);
      
      if (!bypassResponse.ok) {
        throw new Error(`Bypass routing failed: ${result.message || 'Unknown error'}`);
      }
    
      // Add consulting mode indicator to response
      const consultingResult = {
        ...result,
        consultingMode: true,
        implementationDetected: result.success ? true : false,
        routedThrough: 'agent-chat-bypass-system'
      };

      res.status(200).json(consultingResult);
      
    } catch (bypassError: any) {
      console.error('❌ BYPASS ROUTING ERROR:', bypassError);
      throw new Error(`Agent bypass routing failed: ${bypassError.message}`);
    }

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