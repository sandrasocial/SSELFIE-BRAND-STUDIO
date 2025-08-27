import FormData from 'form-data';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { FLUX_PRESETS, UNIVERSAL_DEFAULT, type FluxPresetName } from './presets/flux';

// Image categories and prompt templates
export const IMAGE_CATEGORIES = {
  editorial: ['portrait', 'lifestyle', 'artistic'],
  professional: ['headshot', 'business', 'corporate'],
  creative: ['artistic', 'concept', 'avant-garde']
} as const;

// REMOVED: Hardcoded PROMPT_TEMPLATES with camera equipment - Maya's personality now drives content

export const GENERATION_SETTINGS = {
  aspect_ratio: "3:4",        // 🔧 FLUX LORA OPTIMAL: Most natural for portraits
  output_format: "png", 
  output_quality: 90,
  lora_scale: 1,              // ✅ USER OPTIMIZED: Maximum model strength (0.95 → 1)
  guidance_scale: 2.8,        // ✅ USER TESTED: Better natural results (5 → 2.8)
  num_inference_steps: 30,    // ✅ USER TESTED: Faster generation with same quality (50 → 30)
  go_fast: false,
  megapixels: "1"
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
    options?: { preset?: FluxPresetName; seed?: number; paramsOverride?: Partial<typeof GENERATION_SETTINGS> }
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

      // 🎯 MAYA'S INTELLIGENT PARAMETER SELECTION
      const intelligentParams = this.getIntelligentParameters(finalPrompt, count);
      console.log(`🎯 MAYA INTELLIGENCE: Using intelligent parameters for prompt: count=${intelligentParams.count}, guidance=${intelligentParams.guidance}, steps=${intelligentParams.steps}`);

      // ----- Merge generation parameters (defaults → preset → explicit overrides → intelligent params) -----
      const presetParams = options?.preset ? FLUX_PRESETS[options.preset] : {};
      const merged = {
        ...UNIVERSAL_DEFAULT,
        ...GENERATION_SETTINGS,
        ...presetParams,
        // Apply Maya's intelligent parameters
        guidance_scale: intelligentParams.guidance,
        num_inference_steps: intelligentParams.steps,
        ...(options?.paramsOverride || {})
      };
      
      // Use intelligent count unless explicitly overridden
      const finalCount = options?.paramsOverride?.num_outputs || intelligentParams.count;
      
      const seed = typeof options?.seed === 'number'
        ? options.seed!
        : Math.floor(Math.random() * 1e9);

      // DETERMINISTIC PATH LOGIC: Prefer PACKAGED MODEL path by default (safest today)
      const usePackaged = 
        !!(userModel?.replicateModelId && userModel?.replicateVersionId) &&
        process.env.MAYA_USE_PACKAGED !== "0"; // default true

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
            // Maya's intelligent parameters are primarily for LoRA path
            // Packaged models use their own optimized parameters
            aspect_ratio: "3:4",
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
            lora_scale: 1,
            // 🎯 MAYA'S INTELLIGENT PARAMETERS IN ACTION
            num_outputs: finalCount,
            guidance_scale: merged.guidance_scale,
            num_inference_steps: merged.num_inference_steps,
            aspect_ratio: "3:4",
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

  // Ensure the LoRA trigger is the first token and not repeated; clean commas/spaces
  static formatPrompt(prompt: string, triggerWord: string): string {
    const clean = (prompt || "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ")
      .trim();

    // remove all trigger occurrences (case insensitive)
    const re = new RegExp(`\\b${triggerWord}\\b`, "gi");
    const withoutAll = clean.replace(re, "").replace(/^,|,,/g, ",").replace(/\s+,/g, ", ").trim();

    // prepend a single trigger
    const composed = `${triggerWord}, ${withoutAll}`.replace(/,\s*,/g, ", ").replace(/\s+,/g, ", ").trim();

    // final tidying: no trailing commas / double spaces
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

  // 🎯 MAYA'S INTELLIGENT PARAMETER SELECTION - Based on shot type and prompt analysis
  private static getIntelligentParameters(prompt: string, requestedCount: number) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Maya's shot type intelligence based on lens philosophy and styling expertise
    if (lowerPrompt.includes('close-up') || lowerPrompt.includes('portrait') || lowerPrompt.includes('headshot') || 
        lowerPrompt.includes('close up') || lowerPrompt.includes('85mm lens')) {
      // Close-up portraits: fewer images, higher quality, more guidance for precision
      return { count: 2, guidance: 7.5, steps: 28 };
    }
    
    if (lowerPrompt.includes('half-body') || lowerPrompt.includes('half body') || lowerPrompt.includes('waist up') ||
        lowerPrompt.includes('50mm lens') || lowerPrompt.includes('fashion focus')) {
      // Half-body shots: balanced approach with moderate parameters
      return { count: 3, guidance: 7.0, steps: 25 };
    }
    
    if (lowerPrompt.includes('full-body') || lowerPrompt.includes('full body') || lowerPrompt.includes('full scene') || 
        lowerPrompt.includes('environmental') || lowerPrompt.includes('35mm lens') || lowerPrompt.includes('lifestyle moment')) {
      // Full scene: more variety, less guidance for natural environments
      return { count: 4, guidance: 6.5, steps: 22 };
    }
    
    // Professional/business shots typically need fewer, higher quality images
    if (lowerPrompt.includes('professional') || lowerPrompt.includes('business') || lowerPrompt.includes('linkedin') ||
        lowerPrompt.includes('executive') || lowerPrompt.includes('corporate')) {
      return { count: 2, guidance: 7.5, steps: 28 };
    }
    
    // Social media content - balanced for multiple options
    if (lowerPrompt.includes('social') || lowerPrompt.includes('instagram') || lowerPrompt.includes('content') ||
        lowerPrompt.includes('influencer')) {
      return { count: 3, guidance: 7.0, steps: 25 };
    }
    
    // Luxury/editorial concepts - fewer, more refined images
    if (lowerPrompt.includes('luxury') || lowerPrompt.includes('editorial') || lowerPrompt.includes('magazine') ||
        lowerPrompt.includes('sophisticated') || lowerPrompt.includes('elegant')) {
      return { count: 2, guidance: 7.5, steps: 28 };
    }
    
    // Default intelligent settings - balanced approach
    return { count: Math.min(requestedCount, 3), guidance: 7.0, steps: 25 };
  }
}