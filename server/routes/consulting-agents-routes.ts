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

    // Forward to implementation-aware agent-chat-bypass endpoint
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': 'sandra-admin-2025',
        'Authorization': req.headers.authorization || 'Bearer sandra-admin-2025'
      },
      body: JSON.stringify(enhancedRequest)
    });

    const result = await response.json();
    
    // Add consulting mode indicator to response
    const consultingResult = {
      ...result,
      consultingMode: true,
      implementationDetected: result.agentId ? true : false,
      routedThrough: 'implementation-aware-system'
    };

    res.status(response.status).json(consultingResult);

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