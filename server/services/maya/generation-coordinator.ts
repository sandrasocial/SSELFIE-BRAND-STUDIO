/**
 * Maya Generation Coordinator
 * Handles image generation and monitoring for Maya AI system
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';

export interface MayaGenerationRequest {
  conceptCard: {
    id: string;
    title: string;
    description?: string;
    fluxPrompt: string;
  };
  conversationId?: string;
}

export interface MayaGenerationResponse {
  generationId: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
}

export class MayaGenerationCoordinator {
  private db: IStorage;
  private replicateApiToken: string;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    // Validate Replicate API access
    this.replicateApiToken = process.env['REPLICATE_API_TOKEN'] || '';
    if (!this.replicateApiToken) {
      console.error('❌ MAYA GENERATION: REPLICATE_API_TOKEN environment variable is not set');
      throw new Error('Maya generation coordinator is not properly configured - missing Replicate API token');
    }
    
    console.log('✅ MAYA GENERATION: Coordinator initialized with Replicate API access');
  }

  /**
   * Generate images based on concept card
   */
  async generateImages(userId: string, request: MayaGenerationRequest): Promise<MayaGenerationResponse> {
    try {
      console.log(`🎨 MAYA GENERATION: Starting image generation for user ${userId}`);
      
      // Get user model information
      const userModel = await this.db.getUserModelByUserId(userId);
      if (!userModel || userModel.trainingStatus !== 'completed') {
        return {
          generationId: '',
          status: 'failed',
          message: 'User model training is not complete. Please complete model training first.'
        };
      }

      // Start FLUX generation
      const generationId = await this.startFluxGeneration(userId, userModel, request);
      
      if (!generationId) {
        return {
          generationId: '',
          status: 'failed',
          message: 'Failed to start image generation. Please try again.'
        };
      }

      // Start monitoring generation completion
      this.monitorGenerationCompletion(generationId, userId);

      console.log(`✅ MAYA GENERATION: Started generation ${generationId} for user ${userId}`);
      
      return {
        generationId,
        status: 'processing',
        message: 'Image generation started successfully. Your images will be ready shortly.'
      };

    } catch (error) {
      console.error('❌ MAYA GENERATION: Generation failed:', error);
      return {
        generationId: '',
        status: 'failed',
        message: 'Image generation failed. Please try again or contact support.'
      };
    }
  }

  /**
   * Start FLUX generation with Replicate
   */
  private async startFluxGeneration(
    userId: string, 
    userModel: any, 
    request: MayaGenerationRequest
  ): Promise<string | null> {
    try {
      const replicateUrl = 'https://api.replicate.com/v1/predictions';
      
      // Build FLUX prompt with user's trigger word
      const triggerWord = userModel.triggerWord || 'person';
      const fluxPrompt = `A professional portrait of ${triggerWord}, ${request.conceptCard.fluxPrompt}`;
      
      const payload = {
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt: fluxPrompt,
          num_outputs: 4,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          guidance_scale: 3.5,
          num_inference_steps: 4,
          seed: Math.floor(Math.random() * 1000000)
        }
      };

      const response = await fetch(replicateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`🚀 MAYA GENERATION: Started FLUX generation ${result.id} for user ${userId}`);
      
      return result.id;

    } catch (error) {
      console.error('❌ MAYA GENERATION: FLUX generation start failed:', error);
      return null;
    }
  }

  /**
   * Monitor generation completion (fire and forget)
   */
  private async monitorGenerationCompletion(generationId: string, userId: string): Promise<void> {
    // This runs in the background without blocking the main response
    setTimeout(async () => {
      try {
        await this.pollGenerationStatus(generationId, userId);
      } catch (error) {
        console.error('❌ MAYA GENERATION: Monitoring failed:', error);
      }
    }, 5000); // Check after 5 seconds
  }

  /**
   * Poll generation status from Replicate
   */
  private async pollGenerationStatus(generationId: string, userId: string): Promise<void> {
    const maxAttempts = 20; // Max 20 attempts (10 minutes)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${generationId}`, {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Replicate status check failed: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'succeeded' && result.output) {
          console.log(`✅ MAYA GENERATION: Generation ${generationId} completed successfully`);
          
          // Save generated images to database
          await this.saveGeneratedImages(userId, generationId, result.output);
          break;
          
        } else if (result.status === 'failed') {
          console.error(`❌ MAYA GENERATION: Generation ${generationId} failed:`, result.error);
          break;
          
        } else if (result.status === 'canceled') {
          console.warn(`⚠️ MAYA GENERATION: Generation ${generationId} was canceled`);
          break;
        }
        
        // Still processing, wait and try again
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
        
      } catch (error) {
        console.error(`❌ MAYA GENERATION: Status polling error for ${generationId}:`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    if (attempts >= maxAttempts) {
      console.warn(`⚠️ MAYA GENERATION: Polling timeout for generation ${generationId}`);
    }
  }

  /**
   * Save generated images to the database
   */
  private async saveGeneratedImages(userId: string, generationId: string, imageUrls: string[]): Promise<void> {
    try {
      for (const imageUrl of imageUrls) {
        await this.db.saveAIImage({
          userId,
          replicateId: generationId,
          prompt: 'Maya generated image',
          imageUrl,
          status: 'completed',
          source: 'maya_generation',
          metadata: {
            service: 'maya',
            generationId
          }
        } as any);
      }
      
      console.log(`💾 MAYA GENERATION: Saved ${imageUrls.length} images for user ${userId}`);
      
    } catch (error) {
      console.error('❌ MAYA GENERATION: Failed to save images:', error);
    }
  }

  /**
   * Get generation status for a specific generation
   */
  async getGenerationStatus(userId: string, generationId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    images?: string[];
    message: string;
  }> {
    try {
      // Check if images are already saved in our database
      const userImages = await this.db.getAIImages(userId);
      const generationImages = userImages.filter((img: any) => 
        img.replicateId === generationId || img.metadata?.generationId === generationId
      );

      if (generationImages.length > 0) {
        return {
          status: 'completed',
          images: generationImages.map((img: any) => img.imageUrl),
          message: `Generation completed! ${generationImages.length} images ready.`
        };
      }

      // Check status from Replicate API
      const response = await fetch(`https://api.replicate.com/v1/predictions/${generationId}`, {
        headers: {
          'Authorization': `Token ${this.replicateApiToken}`
        }
      });

      if (!response.ok) {
        return {
          status: 'failed',
          message: 'Failed to check generation status. Please try again.'
        };
      }

      const result = await response.json();
      
      switch (result.status) {
        case 'succeeded':
          return {
            status: 'completed',
            images: result.output || [],
            message: 'Generation completed successfully!'
          };
        case 'failed':
          return {
            status: 'failed',
            message: 'Generation failed. Please try again.'
          };
        case 'processing':
        case 'starting':
          return {
            status: 'processing',
            progress: result.progress ? Math.round(result.progress * 100) : undefined,
            message: 'Your images are being generated...'
          };
        default:
          return {
            status: 'processing',
            message: 'Generation in progress...'
          };
      }

    } catch (error) {
      console.error('❌ MAYA GENERATION: Status check failed:', error);
      return {
        status: 'failed',
        message: 'Failed to check generation status. Please try again.'
      };
    }
  }
}

// Export singleton instance
export const mayaGenerationCoordinator = new MayaGenerationCoordinator();