import { storage } from './storage';
import type { InsertAIImage } from '@shared/schema-simplified';
import { ArchitectureValidator } from './architecture-validator';

export interface GenerateImagesRequest {
  userId: string;
  category: string;
  subcategory: string;
  triggerWord: string;
  modelVersion: string;
  customPrompt: string;
}

export interface GenerateImagesResponse {
  id: number;
  image_urls: string;
  success: boolean;
}

export async function generateImages(request: GenerateImagesRequest): Promise<GenerateImagesResponse> {
  const { userId, category, subcategory, triggerWord, modelVersion, customPrompt } = request;
  
  const userModel = await storage.getUserModel(userId);
  if (!userModel || userModel.trainingStatus !== 'completed') {
    throw new Error('User model not ready for generation. Training must be completed first.');
  }
  
  try {


    // Create initial AI image record
    const aiImageData: InsertAIImage = {
      userId,
      imageUrl: 'processing', // Required field, will be updated when complete
      prompt: customPrompt,
      style: category,
      generationStatus: 'processing',
      predictionId: '' // Will be updated after Replicate call
    };

    const savedImage = await storage.saveAIImage(aiImageData);


    // ✅ CORRECT APPROACH: Use black forest labs FLUX model with user's LoRA weights
    const userModelName = userModel.replicateModelId; // e.g., "sandrasocial/42585527-selfie-lora"
    
    if (!userModelName) {
      throw new Error('User LoRA model not found - training may need to be completed');
    }
    
    // Ensure the prompt starts with the user's trigger word for maximum likeness
    let finalPrompt = customPrompt;
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord} ${customPrompt}`;
    } else {
      // If trigger word exists but not at start, move it to beginning
      finalPrompt = finalPrompt.replace(triggerWord, '').trim();
      finalPrompt = `${triggerWord} ${finalPrompt}`;
    }
    
    // PROVEN OPTIMAL SPECIFICATIONS: Natural but confident - realistic skin with subtle enhancement
    const expertQualitySpecs = ", raw photograph, subtle skin texture (1.6), natural skin detail, soft film grain (Kodak Ektar:1.3), natural skin with gentle smoothing, medium-format film aesthetic (1.5), realistic hair with volume, natural hair texture, never flat hair, hyperrealistic facial features, authentic skin tone, natural healthy glow, subtle skin refinement, professional photography";
    
    const premiumHairSpecs = ", natural hair with volume and movement, realistic hair texture, voluminous healthy hair, never flat or lifeless hair, natural hair flow";
    
    // Only add expert quality specs if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('raw photo')) {
      finalPrompt = `${finalPrompt}${expertQualitySpecs}`;
    }
    
    // Always add premium hair specifications for better hair quality
    if (!finalPrompt.toLowerCase().includes('hair with') && !finalPrompt.toLowerCase().includes('voluminous hair')) {
      finalPrompt = `${finalPrompt}${premiumHairSpecs}`;
    }

    // 🔒 IMMUTABLE CORE ARCHITECTURE - USES USER'S INDIVIDUAL TRAINED MODEL DIRECTLY
    // Each user has their own trained FLUX model version for complete isolation
    // This ensures zero cross-contamination between users
    
    // Get user's trained model version
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || !userModel.replicateVersionId) {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    
    const userTrainedVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;

    // 🔒 IMMUTABLE FLUX GENERATION PARAMETERS - DO NOT MODIFY
    const input: any = {
      prompt: finalPrompt,
      guidance: 2.8, // 🔒 LOCKED: Optimized guidance for strong prompt adherence
      num_inference_steps: 35, // 🔒 LOCKED: Quality steps for detailed output
      num_outputs: 3,
      aspect_ratio: "3:4",
      output_format: "png",
      output_quality: 95, // 🔒 LOCKED: Maximum quality for "WOW" results
      megapixels: "1",
      go_fast: false,
      disable_safety_checker: false,
      lora_scale: 1.2, // 🔒 CRITICAL: Strong LoRA influence for maximum likeness
      seed: Math.floor(Math.random() * 1000000) // Random seed for variety
    };

    // 🔒 ARCHITECTURE VALIDATION - Prevent any deviations from correct approach
    const requestBody = {
      version: userTrainedVersion, // 🔒 CRITICAL: User's individual trained model version ONLY
      input
    };
    ArchitectureValidator.validateGenerationRequest(requestBody, userId);
    ArchitectureValidator.logArchitectureCompliance(userId, 'AI Photoshoot Generation');
    

    
    // Start Replicate generation with retry logic for 502 errors
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
          break; // Success, exit retry loop
        }

        // If 502 error or other server errors, retry after delay
        if ((replicateResponse.status === 502 || replicateResponse.status >= 500) && retries < maxRetries) {
          const delaySeconds = (retries + 1) * 3;
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retries++;
          continue;
        }

        // For other errors or max retries reached, throw error
        const errorData = await replicateResponse.text();
        throw new Error(`Replicate API error: ${replicateResponse.status} ${errorData}`);
        
      } catch (error) {
        // Check if this is a fetch error (network issue)
        if (error.message.includes('fetch')) {
          if (retries >= maxRetries) {
            throw error;
          }
          const delaySeconds = (retries + 1) * 2;
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retries++;
          continue;
        }
        
        // If it's not a network error, re-throw immediately
        throw error;
      }
    }

    const prediction = await replicateResponse.json();

    // Update image with prediction ID  
    await storage.updateAIImage(savedImage.id, {
      predictionId: prediction.id,
      generationStatus: 'processing'
    });

    // Start polling for completion in background
    pollForCompletion(savedImage.id, prediction.id);

    // Return immediate response with single image format
    return {
      id: savedImage.id,
      image_urls: JSON.stringify([savedImage.imageUrl]), // Maya expects JSON string format
      success: true
    };

  } catch (error) {
    throw error;
  }
}

async function pollForCompletion(imageId: number, predictionId: string): Promise<void> {
  const maxAttempts = 30;
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Replicate status check failed: ${response.status}`);
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        // Store all image URLs as JSON array (Maya expects this format)
        const outputUrls = prediction.output || [];
        
        // Store as JSON string for Maya to parse correctly
        const imageUrl = outputUrls.length > 0 ? JSON.stringify(outputUrls) : 'completed';
        
        await storage.updateAIImage(imageId, {
          imageUrl: imageUrl,
          generationStatus: 'completed'
        });
        return;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        await storage.updateAIImage(imageId, {
          imageUrl: 'failed',
          generationStatus: 'failed'
        });
        return;
      }

      // Continue polling if still processing
      if (attempts < maxAttempts) {
        setTimeout(poll, 3000); // Poll every 3 seconds
      } else {
        await storage.updateAIImage(imageId, {
          imageUrl: 'timeout',
          generationStatus: 'failed'
        });
      }

    } catch (error) {
      if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        await storage.updateAIImage(imageId, {
          imageUrl: 'error',
          generationStatus: 'failed'
        });
      }
    }
  };

  // Start polling
  setTimeout(poll, 2000); // Initial delay of 2 seconds
}