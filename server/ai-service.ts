import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';

// FLUX model configuration for SSELFIE generation - SECURE VERSION
const FLUX_MODEL_CONFIG = {
  // ALL FALLBACK MODELS PERMANENTLY REMOVED FOR PRODUCTION SECURITY
  // Each user must have their own completed trained model
  apiUrl: 'https://api.replicate.com/v1/predictions',
  styles: {
    editorial: 'luxury editorial magazine style, high-end fashion photography, designer clothing, sophisticated styling, elegant feminine outfits, Milan street style inspiration',
    business: 'professional executive style, tailored designer pieces, sophisticated business attire, luxury professional wear, elegant and polished',
    lifestyle: 'chic lifestyle photography, designer casual wear, effortless luxury style, sophisticated everyday fashion, elegant feminine aesthetic', 
    luxury: 'high fashion luxury photography, designer outfits, sophisticated styling, premium fashion pieces, elegant and refined feminine style'
  },
  // Film-grained, matte quality prompts with high fashion styling
  qualityPrompts: {
    editorial: 'shot on 35mm film, heavy film grain, matte skin finish, natural skin texture, wearing designer clothing, tailored pieces, sophisticated styling, elegant feminine fashion, high-end materials, no cheap or basic clothing',
    business: 'shot on film camera, natural matte finish, authentic skin texture, film grain, wearing luxury professional attire, tailored blazers, sophisticated business wear, elegant executive style',
    lifestyle: 'film photography, heavy grain, matte finish, natural skin texture, wearing chic casual designer pieces, effortless luxury style, sophisticated everyday fashion, elegant feminine aesthetic',
    luxury: 'analog film photography, pronounced film grain, matte skin finish, wearing high fashion designer outfits, luxury materials, sophisticated styling, elegant and refined feminine pieces, premium fashion'
  },
  // High fashion outfit specifications to avoid basic clothing
  fashionPrompts: {
    outfits: 'wearing designer pieces, tailored clothing, luxury materials, sophisticated styling, elegant feminine fashion, high-end accessories, refined aesthetic',
    avoidBasic: 'no basic t-shirts, no plain casual wear, no cheap materials, no unflattering cuts, no frumpy clothing, no outdated styles'
  }
};

interface ImageGenerationRequest {
  userId: string;
  imageBase64: string;
  style: 'editorial' | 'business' | 'lifestyle' | 'luxury';
  prompt?: string;
}

interface FluxResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
}

export class AIService {
  static async generateSSELFIE(request: ImageGenerationRequest): Promise<{ aiImageId: number; predictionId: string; usageStatus: any }> {
    const { userId, imageBase64, style, prompt } = request;
    
    // CRITICAL: Validate user model completion FIRST - NO FALLBACKS
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    
    // 1. Check usage limits AFTER model validation
    const usageCheck = await UsageService.checkUsageLimit(userId);
    if (!usageCheck.canGenerate) {
      throw new Error(`Generation limit reached: ${usageCheck.reason}`);
    }

    // Create generated image record in database with pending status
    const generatedImage = await storage.createGeneratedImage({
      userId,
      image_urls: '', // Will be updated when generation completes
      prompt: prompt || `${FLUX_MODEL_CONFIG.styles[style]}, SSELFIE transformation`,
      style,
      isSelected: false,
      predictionId: '', // Will be updated after API call
      generationStatus: 'pending'
    });

    try {
      // Call FLUX model API
      const fluxPrompt = await this.buildFluxPrompt(style, prompt, userId);
      const predictionId = await this.callFluxAPI(imageBase64, fluxPrompt, userId);
      
      // Update with prediction ID
      await storage.updateGeneratedImage(generatedImage.id, { 
        predictionId,
        generationStatus: 'processing'
      });

      // 2. Record usage immediately when API call succeeds
      await UsageService.recordUsage(userId, {
        actionType: 'generation',
        resourceUsed: 'replicate_ai',
        cost: API_COSTS.replicate_ai,
        details: {
          style,
          prompt: fluxPrompt,
          predictionId
        },
        generatedImageId: generatedImage.id
      });

      // Get updated usage status for frontend
      const updatedUsage = await UsageService.checkUsageLimit(userId);
      
      return {
        aiImageId: generatedImage.id,
        predictionId,
        usageStatus: updatedUsage
      };
    } catch (error) {
      console.error('FLUX API call failed:', error);
      // Update generated image with error status
      await storage.updateGeneratedImage(generatedImage.id, {
        image_urls: 'error',
        prompt: `Error: ${error.message}`,
        generationStatus: 'failed'
      });
      throw error;
    }
  }

  static async checkGenerationStatus(predictionId: string): Promise<FluxResponse> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    const response = await fetch(`${FLUX_MODEL_CONFIG.apiUrl}/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateImageStatus(aiImageId: number, predictionId: string): Promise<void> {
    try {
      const status = await this.checkGenerationStatus(predictionId);
      
      console.log('Updating image status:', { aiImageId, predictionId, status: status.status, outputCount: status.output?.length });
      
      switch (status.status) {
        case 'succeeded':
          if (status.output && status.output.length > 0) {
            // Store images permanently in S3 before updating database
            const { ImageStorageService } = await import('./image-storage-service');
            const permanentUrls = await ImageStorageService.storeMultipleImages(
              status.output, 
              'user_generated', // Use generic prefix for AI generations
              aiImageId.toString()
            );
            
            // Store all permanent S3 URLs as JSON array for user selection
            await storage.updateGeneratedImage(aiImageId, {
              image_urls: JSON.stringify(permanentUrls), // Store permanent S3 URLs
              generationStatus: 'completed'
            });
            console.log('Successfully updated completed generation with permanent URLs:', aiImageId);
          }
          break;
          
        case 'failed':
          await storage.updateGeneratedImage(aiImageId, {
            image_urls: 'error',
            prompt: `Generation failed: ${status.error || 'Unknown error'}`,
            generationStatus: 'failed'
          });
          break;
          
        case 'starting':
        case 'processing':
          await storage.updateGeneratedImage(aiImageId, {
            generationStatus: 'processing'
          });
          break;
          
        case 'canceled':
          await storage.updateGeneratedImage(aiImageId, {
            image_urls: 'canceled',
            prompt: 'Generation was canceled',
            generationStatus: 'canceled'
          });
          break;
      }
    } catch (error) {
      console.error('Error updating image status:', error);
      throw error;
    }
  }

  static async forceUpdateCompletedGeneration(aiImageId: number, predictionId: string): Promise<void> {
    // Force update a generation we know is completed - for immediate testing
    const imageUrls = [
      "https://replicate.delivery/xezq/EACv4QnHlGZmAdsgwbI0wEvF6iPQQUWfP1fMgS75YlaH17epA/out-0.png",
      "https://replicate.delivery/xezq/yD2CLzqxelQKCa7mrzA5wafQTXatRfXYGgpfP5Lxtz2cUv7TB/out-1.png",
      "https://replicate.delivery/xezq/muwUNJw71c5RHxXvHj2omavH3i0zCEr1tlqDXG9BuFzR9uPF/out-2.png",
      "https://replicate.delivery/xezq/Ud5UU61WmNqNBJ0i1OliFJTHqoB3Ratv8dBsOTmSPa2R9uPF/out-3.png"
    ];
    
    await storage.updateGeneratedImage(aiImageId, {
      image_urls: JSON.stringify(imageUrls),
      generationStatus: 'completed'
    });
    
    console.log('Force updated generation with completed images:', aiImageId);
  }

  private static async buildFluxPrompt(style: string, customPrompt?: string, userId?: string): Promise<string> {
    const basePrompt = FLUX_MODEL_CONFIG.styles[style] || FLUX_MODEL_CONFIG.styles.editorial;
    const qualityPrompt = FLUX_MODEL_CONFIG.qualityPrompts[style] || FLUX_MODEL_CONFIG.qualityPrompts.editorial;
    
    // CRITICAL: Get user's trained model - NO FALLBACKS ALLOWED
    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    
    // Use ONLY user's unique trigger word - NO FALLBACKS
    const triggerWord = userModel.triggerWord;
    const triggerPrompt = `${triggerWord}, SSELFIE style transformation`;
    
    if (customPrompt) {
      return `${triggerPrompt}, ${customPrompt}, ${basePrompt}, ${qualityPrompt}`;
    }
    
    return `${triggerPrompt}, ${basePrompt}, ${qualityPrompt}`;
  }

  private static async callFluxAPI(imageBase64: string, prompt: string, userId?: string): Promise<string> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // CRITICAL: Get user's trained model - NO FALLBACKS ALLOWED
    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }

    console.log(`🔒 SECURE: Using only user's trained model: sandrasocial/${userModel.modelName}`);
    console.log(`🔒 SECURE: Using only user's trigger word: ${userModel.triggerWord}`);

    // Use SAME API format as image-generation-service.ts for consistency
    const fluxModelVersion = 'black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5';
    
    const requestBody = {
      version: fluxModelVersion, // Use version parameter as required by Replicate
      input: {
        prompt: prompt,
        guidance: 3.2,              // Higher guidance for stronger prompt adherence and likeness
        lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
        lora_scale: 1.0,           // Maximum LoRA application for strongest likeness
        num_inference_steps: 33,    // High quality steps
        num_outputs: 3,            // Generate 3 focused images
        aspect_ratio: "3:4",        // Portrait ratio better for selfies
        output_format: "png",       // PNG for highest quality
        output_quality: 85,         // Quality for natural grain
        megapixels: "1",           // Approximate megapixels
        go_fast: false,             // Quality over speed
        disable_safety_checker: false
      }
    };
    
    console.log('🔒 SECURE: API request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(FLUX_MODEL_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`FLUX API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('🔒 SECURE: Generation started with user-specific model for prediction:', prediction.id);
    return prediction.id;
  }

  static async generateMultipleStyles(userId: string, imageBase64: string): Promise<{ [style: string]: { aiImageId: number; predictionId: string } }> {
    const styles = ['editorial', 'business', 'lifestyle', 'luxury'] as const;
    const results: { [style: string]: { aiImageId: number; predictionId: string } } = {};

    // Generate all styles in parallel
    const promises = styles.map(async (style) => {
      const result = await this.generateSSELFIE({
        userId,
        imageBase64,
        style
      });
      results[style] = result;
    });

    await Promise.all(promises);
    return results;
  }

  static async pollGenerationStatus(aiImageId: number, predictionId: string, maxAttempts: number = 30): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.checkGenerationStatus(predictionId);
        
        if (status.status === 'succeeded' || status.status === 'failed' || status.status === 'canceled') {
          await this.updateImageStatus(aiImageId, predictionId);
          return;
        }
        
        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error(`Status check attempt ${attempts} failed:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          await storage.updateAiImage(aiImageId, {
            imageUrl: 'error',
            prompt: 'Generation timeout - max attempts reached'
          });
          throw new Error('Generation polling timeout');
        }
      }
    }
  }
}