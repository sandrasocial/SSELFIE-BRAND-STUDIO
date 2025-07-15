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
  
  // CRITICAL: Get user's trained model data first  
  const userModel = await storage.getUserModel(userId);
  if (!userModel || userModel.trainingStatus !== 'completed') {
    throw new Error('User model not ready for generation. Training must be completed first.');
  }
  
  try {
    console.log(`Starting image generation for user ${userId}`);
    console.log(`Model version: ${modelVersion}`);
    console.log(`Trigger word: ${triggerWord}`);
    console.log(`Custom prompt: ${customPrompt}`);

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
    console.log(`Created AI image record with ID: ${savedImage.id}`);

    // CORRECT APPROACH: Always use black-forest-labs/flux-dev-lora with user's LoRA weights
    const fluxModelVersion = modelVersion || 'black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5';
    
    // 🚨 CRITICAL SECURITY FIX: Use user's unique replicate_model_id for LoRA weights
    const userLoRAWeights = `sandrasocial/${userModel.replicateModelId}`;
    console.log(`🔒 SECURITY FIX: Using user's unique LoRA model: ${userLoRAWeights}`);
    
    // Ensure the prompt starts with the user's trigger word for maximum likeness
    let finalPrompt = customPrompt;
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord} ${customPrompt}`;
    } else {
      // If trigger word exists but not at start, move it to beginning
      finalPrompt = finalPrompt.replace(triggerWord, '').trim();
      finalPrompt = `${triggerWord} ${finalPrompt}`;
    }
    
    // Maya AI should provide complete authentic prompts - minimal enhancement only
    const naturalTextureSpecs = ", raw photo, natural skin glow, visible texture, film grain, unretouched confidence, editorial cover portrait";
    
    // CRITICAL HAIR ENHANCEMENT: Always ensure hair has volume and natural movement
    const hairEnhancementSpecs = ", hair with natural volume and movement, soft textured hair styling, hair flowing naturally, hair never flat or lifeless";
    
    // Only add natural texture if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('raw photo')) {
      finalPrompt = `${finalPrompt}${naturalTextureSpecs}`;
    }
    
    // Always add hair enhancement specifications for better hair quality
    if (!finalPrompt.toLowerCase().includes('hair with') && !finalPrompt.toLowerCase().includes('voluminous hair')) {
      finalPrompt = `${finalPrompt}${hairEnhancementSpecs}`;
    }

    // Build input with OPTIMIZED FLUX LoRA SETTINGS for maximum quality and likeness
    const input: any = {
      prompt: finalPrompt,        // Maya's authentic prompt with trigger word
      guidance: 2.8,              // OPTIMIZED: Reduced from 3.0 to 2.8 for more natural results
      lora_weights: userLoRAWeights, // 🔒 CRITICAL: User's unique trained LoRA weights
      lora_scale: 1.0,           // Standard LoRA scale for personal LoRAs (0.9-1.0 optimal)
      num_inference_steps: 40,    // OPTIMIZED: Increased from 35 to 40 for higher quality
      num_outputs: 3,            // Generate 3 focused images
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      output_quality: 90,         // Higher quality for professional results
      megapixels: "1",           // Approximate megapixels
      go_fast: false,             // Quality over speed
      disable_safety_checker: false
    };
    
    console.log(`🔒 SECURITY FIX APPLIED:`);
    console.log(`Using FLUX model: black-forest-labs/flux-dev-lora`);
    console.log(`Using user's unique LoRA: ${userLoRAWeights}`);
    console.log(`User's trigger word: "${triggerWord}"`);
    console.log(`Model training status: ${userModel.trainingStatus}`);
    console.log(`Final prompt: ${finalPrompt}`);
    console.log('⚙️ OPTIMIZED FLUX LoRA SETTINGS (Pre-Launch 2025):', JSON.stringify({ guidance: input.guidance, lora_scale: input.lora_scale, num_inference_steps: input.num_inference_steps, output_quality: input.output_quality }, null, 2));
    
    // Start Replicate generation with retry logic for 502 errors
    let replicateResponse;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        console.log(`🔄 Attempting Replicate API call... (attempt ${retries + 1}/${maxRetries + 1})`);
        
        replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: fluxModelVersion, // Keep using version parameter as Replicate requires it
            input
          }),
        });

        if (replicateResponse.ok) {
          console.log('✅ Replicate API call successful');
          break; // Success, exit retry loop
        }

        // If 502 error or other server errors, retry after delay
        if ((replicateResponse.status === 502 || replicateResponse.status >= 500) && retries < maxRetries) {
          const delaySeconds = (retries + 1) * 3;
          console.log(`⚠️ Replicate API ${replicateResponse.status} error, retrying in ${delaySeconds}s... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retries++;
          continue;
        }

        // For other errors or max retries reached, throw error
        const errorData = await replicateResponse.text();
        console.error('❌ Replicate API error:', errorData);
        throw new Error(`Replicate API error: ${replicateResponse.status} ${errorData}`);
        
      } catch (error) {
        // Check if this is a fetch error (network issue)
        if (error.message.includes('fetch')) {
          if (retries >= maxRetries) {
            console.error('❌ Max retries reached for network errors');
            throw error;
          }
          const delaySeconds = (retries + 1) * 2;
          console.log(`⚠️ Network error, retrying in ${delaySeconds}s... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          retries++;
          continue;
        }
        
        // If it's not a network error, re-throw immediately
        throw error;
      }
    }

    const prediction = await replicateResponse.json();
    console.log(`Replicate prediction started with ID: ${prediction.id}`);

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
    console.error('Image generation error:', error);
    throw error;
  }
}

async function pollForCompletion(imageId: number, predictionId: string): Promise<void> {
  const maxAttempts = 30;
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;
      console.log(`Polling attempt ${attempts} for prediction ${predictionId}`);

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Replicate status check failed: ${response.status}`);
      }

      const prediction = await response.json();
      console.log(`Prediction status: ${prediction.status}`);

      if (prediction.status === 'succeeded') {
        console.log('Generation completed successfully');
        // Store all image URLs as JSON array (Maya expects this format)
        const outputUrls = prediction.output || [];
        console.log(`Generated ${outputUrls.length} images:`, outputUrls);
        
        // Store as JSON string for Maya to parse correctly
        const imageUrl = outputUrls.length > 0 ? JSON.stringify(outputUrls) : 'completed';
        
        await storage.updateAIImage(imageId, {
          imageUrl: imageUrl,
          generationStatus: 'completed'
        });
        return;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        console.log(`Generation failed with status: ${prediction.status}`);
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
        console.log('Max polling attempts reached');
        await storage.updateAIImage(imageId, {
          imageUrl: 'timeout',
          generationStatus: 'failed'
        });
      }

    } catch (error) {
      console.error(`Polling error for prediction ${predictionId}:`, error);
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