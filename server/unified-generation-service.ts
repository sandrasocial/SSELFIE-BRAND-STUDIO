/**
 * UNIFIED IMAGE GENERATION SERVICE
 * Single source of truth for all image generation in SSELFIE Studio
 * Uses Sandra's proven working parameters from July 17, 2025
 */

import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';
import { ModelValidationService } from './model-validation-service';
// import { extractImagePromptFromRequest } from './sandra-ai-service'; // Not used in this service
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
 * SANDRA'S OPTIMIZED PARAMETERS FOR INDIVIDUAL USER MODELS (Fixed January 30, 2025)
 * Using trained individual models directly without LoRA parameters
 * Optimized for facial similarity using the user's personal trained model
 */

export class UnifiedGenerationService {
  
  /**
   * Generate images using Sandra's proven working configuration
   * This is the ONLY image generation method for Maya and AI-photoshoot
   */
  static async generateImages(request: UnifiedGenerationRequest): Promise<UnifiedGenerationResponse> {
    const { userId, prompt, category = 'AI Generated' } = request;
    
    console.log(`🚀 UNIFIED GENERATION: Starting for user ${userId}`);
    
    // CRITICAL: Use new validation service to check and correct model data
    const modelValidation = await ModelValidationService.enforceUserModelRequirements(userId);
    const { modelId, versionId, triggerWord } = modelValidation;
    
    console.log(`🔒 VALIDATED: User ${userId} can generate with model: ${modelId}:${versionId}, trigger: ${triggerWord}`);
    
    // Create generation tracker for Maya chat preview (NOT gallery)
    const trackerData: InsertGenerationTracker = {
      userId,
      predictionId: '', // Will be updated after API call
      prompt,
      style: category,
      status: 'processing'
    };
    
    const savedTracker = await storage.saveGenerationTracker(trackerData);
    
    // UNIVERSAL PROMPT STRUCTURE FOR ALL USERS
    // Format: raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], [POETIC DESCRIPTION], [2025 FASHION], [NATURAL LIGHTING], [AUTHENTIC EMOTION]
    
    // Remove trigger word if already present anywhere in prompt
    let cleanPrompt = prompt;
    if (cleanPrompt.includes(triggerWord)) {
      cleanPrompt = cleanPrompt.replace(new RegExp(triggerWord, 'g'), '').trim();
    }
    
    // Remove any existing technical photography terms to avoid duplication
    cleanPrompt = cleanPrompt
      .replace(/raw photo,?\s*/gi, '')
      .replace(/visible skin pores,?\s*/gi, '')
      .replace(/film grain,?\s*/gi, '')
      .replace(/unretouched natural skin texture,?\s*/gi, '')
      .replace(/subsurface scattering,?\s*/gi, '')
      .replace(/photographed on film,?\s*/gi, '')
      .replace(/professional photography,?\s*/gi, '')
      .trim();
    
    // UNIVERSAL MAYA PROMPT STRUCTURE FOR ALL USERS WITH ANATOMY FIXES
    // Add anatomy-specific terms to prevent deformities
    const anatomyTerms = "detailed hands, perfect fingers, natural hand positioning, well-formed feet, accurate anatomy";
    const finalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${triggerWord}, ${cleanPrompt}, ${anatomyTerms}`;
    
    console.log(`UNIFIED FINAL PROMPT: "${finalPrompt}"`);
    
    // UNIVERSAL INDIVIDUAL MODEL ARCHITECTURE: All users use their validated trained models
    const modelVersion = `${modelId}:${versionId}`;
    console.log(`🔒 VERSION VALIDATION: Model: ${modelId}, Version: ${versionId}, Combined: ${modelVersion}`);
    
    const requestBody = {
      version: modelVersion,
      input: {
        prompt: finalPrompt,
        lora_scale: 0.9, // Keep for facial accuracy
        guidance_scale: 5.0, // ANATOMY FIX: Increased from 3.0 to 5.0 for better anatomy adherence
        num_inference_steps: 50, // ANATOMY FIX: Increased from 40 to 50 for detailed extremities
        num_outputs: 2,
        aspect_ratio: "3:4",
        output_format: "png",
        output_quality: 95,
        go_fast: false,
        disable_safety_checker: false,
        megapixels: "1",
        seed: Math.floor(Math.random() * 1000000)
      }
    };
    
    // Validate request
    const user = await storage.getUser(userId);
    const isPremium = user?.plan === 'sselfie-studio' || user?.role === 'admin';
    ArchitectureValidator.validateGenerationRequest(requestBody, userId, isPremium);
    
    console.log(`🚀 GENERATION REQUEST VERIFIED:`, {
      userId: userId,
      model: modelId,
      versionId: versionId,
      combined: modelVersion,
      trigger: triggerWord,
      lora_scale: requestBody.input.lora_scale,
      guidance_scale: requestBody.input.guidance_scale,
      steps: requestBody.input.num_inference_steps
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
    
    const prediction = await replicateResponse!.json();
    
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
        const tempImageUrls = prediction.output || [];
        
        if (tempImageUrls.length > 0) {
          // Get tracker to access userId
          const tracker = await storage.getGenerationTracker(trackerId);
          if (!tracker) {
            console.error(`❌ Tracker ${trackerId} not found for S3 migration`);
            return;
          }
          
          // CRITICAL: Migrate temp URLs to permanent S3 storage immediately
          const { ImageStorageService } = await import('./image-storage-service');
          const permanentUrls = [];
          
          console.log(`🔄 S3 MIGRATION: Converting ${tempImageUrls.length} temp URLs to permanent storage for user ${tracker.userId}`);
          
          for (let i = 0; i < tempImageUrls.length; i++) {
            const tempUrl = tempImageUrls[i];
            try {
              const imageId = `tracker_${trackerId}_img_${i}`;
              const permanentUrl = await ImageStorageService.ensurePermanentStorage(tempUrl, tracker.userId, imageId);
              permanentUrls.push(permanentUrl);
              console.log(`✅ S3 MIGRATION SUCCESS: ${tempUrl.substring(0, 50)}... → ${permanentUrl.substring(0, 50)}...`);
            } catch (error) {
              console.error(`❌ S3 MIGRATION FAILED for ${tempUrl}:`, error);
              // Keep temp URL as fallback 
              permanentUrls.push(tempUrl);
            }
          }
          
          // Update tracker with PERMANENT URLs for Maya chat preview
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify(permanentUrls),
            status: 'completed'
          });
          
          console.log(`✅ MAYA CHAT PREVIEW: Completed tracker ${trackerId} with ${permanentUrls.length} PERMANENT preview images`);
        } else {
          // No images generated
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify([]),
            status: 'completed'
          });
        }
        
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