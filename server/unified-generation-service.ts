/**
 * UNIFIED IMAGE GENERATION SERVICE
 * Single source of truth for all image generation in SSELFIE Studio
 * Uses Sandra's proven working parameters from July 17, 2025
 */

import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';
import { GenerationValidator } from './generation-validator';
import { extractImagePromptFromRequest } from './sandra-ai-service';
import { 
  InsertGenerationTracker,
  type User 
} from '@shared/schema';

export interface UnifiedGenerationRequest {
  userId: string;
  prompt: string;
  category?: string;
  subcategory?: string;
}

export interface UnifiedGenerationResponse {
  id: number;
  predictionId: string;
  imageUrls: string[];
  success: boolean;
}

/**
 * SANDRA'S PROVEN WORKING PARAMETERS (July 17, 2025)
 * These exact settings produced beautiful, realistic images
 * DO NOT CHANGE WITHOUT EXPLICIT APPROVAL
 */
const WORKING_PARAMETERS = {
  guidance_scale: 2.82,
  num_inference_steps: 40,
  lora_scale: 1,
  num_outputs: 3,
  aspect_ratio: "3:4",
  output_format: "png",
  output_quality: 95,
  go_fast: false,
  disable_safety_checker: false
} as const;

export class UnifiedGenerationService {
  
  /**
   * Generate images using Sandra's proven working configuration
   * This is the ONLY image generation method for Maya and AI-photoshoot
   */
  static async generateImages(request: UnifiedGenerationRequest): Promise<UnifiedGenerationResponse> {
    const { userId, prompt, category = 'AI Generated' } = request;
    
    console.log(`🚀 UNIFIED GENERATION: Starting for user ${userId}`);
    
    // CRITICAL: Get user model information for validation
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not available or training not completed');
    }
    
    const fullModelVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
    const triggerWord = `user${userId}`;
    console.log(`🔒 VALIDATED: User ${userId} can generate with model: ${fullModelVersion}`);
    
    // Create generation tracker for Maya chat preview (NOT gallery)
    const trackerData: InsertGenerationTracker = {
      userId,
      predictionId: '', // Will be updated after API call
      prompt,
      style: category,
      status: 'processing'
    };
    
    const savedTracker = await storage.saveGenerationTracker(trackerData);
    
    // Prepare final prompt with trigger word
    let finalPrompt = prompt;
    
    // Ensure trigger word is at the beginning
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord} ${finalPrompt}`;
    }
    
    // Add quality foundation for realistic results (Sandra's proven July 17 structure)
    if (!finalPrompt.includes('raw photo')) {
      finalPrompt = `raw photo, visible skin pores, film grain, ${finalPrompt}, professional photography`;
    }
    
    console.log(`🎯 UNIFIED FINAL PROMPT: "${finalPrompt}"`);
    
    // Build request with Sandra's proven working parameters
    const requestBody = {
      version: fullModelVersion,
      input: {
        prompt: finalPrompt,
        ...WORKING_PARAMETERS,
        seed: Math.floor(Math.random() * 1000000)
      }
    };
    
    // Validate request
    const user = await storage.getUser(userId);
    const isPremium = user?.plan === 'sselfie-studio' || user?.role === 'admin';
    ArchitectureValidator.validateGenerationRequest(requestBody, userId, isPremium);
    
    console.log(`🚀 SANDRA'S PROVEN PARAMETERS:`, {
      guidance_scale: requestBody.input.guidance_scale,
      steps: requestBody.input.num_inference_steps,
      lora_scale: requestBody.input.lora_scale,
      model: fullModelVersion,
      trigger: triggerWord
    });
    
    // Call Replicate API with retry logic
    let replicateResponse;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (replicateResponse.ok) {
          break; // Success
        }
        
        // Retry on server errors
        if ((replicateResponse.status === 502 || replicateResponse.status >= 500) && retries < maxRetries) {
          const delaySeconds = (retries + 1) * 3;
          console.log(`⚠️ Retrying in ${delaySeconds}s due to ${replicateResponse.status}`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retries++;
          continue;
        }
        
        throw new Error(`Replicate API error: ${replicateResponse.status}`);
        
      } catch (error) {
        if (retries >= maxRetries) {
          throw error;
        }
        retries++;
      }
    }
    
    const prediction = await replicateResponse.json();
    
    // Update tracker with prediction ID 
    await storage.updateGenerationTracker(savedTracker.id, { 
      predictionId: prediction.id,
      status: 'processing'
    });
    
    console.log(`✅ UNIFIED GENERATION: Started prediction ${prediction.id} for user ${userId}`);
    
    return {
      id: savedTracker.id,
      predictionId: prediction.id,
      imageUrls: [], // Will be populated when prediction completes
      success: true
    };
  }
  
  /**
   * Poll for completion and update Maya chat with preview images
   * Called by background processes to update generation status
   */
  static async checkAndUpdateStatus(trackerId: number, predictionId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to check prediction status: ${response.status}`);
        return;
      }
      
      const prediction = await response.json();
      
      if (prediction.status === 'succeeded') {
        const imageUrls = prediction.output || [];
        
        // Update tracker with completed images for Maya chat preview
        await storage.updateGenerationTracker(trackerId, {
          imageUrls: JSON.stringify(imageUrls),
          status: 'completed'
        });
        
        console.log(`✅ MAYA CHAT PREVIEW: Completed tracker ${trackerId} with ${imageUrls.length} preview images`);
        
        // TODO: Send images to Maya chat interface for user preview with heart buttons
        // Images will be shown in Maya's chat, not added to gallery until user hearts them
        
      } else if (prediction.status === 'failed') {
        await storage.updateGenerationTracker(trackerId, {
          status: 'failed'
        });
        console.error(`❌ MAYA CHAT PREVIEW: Failed tracker ${trackerId}: ${prediction.error}`);
      }
      
    } catch (error) {
      console.error(`Error checking prediction status for tracker ${trackerId}:`, error);
    }
  }
}

/**
 * MIGRATION HELPER: Replace old generation service calls
 * Use this to update existing code to use the unified service
 */
export const MigrationHelper = {
  
  // For Maya AI generations
  async generateForMaya(userId: string, prompt: string): Promise<UnifiedGenerationResponse> {
    return UnifiedGenerationService.generateImages({
      userId,
      prompt,
      category: 'Maya AI'
    });
  },
  
  // For AI Photoshoot generations  
  async generateForPhotoshoot(userId: string, prompt: string, subcategory?: string): Promise<UnifiedGenerationResponse> {
    return UnifiedGenerationService.generateImages({
      userId,
      prompt,
      category: 'AI Photoshoot',
      subcategory
    });
  }
};