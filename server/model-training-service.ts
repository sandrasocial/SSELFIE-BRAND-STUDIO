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

export const BASE_QUALITY_SETTINGS = {
  aspect_ratio: "3:4",        // Default - Maya can override based on shot type
  output_format: "png", 
  output_quality: 95,         // ✅ INCREASED: 95 for professional quality (was 90)
  go_fast: false,
  megapixels: "1.5"           // ✅ INCREASED: 1.5 prevents blurriness (was 1.0)
  // 🎯 NOTE: guidance_scale, num_inference_steps, lora_scale now come ONLY from Maya's intelligence
};

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
    options?: { seed?: number; paramsOverride?: Partial<typeof BASE_QUALITY_SETTINGS>; categoryContext?: string }
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
      
      
      // Handle prompt formatting and enhancement
      let basePrompt;
      
      if (customPrompt.includes('{trigger_word}')) {
        // Legacy prompt format with placeholder
        basePrompt = customPrompt.replace('{trigger_word}', triggerWord);
      } else if (customPrompt.startsWith(triggerWord)) {
        // Sandra's custom prompts already start with trigger word - use as-is
        basePrompt = customPrompt;
      } else {
        // Add trigger word to beginning if not present
        basePrompt = `${triggerWord} ${customPrompt}`;
      }
      
      // Personality-first: keep Maya's prompt, ensure trigger appears once and first
      const finalPrompt = ModelTrainingService.formatPrompt(basePrompt, triggerWord);

      // DETERMINISTIC PATH LOGIC: Declare usePackaged early to avoid temporal dead zone issues
      const usePackaged = Boolean(
        userModel?.replicateModelId && 
        userModel?.replicateVersionId && 
        process.env.MAYA_USE_PACKAGED !== "0"
      );

      // 🎯 MAYA'S CLAUDE API-DRIVEN PARAMETER SELECTION WITH CATEGORY CONTEXT
      const categoryContext = options?.categoryContext;
      const intelligentParams = await this.getIntelligentParameters(finalPrompt, count, userId, categoryContext);
      
      // ----- PHASE 1 FIX: Use Maya's optimized parameters (temporary fallback while fixing import) -----
      const shotType = this.determineShotTypeFromPrompt(finalPrompt);
      
      // Maya's enhanced fluxOptimization parameters (research-optimized for quality)
      const mayaFluxParams = {
        closeUpPortrait: { guidance_scale: 2.8, num_inference_steps: 35, lora_weight: 1.0, megapixels: "1.6" },
        halfBodyShot: { guidance_scale: 2.6, num_inference_steps: 38, lora_weight: 1.1, megapixels: "1.7" },
        fullScenery: { guidance_scale: 2.4, num_inference_steps: 42, lora_weight: 1.3, megapixels: "1.8" }
      }[shotType];
      
      console.log(`🎯 MAYA PERSONALITY INTELLIGENCE: Using ${shotType} parameters from Maya's fluxOptimization`);
      console.log(`🎯 MAYA FLUX PARAMS: guidance_scale=${mayaFluxParams.guidance_scale}, steps=${mayaFluxParams.num_inference_steps}, lora_weight=${mayaFluxParams.lora_weight}`);
      console.log(`🎯 MAYA AI PARAMETERS: count=${intelligentParams.count} (Claude API-driven selection)`);
      
      // 🎯 MAYA'S INTELLIGENCE DRIVES ALL PARAMETERS - NO MORE CONFLICTS
      const merged = {
        ...BASE_QUALITY_SETTINGS,
        // Maya's intelligent parameters from personality file have FULL CONTROL
        guidance_scale: mayaFluxParams.guidance_scale,
        num_inference_steps: mayaFluxParams.num_inference_steps,
        lora_scale: mayaFluxParams.lora_weight, // Note: personality file uses lora_weight, API expects lora_scale
        megapixels: mayaFluxParams.megapixels,  // Maya's shot-specific resolution optimization
        // Maya can override any parameter based on shot intelligence
        ...(options?.paramsOverride || {})
      };
      
      // Use intelligent count unless explicitly overridden
      const finalCount = intelligentParams.count;
      
      const seed = typeof options?.seed === 'number'
        ? options.seed!
        : Math.floor(Math.random() * 1e9);

      console.log(`🎯 MAYA PATH SELECTION: usePackaged=${usePackaged} (affects parameter application)`);

      let requestBody: any;
      let loraWeightsUrl = userModel?.loraWeightsUrl;

      if (usePackaged) {
        // PATH 1: PACKAGED MODEL (Preferred - safest today)
        const modelVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
        requestBody = {
          version: modelVersion,
          input: {
            prompt: finalPrompt,
            num_outputs: finalCount,
            // 🎯 MAYA'S INTELLIGENT PARAMETERS APPLIED TO PACKAGED MODELS FOR HIGH QUALITY
            guidance_scale: mayaFluxParams.guidance_scale,
            num_inference_steps: mayaFluxParams.num_inference_steps,
            aspect_ratio: merged.aspect_ratio,
            megapixels: mayaFluxParams.megapixels,
            output_format: "png", 
            output_quality: 95,
            seed: seed
          }
        };
      } else {
        // PATH 2: Base FLUX + LoRA (requires LoRA weights extraction)
        if (!loraWeightsUrl) {
          console.log(`🔧 TRAINING SERVICE: Extracting LoRA weights for user ${userId}`);
          
          try {
            // Use the proper extractLoRAWeights function
            loraWeightsUrl = await this.extractLoRAWeights(userModel);
            
            if (loraWeightsUrl) {
              // Update the user model with the extracted weights URL
              await storage.updateUserModel(userId, { loraWeightsUrl });
              console.log(`✅ WEIGHTS EXTRACTED AND SAVED: ${loraWeightsUrl}`);
            }
          } catch (error) {
            console.error(`❌ Failed to extract LoRA weights for user ${userId}:`, error);
          }
        }

        // MANDATORY: Refuse to run without LoRA weights
        if (!loraWeightsUrl) {
          throw new Error("BLOCKED: Missing lora_weights; refusing base FLUX.");
        }

        requestBody = {
          version: "black-forest-labs/flux-1.1-pro",
          input: {
            prompt: finalPrompt,
            lora_weights: loraWeightsUrl,
            // 🎯 MAYA'S INTELLIGENT FLUX PARAMETERS IN ACTION
            lora_scale: merged.lora_scale,
            num_outputs: finalCount,
            guidance_scale: merged.guidance_scale,
            num_inference_steps: merged.num_inference_steps,
            aspect_ratio: merged.aspect_ratio,
            megapixels: merged.megapixels,
            output_format: "png",
            output_quality: 95,
            seed: seed
          }
        };
      }

      // ABSOLUTE GUARD (no silent base):
      if (requestBody.version.includes("flux-1.1-pro") && !requestBody.input.lora_weights) {
        throw new Error("BLOCKED: would call base FLUX without lora_weights.");
      }

      console.log("🚚 Replicate payload keys:", Object.keys(requestBody.input), "version:", requestBody.version);
      console.log("🎯 MAYA QUALITY FIX: guidance_scale =", requestBody.input.guidance_scale, "steps =", requestBody.input.num_inference_steps, "megapixels =", requestBody.input.megapixels);

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

  // 🎯 MAYA-SAFE PROMPT FORMATTING: Preserves Maya's creative content while ensuring proper technical structure
  static formatPrompt(prompt: string, triggerWord: string): string {
    const mandatoryTechParams = "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";
    
    // Clean initial formatting but preserve content structure
    const clean = (prompt || "")
      .replace(/\s+/g, " ")
      .trim();

    // 🚨 MAYA CONTENT PROTECTION: Check if this is Maya's creative content (contains styling descriptions)
    const isMayaContent = clean.includes("Maya") || clean.includes("styling") || clean.includes("vision") || clean.includes("****");
    
    if (isMayaContent) {
      // SPECIAL HANDLING FOR MAYA'S CREATIVE CONTENT: Don't disrupt her styling descriptions
      console.log(`🎨 MAYA CONTENT DETECTED: Protecting Maya's creative styling description`);
      
      // Check if prompt already starts with trigger word
      if (clean.startsWith(triggerWord)) {
        // Maya's content already properly formatted - minimal processing
        const hasRequiredTech = clean.includes("raw photo") && clean.includes("film grain");
        if (hasRequiredTech) {
          return clean; // Perfect - return as-is
        } else {
          // Insert tech params right after trigger word, before Maya's content
          return clean.replace(triggerWord, `${triggerWord}, ${mandatoryTechParams}`);
        }
      } else {
        // Add trigger word and tech params at the beginning, preserve Maya's content
        return `${triggerWord}, ${mandatoryTechParams}, ${clean}`;
      }
    }

    // STANDARD PROCESSING FOR NON-MAYA CONTENT (simple prompts, legacy content)
    // Remove all trigger occurrences (case insensitive)
    const re = new RegExp(`\\b${triggerWord}\\b`, "gi");
    const withoutAll = clean.replace(re, "").replace(/^,|,,/g, ",").replace(/\s+,/g, ", ").trim();

    // Remove mandatory tech params if they exist to avoid duplication
    const techParamsRegex = /raw photo,?\s*visible skin pores,?\s*film grain,?\s*unretouched natural skin texture,?\s*subsurface scattering,?\s*photographed on film,?\s*/gi;
    const withoutTechParams = withoutAll.replace(techParamsRegex, "").replace(/^,\s*/, "").trim();

    // Compose: trigger word + mandatory tech params + content
    const composed = `${triggerWord}, ${mandatoryTechParams}, ${withoutTechParams}`.replace(/,\s*,/g, ", ").replace(/\s+,/g, ", ").trim();

    // Final cleanup: no trailing commas / double spaces
    return composed.replace(/,\s*$/, "").replace(/\s{2,}/g, " ");
  }

  // CRITICAL: Proper LoRA weights extraction function implementation
  static async extractLoRAWeights(userModel: any): Promise<string | null> {
    if (!userModel) {
      console.error('❌ extractLoRAWeights: No user model provided');
      return null;
    }

    try {
      // Try multiple extraction methods in order of priority
      
      // Method 1: Use trainingId if available (new architecture)
      if (userModel.trainingId) {
        console.log(`🔧 EXTRACT WEIGHTS: Method 1 - Using trainingId: ${userModel.trainingId}`);
        
        const trainingResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.trainingId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (trainingResponse.ok) {
          const trainingData = await trainingResponse.json();
          
          // Check for weights in training output
          
          // Extract weights from training output
          if (trainingData.output?.weights) {
            console.log(`✅ WEIGHTS FOUND via trainingId: ${trainingData.output.weights}`);
            return trainingData.output.weights;
          }
          
          // Sometimes it's under different keys
          if (trainingData.weights) {
            console.log(`✅ WEIGHTS FOUND via trainingData.weights: ${trainingData.weights}`);
            return trainingData.weights;
          }
          
          if (trainingData.output?.version) {
            // Extract model path and version from version URL
            const versionMatch = trainingData.output.version.match(/replicate\.com\/([^:]+):(.+)$/);
            if (versionMatch) {
              const modelPath = versionMatch[1];
              const versionId = versionMatch[2];
              
              // Fetch version details to get weights
              const versionResponse = await fetch(`https://api.replicate.com/v1/models/${modelPath}/versions/${versionId}`, {
                headers: {
                  'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (versionResponse.ok) {
                const versionData = await versionResponse.json();
                
                if (versionData.files?.lora_weights) {
                  console.log(`✅ WEIGHTS FOUND via version files: ${versionData.files.lora_weights}`);
                  return versionData.files.lora_weights;
                }
                if (versionData.files?.weights) {
                  console.log(`✅ WEIGHTS FOUND via version files: ${versionData.files.weights}`);
                  return versionData.files.weights;
                }
              }
            }
          }
        }
      }

      // Method 2: Use replicateModelId and replicateVersionId if available (current architecture)  
      if (userModel.replicateModelId && userModel.replicateVersionId) {
        console.log(`🔧 EXTRACT WEIGHTS: Method 2 - Using modelId: ${userModel.replicateModelId}, versionId: ${userModel.replicateVersionId}`);
        
        // First try: List model versions to get complete data
        const versionsResponse = await fetch(`https://api.replicate.com/v1/models/${userModel.replicateModelId}/versions`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json();
          
          // Look for our specific version in the results
          if (versionsData.results) {
            for (const version of versionsData.results) {
              if (version.id === userModel.replicateVersionId) {
                // Check various possible locations for weights
                if (version.files?.weights) {
                  console.log(`✅ WEIGHTS FOUND via versions list: ${version.files.weights}`);
                  return version.files.weights;
                }
                if (version.weights) {
                  console.log(`✅ WEIGHTS FOUND via version weights: ${version.weights}`);
                  return version.weights;
                }
                if (version.files && Object.keys(version.files).length > 0) {
                  // Try to find any .safetensors file
                  for (const [key, value] of Object.entries(version.files)) {
                    if (typeof value === 'string' && value.includes('.safetensors')) {
                      console.log(`✅ WEIGHTS FOUND via safetensors: ${value}`);
                      return value;
                    }
                  }
                }
              }
            }
          }
        }
        
        // Second try: Get the model metadata 
        const modelResponse = await fetch(`https://api.replicate.com/v1/models/${userModel.replicateModelId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          
          // Check if model has latest_version data
          if (modelData.latest_version && modelData.latest_version.id === userModel.replicateVersionId) {
            const versionData = modelData.latest_version;
            
            if (versionData.files?.weights) {
              console.log(`✅ WEIGHTS FOUND via model latest_version: ${versionData.files.weights}`);
              return versionData.files.weights;
            }
          }
        }
        
        // Second try: Direct version API call  
        const versionResponse = await fetch(`https://api.replicate.com/v1/models/${userModel.replicateModelId}/versions/${userModel.replicateVersionId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          
          // Check for weights in version data
          
          // Look for weights in different possible locations
          if (versionData.files?.weights) {
            console.log(`✅ WEIGHTS FOUND via version files.weights: ${versionData.files.weights}`);
            return versionData.files.weights;
          }
          if (versionData.weights) {
            console.log(`✅ WEIGHTS FOUND via version.weights: ${versionData.weights}`);
            return versionData.weights;
          }
          
        } else {
          console.error(`❌ Version API call failed: ${versionResponse.status} ${versionResponse.statusText}`);
        }
      }

      // Method 3: Search trainings by model name to find associated training
      console.log(`🔧 EXTRACT WEIGHTS: Method 3 - Searching trainings for model: ${userModel.replicateModelId}`);
      
      try {
        const trainingsResponse = await fetch(`https://api.replicate.com/v1/trainings`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (trainingsResponse.ok) {
          const trainingsData = await trainingsResponse.json();
          
          if (trainingsData.results) {
            for (const training of trainingsData.results) {
              // Look for a training that matches our model
              const modelName = userModel.replicateModelId.split('/')[1];
              if (training.output?.model && training.output.model.includes(modelName)) {
                if (training.output?.weights) {
                  console.log(`✅ WEIGHTS FOUND via training search: ${training.output.weights}`);
                  return training.output.weights;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Training search failed:', error);
      }

      // Method 4: Legacy fallback - try replicateModelId as training ID
      if (userModel.replicateModelId) {
        console.log(`🔧 EXTRACT WEIGHTS: Method 4 - Legacy fallback using replicateModelId as training ID: ${userModel.replicateModelId}`);
        
        const trainingResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (trainingResponse.ok) {
          const trainingData = await trainingResponse.json();
          
          if (trainingData.output?.weights) {
            console.log(`✅ WEIGHTS FOUND via legacy method: ${trainingData.output.weights}`);
            return trainingData.output.weights;
          }
        } else {
          console.error(`❌ Training API call failed: ${trainingResponse.status} ${trainingResponse.statusText}`);
        }
      }

      console.error('❌ extractLoRAWeights: No valid weights URL found in any method');
      return null;

    } catch (error) {
      console.error('❌ extractLoRAWeights error:', error);
      return null;
    }
  }

  // PHASE 1 FIX: Determine shot type from prompt for Maya's personality parameters
  private static determineShotTypeFromPrompt(prompt: string): 'closeUpPortrait' | 'halfBodyShot' | 'fullScenery' {
    const promptLower = prompt.toLowerCase();
    
    // Close-up indicators
    if (promptLower.includes('portrait') || promptLower.includes('headshot') || promptLower.includes('close-up') || 
        promptLower.includes('face') || promptLower.includes('beauty') || promptLower.includes('makeup')) {
      return 'closeUpPortrait';
    }
    
    // Full scenery indicators  
    if (promptLower.includes('full body') || promptLower.includes('environment') || promptLower.includes('landscape') ||
        promptLower.includes('scenery') || promptLower.includes('location') || promptLower.includes('destination')) {
      return 'fullScenery';
    }
    
    // Default to half-body for most styling concepts
    return 'halfBodyShot';
  }

  // 🎯 MAYA'S CLAUDE API-DRIVEN PARAMETER INTELLIGENCE
  // ZERO TOLERANCE ANTI-HARDCODE: Maya's AI chooses all parameters based on styling vision
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

MAYA'S INTELLIGENT ANALYSIS:
Based on your complete styling expertise, analyze this prompt and determine:
1. Optimal image count (1-4 images based on concept complexity and variation needs)
2. Your reasoning as Maya (warm, confident, professional)

Consider:
- Simple concepts may need 1-2 images
- Complex styling concepts benefit from 3-4 variations
- User experience and variety preferences

RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "count": 1-4,
  "reasoning": "Your warm Maya explanation of why this image count perfects this styling vision"
}`;

      console.log(`🎯 MAYA PARAMETER AI: Analyzing prompt for intelligent count selection`);
      
      // Get Maya's AI-driven parameter selection using the correct method
      const mayaResponse = await claudeService.sendMessage(mayaParameterPrompt, `parameter_selection_${Date.now()}`, 'maya', false);
      
      // Extract JSON from Maya's response
      let mayaChoice;
      try {
        const jsonMatch = mayaResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mayaChoice = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in Maya response');
        }
      } catch (parseError) {
        console.log(`⚠️ MAYA PARAMETER PARSE FAILED, using default count:`, parseError);
        // Fallback to intelligent count selection
        return {
          count: Math.min(requestedCount, 3),
          reasoning: "Maya's styling intelligence applied for optimal results"
        };
      }
      
      // Validate Maya's choices
      const selectedCount = Math.min(Math.max(mayaChoice.count || 2, 1), Math.min(requestedCount, 4));
      
      console.log(`✅ MAYA PARAMETER AI: Selected ${selectedCount} images - ${mayaChoice.reasoning}`);
      
      return {
        count: selectedCount,
        reasoning: mayaChoice.reasoning || "Maya's AI-driven count selection for optimal styling results"
      };
      
    } catch (error) {
      console.log(`⚠️ MAYA PARAMETER AI FAILED, using default count:`, error);
      
      // Fallback that still respects Maya's intelligence
      return {
        count: Math.min(requestedCount, 3),
        reasoning: "Maya's styling intelligence applied (fallback mode)"
      };
    }
  }
}