import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";

export function registerAutomationRoutes(app: Express) {
  // Welcome email automation
  app.post('/api/automation/welcome-email', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = (req.user as any)?.claims?.sub;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await sendWelcomeEmail(user, plan);
      res.json({ message: 'Welcome email sent successfully' });
    } catch (error) {
      console.error('Welcome email error:', error);
      res.status(500).json({ message: 'Failed to send welcome email' });
    }
  });

  // Setup onboarding automation
  app.post('/api/automation/setup-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      // Check if onboarding data already exists
      const existingOnboarding = await storage.getUserOnboardingData(userId);
      
      if (!existingOnboarding) {
        await storage.createOnboardingData({
          userId,
          currentStep: plan === 'ai-pack' ? 'selfie-upload' : 'brand-questionnaire',
          brandVibe: '',
          targetClient: '',
          businessGoal: '',
          completedSteps: [],
        });
      }

      res.json({ message: 'Onboarding setup completed' });
    } catch (error) {
      console.error('Onboarding setup error:', error);
      res.status(500).json({ message: 'Failed to setup onboarding' });
    }
  });

  // Update subscription automation
  app.post('/api/automation/update-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      // Check if subscription already exists
      const existingSubscription = await storage.getUserSubscription(userId);
      
      if (!existingSubscription) {
        await storage.createSubscription({
          userId,
          plan,
          status: 'active',
        });
      } else {
        await storage.updateSubscription(existingSubscription.id, {
          plan,
          status: 'active',
        });
      }

      res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
      console.error('Subscription update error:', error);
      res.status(500).json({ message: 'Failed to update subscription' });
    }
  });

  // Email sequence automation (for future implementation)
  app.post('/api/automation/email-sequence', isAuthenticated, async (req: any, res) => {
    try {
      const { sequenceType, step } = req.body;
      const userId = (req.user as any)?.claims?.sub;
      
      // In production, integrate with email automation service
      // For now, just log the automation trigger
      console.log(`Email sequence triggered: ${sequenceType}, step ${step} for user ${userId}`);
      
      res.json({ message: 'Email sequence triggered' });
    } catch (error) {
      console.error('Email sequence error:', error);
      res.status(500).json({ message: 'Failed to trigger email sequence' });
    }
  });

  // AI generation automation (for bulk processing)
  app.post('/api/automation/bulk-ai-generation', isAuthenticated, async (req: any, res) => {
    try {
      const { prompts } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!Array.isArray(prompts) || prompts.length === 0) {
        return res.status(400).json({ message: 'Prompts array is required' });
      }

      // Check if user has uploaded selfies
      const selfieUploads = await storage.getUserSelfieUploads(userId);
      if (selfieUploads.length === 0) {
        return res.status(400).json({ message: 'Please upload selfies first' });
      }

      // Create AI image records for bulk processing
      const aiImagePromises = prompts.map(async (prompt: string) => {
        return storage.createAiImage({
          userId,
          prompt,
          imageUrl: '', // Will be updated when processing completes
          status: 'pending',
        });
      });

      const aiImages = await Promise.all(aiImagePromises);

      // In production, queue these for background processing
      console.log(`Bulk AI generation queued: ${prompts.length} images for user ${userId}`);

      res.json({ 
        message: 'Bulk AI generation started',
        imageIds: aiImages.map(img => img.id)
      });
    } catch (error) {
      console.error('Bulk AI generation error:', error);
      res.status(500).json({ message: 'Failed to start bulk AI generation' });
    }
  });
}

async function sendWelcomeEmail(user: any, plan: string) {
  // Email templates based on plan
  const templates = {
    'ai-pack': {
      subject: '🎉 Welcome to SSELFIE AI Pack! Your transformation starts now',
      body: `
        Hi ${user.firstName || 'there'},
        
        Welcome to SSELFIE! You're about to transform your personal brand with AI.
        
        Your next step: Upload 5-15 selfies to generate 50 professional AI images.
        
        👉 Get started: ${process.env.BASE_URL}/ai-images
        
        Questions? Just reply to this email.
        
        Your authentic journey starts now,
        Sandra
      `
    },
    'studio': {
      subject: '🚀 Welcome to SSELFIE Studio! Let\'s build your business',
      body: `
        Hi ${user.firstName || 'there'},
        
        Welcome to SSELFIE Studio! You now have everything you need to build your business.
        
        Your next steps:
        1. Complete your brand onboarding
        2. Generate your AI images
        3. Build your landing page
        4. Launch your business
        
        👉 Start here: ${process.env.BASE_URL}/onboarding
        
        I'm here to support you every step of the way.
        
        Let's build something amazing,
        Sandra
      `
    },
    'studio-pro': {
      subject: '💎 Welcome to SSELFIE Studio Pro! Your 1:1 call awaits',
      body: `
        Hi ${user.firstName || 'there'},
        
        Welcome to SSELFIE Studio Pro! You've made the best investment in your business.
        
        Your VIP treatment includes:
        ✓ Everything in Studio
        ✓ Personal 1:1 setup call with my team
        ✓ Priority support
        
        👉 Book your call: ${process.env.BASE_URL}/onboarding
        
        I can't wait to personally help you succeed.
        
        Your success partner,
        Sandra
      `
    }
  };

  const template = templates[plan as keyof typeof templates] || templates['ai-pack'];
  
  // In production, integrate with email service (SendGrid, Mailchimp, etc.)
  console.log(`Sending email to ${user.email}:`);
  console.log(`Subject: ${template.subject}`);
  console.log(`Body: ${template.body}`);
  
  // Log automation event
  console.log(`Welcome email automation completed for user ${user.id}, plan ${plan}`);
}