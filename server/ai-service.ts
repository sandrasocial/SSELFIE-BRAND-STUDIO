import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';

// FLUX model configuration for SSELFIE generation
const FLUX_MODEL_CONFIG = {
  // Sandra's high-quality trained model
  sandraModelId: 'sandrasocial/sseelfie-ai',
  sandraTriggerWord: 'subject',
  sandraUserId: '42585527', // Sandra's user ID
  // For other users: individual trained models
  demoModelId: 'sandrasocial/sseelfie-ai', // Fallback while user models train
  demoTriggerWord: 'subject',
  apiUrl: 'https://api.replicate.com/v1/predictions',
  styles: {
    editorial: 'luxury editorial magazine style, high-end fashion photography, professional lighting, magazine cover quality',
    business: 'professional business portrait, corporate headshot style, clean background, executive presence',
    lifestyle: 'lifestyle photography, natural lighting, authentic moment, personal brand aesthetic', 
    luxury: 'luxury brand photography, sophisticated aesthetic, premium quality, high-end fashion'
  },
  // Proven prompts for better results
  qualityPrompts: {
    editorial: 'shot on medium format camera, professional studio lighting, magazine quality, sharp focus, detailed',
    business: 'professional headshot, corporate photography, clean composition, confident expression',
    lifestyle: 'natural portrait, lifestyle photography, authentic expression, soft natural lighting',
    luxury: 'luxury portrait, high-end photography, sophisticated styling, premium aesthetic'
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
    
    // 1. Check usage limits BEFORE generation
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
            // Store all generated images as JSON array for user selection
            await storage.updateGeneratedImage(aiImageId, {
              image_urls: JSON.stringify(status.output), // Store all 4 options
              generationStatus: 'completed'
            });
            console.log('Successfully updated completed generation:', aiImageId);
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
    
    // Get trigger word - Sandra gets her special model, others get individual models
    let triggerWord = FLUX_MODEL_CONFIG.demoTriggerWord; // Default fallback
    
    if (userId === FLUX_MODEL_CONFIG.sandraUserId) {
      // Sandra uses her high-quality model
      triggerWord = FLUX_MODEL_CONFIG.sandraTriggerWord;
    } else if (userId) {
      try {
        const userModel = await storage.getUserModelByUserId(userId);
        if (userModel && userModel.trainingStatus === 'completed') {
          triggerWord = userModel.triggerWord; // Use user's unique trigger word
        }
      } catch (error) {
        console.log('Using demo trigger word, user model not available:', error.message);
      }
    }
    
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

    // Determine which model to use
    let modelId = FLUX_MODEL_CONFIG.demoModelId; // Default fallback
    
    if (userId === FLUX_MODEL_CONFIG.sandraUserId) {
      // Sandra gets her high-quality trained model
      modelId = FLUX_MODEL_CONFIG.sandraModelId;
    } else if (userId) {
      try {
        const userModel = await storage.getUserModelByUserId(userId);
        if (userModel && userModel.trainingStatus === 'completed' && userModel.modelUrl) {
          modelId = userModel.modelUrl; // Use user's trained model
        }
      } catch (error) {
        console.log('Using fallback model, user model not available:', error.message);
      }
    }

    // Use Sandra's model with the exact same parameters from her successful test
    const isSandraModel = modelId === FLUX_MODEL_CONFIG.sandraModelId;
    
    let requestBody;
    
    if (isSandraModel) {
      // Sandra's model - use direct model call with exact settings from her test
      requestBody = {
        version: "a31d246656f2cec416d6d895d11cbb0b4b7b8eb2719fac75cf7d73c441b08f36", // Sandra's model version
        input: {
          model: "dev",
          prompt: prompt,
          go_fast: false,
          lora_scale: 1,
          num_outputs: 4,
          aspect_ratio: "16:9", // Same as Sandra's successful test
          output_format: "png", // Same as Sandra's test
          guidance_scale: 2.7, // Same as Sandra's test
          output_quality: 100, // Maximum quality like Sandra's test
          num_inference_steps: 32 // Same as Sandra's test
        }
      };
    } else {
      // Other users' models or fallback
      const isUserModel = modelId.includes('sandrasocial') || modelId.includes('user');
      requestBody = {
        model: isUserModel ? modelId : "black-forest-labs/flux-dev-lora",
        input: {
          prompt: prompt,
          guidance_scale: 3, // Standard setting for other models
          num_inference_steps: 28, 
          num_outputs: 4,
          lora_scale: isUserModel ? 1.0 : undefined,
          aspect_ratio: "4:3",
          output_format: "jpg",
          output_quality: 95,
          go_fast: false,
          megapixels: "1"
        }
      };
    }
    
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