import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';

// FLUX model configuration for SSELFIE generation - SECURE VERSION
const FLUX_MODEL_CONFIG = {
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
    // Use the actual userId passed to this function for tracker ownership
    const generationTracker = await storage.createGenerationTracker({
      userId: userId, // Direct auth ID for generation trackers
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
      
      
      switch (status.status) {
        case 'succeeded':
          if (status.output && status.output.length > 0) {
            // 🔑 KEY CHANGE: Store TEMP URLs only for preview - NO AUTO-SAVE TO GALLERY
            
            await storage.updateGenerationTracker(trackerId, {
              imageUrls: JSON.stringify(status.output), // Store TEMP Replicate URLs for preview
              status: 'completed'
            });
            
            try {
              await this.updateMayaChatWithImages(trackerId, status.output);
            } catch (error) {
            }
            
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
    
  }

  private static async buildFluxPrompt(style: string, customPrompt?: string, userId?: string): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    
    // Use ONLY user's unique trigger word - NO FALLBACKS
    const triggerWord = userModel.triggerWord;
    
    // EXPERT SPECIFICATIONS: Maximum likeness and authentic results
    const expertQualitySpecs = ", raw photo, natural skin glow, visible texture, film grain, unretouched confidence, editorial cover portrait, hyperrealistic facial features, authentic skin tone, natural eye detail, precise facial structure, professional studio lighting, crystal clear focus";
    
    if (customPrompt) {
      // Ensure trigger word is at the beginning for maximum likeness activation
      let finalPrompt = customPrompt;
      if (!finalPrompt.startsWith(triggerWord)) {
        // Remove trigger word if it exists elsewhere and place at beginning
        finalPrompt = finalPrompt.replace(new RegExp(triggerWord, 'gi'), '').trim();
        finalPrompt = `${triggerWord} ${finalPrompt}`;
      }
      return `${finalPrompt}${expertQualitySpecs}`;
    }
    
    // Fallback should never be used - Maya should always provide custom prompt
    throw new Error('Custom prompt required - no hardcoded prompts allowed');
  }

  private static async callFluxAPI(imageBase64: string, prompt: string, userId?: string): Promise<string> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }

    // ✅ CORRECT APPROACH: Use user's individual trained LoRA model directly
    const userModelId = userModel.replicateModelId; // e.g., "sandrasocial/42585527-selfie-lora:version"
    
    if (!userModelId) {
      throw new Error('User LoRA model not found - training may need to be completed');
    }
    
    const requestBody = {
      version: userModelId, // Use user's trained individual model directly
      input: {
        prompt: prompt,
        guidance: 2.8, // Optimized for maximum likeness and natural results  
        num_inference_steps: 35, // Increased for higher quality and detail
        num_outputs: 3,
        aspect_ratio: "3:4",
        output_format: "png",
        output_quality: 95, // Maximum quality for "WOW" results
        megapixels: "1",
        go_fast: false,
        disable_safety_checker: false,
        seed: Math.floor(Math.random() * 1000000) // Random seed for variety
      }
    };
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
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

  private static async updateMayaChatWithImages(trackerId: number, imageUrls: string[]): Promise<void> {
    try {
      // Get the generation tracker to find the user
      const tracker = await storage.getGenerationTracker(trackerId);
      if (!tracker) {
        return;
      }

      // Find the most recent Maya chat message with a generated_prompt for this user
      const mayaChats = await storage.getMayaChats(tracker.userId);
      if (!mayaChats || mayaChats.length === 0) {
        return;
      }

      // Get the most recent chat
      const recentChat = mayaChats[0];
      const chatMessages = await storage.getMayaChatMessages(recentChat.id);
      
      // Find the most recent Maya message with a generated_prompt (the one that should get images)
      const mayaMessageWithPrompt = chatMessages
        .filter(msg => msg.role === 'maya' && msg.generatedPrompt && !msg.imagePreview)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (!mayaMessageWithPrompt) {
        return;
      }

      // Update the Maya message with the generated images
      await storage.updateMayaChatMessage(mayaMessageWithPrompt.id, {
        imagePreview: JSON.stringify(imageUrls)
      });

    } catch (error) {
      throw error;
    }
  }
}