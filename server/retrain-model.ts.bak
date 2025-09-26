import { storage } from './storage';

export class ModelRetrainService {
  
  /**
   * Restart training for a user using existing training data
   * This is used when a model was accidentally deleted from Replicate
   */
  static async restartTraining(userId: string): Promise<{ success: boolean; message: string; replicateModelId?: string }> {
    try {
      console.log(`🔄 Restarting training for user: ${userId}`);
      
      // Get existing user model record to verify training was completed before
      const existingModel = await storage.getUserModelByUserId(userId);
      if (!existingModel) {
        return {
          success: false,
          message: 'No existing model record found. Please use the regular training process.'
        };
      }
      
      if (existingModel.trainingStatus !== 'completed') {
        return {
          success: false,
          message: `Cannot restart training. Current status: ${existingModel.trainingStatus}. Please wait for current training to complete or use regular training.`
        };
      }
      
      console.log(`📋 Found existing model: ${existingModel.modelName} with trigger word: ${existingModel.triggerWord}`);
      
      // Use existing S3 training ZIP from completed training
      const s3ZipUrl = `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/training_${userId}_${existingModel.modelName?.split('-').pop() || Date.now()}.zip`;
      
      // Generate new model name for restart
      const newModelName = `${userId}-selfie-lora-${Date.now()}`;
      
      // Start new Replicate training using ostris/flux-dev-lora-trainer
      const trainingData = {
        destination: `${process.env.REPLICATE_USERNAME || 'models'}/${newModelName}`,
        input: {
          input_images: s3ZipUrl,
          trigger_word: existingModel.triggerWord, // Use existing trigger word
          steps: 1200, // OPTIMIZED: 1200 steps for identity vs styling balance
          learning_rate: 0.0002, // OPTIMIZED: 0.0002 = balanced training speed vs stability
          batch_size: 1,
          lora_rank: 32, // OPTIMIZED: 32 for complex facial features
          resolution: "1024", // OPTIMIZED: 1024x1024 ideal resolution
          optimizer: "adamw8bit",
          autocaption: true, // OPTIMIZED: FLUX works better with contextual captions
          cache_latents_to_disk: false, // Memory optimization
          caption_dropout_rate: 0.1 // OPTIMIZED: 0.1 = better generalization
        }
      };
      
      console.log(`🚀 Starting Replicate training with trigger word: ${existingModel.triggerWord}`);
      
      const response = await fetch('https://api.replicate.com/v1/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Replicate training failed:', response.status, errorData);
        return {
          success: false,
          message: `Training failed: ${response.status} - ${errorData}`
        };
      }
      
      const result = await response.json();
      const replicateModelId = result.id;
      
      console.log(`✅ New training started! ID: ${replicateModelId}`);
      
      // Update database with new training details
      await storage.updateUserModel(userId, {
        replicateModelId: replicateModelId,
        modelName: newModelName,
        trainingStatus: 'training',
        triggerWord: existingModel.triggerWord, // Keep existing trigger word
        trainedModelPath: `${process.env.REPLICATE_USERNAME || 'models'}/${newModelName}`,
        modelType: 'flux-standard',
        updatedAt: new Date()
      });
      
      console.log(`📝 Database updated with new training ID: ${replicateModelId}`);
      
      return {
        success: true,
        message: `Training restarted successfully! New training ID: ${replicateModelId}. The training will take 10-15 minutes to complete.`,
        replicateModelId: replicateModelId
      };
      
    } catch (error) {
      console.error('❌ Model retrain error:', error);
      return {
        success: false,
        message: `Failed to restart training: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}