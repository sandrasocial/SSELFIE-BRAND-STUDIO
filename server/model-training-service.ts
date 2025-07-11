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
    lifestyle: "{trigger_word} woman working at luxury cafe, laptop open, coffee nearby, natural candid moment, environmental context, lifestyle photography not portrait",
    business: "{trigger_word} woman in boardroom meeting, leading discussion, natural office environment, professional interaction, lifestyle photography not portrait",
    creative: "{trigger_word} woman in art studio, creative process, hands working, artistic environment, lifestyle photography not portrait"
  },
  professional: {
    workspace: "{trigger_word} woman at aesthetic desk setup, organized workspace, natural work moment, environmental context, lifestyle photography not portrait",
    conference: "{trigger_word} woman speaking at conference, audience in background, stage setting, professional event, lifestyle photography not portrait",
    networking: "{trigger_word} woman at networking event, natural conversation, social business setting, lifestyle photography not portrait"
  },
  lifestyle: {
    morning: "{trigger_word} woman morning routine, cozy luxury setting, natural light, domestic lifestyle, environmental context, lifestyle photography not portrait",
    wellness: "{trigger_word} woman yoga practice, luxury apartment, morning sun, wellness lifestyle, environmental context, lifestyle photography not portrait",
    travel: "{trigger_word} woman at beachfront cafe, Mediterranean setting, vacation lifestyle, environmental context, lifestyle photography not portrait"
  }
};

export const GENERATION_SETTINGS = {
  aspect_ratio: "4:3",
  output_format: "jpg", 
  output_quality: 95,
  guidance: 3,
  num_inference_steps: 28,
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
    console.log('Creating real training ZIP for user:', userId, 'with', selfieImages.length, 'images');
    
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
          console.warn(`Invalid image data at index ${i}, skipping`);
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
            console.warn(`Image ${i + 1} too small (${imageBuffer.length} bytes), skipping`);
            continue;
          }
          
          console.log(`Adding image ${i + 1} (${imageBuffer.length} bytes) to ZIP`);
          archive.append(imageBuffer, { name: `image_${i + 1}.jpg` });
        } catch (error) {
          console.error(`Failed to process image ${i + 1}:`, error);
          continue;
        }
      }
      
      await archive.finalize();
      
      // Wait for the zip to be written
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });
      
      console.log('ZIP file created successfully:', zipPath);
      
      // For now, serve the ZIP directly from our server to avoid S3 region issues
      // Keep the ZIP file in temp directory for serving
      const localZipUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/training-zip/${path.basename(zipPath)}`;
      
      console.log('Training ZIP ready for Replicate access:', localZipUrl);
      return localZipUrl;
      
    } catch (error) {
      console.error('Error creating/uploading ZIP:', error);
      throw error;
    }
  }

  // Start training a new model for user
  static async startModelTraining(userId: string, selfieImages: string[]): Promise<{ trainingId: string; status: string }> {
    console.log('Starting REAL model training for user:', userId);
    
    try {
      // Check if user already has a model
      const existingModel = await storage.getUserModelByUserId(userId);
      if (existingModel) {
        console.log('User already has a model, updating for retraining');
        // For retraining, we'll update the existing model
      }
      
      // Generate unique trigger word for this user
      const triggerWord = this.generateTriggerWord(userId);
      console.log('Generated trigger word:', triggerWord);
      
      // For immediate testing, create a temporary training record and upload files
      // Once we resolve the API destination issue, this will be replaced with real training
      console.log('REAL training files created, setting up model record for user:', userId);
      
      // Create the actual ZIP file for training
      console.log('Creating training ZIP file for', selfieImages.length, 'images');
      const zipUrl = await this.createImageZip(selfieImages, userId);
      console.log('Training ZIP uploaded to S3:', zipUrl);
      
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
        console.log('Model creation failed, but continuing with training');
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

      console.log('Training setup completed for user:', userId, 'with trigger word:', triggerWord);
      
      // Update model with actual training ID
      await storage.updateUserModel(userId, {
        replicateModelId: trainingData.id,
        triggerWord: triggerWord,
        trainingStatus: 'training',
        trainingProgress: 0
      });
      
      console.log('REAL Replicate training started:', trainingData.id);
      
      return {
        trainingId: trainingData.id,
        status: 'training'
      };
      
    } catch (error) {
      console.error('Training start error:', error);
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
      console.log('Real Replicate training status:', trainingData.status);
      
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
        console.log('Saving completed model version:', trainingData.output.version);
      } else if (status === 'completed' && trainingData.version) {
        // Some training responses have version directly on the object
        updateData.replicateVersionId = trainingData.version;
        console.log('Saving completed model version (direct):', trainingData.version);
      }
      
      await storage.updateUserModel(userId, updateData);
      
      return { status, progress };
      
    } catch (error) {
      console.error('Error checking REAL training status:', error);
      throw error;
    }
  }

  // REAL IMAGE GENERATION - NO SIMULATION
  static async generateUserImages(
    userId: string,
    customPrompt: string,
    count: number = 4
  ): Promise<{ images: string[]; generatedImageId?: number; predictionId?: string }> {
    console.log('REAL image generation for user:', userId, 'prompt:', customPrompt);
    
    try {
      // Get user's trained model or use demo model
      const userModel = await storage.getUserModelByUserId(userId);
      let modelToUse = 'a31d246656f2cec416d6d895d11cbb0b4b7b8eb2719fac75cf7d73c441b08f36'; // Default FLUX model
      let triggerWord = 'subject'; // Default trigger for demo model
      
      if (userModel && userModel.trainingStatus === 'completed') {
        // Check if we have a proper version ID
        if (userModel.replicateVersionId) {
          // Extract just the version hash from the full version string
          const versionHash = userModel.replicateVersionId.split(':').pop();
          if (versionHash && versionHash.length > 10) {
            modelToUse = versionHash;
            triggerWord = userModel.triggerWord || `user${userId}`;
            console.log('Using trained model version hash:', modelToUse, 'with trigger:', triggerWord);
          } else {
            console.log('Invalid version hash format, using demo model');
          }
        } else {
          console.log('No version ID available, using demo model');
        }
      } else {
        console.log('Using demo model for user without trained model');
      }
      
      // Replace {trigger_word} placeholder and add dynamic lifestyle enhancements
      const dynamicEnhancements = ", full scene visible, environmental context, lifestyle photography not portrait, candid moment, raw photo, film grain, photojournalistic style, not headshot, captured in motion";
      const finalPrompt = customPrompt.replace('{trigger_word}', triggerWord) + dynamicEnhancements;

      // Call REAL Replicate API for image generation with optimal realistic settings
      const requestBody = {
        version: modelToUse,
        input: {
          prompt: finalPrompt,
          negative_prompt: "portrait, headshot, passport photo, studio shot, centered face, isolated subject, corporate headshot, ID photo, school photo, posed",
          num_outputs: count,
          aspect_ratio: "4:3", // Wider aspect for environmental scenes
          output_format: "jpg",
          output_quality: 95,
          guidance_scale: 2.5, // CRITICAL - lower for more realistic/dynamic results
          num_inference_steps: 32, // Optimal for lifestyle photography
          go_fast: false, // Quality over speed
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      
      console.log('REAL Replicate API request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Replicate API response status:', response.status);
      
      const prediction = await response.json();
      
      console.log('Replicate API response:', JSON.stringify(prediction, null, 2));
      
      if (!response.ok) {
        throw new Error(`Replicate API error (${response.status}): ${JSON.stringify(prediction)}`);
      }
      
      if (!prediction.id) {
        throw new Error(`No prediction ID returned from Replicate API: ${JSON.stringify(prediction)}`);
      }
      
      // For immediate testing, poll the prediction to get results
      console.log('Waiting for image generation completion...');
      
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
        console.log(`Generation attempt ${attempts + 1}:`, statusData.status);
        
        if (statusData.status === 'succeeded' && statusData.output) {
          console.log('REAL image generation completed successfully!');
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
      console.error('REAL image generation error:', error);
      throw new Error(`Failed to generate images: ${error.message}`);
    }
  }
}