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

    // Get the correct model version from database or use default FLUX LoRA
    const fluxModelVersion = modelVersion || 'black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5';
    
    // Ensure the prompt includes the user's trigger word
    let finalPrompt = customPrompt;
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord}, ${customPrompt}`;
    }
    
    // Build input with optimal FLUX LoRA settings for amazing photos
    const input: any = {
      prompt: finalPrompt,
      hf_lora: `sandrasocial/${userId}-selfie-lora`, // User's trained LoRA weights
      guidance_scale: 3.5,        // Optimal for FLUX LoRA (3-4 range)
      num_inference_steps: 32,    // Higher steps for better quality
      output_quality: 100,        // Maximum quality
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      go_fast: false,             // Quality over speed
      megapixels: "1",           // Good balance of quality/speed
      num_outputs: 3,            // Generate 3 focused images
      lora_scale: 1.0,           // Full LoRA application
      disable_safety_checker: false
    };
    
    console.log(`Using FLUX model version: ${fluxModelVersion}`);
    console.log(`Using trained LoRA: sandrasocial/${userId}-selfie-lora`);
    console.log(`Final prompt with trigger word: ${finalPrompt}`);
    
    // Start Replicate generation with correct API format
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: fluxModelVersion, // Use 'version' not 'model'
        input
      }),
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.text();
      console.error('Replicate API error:', errorData);
      throw new Error(`Replicate API error: ${replicateResponse.status} ${errorData}`);
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
        // Use first image URL from the output array
        const outputUrls = prediction.output || [];
        const imageUrl = outputUrls.length > 0 ? outputUrls[0] : 'completed';
        
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