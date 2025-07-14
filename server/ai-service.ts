import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';

// FLUX model configuration for SSELFIE generation - SECURE VERSION
const FLUX_MODEL_CONFIG = {
  // ALL FALLBACK MODELS PERMANENTLY REMOVED FOR PRODUCTION SECURITY
  // Each user must have their own completed trained model
  apiUrl: 'https://api.replicate.com/v1/predictions'
  // ALL HARDCODED PROMPTS REMOVED - Maya AI generates authentic prompts only
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
  static async generateSSELFIE(request: ImageGenerationRequest): Promise<{ trackerId: number; predictionId: string; usageStatus: any }> {
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

    // Create temporary generation tracking record (NOT in ai_images gallery table)
    const generationTracker = await storage.createGenerationTracker({
      userId,
      predictionId: '', // Will be updated after API call
      prompt: prompt || 'Custom Maya AI prompt generation',
      style,
      status: 'pending',
      imageUrls: null // Will store temp URLs for preview only
    });

    try {
      // Call FLUX model API
      const fluxPrompt = await this.buildFluxPrompt(style, prompt, userId);
      const predictionId = await this.callFluxAPI(imageBase64, fluxPrompt, userId);
      
      // Update tracker with prediction ID
      await storage.updateGenerationTracker(generationTracker.id, { 
        predictionId,
        status: 'processing'
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
        generationTrackerId: generationTracker.id
      });

      // Get updated usage status for frontend
      const updatedUsage = await UsageService.checkUsageLimit(userId);
      
      return {
        trackerId: generationTracker.id,
        predictionId,
        usageStatus: updatedUsage
      };
    } catch (error) {
      console.error('FLUX API call failed:', error);
      // Update generation tracker with error status
      await storage.updateGenerationTracker(generationTracker.id, {
        status: 'failed',
        imageUrls: JSON.stringify([`Error: ${error.message}`])
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

  static async updateImageStatus(trackerId: number, predictionId: string): Promise<void> {
    try {
      const status = await this.checkGenerationStatus(predictionId);
      
      console.log('🔄 Updating generation tracker status:', { trackerId, predictionId, status: status.status, outputCount: status.output?.length });
      
      switch (status.status) {
        case 'succeeded':
          if (status.output && status.output.length > 0) {
            // 🔑 KEY CHANGE: Store TEMP URLs only for preview - NO AUTO-SAVE TO GALLERY
            console.log('✅ Generation complete - storing temp URLs for preview only (NOT auto-saving to gallery)');
            
            await storage.updateGenerationTracker(trackerId, {
              imageUrls: JSON.stringify(status.output), // Store TEMP Replicate URLs for preview
              status: 'completed'
            });
            console.log('📋 Generation tracker updated with temp URLs for user selection:', trackerId);
          }
          break;
          
        case 'failed':
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify([`Generation failed: ${status.error || 'Unknown error'}`]),
            status: 'failed'
          });
          break;
          
        case 'starting':
        case 'processing':
          await storage.updateGenerationTracker(trackerId, {
            status: 'processing'
          });
          break;
          
        case 'canceled':
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify(['Generation was canceled']),
            status: 'canceled'
          });
          break;
      }
    } catch (error) {
      console.error('Error updating generation tracker status:', error);
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
    
    // MANDATORY: Natural texture specifications for authentic results
    const naturalTextureSpecs = ", raw photo, natural skin glow, visible texture, film grain, unretouched confidence, editorial cover portrait";
    
    if (customPrompt) {
      // Custom prompt from Maya AI should already include trigger word and be authentic
      return `${triggerWord} ${customPrompt}${naturalTextureSpecs}`;
    }
    
    // Fallback should never be used - Maya should always provide custom prompt
    throw new Error('Custom prompt required - no hardcoded prompts allowed');
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
        guidance: 3.0,              // OPTIMAL: Best guidance for FLUX LoRA (2.5-3.0 range)
        lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
        lora_scale: 1.0,           // OPTIMAL: Standard scale for personal LoRAs (0.9-1.0)
        num_inference_steps: 35,    // OPTIMAL: Minimum 35 steps for high quality
        num_outputs: 3,            // Generate 3 focused images
        aspect_ratio: "3:4",        // Portrait ratio better for selfies
        output_format: "png",       // PNG for highest quality
        output_quality: 90,         // HIGHER: Professional quality output
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

  static async pollGenerationStatus(trackerId: number, predictionId: string, maxAttempts: number = 30): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.checkGenerationStatus(predictionId);
        
        if (status.status === 'succeeded' || status.status === 'failed' || status.status === 'canceled') {
          await this.updateImageStatus(trackerId, predictionId);
          return;
        }
        
        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error(`Status check attempt ${attempts} failed:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          await storage.updateGenerationTracker(trackerId, {
            status: 'timeout',
            imageUrls: JSON.stringify(['Generation timeout - max attempts reached'])
          });
          throw new Error('Generation polling timeout');
        }
      }
    }
  }
}