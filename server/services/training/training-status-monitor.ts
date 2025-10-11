/**
 * Training Status Monitor
 * Monitors training progress and handles completion events
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { ReplicateService } from './replicate-service.js';
import { S3OperationsService } from './s3-operations-service.js';

export interface TrainingProgress {
  trainingId: string;
  userId: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  progress: number; // 0-100
  stage: string; // Human-readable stage description
  eta?: number; // Estimated time remaining in seconds
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface TrainingCompletionResult {
  success: boolean;
  modelVersionId?: string;
  loraWeightsUrl?: string;
  error?: string;
}

/**
 * Service to monitor training progress and handle completion
 */
export class TrainingStatusMonitor {
  private db: IStorage;
  private replicateService: ReplicateService;
  private s3Service: S3OperationsService;
  private activeMonitors = new Map<string, NodeJS.Timeout>();

  constructor(
    db?: IStorage, 
    replicateService?: ReplicateService, 
    s3Service?: S3OperationsService
  ) {
    this.db = db || getDatabase();
    this.replicateService = replicateService || new ReplicateService(this.db);
    this.s3Service = s3Service || new S3OperationsService(this.db);
    
    console.log('✅ TRAINING MONITOR: Status monitor initialized');
  }

  /**
   * Start monitoring a training job
   */
  async startMonitoring(trainingId: string, userId: string): Promise<void> {
    try {
      console.log(`👁️ TRAINING MONITOR: Starting monitoring for training ${trainingId}`);

      // Stop any existing monitor for this training
      this.stopMonitoring(trainingId);

      // Start periodic monitoring
      const monitorInterval = setInterval(async () => {
        try {
          await this.checkTrainingProgress(trainingId, userId);
        } catch (error) {
          console.error(`❌ TRAINING MONITOR: Error checking progress for ${trainingId}:`, error);
          
          // Stop monitoring on repeated failures
          this.stopMonitoring(trainingId);
        }
      }, 30000); // Check every 30 seconds

      this.activeMonitors.set(trainingId, monitorInterval);

      // Perform initial check immediately
      await this.checkTrainingProgress(trainingId, userId);

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Failed to start monitoring for ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Stop monitoring a training job
   */
  stopMonitoring(trainingId: string): void {
    const interval = this.activeMonitors.get(trainingId);
    if (interval) {
      clearInterval(interval);
      this.activeMonitors.delete(trainingId);
      console.log(`⏹️ TRAINING MONITOR: Stopped monitoring for training ${trainingId}`);
    }
  }

  /**
   * Check training progress and update database
   */
  private async checkTrainingProgress(trainingId: string, userId: string): Promise<void> {
    try {
      // Get status from Replicate
      const replicateStatus = await this.replicateService.checkTrainingStatus(trainingId);
      
      // Calculate progress percentage and stage
      const progress = this.calculateProgress(replicateStatus.status, replicateStatus.progress);
      const stage = this.getProgressStage(replicateStatus.status, progress.percentage);

      // Update user model in database
      await this.updateUserModelStatus(userId, trainingId, {
        status: replicateStatus.status,
        progress: progress.percentage,
        stage: stage,
        error: replicateStatus.error
      });

      console.log(`📊 TRAINING MONITOR: Training ${trainingId} - ${replicateStatus.status} (${progress.percentage}%)`);

      // Handle completion
      if (replicateStatus.status === 'succeeded') {
        await this.handleTrainingCompletion(trainingId, userId, replicateStatus);
        this.stopMonitoring(trainingId);
      } else if (replicateStatus.status === 'failed' || replicateStatus.status === 'canceled') {
        await this.handleTrainingFailure(trainingId, userId, replicateStatus);
        this.stopMonitoring(trainingId);
      }

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Progress check failed for ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Handle successful training completion
   */
  private async handleTrainingCompletion(
    trainingId: string, 
    userId: string, 
    replicateStatus: any
  ): Promise<TrainingCompletionResult> {
    try {
      console.log(`🎉 TRAINING MONITOR: Training completed for ${trainingId}`);

      // Extract LoRA weights URL from Replicate output
      const loraWeightsUrl = this.extractLoRAWeightsUrl(replicateStatus.output);
      
      if (!loraWeightsUrl) {
        throw new Error('LoRA weights URL not found in training output');
      }

      // Create model version ID
      const modelVersionId = `${userId}_${trainingId}_${Date.now()}`;

      // Update database with completion data
      await this.db.updateUserModel(userId, {
        trainingStatus: 'completed',
        replicateModelId: trainingId,
        modelVersionId: modelVersionId,
        loraWeightsUrl: loraWeightsUrl,
        completedAt: new Date().toISOString()
      } as any);

      console.log(`✅ TRAINING MONITOR: Model ${modelVersionId} ready for user ${userId}`);

      return {
        success: true,
        modelVersionId,
        loraWeightsUrl
      };

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Completion handling failed for ${trainingId}:`, error);
      
      // Mark as failed in database
      await this.updateUserModelStatus(userId, trainingId, {
        status: 'failed',
        progress: 0,
        stage: 'Completion processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle training failure
   */
  private async handleTrainingFailure(
    trainingId: string, 
    userId: string, 
    replicateStatus: any
  ): Promise<void> {
    try {
      console.warn(`⚠️ TRAINING MONITOR: Training failed for ${trainingId}: ${replicateStatus.error}`);

      await this.updateUserModelStatus(userId, trainingId, {
        status: 'failed',
        progress: 0,
        stage: 'Training failed',
        error: replicateStatus.error || 'Training failed without specific error'
      });

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Error handling training failure for ${trainingId}:`, error);
    }
  }

  /**
   * Calculate progress percentage from Replicate status
   */
  private calculateProgress(status: string, replicateProgress?: number): { percentage: number; eta?: number } {
    switch (status) {
      case 'starting':
        return { percentage: 5 };
      case 'processing':
        // Use Replicate's progress if available, otherwise estimate based on time
        const baseProgress = replicateProgress ? Math.round(replicateProgress * 100) : 25;
        return { 
          percentage: Math.min(Math.max(baseProgress, 10), 95), // Clamp between 10-95%
          eta: replicateProgress ? Math.round((1 - replicateProgress) * 1800) : 1800 // Rough ETA
        };
      case 'succeeded':
        return { percentage: 100 };
      case 'failed':
      case 'canceled':
        return { percentage: 0 };
      default:
        return { percentage: 0 };
    }
  }

  /**
   * Get human-readable progress stage
   */
  private getProgressStage(status: string, percentage: number): string {
    switch (status) {
      case 'starting':
        return 'Initializing training environment';
      case 'processing':
        if (percentage < 20) return 'Preprocessing training data';
        if (percentage < 40) return 'Training LoRA weights (early stage)';
        if (percentage < 70) return 'Training LoRA weights (mid stage)';
        if (percentage < 90) return 'Training LoRA weights (final stage)';
        return 'Finalizing model weights';
      case 'succeeded':
        return 'Training completed successfully';
      case 'failed':
        return 'Training failed';
      case 'canceled':
        return 'Training was canceled';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Extract LoRA weights URL from training output
   */
  private extractLoRAWeightsUrl(output: any): string | null {
    try {
      // Replicate training output structure varies, check common patterns
      if (typeof output === 'string' && output.includes('.safetensors')) {
        return output;
      }
      
      if (Array.isArray(output)) {
        const weightsFile = output.find(url => 
          typeof url === 'string' && url.includes('.safetensors')
        );
        return weightsFile || null;
      }
      
      if (output && typeof output === 'object') {
        return output.weights || output.model || output.lora_weights || null;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ TRAINING MONITOR: Error extracting LoRA weights URL:', error);
      return null;
    }
  }

  /**
   * Update user model status in database
   */
  private async updateUserModelStatus(
    userId: string, 
    trainingId: string, 
    statusUpdate: {
      status: string;
      progress: number;
      stage: string;
      error?: string;
    }
  ): Promise<void> {
    try {
      await this.db.updateUserModel(userId, {
        trainingStatus: statusUpdate.status,
        trainingProgress: statusUpdate.progress,
        trainingStage: statusUpdate.stage,
        ...(statusUpdate.error && { trainingError: statusUpdate.error }),
        lastCheckedAt: new Date().toISOString()
      } as any);

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Database update failed for user ${userId}:`, error);
      // Don't throw - monitoring should continue even if DB update fails
    }
  }

  /**
   * Get current training progress
   */
  async getTrainingProgress(userId: string): Promise<TrainingProgress | null> {
    try {
      const userModel = await this.db.getUserModelByUserId(userId);
      
      if (!userModel || !userModel.replicateModelId) {
        return null;
      }

      return {
        trainingId: userModel.replicateModelId,
        userId: userId,
        status: userModel.trainingStatus as any,
        progress: (userModel as any).trainingProgress || 0,
        stage: (userModel as any).trainingStage || 'Training in progress',
        error: (userModel as any).trainingError,
        startedAt: userModel.createdAt ? new Date(userModel.createdAt) : new Date(),
        completedAt: userModel.completedAt ? new Date(userModel.completedAt) : undefined
      };

    } catch (error) {
      console.error(`❌ TRAINING MONITOR: Error getting progress for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get all active monitoring jobs
   */
  getActiveMonitors(): string[] {
    return Array.from(this.activeMonitors.keys());
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    Array.from(this.activeMonitors.keys()).forEach(trainingId => {
      this.stopMonitoring(trainingId);
    });
    console.log('⏹️ TRAINING MONITOR: Stopped all monitoring');
  }
}

// Export singleton instance
export const trainingStatusMonitor = new TrainingStatusMonitor();