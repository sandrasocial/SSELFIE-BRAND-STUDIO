import { storage } from '../../storage.js';
import { ModelTrainingService } from '../../model-training-service.js';
export class ImageVariationsService {
    static async generateVariations(request) {
        try {
            console.log('🎨 VARIATIONS: Starting variations for user', request.userId, 'image', request.originalImageId);
            const count = request.count || 3;
            let originalImage = null;
            let derivedPrompt = '';
            if (request.originalImageType === 'ai_image') {
                const aiImages = await storage.getAIImages(request.userId);
                originalImage = aiImages.find(img => img.id === request.originalImageId);
            }
            else {
                const genImages = await storage.getGeneratedImages(request.userId);
                originalImage = genImages.find(img => img.id === request.originalImageId);
            }
            if (!originalImage) {
                throw new Error('Original image not found or not owned by user');
            }
            derivedPrompt = await this.derivePromptFromImage(originalImage, request.originalImageType);
            if (!derivedPrompt) {
                throw new Error('Could not derive prompt for variations');
            }
            console.log('🎨 VARIATIONS: Using derived prompt:', derivedPrompt);
            const variantIds = [];
            for (let i = 0; i < count; i++) {
                const variant = await storage.saveImageVariant({
                    userId: request.userId,
                    originalImageId: request.originalImageId,
                    variantUrl: '',
                    variantType: 'variation',
                    brandAssetId: 0,
                    placementData: {
                        prompt: derivedPrompt,
                        processingStatus: 'pending',
                        originalImageUrl: originalImage.imageUrl || originalImage.selectedUrl,
                        variationIndex: i + 1,
                        totalVariations: count,
                        createdAt: new Date().toISOString()
                    }
                });
                variantIds.push(variant.id);
            }
            const variationPrompts = this.generateVariationPrompts(derivedPrompt, count);
            const result = await ModelTrainingService.generateUserImages(request.userId, variationPrompts[0], count, {
                seed: Math.floor(Math.random() * 1000000),
                categoryContext: 'variations'
            });
            if (!result.predictionId) {
                throw new Error('Failed to start variation generation');
            }
            for (const variantId of variantIds) {
                await storage.updateImageVariant(variantId, {
                    processingStatus: 'processing',
                    placementData: {
                        predictionId: result.predictionId
                    }
                });
            }
            console.log('✅ VARIATIONS: Started successfully with prediction ID:', result.predictionId);
            return {
                success: true,
                predictionId: result.predictionId,
                variantIds
            };
        }
        catch (error) {
            console.error('❌ VARIATIONS: Error generating variations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    static async derivePromptFromImage(originalImage, imageType) {
        try {
            if (originalImage.prompt) {
                return originalImage.prompt;
            }
            if (originalImage.generatedPrompt) {
                return originalImage.generatedPrompt;
            }
            return await this.generatePromptFromImageAnalysis(originalImage);
        }
        catch (error) {
            console.error('❌ VARIATIONS: Error deriving prompt:', error);
            throw new Error('Failed to derive prompt from image');
        }
    }
    static generateVariationPrompts(basePrompt, count) {
        const variations = [];
        const styleModifiers = [
            'professional photo',
            'elegant portrait',
            'artistic photography',
            'modern style',
            'contemporary look'
        ];
        const lightingModifiers = [
            'natural lighting',
            'soft lighting',
            'dramatic lighting',
            'golden hour lighting',
            'studio lighting'
        ];
        const qualityModifiers = [
            'high quality, detailed',
            'professional, polished',
            'crisp, sharp focus',
            'masterpiece quality'
        ];
        for (let i = 0; i < count; i++) {
            const styleModifier = styleModifiers[i % styleModifiers.length];
            const lightingModifier = lightingModifiers[i % lightingModifiers.length];
            const qualityModifier = qualityModifiers[i % qualityModifiers.length];
            let variationPrompt = basePrompt;
            if (!variationPrompt.includes('professional') && !variationPrompt.includes('photo')) {
                variationPrompt = `${styleModifier}, ${variationPrompt}`;
            }
            if (!variationPrompt.includes('lighting')) {
                variationPrompt = `${variationPrompt}, ${lightingModifier}`;
            }
            if (!variationPrompt.includes('quality') && !variationPrompt.includes('detailed')) {
                variationPrompt = `${variationPrompt}, ${qualityModifier}`;
            }
            variations.push(variationPrompt.trim());
        }
        return variations;
    }
    static async generatePromptFromImageAnalysis(originalImage) {
        const style = originalImage.style || 'professional';
        const category = originalImage.category || 'portrait';
        const genericPrompts = {
            'professional': 'professional business portrait, clean background, confident expression',
            'editorial': 'editorial fashion photography, dramatic lighting, artistic composition',
            'lifestyle': 'lifestyle photography, natural setting, authentic moment',
            'luxury': 'luxury portrait, elegant styling, high-end fashion'
        };
        return genericPrompts[style] || genericPrompts['professional'];
    }
    static async checkVariationStatus(predictionId, variantIds) {
        try {
            const result = await ModelTrainingService.checkGenerationStatus(predictionId);
            if (result.status === 'succeeded' && result.imageUrls && result.imageUrls.length > 0) {
                for (let i = 0; i < variantIds.length && i < result.imageUrls.length; i++) {
                    await storage.updateImageVariant(variantIds[i], {
                        variantUrl: result.imageUrls[i],
                        processingStatus: 'completed'
                    });
                }
                return { status: 'completed', imageUrls: result.imageUrls };
            }
            else if (result.status === 'failed') {
                for (const variantId of variantIds) {
                    await storage.updateImageVariant(variantId, {
                        processingStatus: 'failed',
                        placementData: {
                            status: 'failed',
                            error: 'Generation failed'
                        }
                    });
                }
                return { status: 'failed', error: 'Variation generation failed' };
            }
            else {
                return { status: 'processing' };
            }
        }
        catch (error) {
            console.error('❌ VARIATIONS: Error checking status:', error);
            return { status: 'failed', error: error.message };
        }
    }
    static async getImageVariations(originalImageId, originalImageType, userId) {
        try {
            const allVariants = await storage.getImageVariants(userId);
            return allVariants.filter(variant => variant.originalImageId === originalImageId &&
                variant.variantType === 'variation');
        }
        catch (error) {
            console.error('❌ VARIATIONS: Error getting image variations:', error);
            return [];
        }
    }
    static async getUserVariations(userId) {
        try {
            const variants = await storage.getImageVariants(userId);
            return variants.filter(v => v.variantType === 'variation');
        }
        catch (error) {
            console.error('❌ VARIATIONS: Error getting user variations:', error);
            return [];
        }
    }
}
//# sourceMappingURL=variations.js.map