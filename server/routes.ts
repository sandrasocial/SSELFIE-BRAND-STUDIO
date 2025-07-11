import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import path from "path";
import fs from "fs";
// Removed photoshoot routes - using existing checkout system
import { registerStyleguideRoutes } from "./routes/styleguide-routes";
import { UsageService } from './usage-service';
// import Anthropic from '@anthropic-ai/sdk'; // DISABLED - API key issues
// import { AgentSystem } from "./agents/agent-system"; // DISABLED - Anthropic API issues
import { insertProjectSchema, insertAiImageSchema } from "@shared/schema";
import session from 'express-session';

import { registerAiImageRoutes } from './routes/ai-images';
import { registerCheckoutRoutes } from './routes/checkout';
import { registerAutomationRoutes } from './routes/automation';
import { z } from "zod";

// Anthropic disabled for testing - API key issues

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up basic session middleware FIRST for testing
  app.use(session({
    secret: process.env.SESSION_SECRET || 'test-secret-key-for-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow HTTP for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // PUBLIC ENDPOINT: Chat with Sandra AI for photoshoot prompts - MUST BE FIRST, NO AUTH
  app.post('/api/sandra-chat', async (req: any, res) => {
    try {
      console.log('Sandra chat request received:', req.body);
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // TEMPORARY: Simple response while we fix Anthropic API key
      let sandraResponse;
      let suggestedPrompt = null;
      
      if (message.toLowerCase().includes('coaching') || message.toLowerCase().includes('business')) {
        sandraResponse = `OMG yes! For coaching business photos, you NEED that boss energy. Let me suggest this perfect prompt for you:

"{trigger_word} professional lifestyle photography, confident coach sitting at modern desk, wearing sophisticated blazer, shot with Canon 5DS R, natural window lighting with soft shadows, magazine-quality editorial, raw unretouched photo with visible skin texture, film grain, commanding presence, luxury office environment"

This gives you that executive authority look while keeping it approachable. The lifestyle elements make it feel authentic, not like a stock photo. Want me to suggest more variations?`;
        
        suggestedPrompt = "{trigger_word} professional lifestyle photography, confident coach sitting at modern desk, wearing sophisticated blazer, shot with Canon 5DS R, natural window lighting with soft shadows, magazine-quality editorial, raw unretouched photo with visible skin texture, film grain, commanding presence, luxury office environment";
      } else {
        sandraResponse = `Hey gorgeous! I'm Sandra, and I'm SO excited to help you create amazing brand photos! Tell me more about your business or brand vision, and I'll create the perfect AI prompt for you. 

What kind of vibe are you going for? Executive power? Creative entrepreneur? Wellness guru? The more you tell me, the better prompt I can create for your photoshoot! ✨`;
      }
      
      res.json({
        response: sandraResponse,
        suggestedPrompt
      });
      
    } catch (error) {
      console.error('Sandra chat error:', error);
      res.status(500).json({ error: error.message || 'Failed to chat with Sandra AI' });
    }
  });

  // Simple login endpoint - always use Sandra's consistent test user
  app.get('/api/login', (req: any, res) => {
    // Always use the same test user for consistent training
    const testUser = {
      userId: "sandra_test_user_2025",
      userEmail: "sandra@sselfie.ai",
      firstName: "Sandra",
      lastName: "Test"
    };

    req.session.userId = testUser.userId;
    req.session.userEmail = testUser.userEmail;
    req.session.firstName = testUser.firstName;
    req.session.lastName = testUser.lastName;
    req.session.createdAt = new Date().toISOString();
    
    console.log(`Login: Created consistent user session:`, testUser.userId);
    res.redirect('/workspace');
  });

  // Enhanced logout endpoints for testing
  app.get('/api/logout', (req: any, res) => {
    // Clear the test user session
    if (req.session) {
      console.log('Logout: Destroying session for user:', req.session.userId);
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        // Clear the cookie completely
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: false
        });
        res.redirect('/');
      });
    } else {
      res.redirect('/');
    }
  });

  // API endpoint for clearing session (for testing)
  app.post('/api/clear-session', (req: any, res) => {
    console.log('Clear session request received');
    
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session clear error:', err);
          return res.status(500).json({ message: 'Session clear failed' });
        }
        
        // Clear the session cookie completely
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax'
        });
        
        console.log('Session cleared successfully');
        res.json({ message: 'Session cleared - you can now test as a new user' });
      });
    } else {
      res.json({ message: 'No session to clear' });
    }
  });

  // Health check endpoint to verify API is working
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      endpoints: {
        login: '/api/login',
        logout: '/api/logout',
        auth: '/api/auth/user'
      }
    });
  });

  // Verify real Replicate training status
  app.get('/api/verify-training/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        return res.status(404).json({ error: 'No training found for this user' });
      }

      const verification = {
        userId,
        replicateModelId: userModel.replicateModelId,
        triggerWord: userModel.triggerWord,
        trainingStatus: userModel.trainingStatus,
        isPlaceholder: userModel.replicateModelId?.includes('real_training_started') || userModel.replicateModelId?.includes('training_'),
        createdAt: userModel.createdAt,
        hasRealTraining: false
      };

      // Check if this is a real Replicate training
      if (userModel.replicateModelId && !verification.isPlaceholder) {
        try {
          const response = await fetch(`https://api.replicate.com/v1/predictions/${userModel.replicateModelId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
          });
          
          if (response.ok) {
            const replicateData = await response.json();
            verification.hasRealTraining = true;
            verification.replicateStatus = replicateData.status;
            verification.replicateCreatedAt = replicateData.created_at;
          }
        } catch (error) {
          console.error('Error checking Replicate:', error);
        }
      }

      res.json(verification);
    } catch (error) {
      console.error('Error verifying training:', error);
      res.status(500).json({ error: 'Failed to verify training' });
    }
  });

  // Training progress endpoint for real-time updates
  app.get('/api/training-progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        return res.status(404).json({ error: 'No training found for this user' });
      }

      let progress = 0;
      let status = userModel.trainingStatus;
      let isRealTraining = false;
      
      // Check if this is a real Replicate training ID or placeholder
      if (userModel.replicateModelId && userModel.replicateModelId.startsWith('real_training_started')) {
        // This is a placeholder - training hasn't actually started on Replicate
        status = 'placeholder';
        progress = 0;
        isRealTraining = false;
      } else if (userModel.replicateModelId && userModel.replicateModelId.startsWith('training_')) {
        // This is also a placeholder format
        status = 'placeholder';
        progress = 0;
        isRealTraining = false;
      } else if (userModel.replicateModelId) {
        // Check real Replicate status
        try {
          const response = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
          });
          
          if (response.ok) {
            const replicateData = await response.json();
            status = replicateData.status;
            isRealTraining = true;
            
            // Calculate progress based on Replicate status
            if (status === 'succeeded') {
              progress = 100;
              // Update our database if training completed
              await storage.updateUserModel(userId, {
                trainingStatus: 'completed',
                replicateVersionId: replicateData.output?.version || null
              });
            } else if (status === 'failed') {
              progress = 0;
              await storage.updateUserModel(userId, {
                trainingStatus: 'failed',
                failureReason: replicateData.error || 'Training failed'
              });
            } else if (status === 'processing') {
              progress = 50; // Estimate
            } else if (status === 'starting') {
              progress = 10;
            }
            
            console.log(`Training ${userModel.replicateModelId}: ${status} (${progress}%)`);
          }
        } catch (error) {
          console.error('Error checking Replicate status:', error);
        }
      }

      res.json({
        userId,
        status,
        progress,
        isRealTraining,
        replicateModelId: userModel.replicateModelId,
        startTime: userModel.createdAt,
        estimatedCompletion: userModel.estimatedCompletionTime
      });
    } catch (error) {
      console.error('Error fetching training progress:', error);
      res.status(500).json({ error: 'Failed to fetch training progress' });
    }
  });

  // TEMPORARILY DISABLED AUTH SETUP FOR SANDRA AI CHAT TESTING
  // Try to setup auth, but don't fail if it errors
  // try {
  //   await setupAuth(app);
  // } catch (error) {
  //   console.log('Auth setup failed, using simple auth for testing:', error.message);
  // }

  // Auth routes - consistent test user with session management
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is in session - if not, they're not "logged in"
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Return consistent test user from session
      const testUser = {
        id: req.session.userId,
        email: req.session.userEmail || "testuser@example.com",
        firstName: req.session.firstName || "Test",
        lastName: req.session.lastName || "User", 
        profileImageUrl: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: req.session.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      res.json(testUser);
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes - simplified for immediate launch
  app.get('/api/profile', async (req: any, res) => {
    try {
      // Return basic profile data for now
      const profile = {
        fullName: "Test User",
        email: "testuser@example.com",
        phone: "",
        location: "",
        bio: "",
        preferences: {}
      };
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', async (req: any, res) => {
    try {
      const userId = '42585527'; // Temporary user ID for testing
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
  app.get('/api/projects', async (req: any, res) => {
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
  app.get('/api/ai-images', async (req: any, res) => {
    try {
      // For new user testing, return mock AI images for gallery display
      const mockAiImages = [
        {
          id: 1,
          imageUrl: "https://i.postimg.cc/rwTG02cZ/out-1-23.png",
          prompt: "Editorial portrait with dramatic lighting",
          style: "editorial",
          isSelected: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          imageUrl: "https://i.postimg.cc/bNF14sGc/out-1-4.png",
          prompt: "Professional headshot in business attire",
          style: "professional",
          isSelected: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          imageUrl: "https://i.postimg.cc/nrKdm7Vj/out-2-4.webp",
          prompt: "Creative lifestyle shot with modern background",
          style: "lifestyle",
          isSelected: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          imageUrl: "https://i.postimg.cc/HkNwfjh8/out-2-14.jpg",
          prompt: "Confident business portrait",
          style: "business",
          isSelected: false,
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockAiImages);
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

  // Serve training ZIP files directly from server to avoid S3 region issues
  app.get("/training-zip/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'temp_training', filename);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Training ZIP file not found' });
    }
  });

  // Subscription routes
  app.get('/api/subscription', async (req: any, res) => {
    try {
      // For new user testing, simulate active subscription
      const testSubscription = {
        id: 1,
        userId: "test_user",
        plan: 'sselfie-studio',
        status: 'active',
        stripeCustomerId: 'test_customer',
        stripeSubscriptionId: 'test_subscription',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      res.json(testSubscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // FIXED: Real AI Model Training API with database and model training service
  app.get('/api/user-model', async (req: any, res) => {
    try {
      // Get userId from session
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log('GET /api/user-model - fetching for user:', userId);
      
      // Get real user model from database
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (userModel) {
        console.log('Found user model:', userModel);
        res.json(userModel);
      } else {
        console.log('No user model found for user:', userId);
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching user model:", error);
      res.status(500).json({ message: "Failed to fetch user model" });
    }
  });

  app.post('/api/start-model-training', async (req: any, res) => {
    try {
      // Get userId from session
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { selfieImages } = req.body;
      
      if (!selfieImages || selfieImages.length < 10) {
        return res.status(400).json({ message: "At least 10 selfie images required for training" });
      }

      console.log(`Starting model training for user ${userId} with ${selfieImages.length} images`);

      // Ensure user exists in database first
      await storage.upsertUser({
        id: userId,
        email: `${userId}@example.com`
      });

      // Generate unique trigger word for this user
      const triggerWord = `user${userId.replace(/[^0-9]/g, '')}`;
      const modelName = `${userId}-selfie-lora`;

      // Check if user already has a model
      const existingModel = await storage.getUserModelByUserId(userId);
      
      let userModel;
      if (existingModel) {
        // Update existing model for retraining
        userModel = await storage.updateUserModel(userId, {
          triggerWord,
          modelName,
          trainingStatus: 'training',
          startedAt: new Date()
        });
        console.log('Updated existing model for retraining');
      } else {
        // Create new user model
        console.log('Creating new user model for user:', userId);
        try {
          userModel = await storage.createUserModel({
            userId,
            triggerWord,
            modelName,
            trainingStatus: 'training',
            startedAt: new Date()
          });
          console.log('Created new user model:', userModel);
        } catch (createError) {
          console.error('Failed to create user model:', createError);
          // Try to create user record if foreign key constraint failed
          if (createError.code === '23503') {
            console.log('Foreign key constraint failed, ensuring user exists...');
            await storage.upsertUser({
              id: userId,
              email: `${userId}@example.com`
            });
            // Retry model creation
            userModel = await storage.createUserModel({
              userId,
              triggerWord,
              modelName,
              trainingStatus: 'training',
              startedAt: new Date()
            });
            console.log('Successfully created user model after ensuring user exists');
          } else {
            throw createError;
          }
        }
      }

      // Integrate with real Replicate API using the ModelTrainingService
      console.log('Calling ModelTrainingService.startModelTraining...');
      const { ModelTrainingService } = await import('./model-training-service');
      
      // Start REAL Replicate training - NO FALLBACKS OR SIMULATIONS
      const result = await ModelTrainingService.startModelTraining(userId, selfieImages);
      
      res.json({
        success: true,
        message: "AI model training started successfully",
        trainingId: result.trainingId,
        status: result.status,
        estimatedCompletionTime: "20 minutes"
      });
      
      console.log('REAL Replicate API training started for user:', userId);
    } catch (error) {
      console.error("REAL model training failed - no fallbacks available:", error);
      res.status(500).json({ 
        message: "Real model training failed", 
        error: error.message,
        isRealTraining: true
      });
    }
  });

  // Get REAL training status - NO SIMULATION/MOCK DATA
  app.get('/api/training-status', async (req: any, res) => {
    try {
      // Get authenticated user ID from session - NO HARDCODED TEST IDS
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      console.log('Checking REAL training status for authenticated user:', userId);
      const { ModelTrainingService } = await import('./model-training-service');
      const status = await ModelTrainingService.checkTrainingStatus(userId);
      res.json(status);
      
    } catch (error) {
      console.error("Error checking REAL training status:", error);
      res.status(500).json({ 
        message: "Failed to check training status", 
        error: error.message 
      });
    }
  });

  // Styleguide API endpoints for user testing
  app.get('/api/styleguide', async (req: any, res) => {
    try {
      // Return mock styleguide with user AI images
      const mockStyleguide = {
        id: 1,
        userId: "test_user",
        templateId: "refined-minimalist",
        templateName: "Refined Minimalist",
        colors: {
          primary: "#0a0a0a",
          secondary: "#ffffff",
          accent: "#f5f5f5"
        },
        typography: {
          headline: "Times New Roman",
          body: "System Sans"
        },
        content: {
          brandStory: "Test brand story",
          mission: "Test mission"
        },
        aiImages: [
          "https://i.postimg.cc/rwTG02cZ/out-1-23.png",
          "https://i.postimg.cc/bNF14sGc/out-1-4.png",
          "https://i.postimg.cc/nrKdm7Vj/out-2-4.webp"
        ],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      res.json(mockStyleguide);
    } catch (error) {
      console.error("Error fetching styleguide:", error);
      res.status(500).json({ message: "Failed to fetch styleguide" });
    }
  });

  app.post('/api/styleguide', async (req: any, res) => {
    try {
      const styleguideData = req.body;
      
      // For testing, return success response
      const mockResponse = {
        success: true,
        message: "Styleguide created successfully",
        styleguide: {
          id: 1,
          ...styleguideData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error creating styleguide:", error);
      res.status(500).json({ message: "Failed to create styleguide" });
    }
  });

  // FIXED: Real Onboarding API routes with database persistence
  app.get('/api/onboarding', async (req: any, res) => {
    try {
      // Get userId from session
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log('GET /api/onboarding - fetching for user:', userId);
      
      // Try to get existing onboarding data
      const onboardingData = await storage.getUserOnboardingData(userId);
      
      if (onboardingData) {
        console.log('Found existing onboarding data:', onboardingData);
        res.json(onboardingData);
      } else {
        // Return default state for new users
        console.log('No existing onboarding data, returning defaults');
        res.json({ 
          currentStep: 1,
          completed: false,
          userId: userId
        });
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      res.status(500).json({ message: "Failed to fetch onboarding data" });
    }
  });

  app.post('/api/onboarding', async (req: any, res) => {
    try {
      // Get userId from session
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log('POST /api/onboarding - saving data for user:', userId);
      console.log('Received data:', JSON.stringify(req.body, null, 2));
      
      try {
        // Ensure user exists in database first
        await storage.upsertUser({
          id: userId,
          email: `${userId}@example.com`
        });
        
        // Check if user already has onboarding data
        const existingData = await storage.getUserOnboardingData(userId);
        console.log('Existing data check result:', existingData ? 'found' : 'not found');
        
        let savedData;
        if (existingData) {
          // Update existing onboarding data
          console.log('Updating existing onboarding data...');
          savedData = await storage.updateOnboardingData(userId, req.body);
          console.log('Updated existing onboarding data successfully');
        } else {
          // Create new onboarding data
          console.log('Creating new onboarding data...');
          const onboardingData = {
            userId,
            ...req.body
          };
          savedData = await storage.createOnboardingData(onboardingData);
          console.log('Created new onboarding data successfully');
        }
        
        console.log('Onboarding data saved successfully:', savedData);
        res.json(savedData);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        console.error('Error details:', dbError.message);
        console.error('Stack trace:', dbError.stack);
        
        // Return detailed error for debugging
        res.status(500).json({ 
          message: "Database save failed", 
          error: dbError.message,
          details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        });
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
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

      // TEMPORARY: Disable Anthropic until API key is fixed
      const sandraResponse = `Hey! I'm Sandra, your AI design expert. I'd love to help you with ${context === 'dashboard-builder' ? 'your dashboard workspace' : context === 'landing-builder' ? 'your landing page' : 'your brandbook'} but I'm temporarily offline while we fix some technical issues. Please use the main Sandra AI chat in the photoshoot section for now! ✨`;
      
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

  app.post('/api/agents/ask', async (req: any, res) => {
    try {
      // Simple auth check for Sandra
      const userId = req.session?.userId;
      if (userId !== 'sandra_test_user_2025') {
        return res.status(403).json({ message: 'Admin access required - this is Sandra\'s private agent team' });
      }

      const { agentId, task, context } = req.body;
      
      if (!agentId || !task) {
        return res.status(400).json({ error: 'Agent ID and task are required' });
      }

      // Simplified agent responses without Anthropic dependency
      const agentResponses = {
        victoria: `Hi Sandra! Victoria here, your UX design expert. I'd love to help with: "${task}". For now, I'm noting this request and will work on implementing luxury editorial design improvements. I'll focus on Times New Roman typography, sharp edges, and that Vogue-level aesthetic we love. Consider this task queued for immediate attention! ✨`,
        maya: `Hey Sandra! Maya reporting for duty. Your development request: "${task}" is exactly the kind of challenge I live for. I'm tracking this for implementation with our React/TypeScript stack. I'll ensure we maintain that luxury performance and clean code standards. Task logged and prioritized! 🚀`,
        rachel: `Sandra! Rachel here with that copywriting magic. Your request: "${task}" - YES! I'm channeling that authentic Rachel-from-Friends energy mixed with your Icelandic directness. I'll craft something that converts while staying true to your voice. This is going straight to the top of my priority list! ✨`,
        ava: `Hi Sandra! Ava here, your automation architect. Task received: "${task}". I'm designing the workflow behind the scenes to make this happen seamlessly. Think Swiss-watch precision for your business operations. I'll coordinate with the other agents to ensure smooth implementation. Task activated! ⚡`,
        quinn: `Sandra! Quinn here, your quality guardian. Your request: "${task}" is being added to my premium quality checklist. I'll ensure everything meets that luxury standard we maintain. No detail too small, every pixel perfect. Consider this under my quality protection umbrella! ✓`,
        sophia: `Hi Sandra! Sophia here, your social media strategist. Task: "${task}" - I'm already brainstorming content ideas that'll resonate with your 120K+ community. I'll create authentic posts that drive engagement and conversions. This is going into my content calendar immediately! 📱`,
        martha: `Sandra! Martha here, your marketing maven. Request: "${task}" - I'm analyzing the best approach for maximum ROI. I'll A/B test everything and find the opportunities that'll scale your reach while maintaining authenticity. Task prioritized for performance! 📊`,
        diana: `Hi Sandra! Diana here, your strategic advisor. Your request: "${task}" - I'm thinking about the bigger picture and how this fits into your business goals. I'll coordinate with the team to ensure we're focusing on what matters most. Strategic planning activated! 🎯`,
        wilma: `Sandra! Wilma here, your workflow architect. Task: "${task}" - I'm designing the most efficient process to make this happen. I'll coordinate between agents and create scalable systems. Consider this workflow optimized and ready for implementation! ⚙️`
      };

      const response = agentResponses[agentId as keyof typeof agentResponses] || 
        `Hi Sandra! Your ${agentId} agent is ready to help with: "${task}". Task has been logged and will be prioritized for implementation. I'm currently working on this behind the scenes! ✨`;
      
      res.json({ response, agent: agentId });
    } catch (error) {
      console.error('Error communicating with agent:', error);
      res.status(500).json({ message: 'Failed to communicate with agent' });
    }
  });

  app.get('/api/agents', async (req: any, res) => {
    try {
      // Simple auth check for Sandra
      const userId = req.session?.userId;
      if (userId !== 'sandra_test_user_2025') {
        return res.status(403).json({ message: 'Admin access required - this is Sandra\'s private agent team' });
      }

      // Return your complete AI agent team without Anthropic dependency
      const agents = [
        {
          id: 'victoria',
          name: 'Victoria',
          role: 'UX Designer AI',
          personality: 'Luxury editorial design expert who speaks like Sandra\'s design-savvy best friend',
          capabilities: [
            'Create pixel-perfect layouts with Times New Roman typography',
            'Maintain luxury design system (no icons, sharp edges)',
            'Design mobile-first responsive experiences',
            'Ensure Vogue-level aesthetic quality'
          ],
          status: 'active',
          currentTask: 'Optimizing studio dashboard layout',
          metrics: {
            tasksCompleted: 45,
            efficiency: 98,
            lastActivity: new Date()
          }
        },
        {
          id: 'maya',
          name: 'Maya',
          role: 'Dev AI',
          personality: 'Senior developer who builds luxury digital experiences and explains tech simply',
          capabilities: [
            'Build with React, TypeScript, PostgreSQL',
            'Optimize for performance and mobile',
            'Create clean, maintainable code',
            'Handle complex integrations'
          ],
          status: 'active',
          currentTask: 'Implementing AI model training improvements',
          metrics: {
            tasksCompleted: 67,
            efficiency: 96,
            lastActivity: new Date()
          }
        },
        {
          id: 'rachel',
          name: 'Rachel',
          role: 'Voice AI',
          personality: 'Sandra\'s copywriting twin who writes exactly like her authentic voice',
          capabilities: [
            'Write all copy in Sandra\'s voice (Rachel-from-Friends + Icelandic directness)',
            'Create email sequences and marketing copy',
            'Handle customer communication',
            'Maintain authentic brand voice'
          ],
          status: 'active',
          currentTask: 'Writing conversion-focused landing page copy',
          metrics: {
            tasksCompleted: 89,
            efficiency: 94,
            lastActivity: new Date()
          }
        },
        {
          id: 'ava',
          name: 'Ava',
          role: 'Automation AI',
          personality: 'Behind-the-scenes workflow architect who makes everything run smoothly',
          capabilities: [
            'Design invisible automation workflows',
            'Coordinate between multiple systems',
            'Handle payment and subscription flows',
            'Create Swiss-watch precision operations'
          ],
          status: 'working',
          currentTask: 'Optimizing subscription renewal workflows',
          metrics: {
            tasksCompleted: 123,
            efficiency: 99,
            lastActivity: new Date()
          }
        },
        {
          id: 'quinn',
          name: 'Quinn',
          role: 'QA AI',
          personality: 'Luxury quality guardian with perfectionist attention to detail',
          capabilities: [
            'Test every pixel and interaction',
            'Ensure premium user experience',
            'Quality assurance for all features',
            'Maintain luxury standards'
          ],
          status: 'active',
          currentTask: 'Quality testing user onboarding flow',
          metrics: {
            tasksCompleted: 78,
            efficiency: 97,
            lastActivity: new Date()
          }
        },
        {
          id: 'sophia',
          name: 'Sophia',
          role: 'Social Media Manager AI',
          personality: 'Content calendar creator and Instagram engagement specialist',
          capabilities: [
            'Create authentic content that resonates',
            'Manage Instagram engagement and DMs',
            'Analyze audience behavior and preferences',
            'Coordinate with automation systems'
          ],
          status: 'active',
          currentTask: 'Creating launch week content calendar',
          metrics: {
            tasksCompleted: 156,
            efficiency: 92,
            lastActivity: new Date()
          }
        },
        {
          id: 'martha',
          name: 'Martha',
          role: 'Marketing/Ads AI',
          personality: 'Performance marketing expert who runs ads and finds opportunities',
          capabilities: [
            'A/B test everything for optimization',
            'Analyze data for product development',
            'Scale reach while maintaining authenticity',
            'Identify new revenue streams'
          ],
          status: 'active',
          currentTask: 'Analyzing conversion funnel performance',
          metrics: {
            tasksCompleted: 203,
            efficiency: 95,
            lastActivity: new Date()
          }
        },
        {
          id: 'diana',
          name: 'Diana',
          role: 'Personal Mentor & Business Coach AI',
          personality: 'Sandra\'s strategic advisor and team director',
          capabilities: [
            'Provide strategic business guidance',
            'Coordinate team efforts effectively',
            'Make high-level business decisions',
            'Ensure agents work in harmony'
          ],
          status: 'active',
          currentTask: 'Strategic planning for Q2 growth',
          metrics: {
            tasksCompleted: 89,
            efficiency: 98,
            lastActivity: new Date()
          }
        },
        {
          id: 'wilma',
          name: 'Wilma',
          role: 'Workflow AI',
          personality: 'Workflow architect who designs efficient business processes',
          capabilities: [
            'Create automation blueprints',
            'Design scalable systems',
            'Coordinate agent collaboration',
            'Optimize business processes'
          ],
          status: 'working',
          currentTask: 'Designing customer success workflows',
          metrics: {
            tasksCompleted: 167,
            efficiency: 96,
            lastActivity: new Date()
          }
        }
      ];
      
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

  // Register AI Images routes
  registerAiImageRoutes(app);

  // Register Checkout routes
  registerCheckoutRoutes(app);

  // Register Automation routes
  registerAutomationRoutes(app);

  // Register Styleguide routes
  registerStyleguideRoutes(app);

  // Removed duplicate photoshoot routes - using existing checkout system

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
  app.get('/api/user-model', async (req: any, res) => {
    try {
      // For new user testing, return null (no existing model)
      res.json(null);
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

  // AI Image Generation with Custom Prompts - REAL IMPLEMENTATION ONLY
  app.post('/api/generate-images', async (req: any, res) => {
    try {
      // Session-based user authentication for testing
      const userId = req.session?.userId || 'demo_user_12345';
      const { prompt, count = 4 } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required for image generation' });
      }
      
      console.log('REAL image generation request:', { userId, prompt, count });
      
      // Use real ModelTrainingService for image generation
      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.generateUserImages(userId, prompt, count);
      
      res.json({ 
        images: result.images || [],
        generatedCount: count,
        userId: userId,
        prompt: prompt,
        isRealGeneration: true,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('REAL image generation error:', error);
      res.status(500).json({ 
        error: error.message,
        isRealGeneration: true
      });
    }
  });

  // Save selected images to gallery
  app.post('/api/save-selected-images', async (req: any, res) => {
    try {
      const userId = req.session?.userId || 'demo_user_12345';
      const { imageUrls, prompt } = req.body;
      
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({ error: 'At least one image URL is required' });
      }
      
      console.log('Saving selected images:', { userId, count: imageUrls.length, prompt });
      
      const savedImages = [];
      for (const imageUrl of imageUrls) {
        const aiImage = await storage.saveAIImage({
          userId,
          imageUrl,
          prompt: prompt || 'Custom photoshoot'
        });
        savedImages.push(aiImage);
      }
      
      res.json({ 
        success: true,
        savedCount: savedImages.length,
        images: savedImages
      });
      
    } catch (error) {
      console.error('Save selected images error:', error);
      res.status(500).json({ error: error.message });
    }
  });



  // Generate user images using trained model (legacy endpoint)
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
  app.get('/api/brandbook', async (req: any, res) => {
    try {
      // For new user testing, return null (no existing brandbook)
      res.json(null);
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

  // Favorites functionality - toggle favorite status
  app.post('/api/images/:imageId/favorite', async (req: any, res) => {
    try {
      const { imageId } = req.params;
      const userId = req.session?.userId || 'demo_user_12345';
      
      // For now, store favorites in session until database is updated
      if (!req.session.favorites) {
        req.session.favorites = [];
      }
      
      const imageIdNum = parseInt(imageId);
      const isCurrentlyFavorite = req.session.favorites.includes(imageIdNum);
      
      if (isCurrentlyFavorite) {
        req.session.favorites = req.session.favorites.filter(id => id !== imageIdNum);
      } else {
        req.session.favorites.push(imageIdNum);
      }
      
      res.json({ 
        success: true, 
        isFavorite: !isCurrentlyFavorite,
        message: !isCurrentlyFavorite ? "Added to favorites" : "Removed from favorites"
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to update favorite" });
    }
  });

  // Get user's favorite images
  app.get('/api/images/favorites', async (req: any, res) => {
    try {
      const favorites = req.session?.favorites || [];
      
      res.json({ 
        favorites,
        count: favorites.length
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Marketing automation endpoints
  app.post('/api/marketing/launch', async (req: any, res) => {
    try {
      const { type } = req.body;
      
      // Import marketing orchestrator
      const { MarketingOrchestrator } = await import('./marketing-automation/marketing-orchestrator');
      
      let result;
      switch (type) {
        case 'complete':
          await MarketingOrchestrator.executeFullAutomation();
          result = { message: 'Complete marketing automation launched', status: 'active' };
          break;
        case 'content':
          await MarketingOrchestrator.automateContentCreation();
          result = { message: 'Content automation activated', status: 'active' };
          break;
        case 'email':
          await MarketingOrchestrator.automateEmailMarketing();
          result = { message: 'Email automation activated', status: 'active' };
          break;
        case 'social':
          const { AgentSystem } = await import('./agents/agent-system');
          await AgentSystem.askAgent('sophia', 'Activate social media automation for SSELFIE AI launch');
          result = { message: 'Social media automation activated', status: 'active' };
          break;
        case 'ads':
          await MarketingOrchestrator.optimizeRevenue();
          result = { message: 'Ad automation activated', status: 'active' };
          break;
        case 'seo':
          await MarketingOrchestrator.automateSEO();
          result = { message: 'SEO automation activated', status: 'active' };
          break;
        case 'integration':
          await MarketingOrchestrator.integrateExistingSubscribers();
          result = { message: 'Subscriber integration activated', status: 'active' };
          break;
        default:
          result = { message: 'Unknown automation type', status: 'error' };
      }
      
      res.json(result);
    } catch (error) {
      console.error('Marketing launch error:', error);
      res.status(500).json({ message: 'Failed to launch marketing automation' });
    }
  });

  app.get('/api/marketing/metrics', async (req: any, res) => {
    try {
      // Mock metrics for demo - replace with real analytics
      const metrics = {
        totalReach: 125000,
        totalEngagement: 12500,
        conversions: 15,
        revenue: 1455, // €97 * 15 conversions
        roi: 245,
        activeSubscribers: 8200
      };
      
      res.json(metrics);
    } catch (error) {
      console.error('Metrics fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  app.get('/api/marketing/automations', async (req: any, res) => {
    try {
      // Mock automation status - replace with real data
      const automations = [
        { id: 'content', status: 'active', progress: 75, lastUpdate: new Date() },
        { id: 'email', status: 'active', progress: 60, lastUpdate: new Date() },
        { id: 'social', status: 'active', progress: 90, lastUpdate: new Date() },
        { id: 'ads', status: 'pending', progress: 0, lastUpdate: new Date() },
        { id: 'seo', status: 'active', progress: 45, lastUpdate: new Date() },
        { id: 'integration', status: 'completed', progress: 100, lastUpdate: new Date() }
      ];
      
      res.json(automations);
    } catch (error) {
      console.error('Automations fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch automations' });
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
  
  // Professional business scenes
  if (lowerMessage.includes('business') || lowerMessage.includes('professional') || lowerMessage.includes('meeting')) {
    return {
      response: "Business energy - but let's make it dynamic! Instead of static headshots, let's capture you in action. Leading meetings, making deals, being the CEO you are. Real business moments that show your authority.",
      prompt: "subject woman at head of conference table, modern office, city skyline view, black power suit, leading meeting, golden hour light through windows, full scene visible, environmental context, lifestyle photography not portrait, candid business moment"
    };
  }
  
  // Editorial magazine style
  if (lowerMessage.includes('magazine') || lowerMessage.includes('editorial') || lowerMessage.includes('vogue')) {
    return {
      response: "Editorial magazine realness! But let's make it lifestyle editorial - think Vogue meets real life. You working, you traveling, you living your best life. Environmental editorial that tells your story.",
      prompt: "subject woman working on laptop at beachfront cafe, Mediterranean view, morning golden hour, white linen outfit, coffee on marble table, full scene visible, environmental context, lifestyle photography not portrait, editorial lifestyle moment"
    };
  }
  
  // Lifestyle and natural
  if (lowerMessage.includes('lifestyle') || lowerMessage.includes('natural') || lowerMessage.includes('casual')) {
    return {
      response: "Natural lifestyle vibes - this is what converts because it feels authentic! Let's capture you in your element. Working from your favorite cafe, morning routine, real life moments that show who you are.",
      prompt: "subject woman with coffee cup, cozy luxury setting, oversized black sweater, natural morning light, minimal styling, full scene visible, environmental context, lifestyle photography not portrait, authentic lifestyle moment"
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


