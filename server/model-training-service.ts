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

export const PROMPT_TEMPLATES = {
  editorial: {
    lifestyle: "{trigger_word} woman working at luxury cafe, laptop open, designer coffee cup nearby, shot on Hasselblad X2D 100C with 90mm lens, natural window lighting, wearing oversized designer sweater, sophisticated work environment, marble table surface, environmental context, lifestyle photography not portrait, heavy 35mm film grain, matte skin finish, authentic skin texture, luxury materials, editorial lifestyle moment",
    business: "{trigger_word} woman in boardroom meeting, leading discussion, head of conference table, shot on Canon EOS R5 with 85mm f/1.2L lens, professional window lighting, black power suit, modern luxury office environment, confident leadership presence, environmental context, lifestyle photography not portrait, pronounced film grain, natural skin texture, executive styling, commanding authority",
    creative: "{trigger_word} woman in art studio, creative process, hands working on project, shot on Leica SL2 with 90mm APO-Summicron lens, natural creative lighting, artistic clothing, sophisticated workspace, environmental context, lifestyle photography not portrait, raw film negative quality, visible grain structure, authentic creative styling, artistic professional environment"
  },
  professional: {
    workspace: "{trigger_word} woman at aesthetic desk setup, organized luxury workspace, natural work moment, shot on Nikon Z9 with 50mm f/1.2S lens, soft morning light, elegant work attire, modern office environment, environmental context, lifestyle photography not portrait, Kodak Portra 400 film aesthetic, matte complexion, professional luxury styling, sophisticated work setting",
    conference: "{trigger_word} woman speaking at conference, audience in background, professional stage setting, shot on Sony A7R V with 85mm f/1.4 GM lens, dramatic stage lighting, sophisticated presentation attire, luxury venue environment, environmental context, lifestyle photography not portrait, analog film photography aesthetic, natural skin imperfections, executive presence, professional authority",
    networking: "{trigger_word} woman at networking event, natural conversation, upscale business setting, shot on Fujifilm GFX100S with 110mm f/2 lens, ambient event lighting, professional cocktail attire, luxury venue atmosphere, environmental context, lifestyle photography not portrait, heavy film grain, pronounced texture, elegant networking styling, social business environment"
  },
  lifestyle: {
    morning: "{trigger_word} woman morning routine, cozy luxury home setting, natural domestic light, shot on Leica Q2 with 28mm f/1.7 lens, soft golden hour lighting, elegant loungewear, luxury apartment environment, environmental context, lifestyle photography not portrait, film negative quality, authentic grain pattern, comfortable luxury styling, intimate home moment",
    wellness: "{trigger_word} woman yoga practice, luxury apartment studio, morning sun streaming, shot on Canon R6 Mark II with 35mm f/1.8 lens, natural wellness lighting, sophisticated activewear, serene home environment, environmental context, lifestyle photography not portrait, visible grain structure, matte skin finish, wellness luxury styling, peaceful practice moment",
    travel: "{trigger_word} woman at beachfront cafe, Mediterranean coastal setting, vacation lifestyle moment, shot on Hasselblad X2D with 90mm lens, golden hour ocean lighting, flowing designer resort wear, luxury coastal environment, environmental context, lifestyle photography not portrait, Kodak Portra 400 film aesthetic, natural skin texture, vacation luxury styling, coastal sophistication"
  }
};

export const GENERATION_SETTINGS = {
  aspect_ratio: "3:4",        // 🔧 FLUX LORA OPTIMAL: Most natural for portraits
  output_format: "png", 
  output_quality: 90,
  lora_scale: 1,              // ✅ USER OPTIMIZED: Maximum model strength (0.95 → 1)
  guidance: 2.8,              // ✅ USER TESTED: Better natural results (5 → 2.8)
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

      
      // ✅ CRITICAL FIX: Store training ID temporarily during training
      // The replicateModelId will be updated to the final model version when training completes
      console.log(`🔍 Storing training ID: ${trainingData.id} for user ${userId}`);
      await storage.updateUserModel(userId, {
        replicateModelId: trainingData.id, // Temporary training ID - will be updated to model version on completion
        triggerWord: triggerWord,
        trainingStatus: 'training',
        trainingProgress: 0
      });
      console.log(`✅ Training ID stored successfully for user ${userId}`);
      
      
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
      if (!userModel || !userModel.replicateModelId) {
        throw new Error('No training found for user');
      }
      
      // Check REAL Replicate API training status
      const trainingStatusResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
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
      
      // 🔒 CRITICAL FIX: Fetch actual trained model version ID when training succeeds
      if (status === 'completed') {
        try {
          // Get the trained model's actual version ID from Replicate API
          const modelName = `${userId}-selfie-lora`;
          const modelResponse = await fetch(`https://api.replicate.com/v1/models/${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (modelResponse.ok) {
            const modelData = await modelResponse.json();
            // Use the latest version ID from the trained model
            if (modelData.latest_version?.id) {
              updateData.replicateVersionId = modelData.latest_version.id;
              updateData.replicateModelId = `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`; // Update to actual model name
            }
          }
        } catch (error) {
          console.error('Failed to fetch trained model version:', error);
          // Don't update replicateVersionId if we can't get the correct one
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

  // Convert category/subcategory to professional prompt using templates
  static getPromptFromCategorySubcategory(category: string, subcategory: string): string {
    const categoryLower = category.toLowerCase();
    const subcategoryLower = subcategory.toLowerCase();
    
    // Try to find exact match in PROMPT_TEMPLATES
    if (PROMPT_TEMPLATES[categoryLower] && PROMPT_TEMPLATES[categoryLower][subcategoryLower]) {
      return PROMPT_TEMPLATES[categoryLower][subcategoryLower];
    }
    
    // Category mapping for common subcategories
    const categoryMappings: Record<string, string> = {
      'magazine cover': PROMPT_TEMPLATES.editorial.business,
      'fashion': PROMPT_TEMPLATES.editorial.creative,
      'business': PROMPT_TEMPLATES.editorial.business,
      'working': PROMPT_TEMPLATES.lifestyle.morning,
      'travel': PROMPT_TEMPLATES.lifestyle.travel,
      'home': PROMPT_TEMPLATES.lifestyle.morning,
      'social': PROMPT_TEMPLATES.professional.networking,
      'headshot': PROMPT_TEMPLATES.professional.workspace,
      'creative': PROMPT_TEMPLATES.editorial.creative,
      'professional': PROMPT_TEMPLATES.professional.conference,
      'yacht': PROMPT_TEMPLATES.lifestyle.travel,
      'villa': PROMPT_TEMPLATES.lifestyle.morning,
      'shopping': PROMPT_TEMPLATES.editorial.lifestyle,
      'events': PROMPT_TEMPLATES.professional.networking
    };
    
    return categoryMappings[subcategoryLower] || PROMPT_TEMPLATES.editorial.lifestyle;
  }

  // Generate images from category/subcategory (AI Generator usage)
  static async generateUserImagesFromCategory(
    userId: string,
    category: string,
    subcategory: string,
    count: number = 4
  ): Promise<{ images: string[]; generatedImageId?: number; predictionId?: string }> {
    // Convert category/subcategory to professional prompt
    const promptTemplate = this.getPromptFromCategorySubcategory(category, subcategory);
    
    // Use the custom prompt generation method
    return this.generateUserImages(userId, promptTemplate, count);
  }

  // REAL IMAGE GENERATION - NO SIMULATION
  static async generateUserImages(
    userId: string,
    customPrompt: string,
    count: number = 4
  ): Promise<{ images: string[]; generatedImageId?: number; predictionId?: string }> {
    
    try {
      // 🔒 PERMANENT ARCHITECTURE VALIDATION - NEVER REMOVE
      ArchitectureValidator.enforceZeroTolerance();
      
      // INDIVIDUAL MODELS ONLY: Every user MUST have their own trained model
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel || userModel.trainingStatus !== 'completed' || !userModel.replicateVersionId) {
        throw new Error('USER_MODEL_NOT_TRAINED: User must train their AI model before generating images. Individual models required.');
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
      const triggerWord = userModel.triggerWord || `user${userId}`;
      
      
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
      
      // REALISTIC FILM PHOTOGRAPHY ENHANCEMENT - Simplified for natural results
      const filmEnhancement = "shot on Hasselblad X2D 100C with 90mm lens, natural 35mm film grain, authentic film photography, Kodak Portra 400 film stock, natural skin texture, analog photography aesthetic";
      const fashionEnhancement = "wearing designer pieces, tailored clothing, luxury materials, sophisticated styling, elegant feminine fashion, high-end accessories, refined aesthetic";
      const environmentalEnhancement = "full scene visible, environmental context, lifestyle photography not portrait, editorial lifestyle moment";
      // Natural hair enhancement without AI terminology
      let hairColorConsistency = "consistent hair color, natural hair tone, voluminous hair with movement, effortless hair styling, natural hair texture, healthy hair appearance";
      const naturalLighting = "natural lighting, soft diffused light, authentic photographic lighting, professional film photography lighting";
      
      let finalPrompt = `${basePrompt}, ${hairColorConsistency}, ${filmEnhancement}, ${fashionEnhancement}, ${environmentalEnhancement}, ${naturalLighting}`;
      

      // CRITICAL: Extract LoRA weights if not available using comprehensive method
      let loraWeightsUrl = userModel?.loraWeightsUrl;
      
      if (!loraWeightsUrl && userModel?.replicateModelId) {
        console.log(`🔧 TRAINING SERVICE: Extracting LoRA weights for user ${userId}`);
        
        try {
          // First try: Check the original training to get weights
          const trainingResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (trainingResponse.ok) {
            const trainingData = await trainingResponse.json();
            
            // Extract weights using the same comprehensive logic as the completion monitor
            if (trainingData.output) {
              if (trainingData.output.weights) {
                loraWeightsUrl = trainingData.output.weights;
                console.log(`🎯 EXTRACTED weights from training.output.weights: ${loraWeightsUrl}`);
              } else if (trainingData.output.version) {
                // Extract model path from version URL
                const versionMatch = trainingData.output.version.match(/replicate\.com\/([^:]+):(.+)$/);
                if (versionMatch) {
                  const modelPath = versionMatch[1];
                  const extractedVersionId = versionMatch[2];
                  
                  // Fetch version details
                  const versionResponse = await fetch(`https://api.replicate.com/v1/models/${modelPath}/versions/${extractedVersionId}`, {
                    headers: {
                      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (versionResponse.ok) {
                    const versionData = await versionResponse.json();
                    if (versionData.files?.weights) {
                      loraWeightsUrl = versionData.files.weights;
                      console.log(`🎯 EXTRACTED weights from version.files.weights: ${loraWeightsUrl}`);
                    }
                  }
                }
              }
            }
            
            // Save extracted weights to database
            if (loraWeightsUrl) {
              await storage.updateUserModel(userId, {
                loraWeightsUrl: loraWeightsUrl,
                updatedAt: new Date()
              });
              console.log(`✅ TRAINING SERVICE: Saved LoRA weights for user ${userId}: ${loraWeightsUrl}`);
            }
          }
        } catch (error) {
          console.error(`❌ TRAINING SERVICE: Error extracting LoRA weights for user ${userId}:`, error);
        }
      }
      
      // CRITICAL: ALWAYS require LoRA weights - no fallbacks!
      if (!loraWeightsUrl) {
        throw new Error(`Training service requires LoRA weights for user ${userId}. Cannot generate without individual LoRA weights.`);
      }
      
      // FLUX 1.1 Pro + LoRA architecture with optimal realistic settings
      const requestBody = {
        version: "black-forest-labs/flux-1.1-pro",
        input: {
          prompt: finalPrompt,
          lora_weights: loraWeightsUrl,
          negative_prompt: "portrait, headshot, passport photo, studio shot, centered face, isolated subject, corporate headshot, ID photo, school photo, posed, glossy skin, shiny skin, oily skin, plastic skin, overly polished, artificial lighting, fake appearance, heavily airbrushed, perfect skin, flawless complexion, heavy digital enhancement, strong beauty filter, unrealistic skin texture, synthetic appearance, smooth skin, airbrushed, retouched, magazine retouching, digital perfection, waxy skin, doll-like skin, porcelain skin, flawless makeup, heavy foundation, concealer, smooth face, perfect complexion, digital smoothing, beauty app filter, Instagram filter, snapchat filter, face tune, photoshop skin, shiny face, polished skin, reflective skin, wet skin, slick skin, lacquered skin, varnished skin, glossy finish, artificial shine, digital glow, skin blur, inconsistent hair color, wrong hair color, blonde hair, light hair, short hair, straight hair, flat hair, limp hair, greasy hair, stringy hair, unflattering hair, bad hair day, messy hair, unkempt hair, oily hair, lifeless hair, dull hair, damaged hair",
          lora_scale: 1,
          guidance_scale: 2.8,
          num_inference_steps: 30,
          num_outputs: count,
          aspect_ratio: "4:5",
          output_format: "png",
          output_quality: 95,
          go_fast: false,
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      

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
      
      // For immediate testing, poll the prediction to get results
      
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
}