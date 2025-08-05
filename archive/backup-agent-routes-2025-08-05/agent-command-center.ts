import type { Express } from 'express';
import { isAuthenticated } from '../replitAuth';
import { AgentProposalGenerator } from '../agents/agent-proposal-generator';

export function registerAgentCommandRoutes(app: Express) {
  
  // Create proposal for email campaign
  app.post('/api/agents/create-email-proposal', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const context = req.body;
      const proposal = await AgentProposalGenerator.generateEmailCampaignProposal(context);
      
      // Submit to approval system
      const response = await fetch(`${req.protocol}://${req.hostname}/api/agent-proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      
      res.json({ success: true, proposal });
    } catch (error) {
      console.error('Error creating email proposal:', error);
      res.status(500).json({ error: 'Failed to create email proposal' });
    }
  });

  // Create proposal for landing page
  app.post('/api/agents/create-landing-proposal', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const context = req.body;
      const proposal = await AgentProposalGenerator.generateLandingPageProposal(context);
      
      // Submit to approval system
      const response = await fetch(`${req.protocol}://${req.hostname}/api/agent-proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      
      res.json({ success: true, proposal });
    } catch (error) {
      console.error('Error creating landing proposal:', error);
      res.status(500).json({ error: 'Failed to create landing proposal' });
    }
  });

  // Create proposal for social content
  app.post('/api/agents/create-social-proposal', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const context = req.body;
      const proposal = await AgentProposalGenerator.generateSocialContentProposal(context);
      
      // Submit to approval system
      const response = await fetch(`${req.protocol}://${req.hostname}/api/agent-proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      
      res.json({ success: true, proposal });
    } catch (error) {
      console.error('Error creating social proposal:', error);
      res.status(500).json({ error: 'Failed to create social proposal' });
    }
  });

  // Create proposal for ad campaign
  app.post('/api/agents/create-ad-proposal', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const context = req.body;
      const proposal = await AgentProposalGenerator.generateAdCampaignProposal(context);
      
      // Submit to approval system
      const response = await fetch(`${req.protocol}://${req.hostname}/api/agent-proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      
      res.json({ success: true, proposal });
    } catch (error) {
      console.error('Error creating ad proposal:', error);
      res.status(500).json({ error: 'Failed to create ad proposal' });
    }
  });

  // Bulk create multiple proposals
  app.post('/api/agents/create-launch-campaign', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { launchType, context } = req.body;
      const proposals = [];

      // Create email campaign proposal
      if (launchType === 'full-launch' || launchType === 'email-focus') {
        const emailProposal = await AgentProposalGenerator.generateEmailCampaignProposal({
          ...context,
          campaignName: context.productName || 'SSELFIE Studio Launch',
          priority: 'urgent'
        });
        proposals.push(emailProposal);
      }

      // Create landing page proposal
      if (launchType === 'full-launch' || launchType === 'conversion-focus') {
        const landingProposal = await AgentProposalGenerator.generateLandingPageProposal({
          ...context,
          pageName: context.productName || 'SSELFIE Studio',
          priority: 'high'
        });
        proposals.push(landingProposal);
      }

      // Create social content proposal
      if (launchType === 'full-launch' || launchType === 'organic-focus') {
        const socialProposal = await AgentProposalGenerator.generateSocialContentProposal({
          ...context,
          campaignName: context.productName || 'SSELFIE Studio Launch',
          priority: 'medium'
        });
        proposals.push(socialProposal);
      }

      // Create ad campaign proposal
      if (launchType === 'full-launch' || launchType === 'paid-focus') {
        const adProposal = await AgentProposalGenerator.generateAdCampaignProposal({
          ...context,
          campaignName: context.productName || 'SSELFIE Studio',
          priority: 'high'
        });
        proposals.push(adProposal);
      }

      // Submit all proposals to approval system
      const submissionPromises = proposals.map(proposal => 
        fetch(`${req.protocol}://${req.hostname}/api/agent-proposals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposal)
        })
      );

      await Promise.all(submissionPromises);

      res.json({ 
        success: true, 
        message: `Created ${proposals.length} proposals for ${launchType}`,
        proposals: proposals.map(p => ({ id: p.id, title: p.title, agent: p.agentName }))
      });
    } catch (error) {
      console.error('Error creating launch campaign:', error);
      res.status(500).json({ error: 'Failed to create launch campaign' });
    }
  });
}