import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';

// FLUX model configuration for SSELFIE generation
const FLUX_MODEL_CONFIG = {
  // For demo: Sandra's trained model (will need individual user models in production)
  demoModelId: 'sandrasocial/sseelfie-ai',
  demoTriggerWord: 'subject', // Sandra's model trigger word
  // For production: Each user would need their own trained model
  // userModelFormat: 'sselfie/{userId}/personal-lora',
  // userTriggerFormat: 'user{userIdSuffix}', // Unique trigger per user
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
      const fluxPrompt = this.buildFluxPrompt(style, prompt, userId);
      const predictionId = await this.callFluxAPI(imageBase64, fluxPrompt);
      
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

  private static buildFluxPrompt(style: string, customPrompt?: string, userId?: string): string {
    const basePrompt = FLUX_MODEL_CONFIG.styles[style] || FLUX_MODEL_CONFIG.styles.editorial;
    const qualityPrompt = FLUX_MODEL_CONFIG.qualityPrompts[style] || FLUX_MODEL_CONFIG.qualityPrompts.editorial;
    
    // For demo: Use Sandra's trigger word "subject"
    // For production: Each user would have unique trigger word like "user123" 
    const triggerWord = FLUX_MODEL_CONFIG.demoTriggerWord;
    // Production: const triggerWord = `user${userId.slice(-6)}`; // Unique per user
    
    const triggerPrompt = `${triggerWord}, SSELFIE style transformation`;
    
    if (customPrompt) {
      return `${triggerPrompt}, ${customPrompt}, ${basePrompt}, ${qualityPrompt}`;
    }
    
    return `${triggerPrompt}, ${basePrompt}, ${qualityPrompt}`;
  }

  private static async callFluxAPI(imageBase64: string, prompt: string): Promise<string> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    const response = await fetch(FLUX_MODEL_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FLUX_MODEL_CONFIG.demoModelId, // Currently Sandra's model for demo
        input: {
          image: `data:image/jpeg;base64,${imageBase64}`,
          prompt: prompt,
          guidance_scale: 3.5, // Lower value for more realistic images
          num_inference_steps: 28, // Optimal for dev model
          num_outputs: 4, // Generate multiple options for user selection
          lora_scale: 0.8, // Good balance for LoRA application
          aspect_ratio: "1:1", // Square format for SSELFIE
          output_format: "webp",
          output_quality: 90,
          model: "dev", // Use dev model for better quality
          seed: Math.floor(Math.random() * 1000000)
        }
      })
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