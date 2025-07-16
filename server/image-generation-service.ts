import { storage } from './storage';
import type { InsertAIImage } from '@shared/schema-simplified';

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
    
    // EXPERT ENHANCEMENT: Maximum likeness and professional quality
    const expertQualitySpecs = ", raw photo, natural skin glow, visible texture, film grain, unretouched confidence, editorial cover portrait, hyperrealistic facial features, authentic skin tone, natural eye detail, precise facial structure, professional studio lighting, crystal clear focus";
    
    const premiumHairSpecs = ", hair with natural volume and movement, soft textured hair styling, hair flowing naturally, voluminous healthy hair, never flat or lifeless hair, professional hair styling";
    
    // Only add expert quality specs if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('raw photo')) {
      finalPrompt = `${finalPrompt}${expertQualitySpecs}`;
    }
    
    // Always add premium hair specifications for better hair quality
    if (!finalPrompt.toLowerCase().includes('hair with') && !finalPrompt.toLowerCase().includes('voluminous hair')) {
      finalPrompt = `${finalPrompt}${premiumHairSpecs}`;
    }

    // ✅ CORRECT APPROACH: Use black-forest-labs/flux-dev-lora base model with user's LoRA weights
    const userLoraWeights = userModelName; // e.g., "sandrasocial/42585527-selfie-lora:version"

    // Build input for black-forest-labs/flux-dev-lora with user's LoRA weights - EXPERT SETTINGS
    const input: any = {
      prompt: finalPrompt,
      lora_weights: userLoraWeights, // Load user's individual LoRA weights
      lora_scale: 1.0, // Maximum LoRA influence for strongest likeness
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
    };
    

    
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
          body: JSON.stringify({
            version: "black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5",
            input
          }),
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