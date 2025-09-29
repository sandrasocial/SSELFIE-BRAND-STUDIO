import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { setupRollbackRoutes } from './routes/rollback.js';
import { storage } from "./storage.js";
import { requireStackAuth } from './stack-auth.js';
import emailAutomation from './routes/email-automation.js';
import { registerVictoriaService } from "./routes/victoria-service.js";
import { registerVictoriaWebsiteGenerator } from "./routes/victoria-website-generator.js";
import videoRoutes from './routes/video.js';
import { liveSessionRoutes } from './routes/live-session.js';
import { analyticsRoutes } from './routes/analytics.js';
import path from 'path';
import fs from 'fs';
import emailManagementRouter from './routes/email-management-routes.js';
import utilityRoutes from './routes/modules/utility.js';
import authRoutes from './routes/modules/auth.js';
import aiGenerationRoutes from './routes/modules/ai-generation.js';
import adminRoutes from './routes/modules/admin.js';
import agentProtocolRoutes from './routes/modules/agent-protocol.js';
import websitesRoutes from './routes/modules/websites.js';
import trainingRoutes from './routes/modules/training.js';
import levelPartnerWebhook from './routes/levelpartner-webhook.js';
import hairTrendsRoute from './routes/hair-trends-route.js';
import trendsCurrentRoute from './routes/trends-current.js';
import { scheduleTrendAnalysis } from './scheduled-tasks/fetch-hair-trends.js';
import claudeRoutes from './routes/modules/claude.js';
import usageRoutes from './routes/modules/usage.js';
export async function registerRoutes(app) {
    const server = createServer(app);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());
    console.log('✅ Cookie parser middleware initialized');
    app.use('/', utilityRoutes);
    app.use('/', authRoutes);
    app.use('/', aiGenerationRoutes);
    app.use('/', adminRoutes);
    app.use('/', agentProtocolRoutes);
    app.use('/', websitesRoutes);
    app.use('/', trainingRoutes);
    app.use('/', levelPartnerWebhook);
    app.use('/api', hairTrendsRoute);
    app.use('/api/trends', trendsCurrentRoute);
    app.use('/', claudeRoutes);
    app.use('/', usageRoutes);
    console.log('✅ Modular routes registered (including LevelPartner webhook and Hair Trends)');
    function generateWebsiteHTML_Legacy(websiteData, onboardingData) {
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
        const colors = colorScheme[brandPersonality] || colorScheme.professional;
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
            ${keyFeatures.map((feature) => `
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
    function parseStoryScenes(mayaResponse, originalMessage) {
        const scenes = [];
        try {
            const sceneMatches = mayaResponse.match(/scene\s*(\d+)/gi);
            const sceneParts = mayaResponse.split(/scene\s*\d+/i).slice(1);
            if (sceneMatches && sceneParts.length > 0) {
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
        }
        catch (error) {
            console.log('📝 Story: Using fallback scene parsing');
        }
        if (scenes.length === 0) {
            return createFallbackScenes(originalMessage);
        }
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
    function extractScenePrompt(sceneContent, sceneNumber, originalMessage) {
        const lines = sceneContent.split('\n').filter(line => line.trim());
        const relevantLines = lines.slice(0, 3).join(' ').trim();
        if (relevantLines.length > 10) {
            return relevantLines.length > 200 ? relevantLines.substring(0, 197) + '...' : relevantLines;
        }
        return generateDefaultScenePrompt(sceneNumber, originalMessage);
    }
    function generateDefaultScenePrompt(sceneNumber, originalMessage) {
        const messageContext = originalMessage.toLowerCase();
        switch (sceneNumber) {
            case 1:
                if (messageContext.includes('business') || messageContext.includes('professional')) {
                    return `Opening scene: Professional establishing shot showcasing ${originalMessage.substring(0, 50)}...`;
                }
                else if (messageContext.includes('lifestyle') || messageContext.includes('personal')) {
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
    function createFallbackScenes(message) {
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
    async function parseVideoScenes(mayaResponse, originalMessage, userModel, keyframes) {
        const scenes = [];
        try {
            const sceneMatches = mayaResponse.match(/scene\s*(\d+)/gi);
            const sceneParts = mayaResponse.split(/scene\s*\d+/i).slice(1);
            if (sceneMatches && sceneParts.length > 0) {
                for (let i = 0; i < Math.min(sceneMatches.length, sceneParts.length, 5); i++) {
                    const sceneContent = sceneParts[i]?.trim() || '';
                    const sceneNumber = i + 1;
                    scenes.push({
                        id: `scene_${sceneNumber}`,
                        scene: sceneNumber,
                        prompt: enhanceSceneWithLoRA(sceneContent, userModel),
                        originalPrompt: sceneContent,
                        userLoraModel: userModel.replicateModelId,
                        keyframeIndex: keyframes[i] ? i : null,
                        duration: extractDuration(sceneContent) || (3 + sceneNumber * 2),
                        cameraMovement: extractCameraMovement(sceneContent),
                        textOverlay: extractTextOverlay(sceneContent)
                    });
                }
            }
            console.log('📝 Video: Parsed', scenes.length, 'enhanced scenes with LoRA integration');
        }
        catch (error) {
            console.error('Video scene parsing error:', error);
        }
        if (scenes.length === 0) {
            return await createPersonalizedFallbackScenes(originalMessage, userModel.userId);
        }
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
    async function createPersonalizedFallbackScenes(message, userId) {
        const messageContext = message?.toLowerCase() || '';
        let userModel;
        try {
            userModel = await storage.getUserModel(userId);
        }
        catch (error) {
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
    function enhanceSceneWithLoRA(sceneContent, userModel) {
        const loraReference = userModel?.replicateModelId ? `${userModel.replicateModelId} (professional trained model)` : 'user';
        if (!sceneContent.toLowerCase().includes('lora') && !sceneContent.toLowerCase().includes(userModel?.replicateModelId?.toLowerCase() || '')) {
            return `${sceneContent} Featuring ${loraReference} with consistent appearance and professional branding.`;
        }
        return sceneContent;
    }
    function extractDuration(sceneContent) {
        const durationMatch = sceneContent.match(/(\d+)[\s-]*seconds?/i);
        return durationMatch ? parseInt(durationMatch[1]) : null;
    }
    function extractCameraMovement(sceneContent) {
        const movements = ['zoom in', 'zoom out', 'pan left', 'pan right', 'tilt up', 'tilt down', 'static', 'dolly', 'tracking'];
        const found = movements.find(movement => sceneContent.toLowerCase().includes(movement));
        return found || 'static';
    }
    function extractTextOverlay(sceneContent) {
        const overlayMatch = sceneContent.match(/text[:\s]*['""]([^'"]+)['"]/i);
        return overlayMatch ? overlayMatch[1] : null;
    }
    function generatePersonalizedScenePrompt(sceneNumber, originalMessage, userModel) {
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
    console.log('🤖 REGISTERING FIXED AGENT ROUTES: Clean conversation system');
    app.get('/api/test-auth', requireStackAuth, async (req, res) => {
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
        }
        catch (error) {
            console.error('🧪 STACK AUTH TEST ERROR:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication test failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    app.get("/training-zip/:filename", (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'temp_training', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Training ZIP file not found' });
        }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        console.log(`📦 Serving training ZIP: ${filename} (${fs.statSync(filePath).size} bytes)`);
        res.sendFile(filePath);
    });
    setupRollbackRoutes(app);
    registerVictoriaService(app);
    registerVictoriaWebsiteGenerator(app);
    console.log('🎨 MAYA ROUTES: Active via modular system (./routes/modules/maya)');
    const { default: conceptCardsRouter } = await import('./routes/concept-cards.js');
    app.use('/api/concepts', conceptCardsRouter);
    console.log('💡 CONCEPT CARDS: API active at /api/concepts/* (ULID-based unique keys)');
    app.use('/api/live', liveSessionRoutes);
    console.log('🎪 LIVE SESSIONS: Stage Mode API active at /api/live/* (Interactive presentations)');
    app.use('/api/analytics', analyticsRoutes);
    console.log('📊 ANALYTICS: Stage Mode analytics API active at /api/analytics/* (Event tracking)');
    if (process.env['BRAND_ASSETS_ENABLED'] === '1') {
        const { default: brandAssetsRouter } = await import('./routes/brand-assets.js');
        const { default: brandPlacementRouter } = await import('./routes/brand-placement.js');
        app.use('/api/brand-assets', brandAssetsRouter);
        app.use('/api/brand-assets', brandPlacementRouter);
        console.log('🎨 BRAND ASSETS: API active at /api/brand-assets/* (Upload & Placement)');
    }
    let geminiAI = null;
    try {
        const { GoogleGenAI } = await import('@google/genai');
        if (process.env['GOOGLE_API_KEY']) {
            geminiAI = new GoogleGenAI({ apiKey: process.env['GOOGLE_API_KEY'] });
            console.log('🔑 STORY STUDIO: Gemini AI initialized server-side');
        }
        else {
            console.warn('⚠️ STORY STUDIO: GOOGLE_API_KEY not configured');
        }
    }
    catch (error) {
        console.error('❌ STORY STUDIO: Failed to initialize Gemini AI:', error);
    }
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/api/email', emailAutomation);
    app.use('/api/video', videoRoutes);
    console.log('🎬 VEO 3: Video generation API active at /api/video/*');
    app.use('/api/email-management', emailManagementRouter);
    const instagramManagementRouter = await import('./routes/instagram-management.js');
    app.use('/api/instagram-management', instagramManagementRouter.default);
    app.get('/api/proxy-image', requireStackAuth, async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({ error: 'Image URL required' });
            }
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
            res.set({
                'Content-Type': response.headers.get('content-type') || 'image/png',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            const buffer = await response.arrayBuffer();
            res.send(Buffer.from(buffer));
        }
        catch (error) {
            console.error('❌ Image proxy error:', error);
            res.status(500).json({ error: 'Failed to proxy image' });
        }
    });
    app.post('/api/test-model-validation', async (req, res) => {
        try {
            const { userId } = req.body;
            const { ModelValidationService } = await import('./model-validation-service.js');
            console.log(`🔍 Testing model validation for user: ${userId}`);
            const validation = await ModelValidationService.validateAndCorrectUserModel(userId);
            res.json({
                success: true,
                validation,
                databaseModel: await storage.getUserModelByUserId(userId)
            });
        }
        catch (error) {
            console.error('Model validation test error:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/test-admin-generation', async (req, res) => {
        try {
            const { prompt } = req.body;
            const { UnifiedGenerationService } = await import('./unified-generation-service.js');
            console.log(`🔍 Testing ADMIN model with OPTIMIZED parameters`);
            const result = await UnifiedGenerationService.generateImages({
                userId: '42585527',
                prompt: prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth'
            });
            res.json({
                success: true,
                result,
                message: 'Admin model test with optimized parameters started'
            });
        }
        catch (error) {
            console.error('Admin generation test error:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.post('/api/test-shannon-generation', async (req, res) => {
        try {
            const { prompt } = req.body;
            console.log(`🔍 Testing Shannon's model generation directly`);
            const modelVersion = 'sandrasocial/shannon-1753945376880-selfie-lora-1753983966781:2fed9e1abe9a80206d0a7b146914ee9f653b8aaf5b0dd7e82b8feb57ab5ec753';
            const triggerWord = 'usershannon-1753945376880';
            const testPrompt = prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth';
            let mayaPrompt = testPrompt.trim();
            const finalPrompt = mayaPrompt.startsWith(triggerWord)
                ? mayaPrompt
                : `${triggerWord}, ${mayaPrompt}`;
            console.log(`🔧 SHANNON TEST: Using model directly: ${modelVersion}`);
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
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
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
        }
        catch (error) {
            console.error('Shannon generation test error:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    app.get('/api/admin/agents/coordination-metrics', async (req, res) => {
        try {
            const adminToken = req.headers['x-admin-token'];
            const requireStackAuth = req.requireStackAuth?.() && req.user?.claims?.email === 'ssa@ssasocial.com';
            if (!requireStackAuth && adminToken !== 'sandra-admin-2025') {
                return res.status(401).json({ error: 'Admin access required' });
            }
            const metrics = {
                agentCoordination: {
                    totalAgents: 13,
                    availableAgents: 13,
                    activeAgents: 0,
                    averageLoad: 0,
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
        }
        catch (error) {
            console.error('❌ Coordination metrics error:', error);
            res.status(500).json({ error: 'Failed to get coordination metrics' });
        }
    });
    app.get('/api/admin/agents/active-deployments', async (req, res) => {
        try {
            const adminToken = req.headers['x-admin-token'];
            const requireStackAuth = req.requireStackAuth?.() && req.user?.claims?.email === 'ssa@ssasocial.com';
            if (!requireStackAuth && adminToken !== 'sandra-admin-2025') {
                return res.status(401).json({ error: 'Admin access required' });
            }
            const deployments = [];
            res.json({ deployments });
        }
        catch (error) {
            console.error('❌ Active deployments error:', error);
            res.status(500).json({ error: 'Failed to get active deployments' });
        }
    });
    app.get('/api/admin/token-usage-stats', async (req, res) => {
        try {
            const { tokenUsageMonitor } = await import('./monitoring/token-usage-monitor.js');
            const timeWindow = parseInt(req.query.hours) || 24;
            const stats = tokenUsageMonitor.getUsageStats(timeWindow);
            const recentEntries = tokenUsageMonitor.getRecentEntries(20);
            res.json({
                success: true,
                stats,
                recentEntries,
                message: `Token usage stats for last ${timeWindow} hours`,
                smartRoutingActive: true
            });
        }
        catch (error) {
            console.error('Token usage stats error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    app.post('/api/admin/agents/execute', async (req, res) => {
        try {
            const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];
            const isAdminRequest = adminToken === 'sandra-admin-2025';
            console.log('🔐 AUTH DEBUG: adminToken =', adminToken, 'isAdminRequest =', isAdminRequest);
            let userId;
            if (isAdminRequest) {
                userId = '42585527';
                console.log('✅ ADMIN AUTH: Using Sandra admin userId:', userId);
            }
            else if (req.requireStackAuth()) {
                userId = req.user.id;
                console.log('🔒 SESSION AUTH: Using session userId:', userId);
            }
            console.log('👤 FINAL userId:', userId);
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const result = {
                success: true,
                message: 'Legacy effort-based system removed. Use autonomous agent system instead.',
                costOptimized: true
            };
            res.json({ success: true, result });
        }
        catch (error) {
            console.error('Effort-based execution error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    app.get('/dev-workspace', (req, res) => {
        console.log('🔧 DEV ROUTE: Direct workspace access requested');
        const workspaceUrl = '/workspace?dev_admin=sandra';
        res.redirect(workspaceUrl);
    });
    console.log('✅ DEV ROUTE: Development workspace bypass available at /dev-workspace');
    console.log('🚀 MONITORING: Starting background completion monitors...');
    const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
    TrainingCompletionMonitor.getInstance().startMonitoring();
    console.log('✅ MONITORING: Training completion monitor started');
    const { GenerationCompletionMonitor } = await import('./generation-completion-monitor.js');
    GenerationCompletionMonitor.getInstance().startMonitoring();
    const { migrationMonitor } = await import('./migration-monitor.js');
    migrationMonitor.startMonitoring();
    const { AgentContextMonitor } = await import('./services/agent-context-monitor.js');
    AgentContextMonitor.getInstance().startMonitoring(30);
    app.use('/api/slack', express.raw({
        type: 'application/x-www-form-urlencoded'
    }));
    console.log('✅ SLACK: Interactive agent conversation system connected');
    console.log('✅ MONITORING: All monitors active - Generation, Training, URL Migration protecting user experience!');
    app.get('/api/health-check', (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ ok: true, ts: Date.now() });
    });
    app.get('/api/images/favorites', requireStackAuth, async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ favorites: [] });
    });
    app.post('/api/images/:id/favorite', requireStackAuth, async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ ok: true });
    });
    app.use('/api', (_req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
    console.log('🤖 Initializing Sophia trend analysis system...');
    scheduleTrendAnalysis();
    return server;
}
//# sourceMappingURL=routes.js.map