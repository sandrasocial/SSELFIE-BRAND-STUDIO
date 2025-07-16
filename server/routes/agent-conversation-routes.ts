/**
 * AGENT CONVERSATION & APPROVAL ROUTES
 * Secure API for Sandra to chat with agents and approve their proposals
 */

import { Router } from 'express';
import { AgentApprovalSystem } from '../agents/agent-approval-system';

const router = Router();

/**
 * SECURE ADMIN CHECK
 * Only Sandra can access agent conversations and approvals
 */
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || req.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Access check failed' });
  }
};

/**
 * GET ALL PROPOSALS
 * Sandra can see all agent proposals and their status
 */
router.get('/agent/proposals', isAdmin, async (req, res) => {
  try {
    const proposals = await AgentApprovalSystem.getAllProposals();
    
    res.json({
      proposals,
      summary: {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'proposed' || p.status === 'in_discussion').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        implemented: proposals.filter(p => p.status === 'implemented').length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch proposals'
    });
  }
});

/**
 * GET SPECIFIC PROPOSAL
 * Sandra can view detailed proposal with conversation history
 */
router.get('/agent/proposals/:proposalId', isAdmin, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await AgentApprovalSystem.getProposal(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    // Generate fresh preview
    const preview = await AgentApprovalSystem.generatePreview(proposal);
    proposal.preview = preview;
    
    res.json(proposal);
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch proposal'
    });
  }
});

/**
 * CHAT WITH AGENT
 * Sandra can send messages to agents about their proposals
 */
router.post('/agent/proposals/:proposalId/chat', isAdmin, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Add Sandra's message
    const updatedProposal = await AgentApprovalSystem.addConversationMessage(
      proposalId,
      'sandra',
      message
    );
    
    // Generate agent response based on the message
    const agentResponse = await this.generateAgentResponse(updatedProposal, message);
    
    if (agentResponse) {
      await AgentApprovalSystem.addConversationMessage(
        proposalId,
        'agent',
        agentResponse
      );
    }
    
    const finalProposal = await AgentApprovalSystem.getProposal(proposalId);
    res.json(finalProposal);
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Chat failed'
    });
  }
});

/**
 * APPROVE PROPOSAL
 * Sandra can approve agent proposals for implementation
 */
router.post('/agent/proposals/:proposalId/approve', isAdmin, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { message } = req.body;
    
    await AgentApprovalSystem.approveProposal(proposalId, message);
    
    res.json({
      success: true,
      message: 'Proposal approved and queued for implementation'
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Approval failed'
    });
  }
});

/**
 * REJECT PROPOSAL
 * Sandra can reject agent proposals with feedback
 */
router.post('/agent/proposals/:proposalId/reject', isAdmin, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }
    
    await AgentApprovalSystem.rejectProposal(proposalId, reason);
    
    res.json({
      success: true,
      message: 'Proposal rejected with feedback'
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Rejection failed'
    });
  }
});

/**
 * CREATE NEW PROPOSAL
 * Agents can create proposals (called by agent system)
 */
router.post('/agent/proposals', isAdmin, async (req, res) => {
  try {
    const { agentId, agentName, proposalData } = req.body;
    
    if (!agentId || !proposalData) {
      return res.status(400).json({ error: 'Agent ID and proposal data required' });
    }
    
    const proposal = await AgentApprovalSystem.createProposal(agentId, agentName, proposalData);
    
    res.json({
      success: true,
      proposal,
      message: `New proposal created by ${agentName}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Proposal creation failed'
    });
  }
});

/**
 * AGENT RESPONSE GENERATION
 * Generate contextual responses based on Sandra's messages
 */
async function generateAgentResponse(proposal: any, sandraMessage: string): Promise<string | null> {
  const lowerMessage = sandraMessage.toLowerCase();
  
  // Agent personality responses
  const personality = await AgentApprovalSystem.getAgentPersonality(proposal.agentId);
  
  if (lowerMessage.includes('question') || lowerMessage.includes('?')) {
    return `${personality} Great question! Let me clarify:\n\n${proposal.description}\n\nThe main benefits are:\n• ${proposal.impact}\n\nIs there a specific part you'd like me to explain more?`;
  }
  
  if (lowerMessage.includes('change') || lowerMessage.includes('modify')) {
    return `${personality} Absolutely! I can adjust this proposal. What specific changes would you like me to make? I want to make sure it's exactly what you need.`;
  }
  
  if (lowerMessage.includes('ready') || lowerMessage.includes('approve')) {
    return `${personality} Perfect! I'm so excited to implement this for you. Once you approve, I'll get this live right away. Thank you for trusting me with your business! ✨`;
  }
  
  if (lowerMessage.includes('no') || lowerMessage.includes('reject')) {
    return `${personality} No worries at all! I understand this isn't quite right. Thanks for the feedback - it helps me learn what works best for your business. I'll do better next time!`;
  }
  
  if (lowerMessage.includes('preview') || lowerMessage.includes('show')) {
    return `${personality} Here's exactly how this will look when implemented. I've created a detailed preview showing the before/after. Take your time reviewing it!`;
  }
  
  // Default response
  return `${personality} Thanks for the feedback! I'm here to answer any questions you have about this proposal. What would you like to know more about?`;
}

export default router;