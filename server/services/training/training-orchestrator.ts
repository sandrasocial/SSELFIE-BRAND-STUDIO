/**
 * Training Orchestrator
 * Coordinates the complete training pipeline using modular services
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { ReplicateService } from './replicate-service.js';
import { S3OperationsService } from './s3-operations-service.js';
import { TrainingStatusMonitor } from './training-status-monitor.js';

export interface TrainingRequest {
  userId: string;
  selfieImages: string[]; // URLs to selfie images
  triggerWord?: string;
  trainingConfig?: {
    steps?: number;
    learningRate?: number;
    batchSize?: number;
    resolution?: string;
  };
}

export interface TrainingResponse {
  success: boolean;
  trainingId?: string;
  message: string;
  estimatedTime?: number; // in seconds
}

export interface TrainingStatus {
  status: 'not_started' | 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  progress: number; // 0-100
  stage: string;
  trainingId?: string;
  modelVersionId?: string;
  loraWeightsUrl?: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

/**
 * Main orchestrator for the training pipeline
 */
export class TrainingOrchestrator {
  private db: IStorage;
  private replicateService: ReplicateService;
  private s3Service: S3OperationsService;
  private statusMonitor: TrainingStatusMonitor;

  constructor(
    db?: IStorage,
    replicateService?: ReplicateService,
    s3Service?: S3OperationsService,
    statusMonitor?: TrainingStatusMonitor
  ) {
    this.db = db || getDatabase();
    this.replicateService = replicateService || new ReplicateService(this.db);
    this.s3Service = s3Service || new S3OperationsService(this.db);
    this.statusMonitor = statusMonitor || new TrainingStatusMonitor(this.db, this.replicateService, this.s3Service);

    console.log('✅ TRAINING ORCHESTRATOR: Initialized with full pipeline services');
  }

  /**
   * Start the complete training pipeline
   */
  async startTraining(request: TrainingRequest): Promise<TrainingResponse> {
    try {
      console.log(`🚀 TRAINING ORCHESTRATOR: Starting training for user ${request.userId}`);

      // Validate request
      const validationResult = this.validateTrainingRequest(request);
      if (!validationResult.valid) {
        return {
          success: false,
          message: validationResult.error || 'Invalid training request'
        };
      }

      // Check if user already has training in progress
      const existingProgress = await this.statusMonitor.getTrainingProgress(request.userId);
      if (existingProgress && ['starting', 'processing'].includes(existingProgress.status)) {
        return {
          success: false,
          message: `Training already in progress (${existingProgress.progress}% complete)`
        };
      }

      // Step 1: Create and upload training data ZIP
      console.log('📦 TRAINING ORCHESTRATOR: Creating training data ZIP');
      const trainingDataUrl = await this.prepareTrainingData(request);

      // Step 2: Configure training parameters
      const trainingConfig = this.buildTrainingConfig(request, trainingDataUrl);

      // Step 3: Start training on Replicate
      console.log('🎯 TRAINING ORCHESTRATOR: Starting Replicate training');
      const trainingId = await this.replicateService.startTraining(trainingConfig);

      // Step 4: Update database with training info
      await this.updateUserModelForTraining(request.userId, trainingId, trainingConfig);

      // Step 5: Start monitoring
      await this.statusMonitor.startMonitoring(trainingId, request.userId);

      console.log(`✅ TRAINING ORCHESTRATOR: Training started successfully - ID: ${trainingId}`);

      return {
        success: true,
        trainingId: trainingId,
        message: 'Training started successfully! You will receive updates as it progresses.',
        estimatedTime: 1800 // 30 minutes typical
      };

    } catch (error) {
      console.error(`❌ TRAINING ORCHESTRATOR: Training start failed for user ${request.userId}:`, error);

      // Update user model with error status
      try {
        await this.db.updateUserModel(request.userId, {
          trainingStatus: 'failed',
          trainingError: error instanceof Error ? error.message : 'Training start failed'
        } as any);
      } catch (dbError) {
        console.error('❌ TRAINING ORCHESTRATOR: Failed to update error status in DB:', dbError);
      }

      return {
        success: false,
        message: `Training failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get current training status for user
   */
  async getTrainingStatus(userId: string): Promise<TrainingStatus> {
    try {
      const progress = await this.statusMonitor.getTrainingProgress(userId);
      
      if (!progress) {
        return {
          status: 'not_started',
          progress: 0,
          stage: 'No training initiated'
        };
      }

      const userModel = await this.db.getUserModelByUserId(userId);
      
      return {
        status: progress.status,
        progress: progress.progress,
        stage: progress.stage,
        trainingId: progress.trainingId,
        modelVersionId: userModel?.replicateVersionId,
        loraWeightsUrl: userModel?.trainedModelPath,
        error: progress.error,
        estimatedTimeRemaining: progress.eta
      };

    } catch (error) {
      console.error(`❌ TRAINING ORCHESTRATOR: Error getting status for user ${userId}:`, error);
      
      return {
        status: 'failed',
        progress: 0,
        stage: 'Error retrieving status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retry failed training
   */
  async retryTraining(userId: string): Promise<TrainingResponse> {
    try {
      console.log(`🔄 TRAINING ORCHESTRATOR: Retrying training for user ${userId}`);

      // Get user's previous training data
      const userModel = await this.db.getUserModelByUserId(userId);
      if (!userModel) {
        return {
          success: false,
          message: 'No previous training data found'
        };
      }

      // Stop any existing monitoring
      if (userModel.replicateModelId) {
        this.statusMonitor.stopMonitoring(userModel.replicateModelId);
      }

      // Reset training status
      await this.db.updateUserModel(userId, {
        trainingStatus: 'not_started',
        trainingProgress: 0,
        trainingError: null
      } as any);

      // Get selfie images for retry (would need to be stored or re-uploaded)
      // For now, return error asking user to restart process
      return {
        success: false,
        message: 'Please restart the training process with fresh images'
      };

    } catch (error) {
      console.error(`❌ TRAINING ORCHESTRATOR: Retry failed for user ${userId}:`, error);
      return {
        success: false,
        message: `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Cancel active training
   */
  async cancelTraining(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`⏹️ TRAINING ORCHESTRATOR: Canceling training for user ${userId}`);

      const userModel = await this.db.getUserModelByUserId(userId);
      if (!userModel || !userModel.replicateModelId) {
        return {
          success: false,
          message: 'No active training found to cancel'
        };
      }

      // Cancel on Replicate
      await this.replicateService.cancelPrediction(userModel.replicateModelId);

      // Stop monitoring
      this.statusMonitor.stopMonitoring(userModel.replicateModelId);

      // Update database
      await this.db.updateUserModel(userId, {
        trainingStatus: 'canceled'
      } as any);

      return {
        success: true,
        message: 'Training canceled successfully'
      };

    } catch (error) {
      console.error(`❌ TRAINING ORCHESTRATOR: Cancel failed for user ${userId}:`, error);
      return {
        success: false,
        message: `Cancel failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate training request
   */
  private validateTrainingRequest(request: TrainingRequest): { valid: boolean; error?: string } {
    if (!request.userId) {
      return { valid: false, error: 'User ID is required' };
    }

    if (!request.selfieImages || request.selfieImages.length === 0) {
      return { valid: false, error: 'At least one selfie image is required' };
    }

    if (request.selfieImages.length < 5) {
      return { valid: false, error: 'At least 5 selfie images are required for good training results' };
    }

    if (request.selfieImages.length > 30) {
      return { valid: false, error: 'Maximum 30 selfie images allowed' };
    }

    return { valid: true };
  }

  /**
   * Prepare training data by creating ZIP and uploading to S3
   */
  private async prepareTrainingData(request: TrainingRequest): Promise<string> {
    try {
      const zipName = `training-${request.userId}-${Date.now()}.zip`;
      const uploadResult = await this.s3Service.createAndUploadImageZip(
        request.selfieImages,
        request.userId,
        zipName
      );

      console.log(`✅ TRAINING ORCHESTRATOR: Training data prepared at ${uploadResult.url}`);
      return uploadResult.url;

    } catch (error) {
      console.error('❌ TRAINING ORCHESTRATOR: Training data preparation failed:', error);
      throw new Error('Failed to prepare training data');
    }
  }

  /**
   * Build training configuration for Replicate
   */
  private buildTrainingConfig(request: TrainingRequest, trainingDataUrl: string) {
    const config = request.trainingConfig || {};
    const triggerWord = request.triggerWord || `person_${request.userId}`;

    return {
      trainingData: trainingDataUrl,
      steps: config.steps || 1000,
      learningRate: config.learningRate || 0.0001,
      batchSize: config.batchSize || 1,
      triggerWord: triggerWord,
      resolution: config.resolution || '512,512',
      autocaption: true
    };
  }

  /**
   * Update user model with training information
   */
  private async updateUserModelForTraining(
    userId: string, 
    trainingId: string, 
    config: any
  ): Promise<void> {
    try {
      // Get or create user model
      let userModel = await this.db.getUserModelByUserId(userId);
      
      if (!userModel) {
        // Create new user model
        const modelData = {
          userId: userId,
          trainingId: trainingId,
          replicateModelId: trainingId,
          triggerWord: config.triggerWord,
          trainingStatus: 'starting' as const,
          trainingProgress: 0,
          modelType: 'flux_lora',
          trainingStartedAt: new Date().toISOString()
        };

        // Create using available database method (may need to be implemented)
        console.log('📝 TRAINING ORCHESTRATOR: New user model creation needed - using update method');
        await this.db.updateUserModel(userId, modelData as any);
      } else {
        // Update existing model
        await this.db.updateUserModel(userId, {
          trainingId: trainingId,
          replicateModelId: trainingId,
          triggerWord: config.triggerWord,
          trainingStatus: 'starting',
          trainingProgress: 0,
          trainingStartedAt: new Date().toISOString()
        } as any);
      }

      console.log(`💾 TRAINING ORCHESTRATOR: User model updated for training ${trainingId}`);

    } catch (error) {
      console.error(`❌ TRAINING ORCHESTRATOR: Failed to update user model for training:`, error);
      throw error;
    }
  }

  /**
   * Get orchestrator health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
      replicate: boolean;
      s3: boolean;
      database: boolean;
      monitor: boolean;
    };
    activeTrainings: number;
  }> {
    try {
      const [replicateHealth, s3Health] = await Promise.all([
        this.replicateService.getHealthStatus(),
        this.s3Service.getHealthStatus()
      ]);

      const services = {
        replicate: replicateHealth.status === 'healthy',
        s3: s3Health.status === 'healthy',
        database: true, // Database provider handles this
        monitor: true // Always available
      };

      const allHealthy = Object.values(services).every(healthy => healthy);

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        services,
        activeTrainings: this.statusMonitor.getActiveMonitors().length
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        services: {
          replicate: false,
          s3: false,
          database: false,
          monitor: false
        },
        activeTrainings: 0
      };
    }
  }
}

// Export singleton instance
export const trainingOrchestrator = new TrainingOrchestrator();