/**
 * INTERVENTION CAMPAIGN EXECUTION
 * Immediate action routes for user activation
 */

import express from 'express';
import { EmailInterventionCampaign } from '../../services/email-intervention-campaign.js';

const router = express.Router();

// Get campaign overview and statistics  
router.get('/campaign-summary', async (req, res) => {
  try {
    const summary = EmailInterventionCampaign.getCampaignSummary();
    res.json({
      success: true,
      summary,
      readyToExecute: true,
      estimatedImpact: {
        potentialRevenueRecovery: summary.totalUsers * 97, // Average monthly value
        currentConversionRate: '11.1%',
        targetConversionRate: '45%',
        potentialImprovement: '300%+'
      }
    });
  } catch (error) {
    console.error('❌ Campaign summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate campaign summary'
    });
  }
});

// Preview all personalized emails
router.get('/preview-emails', async (req, res) => {
  try {
    const campaigns = EmailInterventionCampaign.generatePersonalizedCampaign();
    res.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        userId: campaign.userId,
        email: campaign.email,
        name: campaign.name,
        subject: campaign.subject,
        urgency: campaign.urgency,
        daysSinceSignup: campaign.daysSinceSignup,
        planName: campaign.planName,
        htmlPreview: campaign.template.length + ' characters'
      })),
      totalEmails: campaigns.length
    });
  } catch (error) {
    console.error('❌ Email preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate email previews'
    });
  }
});

// Get specific user email content  
router.get('/email/:userId', async (req, res) => {
  try {
    const campaigns = EmailInterventionCampaign.generatePersonalizedCampaign();
    const campaign = campaigns.find(c => c.userId === req.params.userId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'User campaign not found'
      });
    }
    
    res.json({
      success: true,
      campaign: {
        userId: campaign.userId,
        email: campaign.email,
        name: campaign.name,
        subject: campaign.subject,
        htmlContent: campaign.template,
        urgency: campaign.urgency,
        daysSinceSignup: campaign.daysSinceSignup
      }
    });
  } catch (error) {
    console.error('❌ Individual email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate individual email'
    });
  }
});

// Manual execution endpoint (for email service integration)
router.post('/execute', async (req, res) => {
  try {
    const campaigns = EmailInterventionCampaign.generatePersonalizedCampaign();
    
    // Log execution (in production, this would integrate with actual email service)
    console.log('📧 INTERVENTION CAMPAIGN EXECUTION:');
    campaigns.forEach(campaign => {
      console.log(`  → ${campaign.email} (${campaign.name}) - ${campaign.urgency} urgency - ${campaign.daysSinceSignup}d`);
    });
    
    res.json({
      success: true,
      message: 'Campaign execution logged - ready for email service integration',
      campaigns: campaigns.length,
      breakdown: {
        high: campaigns.filter(c => c.urgency === 'high').length,
        medium: campaigns.filter(c => c.urgency === 'medium').length, 
        low: campaigns.filter(c => c.urgency === 'low').length
      },
      nextSteps: [
        'Integrate with SendGrid/Resend email service',
        'Set up response tracking',
        'Schedule follow-up campaigns',
        'Monitor activation rates'
      ]
    });
  } catch (error) {
    console.error('❌ Campaign execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute campaign'
    });
  }
});

export default router;