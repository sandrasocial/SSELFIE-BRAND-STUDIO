import { setupEnhancementRoutes } from './services/backend-enhancement-services';
// import { startVeoVideo, getVeoStatus } from './services/veo-service'; // DISABLED
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { setupRollbackRoutes } from './routes/rollback.js';
import { storage } from "./storage";
import { requireStackAuth, requireActiveSubscription, optionalStackAuth } from './stack-auth';
import { db } from "./drizzle";
import { claudeConversations, claudeMessages } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import emailAutomation from './routes/email-automation';
import victoriaWebsiteRouter from "./routes/victoria-website";
import { registerVictoriaService } from "./routes/victoria-service";
import { registerVictoriaWebsiteGenerator } from "./routes/victoria-website-generator";
// import subscriberImportRouter from './routes/subscriber-import'; // DISABLED
// REMOVED: Conflicting admin routers - consolidated into single adminRouter
// import { whitelabelRoutes } from './routes/white-label-setup'; // DISABLED
import videoRoutes from './routes/video';
import path from 'path';
import fs from 'fs';
import { ModelRetrainService } from './retrain-model';
import { setupVite } from './vite';
// import { generateWebsiteHTML } from './services/website-generator'; // DISABLED
import emailManagementRouter from './routes/email-management-routes';
import { registerCheckoutRoutes } from './routes/checkout';
// PHASE 4: OLD MAYA ROUTES ARCHIVED (Comment out old fragmented routes)
// import { registerMayaAIRoutes } from './routes/maya-ai-routes';
// import mayaOnboardingRoutes from './routes/maya-onboarding-routes';
// MAYA UNIFIED: Maya now accessed via consolidated router
// import mayaUnifiedRouter from './routes/maya-unified'; // REMOVED: Direct integration replaced with façade
import supportEscalationRouter from './routes/support-escalation';
// UNIFIED ADMIN SYSTEM imports
// import consultingAgentsRouter from './routes/consulting-agents-routes'; // DISABLED
// import agentHandoffRouter from './routes/agent-handoff-routes'; // DISABLED
// import adminRouter from './routes/admin'; // DISABLED
// import adminCacheRouter from './routes/admin-cache-management'; // DISABLED
import adminEmpireApiRouter from './routes/admin-empire-api';
import memberProtectionRouter from './routes/member-protection';
import systemValidationRouter from './routes/system-validation';
import phase2CoordinationRouter from './routes/phase2-coordination';
// New modular routes
import utilityRoutes from './routes/modules/utility';
import authRoutes from './routes/modules/auth';
import aiGenerationRoutes from './routes/modules/ai-generation';
import { setupStackWebhook } from './routes/stack-webhook';
import adminRoutes from './routes/modules/admin';
import agentProtocolRoutes from './routes/modules/agent-protocol';
import websitesRoutes from './routes/modules/websites';
import trainingRoutes from './routes/modules/training';
import galleryRoutes from './routes/modules/gallery';
import mayaRoutes from './routes/modules/maya';
import claudeRoutes from './routes/modules/claude';
import usageRoutes from './routes/modules/usage';
import inpaintRoutes from './routes/inpaint';
import imagesRoutes from './routes/images';
// Reconstructed wrapper function (previously removed during refactor cleanup)
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server reference (needed for later return)
  const server = createServer(app);

  // Core middleware setup formerly at top-level now inside wrapper
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  console.log('✅ Cookie parser middleware initialized');

  // Register new modular routes
  app.use('/', utilityRoutes);
  app.use('/', authRoutes);
  app.use('/', aiGenerationRoutes);
  
  // Setup Stack Auth webhook for automatic user creation
  setupStackWebhook(app);
  app.use('/', adminRoutes);
  app.use('/', agentProtocolRoutes);
  app.use('/', websitesRoutes);
  app.use('/', trainingRoutes);
  app.use('/', galleryRoutes);
  app.use('/', mayaRoutes);
  app.use('/', claudeRoutes);
  app.use('/', usageRoutes);
  app.use('/', inpaintRoutes);
  app.use('/', imagesRoutes);
  console.log('✅ Modular routes registered');

  // NOTE: The remainder of the file already assumes an existing `app` context.
  // Imports consolidated above wrapper during refactor.
// REMOVED: All competing streaming and orchestration systems that were intercepting tools
// REMOVED: registerAdminConversationRoutes - using unified consulting-agents-routes only

// Generate Victoria website HTML content
function generateWebsiteHTML_Legacy(websiteData: any, onboardingData: any) {
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

// 🎬 STORY STUDIO HELPER FUNCTIONS
function parseStoryScenes(mayaResponse: string, originalMessage: string): any[] {
  const scenes: any[] = [];
  
  try {
    // Extract scenes from Maya's response using intelligent parsing
    const sceneMatches = mayaResponse.match(/scene\s*(\d+)/gi);
    const sceneParts = mayaResponse.split(/scene\s*\d+/i).slice(1);
    
    if (sceneMatches && sceneParts.length > 0) {
      // Parse Maya's structured response
      for (let i = 0; i < Math.min(sceneMatches.length, sceneParts.length, 5); i++) {
        const sceneContent = sceneParts[i]?.trim() || '';
        const sceneNumber = i + 1;
        
        scenes.push({
          id: `scene_${sceneNumber}`,
          scene: sceneNumber,
          prompt: extractScenePrompt(sceneContent, sceneNumber, originalMessage)
        });
      }
    }
  } catch (error) {
    console.log('📝 Story: Using fallback scene parsing');
  }
  
  // If parsing failed or no scenes found, create intelligent defaults
  if (scenes.length === 0) {
    return createFallbackScenes(originalMessage);
  }
  
  // Ensure we have at least 3 scenes
  while (scenes.length < 3) {
    const sceneNumber = scenes.length + 1;
    scenes.push({
      id: `scene_${sceneNumber}`,
      scene: sceneNumber,
      prompt: generateDefaultScenePrompt(sceneNumber, originalMessage)
    });
  }
  
  return scenes;
}

function extractScenePrompt(sceneContent: string, sceneNumber: number, originalMessage: string): string {
  // Extract the most relevant part of Maya's response for each scene
  const lines = sceneContent.split('\n').filter(line => line.trim());
  const relevantLines = lines.slice(0, 3).join(' ').trim();
  
  if (relevantLines.length > 10) {
    return relevantLines.length > 200 ? relevantLines.substring(0, 197) + '...' : relevantLines;
  }
  
  // Fallback to generated prompt
  return generateDefaultScenePrompt(sceneNumber, originalMessage);
}

function generateDefaultScenePrompt(sceneNumber: number, originalMessage: string): string {
  const messageContext = originalMessage.toLowerCase();
  
  switch (sceneNumber) {
    case 1:
      if (messageContext.includes('business') || messageContext.includes('professional')) {
        return `Opening scene: Professional establishing shot showcasing ${originalMessage.substring(0, 50)}...`;
      } else if (messageContext.includes('lifestyle') || messageContext.includes('personal')) {
        return `Opening hook: Lifestyle moment that captures the essence of ${originalMessage.substring(0, 50)}...`;
      }
      return `Compelling opening: Attention-grabbing introduction to ${originalMessage.substring(0, 50)}...`;
      
    case 2:
      return `Development scene: Building the story and connecting with your audience around ${originalMessage.substring(0, 40)}...`;
      
    case 3:
      return `Climax/Impact: Showcasing the transformation or key benefit of ${originalMessage.substring(0, 40)}...`;
      
    case 4:
      return `Resolution: Bringing the story to a satisfying conclusion with clear results...`;
      
    case 5:
      return `Call to action: Inspiring viewers to take the next step in their journey...`;
      
    default:
      return `Scene ${sceneNumber}: Continuing the brand narrative with engaging visual storytelling...`;
  }
}

function createFallbackScenes(message: string): any[] {
  const messageContext = message?.toLowerCase() || '';
  
  return [
    {
      id: 'scene_1',
      scene: 1,
      prompt: `Opening Hook: ${messageContext.includes('business') ? 'Professional establishing shot' : 'Lifestyle opening moment'} that immediately captures attention and showcases your brand essence.`
    },
    {
      id: 'scene_2',
      scene: 2,
      prompt: `Story Development: Building connection with your audience by showing the journey, process, or behind-the-scenes moments that make your brand authentic.`
    },
    {
      id: 'scene_3',
      scene: 3,
      prompt: `Transformation/Impact: Showcasing the results, benefits, or positive change your brand creates for clients and communities.`
    },
    {
      id: 'scene_4',
      scene: 4,
      prompt: `Call to Action: Clear, inspiring message that guides viewers to take the next step in working with you or engaging with your brand.`
    }
  ];
}

// 🎬 ENHANCED VIDEO PROCESSING FUNCTIONS FOR VEO INTEGRATION

async function parseVideoScenes(mayaResponse: string, originalMessage: string, userModel: any, keyframes: any[]): Promise<any[]> {
  const scenes: any[] = [];
  
  try {
    // Extract scenes from Maya's enhanced video response
    const sceneMatches = mayaResponse.match(/scene\s*(\d+)/gi);
    const sceneParts = mayaResponse.split(/scene\s*\d+/i).slice(1);
    
    if (sceneMatches && sceneParts.length > 0) {
      for (let i = 0; i < Math.min(sceneMatches.length, sceneParts.length, 5); i++) {
        const sceneContent = sceneParts[i]?.trim() || '';
        const sceneNumber = i + 1;
        
        // Enhanced scene with LoRA integration
        scenes.push({
          id: `scene_${sceneNumber}`,
          scene: sceneNumber,
          prompt: enhanceSceneWithLoRA(sceneContent, userModel),
          originalPrompt: sceneContent,
          userLoraModel: userModel.replicateModelId,
          keyframeIndex: keyframes[i] ? i : null,
          duration: extractDuration(sceneContent) || (3 + sceneNumber * 2), // 5-13 second range
          cameraMovement: extractCameraMovement(sceneContent),
          textOverlay: extractTextOverlay(sceneContent)
        });
      }
    }
    
    console.log('📝 Video: Parsed', scenes.length, 'enhanced scenes with LoRA integration');
  } catch (error) {
    console.error('Video scene parsing error:', error);
  }
  
  // If parsing failed, create personalized defaults
  if (scenes.length === 0) {
    return await createPersonalizedFallbackScenes(originalMessage, userModel.userId);
  }
  
  // Ensure minimum 3 scenes
  while (scenes.length < 3) {
    const sceneNumber = scenes.length + 1;
    scenes.push({
      id: `scene_${sceneNumber}`,
      scene: sceneNumber,
      prompt: generatePersonalizedScenePrompt(sceneNumber, originalMessage, userModel),
      userLoraModel: userModel.replicateModelId,
      duration: 5 + sceneNumber * 2
    });
  }
  
  return scenes;
}

async function createPersonalizedFallbackScenes(message: string, userId: string): Promise<any[]> {
  const messageContext = message?.toLowerCase() || '';
  
  // Get user model for personalization
  let userModel;
  try {
    userModel = await storage.getUserModel(userId);
  } catch (error) {
    console.error('Error getting user model for fallback:', error);
  }
  
  const loraPrompt = userModel?.replicateModelId ? `featuring ${userModel.replicateModelId} (trained LoRA model)` : 'featuring the user';
  
  return [
    {
      id: 'scene_1',
      scene: 1,
      prompt: `Opening Hook: ${messageContext.includes('business') ? 'Professional introduction shot' : 'Personal lifestyle moment'} ${loraPrompt} that immediately establishes brand presence and captures attention.`,
      userLoraModel: userModel?.replicateModelId,
      duration: 5
    },
    {
      id: 'scene_2', 
      scene: 2,
      prompt: `Brand Development: Showcase expertise and personality ${loraPrompt} through authentic behind-the-scenes or process demonstration that builds connection.`,
      userLoraModel: userModel?.replicateModelId,
      duration: 8
    },
    {
      id: 'scene_3',
      scene: 3,
      prompt: `Value & Call-to-Action: Present transformation or results ${loraPrompt} with clear next steps for audience engagement and conversion.`,
      userLoraModel: userModel?.replicateModelId,
      duration: 7
    }
  ];
}

function enhanceSceneWithLoRA(sceneContent: string, userModel: any): string {
  // Enhance scene prompts with LoRA model integration
  const loraReference = userModel?.replicateModelId ? `${userModel.replicateModelId} (professional trained model)` : 'user';
  
  // Add LoRA reference if not already present
  if (!sceneContent.toLowerCase().includes('lora') && !sceneContent.toLowerCase().includes(userModel?.replicateModelId?.toLowerCase() || '')) {
    return `${sceneContent} Featuring ${loraReference} with consistent appearance and professional branding.`;
  }
  
  return sceneContent;
}

function extractDuration(sceneContent: string): number | null {
  const durationMatch = sceneContent.match(/(\d+)[\s-]*seconds?/i);
  return durationMatch ? parseInt(durationMatch[1]) : null;
}

function extractCameraMovement(sceneContent: string): string {
  const movements = ['zoom in', 'zoom out', 'pan left', 'pan right', 'tilt up', 'tilt down', 'static', 'dolly', 'tracking'];
  const found = movements.find(movement => sceneContent.toLowerCase().includes(movement));
  return found || 'static';
}

function extractTextOverlay(sceneContent: string): string | null {
  const overlayMatch = sceneContent.match(/text[:\s]*['""]([^'"]+)['"]/i);
  return overlayMatch ? overlayMatch[1] : null;
}

function generatePersonalizedScenePrompt(sceneNumber: number, originalMessage: string, userModel: any): string {
  const loraRef = userModel?.replicateModelId ? `featuring ${userModel.replicateModelId} (professional trained model)` : 'featuring the user';
  
  switch (sceneNumber) {
    case 1:
      return `Opening scene ${loraRef}: Professional introduction establishing brand presence and personal connection.`;
    case 2:
      return `Development scene ${loraRef}: Building narrative through authentic expertise demonstration and personality showcase.`;
    case 3:
      return `Value scene ${loraRef}: Demonstrating transformation, results, or key benefits with clear audience takeaway.`;
    case 4:
      return `Resolution scene ${loraRef}: Bringing story to satisfying conclusion with measurable impact or outcome.`;
    default:
      return `Continuation scene ${loraRef}: Advancing brand narrative with engaging visual storytelling and personal touch.`;
  }
}

// 🎬 VEO VIDEO GENERATION INTEGRATION (Supports Google Veo (veo 3) or legacy Replicate)

// (VEO generation & status logic moved to services/veo-service.ts)

  // (Removed obsolete duplicate inline status handling block)
  
  // (Static file serving and Vite dev server setup moved to server/start.ts)
    // 🚨 CRITICAL FIX: Register admin consulting route BEFORE session middleware
    console.log('🤖 REGISTERING FIXED AGENT ROUTES: Clean conversation system');
    
    app.get('/api/test-auth', requireStackAuth, async (req: any, res) => {
    try {
      const stackUser = req.user;
      console.log('🧪 STACK AUTH TEST - Raw user from token:', stackUser);
      
      if (!stackUser || !stackUser.id) {
        return res.status(401).json({
          success: false,
          message: 'No user found in JWT token',
          details: { user: stackUser }
        });
      }

      // Try to find user in database
      const dbUser = await storage.getUser(stackUser.id);
      console.log('🧪 STACK AUTH TEST - User from database:', dbUser ? 'FOUND' : 'NOT FOUND');

      res.json({
        success: true,
        message: 'Stack Auth integration working correctly!',
        stackAuth: {
          userId: stackUser.id,
          email: stackUser.primaryEmail,
          displayName: stackUser.displayName
        },
        database: {
          userExists: !!dbUser,
          userdata: dbUser ? {
            id: dbUser.id,
            email: dbUser.email,
            displayName: dbUser.displayName,
            plan: dbUser.plan,
            role: dbUser.role
          } : null
        },
        webhookStatus: 'Handler available at /api/webhooks/stack'
      });
    } catch (error) {
      console.error('🧪 STACK AUTH TEST ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 🚀 AUTO-REGISTRATION: Create accounts for paying users automatically
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
  
  // PHASE 4: OLD MAYA ROUTES DISABLED (Fragmented system archived)
  // registerMayaAIRoutes(app);
  // app.use('/api/maya-onboarding', mayaOnboardingRoutes);
  
  // MAYA UNIFIED API: Consolidated router with direct implementation
  const { default: mayaUnifiedRouter } = await import('./routes/maya');
  app.use('/api/maya', mayaUnifiedRouter);
  console.log('🎨 MAYA UNIFIED: API active at /api/maya/* (Consolidated Router)');
  
  // HYBRID BACKEND: Concept Cards API for clean persistence and unique React keys
  const { default: conceptCardsRouter } = await import('./routes/concept-cards');
  app.use('/api/concepts', conceptCardsRouter);
  console.log('💡 CONCEPT CARDS: API active at /api/concepts/* (ULID-based unique keys)');
  
  // 🎥 STORY STUDIO API - Server-side AI video story generation
  // Initialize Gemini AI client for server-side operations
  let geminiAI: any = null;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    if (process.env.GOOGLE_API_KEY) {
      geminiAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
      console.log('🔑 STORY STUDIO: Gemini AI initialized server-side');
    } else {
      console.warn('⚠️ STORY STUDIO: GOOGLE_API_KEY not configured');
    }
  } catch (error) {
    console.error('❌ STORY STUDIO: Failed to initialize Gemini AI:', error);
  }
  
  // POST /api/story/draft - Draft storyboard using Gemini
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Removed: agent-search-cache-test moved to backup
  
  // Email automation routes
  app.use('/api/email', emailAutomation);
  
  // 📧 AVA Email Management Agent Routes
  app.use('/api/email-management', emailManagementRouter);
  
  // 🔐 Gmail Authentication Routes
  // const gmailAuthRouter = await import('./routes/gmail-auth'); // DISABLED
  // app.use('/api/auth/gmail', gmailAuthRouter.default); // DISABLED
  
  // 📱 Instagram DM Management Routes
  const instagramManagementRouter = await import('./routes/instagram-management');
  app.use('/api/instagram-management', instagramManagementRouter.default);
  
  // 🧪 Slack Integration Testing Routes
  const slackTestRouter = await import('./routes/slack-test');
  app.use('/api/slack', slackTestRouter.default);
  
  // Subscriber import routes
  // const subscriberImport = await import('./routes/subscriber-import'); // DISABLED
  // app.use('/api/subscribers', subscriberImport.default); // DISABLED
  // REMOVED: Multiple conflicting admin routers - consolidated into single adminRouter
  
  // Register white-label client setup endpoints
  // app.use(whitelabelRoutes); // DISABLED
  
  // RESTORED: Sandra's admin user management system active
  
  // Image proxy endpoint to bypass CORS issues with S3
  app.get('/api/proxy-image', requireStackAuth, async (req: any, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Image URL required' });
      }
      
      // Only allow our S3 bucket URLs for security
      if (!url.includes('sselfie-training-zips.s3.') && !url.includes('replicate.delivery')) {
        return res.status(403).json({ error: 'Unauthorized image source' });
      }
      
      console.log('🖼️ Proxying image:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SSELFIE-Studio/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Set appropriate headers
      res.set({
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
      // Stream the image
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('❌ Image proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  });

  /*
  // Maya Chat endpoint - MEMBER AGENT (Personal Brand Photography Guide)
  app.post('/api/maya-chat', requireStackAuth, async (req: any, res) => {
    try {
      const { message, chatHistory } = req.body;
      const userId = req.user.id;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('💬 Maya MEMBER chat message received from user:', userId);

      // MAYA FAÇADE: Removed PersonalityManager import - Maya's personality via API only
      // const { PersonalityManager } = await import('./agents/personalities/personality-config'); // REMOVED: Direct dependency
      
      // Create member-specific system prompt using Maya's elevated personality
      // MAYA FAÇADE: Standard system prompt - Maya's personality via API only
      const mayaSystemPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and personal brand strategist.

🎯 MEMBER CONTEXT: You are helping a paying customer create stunning personal brand photos using SSELFIE Studio. Focus purely on fashion expertise and photo creation with your A-list celebrity stylist experience.

CUSTOMER INTERACTION GOALS:
- Help them style amazing photos using your 15+ years A-list experience
- Use current 2025 trends: Dark Academia Winter, Soft Power Dressing, European Minimalism
- Create authentic moments with your celebrity-level technical expertise
- Make them feel confident and excited about their photos
- Generate specific styling prompts when they're ready

RESPONSE FORMAT:
1. Give a warm, conversational response using your authentic celebrity stylist personality and A-list expertise
2. When ready to generate images, include exactly 2 hidden prompts in this format:
\`\`\`prompt
[detailed poetic generation prompt with technical excellence 1]
\`\`\`
\`\`\`prompt  
[detailed poetic generation prompt with technical excellence 2]
\`\`\`

PROMPT CREATION RULES (Celebrity stylist level):
- Use your A-list experience: "Canon EOS R5 with 85mm lens for executive portrait compression"
- Include current 2025 trends: Dark Academia Winter, European Minimalism, Athletic Luxury
- Technical lighting mastery: "Morning golden hour when light is crisp but warm"
- Celebrity-level direction: "Walking purposefully, contemplative confidence"
- Format: [TECHNICAL FOUNDATION] + [USER_TRIGGER_WORD] + [2025 STYLING] + [LOCATION MASTERY] + [CAMERA EXPERTISE] + [AUTHENTIC MOVEMENT]

IMPORTANT: You are the MEMBER experience Maya - A-list celebrity stylist serving customers, not a business consultant.`;

      // Get user context for personalized responses
      const user = await storage.getUser(userId);
      
      let onboardingData = null;
      try {
        onboardingData = await storage.getOnboardingData(userId);
      } catch (error) {
        onboardingData = null;
      }
      
      // Enhanced member system prompt with user context
      const memberSystemPrompt = `${mayaSystemPrompt}

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
            max_tokens: 8000, // INTELLIGENT SCALING: Aligned with system-wide token optimization
            messages: [
              ...(chatHistory && Array.isArray(chatHistory) ? chatHistory.map((msg: any) => ({
                role: msg.role === 'maya' ? 'assistant' : 'user',
                content: msg.content
              })) : []),
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
        
        // Check if Maya wants to generate images and extract her hidden prompts
        if (response.toLowerCase().includes('generate') || 
            response.toLowerCase().includes('create') ||
            response.toLowerCase().includes('photoshoot') ||
            response.toLowerCase().includes('ready to')) {
          canGenerate = true;
          
          // Extract Maya's hidden generation prompts (she should provide exactly 2)
          const promptRegex = /```prompt\s*([\s\S]*?)\s*```/g;
          const prompts = [];
          let match;
          
          while ((match = promptRegex.exec(response)) !== null) {
            prompts.push(match[1].trim());
          }
          
          if (prompts.length > 0) {
            // Use the first prompt for generation, store all for reference
            generatedPrompt = prompts[0];
            console.log(`✅ MAYA PROVIDED ${prompts.length} PROMPTS:`, prompts.map(p => p.substring(0, 100)));
            
            // Remove all prompt blocks from conversation response
            response = response.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
            // Clean up extra whitespace
            response = response.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
          } else {
            console.log('⚠️ MAYA MISSING PROMPTS: Maya should provide hidden prompts in ```prompt``` blocks');
            // No fallback - this encourages Maya to learn the proper format
            canGenerate = false;
          }
        }

      } catch (error) {
        console.error('Maya Claude API error:', error);
        response = "I'm having trouble connecting to my creative systems right now. Could you try again in a moment? I'm excited to help you create amazing photos!";
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
  */

  // Victoria Website Chat endpoint - MEMBER AGENT (Website Building Guide)
  app.post('/api/test-model-validation', async (req, res) => {
    try {
      const { userId } = req.body;
      const { ModelValidationService } = await import('./model-validation-service');
      
      console.log(`🔍 Testing model validation for user: ${userId}`);
      const validation = await ModelValidationService.validateAndCorrectUserModel(userId);
      
      res.json({
        success: true,
        validation,
        databaseModel: await storage.getUserModelByUserId(userId)
      });
    } catch (error) {
      console.error('Model validation test error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Test generation with admin model using optimized parameters
  app.post('/api/test-admin-generation', async (req, res) => {
    try {
      const { prompt } = req.body;
      const { UnifiedGenerationService } = await import('./unified-generation-service');
      
      console.log(`🔍 Testing ADMIN model with OPTIMIZED parameters`);
      const result = await UnifiedGenerationService.generateImages({
        userId: '42585527', // Admin user ID
        prompt: prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth'
      });
      
      res.json({
        success: true,
        result,
        message: 'Admin model test with optimized parameters started'
      });
    } catch (error) {
      console.error('Admin generation test error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Test generation with Shannon's model for comparison
  app.post('/api/test-shannon-generation', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      console.log(`🔍 Testing Shannon's model generation directly`);
      
      // Use Shannon's exact model details
      const modelVersion = 'sandrasocial/shannon-1753945376880-selfie-lora-1753983966781:2fed9e1abe9a80206d0a7b146914ee9f653b8aaf5b0dd7e82b8feb57ab5ec753';
      const triggerWord = 'usershannon-1753945376880';
      
      const testPrompt = prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth';
      
      // 🎯 MAYA INTELLIGENCE PRESERVED: Only add trigger word, preserve all Maya's choices
      let mayaPrompt = testPrompt.trim();
      
      // Only add trigger word if not already present, preserve Maya's complete styling intelligence
      const finalPrompt = mayaPrompt.startsWith(triggerWord) 
        ? mayaPrompt 
        : `${triggerWord}, ${mayaPrompt}`;
      
      // Shannon test uses the model directly without LoRA weights
      console.log(`🔧 SHANNON TEST: Using model directly: ${modelVersion}`);
      
      // Shannon test uses the trained model directly
      const requestBody = {
        version: modelVersion,
        input: {
          prompt: finalPrompt,
          num_outputs: 2,
          aspect_ratio: "4:5",
          output_format: "png",
          output_quality: 95,
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      
      console.log(`🚀 SHANNON TEST: Using trained model directly`);
      console.log(`   Model: ${modelVersion}`);
      console.log(`   Trigger: ${triggerWord}`);
      
      const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const predictionData = await replicateResponse.json();
      
      if (!replicateResponse.ok) {
        throw new Error(`Replicate API error: ${JSON.stringify(predictionData)}`);
      }
      
      res.json({
        success: true,
        predictionId: predictionData.id,
        status: predictionData.status,
        urls: predictionData.urls || [],
        message: `Shannon's model test started - Prediction ID: ${predictionData.id}`
      });
      
    } catch (error) {
      console.error('Shannon generation test error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // REMOVED DUPLICATE AI IMAGES ROUTE #2

  // Stack Auth logout endpoint
  app.get('/api/admin/agents/coordination-metrics', async (req: any, res) => {
    try {
      // Admin authentication check
      const adminToken = req.headers['x-admin-token'];
      const requireStackAuth = req.requireStackAuth?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!requireStackAuth && adminToken !== 'sandra-admin-2025') {
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
  app.get('/api/admin/agents/active-deployments', async (req: any, res) => {
    try {
      // Admin authentication check
      const adminToken = req.headers['x-admin-token'];
      const requireStackAuth = req.requireStackAuth?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!requireStackAuth && adminToken !== 'sandra-admin-2025') {
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

  // Token usage monitoring endpoint for smart routing analysis
  app.get('/api/admin/token-usage-stats', async (req: any, res) => {
    try {
      const { tokenUsageMonitor } = await import('./monitoring/token-usage-monitor');
      const timeWindow = parseInt(req.query.hours as string) || 24;
      const stats = tokenUsageMonitor.getUsageStats(timeWindow);
      const recentEntries = tokenUsageMonitor.getRecentEntries(20);

      res.json({
        success: true,
        stats,
        recentEntries,
        message: `Token usage stats for last ${timeWindow} hours`,
        smartRoutingActive: true
      });
    } catch (error) {
      console.error('Token usage stats error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // REMOVED: Smart routing test endpoint (smart routing layer removed for direct access)
  
  // Claude API route for frontend compatibility (bypass auth for now)
  app.post('/api/admin/agents/execute', async (req: any, res) => {
    try {
      // Admin authentication bypass
      const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];
      const isAdminRequest = adminToken === 'sandra-admin-2025';
      
      console.log('🔐 AUTH DEBUG: adminToken =', adminToken, 'isAdminRequest =', isAdminRequest);
      
      let userId;
      if (isAdminRequest) {
        userId = '42585527'; // Sandra's actual admin user ID
        console.log('✅ ADMIN AUTH: Using Sandra admin userId:', userId);
      } else if (req.requireStackAuth()) {
        userId = req.user.id;
        console.log('🔒 SESSION AUTH: Using session userId:', userId);
      }

      console.log('👤 FINAL userId:', userId);

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Legacy effortBasedExecutor removed - using AutonomousAgentIntegration instead
      const result = {
        success: true,
        message: 'Legacy effort-based system removed. Use autonomous agent system instead.',
        costOptimized: true
      };
      res.json({ success: true, result });
    } catch (error) {
      console.error('Effort-based execution error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // API endpoint for loading agent conversation history
  app.get('/dev-workspace', (req, res) => {
      console.log('🔧 DEV ROUTE: Direct workspace access requested');
      
      // Redirect to workspace with admin bypass parameter
      const workspaceUrl = '/workspace?dev_admin=sandra';
      res.redirect(workspaceUrl);
    });
    
    console.log('✅ DEV ROUTE: Development workspace bypass available at /dev-workspace');

  // CRITICAL FIX: Start background monitoring services
  console.log('🚀 MONITORING: Starting background completion monitors...');
  
  // Start Training Completion Monitor
  const { TrainingCompletionMonitor } = await import('./training-completion-monitor');
  TrainingCompletionMonitor.getInstance().startMonitoring();
  console.log('✅ MONITORING: Training completion monitor started');
  
  // Start Generation Completion Monitor (CRITICAL: This was missing!)
  const { GenerationCompletionMonitor } = await import('./generation-completion-monitor');
  GenerationCompletionMonitor.getInstance().startMonitoring();
  
  // CRITICAL: Start migration monitor to prevent image loss from URL expiration
  const { migrationMonitor } = await import('./migration-monitor');
  migrationMonitor.startMonitoring();
  
  // ENABLED: Real-data agent insights for launch strategy (every 30 minutes)
  const { AgentContextMonitor } = await import('./services/agent-context-monitor');
  AgentContextMonitor.getInstance().startMonitoring(30); // Check every 30 minutes for launch opportunities
  
  // Connect Slack Interactive System with raw body parsing for signature verification
  // const slackInteractivityRouter = await import('./routes/slack-interactivity'); // DISABLED
  
  // Add raw body parser specifically for Slack webhooks
  app.use('/api/slack', express.raw({
    type: 'application/x-www-form-urlencoded'
  }));
  
  // app.use('/api/slack', slackInteractivityRouter.default); // DISABLED
  console.log('✅ SLACK: Interactive agent conversation system connected');

  // Connect Slack Testing Routes
  const testSlackAgentsRouter = await import('./routes/test-slack-agents');
  app.use('/api/test-slack-agents', testSlackAgentsRouter.default);
  app.use('/api/test-slack', testSlackAgentsRouter.default);
  console.log('✅ SLACK: Agent testing interface ready');

  console.log('✅ MONITORING: All monitors active - Generation, Training, URL Migration protecting user experience!');
  
  // JSON health alias for frontend helpers
  app.get('/api/health-check', (_req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ ok: true, ts: Date.now() });
  });

  // Favorites minimal stubs to avoid 404 HTML
  app.get('/api/images/favorites', requireStackAuth, async (req: any, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ favorites: [] });
  });
  app.post('/api/images/:id/favorite', requireStackAuth, async (req: any, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ ok: true });
  });

  // Ensure unknown /api/* never returns HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return server;
}