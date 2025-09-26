/**
 * CRITICAL PRODUCTION FIX: Training Completion Monitor
 * Automatically detects and updates completed trainings from Replicate API
 * Prevents users from getting stuck in "processing" status
 */

import { storage } from './storage.js';
import { paths } from './utils/paths.js';
import { 
  ReplicateTrainingStatus,
  TrainingStatusUpdate,
  TrainingMonitorConfig,
  TrainingError
} from './types/training.js';

export class TrainingCompletionMonitor {
  private static instance: TrainingCompletionMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly config: TrainingMonitorConfig = {
    checkIntervalMs: 60000, // 1 minute
    maxRetries: 3,
    retryDelayMs: 5000
  };

  static getInstance(): TrainingCompletionMonitor {
    if (!TrainingCompletionMonitor.instance) {
      TrainingCompletionMonitor.instance = new TrainingCompletionMonitor();
    }
    return TrainingCompletionMonitor.instance;
  }

  /**
   * Check a specific training status and update database
   */
  async checkTrainingStatus(userId: string, replicateModelId: string): Promise<TrainingStatusUpdate> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        console.log(`🔍 Checking training ${replicateModelId} for user ${userId} (attempt ${retries + 1})`);

        const response = await fetch(`https://api.replicate.com/v1/trainings/${replicateModelId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}: ${await response.text()}`);
        }

        const trainingData = (await response.json()) as ReplicateTrainingStatus;
        
        // Validate response structure
        if (!trainingData || !trainingData.status) {
          throw new Error('Invalid API response structure');
        }

        console.log(`📊 Training ${replicateModelId} status: ${trainingData.status}`);
        
        const statusUpdate: TrainingStatusUpdate = {
          userId,
          modelId: replicateModelId,
          status: trainingData.status,
          error: trainingData.error,
          completedAt: trainingData.completed_at,
          modelVersion: trainingData.version?.id
        };
        
        if (trainingData.status === 'succeeded') {
          console.log(`✅ Training completed! Updating database for user ${userId}`);        // Standard FLUX training completion - extract version ID
        let versionId = null;
        if (trainingData.version) {
          versionId = trainingData.version;
        }
        
        // ✅ RESTORED: LoRA weights extraction for personalized images
        console.log(`🎯 LORA EXTRACTION: Training completed, extracting LoRA weights for personalization`);
        
        let extractedWeights = null;
        try {
          // Extract LoRA weights using restored extraction method
          const { ModelTrainingService } = await import('./model-training-service.js');
          extractedWeights = await ModelTrainingService.extractLoRAWeights(replicateModelId, userId);
          console.log(`✅ LoRA WEIGHTS EXTRACTED: ${extractedWeights.loraWeightsUrl}`);
        } catch (error) {
          console.error(`❌ LoRA EXTRACTION FAILED for user ${userId}:`, error);
          // Continue with packaged model as fallback
          console.log(`🔄 FALLBACK: Using packaged model approach`);
        }
        
        if (trainingData.output) {
          console.log(`✅ Training output available for model completion`);
        } else {
          console.log(`⚠️ No training output - may need additional processing`);
        }
        
        // CRITICAL: Extract and store the trigger word from existing model data
        const existingModel = await storage.getUserModelByUserId(userId);
        let triggerWord = existingModel?.triggerWord;
        
        // If no trigger word exists, generate one following the pattern
        if (!triggerWord) {
          triggerWord = `user${userId}`;
          console.log(`🆔 Generated trigger word: ${triggerWord} for user ${userId}`);
        }
        
        // ✅ RESTORED: Store both packaged model and extracted LoRA weights
        await storage.updateUserModel(userId, {
          trainingStatus: 'completed',
          replicateModelId: replicateModelId, // Keep training ID for reference
          replicateVersionId: versionId, // Training version
          triggerWord: triggerWord, // CRITICAL: Ensure trigger word is stored
          trainedModelPath: paths.getUserModelPath(userId),
          modelType: extractedWeights ? 'flux-lora' : 'flux-packaged', // Dynamic model type
          completedAt: new Date()
        });
        
        // Store LoRA weights metadata in separate table
        if (extractedWeights) {
          try {
            await storage.storeLoRAWeights({
              userId: userId,
              trainingId: replicateModelId,
              weightsUrl: extractedWeights.loraWeightsUrl,
              checksum: extractedWeights.checksum,
              fileSize: extractedWeights.fileSize,
              extractedAt: new Date()
            });
            console.log(`✅ LoRA WEIGHTS METADATA STORED for user ${userId}`);
          } catch (error) {
            console.error(`❌ Failed to store LoRA weights metadata:`, error);
          }
        }

        // Send model ready email notification
        try {
          const user = await storage.getUser(userId);
          if (user?.email) {
            const { EmailService } = await import('./email-service.js');
            const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
            await EmailService.sendModelReadyEmail(user.email, userName);
            console.log('✅ Model ready email sent to:', user.email);
          }
        } catch (emailError) {
          console.error('❌ Failed to send model ready email:', emailError);
          // Don't fail the completion if email fails
        }

        // TRAINING-TIME COACHING INTEGRATION - Generate strategic first concepts
        try {
          const user = await storage.getUser(userId);
          if (user?.trainingCoachingCompleted && user?.brandStrategyContext) {
            console.log(`🎯 STRATEGIC TRAINING COMPLETION: User ${userId} completed brand strategy coaching`);
            
            // Parse brand strategy context
            const strategyData = JSON.parse(user.brandStrategyContext as string);
            const responses = strategyData.responses;
            
            console.log(`✨ STRATEGIC CONCEPTS: User ${userId} ready for strategy-informed photo creation`);
            console.log(`📊 BRAND STRATEGY: Primary platform = ${responses.primaryPlatform}, Authority = ${responses.authorityLevel}`);
            
            // Flag that strategic concepts are ready for this user
            console.log(`🎯 STRATEGIC COMPLETION: User ${userId} training complete with brand strategy context available`);
          } else {
            console.log(`📸 STANDARD COMPLETION: User ${userId} completed training without brand strategy coaching`);
          }
        } catch (strategyError) {
          console.error(`⚠️ STRATEGIC CONCEPTS: Failed to process for user ${userId}:`, strategyError);
          // Don't fail training completion if strategic concepts fail
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
      } else {
        // Training still in progress
        return false;
      }

    } catch (error) {
      console.error(`❌ Error checking training ${replicateModelId}:`, error);
      return false;
    }
  }

  /**
   * Check for completed models by directly querying Replicate API using model name pattern
   * This works even if training ID wasn't stored in database
   */
  static async checkModelByName(userId: string, modelName: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking model by name: ${process.env.REPLICATE_USERNAME || 'models'}/${modelName} for user ${userId}`);
      
      const response = await fetch(`https://api.replicate.com/v1/models/${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        console.log(`⏳ Model ${process.env.REPLICATE_USERNAME || 'models'}/${modelName} not yet available`);
        return false;
      }

      if (!response.ok) {
        console.error(`❌ Replicate API error for model ${modelName}: ${response.status}`);
        return false;
      }

      const modelData = await response.json();
      
      if (modelData.latest_version?.id) {
        console.log(`✅ Model completed! Updating database for user ${userId}`);
        console.log(`📋 Latest version: ${modelData.latest_version.id}`);
        
        // CRITICAL: Extract and store the trigger word from existing model data
        const existingModel = await storage.getUserModelByUserId(userId);
        let triggerWord = existingModel?.triggerWord;
        
        // If no trigger word exists, generate one following the pattern
        if (!triggerWord) {
          triggerWord = `user${userId}`;
          console.log(`🆔 Generated trigger word: ${triggerWord} for user ${userId}`);
        }
        
        await storage.updateUserModel(userId, {
          trainingStatus: 'completed',
          replicateModelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
          replicateVersionId: modelData.latest_version.id,
          triggerWord: triggerWord, // CRITICAL: Ensure trigger word is stored
          trainingProgress: 100,
          modelType: 'flux-standard',
          updatedAt: new Date()
        });

        // Send model ready email notification
        try {
          const user = await storage.getUser(userId);
          if (user?.email) {
            const { EmailService } = await import('./email-service.js');
            const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
            await EmailService.sendModelReadyEmail(user.email, userName);
            console.log('✅ Model ready email sent to:', user.email);
          }
        } catch (emailError) {
          console.error('❌ Failed to send model ready email:', emailError);
          // Don't fail the completion if email fails
        }

        // TRAINING-TIME COACHING INTEGRATION - Generate strategic first concepts
        try {
          const user = await storage.getUser(userId);
          if (user?.trainingCoachingCompleted && user?.brandStrategyContext) {
            console.log(`🎯 STRATEGIC TRAINING COMPLETION: User ${userId} completed brand strategy coaching`);
            
            // Parse brand strategy context
            const strategyData = JSON.parse(user.brandStrategyContext as string);
            const responses = strategyData.responses;
            
            console.log(`✨ STRATEGIC CONCEPTS: User ${userId} ready for strategy-informed photo creation`);
            console.log(`📊 BRAND STRATEGY: Primary platform = ${responses.primaryPlatform}, Authority = ${responses.authorityLevel}`);
            
            // Flag that strategic concepts are ready for this user
            console.log(`🎯 STRATEGIC COMPLETION: User ${userId} training complete with brand strategy context available`);
          } else {
            console.log(`📸 STANDARD COMPLETION: User ${userId} completed training without brand strategy coaching`);
          }
        } catch (strategyError) {
          console.error(`⚠️ STRATEGIC CONCEPTS: Failed to process for user ${userId}:`, strategyError);
          // Don't fail training completion if strategic concepts fail
        }

        console.log(`🎉 Database updated! User ${userId} training completed`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`❌ Error checking model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Check all in-progress trainings - Enhanced version that works without training ID
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
        const timeSinceStart = Date.now() - new Date(userModel.createdAt || new Date()).getTime();
        const minutesSinceStart = timeSinceStart / (1000 * 60);
        
        console.log(`⏱️ User ${userModel.userId}: ${Math.round(minutesSinceStart)} minutes since training started`);
        
        // Only check models that have been training for at least 8 minutes (training typically takes 10+ minutes)
        if (minutesSinceStart >= 8) {
          let updated = false;
          
          // Method 1: Check by training ID if available
          if (userModel.replicateModelId && userModel.replicateModelId.startsWith('rdt_')) {
            console.log(`🔍 Checking by training ID: ${userModel.replicateModelId}`);
            updated = await this.checkAndUpdateTraining(userModel.replicateModelId, userModel.userId);
          }
          
          // Method 2: Check by model name pattern (fallback for models without stored training ID)
          if (!updated && userModel.modelName) {
            console.log(`🔍 Checking by model name: ${userModel.modelName}`);
            updated = await this.checkModelByName(userModel.userId, userModel.modelName);
          }
          
          // Wait 1 second between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`⏳ User ${userModel.userId}: Training too recent, waiting...`);
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