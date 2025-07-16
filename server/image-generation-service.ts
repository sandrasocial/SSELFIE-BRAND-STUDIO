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


    // 🔧 CORRECT ARCHITECTURE: Use black-forest-labs/flux-dev-lora as the base model
    // User's individual trained model is a FLUX LoRA that works with this base model
    const baseFluxModelVersion = "a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5";
    const userLoraWeights = userModel.replicateVersionId; // This is the user's trained LoRA
    
    if (!userLoraWeights) {
      throw new Error('User LoRA weights not found - training may need to be redone');
    }
    
    console.log(`🔧 ARCHITECTURE FIX - User: ${userId}, Base FLUX Version: ${baseFluxModelVersion}, User LoRA: ${userLoraWeights}`);
    console.log(`🔍 CORRECT APPROACH - Using base FLUX + individual user LoRA weights`);
    
    // 🎯 CRITICAL: Trigger word MUST be at the very beginning for maximum likeness
    let finalPrompt = customPrompt;
    
    // Remove any existing trigger word and force it to the beginning
    finalPrompt = finalPrompt.replace(new RegExp(triggerWord, 'gi'), '').trim();
    finalPrompt = `${triggerWord} ${finalPrompt}`;
    
    console.log(`🎯 LIKENESS CHECK - User: ${userId}, Trigger: "${triggerWord}", Final prompt starts with: "${finalPrompt.substring(0, 50)}..."`);
    
    // Maya AI should provide complete authentic prompts - minimal enhancement only
    const naturalTextureSpecs = ", raw photo, natural skin glow, visible texture, film grain, unretouched confidence, editorial cover portrait";
    
    const hairEnhancementSpecs = ", hair with natural volume and movement, soft textured hair styling, hair flowing naturally, hair never flat or lifeless";
    
    // Only add natural texture if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('raw photo')) {
      finalPrompt = `${finalPrompt}${naturalTextureSpecs}`;
    }
    
    // Always add hair enhancement specifications for better hair quality
    if (!finalPrompt.toLowerCase().includes('hair with') && !finalPrompt.toLowerCase().includes('voluminous hair')) {
      finalPrompt = `${finalPrompt}${hairEnhancementSpecs}`;
    }

    // Build input for base FLUX model + user's individual LoRA - CORRECT ARCHITECTURE
    const input: any = {
      prompt: finalPrompt,
      guidance: 2.89,             // 🔧 EXACT: Yesterday's confirmed perfect setting
      num_inference_steps: 35,    // 🔧 EXACT: Yesterday's confirmed perfect setting
      num_outputs: 3,
      aspect_ratio: "3:4",
      output_format: "png",
      output_quality: 100,        // 🔧 EXACT: Yesterday's confirmed perfect setting
      megapixels: "1",
      go_fast: false,
      disable_safety_checker: false,
      lora_weights: userLoraWeights,  // 🔧 CRITICAL: User's individual trained LoRA
      lora_scale: 1,              // 🔧 EXACT: Yesterday's confirmed perfect setting
      prompt_strength: 1,         // 🔧 EXACT: Yesterday's confirmed perfect setting
      extra_lora_scale: 1         // 🔧 EXACT: Yesterday's confirmed perfect setting
    };
    
    console.log('🔍 DEBUG INPUT:', JSON.stringify(input, null, 2));
    

    
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
            version: baseFluxModelVersion, // Use base FLUX model version, not user's trained model directly
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