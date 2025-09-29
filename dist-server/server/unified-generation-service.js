import { ModelTrainingService } from './model-training-service.js';
export async function generateImages(opts) {
    return ModelTrainingService.generateUserImages(opts.userId, opts.prompt, opts.count ?? 4, { seed: opts.seed });
}
export class UnifiedGenerationService {
    static async generateImages(request) {
        const { userId, prompt } = request;
        const result = await ModelTrainingService.generateUserImages(userId, prompt, 4);
        return {
            id: 0,
            predictionId: result.predictionId || '',
            imageUrls: result.images || [],
            success: true
        };
    }
}
//# sourceMappingURL=unified-generation-service.js.map