/**
 * TRAINING STATUS CHECKER SERVICE
 * Automatically checks and updates training completion status
 * Prevents users from getting stuck with incomplete training states
 */

import { storage } from './storage';

export class TrainingStatusChecker {
  /**
   * Check Replicate training status and update database
   */
  static async checkAndUpdateTrainingStatus(replicateTrainingId: string, userId: string): Promise<void> {
    try {
      console.log(`🔍 Checking training status for user ${userId}, training ${replicateTrainingId}`);
      
      const response = await fetch(`https://api.replicate.com/v1/trainings/${replicateTrainingId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Failed to fetch training status: ${response.status}`);
        return;
      }
      
      const trainingData = await response.json();
      console.log(`📊 Training status: ${trainingData.status}`);
      
      // If training is completed successfully
      if (trainingData.status === 'succeeded' && trainingData.version) {
        const versionId = trainingData.version;
        
        console.log(`✅ Training completed! Version ID: ${versionId}`);
        
        // Update user model in database - UNIVERSAL FORMAT FIX
        await storage.updateUserModel(userId, {
          trainingStatus: 'completed',
          replicateVersionId: versionId, // Store version ID only (universal format)
          // Keep replicateModelId as training ID for tracking purposes
          updatedAt: new Date()
        });
        
        console.log(`✅ Database updated for user ${userId}`);
        
      } else if (trainingData.status === 'failed' || trainingData.status === 'canceled') {
        console.log(`❌ Training failed for user ${userId}: ${trainingData.status}`);
        
        // Update to failed status
        await storage.updateUserModel(userId, {
          trainingStatus: 'failed',
          updatedAt: new Date()
        });
        
      } else {
        console.log(`⏳ Training still in progress: ${trainingData.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error checking training status for user ${userId}:`, error);
    }
  }
  
  /**
   * Periodic check for all in-progress trainings
   */
  static async checkAllInProgressTrainings(): Promise<void> {
    try {
      console.log('🔍 Checking all in-progress trainings...');
      
      // Get all users with training status that isn't completed
      const inProgressTrainings = await storage.getAllInProgressTrainings();
      
      for (const userModel of inProgressTrainings) {
        if (userModel.replicateModelId && !userModel.replicateModelId.includes(':')) {
          // This is a training ID, not a completed model version
          await this.checkAndUpdateTrainingStatus(userModel.replicateModelId, userModel.userId);
          
          // Wait 1 second between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
    } catch (error) {
      console.error('❌ Error in periodic training status check:', error);
    }
  }
}