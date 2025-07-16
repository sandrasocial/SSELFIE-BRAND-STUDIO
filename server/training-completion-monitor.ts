/**
 * CRITICAL PRODUCTION FIX: Training Completion Monitor
 * Automatically detects and updates completed trainings from Replicate API
 * Prevents users from getting stuck in "processing" status
 */

import { storage } from './storage';

export class TrainingCompletionMonitor {
  private static instance: TrainingCompletionMonitor;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): TrainingCompletionMonitor {
    if (!TrainingCompletionMonitor.instance) {
      TrainingCompletionMonitor.instance = new TrainingCompletionMonitor();
    }
    return TrainingCompletionMonitor.instance;
  }

  /**
   * Check a specific training status and update database
   */
  static async checkAndUpdateTraining(replicateModelId: string, userId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking training ${replicateModelId} for user ${userId}`);
      
      const response = await fetch(`https://api.replicate.com/v1/trainings/${replicateModelId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Replicate API error for ${replicateModelId}: ${response.status}`);
        return false;
      }

      const trainingData = await response.json();
      console.log(`📊 Training ${replicateModelId} status: ${trainingData.status}`);

      if (trainingData.status === 'succeeded') {
        console.log(`✅ Training completed! Updating database for user ${userId}`);
        
        // Check if this is FLUX Pro training (has output finetune_id) or standard FLUX (has version)
        const isFluxPro = trainingData.output && typeof trainingData.output === 'string';
        
        if (isFluxPro) {
          // 🏆 FLUX Pro training completion
          console.log(`🏆 FLUX Pro training completed! finetune_id: ${trainingData.output}`);
          
          await storage.updateUserModel(userId, {
            trainingStatus: 'completed',
            finetuneId: trainingData.output, // Store finetune_id for FLUX Pro inference
            isLuxury: true,
            modelType: 'flux-pro',
            updatedAt: new Date()
          });
          
        } else {
          // 📱 Standard FLUX training completion
          let versionId = null;
          if (trainingData.version) {
            versionId = trainingData.version;
          }
          
          await storage.updateUserModel(userId, {
            trainingStatus: 'completed',
            replicateVersionId: versionId,
            trainedModelPath: `sandrasocial/${userId}-selfie-lora`,
            isLuxury: false,
            modelType: 'flux-standard',
            updatedAt: new Date()
          });
        }

        console.log(`🎉 Database updated! User ${userId} training completed`);
        return true;

      } else if (trainingData.status === 'failed') {
        console.log(`❌ Training failed for user ${userId}`);
        
        await storage.updateUserModel(userId, {
          trainingStatus: 'failed',
          updatedAt: new Date()
        });
        
        return false;
      }

      // Still in progress
      return false;

    } catch (error) {
      console.error(`❌ Error checking training ${replicateModelId}:`, error);
      return false;
    }
  }

  /**
   * Check all in-progress trainings
   */
  static async checkAllInProgressTrainings(): Promise<void> {
    try {
      console.log('🔍 TRAINING COMPLETION MONITOR: Checking all in-progress trainings...');
      
      // Get all users with training status that isn't completed
      const inProgressModels = await storage.getAllInProgressTrainings();
      
      if (inProgressModels.length === 0) {
        console.log('✅ No in-progress trainings found');
        return;
      }

      console.log(`📊 Found ${inProgressModels.length} in-progress trainings to check`);

      for (const userModel of inProgressModels) {
        if (userModel.replicateModelId) {
          await this.checkAndUpdateTraining(userModel.replicateModelId, userModel.userId);
          
          // Wait 1 second between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error('❌ Error in training completion monitor:', error);
    }
  }

  /**
   * Start automatic monitoring (every 2 minutes)
   */
  startMonitoring(): void {
    console.log('🚀 Starting Training Completion Monitor (checks every 2 minutes)');
    
    // Check immediately on start
    TrainingCompletionMonitor.checkAllInProgressTrainings();
    
    // Then check every 2 minutes
    this.intervalId = setInterval(() => {
      TrainingCompletionMonitor.checkAllInProgressTrainings();
    }, 2 * 60 * 1000); // 2 minutes
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Training Completion Monitor stopped');
    }
  }
}