/**
 * LoRA MIGRATION SERVICE
 * Extracts LoRA weights from existing trained models and migrates them to FLUX 1.1 Pro + LoRA architecture
 * CRITICAL FIX for queuing and quality issues
 */

import { storage } from './storage';

export interface LoRAExtractionResult {
  userId: string;
  success: boolean;
  loraWeightsUrl?: string;
  error?: string;
}

export class LoRAMigrationService {
  
  /**
   * Extract LoRA weights URL from a completed Replicate training
   */
  static async extractLoRAWeightsFromTraining(trainingId: string): Promise<string | null> {
    try {
      console.log(`🔍 Extracting LoRA weights from training: ${trainingId}`);
      
      const response = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Failed to fetch training ${trainingId}: ${response.status}`);
        return null;
      }

      const trainingData = await response.json();
      
      // Extract LoRA weights URL from training output
      if (trainingData.output && trainingData.output.weights) {
        const loraWeightsUrl = trainingData.output.weights;
        console.log(`✅ LoRA weights extracted: ${loraWeightsUrl}`);
        return loraWeightsUrl;
      }
      
      console.log(`⚠️ No LoRA weights found in training ${trainingId} output`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error extracting LoRA weights from training ${trainingId}:`, error);
      return null;
    }
  }
  
  /**
   * Extract LoRA weights from a completed Replicate model
   */
  static async extractLoRAWeightsFromModel(modelId: string, versionId: string): Promise<string | null> {
    try {
      console.log(`🔍 Extracting LoRA weights from model: ${modelId}:${versionId}`);
      
      // Try to get the model version details
      const response = await fetch(`https://api.replicate.com/v1/models/${modelId}/versions/${versionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Failed to fetch model version ${modelId}:${versionId}: ${response.status}`);
        return null;
      }

      const versionData = await response.json();
      
      // Look for LoRA weights in the version files
      if (versionData.files && versionData.files.weights) {
        const loraWeightsUrl = versionData.files.weights;
        console.log(`✅ LoRA weights extracted from model: ${loraWeightsUrl}`);
        return loraWeightsUrl;
      }
      
      // Alternative: check if there's a downloadable weights URL
      if (versionData.urls && versionData.urls.get) {
        // This might contain the LoRA weights URL
        const weightsUrl = versionData.urls.get;
        console.log(`✅ Model weights URL found: ${weightsUrl}`);
        return weightsUrl;
      }
      
      console.log(`⚠️ No LoRA weights found in model ${modelId}:${versionId}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error extracting LoRA weights from model ${modelId}:${versionId}:`, error);
      return null;
    }
  }
  
  /**
   * Migrate a single user to LoRA architecture
   */
  static async migrateUserToLoRA(userId: string): Promise<LoRAExtractionResult> {
    try {
      console.log(`🔄 Migrating user ${userId} to LoRA architecture...`);
      
      const userModel = await storage.getUserModelByUserId(userId);
      
      if (!userModel) {
        return {
          userId,
          success: false,
          error: 'No model found for user'
        };
      }
      
      if (userModel.trainingStatus !== 'completed') {
        return {
          userId,
          success: false,
          error: `Training not completed. Status: ${userModel.trainingStatus}`
        };
      }
      
      // Skip if LoRA weights already exist
      if (userModel.loraWeightsUrl) {
        console.log(`✅ User ${userId} already has LoRA weights: ${userModel.loraWeightsUrl}`);
        return {
          userId,
          success: true,
          loraWeightsUrl: userModel.loraWeightsUrl
        };
      }
      
      let loraWeightsUrl = null;
      
      // Method 1: Extract from training ID if it's a training ID (starts with 'rdt_')
      if (userModel.replicateModelId && userModel.replicateModelId.startsWith('rdt_')) {
        loraWeightsUrl = await this.extractLoRAWeightsFromTraining(userModel.replicateModelId);
      }
      
      // Method 2: Extract from model version if we have both model and version ID
      if (!loraWeightsUrl && userModel.replicateModelId && userModel.replicateVersionId) {
        loraWeightsUrl = await this.extractLoRAWeightsFromModel(userModel.replicateModelId, userModel.replicateVersionId);
      }
      
      if (loraWeightsUrl) {
        // Update user model with LoRA weights URL
        await storage.updateUserModel(userId, {
          loraWeightsUrl: loraWeightsUrl,
          updatedAt: new Date()
        });
        
        console.log(`✅ User ${userId} migrated to LoRA architecture: ${loraWeightsUrl}`);
        return {
          userId,
          success: true,
          loraWeightsUrl
        };
      } else {
        return {
          userId,
          success: false,
          error: 'Could not extract LoRA weights from existing model'
        };
      }
      
    } catch (error) {
      console.error(`❌ Error migrating user ${userId} to LoRA:`, error);
      return {
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Migrate all completed user models to LoRA architecture
   */
  static async migrateAllUsersToLoRA(): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: LoRAExtractionResult[];
  }> {
    console.log('🚀 Starting migration of all users to LoRA architecture...');
    
    try {
      // Get all completed models without LoRA weights
      const { db } = await import('./db');
      const { userModels } = await import('../shared/schema');
      const { eq, and, isNull } = await import('drizzle-orm');
      
      const completedModels = await db
        .select()
        .from(userModels)
        .where(
          and(
            eq(userModels.trainingStatus, 'completed'),
            isNull(userModels.loraWeightsUrl)
          )
        );
      
      console.log(`📊 Found ${completedModels.length} users to migrate to LoRA architecture`);
      
      const results: LoRAExtractionResult[] = [];
      let successful = 0;
      let failed = 0;
      
      for (const userModel of completedModels) {
        const result = await this.migrateUserToLoRA(userModel.userId);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
        
        // Wait 1 second between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`📊 LoRA migration completed: ${successful} successful, ${failed} failed`);
      
      return {
        total: completedModels.length,
        successful,
        failed,
        results
      };
      
    } catch (error) {
      console.error('❌ Error during bulk LoRA migration:', error);
      throw error;
    }
  }
  
  /**
   * Test the new FLUX 1.1 Pro + LoRA architecture for a specific user
   */
  static async testLoRAArchitecture(userId: string, prompt: string): Promise<{
    success: boolean;
    architecture: 'LoRA' | 'fallback';
    generationTime?: number;
    imageUrls?: string[];
    error?: string;
  }> {
    try {
      console.log(`🧪 Testing LoRA architecture for user ${userId}...`);
      
      const startTime = Date.now();
      
      // Use the unified generation service which now supports LoRA
      const { UnifiedGenerationService } = await import('./unified-generation-service');
      const result = await UnifiedGenerationService.generateImages({
        userId,
        prompt,
        category: 'LoRA Architecture Test'
      });
      
      const generationTime = Date.now() - startTime;
      
      if (result.success) {
        const userModel = await storage.getUserModelByUserId(userId);
        const architecture = userModel?.loraWeightsUrl ? 'LoRA' : 'fallback';
        
        return {
          success: true,
          architecture,
          generationTime,
          imageUrls: result.imageUrls
        };
      } else {
        return {
          success: false,
          architecture: 'fallback',
          error: 'Generation failed'
        };
      }
      
    } catch (error) {
      console.error(`❌ Error testing LoRA architecture for user ${userId}:`, error);
      return {
        success: false,
        architecture: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}