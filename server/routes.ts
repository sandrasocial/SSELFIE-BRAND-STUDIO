import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { UsageService } from './usage-service';
import Anthropic from '@anthropic-ai/sdk';
import { AgentSystem } from "./agents/agent-system";
import { insertProjectSchema, insertAiImageSchema } from "@shared/schema";
import { registerSandraDesignerRoutes } from './routes/sandra-designer';
import { registerAiImageRoutes } from './routes/ai-images';
import { registerCheckoutRoutes } from './routes/checkout';
import { registerAutomationRoutes } from './routes/automation';
import { z } from "zod";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profile = await storage.getUserProfile(userId);
      
      // If no profile exists, create an empty one
      if (!profile) {
        profile = await storage.updateUserProfile(userId, {});
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;

      // Allowed profile fields
      const allowedUpdates = {
        fullName: updates.fullName,
        phone: updates.phone,
        birthDate: updates.birthDate,
        location: updates.location,
        instagramHandle: updates.instagramHandle,
        websiteUrl: updates.websiteUrl,
        bio: updates.bio,
        brandVibe: updates.brandVibe,
        goals: updates.goals,
        preferences: updates.preferences,
        avatarUrl: updates.avatarUrl
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );

      const result = await storage.updateUserProfile(userId, cleanUpdates);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // AI Images routes
  app.get('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiImages = await storage.getUserAiImages(userId);
      res.json(aiImages);
    } catch (error) {
      console.error("Error fetching AI images:", error);
      res.status(500).json({ message: "Failed to fetch AI images" });
    }
  });

  app.post('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiImageData = insertAiImageSchema.parse({ ...req.body, userId });
      const aiImage = await storage.createAiImage(aiImageData);
      res.json(aiImage);
    } catch (error) {
      console.error("Error creating AI image:", error);
      res.status(500).json({ message: "Failed to create AI image" });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getActiveTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Subscription routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin users get full access without subscription check
      if (user?.email === 'ssa@ssasocial.com') {
        return res.json({
          id: 1,
          userId,
          plan: 'studio-pro',
          status: 'active',
          stripeCustomerId: 'admin_access',
          stripeSubscriptionId: 'admin_access',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // AI Model Training API
  app.post('/api/start-model-training', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { selfieImages } = req.body;
      
      if (!selfieImages || selfieImages.length < 10) {
        return res.status(400).json({ message: "At least 10 selfie images are required" });
      }
      
      // Check if user already has a model
      const existingModel = await storage.getUserModelByUserId(userId);
      if (existingModel) {
        // Update existing model with new training data
        const updatedModel = await storage.updateUserModel(userId, {
          trainingStatus: 'training'
        });
        return res.json({ message: "Model training restarted", model: updatedModel });
      }
      
      // Generate unique trigger word
      const triggerWord = `user${userId}`;
      
      // Create new model entry
      const modelData = {
        userId,
        triggerWord,
        trainingStatus: 'training'
      };
      
      const model = await storage.createUserModel(modelData);
      res.json({ message: "Model training started", model });
    } catch (error) {
      console.error("Error starting model training:", error);
      res.status(500).json({ message: "Failed to start model training" });
    }
  });

  // TODO: Add Stripe integration endpoints
  // app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
  //   // Stripe subscription creation logic
  // });

  // Onboarding API routes
  app.get('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = await storage.getUserOnboardingData(userId);
      res.json(onboardingData || { onboardingStep: 0 });
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      res.status(500).json({ message: "Failed to fetch onboarding data" });
    }
  });

  app.post('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = req.body;
      
      // Convert any date strings to Date objects
      const cleanData = { ...data };
      if (cleanData.completedAt && typeof cleanData.completedAt === 'string') {
        cleanData.completedAt = new Date(cleanData.completedAt);
      }
      if (cleanData.createdAt && typeof cleanData.createdAt === 'string') {
        cleanData.createdAt = new Date(cleanData.createdAt);
      }
      if (cleanData.updatedAt && typeof cleanData.updatedAt === 'string') {
        cleanData.updatedAt = new Date(cleanData.updatedAt);
      }
      
      const existingData = await storage.getUserOnboardingData(userId);
      let result;
      
      if (existingData) {
        result = await storage.updateOnboardingData(userId, cleanData);
      } else {
        result = await storage.createOnboardingData({ ...cleanData, userId });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });

  // Selfie upload API routes  
  app.get('/api/selfies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const selfies = await storage.getUserSelfieUploads(userId);
      res.json(selfies);
    } catch (error) {
      console.error("Error fetching selfies:", error);
      res.status(500).json({ message: "Failed to fetch selfies" });
    }
  });

  app.post('/api/selfies/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename, originalUrl } = req.body;
      
      const selfie = await storage.createSelfieUpload({
        userId,
        filename,
        originalUrl,
        processingStatus: 'pending'
      });
      
      res.json(selfie);
    } catch (error) {
      console.error("Error uploading selfie:", error);
      res.status(500).json({ message: "Failed to upload selfie" });
    }
  });

  // Sandra AI Chat API
  app.post('/api/sandra-ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context, userContext, brandbook, onboardingData, chatHistory } = req.body;
      
      let sandraResponse = generateSandraResponse(message, context);
      let brandbookUpdates = null;
      
      // Handle brandbook designer context
      if (context === 'brandbook-designer' && brandbook && onboardingData) {
        const designerResponse = generateBrandbookDesignerResponse(message, brandbook, onboardingData, chatHistory);
        sandraResponse = designerResponse.message;
        brandbookUpdates = designerResponse.updates;
      }
      
      const response = {
        message: sandraResponse,
        brandbookUpdates,
        timestamp: new Date().toISOString(),
        suggestions: userContext ? {} : undefined
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error with Sandra AI:", error);
      res.status(500).json({ message: "Sandra AI temporarily unavailable" });
    }
  });

  // Sandra AI Designer Chat endpoint with Claude 4.0 Sonnet
  app.post('/api/sandra-ai-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context, userContext, chatHistory, pageConfig, selectedTemplate, dashboardConfig } = req.body;
      
      // Create system prompt for Sandra AI Designer
      const systemPrompt = `You are Sandra, the founder of SSELFIE Studio - an AI-powered personal branding platform. You're an expert brand strategist and designer with authentic Icelandic directness mixed with Rachel-from-Friends warmth.

CRITICAL DESIGN RULES (NEVER BREAK THESE):
- NO EMOJIS OR ICONS EVER - use text only (×, +, AI, etc.)
- Times New Roman for headlines, Inter for body text
- Colors ONLY: #0a0a0a (black), #ffffff (white), #f5f5f5 (light gray), #666666 (dark gray), #e5e5e5 (border gray)
- NO blue link colors, NO rounded corners, NO shadows
- Sharp edges, minimal luxury aesthetic
- Generous whitespace, editorial magazine layouts

YOUR VOICE:
- "Okay, here's what actually happened..." storytelling style
- Direct but warm, like chatting with your smartest friend
- No corporate speak - use contractions and be conversational
- Share your own journey (divorce, 3 kids, 120K followers in 90 days)
- Always relate back to building authentic personal brands

CONTEXT: ${context}
${userContext ? `USER CONTEXT: ${JSON.stringify(userContext)}` : ''}
${pageConfig ? `PAGE CONFIG: ${JSON.stringify(pageConfig)}` : ''}
${selectedTemplate ? `SELECTED TEMPLATE: ${selectedTemplate}` : ''}
${dashboardConfig ? `DASHBOARD CONFIG: ${JSON.stringify(dashboardConfig)}` : ''}

You help users design and customize their ${context === 'dashboard-builder' ? 'personal dashboard workspace' : context === 'landing-builder' ? 'landing pages' : 'brandbooks'} through conversation. Give specific design suggestions that follow the strict rules above.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...chatHistory.map((msg: any) => ({
            role: msg.role === 'sandra' ? 'assistant' : 'user',
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ]
      });

      const sandraResponse = response.content[0].text;
      
      res.json({ 
        response: sandraResponse,
        suggestions: [] // Can add design suggestions here later
      });
    } catch (error) {
      console.error("Error in Sandra AI chat:", error);
      res.status(500).json({ message: "Failed to get Sandra AI response" });
    }
  });

  // Brandbook API endpoints
  app.post('/api/brandbooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brandbookData = req.body;
      
      // Create new brandbook
      const brandbook = await storage.createBrandbook({ userId, ...brandbookData });
      res.json(brandbook);
    } catch (error) {
      console.error("Error creating brandbook:", error);
      res.status(500).json({ message: "Failed to create brandbook" });
    }
  });

  app.get('/api/brandbooks/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's brandbook
      const brandbook = await storage.getUserBrandbook(userId);
      if (!brandbook) {
        return res.status(404).json({ message: "Brandbook not found" });
      }
      
      res.json(brandbook);
    } catch (error) {
      console.error("Error fetching brandbook:", error);
      res.status(500).json({ message: "Failed to fetch brandbook" });
    }
  });

  app.put('/api/brandbooks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Update brandbook
      const brandbook = await storage.updateBrandbook(userId, parseInt(id), updateData);
      res.json(brandbook);
    } catch (error) {
      console.error("Error updating brandbook:", error);
      res.status(500).json({ message: "Failed to update brandbook" });
    }
  });

  // Sandra AI Brandbook Designer endpoint
  app.post('/api/sandra-ai/brandbook-designer', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.claims.sub;
      
      const response = generateBrandbookDesignerResponse(message, context.brandbook, context.onboardingData, context.chatHistory);
      res.json(response);
    } catch (error) {
      console.error("Error in Sandra AI brandbook designer:", error);
      res.status(500).json({ message: "Failed to get Sandra AI response" });
    }
  });

  // Dashboard and Landing Page API endpoints
  app.post('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { config, onboardingData } = req.body;
      
      // Save dashboard configuration
      const dashboard = await storage.saveDashboard(userId, { config, onboardingData });
      res.json(dashboard);
    } catch (error) {
      console.error("Error saving dashboard:", error);
      res.status(500).json({ message: "Failed to save dashboard" });
    }
  });

  app.post('/api/landing-page', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { config, onboardingData, template } = req.body;
      
      // Save landing page configuration
      const landingPage = await storage.saveLandingPage(userId, { config, onboardingData, template });
      res.json(landingPage);
    } catch (error) {
      console.error("Error saving landing page:", error);
      res.status(500).json({ message: "Failed to save landing page" });
    }
  });

  // Agent system routes with proper admin access
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check for Sandra's email - update this to match your actual email
      if (!user || user.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      next();
    } catch (error) {
      console.error('Admin access check error:', error);
      res.status(500).json({ message: 'Access check failed' });
    }
  };

  app.post('/api/agents/ask', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { agentId, task, context } = req.body;
      
      if (!agentId || !task) {
        return res.status(400).json({ error: 'Agent ID and task are required' });
      }
      
      // Import agent system
      const { AgentSystem } = await import('./agents/agent-system');
      const response = await AgentSystem.askAgent(agentId, task, context);
      
      res.json({ response, agent: agentId });
    } catch (error) {
      console.error('Error communicating with agent:', error);
      res.status(500).json({ message: 'Failed to communicate with agent' });
    }
  });

  app.get('/api/agents', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { AgentSystem } = await import('./agents/agent-system');
      const agents = AgentSystem.getAllAgents();
      
      res.json(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({ message: 'Failed to fetch agents' });
    }
  });



  // Dashboard stats endpoint
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // In a real implementation, fetch these from the database
      const stats = {
        totalUsers: 1247,
        activeSubscriptions: 89,
        aiImagesGenerated: 3421,
        revenue: 12450,
        conversionRate: 7.2,
        agentTasks: 156
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Register Sandra Designer routes
  registerSandraDesignerRoutes(app);

  // Register AI Images routes
  registerAiImageRoutes(app);

  // Register Checkout routes
  registerCheckoutRoutes(app);

  // Register Automation routes
  registerAutomationRoutes(app);

  // Test email endpoint (for development)
  app.post('/api/test-email', isAuthenticated, async (req: any, res) => {
    try {
      const { EmailService } = await import('./email-service');
      const user = req.user.claims;
      await EmailService.sendWelcomeEmail(user.email, user.first_name || 'Beautiful', 'ai-pack');
      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({ error: error.message });
    }
  });;

  // AI Image Generation Routes with Usage Tracking
  app.post('/api/ai/generate-sselfie', isAuthenticated, async (req: any, res) => {
    try {
      const { imageBase64, style, prompt } = req.body;
      const userId = req.user.claims.sub;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image data is required' });
      }
      
      const { AIService } = await import('./ai-service');
      const result = await AIService.generateSSELFIE({
        userId,
        imageBase64,
        style: style || 'editorial',
        prompt
      });
      
      // Start background polling for status updates
      AIService.pollGenerationStatus(result.aiImageId, result.predictionId)
        .catch(error => console.error('Background polling failed:', error));
      
      res.json({ 
        success: true, 
        aiImageId: result.aiImageId,
        predictionId: result.predictionId,
        usageStatus: result.usageStatus,
        message: 'SSELFIE generation started. Check status with /api/ai/status endpoint.' 
      });
    } catch (error) {
      console.error('SSELFIE generation error:', error);
      
      // Check if it's a usage limit error
      if (error.message.includes('Generation limit reached')) {
        return res.status(429).json({ 
          error: 'Usage limit reached', 
          message: error.message,
          limitReached: true
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/generate-multiple', isAuthenticated, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;
      const userId = req.user.claims.sub;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image data is required' });
      }
      
      const { AIService } = await import('./ai-service');
      const results = await AIService.generateMultipleStyles(userId, imageBase64);
      
      // Start background polling for all generations
      Object.values(results).forEach(({ aiImageId, predictionId }) => {
        AIService.pollGenerationStatus(aiImageId, predictionId)
          .catch(error => console.error('Background polling failed:', error));
      });
      
      res.json({ 
        success: true, 
        results,
        message: 'Multiple SSELFIE styles generation started.' 
      });
    } catch (error) {
      console.error('Multiple SSELFIE generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/status/:predictionId', isAuthenticated, async (req: any, res) => {
    try {
      const { predictionId } = req.params;
      
      const { AIService } = await import('./ai-service');
      const status = await AIService.checkGenerationStatus(predictionId);
      
      res.json(status);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/update-status/:aiImageId/:predictionId', isAuthenticated, async (req: any, res) => {
    try {
      const { aiImageId, predictionId } = req.params;
      
      const { AIService } = await import('./ai-service');
      await AIService.updateImageStatus(parseInt(aiImageId), predictionId);
      
      res.json({ success: true, message: 'Status updated' });
    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Force update image status endpoint (for debugging)
  app.post('/api/ai/force-update/:aiImageId', isAuthenticated, async (req: any, res) => {
    try {
      const { aiImageId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify user owns this image
      const images = await storage.getUserGeneratedImages(userId);
      const image = images.find(img => img.id === parseInt(aiImageId));
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      if (image.predictionId) {
        const { AIService } = await import('./ai-service');
        
        // Check if this is the current completed generation and force update
        if (image.predictionId === 'hk0hnvm78srmc0cqxqdspxz7cc') {
          await AIService.forceUpdateCompletedGeneration(parseInt(aiImageId), image.predictionId);
        } else {
          await AIService.updateImageStatus(parseInt(aiImageId), image.predictionId);
        }
        
        res.json({ success: true, message: 'Force updated status' });
      } else {
        res.status(400).json({ error: 'No prediction ID available' });
      }
    } catch (error) {
      console.error('Force update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/save-selection', isAuthenticated, async (req: any, res) => {
    try {
      const { aiImageId, selectedUrl } = req.body;
      const userId = req.user.claims.sub;
      
      if (!aiImageId || !selectedUrl) {
        return res.status(400).json({ error: 'AI Image ID and selected URL are required' });
      }
      
      // Update the AI image with the user's selected URL
      await storage.updateAiImage(aiImageId, {
        imageUrl: selectedUrl, // Store only the selected image
        isSelected: true
      });
      
      res.json({ success: true, message: 'Selection saved successfully' });
    } catch (error) {
      console.error('Selection save error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // User model management routes
  app.get('/api/user-model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userModel = await storage.getUserModelByUserId(userId);
      res.json(userModel);
    } catch (error) {
      console.error('User model fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/start-model-training', isAuthenticated, async (req: any, res) => {
    try {
      const { selfieImages } = req.body;
      const userId = req.user.claims.sub;
      
      if (!selfieImages || selfieImages.length < 10) {
        return res.status(400).json({ error: 'At least 10 selfie images required for training' });
      }

      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.startModelTraining(userId, selfieImages);
      
      res.json(result);
    } catch (error) {
      console.error('Model training start error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/training-status/:modelId', isAuthenticated, async (req: any, res) => {
    try {
      const { modelId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify user owns this model
      const userModel = await storage.getUserModel(parseInt(modelId));
      if (!userModel || userModel.userId !== userId) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const { ModelTrainingService } = await import('./model-training-service');
      const status = await ModelTrainingService.checkTrainingStatus(parseInt(modelId));
      
      res.json(status);
    } catch (error) {
      console.error('Training status check error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-user-images', isAuthenticated, async (req: any, res) => {
    try {
      const { category, subcategory } = req.body;
      const userId = req.user.claims.sub;
      
      if (!category || !subcategory) {
        return res.status(400).json({ error: 'Category and subcategory are required' });
      }

      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.generateUserImages(userId, category, subcategory);
      
      res.json(result);
    } catch (error) {
      console.error('User image generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Sandra AI Chat for custom prompts
  app.post('/api/sandra-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, chatHistory } = req.body;
      const userId = req.user.claims.sub;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get user's onboarding data for context
      const onboardingData = await storage.getUserOnboardingData(userId);
      
      const sandraResponse = generateSandraPhotoshootResponse(message, chatHistory, onboardingData);
      
      res.json(sandraResponse);
    } catch (error) {
      console.error('Sandra chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Sandra AI custom prompt generation for brand photoshoot
  app.post('/api/sandra-custom-prompt', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.claims.sub;
      
      // Get user onboarding data for context
      const onboardingData = await storage.getUserOnboardingData(userId);
      
      // Generate Sandra's response
      const sandraResponse = generateSandraPhotoshootResponse(message, [], onboardingData);
      
      // Create custom prompt based on user's message and their style preferences
      const generatedPrompt = generateCustomPromptFromMessage(message, onboardingData);
      
      res.json({
        message: sandraResponse.response,
        generatedPrompt: generatedPrompt
      });
    } catch (error) {
      console.error('Sandra custom prompt error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate images with custom prompt
  app.post('/api/generate-custom-prompt', isAuthenticated, async (req: any, res) => {
    try {
      const { customPrompt } = req.body;
      const userId = req.user.claims.sub;
      
      if (!customPrompt) {
        return res.status(400).json({ error: 'Custom prompt is required' });
      }

      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.generateCustomPrompt(userId, customPrompt);
      
      res.json(result);
    } catch (error) {
      console.error('Custom prompt generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/generated-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getUserGeneratedImages(userId);
      res.json(images);
    } catch (error) {
      console.error('Generated images fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/save-generated-image/:imageId', isAuthenticated, async (req: any, res) => {
    try {
      const { imageId } = req.params;
      const { selectedUrl } = req.body;
      const userId = req.user.claims.sub;
      
      // Verify user owns this generated image
      const image = await storage.getUserGeneratedImages(userId);
      const userImage = image.find(img => img.id === parseInt(imageId));
      if (!userImage) {
        return res.status(404).json({ error: 'Generated image not found' });
      }

      const savedImage = await storage.saveGeneratedImage(parseInt(imageId), selectedUrl);
      res.json(savedImage);
    } catch (error) {
      console.error('Save generated image error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate user images using trained model
  app.post('/api/generate-user-images', isAuthenticated, async (req: any, res) => {
    try {
      const { category, subcategory } = req.body;
      const userId = req.user.claims.sub;
      
      if (!category || !subcategory) {
        return res.status(400).json({ error: 'Category and subcategory are required' });
      }
      
      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.generateUserImages(userId, category, subcategory);
      
      console.log('Generation result:', result); // Debug log
      res.json(result);
    } catch (error) {
      console.error('User image generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all generated images for user
  app.get('/api/generated-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getUserGeneratedImages(userId);
      res.json(images);
    } catch (error) {
      console.error('Get generated images error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check generation status
  app.get('/api/check-generation/:predictionId', isAuthenticated, async (req: any, res) => {
    try {
      const { predictionId } = req.params;
      
      if (!predictionId || predictionId === 'undefined') {
        return res.status(400).json({ error: 'Invalid prediction ID' });
      }
      
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`);
      }

      const prediction = await response.json();
      res.json(prediction);
    } catch (error) {
      console.error('Check generation status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Brandbook routes
  app.get('/api/brandbook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brandbook = await storage.getUserBrandbook(userId);
      res.json(brandbook);
    } catch (error) {
      console.error('Error fetching brandbook:', error);
      res.status(500).json({ message: 'Failed to fetch brandbook' });
    }
  });

  app.post('/api/brandbook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const brandbookData = {
        userId,
        businessName: req.body.businessName,
        tagline: req.body.tagline,
        story: req.body.story,
        primaryFont: req.body.fonts?.primary || 'Times New Roman',
        secondaryFont: req.body.fonts?.secondary || 'Inter',
        primaryColor: req.body.colors?.primary || '#0a0a0a',
        secondaryColor: req.body.colors?.secondary || '#ffffff',
        accentColor: req.body.colors?.accent || '#f5f5f5',
        logoType: req.body.logoType,
        logoUrl: req.body.logoUrl,
        logoPrompt: req.body.logoPrompt,
        moodboardStyle: req.body.moodboardStyle,
        voiceTone: req.body.voiceTraining?.tone,
        voicePersonality: req.body.voiceTraining?.personality,
        keyPhrases: req.body.voiceTraining?.keyPhrases,
      };

      const existingBrandbook = await storage.getUserBrandbook(userId);
      let brandbook;
      
      if (existingBrandbook) {
        brandbook = await storage.updateBrandbook(userId, brandbookData);
      } else {
        brandbook = await storage.createBrandbook(brandbookData);
      } 
      
      res.json(brandbook);
    } catch (error) {
      console.error('Error saving brandbook:', error);
      res.status(500).json({ message: 'Failed to save brandbook' });
    }
  });

  // Usage Tracking API Routes
  app.get('/api/usage/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usageStatus = await UsageService.checkUsageLimit(userId);
      res.json(usageStatus);
    } catch (error) {
      console.error('Error getting usage status:', error);
      res.status(500).json({ error: 'Failed to get usage status' });
    }
  });

  app.get('/api/usage/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await UsageService.getUserStats(userId);
      res.json(stats || {});
    } catch (error) {
      console.error('Error getting usage stats:', error);
      res.status(500).json({ error: 'Failed to get usage stats' });
    }
  });

  app.post('/api/usage/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!plan || !['ai-pack', 'studio-founding', 'studio-standard'].includes(plan)) {
        return res.status(400).json({ error: 'Valid plan required' });
      }
      
      await UsageService.initializeUserUsage(userId, plan);
      const stats = await UsageService.getUserStats(userId);
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error initializing usage:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin usage analysis (Sandra only)
  app.get('/api/admin/usage-analysis/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const adminEmail = req.user.claims.email;
      if (adminEmail !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { userId } = req.params;
      const analysis = await UsageService.getUserCostAnalysis(userId);
      res.json(analysis || {});
    } catch (error) {
      console.error('Error getting usage analysis:', error);
      res.status(500).json({ error: 'Failed to get usage analysis' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateBrandbookDesignerResponse(message: string, brandbook: any, onboardingData: any, chatHistory: any[]): { message: string, brandbookUpdates?: any, templateSuggestion?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Handle template switching
  if (lowerMessage.includes('template') || lowerMessage.includes('style') || lowerMessage.includes('different')) {
    if (lowerMessage.includes('minimal') || lowerMessage.includes('executive') || lowerMessage.includes('clean')) {
      return {
        message: "Perfect! I'm switching you to the Executive Essence template. This gives you that sophisticated, minimal look that's perfect for established businesses and high-end services. The clean lines and typography will make your brand feel premium and trustworthy.",
        templateSuggestion: 'executive-essence'
      };
    }
    if (lowerMessage.includes('bold') || lowerMessage.includes('femme') || lowerMessage.includes('nature') || lowerMessage.includes('green')) {
      return {
        message: "Love it! The Bold Femme template is gorgeous for your brand. This template combines feminine strength with nature-inspired elegance - think emerald greens and sophisticated earth tones. It's perfect if you want your brand to feel both powerful and connected to nature.",
        templateSuggestion: 'bold-femme'
      };
    }
    if (lowerMessage.includes('luxe') || lowerMessage.includes('feminine') || lowerMessage.includes('burgundy') || lowerMessage.includes('romantic')) {
      return {
        message: "Oh, this is going to be stunning! The Luxe Feminine template is all about sophisticated femininity with those gorgeous burgundy and plum tones. It's perfect for beauty, wellness, or luxury lifestyle brands. Your clients will feel the elegance immediately.",
        templateSuggestion: 'luxe-feminine'
      };
    }
    if (lowerMessage.includes('refined') || lowerMessage.includes('magazine') || lowerMessage.includes('editorial')) {
      return {
        message: "Excellent choice! The Refined Minimalist template gives you that high-end magazine editorial look. Clean, sophisticated, with perfect typography balance. This is ideal if you want your brand to feel like it belongs in Vogue or Harper's Bazaar.",
        templateSuggestion: 'refined-minimalist'
      };
    }
  }
  
  // Handle color changes
  if (lowerMessage.includes('color') || lowerMessage.includes('palette') || lowerMessage.includes('change colors')) {
    if (lowerMessage.includes('warm') || lowerMessage.includes('gold') || lowerMessage.includes('cream') || lowerMessage.includes('beige')) {
      return {
        message: "Beautiful! I'm updating your color palette to include warm, luxurious tones. Think creamy whites, soft golds, and warm grays. This palette feels inviting and premium - perfect for service-based businesses where trust and warmth matter.",
        brandbookUpdates: {
          primaryColor: '#8B7355',
          secondaryColor: '#F5F2E8',
          accentColor: '#D4AF37'
        }
      };
    }
    if (lowerMessage.includes('cool') || lowerMessage.includes('blue') || lowerMessage.includes('gray') || lowerMessage.includes('navy')) {
      return {
        message: "Perfect! Cool tones are so sophisticated. I'm updating your palette to include crisp blues and grays - this feels modern, trustworthy, and professional. It's excellent for consulting, tech, or any business where expertise and reliability are key.",
        brandbookUpdates: {
          primaryColor: '#2C3E50',
          secondaryColor: '#ECF0F1',
          accentColor: '#3498DB'
        }
      };
    }
    if (lowerMessage.includes('pink') || lowerMessage.includes('blush') || lowerMessage.includes('rose')) {
      return {
        message: "Gorgeous choice! I'm updating your palette with sophisticated pinks and blush tones. This isn't little-girl pink - this is confident, feminine, and powerful. Perfect for beauty, coaching, or lifestyle brands.",
        brandbookUpdates: {
          primaryColor: '#B8860B',
          secondaryColor: '#F8F4F0',
          accentColor: '#E8B5CE'
        }
      };
    }
  }
  
  // Handle personality and elegance adjustments
  if (lowerMessage.includes('elegant') || lowerMessage.includes('sophisticated') || lowerMessage.includes('luxury') || lowerMessage.includes('more elegant')) {
    return {
      message: "Yes! I'm elevating your brand's elegance factor. Adding more sophisticated typography, refined color transitions, and premium styling throughout. This will make your brand feel like it belongs in the luxury market.",
      brandbookUpdates: {
        primaryFont: 'Times New Roman',
        secondaryFont: 'Inter',
        voiceTone: "Sophisticated, refined, and effortlessly elegant. Speaks with understated confidence.",
        keyPhrases: "Timeless elegance, refined luxury, sophisticated solutions, elevated experience"
      }
    };
  }
  
  if (lowerMessage.includes('personality') || lowerMessage.includes('add personality') || lowerMessage.includes('more personality')) {
    return {
      message: "Perfect! Let's add some personality to your brand. I'm infusing more warmth, authenticity, and approachable expertise. Your brand will feel professional but never stuffy - like chatting with a trusted expert friend.",
      brandbookUpdates: {
        voiceTone: "Warm, authentic, and genuinely helpful. Expert advice delivered with personality and heart.",
        keyPhrases: "Authentic expertise, genuine care, real solutions, personal approach, trusted guidance"
      }
    };
  }
  
  // Handle font requests
  if (lowerMessage.includes('font') || lowerMessage.includes('typography')) {
    return {
      message: "Great question! I'm optimizing your typography for maximum sophistication. Times New Roman for headlines gives you that editorial luxury feel, while Inter for body text keeps everything clean and readable. This combination screams premium.",
      brandbookUpdates: {
        primaryFont: 'Times New Roman',
        secondaryFont: 'Inter'
      }
    };
  }
  
  // Generic helpful responses based on current context
  const businessType = onboardingData?.businessType || '';
  const brandVibe = onboardingData?.brandVibe || '';
  
  const contextualResponses = [
    `Your ${brandVibe} brand is looking fantastic! What specific aspect would you like to adjust? I can help with colors, typography, template style, or the overall personality.`,
    `I love the direction we're going with your ${businessType} brand! Tell me more about what you'd like to change - different colors, new template style, or maybe adjusting the brand personality?`,
    `Your brandbook is coming together beautifully! What's not feeling quite right? Too conservative? Need more warmth? Want a completely different vibe? I can adjust anything.`,
    `This is going to be amazing for your business! What would make your brandbook feel more authentically 'you'? I can adjust everything from colors to the entire aesthetic.`
  ];
  
  return {
    message: contextualResponses[Math.floor(Math.random() * contextualResponses.length)]
  };
}

function generateSandraResponse(message: string, context: string): string {
  const lowerInput = message.toLowerCase();
  
  if (lowerInput.includes('price') || lowerInput.includes('pricing')) {
    return "Pricing is where most women undervalue themselves. Let's talk about your worth, not just your rate. What transformation do you provide?";
  }
  
  if (lowerInput.includes('selfie') || lowerInput.includes('photo')) {
    return "Your selfies are your power! They show the real you, not some stock photo version. Authenticity beats perfection every time.";
  }
  
  if (lowerInput.includes('brand')) {
    return "Your brand isn't your logo or colors - it's the feeling people get when they think about you. What feeling do you want to create?";
  }
  
  return "Great question! Remember, authenticity always wins. What feels most authentic to you right now?";
}

function generateSandraPhotoshootResponse(message: string, chatHistory: any[], onboardingData: any): any {
  const lowerMessage = message.toLowerCase();
  
  // Professional business headshots
  if (lowerMessage.includes('business') || lowerMessage.includes('professional') || lowerMessage.includes('headshot')) {
    return {
      response: "Okay, business headshots - but let's make them actually convert clients! I'm thinking sharp professional look with that confident 'I know what I'm doing' vibe. Want to try something with dramatic lighting and a clean background?",
      prompt: "subject, professional business portrait, Canon 5D Mark IV, 85mm lens, confident business look, professional attire, soft natural lighting, clean background, executive style, sharp professional focus, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, professional photography"
    };
  }
  
  // Editorial magazine style
  if (lowerMessage.includes('magazine') || lowerMessage.includes('editorial') || lowerMessage.includes('vogue')) {
    return {
      response: "Magazine cover energy! I love this. Let's create something that looks like it belongs on the cover of Vogue. Think dramatic lighting, striking pose, and that editorial makeup look that screams 'I'm the main character'.",
      prompt: "subject, magazine cover photo, professional studio lighting, Hasselblad H6D-100c camera, 85mm lens, striking pose, confident expression, designer clothing, dramatic lighting, editorial makeup, magazine quality, sharp focus, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
    };
  }
  
  // Lifestyle and natural
  if (lowerMessage.includes('lifestyle') || lowerMessage.includes('natural') || lowerMessage.includes('casual')) {
    return {
      response: "Natural lifestyle vibes - this is what converts because it feels authentic! People want to see the real you, not some perfect robot. Let's capture that effortless confidence.",
      prompt: "subject, lifestyle photography, natural lighting, Leica M11 camera, 35mm lens, authentic moment, relaxed expression, casual elegant style, environmental portrait, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
    };
  }
  
  // Luxury and sophisticated
  if (lowerMessage.includes('luxury') || lowerMessage.includes('elegant') || lowerMessage.includes('sophisticated')) {
    return {
      response: "Luxury aesthetic - because you ARE the luxury brand! Let's create something that screams premium without trying too hard. Think understated elegance with that expensive feel.",
      prompt: "subject, luxury portrait, high-end fashion photography, Hasselblad H6D-100c, 120mm lens, sophisticated elegance, premium styling, dramatic rim lighting, luxury aesthetic, sharp focus, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
    };
  }
  
  // Default creative response
  return {
    response: "Tell me more about the vibe you're going for! Are we talking professional business energy, editorial magazine realness, natural lifestyle feels, or luxury sophistication? I can create the perfect prompt once I know what story you want to tell.",
    prompt: null
  };
}

// Generate custom prompt from user message and their preferences
function generateCustomPromptFromMessage(message: string, onboardingData: any): string {
  // Extract style keywords from user's message
  const editorialKeywords = ['magazine', 'editorial', 'vogue', 'fashion', 'professional', 'business', 'cover'];
  const lifestyleKeywords = ['casual', 'lifestyle', 'natural', 'cozy', 'home', 'relaxed'];
  const luxuryKeywords = ['luxury', 'elegant', 'sophisticated', 'premium', 'high-end'];
  
  const messageLower = message.toLowerCase();
  let style = 'Portrait';
  let subcategory = 'Creative';
  
  // Determine style based on message content
  if (editorialKeywords.some(keyword => messageLower.includes(keyword))) {
    style = 'Editorial';
    subcategory = 'Magazine Cover';
  } else if (lifestyleKeywords.some(keyword => messageLower.includes(keyword))) {
    style = 'Lifestyle';
    subcategory = 'Working';
  } else if (luxuryKeywords.some(keyword => messageLower.includes(keyword))) {
    style = 'Editorial';
    subcategory = 'Business';
  }
  
  // Use user's preferred style from onboarding if available
  if (onboardingData?.brandVibe) {
    if (onboardingData.brandVibe.includes('professional') || onboardingData.brandVibe.includes('business')) {
      style = 'Editorial';
      subcategory = 'Business';
    } else if (onboardingData.brandVibe.includes('luxury') || onboardingData.brandVibe.includes('sophisticated')) {
      style = 'Editorial';
      subcategory = 'Magazine Cover';
    } else if (onboardingData.brandVibe.includes('authentic') || onboardingData.brandVibe.includes('natural')) {
      style = 'Lifestyle';
      subcategory = 'Working';
    }
  }
  
  // Base professional photography prompt with user's trigger word
  let prompt = `{triggerWord}, `;
  
  // Add specific styling based on detected/preferred style
  if (style === 'Editorial' && subcategory === 'Magazine Cover') {
    prompt += `magazine cover photo, professional studio lighting, Hasselblad H6D-100c camera, 85mm lens, striking pose, confident expression, designer clothing, dramatic lighting, editorial makeup, magazine quality, sharp focus`;
  } else if (style === 'Editorial' && subcategory === 'Business') {
    prompt += `professional business portrait, Canon 5D Mark IV, 85mm lens, confident business look, professional attire, soft natural lighting, clean background, executive style, sharp professional focus`;
  } else if (style === 'Lifestyle') {
    prompt += `lifestyle photography, natural lighting, Leica M11 camera, 35mm lens, authentic moment, relaxed expression, casual elegant style, environmental portrait`;
  } else {
    prompt += `portrait photography, professional lighting, clean composition, natural expression, high-end camera quality`;
  }
  
  // Add professional quality enhancers
  prompt += `, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, professional photography, high resolution, award-winning portrait`;
  
  return prompt;
}


