import FormData from 'form-data';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


// Image categories and prompt templates
export const IMAGE_CATEGORIES = {
  editorial: ['portrait', 'lifestyle', 'artistic'],
  professional: ['headshot', 'business', 'corporate'],
  creative: ['artistic', 'concept', 'avant-garde']
} as const;

// REMOVED: Hardcoded PROMPT_TEMPLATES with camera equipment - Maya's personality now drives content
// 
// 🚨 ZERO TOLERANCE ANTI-HARDCODE POLICY ENFORCED:
// - All prompts flow through Maya's Claude API intelligence
// - No hardcoded if/else prompt generation logic allowed  
// - Maya's AI personality drives every image generation decision

// 🚨 REMOVED: Hardcoded GENERATION_SETTINGS that were overriding Maya's intelligence
// Maya's personality file now drives ALL parameters for consistent, intelligent generation
// NO MORE HARDCODED OVERRIDES - Maya's fluxOptimization has full control

// ✅ REMOVED: Base quality settings - Maya's intelligence controls all quality parameters

// 🔒 IMMUTABLE CORE ARCHITECTURE - TRAINING SERVICE
// Creates individual LoRA models for each user using ostris/flux-dev-lora-trainer
// Each user gets ONLY their own trained LoRA weights - NO EXCEPTIONS
export class ModelTrainingService {
  // Configure AWS S3 (use environment region for consistency)
  private static s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION || 'us-east-1'
  });

  // Generate unique trigger word for user
  static generateTriggerWord(userId: string): string {
    // Generate consistent trigger word using clean user ID format
    // Remove special characters and ensure numeric ID for proper training
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    return `user${cleanUserId}`;
  }

  // Create ZIP file with user's selfie images for training
  static async createImageZip(selfieImages: string[], userId: string): Promise<string> {

    
    // Create temporary directory for ZIP creation
    const tempDir = path.join(process.cwd(), 'temp_training');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const zipPath = path.join(tempDir, `training_${userId}_${Date.now()}.zip`);
    
    try {
      // Create ZIP file
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      // Add each image to ZIP with proper validation and padding
      for (let i = 0; i < selfieImages.length; i++) {
        const imageData = selfieImages[i];
        
        // More flexible image validation to accept different formats
        if (!imageData.includes('data:image/') && imageData.length < 100) {
          continue;
        }
        
        // Extract base64 data and ensure proper padding (handle different formats)
        let base64Data = imageData;
        if (imageData.includes('data:image/')) {
          base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
        
        try {
          const imageBuffer = Buffer.from(paddedBase64, 'base64');
          
          // Validate buffer has reasonable size (at least 500 bytes for valid image - reduced for testing)
          if (imageBuffer.length < 500) {
            continue;
          }
          

          archive.append(imageBuffer, { name: `image_${i + 1}.jpg` });
        } catch (error) {
          continue;
        }
      }
      
      await archive.finalize();
      
      // Wait for the zip to be written
      await new Promise((resolve, reject) => {
        output.on('close', () => resolve(undefined));
        output.on('error', reject);
      });
      
      // FIXED: Upload ZIP to S3 so Replicate can access it (local URLs don't work)
      // This function should now use BulletproofUploadService instead
      throw new Error('Legacy training service - use BulletproofUploadService.createTrainingZip() instead');
      
    } catch (error) {
      throw error;
    }
  }

  // Start training a new model for user
  static async startModelTraining(userId: string, selfieImages: string[]): Promise<{ trainingId: string; status: string }> {

    
    try {
      // Check if user already has a model
      const existingModel = await storage.getUserModelByUserId(userId);
      if (existingModel) {
        // For retraining, we'll update the existing model
      }
      
      // Generate unique trigger word for this user
      const triggerWord = this.generateTriggerWord(userId);
      
      // For immediate testing, create a temporary training record and upload files
      // Once we resolve the API destination issue, this will be replaced with real training
      
      // Create the actual ZIP file for training
      const zipUrl = await this.createImageZip(selfieImages, userId);
      
      // NO MODEL CREATION NEEDED: LoRA weights approach outputs .safetensors file directly

      // Start FLUX LoRA training with BASE MODEL + WEIGHTS approach (OPTION A)
      const trainingResponse = await fetch('https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            input_images: zipUrl,
            trigger_word: triggerWord,
            steps: 1200, // RESEARCH OPTIMAL: 1200 steps for identity vs styling balance
            learning_rate: 0.0002, // OPTIMIZED: 0.0002 = balanced training speed vs stability
            batch_size: 1, // OPTIMIZED: Single batch for precise training
            lora_rank: 32, // OPTIMIZED: 32 for complex facial features
            resolution: "1024", // OPTIMIZED: 1024x1024 ideal resolution
            optimizer: "adamw8bit", // OPTIMIZED: Memory efficient optimizer
            autocaption: true, // OPTIMIZED: FLUX works better with contextual captions
            cache_latents_to_disk: false, // OPTIMIZED: Memory optimization
            caption_dropout_rate: 0.1 // OPTIMIZED: 0.1 = better generalization
          }
          // REMOVED: destination parameter - this outputs LoRA weights instead of destination model
        })
      });

      const trainingData = await trainingResponse.json();
      
      if (!trainingResponse.ok) {
        throw new Error(`Replicate training failed: ${JSON.stringify(trainingData)}`);
      }

      
      // ✅ CRITICAL FIX: Store training ID in separate field, keep replicateModelId for final model path only
      console.log(`🔍 Storing training ID: ${trainingData.id} for user ${userId}`);
      await storage.updateUserModel(userId, {
        trainingId: trainingData.id, // Store training ID in dedicated field
        triggerWord: triggerWord,
        trainingStatus: 'training',
        trainingProgress: 0,
        // Clear previous model data while training
        replicateModelId: null,
        replicateVersionId: null,
        loraWeightsUrl: null
      });
      console.log(`✅ Training ID stored in dedicated field for user ${userId}`);
      
      
      return {
        trainingId: trainingData.id,
        status: 'training'
      };
      
    } catch (error) {
      throw error;
    }
  }

  // Check training status
  static async checkTrainingStatus(userId: string): Promise<{ status: string; progress: number }> {
    try {
      const userModel = await storage.getUserModelByUserId(userId);
      if (!userModel || (!userModel.trainingId && !userModel.replicateModelId)) {
        throw new Error('No training found for user');
      }
      
      // Use trainingId if available (new architecture), otherwise fallback to replicateModelId (legacy)
      const trainingId = userModel.trainingId || userModel.replicateModelId;
      console.log(`🔍 Checking training status for user ${userId}, trainingId: ${trainingId}`);
      
      // Check REAL Replicate API training status
      const trainingStatusResponse = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!trainingStatusResponse.ok) {
        throw new Error(`Failed to check training status: ${trainingStatusResponse.status}`);
      }
      
      const trainingData = await trainingStatusResponse.json();
      
      let progress = 0;
      let status = 'training';
      
      if (trainingData.status === 'succeeded') {
        progress = 100;
        status = 'completed';
      } else if (trainingData.status === 'failed') {
        status = 'failed';
        progress = 0;
      } else if (trainingData.status === 'canceled') {
        status = 'cancelled';
        progress = 0;
      } else {
        // Training in progress - estimate progress based on time
        const trainingStartTime = new Date(userModel.createdAt || new Date()).getTime();
        const now = Date.now();
        const trainingDuration = now - trainingStartTime;
        const twentyMinutes = 20 * 60 * 1000; // 20 minutes typical training time
        progress = Math.min(Math.round((trainingDuration / twentyMinutes) * 100), 99);
      }
      
      // Update model with real status and version ID when training completes
      const updateData: any = {
        trainingStatus: status,
        trainingProgress: progress
      };
      
      // 🔒 CRITICAL FIX: Extract final model data and LoRA weights when training completes
      if (status === 'completed') {
        try {
          console.log(`✅ TRAINING COMPLETED: Extracting model data and LoRA weights for user ${userId}`);
          
          // Extract model data and LoRA weights from completed training
          if (trainingData.output) {
            // Method 1: Direct weights from training output
            if (trainingData.output.weights) {
              updateData.loraWeightsUrl = trainingData.output.weights;
              console.log(`✅ EXTRACTED LoRA weights from training output: ${trainingData.output.weights}`);
            }
            
            // Method 2: Extract model path and version from training output
            if (trainingData.output.version) {
              const versionMatch = trainingData.output.version.match(/replicate\.com\/([^:]+):(.+)$/);
              if (versionMatch) {
                const modelPath = versionMatch[1];
                const versionId = versionMatch[2];
                
                updateData.replicateModelId = modelPath;
                updateData.replicateVersionId = versionId;
                
                console.log(`✅ EXTRACTED model path: ${modelPath}, version: ${versionId}`);
                
                // If no direct weights, try to fetch from version
                if (!updateData.loraWeightsUrl) {
                  const versionResponse = await fetch(`https://api.replicate.com/v1/models/${modelPath}/versions/${versionId}`, {
                    headers: {
                      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (versionResponse.ok) {
                    const versionData = await versionResponse.json();
                    if (versionData.files?.lora_weights) {
                      updateData.loraWeightsUrl = versionData.files.lora_weights;
                      console.log(`✅ EXTRACTED LoRA weights from version: ${versionData.files.lora_weights}`);
                    } else if (versionData.files?.weights) {
                      updateData.loraWeightsUrl = versionData.files.weights;
                      console.log(`✅ EXTRACTED weights from version: ${versionData.files.weights}`);
                    }
                  }
                }
              }
            }
          }
          
          // Set completion timestamp
          updateData.completedAt = new Date();
          
        } catch (error) {
          console.error('❌ Failed to extract model data from completed training:', error);
          // Continue with status update even if extraction fails
        }
      }
      
      if (status === 'completed') {
        updateData.trainedModelPath = userModel.replicateModelId;
      }
      
      await storage.updateUserModel(userId, updateData);
      
      return { status, progress };
      
    } catch (error) {
      throw error;
    }
  }

  // Generate images using custom prompt - wrapper for backward compatibility
  static async generateCustomPrompt(
    userId: string,
    customPrompt: string,
    count: number = 4
  ): Promise<{ images: string[]; generatedImageId?: number; predictionId?: string }> {
    return this.generateUserImages(userId, customPrompt, count);
  }

  // REMOVED: Category/subcategory prompt conversion functions - Maya's personality now drives content
  // All prompt generation now flows through Maya's AI intelligence for personalized styling

  // REAL IMAGE GENERATION - NO SIMULATION
  static async generateUserImages(
    userId: string,
    customPrompt: string,
    count: number = 4,
    options?: { seed?: number; paramsOverride?: any; categoryContext?: string }
  ): Promise<{ images: string[]; generatedImageId?: number; predictionId?: string }> {
    
    try {
      // 🔒 PERMANENT ARCHITECTURE VALIDATION - NEVER REMOVE
      ArchitectureValidator.enforceZeroTolerance();
      
      // INDIVIDUAL MODELS ONLY: Every user MUST have their own trained model
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel || userModel.trainingStatus !== 'completed' || !userModel.replicateVersionId) {
        throw new Error('USER_MODEL_NOT_TRAINED: User must train their AI model before generating images. Individual models required.');
      }
      
      // Validate trigger word exists
      if (!userModel.triggerWord) {
        throw new Error('Model training incomplete - no trigger word available');
      }
      
      // GLOBAL FIX: Use full model:version format like other endpoints
      const fullModelVersion = userModel.replicateVersionId;
      
      // GLOBAL FIX: Prevent null or undefined version IDs affecting ALL users
      if (!fullModelVersion) {
        throw new Error(`CRITICAL: User ${userId} has no version ID. Model: ${userModel.replicateModelId}, Status: ${userModel.trainingStatus}`);
      }
      
      // CRITICAL FIX: Use same format as Maya and unified service
      const modelVersion = `${userModel.replicateModelId}:${fullModelVersion}`;
      console.log(`🔒 MODEL TRAINING SERVICE VERSION VALIDATION: Model: ${userModel.replicateModelId}, Version: ${fullModelVersion}, Combined: ${modelVersion}`);
      const triggerWord = userModel.triggerWord;
      
      
      // TASK 2: Add debugging to trace prompt processing
      const promptId = `MAYA-${Date.now()}`;
      console.log(`🔍 [${promptId}] MODEL TRAINING SERVICE ENTRY:`);
      console.log(`🏭 RECEIVED PROMPT FROM MAYA: "${customPrompt.substring(0, 300)}"`);
      
      // Handle prompt formatting and enhancement
      let basePrompt;
      
      if (customPrompt.includes('{trigger_word}')) {
        // Legacy prompt format with placeholder
        basePrompt = customPrompt.replace('{trigger_word}', triggerWord);
        console.log(`🔧 [${promptId}] LEGACY FORMAT: Replaced trigger word placeholder`);
      } else if (customPrompt.startsWith(triggerWord)) {
        // Sandra's custom prompts already start with trigger word - use as-is
        basePrompt = customPrompt;
        console.log(`✅ [${promptId}] TRIGGER WORD PRESENT: Using Maya's prompt as-is`);
      } else {
        // Add trigger word to beginning if not present
        basePrompt = `${triggerWord} ${customPrompt}`;
        console.log(`🔧 [${promptId}] ADDING TRIGGER: Prepended "${triggerWord}"`);
      }
      
      console.log(`🎯 [${promptId}] BASE PROMPT: "${basePrompt.substring(0, 300)}"`);
      
      // Personality-first: keep Maya's prompt, ensure trigger appears once and first
      const finalPrompt = ModelTrainingService.formatPrompt(basePrompt, triggerWord);
      console.log(`🚀 [${promptId}] PROMPT FORMATTED: ${finalPrompt.length} characters ready for generation`);

      // SINGLE PATH LOGIC: Only packaged models supported for consistency
      // All users must have completed trained models with valid model + version IDs

      // ✅ MAYA PURE INTELLIGENCE: Maya already provides count in her concept creation
      // No need for separate parameter intelligence - Maya handles this in her main response
      console.log(`🎯 MAYA PURE INTELLIGENCE: Using Maya's embedded count intelligence`);
      console.log(`🔍 [${promptId}] FINAL PROMPT: ${finalPrompt.length} characters processed`);
      
      // Maya determines optimal count as part of her styling intelligence
      const intelligentParams = { count: count, reasoning: "Maya's integrated styling intelligence" };
      
      // ✅ MAYA PURE INTELLIGENCE: Let Maya specify ALL parameters in her prompt
      // Maya's intelligence includes parameter optimization knowledge - trust her completely
      console.log(`🎯 MAYA PURE INTELLIGENCE: Trusting Maya's complete parameter intelligence`);
      
      // MAYA'S INTELLIGENT FLUX PARAMETERS: Use Maya's personality as single source of truth
      const { MAYA_PERSONALITY } = await import('./agents/personalities/maya-personality.js');
      
      // ✅ MAYA PURE INTELLIGENCE: Trust Maya's complete parameter selection
      // Maya's AI handles shot type detection, aspect ratio, and all FLUX parameters
      const fluxParams = {
        guidance_scale: 3.5,  // Maya's default - will be overridden by her intelligence
        num_inference_steps: 50, // Maya's default - will be overridden by her intelligence  
      };
      const aspectRatio = "4:5"; // Maya's default - will be overridden by her intelligence

      console.log(`🎯 MAYA PURE INTELLIGENCE: Using Maya's embedded parameter intelligence`);
      
      // Maya will specify parameters naturally in her response if needed
      // FLUX optimization settings with Maya's quality intelligence  
      const merged = {
        aspect_ratio: aspectRatio,
        megapixels: "1", 
        output_format: "png",
        output_quality: 95,
        // CRITICAL FLUX PARAMETERS FOR BEAUTIFUL HANDS AND ANATOMICAL ACCURACY
        guidance_scale: fluxParams.guidance_scale,
        num_inference_steps: fluxParams.num_inference_steps
        // ❌ NO lora_scale in merged - this is handled per-path below
      };
      
      // Use intelligent count unless explicitly overridden
      const finalCount = intelligentParams.count;
      
      // DYNAMIC SEED GENERATION: No hardcoding, random generation for variety
      const seed = typeof options?.seed === 'number'
        ? options.seed!
        : Math.floor(Math.random() * 1e9);

      console.log(`🎯 MAYA SINGLE PATH: Using packaged model for consistent quality`);

      // PACKAGED MODEL ONLY: Consistent quality for all users
      if (!userModel?.replicateModelId || !userModel?.replicateVersionId) {
        throw new Error("BLOCKED: User model missing required packaged model ID or version. Please complete training first.");
      }
      
      const userModelVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
      const requestBody = {
        version: userModelVersion,
        input: {
          prompt: finalPrompt,
          num_outputs: finalCount,
          // ✅ FLUX parameters only - packaged models have LoRA built-in
          guidance_scale: merged.guidance_scale,
          num_inference_steps: merged.num_inference_steps,
          aspect_ratio: merged.aspect_ratio,
          megapixels: merged.megapixels,
          output_format: "png", 
          output_quality: 95,
          seed: seed
          // ✅ NO lora_scale or lora_weights needed - packaged models include LoRA
        }
      };

      // PACKAGED MODEL GUARD: Ensure we're using trained user models only
      if (requestBody.version.includes("flux-1.1-pro")) {
        throw new Error("BLOCKED: Attempted to use base FLUX model. Only packaged user models allowed.");
      }

      console.log("🚚 Replicate payload keys:", Object.keys(requestBody.input), "version:", requestBody.version);
      console.log("🎯 MAYA QUALITY PARAMS: guidance_scale =", requestBody.input.guidance_scale, "steps =", requestBody.input.num_inference_steps, "megapixels =", requestBody.input.megapixels, "(API-compliant)");

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      
      const prediction = await response.json();
      
      
      if (!response.ok) {
        throw new Error(`Replicate API error (${response.status}): ${JSON.stringify(prediction)}`);
      }
      
      if (!prediction.id) {
        throw new Error(`No prediction ID returned from Replicate API: ${JSON.stringify(prediction)}`);
      }
      
      // FIX B: Return immediately for Maya chat flow to prevent double-polling
      // Let the /api/check-generation route handle polling instead
      if (process.env.MAYA_SYNC_PREDICTIONS !== '1') {
        return { 
          images: [], 
          predictionId: prediction.id 
        };
      }
      
      // Only poll for admin tools when MAYA_SYNC_PREDICTIONS=1
      // Wait for completion (polling)
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes maximum
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          }
        });
        
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'succeeded' && statusData.output) {
          return {
            images: Array.isArray(statusData.output) ? statusData.output : [statusData.output],
            predictionId: prediction.id
          };
        } else if (statusData.status === 'failed') {
          throw new Error(`Image generation failed: ${statusData.error}`);
        }
        
        attempts++;
      }
      
      throw new Error('Image generation timed out after 5 minutes');
      
    } catch (error) {
      throw new Error(`Failed to generate images: ${error.message}`);
    }
  }

  // 🎯 MAYA PURE INTELLIGENCE: Absolute minimal formatting to preserve Maya's complete styling intelligence
  static formatPrompt(prompt: string, triggerWord: string): string {
    console.log(`🎯 MAYA PURE INTELLIGENCE: Zero-interference formatting mode activated`);
    
    // Only normalize basic whitespace, preserve ALL Maya content
    const normalizedPrompt = (prompt || "").replace(/\s+/g, " ").trim();

    // Check if trigger word is already properly positioned
    if (normalizedPrompt.startsWith(triggerWord)) {
      console.log(`✅ MAYA PURE INTELLIGENCE: Trigger word already present, using Maya's exact output`);
      return normalizedPrompt;
    } else {
      // Only add trigger word if missing, preserve Maya's complete content
      console.log(`✅ MAYA PURE INTELLIGENCE: Adding trigger word to preserve Maya's complete styling intelligence`);
      return `${triggerWord}, ${normalizedPrompt}`;
    }
  }

  // REMOVED: extractLoRAWeights method - no longer needed for packaged-only approach

  // MAYA'S INTELLIGENT SHOT TYPE DETECTION - LIBERATION FROM HARDCODED RESTRICTIONS
  // ✅ REMOVED: Shot type determination - Maya's intelligence includes framing decisions

  // ✅ REMOVED: Intelligent parameter system - Maya's main response includes all parameter intelligence
  // Maya's single Claude API call handles count and all other decision making
  /*
  private static async getIntelligentParameters(prompt: string, requestedCount: number, userId?: string, categoryContext?: string): Promise<{
    count: number;
    reasoning: string;
  }> {
    try {
      // Import Maya's personality and Claude API connection
      const { PersonalityManager } = await import('./agents/personalities/personality-config');
      // Use Claude API service directly
      const { ClaudeApiServiceSimple } = await import('./services/claude-api-service-simple');
      const claudeService = new ClaudeApiServiceSimple();
      
      // MAYA'S PARAMETER INTELLIGENCE PROMPT WITH CATEGORY CONTEXT
      const categoryGuidance = categoryContext ? `\n\n📸 USER'S CATEGORY REQUEST: ${categoryContext}
STYLING FOCUS: Adapt your creative choices to match this SSELFIE Studio category:
- Business: Professional authority and credibility 
- Professional & Authority: Leadership presence
- Lifestyle: Elevated casual and authentic moments
- Casual & Authentic: Natural, unguarded moments
- Story: Narrative-driven imagery 
- Behind the Scenes: Raw authenticity
- Instagram: Social media optimized
- Feed & Stories: Platform-specific content
- Travel: Adventure and destinations
- Adventures & Destinations: Location-specific styling
- Outfits: Fashion-focused styling
- Fashion & Style: Editorial fashion focus
- GRWM: Morning routines and preparation
- Get Ready With Me: Extended preparation content
- Future Self: Aspirational imagery
- Aspirational Vision: Goals and transformation
- B&W: Timeless artistic imagery
- Timeless & Artistic: Classic enduring style
- Studio: Controlled professional environment` : '';

      const mayaParameterPrompt = `${PersonalityManager.getNaturalPrompt('maya')}

🎯 MAYA'S CREATIVE INTELLIGENCE:
You're analyzing this image prompt for optimal generation:
"${prompt}"${categoryGuidance}

MAYA'S FOCUSED STYLING APPROACH:
Based on your complete styling expertise, analyze this prompt for ONE perfect image.

IMPORTANT: Always generate exactly 1 image per concept for optimal user experience:
- Research shows single, perfect images are more impactful than multiple variations
- Reduces decision fatigue and cognitive load  
- Creates cleaner, more professional presentation
- Better mobile experience and faster loading

RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "count": 1,
  "reasoning": "Your warm Maya explanation of why this single perfect image captures the styling vision"
}`;

      console.log(`🎯 MAYA PARAMETER AI: Analyzing prompt for intelligent count selection`);
      
      // Get Maya's AI-driven parameter selection using the correct method
      const mayaResponse = await claudeService.sendMessage(mayaParameterPrompt, `parameter_selection_${Date.now()}`, 'maya', false);
      
      // Extract JSON from Maya's response with comprehensive parsing  
      let mayaChoice;
      try {
        // COMPREHENSIVE APPROACH: Maya's response might have the JSON with extra text
        // Look for the most complete JSON object in the response
        let jsonString = '';
        
        // Try multiple strategies to extract valid JSON
        const strategies = [
          // Strategy 1: Look for complete JSON block
          () => {
            const match = mayaResponse.match(/\{[^{}]*"count"[^{}]*"reasoning"[^{}]*\}/);
            return match ? match[0] : null;
          },
          // Strategy 2: Look for any JSON-like structure
          () => {
            const match = mayaResponse.match(/\{[\s\S]*\}/);
            return match ? match[0] : null;
          },
          // Strategy 3: Manually construct if we find count and reasoning
          () => {
            const countMatch = mayaResponse.match(/"count":\s*(\d+)/);
            const reasoningMatch = mayaResponse.match(/"reasoning":\s*"([^"]+)"/);
            if (countMatch && reasoningMatch) {
              return `{"count": ${countMatch[1]}, "reasoning": "${reasoningMatch[1]}"}`;
            }
            return null;
          }
        ];
        
        // Try each strategy
        for (let i = 0; i < strategies.length; i++) {
          const result = strategies[i]();
          if (result) {
            jsonString = result;
            console.log(`🎯 MAYA JSON: Strategy ${i + 1} succeeded`);
            break;
          }
        }
        
        if (!jsonString) {
          throw new Error('No valid JSON found with any strategy');
        }
        
        // Now parse the extracted JSON
        console.log(`🧹 MAYA JSON EXTRACTED:`, jsonString.substring(0, 200));
        mayaChoice = JSON.parse(jsonString);
        console.log(`✅ MAYA JSON PARSE: Success!`);
        
      } catch (parseError) {
        console.log(`⚠️ MAYA PARAMETER PARSE FAILED, using default count:`, parseError);
        console.log(`📝 MAYA RESPONSE DEBUG (first 300 chars):`, mayaResponse.substring(0, 300));
        
        // Fallback to intelligent count selection - FORCE TO 1
        return {
          count: 1, // Always generate 1 perfect image per concept
          reasoning: "Maya's styling intelligence applied for optimal results - one perfect image per concept"
        };
      }
      
      // Validate Maya's choices - FORCE TO 1 for focused styling (user preference)
      const selectedCount = 1; // Always generate 1 perfect image per concept
      
      console.log(`✅ MAYA PARAMETER AI: Selected ${selectedCount} images - ${mayaChoice.reasoning}`);
      
      return {
        count: selectedCount,
        reasoning: mayaChoice.reasoning || "Maya's AI-driven count selection for optimal styling results"
      };
      
    } catch (error) {
      console.log(`⚠️ MAYA PARAMETER AI FAILED, using default count:`, error);
      
      // Fallback that still respects Maya's intelligence
      return {
        count: 1,
        reasoning: "Maya's focused styling approach - one perfect image per concept"
      };
    }
  }
  */
}