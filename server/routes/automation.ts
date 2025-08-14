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
      const existingOnboarding = await storage.getOnboardingData(userId);
      
      if (!existingOnboarding) {
        await storage.saveOnboardingData({
          userId,
          currentStep: plan === 'ai-pack' ? 4 : 2,
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

  // Update subscription automation (FIXED: Works both with auth and email)
  app.post('/api/automation/update-subscription', async (req: any, res) => {
    try {
      const { plan, email, userId } = req.body;
      
      let targetUserId = userId;
      
      // If no userId provided, try to get from authentication
      if (!targetUserId && req.isAuthenticated()) {
        targetUserId = (req.user as any)?.claims?.sub;
      }
      
      // If still no userId, try to find user by email
      if (!targetUserId && email) {
        const user = await storage.getUserByEmail(email);
        if (user) {
          targetUserId = user.id;
        }
      }
      
      if (!targetUserId) {
        return res.status(400).json({ 
          message: 'User identification required. Provide userId, email, or authenticate.' 
        });
      }

      // Use the new upgrade method
      await storage.upgradeUserToPremium(targetUserId, plan);

      res.json({ 
        message: 'User upgraded successfully',
        userId: targetUserId,
        plan: plan
      });
    } catch (error) {
      console.error('Subscription update error:', error);
      res.status(500).json({ message: 'Failed to update subscription' });
    }
  });

  // NEW: Direct user upgrade endpoint for post-payment processing
  app.post('/api/upgrade-user', async (req: any, res) => {
    try {
      const { email, plan } = req.body;
      
      if (!email || !plan) {
        return res.status(400).json({ 
          message: 'Email and plan are required' 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found with this email' 
        });
      }

      // Upgrade user to premium
      const upgradedUser = await storage.upgradeUserToPremium(user.id, plan);

      res.json({ 
        message: 'User upgraded successfully',
        userId: user.id,
        email: user.email,
        plan: plan,
        upgradeDetails: {
          previousPlan: user.plan,
          newPlan: upgradedUser.plan,
          monthlyLimit: upgradedUser.monthlyGenerationLimit,
          mayaAccess: upgradedUser.mayaAiAccess,
          victoriaAccess: upgradedUser.victoriaAiAccess
        }
      });
    } catch (error) {
      console.error('User upgrade error:', error);
      res.status(500).json({ message: 'Failed to upgrade user' });
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
      const selfieUploads = await storage.getSelfieUploads(userId);
      if (selfieUploads.length === 0) {
        return res.status(400).json({ message: 'Please upload selfies first' });
      }

      // Create AI image records for bulk processing
      const aiImagePromises = prompts.map(async (prompt: string) => {
        return storage.saveAIImage({
          userId,
          prompt,
          imageUrl: '', // Will be updated when processing completes
          generationStatus: 'pending',
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
  // Email templates based on plan - Sandra's warm bestfriend voice
  const templates = {
    'free': {
      subject: 'Hey gorgeous! Welcome to SSELFIE 💫',
      body: `
        Hey ${user.firstName || 'gorgeous'}!

        So you actually signed up! I'm honestly so excited for you.

        Listen, you just took the first step toward building something incredible. And I'm here to help you every single step of the way.

        Your next move? Let's get those selfies uploaded so Maya (my AI photographer) can work her magic. Trust me, you're going to love what she creates for you.

        Ready to see what you're capable of?

        👉 Let's do this: ${process.env.BASE_URL || 'https://sselfie.ai'}/workspace

        Text me back if you need anything. Seriously.

        Your new best friend who happens to be really good with AI,
        Sandra

        P.S. I believe in you. Like, really believe in you.
      `
    },
    'studio': {
      subject: 'You amazing human! Welcome to SSELFIE Studio 🚀',
      body: `
        Hey ${user.firstName || 'you amazing human'}!

        Seriously, you just made one of the best decisions ever. 

        SSELFIE Studio isn't just a platform. It's your complete business-in-a-box. And I'm genuinely excited to watch you build something incredible.

        Here's what happens next:
        • Upload your selfies (Maya is waiting for you!)
        • Let Victoria help you build your brand
        • Create your landing page
        • Launch your business

        But honestly? Don't overthink it. Just start with Maya. She'll guide you through everything.

        👉 Your workspace is ready: ${process.env.BASE_URL || 'https://sselfie.ai'}/workspace

        I'm literally cheering you on from Iceland. Let's build something that makes people stop scrolling.

        Your biggest fan,
        Sandra 💫

        P.S. If you get stuck on anything, just reply to this email. I read every single one.
      `
    },
    'studio-pro': {
      subject: 'Holy sh*t, you went all in! Welcome to Studio Pro 💎',
      body: `
        Hey ${user.firstName || 'superstar'}!

        I am SO proud of you right now. You didn't just buy something. You invested in yourself in the biggest way possible.

        Studio Pro means you get EVERYTHING:
        • All of SSELFIE Studio
        • Personal setup call with my team
        • Priority everything
        • Direct line to me when you need it

        But here's the thing... you already have everything you need to succeed. This just makes it faster and easier.

        👉 Start here: ${process.env.BASE_URL || 'https://sselfie.ai'}/workspace
        👉 Book your VIP call: ${process.env.BASE_URL || 'https://sselfie.ai'}/vip-call

        I can't wait to personally help you build something that changes everything.

        Your success is my success,
        Sandra

        P.S. You're about to surprise yourself with what you're capable of. I've seen it happen hundreds of times.
      `
    }
  };

  const template = templates[plan as keyof typeof templates] || templates['free'];
  
  // In production, integrate with email service (SendGrid, Mailchimp, etc.)
  console.log(`Sending email to ${user.email}:`);
  console.log(`Subject: ${template.subject}`);
  console.log(`Body: ${template.body}`);
  
  // Log automation event
  console.log(`Welcome email automation completed for user ${user.id}, plan ${plan}`);
}