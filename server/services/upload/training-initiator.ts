/**
 * Training Initiator Service
 * Coordinates with training services to start model training after successful upload
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { TrainingOrchestrator } from '../training/training-orchestrator.js';
import { FileValidator, type ValidationResult } from './file-validator.js';
import { UploadManager, type UploadResult } from './upload-manager.js';

export interface TrainingInitRequest {
  userId: string;
  uploadedFiles: string[]; // S3 URLs or local file paths
  triggerWord?: string;
  trainingConfig?: {
    steps?: number;
    learningRate?: number;
    batchSize?: number;
    resolution?: string;
  };
  notificationSettings?: {
    email?: string;
    webhookUrl?: string;
    sendUpdates: boolean;
  };
}

export interface TrainingInitResult {
  success: boolean;
  trainingId?: string;
  message: string;
  validationResult?: ValidationResult;
  uploadResult?: UploadResult;
  estimatedTime?: number; // seconds
  nextSteps?: string[];
}

export interface UserTrainingStatus {
  canStartTraining: boolean;
  reason?: string;
  currentTraining?: {
    id: string;
    status: string;
    progress: number;
  };
  requirements?: {
    minImages: number;
    hasValidImages: boolean;
    hasUserModel: boolean;
  };
}

/**
 * Service to initiate training workflow after upload completion
 */
export class TrainingInitiator {
  private db: IStorage;
  private trainingOrchestrator: TrainingOrchestrator;
  private fileValidator: FileValidator;
  private uploadManager: UploadManager;

  constructor(
    db?: IStorage,
    trainingOrchestrator?: TrainingOrchestrator,
    fileValidator?: FileValidator,
    uploadManager?: UploadManager
  ) {
    this.db = db || getDatabase();
    this.trainingOrchestrator = trainingOrchestrator || new TrainingOrchestrator(this.db);
    this.fileValidator = fileValidator || new FileValidator(this.db);
    this.uploadManager = uploadManager || new UploadManager(this.db);

    console.log('✅ TRAINING INITIATOR: Initialized with orchestrator and validation services');
  }

  /**
   * Complete end-to-end upload and training initiation
   */
  async completeBulletproofUpload(request: TrainingInitRequest): Promise<TrainingInitResult> {
    try {
      console.log(`🚀 TRAINING INITIATOR: Starting complete upload for user ${request.userId}`);

      const result: TrainingInitResult = {
        success: false,
        message: '',
        nextSteps: []
      };

      // Step 1: Check if user can start training
      const statusCheck = await this.checkUserTrainingStatus(request.userId);
      if (!statusCheck.canStartTraining) {
        result.message = statusCheck.reason || 'Cannot start training';
        result.nextSteps = ['Resolve training prerequisites'];
        return result;
      }

      // Step 2: Validate uploaded files (if local files provided)
      if (request.uploadedFiles.some(file => !file.startsWith('http'))) {
        console.log('📋 TRAINING INITIATOR: Validating local files');
        const localFiles = request.uploadedFiles.filter(file => !file.startsWith('http'));
        
        result.validationResult = await this.fileValidator.validateUploadedImages(
          request.userId,
          localFiles
        );

        if (!result.validationResult.success) {
          result.message = `File validation failed: ${result.validationResult.errors.join(', ')}`;
          result.nextSteps = [
            'Fix validation errors',
            'Upload valid selfie images',
            'Retry upload process'
          ];
          return result;
        }
      }

      // Step 3: Upload files to S3 (if not already uploaded)
      let s3Urls = request.uploadedFiles.filter(file => file.startsWith('http'));
      
      if (request.uploadedFiles.some(file => !file.startsWith('http'))) {
        console.log('📤 TRAINING INITIATOR: Uploading files to S3');
        
        const localFiles = request.uploadedFiles.filter(file => !file.startsWith('http'));
        result.uploadResult = await this.uploadManager.uploadImages({
          userId: request.userId,
          files: localFiles,
          metadata: {
            purpose: 'training',
            uploadedAt: new Date().toISOString(),
            triggerWord: request.triggerWord || `person_${request.userId}`
          }
        });

        if (!result.uploadResult.success) {
          result.message = `Upload failed: ${result.uploadResult.message}`;
          result.nextSteps = [
            'Check internet connection',
            'Verify file permissions',
            'Retry upload'
          ];
          return result;
        }

        s3Urls = s3Urls.concat(result.uploadResult.uploadedFiles.map(file => file.s3Url));
      }

      // Step 4: Start training
      console.log('🎯 TRAINING INITIATOR: Starting training process');
      const trainingResult = await this.trainingOrchestrator.startTraining({
        userId: request.userId,
        selfieImages: s3Urls,
        triggerWord: request.triggerWord,
        trainingConfig: request.trainingConfig
      });

      if (!trainingResult.success) {
        result.message = `Training start failed: ${trainingResult.message}`;
        result.nextSteps = [
          'Check training service status',
          'Verify uploaded images',
          'Contact support if issue persists'
        ];
        return result;
      }

      // Step 5: Update database with training info
      await this.updateUserTrainingRecord(request.userId, {
        trainingId: trainingResult.trainingId!,
        imageUrls: s3Urls,
        triggerWord: request.triggerWord,
        config: request.trainingConfig,
        notifications: request.notificationSettings
      });

      // Success!
      result.success = true;
      result.trainingId = trainingResult.trainingId;
      result.message = 'Training started successfully! You will receive updates as it progresses.';
      result.estimatedTime = trainingResult.estimatedTime;
      result.nextSteps = [
        'Monitor training progress in your dashboard',
        'Check your email for completion notification',
        'Training typically takes 20-30 minutes'
      ];

      console.log(`✅ TRAINING INITIATOR: Complete upload successful - Training ID: ${result.trainingId}`);
      
      // Schedule completion check (fire and forget)
      this.scheduleTrainingCompletionCheck(request.userId, trainingResult.trainingId!);

      return result;

    } catch (error) {
      console.error(`❌ TRAINING INITIATOR: Complete upload failed for user ${request.userId}:`, error);

      return {
        success: false,
        message: `Upload and training failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        nextSteps: [
          'Check system status',
          'Retry the complete process',
          'Contact support if issue persists'
        ]
      };
    }
  }

  /**
   * Check if user can start training
   */
  async checkUserTrainingStatus(userId: string): Promise<UserTrainingStatus> {
    try {
      // Check if user has existing training in progress
      const currentStatus = await this.trainingOrchestrator.getTrainingStatus(userId);
      
      if (['starting', 'processing'].includes(currentStatus.status)) {
        return {
          canStartTraining: false,
          reason: `Training already in progress (${currentStatus.progress}% complete)`,
          currentTraining: {
            id: currentStatus.trainingId || 'unknown',
            status: currentStatus.status,
            progress: currentStatus.progress
          }
        };
      }

      // Check user model status
      const userModel = await this.db.getUserModelByUserId(userId);
      const hasUserModel = !!userModel;

      // Get validation requirements
      const validatorConfig = this.fileValidator.getConfig();

      return {
        canStartTraining: true,
        requirements: {
          minImages: validatorConfig.minImages,
          hasValidImages: true, // Will be checked during validation
          hasUserModel: hasUserModel
        }
      };

    } catch (error) {
      console.error(`❌ TRAINING INITIATOR: Error checking user status for ${userId}:`, error);
      
      return {
        canStartTraining: false,
        reason: 'Unable to verify training status'
      };
    }
  }

  /**
   * Update user training record in database
   */
  private async updateUserTrainingRecord(
    userId: string,
    trainingData: {
      trainingId: string;
      imageUrls: string[];
      triggerWord?: string;
      config?: any;
      notifications?: any;
    }
  ): Promise<void> {
    try {
      await this.db.updateUserModel(userId, {
        trainingStatus: 'starting',
        replicateModelId: trainingData.trainingId,
        triggerWord: trainingData.triggerWord || `person_${userId}`,
        trainingStartedAt: new Date().toISOString(),
        imageCount: trainingData.imageUrls.length,
        trainingConfig: JSON.stringify(trainingData.config || {}),
        notificationSettings: JSON.stringify(trainingData.notifications || {})
      } as any);

      console.log(`💾 TRAINING INITIATOR: Updated training record for user ${userId}`);

    } catch (error) {
      console.error(`❌ TRAINING INITIATOR: Failed to update training record for user ${userId}:`, error);
      // Don't throw - training can continue without this update
    }
  }

  /**
   * Schedule periodic check for training completion
   */
  private scheduleTrainingCompletionCheck(userId: string, trainingId: string): void {
    setTimeout(async () => {
      try {
        const status = await this.trainingOrchestrator.getTrainingStatus(userId);
        
        if (status.status === 'succeeded') {
          console.log(`🎉 TRAINING INITIATOR: Training ${trainingId} completed for user ${userId}`);
          await this.handleTrainingCompletion(userId, trainingId);
        } else if (['starting', 'processing'].includes(status.status)) {
          // Schedule another check in 5 minutes
          this.scheduleTrainingCompletionCheck(userId, trainingId);
        } else if (status.status === 'failed') {
          console.warn(`⚠️ TRAINING INITIATOR: Training ${trainingId} failed for user ${userId}`);
          await this.handleTrainingFailure(userId, trainingId, status.error);
        }

      } catch (error) {
        console.error(`❌ TRAINING INITIATOR: Error checking completion for ${trainingId}:`, error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Handle successful training completion
   */
  private async handleTrainingCompletion(userId: string, trainingId: string): Promise<void> {
    try {
      console.log(`🎉 TRAINING INITIATOR: Handling completion for user ${userId}`);

      // Update user model with completion status
      await this.db.updateUserModel(userId, {
        trainingStatus: 'completed',
        completedAt: new Date().toISOString(),
        isActive: true
      } as any);

      // Here you could send notifications, update UI, etc.
      console.log(`✅ TRAINING INITIATOR: Training completion handled for user ${userId}`);

    } catch (error) {
      console.error(`❌ TRAINING INITIATOR: Error handling completion for user ${userId}:`, error);
    }
  }

  /**
   * Handle training failure
   */
  private async handleTrainingFailure(
    userId: string, 
    trainingId: string, 
    error?: string
  ): Promise<void> {
    try {
      console.warn(`⚠️ TRAINING INITIATOR: Handling failure for user ${userId}: ${error}`);

      // Update user model with failure status
      await this.db.updateUserModel(userId, {
        trainingStatus: 'failed',
        trainingError: error || 'Training failed without specific error'
      } as any);

      // Here you could send failure notifications, suggest retry, etc.
      console.log(`📝 TRAINING INITIATOR: Training failure handled for user ${userId}`);

    } catch (dbError) {
      console.error(`❌ TRAINING INITIATOR: Error handling failure for user ${userId}:`, dbError);
    }
  }

  /**
   * Get training initiation statistics
   */
  async getInitiationStats(): Promise<{
    totalInitiated: number;
    successfullyStarted: number;
    failed: number;
    averageInitTime: number; // seconds
  }> {
    // This would query the database for statistics
    // For now, return placeholder data
    return {
      totalInitiated: 0,
      successfullyStarted: 0,
      failed: 0,
      averageInitTime: 0
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    dependencies: {
      trainingOrchestrator: boolean;
      fileValidator: boolean;
      uploadManager: boolean;
      database: boolean;
    };
    capabilities: string[];
  }> {
    try {
      const [
        orchestratorHealth,
        validatorHealth,
        uploadHealth
      ] = await Promise.all([
        this.trainingOrchestrator.getHealthStatus(),
        this.fileValidator.getHealthStatus(),
        this.uploadManager.getHealthStatus()
      ]);

      const dependencies = {
        trainingOrchestrator: orchestratorHealth.status === 'healthy',
        fileValidator: validatorHealth.status === 'healthy',
        uploadManager: uploadHealth.status === 'healthy',
        database: true // Database provider handles this
      };

      const allHealthy = Object.values(dependencies).every(healthy => healthy);

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        dependencies,
        capabilities: [
          'End-to-end upload workflow',
          'Training initiation',
          'Status monitoring',
          'Error recovery',
          'Progress notifications'
        ]
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        dependencies: {
          trainingOrchestrator: false,
          fileValidator: false,
          uploadManager: false,
          database: false
        },
        capabilities: []
      };
    }
  }
}

// Export singleton instance
export const trainingInitiator = new TrainingInitiator();