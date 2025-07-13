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
    
    console.log(`✅ Using black-forest-labs/flux-dev-lora with trained LoRA: sandrasocial/${userModel.modelName}`);
    
    // Ensure the prompt includes the user's trigger word
    let finalPrompt = customPrompt;
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord}, ${customPrompt}`;
    }
    
    // Add professional camera equipment specifications
    const cameraSpecs = [
      "shot with Hasselblad X2D 100C, 80mm lens, f/2.8",
      "captured with Canon EOS R5, 85mm f/1.4 lens, professional lighting",
      "photographed with Leica SL2-S, 50mm Summilux lens, f/1.4",
      "shot on Fujifilm GFX 100S, 110mm f/2 lens, medium format",
      "captured with Nikon Z9, 85mm f/1.8 lens, studio lighting",
      "photographed with Sony A7R V, 90mm macro lens, f/2.8"
    ];
    
    const randomCameraSpec = cameraSpecs[Math.floor(Math.random() * cameraSpecs.length)];
    
    // Add AGGRESSIVE film texture and natural skin specifications to ALL prompts
    const filmTextureSpecs = ", HEAVY 35mm film grain, PRONOUNCED grain structure, MATTE textured skin, natural skin texture, visible skin pores, authentic skin imperfections, real skin texture, organic skin detail, natural facial refinement, ANALOG film aesthetic, raw film negative quality, unprocessed natural skin, realistic skin texture, human skin detail, natural skin irregularities, skin with character, lived-in skin, weathered skin texture, natural skin aging, authentic human skin";
    
    // Only add camera specs if prompt doesn't already contain professional camera specifications
    if (!finalPrompt.toLowerCase().includes('shot') && !finalPrompt.toLowerCase().includes('captured') && !finalPrompt.toLowerCase().includes('photographed')) {
      // Add minimal professional enhancement for basic prompts
      finalPrompt = `${finalPrompt}, ${randomCameraSpec}`;
    }
    
    // Always add film texture specifications if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('matte textured skin')) {
      finalPrompt = `${finalPrompt}${filmTextureSpecs}`;
    }
    
    // Extract negative prompts from the custom prompt (if present) - AGGRESSIVE ANTI-PLASTIC ENHANCEMENT
    let negativePrompt = "plastic skin, fake skin, synthetic skin, artificial skin, digital skin, CGI skin, rendered skin, 3D skin, mannequin skin, doll skin, wax skin, silicon skin, rubber skin, vinyl skin, shiny skin, glossy skin, reflective skin, wet skin, oily skin, slick skin, polished skin, laminated skin, smooth skin, perfect skin, flawless skin, poreless skin, airbrushed skin, retouched skin, filtered skin, processed skin, enhanced skin, beautified skin, digital smoothing, skin blur, over-processed, digital enhancement, beauty filter, face tune, photo filter, digital makeup, virtual makeup, computer generated, AI generated face, deepfake, face swap, digital face, rendered face, 3D face, artificial lighting, studio lighting perfection, professional makeup, heavy makeup, foundation, concealer, digital retouching";
    
    // Check if prompt contains negative prompts and extract them
    if (finalPrompt.includes("Negative:")) {
      const parts = finalPrompt.split("Negative:");
      finalPrompt = parts[0].trim();
      if (parts[1]) {
        negativePrompt = parts[1].trim() + ", " + negativePrompt;
      }
    }

    // Build input with AGGRESSIVE anti-plastic parameters for natural, textured skin
    const input: any = {
      prompt: finalPrompt,
      negative_prompt: negativePrompt,  // Aggressive anti-plastic negative prompts
      guidance: 2.0,              // LOWER guidance for more natural, less AI-processed results
      lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
      lora_scale: 0.8,           // REDUCED LoRA scale to prevent over-application
      num_inference_steps: 28,    // FEWER steps to prevent over-processing
      num_outputs: 3,            // Generate 3 focused images
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      output_quality: 90,         // REDUCED quality to prevent over-sharpening
      megapixels: "1",           // Approximate megapixels
      go_fast: false,             // Quality over speed - essential for grain texture
      disable_safety_checker: false
    };
    
    console.log(`Using FLUX model version: ${fluxModelVersion}`);
    console.log(`Using trained LoRA: sandrasocial/${userModel.modelName}`);
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