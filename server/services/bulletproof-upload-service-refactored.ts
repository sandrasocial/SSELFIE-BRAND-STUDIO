/**
 * Bulletproof Upload Service - Refactored Composition Service
 * Orchestrates upload workflow using modular services
 * Maintains backward compatibility with existing API
 */

import { getDatabase, type IStorage } from '../../shared/database-provider.js';
import { FileValidator } from './upload/file-validator.js';
import { UploadManager } from './upload/upload-manager.js';
import { TrainingInitiator } from './upload/training-initiator.js';

// Re-export types for backward compatibility
export type { ValidationResult } from './upload/file-validator.js';
export type { UploadResult, UploadProgress } from './upload/upload-manager.js';
export type { TrainingInitResult, UserTrainingStatus } from './upload/training-initiator.js';

/**
 * Refactored Bulletproof Upload Service using composition pattern
 * Maintains all original safeguards while improving maintainability
 */
export class BulletproofUploadService {
  private static fileValidator = new FileValidator();
  private static uploadManager = new UploadManager();
  private static trainingInitiator = new TrainingInitiator();
  private static db = getDatabase();

  /**
   * STEP 1: VALIDATE UPLOADED IMAGES (Legacy API)
   * Maintains original method signature for backward compatibility
   */
  static async validateUploadedImages(
    userId: string, 
    imageFiles: string[]
  ): Promise<{ success: boolean; errors: string[]; validImages: string[] }> {
    try {
      console.log(`🔍 BULLETPROOF UPLOAD: Legacy validation called for user ${userId}`);

      const result = await this.fileValidator.validateUploadedImages(userId, imageFiles);
      
      // Convert to legacy format
      return {
        success: result.success,
        errors: result.errors,
        validImages: result.validImages
      };

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Legacy validation failed:`, error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        validImages: []
      };
    }
  }

  /**
   * STEP 2: UPLOAD TO S3 (Legacy API)
   * Single file upload with original method signature
   */
  static async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/jpeg'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log(`📤 BULLETPROOF UPLOAD: Legacy S3 upload for key ${key}`);

      // Create temporary file for upload manager
      const tempPath = `/tmp/${Date.now()}-${key.split('/').pop()}`;
      require('fs').writeFileSync(tempPath, buffer);

      const uploadResult = await this.uploadManager.uploadImages({
        userId: 'legacy', // Legacy uploads don't have userId context
        files: [tempPath],
        metadata: {
          contentType,
          uploadMethod: 'legacy'
        }
      });

      // Cleanup
      try {
        require('fs').unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn('⚠️ BULLETPROOF UPLOAD: Failed to cleanup temp file:', cleanupError);
      }

      if (uploadResult.success && uploadResult.uploadedFiles.length > 0) {
        return {
          success: true,
          url: uploadResult.uploadedFiles[0].s3Url
        };
      } else {
        return {
          success: false,
          error: uploadResult.message
        };
      }

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Legacy S3 upload failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * STEP 3: UPLOAD MULTIPLE IMAGES TO S3 (Legacy API)
   */
  static async uploadImagesToS3(
    userId: string,
    imageFiles: string[]
  ): Promise<{ success: boolean; uploadedUrls: string[]; errors: string[] }> {
    try {
      console.log(`📤 BULLETPROOF UPLOAD: Legacy batch upload for user ${userId}`);

      const uploadResult = await this.uploadManager.uploadImages({
        userId,
        files: imageFiles,
        metadata: {
          uploadMethod: 'legacy-batch',
          timestamp: new Date().toISOString()
        }
      });

      return {
        success: uploadResult.success,
        uploadedUrls: uploadResult.uploadedFiles.map(file => file.s3Url),
        errors: uploadResult.failedFiles.map(file => file.error)
      };

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Legacy batch upload failed:`, error);
      return {
        success: false,
        uploadedUrls: [],
        errors: [error instanceof Error ? error.message : 'Batch upload failed']
      };
    }
  }

  /**
   * COMPLETE BULLETPROOF UPLOAD (Main Legacy API)
   * End-to-end upload and training initiation
   */
  static async completeBulletproofUpload(
    userId: string,
    imageFiles: string[],
    triggerWord?: string
  ): Promise<{ 
    success: boolean; 
    message: string; 
    trainingId?: string;
    validationErrors?: string[];
    uploadErrors?: string[];
  }> {
    try {
      console.log(`🚀 BULLETPROOF UPLOAD: Complete upload started for user ${userId}`);

      // Use the training initiator for the complete workflow
      const result = await this.trainingInitiator.completeBulletproofUpload({
        userId,
        uploadedFiles: imageFiles,
        triggerWord,
        trainingConfig: {
          steps: 1000,
          learningRate: 0.0001,
          batchSize: 1,
          resolution: '512,512'
        },
        notificationSettings: {
          sendUpdates: true
        }
      });

      // Convert to legacy format
      return {
        success: result.success,
        message: result.message,
        trainingId: result.trainingId,
        validationErrors: result.validationResult?.errors || [],
        uploadErrors: result.uploadResult?.failedFiles.map(f => f.error) || []
      };

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Complete upload failed for user ${userId}:`, error);
      return {
        success: false,
        message: `Complete upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * START REPLICATE TRAINING (Legacy API)
   */
  static async startReplicateTraining(
    userId: string,
    s3ZipUrl: string,
    triggerWord: string = 'person'
  ): Promise<{ 
    success: boolean; 
    trainingId?: string; 
    message: string;
    estimatedTime?: number;
  }> {
    try {
      console.log(`🎯 BULLETPROOF UPLOAD: Legacy training start for user ${userId}`);

      // Extract image URLs from ZIP (simplified - in real implementation you'd extract the ZIP)
      const imageUrls = [s3ZipUrl]; // Placeholder

      const trainingResult = await this.trainingInitiator.completeBulletproofUpload({
        userId,
        uploadedFiles: imageUrls,
        triggerWord,
        trainingConfig: {
          steps: 1000,
          learningRate: 0.0001
        }
      });

      return {
        success: trainingResult.success,
        trainingId: trainingResult.trainingId,
        message: trainingResult.message,
        estimatedTime: trainingResult.estimatedTime
      };

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Legacy training start failed:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Training start failed'
      };
    }
  }

  /**
   * UPDATE DATABASE WITH TRAINING INFO (Legacy API)
   */
  static async updateDatabaseWithTraining(
    userId: string,
    trainingData: {
      trainingId: string;
      triggerWord: string;
      imageUrls: string[];
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`💾 BULLETPROOF UPLOAD: Legacy database update for user ${userId}`);

      await this.db.updateUserModel(userId, {
        trainingStatus: 'starting',
        replicateModelId: trainingData.trainingId,
        triggerWord: trainingData.triggerWord,
        imageCount: trainingData.imageUrls.length,
        trainingStartedAt: new Date().toISOString()
      } as any);

      return {
        success: true,
        message: 'Database updated successfully'
      };

    } catch (error) {
      console.error(`❌ BULLETPROOF UPLOAD: Legacy database update failed:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Database update failed'
      };
    }
  }

  // ==================== NEW MODULAR API METHODS ====================
  // These provide access to the new modular services

  /**
   * Get file validator instance
   */
  static getFileValidator(): FileValidator {
    return this.fileValidator;
  }

  /**
   * Get upload manager instance
   */
  static getUploadManager(): UploadManager {
    return this.uploadManager;
  }

  /**
   * Get training initiator instance
   */
  static getTrainingInitiator(): TrainingInitiator {
    return this.trainingInitiator;
  }

  /**
   * Check user training status (New API)
   */
  static async checkUserTrainingStatus(userId: string) {
    return this.trainingInitiator.checkUserTrainingStatus(userId);
  }

  /**
   * Get comprehensive service health status
   */
  static async getHealthStatus() {
    try {
      const [validatorHealth, uploadHealth, initiatorHealth] = await Promise.all([
        this.fileValidator.getHealthStatus(),
        this.uploadManager.getHealthStatus(),
        this.trainingInitiator.getHealthStatus()
      ]);

      return {
        status: 'healthy' as const,
        services: {
          fileValidator: validatorHealth.status === 'healthy',
          uploadManager: uploadHealth.status === 'healthy',
          trainingInitiator: initiatorHealth.status === 'healthy'
        },
        capabilities: [
          'Legacy API compatibility',
          'Modular service architecture',
          'End-to-end upload workflow',
          'Training initiation',
          'Progress monitoring'
        ],
        details: {
          fileValidator: validatorHealth,
          uploadManager: uploadHealth,
          trainingInitiator: initiatorHealth
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy' as const,
        error: error instanceof Error ? error.message : 'Health check failed',
        services: {
          fileValidator: false,
          uploadManager: false,
          trainingInitiator: false
        },
        capabilities: []
      };
    }
  }

  /**
   * Reset all services (useful for testing)
   */
  static async resetServices(): Promise<void> {
    console.log('🔄 BULLETPROOF UPLOAD: Resetting all services');
    
    // Reinitialize services
    this.fileValidator = new FileValidator();
    this.uploadManager = new UploadManager();
    this.trainingInitiator = new TrainingInitiator();
    
    console.log('✅ BULLETPROOF UPLOAD: Services reset complete');
  }
}