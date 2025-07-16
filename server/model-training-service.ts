import FormData from 'form-data';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './storage';
import AWS from 'aws-sdk';

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
  aspect_ratio: "4:3",
  output_format: "jpg", 
  output_quality: 95,
  guidance: 2.8,              // OPTIMIZED: Reduced from 3.0 to 2.8 for more natural results
  num_inference_steps: 40,    // OPTIMIZED: Increased from 28 to 40 for higher quality
  go_fast: false,
  lora_scale: 1.0,
  megapixels: "1"
};

export class ModelTrainingService {
  // Configure AWS S3 (ensure US East 1 for global access and Replicate compatibility)
  private static s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  });

  // Generate unique trigger word for user
  static generateTriggerWord(userId: string): string {
    return `user${userId}`;
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
        output.on('close', resolve);
        output.on('error', reject);
      });
      
      // For now, serve the ZIP directly from our server to avoid S3 region issues
      // Keep the ZIP file in temp directory for serving
      const localZipUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/training-zip/${path.basename(zipPath)}`;
      return localZipUrl;
      
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
      
      // Create user-specific model first
      const modelName = `${userId}-selfie-lora`;
      const createModelResponse = await fetch('https://api.replicate.com/v1/models', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: "sandrasocial",
          name: modelName,
          description: `SSELFIE AI model for user ${userId}`,
          visibility: "private",
          hardware: "gpu-t4"
        })
      });

      // Model might already exist, which is OK
      if (!createModelResponse.ok && createModelResponse.status !== 422) {
      }

      // Start real Replicate training using the model-specific trainings endpoint
      const trainingResponse = await fetch('https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            input_images: zipUrl,
            trigger_word: triggerWord,
            steps: 1000,
            lora_rank: 32, // Higher for more complex poses/movements
            batch_size: 1,
            learning_rate: 1e-4, // Lower than default for better quality
            caption_prefix: "photo of",
            autocaptioning: true,
            caption_dropout_rate: 0.1, // Add variety to prevent overfitting
            noise_offset: 0.1 // Helps with dynamic range
          },
          destination: `sandrasocial/${modelName}`
        })
      });

      const trainingData = await trainingResponse.json();
      
      if (!trainingResponse.ok) {
        throw new Error(`Replicate training failed: ${JSON.stringify(trainingData)}`);
      }

      
      // Update model with actual training ID
      await storage.updateUserModel(userId, {
        replicateModelId: trainingData.id,
        triggerWord: triggerWord,
        trainingStatus: 'training',
        trainingProgress: 0
      });
      
      
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
      
      // Extract and save the model version when training succeeds
      if (status === 'completed' && trainingData.output?.version) {
        updateData.replicateVersionId = trainingData.output.version;
      } else if (status === 'completed' && trainingData.version) {
        // Some training responses have version directly on the object
        updateData.replicateVersionId = trainingData.version;
      }
      
      if (status === 'completed') {
        updateData.trainedModelPath = `sandrasocial/${userModel.replicateModelId}`;
      }
      
      await storage.updateUserModel(userId, updateData);
      
      return { status, progress };
      
    } catch (error) {
      throw error;
    }
  }

  // Convert category/subcategory to professional prompt using templates
  static getPromptFromCategorySubcategory(category: string, subcategory: string): string {
    const categoryLower = category.toLowerCase();
    const subcategoryLower = subcategory.toLowerCase();
    
    // Try to find exact match in PROMPT_TEMPLATES
    if (PROMPT_TEMPLATES[categoryLower] && PROMPT_TEMPLATES[categoryLower][subcategoryLower]) {
      return PROMPT_TEMPLATES[categoryLower][subcategoryLower];
    }
    
    // Fallback mapping for common subcategories
    const fallbackMappings: Record<string, string> = {
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
    
    return fallbackMappings[subcategoryLower] || PROMPT_TEMPLATES.editorial.lifestyle;
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
      // ZERO FALLBACKS: Every user MUST have their own trained model
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel || userModel.trainingStatus !== 'completed' || !userModel.replicateVersionId) {
        throw new Error('USER_MODEL_NOT_TRAINED: User must train their AI model before generating images. No fallback models allowed.');
      }
      
      // 🚨 CRITICAL ARCHITECTURE FIX: Use base FLUX model + user's LoRA weights
      // After training, users get individual LoRA models that work with base FLUX model
      const baseFluxModelVersion = "5ac9c5e0e3e5e39b40f82b4067de6ba58ad8ad3daf2c7c6ea28f4b23a93ad22a";
      const userLoraWeights = userModel.replicateVersionId; // This is the user's trained LoRA
      
      if (!userLoraWeights) {
        throw new Error('User LoRA weights not found - training may need to be redone');
      }
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
      
      // Enhanced prompt with film aesthetics and professional specifications (ANTI-GLOSSY)
      const filmEnhancement = "shot on Hasselblad X2D 100C, 90mm lens, heavy 35mm film grain, matte skin finish, authentic skin texture with visible pores, natural imperfections, analog film photography aesthetic, raw film negative quality, no glossy skin, no shiny skin, no oily skin, natural matte complexion, dry skin texture, non-reflective skin, natural skin oils minimal, authentic film grain texture, pronounced grain structure, Kodak Portra 400 film aesthetic";
      const fashionEnhancement = "wearing designer pieces, tailored clothing, luxury materials, sophisticated styling, elegant feminine fashion, high-end accessories, refined aesthetic";
      const environmentalEnhancement = "full scene visible, environmental context, lifestyle photography not portrait, editorial lifestyle moment";
      // Get user-specific hair characteristics with volume and movement
      let hairColorConsistency = "consistent hair color";
      // For all users, use consistent professional hair enhancement
      hairColorConsistency = "consistent hair color, natural hair tone, voluminous hair, hair with movement, tousled hair, effortless styling, bouncy hair, textured hair, never flat hair, perfectly imperfect hair";
      const subtleRetouching = "subtle light retouching, softened harsh lines, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, preserve natural skin imperfections, avoid plastic look, maintain authentic texture, enhanced natural glow, improved skin radiance, soft highlight enhancement, natural luminosity boost, editorial beauty enhancement, refined natural features";
      
      let finalPrompt = `${basePrompt}, ${hairColorConsistency}, ${filmEnhancement}, ${fashionEnhancement}, ${environmentalEnhancement}, ${subtleRetouching}`;
      

      // Call REAL Replicate API using base FLUX model + user's individual LoRA - CORRECT ARCHITECTURE
      const requestBody = {
        version: baseFluxModelVersion, // Use base FLUX model version
        input: {
          prompt: finalPrompt,
          negative_prompt: "portrait, headshot, passport photo, studio shot, centered face, isolated subject, corporate headshot, ID photo, school photo, posed, glossy skin, shiny skin, oily skin, plastic skin, overly polished, artificial lighting, fake appearance, heavily airbrushed, perfect skin, flawless complexion, heavy digital enhancement, strong beauty filter, unrealistic skin texture, synthetic appearance, smooth skin, airbrushed, retouched, magazine retouching, digital perfection, waxy skin, doll-like skin, porcelain skin, flawless makeup, heavy foundation, concealer, smooth face, perfect complexion, digital smoothing, beauty app filter, Instagram filter, snapchat filter, face tune, photoshop skin, shiny face, polished skin, reflective skin, wet skin, slick skin, lacquered skin, varnished skin, glossy finish, artificial shine, digital glow, skin blur, inconsistent hair color, wrong hair color, blonde hair, light hair, short hair, straight hair, flat hair, limp hair, greasy hair, stringy hair, unflattering hair, bad hair day, messy hair, unkempt hair, oily hair, lifeless hair, dull hair, damaged hair",
          num_outputs: count,
          aspect_ratio: "4:3", // Wider aspect for environmental scenes
          output_format: "jpg",
          output_quality: 95,
          num_inference_steps: 35, // 🔧 EXACT: Use same perfect settings as Maya/AI Photoshoot
          guidance: 2.89,          // 🔧 EXACT: Use same perfect settings as Maya/AI Photoshoot
          lora_weights: userLoraWeights, // 🔧 CRITICAL: User's individual trained LoRA
          lora_scale: 1,           // 🔧 EXACT: Use same perfect settings as Maya/AI Photoshoot
          prompt_strength: 1,      // 🔧 EXACT: Use same perfect settings as Maya/AI Photoshoot
          extra_lora_scale: 1,     // 🔧 EXACT: Use same perfect settings as Maya/AI Photoshoot
          go_fast: false, // Quality over speed
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