/**
 * Image Variations Service
 * Generates close variations from existing gallery images
 */

import { storage } from '../../storage';
import { ModelTrainingService } from '../../model-training-service';

export interface VariationRequest {
  originalImageId: number;
  originalImageType: 'ai_image' | 'generated_image';
  userId: string;
  count?: number; // Default 3
}

export interface VariationResponse {
  success: boolean;
  predictionId?: string;
  variantIds?: number[];
  error?: string;
}

export class ImageVariationsService {
  /**
   * Generate variations of an existing image
   */
  static async generateVariations(request: VariationRequest): Promise<VariationResponse> {
    try {
      console.log('🎨 VARIATIONS: Starting variations for user', request.userId, 'image', request.originalImageId);

      const count = request.count || 3;

      // Get the original image
      let originalImage: any = null;
      let derivedPrompt = '';
      
      if (request.originalImageType === 'ai_image') {
        const aiImages = await storage.getAIImages(request.userId);
        originalImage = aiImages.find(img => img.id === request.originalImageId);
      } else {
        const genImages = await storage.getGeneratedImages(request.userId);
        originalImage = genImages.find(img => img.id === request.originalImageId);
      }

      if (!originalImage) {
        throw new Error('Original image not found or not owned by user');
      }

      // Extract or derive prompt
      derivedPrompt = await this.derivePromptFromImage(originalImage, request.originalImageType);

      if (!derivedPrompt) {
        throw new Error('Could not derive prompt for variations');
      }

      console.log('🎨 VARIATIONS: Using derived prompt:', derivedPrompt);

      // Create initial variant records
      const variantIds: number[] = [];
      for (let i = 0; i < count; i++) {
        const variantId = await storage.createImageVariant({
          userId: request.userId,
          originalImageId: request.originalImageId,
          originalImageType: request.originalImageType,
          imageUrl: '', // Will be filled when generation completes
          kind: 'variation',
          prompt: derivedPrompt,
          generationStatus: 'pending',
          metadata: {
            originalImageUrl: originalImage.imageUrl || originalImage.selectedUrl,
            variationIndex: i + 1,
            totalVariations: count,
            createdAt: new Date().toISOString()
          }
        });
        variantIds.push(variantId);
      }

      // Add some variation to the prompt for diversity
      const variationPrompts = this.generateVariationPrompts(derivedPrompt, count);

      // Use Maya's generation service to create variations
      const result = await ModelTrainingService.generateUserImages(
        request.userId,
        variationPrompts[0], // Use first variation prompt for the prediction
        count,
        {
          seed: Math.floor(Math.random() * 1000000), // Random seed for variation
          categoryContext: 'variations'
        }
      );

      if (!result.predictionId) {
        throw new Error('Failed to start variation generation');
      }

      // Update variant records with prediction ID
      for (const variantId of variantIds) {
        await storage.updateImageVariant(variantId, {
          predictionId: result.predictionId,
          generationStatus: 'processing'
        });
      }

      console.log('✅ VARIATIONS: Started successfully with prediction ID:', result.predictionId);

      return {
        success: true,
        predictionId: result.predictionId,
        variantIds
      };

    } catch (error) {
      console.error('❌ VARIATIONS: Error generating variations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Derive prompt from original image metadata
   */
  private static async derivePromptFromImage(
    originalImage: any, 
    imageType: 'ai_image' | 'generated_image'
  ): Promise<string> {
    try {
      // First, try to use existing metadata
      if (originalImage.prompt) {
        return originalImage.prompt;
      }

      if (originalImage.generatedPrompt) {
        return originalImage.generatedPrompt;
      }

      // Fallback: Use Maya's captioning/analysis
      // This is a placeholder - in a real implementation, you might use
      // GPT-4 Vision, BLIP, or another image captioning service
      return await this.generatePromptFromImageAnalysis(originalImage);

    } catch (error) {
      console.error('❌ VARIATIONS: Error deriving prompt:', error);
      throw new Error('Failed to derive prompt from image');
    }
  }

  /**
   * Generate multiple variation prompts from a base prompt
   */
  private static generateVariationPrompts(basePrompt: string, count: number): string[] {
    const variations = [];
    
    // Add variation modifiers to create diverse results
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
      
      // Add modifiers to create variations
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

  /**
   * Generate prompt from image analysis (fallback method)
   */
  private static async generatePromptFromImageAnalysis(originalImage: any): Promise<string> {
    // This is a fallback method when no metadata is available
    // In a production system, this would use image captioning AI
    
    // For now, create a generic prompt based on image metadata
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

  /**
   * Check variation generation status
   */
  static async checkVariationStatus(
    predictionId: string, 
    variantIds: number[]
  ): Promise<{ status: string; imageUrls?: string[]; error?: string; }> {
    try {
      const result = await ModelTrainingService.checkGenerationStatus(predictionId);
      
      if (result.status === 'succeeded' && result.imageUrls && result.imageUrls.length > 0) {
        // Update variant records with completed images
        for (let i = 0; i < variantIds.length && i < result.imageUrls.length; i++) {
          await storage.updateImageVariant(variantIds[i], {
            imageUrl: result.imageUrls[i],
            generationStatus: 'completed'
          });
        }

        return { status: 'completed', imageUrls: result.imageUrls };
      } else if (result.status === 'failed') {
        // Update all variants to failed status
        for (const variantId of variantIds) {
          await storage.updateImageVariant(variantId, {
            generationStatus: 'failed',
            metadata: { error: 'Generation failed' }
          });
        }
        return { status: 'failed', error: 'Variation generation failed' };
      } else {
        return { status: 'processing' };
      }

    } catch (error) {
      console.error('❌ VARIATIONS: Error checking status:', error);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Get all variations for a specific image
   */
  static async getImageVariations(
    originalImageId: number,
    originalImageType: 'ai_image' | 'generated_image',
    userId: string
  ): Promise<any[]> {
    try {
      const variants = await storage.getImageVariants(originalImageId, originalImageType, 'variation');
      
      // Filter by user to ensure security
      return variants.filter(variant => variant.userId === userId);
    } catch (error) {
      console.error('❌ VARIATIONS: Error getting image variations:', error);
      return [];
    }
  }

  /**
   * Get all variations for a user
   */
  static async getUserVariations(userId: string): Promise<any[]> {
    try {
      return await storage.getImageVariantsByKind(userId, 'variation');
    } catch (error) {
      console.error('❌ VARIATIONS: Error getting user variations:', error);
      return [];
    }
  }
}
