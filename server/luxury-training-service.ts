import FormData from 'form-data';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';
import AWS from 'aws-sdk';

// 🏆 LUXURY FLUX PRO TRAINER SERVICE
// Premium quality training using black-forest-labs/flux-pro-trainer
// For ultra-realistic professional portraits that create user addiction

export const LUXURY_PROMPT_TEMPLATES = {
  'ultra-realistic-portrait': {
    editorial: "{trigger_word} professional headshot, studio lighting setup, neutral background, direct eye contact with camera, shot on Phase One XF IQ4 150MP, 80mm lens, perfect skin detail, natural expression, high-end retouching, commercial photography quality, ultra-sharp focus, professional makeup, executive presence",
    lifestyle: "{trigger_word} candid moment in luxury setting, natural lighting, environmental portrait, authentic expression, shot on Leica SL2-S, 50mm APO-Summicron, depth of field, premium lifestyle context, magazine quality, professional color grading, natural skin texture, sophisticated styling",
    artistic: "{trigger_word} dramatic portrait lighting, creative shadows, artistic composition, emotional depth, shot on Hasselblad H6D-400c, 100mm lens, fine art photography, professional studio setup, mood lighting, sculptural quality, museum-worthy portrait, artistic vision"
  }
};

export const LUXURY_GENERATION_SETTINGS = {
  mode: "general",
  priority: "quality",           // Always prioritize quality over speed
  finetune_type: "full",         // Full fine-tuning for maximum quality
  lora_rank: 32,                 // Higher rank for complex details
  training_steps: 500,           // Optimal steps for portrait training
  learning_rate: 1e-5,           // Conservative for stable training
  captioning: "automatic"        // Let AI generate optimal captions
};

// 🔒 IMMUTABLE LUXURY ARCHITECTURE - FLUX PRO TRAINING SERVICE
// Creates individual FLUX Pro finetunes for premium users
// Each user gets ONLY their own trained model - LUXURY QUALITY
export class LuxuryTrainingService {
  private static s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  });

  // Generate luxury trigger word for user
  static generateLuxuryTriggerWord(userId: string): string {
    return `LUXE${userId}`;
  }

  // Create premium ZIP file with professional naming and structure
  static async createLuxuryImageZip(selfieImages: string[], userId: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp_luxury_training');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const zipPath = path.join(tempDir, `luxury_training_${userId}_${Date.now()}.zip`);
    
    try {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      // Add each image with professional naming and captions
      for (let i = 0; i < selfieImages.length; i++) {
        const imageData = selfieImages[i];
        
        if (!imageData.includes('data:image/') && imageData.length < 100) {
          continue;
        }
        
        let base64Data = imageData;
        if (imageData.includes('data:image/')) {
          base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
        
        try {
          const imageBuffer = Buffer.from(paddedBase64, 'base64');
          
          if (imageBuffer.length < 1000) { // Higher quality threshold
            continue;
          }
          
          const imageName = `portrait_${String(i + 1).padStart(2, '0')}.jpg`;
          archive.append(imageBuffer, { name: imageName });
          
          // Add professional caption for each image
          const captionText = `professional portrait of LUXE${userId}, high quality studio photography, natural lighting, direct camera gaze, commercial headshot quality`;
          archive.append(Buffer.from(captionText), { name: `portrait_${String(i + 1).padStart(2, '0')}.txt` });
          
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          continue;
        }
      }
      
      await archive.finalize();
      
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });
      
      const localZipUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/luxury-training-zip/${path.basename(zipPath)}`;
      return localZipUrl;
      
    } catch (error) {
      console.error('Error creating luxury training ZIP:', error);
      throw error;
    }
  }

  // Start LUXURY FLUX Pro training for premium users
  static async startLuxuryTraining(userId: string, selfieImages: string[]): Promise<{ trainingId: string; status: string; model: string }> {
    try {
      // Validate user has premium subscription
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check premium subscription status (support both plan formats)
      const isPremium = user.plan === 'sselfie-studio' || user.plan === 'sselfie-studio-premium' || user.plan === 'SSELFIE_STUDIO' || user.role === 'admin';
      if (!isPremium) {
        throw new Error('Premium subscription (€67/month) required for FLUX Pro luxury training');
      }

      // Generate luxury trigger word
      const triggerWord = this.generateLuxuryTriggerWord(userId);
      
      // Create premium training package
      const zipUrl = await this.createLuxuryImageZip(selfieImages, userId);
      
      // Create private model on Replicate
      const modelName = `${userId}-luxury-pro`;
      const createModelResponse = await fetch('https://api.replicate.com/v1/models', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: "sandrasocial",
          name: modelName,
          description: `SSELFIE Luxury Pro model for premium user ${userId}`,
          visibility: "private",
          hardware: "gpu-a100-large" // Premium hardware for luxury quality
        })
      });

      // 🏆 FLUX PRO TRAINER - Correct API format from Black Forest Labs documentation
      const trainingResponse = await fetch('https://api.replicate.com/v1/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "black-forest-labs/flux-pro-trainer",
          input: {
            input_images: zipUrl,
            trigger_word: triggerWord,
            mode: "general",
            priority: "quality",
            finetune_type: "full",
            lora_rank: 32,
            training_steps: 300,
            learning_rate: 1e-5,
            captioning: "captioning-disabled"
          },
          destination: `sandrasocial/${modelName}`
        })
      });

      const trainingData = await trainingResponse.json();
      
      if (!trainingResponse.ok) {
        console.error('FLUX Pro training failed:', trainingData);
        throw new Error(`Luxury training failed: ${JSON.stringify(trainingData)}`);
      }

      // Store luxury training record
      await storage.updateUserModel(userId, {
        replicateModelId: trainingData.id, // Training ID - will be updated to finetune_id on completion
        triggerWord: triggerWord,
        trainingStatus: 'luxury_training',
        trainingProgress: 0,
        modelType: 'flux-pro',
        isLuxury: true
      });
      
      console.log(`🏆 LUXURY TRAINING STARTED for user ${userId}:`, {
        trainingId: trainingData.id,
        model: modelName,
        triggerWord: triggerWord
      });
      
      return {
        trainingId: trainingData.id,
        status: 'luxury_training',
        model: modelName
      };
      
    } catch (error) {
      console.error('Luxury training error:', error);
      throw error;
    }
  }

  // Check luxury training status with premium monitoring
  static async checkLuxuryTrainingStatus(userId: string): Promise<{ status: string; progress: number; finetune_id?: string }> {
    try {
      const userModel = await storage.getUserModelByUserId(userId);
      if (!userModel || !userModel.replicateModelId) {
        throw new Error('No luxury training found for user');
      }
      
      // Check FLUX Pro training status
      const trainingStatusResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!trainingStatusResponse.ok) {
        throw new Error(`Failed to check luxury training status: ${trainingStatusResponse.status}`);
      }
      
      const trainingData = await trainingStatusResponse.json();
      
      let progress = 0;
      let status = 'luxury_training';
      let finetune_id = null;
      
      if (trainingData.status === 'succeeded') {
        progress = 100;
        status = 'luxury_completed';
        finetune_id = trainingData.output; // This is the finetune_id for inference
        
        // Update with luxury completion data
        await storage.updateUserModel(userId, {
          replicateModelId: finetune_id, // Now store the finetune_id for inference
          trainingStatus: 'luxury_completed',
          trainingProgress: 100,
          finetuneId: finetune_id // Store both for clarity
        });
        
      } else if (trainingData.status === 'failed') {
        status = 'luxury_failed';
        progress = 0;
      } else if (trainingData.status === 'canceled') {
        status = 'luxury_cancelled';
        progress = 0;
      } else {
        // Estimate progress for luxury training (typically takes longer)
        const trainingStartTime = new Date(userModel.createdAt || new Date()).getTime();
        const now = Date.now();
        const trainingDuration = now - trainingStartTime;
        const thirtyMinutes = 30 * 60 * 1000; // FLUX Pro takes longer
        progress = Math.min(Math.round((trainingDuration / thirtyMinutes) * 100), 99);
      }
      
      return {
        status,
        progress,
        finetune_id
      };
      
    } catch (error) {
      console.error('Luxury training status check error:', error);
      throw error;
    }
  }
}