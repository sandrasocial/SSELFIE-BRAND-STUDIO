/**
 * PHASE 5: Support Escalation Routes
 * Handles escalation requests from Maya Support chat
 */

import { Router } from 'express';
import { requireAuth } from "../auth";
import { escalationHandler } from '../services/escalation-handler';

const router = Router();

// PHASE 5: Handle escalation requests from support chat
router.post('/escalate', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    const userEmail = (req.user as any)?.claims?.email;
    const userName = `${(req.user as any)?.claims?.first_name || ''} ${(req.user as any)?.claims?.last_name || ''}`.trim();
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reason, conversationHistory, urgency = 'normal' } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Escalation reason required' });
    }

    console.log(`🚨 PHASE 5: Escalation request from ${userEmail} - Reason: ${reason}`);

    // Process escalation
    const escalationRequest = {
      userId,
      userEmail,
      userName: userName || userEmail,
      reason,
      conversationHistory: conversationHistory || [],
      userContext: `User: ${userName} (${userEmail})\nPlan: Premium\nRequest: ${reason}`
    };

    const success = await escalationHandler.handleEscalation(escalationRequest);

    if (success) {
      console.log(`✅ PHASE 5: Escalation processed successfully for ${userEmail}`);
      
      res.json({
        success: true,
        message: 'Escalation request processed successfully',
        escalationId: `ESC_${Date.now()}`,
        expectedResponse: '24 hours'
      });
    } else {
      console.error(`❌ PHASE 5: Escalation failed for ${userEmail}`);
      
      res.status(500).json({
        error: 'Failed to process escalation request',
        message: 'Please try again or contact support directly'
      });
    }

  } catch (error) {
    console.error('❌ PHASE 5: Escalation route error:', error);
    res.status(500).json({
      error: 'Internal server error during escalation',
      message: 'Please try again later'
    });
  }
});

export default router;