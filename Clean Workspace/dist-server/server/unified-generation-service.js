/**
 * UNIFIED IMAGE GENERATION SERVICE - PASSTHROUGH TO MODEL TRAINING SERVICE
 * Surgical fix: Thin wrapper that delegates to ModelTrainingService
 */
import { ModelTrainingService } from './model-training-service.js';
// ✅ SIMPLIFIED: Maya always uses unified generation approach
// No environment variables needed - direct delegation to ModelTrainingService
/**
 * WRAPPER: Single entry point that calls ModelTrainingService
 * DO NOT build payload here - delegate to ModelTrainingService
 */
export async function generateImages(opts) {
    return ModelTrainingService.generateUserImages(opts.userId, opts.prompt, opts.count ?? 4, { seed: opts.seed });
}
/**
 * LEGACY CLASS - Now delegates to ModelTrainingService
 */
export class UnifiedGenerationService {
    /**
     * PASSTHROUGH: Delegate to ModelTrainingService
     */
    static async generateImages(request) {
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
