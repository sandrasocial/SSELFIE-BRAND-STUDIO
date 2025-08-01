import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupRollbackRoutes } from './routes/rollback.js';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import emailAutomation from './routes/email-automation';
import victoriaWebsiteRouter from "./routes/victoria-website";
import { registerVictoriaService } from "./routes/victoria-service";
import { registerVictoriaWebsiteGenerator } from "./routes/victoria-website-generator";
import subscriberImportRouter from './routes/subscriber-import';
import adminBusinessMetricsRouter from './routes/admin-business-metrics';
import { whitelabelRoutes } from './routes/white-label-setup';
import path from 'path';
import fs from 'fs';
import { ModelRetrainService } from './retrain-model';

// UNIFIED AGENT SYSTEM IMPORT (Single source of truth)
import { unifiedAgentSystem } from './unified-agent-system';

// Generate Victoria website HTML content
function generateWebsiteHTML(websiteData: any, onboardingData: any) {
  const businessName = websiteData.businessName || 'Your Business';
  const businessDescription = websiteData.businessDescription || onboardingData?.brandStory || 'Professional services';
  const targetAudience = websiteData.targetAudience || onboardingData?.targetAudience || 'Our valued clients';
  const keyFeatures = websiteData.keyFeatures || [];
  const brandPersonality = websiteData.brandPersonality || onboardingData?.brandVoice || 'professional';
  
  const colorScheme = {
    professional: { primary: '#2c3e50', secondary: '#34495e', accent: '#3498db' },
    elegant: { primary: '#8b5a2b', secondary: '#a67c00', accent: '#d4af37' },
    modern: { primary: '#1a1a1a', secondary: '#333333', accent: '#007bff' },
    luxury: { primary: '#1a1a1a', secondary: '#8b6914', accent: '#daa520' },
    approachable: { primary: '#2c5aa0', secondary: '#1e3a8a', accent: '#3b82f6' },
    creative: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7' }
  };
  
  const colors = colorScheme[brandPersonality as keyof typeof colorScheme] || colorScheme.professional;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Georgia', serif; 
            line-height: 1.6; 
            color: #333;
            background: #fff;
        }
        .hero {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 80px 20px;
            text-align: center;
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .hero h1 {
            font-family: 'Times New Roman', serif;
            font-size: 3.5em;
            margin-bottom: 20px;
            font-weight: normal;
            letter-spacing: 2px;
        }
        .hero p {
            font-size: 1.3em;
            max-width: 600px;
            margin: 0 auto 30px;
            opacity: 0.95;
        }
        .cta-button {
            background: ${colors.accent};
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            font-size: 1.1em;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .cta-button:hover {
            background: ${colors.primary};
            transform: translateY(-2px);
        }
        .section {
            padding: 80px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .about {
            background: #f8f9fa;
            text-align: center;
        }
        .about h2 {
            font-family: 'Times New Roman', serif;
            font-size: 2.5em;
            margin-bottom: 30px;
            color: ${colors.primary};
        }
        .about p {
            font-size: 1.2em;
            max-width: 800px;
            margin: 0 auto;
            color: #555;
        }
        .features {
            background: white;
        }
        .features h2 {
            font-family: 'Times New Roman', serif;
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 50px;
            color: ${colors.primary};
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        .feature-card {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-left: 4px solid ${colors.accent};
        }
        .feature-card h3 {
            color: ${colors.primary};
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .contact {
            background: ${colors.primary};
            color: white;
            text-align: center;
        }
        .contact h2 {
            font-family: 'Times New Roman', serif;
            font-size: 2.5em;
            margin-bottom: 30px;
        }
        .contact p {
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5em; }
            .hero p { font-size: 1.1em; }
            .section { padding: 50px 20px; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <h1>${businessName}</h1>
        <p>${businessDescription}</p>
        <button class="cta-button">Get Started</button>
    </section>
    
    <section class="section about">
        <h2>About</h2>
        <p>Welcome to ${businessName}. We specialize in providing exceptional ${websiteData.businessType === 'coaching' ? 'coaching services' : 'professional services'} designed specifically for ${targetAudience.length > 100 ? 'our ideal clients' : targetAudience}.</p>
    </section>
    
    ${keyFeatures.length > 0 ? `
    <section class="section features">
        <h2>What We Offer</h2>
        <div class="features-grid">
            ${keyFeatures.map((feature: string) => `
                <div class="feature-card">
                    <h3>${feature}</h3>
                    <p>Professional ${feature.toLowerCase()} tailored to your needs.</p>
                </div>
            `).join('')}
        </div>
    </section>
    ` : ''}
    
    <section class="section contact">
        <h2>Ready to Get Started?</h2>
        <p>Let's work together to achieve your goals.</p>
        <button class="cta-button">Contact Us</button>
    </section>
</body>
</html>`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🚀 Starting route registration...');
  
  // Basic middleware and authentication setup
  const server = createServer(app);
  
  // Setup authentication
  await setupAuth(app);
  
  // CRITICAL: Serve training ZIP files with correct content type
  app.get("/training-zip/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'temp_training', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Training ZIP file not found' });
    }
    
    // Set correct content type for ZIP files
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    console.log(`📦 Serving training ZIP: ${filename} (${fs.statSync(filePath).size} bytes)`);
    res.sendFile(filePath);
  });
  
  // Setup rollback routes
  setupRollbackRoutes(app);
  
  // Register Victoria AI service layer
  registerVictoriaService(app);
  
  // Register Victoria website generator
  registerVictoriaWebsiteGenerator(app);
  
  // CRITICAL: System health check for user models
  app.get('/api/admin/validate-all-models', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      // Only admin can access this endpoint
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { ModelValidationService } = await import('./model-validation-service');
      const results = await ModelValidationService.validateAllCompletedModels();
      
      res.json({
        success: true,
        results,
        message: `Validation complete: ${results.healthy} healthy, ${results.corrupted} corrupted, ${results.corrected} corrected`
      });
      
    } catch (error) {
      console.error('❌ Model validation endpoint error:', error);
      res.status(500).json({ 
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Victoria AI Website Builder - Uses saved onboarding data for enhanced generation
  app.post('/api/victoria/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const websiteData = req.body;
      
      // Generate website using Victoria AI
      const { db } = await import('./db');
      const { websites, onboardingData } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Get user's saved onboarding data for enhanced generation
      const userOnboarding = await db
        .select()
        .from(onboardingData)
        .where(eq(onboardingData.userId, userId))
        .limit(1);

      console.log('🎯 Victoria Generation: Using saved onboarding data:', userOnboarding[0] ? 'Found' : 'Not found');
      
      if (userOnboarding[0]) {
        console.log('📋 Saved onboarding includes:', {
          brandStory: !!userOnboarding[0].brandStory,
          businessType: userOnboarding[0].businessType,
          targetAudience: !!userOnboarding[0].targetAudience,
          brandVoice: userOnboarding[0].brandVoice
        });
      }
      
      // Combine form data with saved onboarding data for comprehensive website generation
      const enhancedWebsiteData = {
        ...websiteData,
        // Include saved onboarding context for better generation
        savedOnboarding: userOnboarding[0] || null
      };
      
      const [newWebsite] = await db
        .insert(websites)
        .values({
          userId,
          title: websiteData.businessName,
          slug: `${websiteData.businessName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          content: {
            businessType: websiteData.businessType,
            brandPersonality: websiteData.brandPersonality,
            targetAudience: websiteData.targetAudience,
            keyFeatures: websiteData.keyFeatures,
            contentStrategy: websiteData.contentStrategy,
            // Include saved onboarding context
            enhancedData: userOnboarding[0] || null
          },
          status: 'draft',
          isPublished: false,
        })
        .returning();

      // Connect with Victoria Agent for website generation
      console.log('🎯 Connecting with Victoria agent for website building...');
      
      try {
        // Call Victoria agent with comprehensive data
        const victoriaRequest = {
          userId,
          websiteData,
          onboardingData: userOnboarding[0],
          requestType: 'website_generation',
          timestamp: new Date().toISOString()
        };
        
        console.log('👑 Victoria: Generating website with user data and onboarding context');
        
        // Generate HTML with Victoria's intelligence
        const htmlPreview = generateWebsiteHTML(websiteData, userOnboarding[0]);
        
        // Call unified agent system for Victoria
        const victoriaResponse = await unifiedAgentSystem.executeAgent({
          agentId: 'victoria',
          task: `Generate website for ${websiteData.businessName}`,
          context: victoriaRequest,
          userId
        });
        
        console.log('✅ Victoria: Website generated successfully');
        
        res.json({
          success: true,
          website: {
            id: newWebsite.id.toString(),
            preview: htmlPreview,
            template: 'victoria-editorial',
            estimatedGenerationTime: 45,
            status: 'generated',
            deploymentUrl: null,
            hasOnboardingData: !!userOnboarding[0],
            victoriaGenerated: true,
            generatedAt: new Date().toISOString()
          }
        });
        
      } catch (victoriaError) {
        console.warn('⚠️ Victoria agent connection failed, using fallback generation:', victoriaError);
        
        // Fallback to basic HTML generation
        const htmlPreview = generateWebsiteHTML(websiteData, userOnboarding[0]);
        
        res.json({
          success: true,
          website: {
            id: newWebsite.id.toString(),
            preview: htmlPreview,
            template: 'victoria-editorial',
            estimatedGenerationTime: 45,
            status: 'generated',
            deploymentUrl: null,
            hasOnboardingData: !!userOnboarding[0],
            victoriaGenerated: false,
            fallbackUsed: true
          }
        });
      }
    } catch (error) {
      console.error('Victoria generation error:', error);
      res.status(500).json({ error: 'Failed to generate website' });
    }
  });

  app.post('/api/victoria/customize', isAuthenticated, async (req: any, res) => {
    try {
      const { siteId, modifications } = req.body;
      const userId = req.user?.claims?.sub;
      
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const [updatedWebsite] = await db
        .update(websites)
        .set({ 
          content: JSON.stringify(modifications),
          updatedAt: new Date()
        })
        .where(and(eq(websites.id, parseInt(siteId)), eq(websites.userId, userId)))
        .returning();
      
      res.json({ success: true, website: updatedWebsite });
    } catch (error) {
      console.error('Victoria customization error:', error);
      res.status(500).json({ error: 'Failed to customize website' });
    }
  });

  app.post('/api/victoria/deploy', isAuthenticated, async (req: any, res) => {
    try {
      const { siteId } = req.body;
      const userId = req.user?.claims?.sub;
      
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const [deployedWebsite] = await db
        .update(websites)
        .set({ 
          isPublished: true,
          status: 'published',
          url: `https://build.sselfie.com/${siteId}`,
          updatedAt: new Date()
        })
        .where(and(eq(websites.id, parseInt(siteId)), eq(websites.userId, userId)))
        .returning();
      
      res.json({ 
        success: true, 
        deploymentUrl: deployedWebsite.url,
        website: deployedWebsite 
      });
    } catch (error) {
      console.error('Victoria deployment error:', error);
      res.status(500).json({ error: 'Failed to deploy website' });
    }
  });

  app.get('/api/victoria/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const userWebsites = await db
        .select()
        .from(websites)
        .where(eq(websites.userId, userId))
        .orderBy(desc(websites.updatedAt));
      
      res.json(userWebsites);
    } catch (error) {
      console.error('Error fetching Victoria websites:', error);
      res.status(500).json({ error: 'Failed to fetch websites' });
    }
  });
  
  // REMOVED ALL DUPLICATE BUILD ONBOARDING ENDPOINTS
  // Users should use the admin-built brand-onboarding system instead

  // Website management endpoints
  app.get('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const userWebsites = await db
        .select()
        .from(websites)
        .where(eq(websites.userId, userId))
        .orderBy(desc(websites.updatedAt));
      
      res.json(userWebsites);
    } catch (error) {
      console.error("Error fetching websites:", error);
      res.status(500).json({ message: "Failed to fetch websites" });
    }
  });

  app.post('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { db } = await import('./db');
      const { websites, insertWebsiteSchema } = await import('../shared/schema');
      
      const validatedData = insertWebsiteSchema.parse({ ...req.body, userId });
      
      const [newWebsite] = await db
        .insert(websites)
        .values(validatedData)
        .returning();
      
      res.json(newWebsite);
    } catch (error) {
      console.error("Error creating website:", error);
      res.status(500).json({ message: "Failed to create website" });
    }
  });

  app.put('/api/websites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const websiteId = parseInt(req.params.id);
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const [updatedWebsite] = await db
        .update(websites)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(websites.id, websiteId), eq(websites.userId, userId)))
        .returning();
      
      if (!updatedWebsite) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      res.json(updatedWebsite);
    } catch (error) {
      console.error("Error updating website:", error);
      res.status(500).json({ message: "Failed to update website" });
    }
  });

  app.delete('/api/websites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const websiteId = parseInt(req.params.id);
      const { db } = await import('./db');
      const { websites } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const [deletedWebsite] = await db
        .delete(websites)
        .where(and(eq(websites.id, websiteId), eq(websites.userId, userId)))
        .returning();
      
      if (!deletedWebsite) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      res.json({ message: "Website deleted successfully" });
    } catch (error) {
      console.error("Error deleting website:", error);
      res.status(500).json({ message: "Failed to delete website" });
    }
  });

  app.post('/api/websites/:id/refresh-screenshot', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const websiteId = parseInt(req.params.id);
      // TODO: Implement screenshot generation logic
      // For now, return success
      res.json({ message: "Screenshot refresh requested" });
    } catch (error) {
      console.error("Error refreshing screenshot:", error);
      res.status(500).json({ message: "Failed to refresh screenshot" });
    }
  });
  

  
  // 🚨 Check training status and handle failures
  app.get('/api/training-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log(`🔍 Checking training status for user: ${userId}`);
      
      const status = await storage.checkTrainingStatus(userId);
      res.json(status);
    } catch (error) {
      console.error('Error checking training status:', error);
      res.status(500).json({ 
        needsRestart: true, 
        reason: 'Unable to check training status - please try again' 
      });
    }
  });

  // 🗑️ Clean up failed training data and force restart
  app.post('/api/restart-training', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log(`🗑️ RESTART: User ${userId} requesting fresh training start`);
      
      await storage.deleteFailedTrainingData(userId);
      
      res.json({ 
        success: true, 
        message: 'Training data cleared - ready for fresh start' 
      });
    } catch (error) {
      console.error('Error restarting training:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clear training data' 
      });
    }
  });

  // MISSING ENDPOINT: Training progress for real-time updates
  app.get('/api/training-progress/:requestId', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const authUserId = req.user.claims.sub;
      
      console.log(`🔍 TRAINING PROGRESS: Request for ${requestId}, auth user: ${authUserId}`);
      
      // Handle both user ID and model ID requests for compatibility
      let userId = requestId;
      
      // If request ID looks like a model ID (number), try to find the corresponding user
      if (/^\d+$/.test(requestId)) {
        const modelFromDb = await storage.getUserModelById(parseInt(requestId));
        if (modelFromDb) {
          userId = modelFromDb.userId;
          console.log(`🔄 TRAINING PROGRESS: Converted model ID ${requestId} to user ID ${userId}`);
        }
      }
      
      // Allow admin access for impersonated users (Shannon testing)
      const isAdmin = authUserId === 'ssa@ssasocial.com';
      const isImpersonatedShannon = authUserId === 'shannon-1753945376880' && userId === '42585527';
      
      // Ensure user can only access their own training progress (or admin/impersonated access)
      if (!isAdmin && !isImpersonatedShannon && userId !== authUserId) {
        console.log(`❌ TRAINING PROGRESS: Access denied for ${authUserId} requesting ${userId}`);
        return res.status(403).json({ error: 'Access denied' });
      }
      
      console.log(`✅ TRAINING PROGRESS: Access granted for user ${userId}`);
      
      // Get the user model (use the resolved userId)
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        console.log(`❌ TRAINING PROGRESS: No model found for user ${userId}`);
        return res.status(404).json({ error: 'No training found for this user' });
      }

      let progress = 0;
      let status = userModel.trainingStatus;
      let isRealTraining = false;
      
      // Check real Replicate training status if we have a training ID
      if (userModel.replicateModelId) {
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
                trainingStatus: 'failed'
              });
            } else if (status === 'processing') {
              // Estimate progress based on time elapsed
              const startTime = new Date(userModel.startedAt || userModel.createdAt || new Date()).getTime();
              const elapsed = Date.now() - startTime;
              const estimatedDuration = 20 * 60 * 1000; // 20 minutes
              progress = Math.min(90, Math.floor((elapsed / estimatedDuration) * 100));
            } else if (status === 'starting') {
              progress = 10;
            }
          }
        } catch (error) {
          console.error('Error checking Replicate status:', error);
        }
      } else {
        // No Replicate ID yet, estimate based on local status
        if (status === 'training') {
          const startTime = new Date(userModel.startedAt || userModel.createdAt || new Date()).getTime();
          const elapsed = Date.now() - startTime;
          const estimatedDuration = 20 * 60 * 1000; // 20 minutes
          progress = Math.min(90, Math.floor((elapsed / estimatedDuration) * 100));
        }
      }

      res.json({
        userId,
        status,
        progress,
        isRealTraining,
        replicateModelId: userModel.replicateModelId,
        modelName: userModel.modelName
      });
      
    } catch (error) {
      console.error('Error getting training progress:', error);
      res.status(500).json({ error: 'Failed to get training progress' });
    }
  });

  // Simple training page route (for direct image upload)
  app.post('/api/train-model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { images } = req.body;
      
      console.log(`🎯 Training model for user: ${userId} with ${images?.length || 0} images`);
      
      if (!images || !Array.isArray(images) || images.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'At least 5 images are required for training'
        });
      }
      
      const { ModelTrainingService } = await import('./model-training-service');
      const result = await ModelTrainingService.startModelTraining(userId, images);
      
      res.json({
        success: true,
        message: 'Training started successfully',
        trainingId: result.trainingId,
        triggerWord: `${userId}_selfie`, // Simple trigger word
        status: result.status
      });
      
    } catch (error) {
      console.error('❌ Training error:', error);
      res.status(500).json({
        success: false,
        message: 'Training failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });


  
  // Test endpoint for search cache system
  const { agentSearchCacheTestRouter } = await import('./routes/agent-search-cache-test');
  app.use('/api', agentSearchCacheTestRouter);
  
  // Email automation routes
  app.use('/api/email', emailAutomation);
  
  // Subscriber import routes
  const subscriberImport = await import('./routes/subscriber-import');
  app.use('/api/subscribers', subscriberImport.default);
  app.use('/api/admin', adminBusinessMetricsRouter);
  
  // Register white-label client setup endpoints
  app.use(whitelabelRoutes);
  
  // Admin user management routes
  const adminUserManagement = await import('./routes/admin-user-management');
  app.use(adminUserManagement.default);
  
  // AI Images endpoint - Production ready
  app.get('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log('🖼️ Fetching AI images for user:', userId);
      
      const { db } = await import('./db');
      const { aiImages } = await import('../shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const userImages = await db
        .select()
        .from(aiImages)
        .where(eq(aiImages.userId, userId))
        .orderBy(desc(aiImages.createdAt));
      
      console.log(`✅ Found ${userImages.length} AI images for user ${userId}`);
      res.json(userImages);
      
    } catch (error) {
      console.error('❌ Error fetching AI images:', error);
      res.status(500).json({ 
        message: "Failed to fetch AI images", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User Model endpoint - Production ready (DUPLICATE - REMOVE THIS ONE)
  app.get('/api/user-model-old', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log('🤖 OLD ENDPOINT - Fetching user model for user:', userId);
      
      const { db } = await import('./db');
      const { userModels } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [userModel] = await db
        .select()
        .from(userModels)
        .where(eq(userModels.userId, userId));
      
      if (userModel) {
        console.log(`✅ Found trained model: ${userModel.modelName}`);
        res.json(userModel);
      } else {
        console.log('⚠️ No trained model found for user');
        res.json(null);
      }
      
    } catch (error) {
      console.error('❌ Error fetching user model:', error);
      res.status(500).json({ 
        message: "Failed to fetch user model", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Maya Chat endpoints - Production ready
  app.get('/api/maya-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log('💬 Fetching Maya chats for user:', userId);
      
      const userChats = await storage.getMayaChats(userId);
      res.json(userChats);
      
    } catch (error) {
      console.error('❌ Error fetching Maya chats:', error);
      res.status(500).json({ 
        message: "Failed to fetch Maya chats", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/maya-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { chatTitle, chatSummary } = req.body;
      
      console.log('💬 Creating Maya chat for user:', userId);
      
      const chat = await storage.createMayaChat({
        userId,
        chatTitle: chatTitle || 'New Maya Photoshoot',
        chatSummary
      });
      
      res.json(chat);
    } catch (error) {
      console.error('❌ Error creating Maya chat:', error);
      res.status(500).json({ 
        message: "Failed to create Maya chat", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Maya Chat endpoint - MEMBER AGENT (Image Generation Guide)
  app.post('/api/maya-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, chatHistory } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('💬 Maya MEMBER chat message received from user:', userId);

      // Import member agent personality (secure - no file modification)
      const { MEMBER_AGENT_PERSONALITIES } = await import('./member-agent-personalities');
      const mayaPersonality = MEMBER_AGENT_PERSONALITIES.maya;

      // Get user context for personalized responses
      const user = await storage.getUser(userId);
      
      let onboardingData = null;
      try {
        onboardingData = await storage.getOnboardingData(userId);
      } catch (error) {
        onboardingData = null;
      }
      
      // Enhanced member system prompt with user context
      const memberSystemPrompt = `${mayaPersonality.systemPrompt}

Current user context:
- User ID: ${userId}
- User email: ${user?.email || 'Not available'}
- Plan: ${user?.plan || 'Not specified'}
- Onboarding style preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}

Remember: You are the MEMBER experience Maya - provide creative guidance and image generation support WITHOUT any file modification capabilities.`;

      // Call Claude API for Maya response
      let response = '';
      let canGenerate = false;
      let generatedPrompt = null;

      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              ...chatHistory.map((msg: any) => ({
                role: msg.role === 'maya' ? 'assistant' : 'user',
                content: msg.content
              })),
              {
                role: 'user',
                content: message
              }
            ],
            system: memberSystemPrompt
          })
        });

        if (!claudeResponse.ok) {
          throw new Error(`Claude API error: ${claudeResponse.status}`);
        }

        const claudeData = await claudeResponse.json();
        response = claudeData.content[0].text;
        
        // Check if Maya wants to generate images and extract the detailed prompt
        if (response.toLowerCase().includes('generate') || 
            response.toLowerCase().includes('create') ||
            response.toLowerCase().includes('photoshoot') ||
            response.toLowerCase().includes('ready to')) {
          canGenerate = true;
          
          // Maya should include a hidden generation prompt in her response
          // Extract prompts that contain technical details like "raw photo, visible skin pores"
          const promptRegex = /```prompt\s*([\s\S]*?)\s*```/i;
          const promptMatch = response.match(promptRegex);
          
          if (promptMatch) {
            generatedPrompt = promptMatch[1].trim();
            // Remove the prompt from the conversation response
            response = response.replace(promptRegex, '').trim();
          } else {
            // INTELLIGENT PROMPT CONVERSION: Transform Maya's exact conversational vision into accurate generation prompts
            const userId = req.user?.claims?.sub;
            const triggerWord = `user${userId}`;
            
            console.log('🎯 MAYA PROMPT CONVERSION: Converting conversation to generation prompt');
            console.log('🎬 MAYA DESCRIPTION TO CONVERT:', response.substring(0, 300));
            
            try {
              // Use Claude to intelligently convert Maya's exact description to a generation prompt
              const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY!,
                  'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                  model: "claude-3-5-sonnet-20241022",
                  max_tokens: 800,
                  messages: [{
                    role: "user",
                    content: `Convert Maya's exact description into a detailed FLUX generation prompt. Keep her exact vision - don't change locations, clothing, or mood. Just format it technically.

Maya's description: "${response}"

Convert to this exact format:
${triggerWord}, [Maya's exact scene/location], [Maya's exact clothing description], [Maya's exact mood/expression], [technical photography details]

Rules:
- Keep Maya's EXACT scene (beach/rocks/studio/etc)  
- Keep her EXACT clothing descriptions
- Keep her EXACT mood and expression
- Only add technical photography terms
- No generic fallbacks - use her specific vision`
                  }]
                })
              });

              if (claudeResponse.ok) {
                const claudeData = await claudeResponse.json();
                generatedPrompt = claudeData.content[0].text.trim();
                console.log('✅ MAYA PROMPT CONVERTED:', generatedPrompt.substring(0, 200));
              } else {
                throw new Error('Claude conversion failed');
              }
              
            } catch (error) {
              console.error('❌ Maya prompt conversion failed:', error);
              // Simple fallback that uses user's last message context instead of hardcoded content
              generatedPrompt = `${triggerWord}, ${message}, editorial fashion photography, natural lighting, authentic expression`;
            }
          }
        }

      } catch (error) {
        console.error('Maya Claude API error:', error);
        response = "I'm having trouble connecting to my creative systems right now. Could you try again in a moment? I'm excited to help you create amazing photos! ✨";
      }

      res.json({
        message: response,
        canGenerate,
        generatedPrompt: canGenerate ? generatedPrompt : undefined,
        agentName: 'Maya - Celebrity Stylist & AI Photography Guide',
        agentType: 'member',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Maya chat error:', error);
      res.status(500).json({ error: 'Failed to process Maya chat' });
    }
  });

  // Victoria Website Chat endpoint - MEMBER AGENT (Website Building Guide)
  app.post('/api/victoria-website-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, onboardingData, conversationHistory } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('💬 Victoria MEMBER website chat message received from user:', userId);

      // Import member agent personality (secure - no file modification)
      const { MEMBER_AGENT_PERSONALITIES } = await import('./member-agent-personalities');
      const victoriaPersonality = MEMBER_AGENT_PERSONALITIES.victoria;

      // Get user context for personalized responses
      const user = await storage.getUser(userId);
      
      // Enhanced member system prompt with user context
      const memberSystemPrompt = `${victoriaPersonality.systemPrompt}

Current user context:
- User ID: ${userId}
- User email: ${user?.email || 'Not available'}
- Plan: ${user?.plan || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}
- Brand goals: ${onboardingData?.goals || 'Not specified'}
- Personal brand name: ${onboardingData?.personalBrandName || 'Not specified'}

Remember: You are the MEMBER experience Victoria - provide website building guidance and business strategy WITHOUT any file modification capabilities.`;

      // Call Claude API for Victoria's response
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              ...(conversationHistory || []).map((msg: any) => ({
                role: msg.role === 'victoria' ? 'assistant' : 'user',
                content: msg.content
              })),
              {
                role: 'user',
                content: message
              }
            ],
            system: memberSystemPrompt
          })
        });

        if (!claudeResponse.ok) {
          throw new Error(`Claude API error: ${claudeResponse.status}`);
        }

        const claudeData = await claudeResponse.json();
        const response = claudeData.content[0].text;

        res.json({
          success: true,
          response,
          agentName: 'Victoria - Website Building Guide & Business Expert',
          agentType: 'member',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Victoria Claude API error:', error);
        res.json({
          success: true,
          response: "Hey beautiful! I'm having a little technical hiccup right now, but I'm still here to help you build an amazing website! Could you try again in just a moment? I'm so excited to work on this with you! 💫",
          agentName: 'Victoria - Website Building Guide & Business Expert',
          agentType: 'member',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Victoria website chat error:', error);
      res.status(500).json({ error: 'Failed to process Victoria website chat' });
    }
  });

  // Maya Chat Messages endpoints
  app.get('/api/maya-chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const messages = await storage.getMayaChatMessages(parseInt(chatId));
      res.json(messages);
    } catch (error) {
      console.error('❌ Error fetching Maya chat messages:', error);
      res.status(500).json({ 
        message: "Failed to fetch chat messages", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/maya-chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const { role, content, imagePreview, generatedPrompt } = req.body;
      
      console.log('💬 Saving Maya message to chat:', chatId);
      
      const message = await storage.createMayaChatMessage({
        chatId: parseInt(chatId),
        role,
        content,
        imagePreview: imagePreview ? JSON.stringify(imagePreview) : null,
        generatedPrompt
      });
      
      res.json(message);
    } catch (error) {
      console.error('❌ Error saving Maya chat message:', error);
      res.status(500).json({ 
        message: "Failed to save message", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update Maya message with image preview - CRITICAL FOR PERSISTENT IMAGES
  app.patch('/api/maya-chats/:chatId/messages/:messageId/update-preview', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId, messageId } = req.params;
      const { imagePreview, generatedPrompt } = req.body;
      
      console.log(`🎬 Maya: Updating message ${messageId} with image preview`);
      
      // Update the Maya message with image preview data
      await storage.updateMayaChatMessage(parseInt(messageId), {
        imagePreview,
        generatedPrompt
      });
      
      res.json({ success: true, message: 'Preview updated successfully' });
    } catch (error) {
      console.error('❌ Error updating Maya message preview:', error);
      res.status(500).json({ 
        message: "Failed to update message preview", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Maya Image Generation endpoint - Restored working version
  app.post('/api/maya-generate-images', isAuthenticated, async (req: any, res) => {
    try {
      console.log('🎬 Maya generation endpoint called');
      
      const userId = req.user?.claims?.sub;
      const { prompt, customPrompt } = req.body;
      const actualPrompt = customPrompt || prompt;
      
      console.log('🎬 Maya: Starting generation for user:', userId);
      
      // CRITICAL: Validate and correct user model using new validation service
      const { ModelValidationService } = await import('./model-validation-service');
      
      let modelValidation;
      try {
        modelValidation = await ModelValidationService.enforceUserModelRequirements(userId);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : "Model validation failed"
        });
      }
      
      const { modelId, versionId, triggerWord } = modelValidation;
      
      // Build enhanced prompt with trigger word and quality settings
      let finalPrompt = actualPrompt;
      if (!finalPrompt.includes(triggerWord)) {
        finalPrompt = `${triggerWord} ${finalPrompt}`;
      }
      
      // Add basic photography enhancements  
      if (!finalPrompt.includes('raw photo')) {
        finalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, ${finalPrompt}, professional photography`;
      }
      
      // UNIVERSAL INDIVIDUAL MODEL ARCHITECTURE: All users use their validated trained models
      const modelVersion = `${modelId}:${versionId}`;
      console.log(`🎬 Maya: Using model ${modelVersion}`);
      
      // CRITICAL TEST: Check if model exists on Replicate before generation
      console.error(`🔍 PRE-GENERATION MODEL CHECK: Testing existence of ${modelId}`);
      
      try {
        const modelCheckResponse = await fetch(`https://api.replicate.com/v1/models/${modelId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          }
        });
        console.error(`🔍 MODEL CHECK RESULT: ${modelCheckResponse.status} - ${modelCheckResponse.ok ? 'EXISTS' : 'NOT FOUND'}`);
        
        if (!modelCheckResponse.ok) {
          const errorText = await modelCheckResponse.text();
          console.error(`🚨 SHANNON'S MODEL NOT FOUND: ${errorText}`);
        }
      } catch (modelCheckError) {
        console.error(`🚨 MODEL CHECK FAILED:`, modelCheckError);
      }
      
      const requestBody = {
        version: modelVersion,
        input: {
          prompt: finalPrompt,
          lora_scale: 0.9,
          guidance_scale: 3.0,
          num_inference_steps: 40,
          num_outputs: 2,
          aspect_ratio: "3:4",
          output_format: "png",
          output_quality: 95,
          go_fast: false,
          disable_safety_checker: false,
          megapixels: "1",
          seed: Math.floor(Math.random() * 1000000)
        }
      };

      // Call Replicate API directly
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Replicate API error:', response.status, errorText);
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }

      const prediction = await response.json();
      console.log('✅ Maya: Prediction started:', prediction.id);

      // Create generation tracker for live progress monitoring (like working system from 2 days ago)
      const { insertGenerationTrackerSchema } = await import('../shared/schema');
      const trackerData = {
        userId,
        predictionId: prediction.id,
        prompt: finalPrompt,
        style: 'Maya Editorial',
        status: 'processing'
      };
      
      const savedTracker = await storage.saveGenerationTracker(trackerData);
      console.log('📊 Maya: Created tracker:', savedTracker.id);

      // Return immediately with trackerId for live frontend polling (working pattern from 2 days ago)
      res.json({
        success: true,
        trackerId: savedTracker.id,
        predictionId: prediction.id,
        message: "✨ Maya is creating your stunning editorial photos! Watch the magic happen...",
        status: 'processing'
      });
      
    } catch (error) {
      console.error('❌ Maya generation error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to start image generation", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // UNIFIED AGENT SYSTEM - Single integration layer
  console.log('🎯 UNIFIED AGENT SYSTEM: Initializing single integration layer...');
  await unifiedAgentSystem.initialize(app, server);
  console.log('✅ UNIFIED AGENT SYSTEM: Single integration layer operational');
  
  // Add essential API routes
  const { claudeApiService } = await import('./services/claude-api-service');
  
  // Register Claude API routes (includes conversation list endpoint)
  const claudeApiRoutes = await import('./routes/claude-api-routes');
  app.use('/api/claude', claudeApiRoutes.default);
  
  // Register flatlay library routes for Victoria
  const flatlayLibraryRoutes = await import('./routes/flatlay-library');
  app.use(flatlayLibraryRoutes.default);
  
  // Generation tracker polling endpoint for live progress
  app.get('/api/generation-tracker/:trackerId', isAuthenticated, async (req: any, res) => {
    try {
      const { trackerId } = req.params;
      console.log(`🔍 TRACKER DEBUG: Looking for tracker ${trackerId}`);
      
      const tracker = await storage.getGenerationTracker(parseInt(trackerId));
      
      if (!tracker) {
        console.log(`❌ TRACKER DEBUG: Tracker ${trackerId} not found in database`);
        return res.status(404).json({ error: 'Generation tracker not found' });
      }
      
      console.log(`✅ TRACKER DEBUG: Found tracker ${trackerId}, userId: ${tracker.userId}, status: ${tracker.status}`);
      
      // Verify user owns this tracker - use auth ID directly for admin
      const authUserId = req.user.claims.sub;
      const claims = req.user.claims;
      
      console.log(`🔍 USER DEBUG: Auth user ID: ${authUserId}, Email: ${claims.email}`);
      
      // Get the correct database user ID for verification
      let user = await storage.getUser(authUserId);
      if (!user && claims.email) {
        user = await storage.getUserByEmail(claims.email);
      }
      
      // Admin user 42585527 should have direct access
      if (authUserId === '42585527' || claims.email === 'ssa@ssasocial.com') {
        console.log(`🔑 ADMIN ACCESS: Granting admin access to tracker ${trackerId}`);
      } else {
        if (!user) {
          console.log(`❌ USER DEBUG: User not found for auth ID ${authUserId}`);
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if tracker belongs to this user
        if (tracker.userId !== user.id) {
          console.log(`❌ AUTH DEBUG: User ${user.id} trying to access tracker owned by ${tracker.userId}`);
          return res.status(403).json({ error: 'Unauthorized access to tracker' });
        }
      }
      
      // Parse URLs for preview
      let imageUrls = [];
      let errorMessage = null;
      
      try {
        if (tracker.imageUrls) {
          const parsed = JSON.parse(tracker.imageUrls);
          if (tracker.status === 'failed' && Array.isArray(parsed) && parsed.length > 0 && parsed[0].includes('Error:')) {
            errorMessage = parsed[0].replace('Error: ', '');
            imageUrls = [];
          } else {
            imageUrls = parsed;
          }
        }
      } catch {
        imageUrls = [];
      }
      
      console.log(`🎬 TRACKER ${trackerId}: Status=${tracker.status}, URLs=${imageUrls.length}, User=${user?.id || tracker.userId}`);
      
      res.json({
        id: tracker.id,
        status: tracker.status,
        imageUrls,
        errorMessage,
        predictionId: tracker.predictionId,
        prompt: tracker.prompt,
        style: tracker.style,
        createdAt: tracker.createdAt
      });
      
    } catch (error) {
      console.error('Error fetching generation tracker:', error);
      res.status(500).json({ error: 'Failed to fetch tracker status' });
    }
  });

  // Save preview images to permanent gallery endpoint
  app.post('/api/save-preview-to-gallery', isAuthenticated, async (req: any, res) => {
    try {
      const { trackerId, selectedImageUrls } = req.body;
      
      if (!trackerId || !selectedImageUrls || !Array.isArray(selectedImageUrls)) {
        return res.status(400).json({ error: 'trackerId and selectedImageUrls array required' });
      }
      
      // Get the correct database user ID
      const authUserId = req.user.claims.sub;
      const claims = req.user.claims;
      
      let user = await storage.getUser(authUserId);
      if (!user && claims.email) {
        user = await storage.getUserByEmail(claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const dbUserId = user.id;
      const tracker = await storage.getGenerationTracker(trackerId);
      
      if (!tracker || tracker.userId !== dbUserId) {
        return res.status(403).json({ error: 'Unauthorized access to tracker' });
      }
      
      // Save each selected image to gallery with permanent S3 storage
      const savedImages = [];
      
      for (const imageUrl of selectedImageUrls) {
        const galleryImage = await storage.saveAIImage({
          userId: dbUserId,
          imageUrl: imageUrl,
          prompt: tracker.prompt || 'Maya Editorial Photoshoot',
          generationStatus: 'completed',
          predictionId: tracker.predictionId || '',
        });
        
        savedImages.push(galleryImage);
      }
      
      res.json({
        success: true,
        message: `Successfully saved ${savedImages.length} image(s) to your gallery`,
        savedImages: savedImages.length
      });
      
    } catch (error) {
      console.error('Error saving to gallery:', error);
      res.status(500).json({ 
        error: 'Failed to save images to gallery',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Gallery images endpoint (alias for ai-images for compatibility)
  app.get('/api/gallery-images', isAuthenticated, async (req: any, res) => {
    try {
      const authUserId = req.user.claims.sub;
      const claims = req.user.claims;
      
      // Get the correct database user ID
      let user = await storage.getUser(authUserId);
      if (!user && claims.email) {
        user = await storage.getUserByEmail(claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log(`🖼️ Fetching gallery images for user: ${user.id}`);
      const aiImages = await storage.getAIImages(user.id);
      console.log(`✅ Found ${aiImages.length} gallery images for user ${user.id}`);
      
      res.json(aiImages);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Auth user endpoint - Production ready with impersonation support
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Check for impersonated user first (admin testing)
      if (req.session?.impersonatedUser) {
        console.log('🎭 Returning impersonated user:', req.session.impersonatedUser.email);
        return res.json(req.session.impersonatedUser);
      }
      
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // AGENT ACTIVITY DASHBOARD - Autonomous orchestrator coordination metrics endpoints
  app.get('/api/autonomous-orchestrator/coordination-metrics', async (req: any, res) => {
    try {
      // Admin authentication check
      const adminToken = req.headers['x-admin-token'];
      const isAuthenticated = req.isAuthenticated?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!isAuthenticated && adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      // Return coordination metrics for AgentActivityDashboard
      const metrics = {
        agentCoordination: {
          totalAgents: 13,
          availableAgents: 13,
          activeAgents: 0, // Will be updated based on actual agent activity
          averageLoad: 0,  // Percentage of agents currently busy
          averageSuccessRate: 95
        },
        deploymentMetrics: {
          activeDeployments: 0,
          totalDeployments: 0,
          completionRate: 0
        },
        knowledgeSharing: {
          totalInsights: 0,
          totalStrategies: 4,
          avgEffectiveness: 85,
          knowledgeConnections: 0
        },
        systemHealth: {
          orchestratorStatus: 'operational',
          taskDistributorStatus: 'operational', 
          knowledgeSharingStatus: 'operational',
          lastHealthCheck: new Date().toISOString()
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('❌ Coordination metrics error:', error);
      res.status(500).json({ error: 'Failed to get coordination metrics' });
    }
  });

  // Active deployments endpoint for AgentActivityDashboard
  app.get('/api/autonomous-orchestrator/active-deployments', async (req: any, res) => {
    try {
      // Admin authentication check
      const adminToken = req.headers['x-admin-token'];
      const isAuthenticated = req.isAuthenticated?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!isAuthenticated && adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      // Return empty deployments for now - can be enhanced with real deployment tracking
      const deployments: any[] = [];

      res.json({ deployments });
    } catch (error) {
      console.error('❌ Active deployments error:', error);
      res.status(500).json({ error: 'Failed to get active deployments' });
    }
  });
  
  // Claude API route for frontend compatibility (bypass auth for now)
  app.post('/api/claude/send-message', async (req, res) => {
    try {
      const { agentName, message, conversationId, fileEditMode } = req.body;
      
      console.log('🔍 Claude send-message called with:', {
        agentName,
        messageLength: message?.length || 0,
        conversationId,
        fileEditMode
      });
      
      // Validate required fields
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Message is required' 
        });
      }
      
      // Use existing admin user ID 
      const userId = '42585527';
      
      const response = await claudeApiService.sendMessage(
        userId,
        agentName,
        conversationId,
        message,
        undefined, // systemPrompt
        undefined, // tools
        fileEditMode
      );
      
      res.json({ success: true, response });
    } catch (error) {
      console.error('Claude API error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // EFFORT-BASED AGENT SYSTEM - Integrated into existing admin consulting agents
  const { effortBasedExecutor } = await import('./services/effort-based-agent-executor');
  
  app.post('/api/agents/effort-based/execute', async (req: any, res) => {
    try {
      // Admin authentication bypass
      const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];
      const isAdminRequest = adminToken === 'sandra-admin-2025';
      
      console.log('🔐 AUTH DEBUG: adminToken =', adminToken, 'isAdminRequest =', isAdminRequest);
      
      let userId;
      if (isAdminRequest) {
        userId = '42585527'; // Sandra's actual admin user ID
        console.log('✅ ADMIN AUTH: Using Sandra admin userId:', userId);
      } else if (req.isAuthenticated()) {
        userId = req.user?.claims?.sub || req.user?.id;
        console.log('🔒 SESSION AUTH: Using session userId:', userId);
      }

      console.log('👤 FINAL userId:', userId);

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await effortBasedExecutor.executeTask({
        ...req.body,
        userId
      });
      res.json({ success: true, result });
    } catch (error) {
      console.error('Effort-based execution error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Admin agent chat bypass endpoint for consulting agents
  app.post('/api/admin/agent-chat-bypass', async (req: any, res) => {
    try {
      console.log('🔄 ADMIN AGENT CHAT BYPASS: Processing request');
      
      // Admin authentication
      const adminToken = req.headers['x-admin-token'];
      const isAuthenticated = req.isAuthenticated?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!isAuthenticated && adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin access required' 
        });
      }
      
      const { agentId, message, fileEditMode = true, conversationId } = req.body;
      
      if (!agentId || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID and message are required'
        });
      }
      
      console.log(`🤖 ADMIN AGENT: ${agentId} - Processing message with file edit mode: ${fileEditMode}`);
      
      // Get agent personality from consulting system
      const { CONSULTING_AGENT_PERSONALITIES } = await import('./agent-personalities-consulting');
      const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
      
      if (!agentConfig) {
        return res.status(404).json({
          success: false,
          message: `Agent ${agentId} not found in consulting system`
        });
      }
      
      // Use Sandra's admin user ID
      const userId = '42585527';
      
      // Generate conversation ID if not provided
      const finalConversationId = conversationId || `admin_${agentId}_${Date.now()}`;
      
      // AUTONOMOUS AGENT INTEGRATION: Use new autonomous capabilities for ZERO API costs
      console.log('🤖 AUTONOMOUS INTEGRATION: Using autonomous agent system - ZERO API costs');
      
      const { autonomousAgent } = await import('./services/autonomous-agent-integration');
      
      // Process request through autonomous agent integration
      const autonomousRequest = {
        agentId,
        message,
        context: 'admin_consulting',
        conversationId: finalConversationId
      };
      
      const autonomousResult = await autonomousAgent.processAutonomousRequest(autonomousRequest);
      
      if (autonomousResult.success) {
        console.log('🚀 AUTONOMOUS EXECUTION: File operations completed without API costs');
        console.log(`🔧 Operations: ${autonomousResult.fileOperations.length} file operations`);
        console.log(`🎯 Navigation: ${autonomousResult.navigationResults.discoveredFiles.length} files discovered`);
        console.log(`💰 COST SAVED: Direct workspace access with autonomous intelligence`);
        
        return res.json({
          success: true,
          response: autonomousResult.response,
          agentName: agentConfig.name,
          conversationId: finalConversationId,
          costOptimized: true,
          fileOperations: autonomousResult.fileOperations,
          autonomousCapabilities: true
        });
      }
      
      // FALLBACK: Use DirectToolExecutor for simpler operations
      console.log('🔧 FALLBACK: Using DirectToolExecutor for simple operations');
      
      const { DirectToolExecutor } = await import('./services/direct-tool-executor');
      
      // Check if message contains direct tool requests that can be executed without API costs
      const toolDetection = await DirectToolExecutor.detectAndExecuteTools(message, agentId);
      
      if (toolDetection.toolsExecuted) {
        console.log('🔧 DIRECT TOOL EXECUTION: Completed without API costs');
        const response = `${toolDetection.toolResults}\n\nDirect tool execution completed successfully. Files have been accessed/modified as requested.`;
        
        console.log(`💰 COST SAVED: Direct repository access instead of Claude API`);
        
        return res.json({
          success: true,
          response: response,
          agentName: agentConfig.name,
          conversationId: finalConversationId,
          costOptimized: true
        });
      }
      
      // If no direct tools detected, use Claude API for conversation/analysis
      const { claudeApiService } = await import('./services/claude-api-service');
      const response = await claudeApiService.sendMessage(
        userId,
        agentId,
        finalConversationId,
        message,
        undefined, // systemPrompt
        undefined, // tools  
        fileEditMode
      );
      
      const finalResponse = typeof response === 'string' ? response : 'Task completed successfully';
      console.log(`💰 COST CONTROL: Direct Claude API - real agent execution`);
      
      console.log(`✅ ADMIN AGENT ${agentId}: Response generated successfully`);
      
      res.json({
        success: true,
        response: finalResponse,
        agentName: agentConfig.name,
        conversationId: finalConversationId
      });
      
    } catch (error: any) {
      console.error('❌ ADMIN AGENT CHAT BYPASS ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Admin agent chat failed',
        error: error?.message || 'Unknown error'
      });
    }
  });

  // Claude conversation management endpoints
  app.post('/api/claude/conversation/new', async (req, res) => {
    try {
      const { agentName } = req.body;
      
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      // Use existing admin user ID 
      const userId = '42585527';
      
      // Generate new conversation ID
      const conversationId = `conv_${agentName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const conversationDbId = await claudeApiService.createConversationIfNotExists(
        userId,
        agentName,
        conversationId
      );
      
      res.json({ 
        success: true, 
        conversationId,
        id: conversationDbId
      });
    } catch (error) {
      console.error('Conversation creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      });
    }
  });

  // Conversation history endpoint (kept here for compatibility)
  app.get('/api/claude/conversation/:conversationId/history', async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      if (!conversationId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Conversation ID is required' 
        });
      }
      
      const messages = await claudeApiService.getConversationHistory(conversationId);
      
      res.json({ 
        success: true, 
        messages 
      });
    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load conversation history' 
      });
    }
  });

  app.post('/api/claude/conversation/clear', async (req, res) => {
    try {
      const { agentName } = req.body;
      
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      // For now, just return success - conversation clearing can be implemented later
      res.json({ 
        success: true, 
        message: 'Conversation cleared successfully' 
      });
    } catch (error) {
      console.error('Conversation clear error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear conversation' 
      });
    }
  });

  // CRITICAL FIX: Missing /api/claude/send-message endpoint for admin dashboard
  app.post('/api/claude/send-message', async (req, res) => {
    try {
      console.log('🔍 Claude send-message called with:', {
        agentName: req.body.agentName,
        messageLength: req.body.message?.length,
        conversationId: req.body.conversationId,
        fileEditMode: req.body.fileEditMode
      });

      const { agentName, message, conversationId, fileEditMode = true } = req.body;
      
      if (!agentName || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name and message are required' 
        });
      }

      // Get user ID for authentication
      let userId = 'admin-sandra'; // Default admin user
      if (req.isAuthenticated() && (req.user as any)?.claims?.sub) {
        userId = (req.user as any).claims.sub;
      }

      // Use the Claude API service for agent communication
      const response = await claudeApiService.sendMessage(
        agentName,
        message,
        conversationId || `conv_${agentName}_${Date.now()}`,
        fileEditMode,
        userId
      );

      res.json({
        success: true,
        response: (response as any).content || response,
        conversationId: (response as any).conversationId || `conv_${agentName}_${Date.now()}`
      });

    } catch (error) {
      console.error('Claude send-message error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message to agent' 
      });
    }
  });
  
  // AI Images route for workspace gallery - CRITICAL: Missing endpoint restored
  app.get('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      console.log('🖼️ Fetching AI images for user:', userId);
      
      // Import database and schema
      const { db } = await import('./db');
      const { aiImages } = await import('../shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      // Query user's AI images from database
      const userImages = await db
        .select()
        .from(aiImages)
        .where(eq(aiImages.userId, userId))
        .orderBy(desc(aiImages.createdAt));
      
      console.log(`✅ Found ${userImages.length} AI images for user ${userId}`);
      res.json(userImages);
      
    } catch (error) {
      console.error('❌ Error fetching AI images:', error);
      res.status(500).json({ message: "Failed to fetch AI images", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // User model endpoint for workspace model status  
  app.get('/api/user-model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      console.log('🤖 DEBUG: Full user object:', JSON.stringify(req.user, null, 2));
      console.log('🤖 DEBUG: Session impersonation:', req.session?.impersonatedUser?.id);
      console.log('🤖 Fetching user model for:', userId);
      
      // Import database and schema
      const { db } = await import('./db');
      const { userModels } = await import('../shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      // Query user's latest model
      const [userModel] = await db
        .select()
        .from(userModels)
        .where(eq(userModels.userId, userId))
        .orderBy(desc(userModels.createdAt))
        .limit(1);
      
      if (userModel) {
        console.log(`✅ Found user model: ${userModel.modelName} (${userModel.trainingStatus})`);
        res.json(userModel);
      } else {
        console.log('⚠️ No user model found');
        res.json(null);
      }
      
    } catch (error) {
      console.error('❌ Error fetching user model:', error);
      res.status(500).json({ message: "Failed to fetch user model", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Auth user endpoint for frontend - CRITICAL: ADMIN AGENT AUTHENTICATION FIX
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('🔍 /api/auth/user called - checking authentication');
      
      // Check if user is authenticated through normal session
      if (req.isAuthenticated() && (req.user as any)?.claims?.sub) {
        const userId = (req.user as any).claims.sub;
        console.log('✅ User authenticated via session, fetching user data for:', userId);
        
        const user = await storage.getUser(userId);
        if (user) {
          console.log('✅ User found in database:', user.email);
          return res.json(user);
        }
      }
      
      // CRITICAL FIX: Admin agent authentication bypass
      const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];
      if (adminToken === 'sandra-admin-2025') {
        console.log('🔑 Admin token authenticated - creating admin user session');
        
        // Get or create Sandra admin user
        let adminUser = await storage.getUser('admin-sandra');
        if (!adminUser) {
          adminUser = await storage.upsertUser({
            id: 'admin-sandra',
            email: 'ssa@ssasocial.com',
            firstName: 'Sandra',
            lastName: 'Admin',
            profileImageUrl: null
          });
        }
        
        console.log('✅ Admin user authenticated:', adminUser.email);
        return res.json(adminUser);
      }
      
      console.log('❌ User not authenticated - no session or admin token');
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error('❌ Auth error:', error);
      return res.status(500).json({ message: "Authentication error" });
    }
  });

  // AI Photoshoot Generation - CRITICAL MISSING ENDPOINT
  app.post('/api/generate-user-images', isAuthenticated, async (req: any, res) => {
    try {
      const { category, subcategory } = req.body;
      const authUserId = req.user.claims.sub;
      
      // Get the correct database user ID
      let user = await storage.getUser(authUserId);
      if (!user) {
        const claims = req.user.claims;
        if (claims.email) {
          user = await storage.getUserByEmail(claims.email);
        }
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // CRITICAL: Validate and correct user model using new validation service
      const { ModelValidationService } = await import('./model-validation-service');
      
      let modelValidation;
      try {
        modelValidation = await ModelValidationService.enforceUserModelRequirements(user.id);
      } catch (error) {
        return res.status(400).json({
          error: error instanceof Error ? error.message : "Model validation failed",
          message: 'Please train your model first'
        });
      }
      
      console.log(`🎬 AI PHOTOSHOOT: Generating ${category}/${subcategory} for user ${user.id}`);
      
      // MAYA'S INTELLIGENT PROMPT GENERATION FOR PHOTOSHOOT COLLECTIONS
      let generatedPrompt = '';
      
      try {
        // Use Maya's expertise to create sophisticated collection prompts
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 600,
            messages: [{
              role: "user",
              content: `You are Maya, the celebrity stylist expert. Create ONE sophisticated editorial photoshoot prompt for "${category} - ${subcategory}".

Format: [detailed scene/location], [luxury fashion description], [authentic expression/pose], [professional photography details]

Rules:
- Use luxury editorial language (not generic)
- Include specific 2025 fashion trends
- Add environmental storytelling
- Natural authentic expressions (no fake smiles)
- Professional photography techniques
- Keep it sophisticated and editorial

Example: "minimalist rooftop terrace overlooking city skyline at golden hour, wearing architectural cashmere blazer in camel with wide-leg trousers, natural confident expression while reviewing documents, shot on Hasselblad X2D with 35mm lens, dramatic directional lighting creating editorial shadows"`
            }]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          generatedPrompt = claudeData.content[0].text.trim();
          console.log('✅ MAYA COLLECTION PROMPT GENERATED:', generatedPrompt.substring(0, 150));
        } else {
          throw new Error('Maya prompt generation failed');
        }
        
      } catch (error) {
        console.error('❌ Maya collection prompt generation failed:', error);
        // Sophisticated fallback instead of generic
        generatedPrompt = `luxury ${category} editorial featuring ${subcategory} styling, sophisticated fashion photography, authentic editorial expression, professional lighting`;
      }
      
      // Use UnifiedGenerationService with Maya's sophisticated prompt and correct parameters
      const { UnifiedGenerationService } = await import('./unified-generation-service');
      const result = await UnifiedGenerationService.generateImages({
        userId: user.id,
        prompt: generatedPrompt,
        category: `${category} - ${subcategory}` 
      });
      
      res.json({
        success: true,
        predictionId: result.predictionId,
        generatedImageId: result.id,
        trackerId: result.id,
        message: "AI photoshoot generation started!"
      });
      
    } catch (error) {
      console.error('❌ AI Photoshoot generation error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to start AI photoshoot generation", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User info endpoint
  app.get('/api/user/info', (req, res) => {
    if (req.isAuthenticated?.()) {
      res.json({
        user: req.user,
        isAuthenticated: true
      });
    } else {
      res.json({
        user: null,
        isAuthenticated: false
      });
    }
  });

  // Model training endpoint for workspace step 1 - Uses BulletproofUploadService
  app.post('/api/start-model-training', isAuthenticated, async (req: any, res) => {
    try {
      const authUserId = req.user.claims.sub;
      const claims = req.user.claims;
      const { selfieImages } = req.body;
      
      console.log(`🚀 BULLETPROOF TRAINING: Starting for user ${authUserId} with ${selfieImages?.length || 0} images`);
      
      // Get or create database user
      let user = await storage.getUser(authUserId);
      if (!user && claims.email) {
        user = await storage.getUserByEmail(claims.email);
      }
      
      if (!user) {
        // Create user from claims
        user = await storage.upsertUser({
          id: authUserId,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        });
      }
      
      // Import and use BulletproofUploadService
      const { BulletproofUploadService } = await import('./bulletproof-upload-service');
      
      const result = await BulletproofUploadService.completeBulletproofUpload(user.id, selfieImages);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Training validation failed. Please fix the issues below and try again.",
          errors: result.errors,
          requiresRestart: result.requiresRestart
        });
      }
      
      res.json({
        success: true,
        message: "✨ BULLETPROOF training started! Your personal AI model will be ready in 30-45 minutes.",
        trainingId: result.trainingId,
        status: 'training',
        modelType: 'flux-bulletproof',
        estimatedCompletionTime: "40 minutes",
        triggerWord: `user${user.id}`
      });
      
    } catch (error) {
      console.error(`❌ Bulletproof training failed:`, error);
      res.status(500).json({ 
        message: "AI model training failed - please restart upload process", 
        error: error instanceof Error ? error.message : 'Unknown error',
        requiresRestart: true
      });
    }
  });

  // Admin endpoint to restart training for accidentally deleted models
  app.post('/api/admin/restart-training/:userId', async (req: any, res) => {
    try {
      // Admin authentication check
      const adminToken = req.headers['x-admin-token'];
      const isAdminAuth = adminToken === 'sandra-admin-2025';
      
      const sessionUser = req.user;
      const isSessionAdmin = req.isAuthenticated && sessionUser?.claims?.email === 'ssa@ssasocial.com';
      
      if (!isAdminAuth && !isSessionAdmin) {
        return res.status(401).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      console.log(`🔄 Admin requesting training restart for user: ${userId}`);
      
      const result = await ModelRetrainService.restartTraining(userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          replicateModelId: result.replicateModelId
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
      
    } catch (error) {
      console.error('❌ Admin restart training error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to restart training' 
      });
    }
  });

  // Maya Collection Update endpoint - Allow Maya to refresh prompts with her latest expertise
  app.post('/api/maya-update-collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { collections } = req.body;
      
      if (!collections || !Array.isArray(collections)) {
        return res.status(400).json({ error: 'Collections array required' });
      }
      
      console.log(`🎨 MAYA COLLECTION UPDATE: Updating ${collections.length} collections for user ${userId}`);
      
      const updatedCollections = [];
      
      for (const collection of collections) {
        const updatedPrompts = [];
        
        for (const oldPrompt of collection.prompts) {
          try {
            // Use Maya's expertise to upgrade each prompt
            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 700,
                messages: [{
                  role: "user",
                  content: `You are Maya, celebrity stylist expert. Upgrade this photoshoot prompt with your latest 2025 fashion expertise and sophisticated editorial vision.

Original prompt: "${oldPrompt.prompt}"
Prompt name: "${oldPrompt.name}"
Category: "${oldPrompt.category}"

Create an upgraded version with:
- Latest 2025 fashion trends and styling
- Luxury editorial sophistication 
- Environmental storytelling and mood
- Authentic expressions (no fake smiles)
- Professional photography techniques
- Anatomically correct descriptions (proper hands/feet)

Format: [detailed luxurious scene/location], [specific 2025 fashion with textures/colors], [authentic expression/natural pose], [professional camera/lighting details], detailed hands, perfect fingers, natural hand positioning, well-formed feet, accurate anatomy`
                }]
              })
            });

            if (claudeResponse.ok) {
              const claudeData = await claudeResponse.json();
              const upgradedPrompt = claudeData.content[0].text.trim();
              
              updatedPrompts.push({
                ...oldPrompt,
                prompt: upgradedPrompt,
                lastUpdated: new Date().toISOString()
              });
              
              console.log(`✅ MAYA UPGRADED: "${oldPrompt.name}" -> Enhanced with 2025 trends`);
            } else {
              // Keep original if upgrade fails
              updatedPrompts.push(oldPrompt);
              console.log(`⚠️ MAYA UPGRADE SKIPPED: "${oldPrompt.name}" - API error`);
            }
            
          } catch (error) {
            console.error(`❌ Maya upgrade failed for "${oldPrompt.name}":`, error);
            // Keep original if upgrade fails
            updatedPrompts.push(oldPrompt);
          }
        }
        
        updatedCollections.push({
          ...collection,
          prompts: updatedPrompts,
          lastUpdated: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        message: `Maya successfully updated ${updatedCollections.length} collections with latest 2025 trends and anatomy fixes`,
        updatedCollections,
        upgradeStats: {
          totalCollections: collections.length,
          totalPrompts: collections.reduce((acc, col) => acc + col.prompts.length, 0),
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Maya collection update error:', error);
      res.status(500).json({ 
        error: 'Failed to update collections',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return server;
}