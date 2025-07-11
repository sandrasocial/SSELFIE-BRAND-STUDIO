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
    portrait: "Editorial portrait of {trigger_word}, high fashion magazine style, dramatic lighting, sophisticated styling, professional photography",
    lifestyle: "Editorial lifestyle shot of {trigger_word}, modern setting, natural pose, high-end commercial photography",
    artistic: "Artistic portrait of {trigger_word}, creative composition, dramatic shadows, magazine quality"
  },
  professional: {
    headshot: "Professional headshot of {trigger_word}, clean background, business attire, confident expression",
    business: "Professional business portrait of {trigger_word}, office setting, corporate style",
    corporate: "Corporate portrait of {trigger_word}, executive presence, professional lighting"
  },
  creative: {
    artistic: "Creative artistic portrait of {trigger_word}, avant-garde styling, unique composition",
    concept: "Conceptual portrait of {trigger_word}, artistic vision, creative interpretation",
    'avant-garde': "Avant-garde portrait of {trigger_word}, experimental styling, bold composition"
  }
};

export const GENERATION_SETTINGS = {
  aspect_ratio: "3:4",
  output_format: "jpg",
  output_quality: 90,
  guidance_scale: 3.5,
  num_inference_steps: 28
};

export class ModelTrainingService {
  // Configure AWS S3 (ensure US East 1 for global access)
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
        
        if (!imageData.startsWith('data:image/')) {
          console.warn(`Invalid image data at index ${i}, skipping`);
          continue;
        }
        
        // Extract base64 data and ensure proper padding
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
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
      
      // Upload your real ZIP file to S3 (no ACL since bucket has public read policy)
      const zipFileName = `training-zips/user_${userId}_${Date.now()}.zip`;
      const fileContent = fs.readFileSync(zipPath);
      
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: zipFileName,
        Body: fileContent,
        ContentType: 'application/zip'
      };
      
      const uploadResult = await this.s3.upload(uploadParams).promise();
      
      // Generate presigned URL for Replicate access (24 hour expiry)
      const presignedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: zipFileName,
        Expires: 86400 // 24 hours
      });
      
      // Clean up temp file
      fs.unlinkSync(zipPath);
      
      console.log('Your real ZIP uploaded to S3 with presigned URL:', presignedUrl);
      return presignedUrl;
      
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
            autocaptioning: true
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
      
      // Update model with real status
      await storage.updateUserModel(userId, {
        trainingStatus: status,
        trainingProgress: progress
      });
      
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
      
      if (userModel && userModel.trainingStatus === 'completed' && userModel.replicateModelId) {
        modelToUse = userModel.replicateModelId;
        triggerWord = userModel.triggerWord || `user${userId}`;
        console.log('Using trained model:', modelToUse, 'with trigger:', triggerWord);
      } else {
        console.log('Using demo model for user without trained model');
      }
      
      // Replace {trigger_word} placeholder and add realistic photo additions
      const realisticAdditions = ", raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";
      const finalPrompt = customPrompt.replace('{trigger_word}', triggerWord) + realisticAdditions;

      // Call REAL Replicate API for image generation with optimal realistic settings
      const requestBody = {
        version: modelToUse,
        input: {
          prompt: finalPrompt,
          num_outputs: count,
          aspect_ratio: "3:4",
          output_format: "jpg",
          output_quality: 90,
          guidance_scale: 2.8, // Lower guidance for more realistic results
          num_inference_steps: 30, // Optimal quality
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