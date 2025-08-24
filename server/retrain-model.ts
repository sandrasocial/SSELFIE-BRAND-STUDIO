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
          steps: 1000,                             // 🎯 RESEARCH-PROVEN: Community consensus for face training
          learning_rate: 4e-4,                     // 🎯 RESEARCH-PROVEN: 0.0004 works excellent for character training
          batch_size: 1,
          lora_rank: 32,                           // 🎯 RESEARCH-PROVEN: 32 for complex features and character training
          resolution: 1024,                        // 🎯 RESEARCH-PROVEN: 1024x1024 ideal resolution
          autocaption: false,                      // ✅ Keep false to preserve manual captions
          optimizer: "adamw8bit",
          lr_scheduler: "constant",
          caption_dropout_rate: 0.1,               // 🎯 RESEARCH-PROVEN: 0.1 standard for face training
          cache_latents_to_disk: false,
          wandb_project: "flux_train_replicate",
          wandb_save_interval: 100,
          save_every_n_epochs: 1,
          max_train_steps: 1000,                   // 🎯 Updated to match steps
          seed: 42
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