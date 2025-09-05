/**
 * UNIFIED IMAGE GENERATION SERVICE - PASSTHROUGH TO MODEL TRAINING SERVICE
 * Surgical fix: Thin wrapper that delegates to ModelTrainingService
 */

import { ModelTrainingService } from './model-training-service';

// ✅ SIMPLIFIED: Maya always uses unified generation approach
// No environment variables needed - direct delegation to ModelTrainingService

/**
 * WRAPPER: Single entry point that calls ModelTrainingService
 * DO NOT build payload here - delegate to ModelTrainingService
 */
export async function generateImages(opts: {
  userId: string;
  prompt: string; 
  count?: number;
  preset?: string;
  seed?: number;
}) {
  return ModelTrainingService.generateUserImages(
    opts.userId,
    opts.prompt,
    opts.count ?? 4,
    { seed: opts.seed }
  );
}

export interface UnifiedGenerationRequest {
  userId: string;
  prompt: string;
  category?: string;
  subcategory?: string;
}

export interface UnifiedGenerationResponse {
  id: number;
  predictionId: string;
  imageUrls: string[];
  success: boolean;
}

/**
 * LEGACY CLASS - Now delegates to ModelTrainingService
 */
export class UnifiedGenerationService {
  
  /**
   * PASSTHROUGH: Delegate to ModelTrainingService
   */
  static async generateImages(request: UnifiedGenerationRequest): Promise<UnifiedGenerationResponse> {
    const { userId, prompt } = request;
    
    const result = await ModelTrainingService.generateUserImages(userId, prompt, 4);
    
    return {
      id: 0, // Not used in new architecture
      predictionId: result.predictionId || '',
      imageUrls: result.images || [],
      success: true
    };
  }
}