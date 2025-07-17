/**
 * CRITICAL GENERATION VALIDATOR
 * Ensures ZERO fallbacks - users can only generate with their own trained models
 */

import { storage } from './storage';

export interface UserModelValidation {
  isValid: boolean;
  canGenerate: boolean;
  triggerWord: string | null;
  modelVersion: string | null;
  errorMessage?: string;
}

export class GenerationValidator {
  /**
   * CRITICAL: Validates user can generate with their own trained model
   * Returns detailed validation results - NEVER allows fallbacks
   */
  static async validateUserForGeneration(userId: string): Promise<UserModelValidation> {
    try {
      console.log(`🔍 CRITICAL VALIDATION: Checking user ${userId} generation readiness`);
      
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        return {
          isValid: false,
          canGenerate: false,
          triggerWord: null,
          modelVersion: null,
          errorMessage: 'No AI model found. Please complete training first by uploading selfies.'
        };
      }
      
      // Check training status
      if (userModel.trainingStatus !== 'completed') {
        return {
          isValid: false,
          canGenerate: false,
          triggerWord: userModel.triggerWord,
          modelVersion: null,
          errorMessage: `Training not complete. Status: ${userModel.trainingStatus}. Please wait for training to finish or upload selfies to start training.`
        };
      }
      
      // Check trigger word exists
      if (!userModel.triggerWord || userModel.triggerWord.trim() === '') {
        return {
          isValid: false,
          canGenerate: false,
          triggerWord: null,
          modelVersion: userModel.replicateVersionId,
          errorMessage: 'Missing trigger word. Your model needs to be reconfigured.'
        };
      }
      
      // Check model version exists
      if (!userModel.replicateVersionId || userModel.replicateVersionId.trim() === '') {
        return {
          isValid: false,
          canGenerate: false,
          triggerWord: userModel.triggerWord,
          modelVersion: null,
          errorMessage: 'Missing model version. Your training may not have completed properly.'
        };
      }
      
      // Check model ID exists
      if (!userModel.replicateModelId || userModel.replicateModelId.trim() === '') {
        return {
          isValid: false,
          canGenerate: false,
          triggerWord: userModel.triggerWord,
          modelVersion: userModel.replicateVersionId,
          errorMessage: 'Missing model ID. Your training data is incomplete.'
        };
      }
      
      // ALL VALIDATIONS PASSED
      console.log(`✅ User ${userId} validated for generation:`);
      console.log(`   Trigger Word: ${userModel.triggerWord}`);
      console.log(`   Model: ${userModel.replicateModelId}`);
      console.log(`   Version: ${userModel.replicateVersionId}`);
      
      return {
        isValid: true,
        canGenerate: true,
        triggerWord: userModel.triggerWord,
        modelVersion: userModel.replicateVersionId,
      };
      
    } catch (error) {
      console.error(`❌ Validation error for user ${userId}:`, error);
      return {
        isValid: false,
        canGenerate: false,
        triggerWord: null,
        modelVersion: null,
        errorMessage: 'System error during validation. Please try again.'
      };
    }
  }
  
  /**
   * CRITICAL: Throws error if user cannot generate - prevents any fallback usage
   */
  static async enforceGenerationRequirements(userId: string): Promise<{triggerWord: string, modelVersion: string}> {
    const validation = await this.validateUserForGeneration(userId);
    
    if (!validation.canGenerate) {
      throw new Error(validation.errorMessage || 'Cannot generate images - requirements not met');
    }
    
    return {
      triggerWord: validation.triggerWord!,
      modelVersion: validation.modelVersion!
    };
  }
}