/**
 * MODEL VALIDATION SERVICE
 * ZERO TOLERANCE for generic models - ensures ALL users only use their trained models
 * Fixes database corruption and prevents fallback to generic models
 */

import { storage } from './storage';

export interface ModelValidationResult {
  isValid: boolean;
  canGenerate: boolean;
  modelId: string | null;
  versionId: string | null;
  triggerWord: string | null;
  // REMOVED: loraWeightsUrl - packaged models only approach
  errorMessage?: string;
  requiresCorrection?: boolean;
}

export class ModelValidationService {
  /**
   * CRITICAL: Validates and corrects user model data
   * Prevents ANY fallback to generic models
   */
  static async validateAndCorrectUserModel(userId: string): Promise<ModelValidationResult> {
    console.log(`🔍 CRITICAL MODEL VALIDATION: Checking user ${userId}`);
    
    try {
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        return {
          isValid: false,
          canGenerate: false,
          modelId: null,
          versionId: null,
          triggerWord: null,
          errorMessage: 'No AI model found. Please complete training first by uploading selfies.'
        };
      }
      
      // Check training status
      if (userModel.trainingStatus !== 'completed') {
        return {
          isValid: false,
          canGenerate: false,
          modelId: userModel.replicateModelId,
          versionId: userModel.replicateVersionId,
          triggerWord: userModel.triggerWord,
          errorMessage: `Training not complete. Status: ${userModel.trainingStatus}. Please wait for training to finish.`
        };
      }
      
      // CRITICAL: Check for database corruption and fix it
      let modelId = userModel.replicateModelId;
      let versionId = userModel.replicateVersionId;
      let needsCorrection = false;
      
      // Fix corruption pattern: version_id contains full model:version path
      if (versionId && versionId.includes(':')) {
        console.log(`🚨 CORRUPTION DETECTED: User ${userId} has corrupted model data`);
        const parts = versionId.split(':');
        if (parts.length === 2) {
          modelId = parts[0]; // Extract the full model path
          versionId = parts[1]; // Extract just the version hash
          needsCorrection = true;
          
          console.log(`🔧 CORRECTING: Model: ${modelId}, Version: ${versionId}`);
          
          // Update database immediately
          await this.correctDatabaseModel(userId, modelId, versionId);
        }
      }
      
      // Validate model ID format
      if (!modelId || !modelId.includes('/')) {
        return {
          isValid: false,
          canGenerate: false,
          modelId,
          versionId,
          triggerWord: userModel.triggerWord,
          errorMessage: 'Invalid model ID format. Training data may be corrupted.',
          requiresCorrection: true
        };
      }
      
      // Validate version ID exists and is proper hash format
      if (!versionId || versionId.length < 32 || versionId.includes('/') || versionId.includes(':')) {
        return {
          isValid: false,
          canGenerate: false,
          modelId,
          versionId,
          triggerWord: userModel.triggerWord,
          errorMessage: 'Invalid version ID format. Training may not have completed properly.',
          requiresCorrection: true
        };
      }
      
      // Validate trigger word
      if (!userModel.triggerWord || userModel.triggerWord.trim() === '') {
        return {
          isValid: false,
          canGenerate: false,
          modelId,
          versionId,
          triggerWord: null,
          errorMessage: 'Missing trigger word. Model configuration incomplete.'
        };
      }
      
      // ALL VALIDATIONS PASSED
      console.log(`✅ User ${userId} model validated${needsCorrection ? ' and corrected' : ''}:`);
      console.log(`   Model ID: ${modelId}`);
      console.log(`   Version ID: ${versionId}`);
      console.log(`   Trigger Word: ${userModel.triggerWord}`);
      console.log(`   Packaged Model: Using trained model with built-in LoRA`);
      
      return {
        isValid: true,
        canGenerate: true,
        modelId,
        versionId,
        triggerWord: userModel.triggerWord
        // REMOVED: loraWeightsUrl - packaged models have LoRA built-in
      };
      
    } catch (error) {
      console.error(`❌ Model validation error for user ${userId}:`, error);
      return {
        isValid: false,
        canGenerate: false,
        modelId: null,
        versionId: null,
        triggerWord: null,
        errorMessage: 'System error during model validation. Please try again.'
      };
    }
  }
  
  /**
   * CRITICAL: Fixes corrupted database model entries
   */
  private static async correctDatabaseModel(userId: string, modelId: string, versionId: string): Promise<void> {
    try {
      console.log(`🔧 CORRECTING DATABASE: User ${userId} model data`);
      
      const { db } = await import('./db');
      const { userModels } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      await db
        .update(userModels)
        .set({
          replicateModelId: modelId,
          replicateVersionId: versionId,
          updatedAt: new Date()
        })
        .where(eq(userModels.userId, userId));
      
      console.log(`✅ CORRECTED: User ${userId} model data updated in database`);
      
    } catch (error) {
      console.error(`❌ Failed to correct model data for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * CRITICAL: Enforces that user can generate - throws error if not valid
   * ZERO TOLERANCE for fallbacks - Users MUST train before generating
   */
  static async enforceUserModelRequirements(userId: string): Promise<{modelId: string, versionId: string, triggerWord: string}> {
    const validation = await this.validateAndCorrectUserModel(userId);
    
    // 🔒 ZERO TOLERANCE: NO FALLBACKS EVER
    if (!validation.canGenerate) {
      throw new Error(validation.errorMessage || 'Cannot generate images - individual trained model required');
    }
    
    return {
      modelId: validation.modelId!,
      versionId: validation.versionId!,
      triggerWord: validation.triggerWord!
    };
  }
  
  /**
   * CRITICAL: Validates all completed user models for corruption
   * Run this to check system health
   */
  static async validateAllCompletedModels(): Promise<{healthy: number, corrupted: number, corrected: number}> {
    console.log('🔍 SYSTEM HEALTH CHECK: Validating all completed models...');
    
    let healthy = 0;
    let corrupted = 0;
    let corrected = 0;
    
    try {
      const { db } = await import('./db');
      const { userModels } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const completedModels = await db
        .select()
        .from(userModels)
        .where(eq(userModels.trainingStatus, 'completed'));
      
      for (const model of completedModels) {
        const validation = await this.validateAndCorrectUserModel(model.userId);
        
        if (validation.isValid) {
          if (validation.requiresCorrection) {
            corrected++;
          } else {
            healthy++;
          }
        } else {
          corrupted++;
          console.error(`❌ User ${model.userId} has corrupted model: ${validation.errorMessage}`);
        }
      }
      
      console.log(`📊 VALIDATION COMPLETE: ${healthy} healthy, ${corrupted} corrupted, ${corrected} corrected`);
      
      return { healthy, corrupted, corrected };
      
    } catch (error) {
      console.error('❌ System validation failed:', error);
      throw error;
    }
  }
}