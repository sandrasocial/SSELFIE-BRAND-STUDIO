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
    
    // Add elegant enhancement specifications with explicit anti-plastic language for "WOW is this me" results
    const filmTextureSpecs = ", heavy 35mm film grain, pronounced grain structure, soft matte skin NOT plastic skin, gentle skin retouching NOT fake skin, flattering natural lighting NOT artificial lighting, subtle skin smoothing NOT glossy skin, elegant skin enhancement NOT synthetic skin, natural facial refinement NOT digital skin, professional editorial retouching NOT CGI skin, soft focus skin perfection NOT shiny skin, gentle beauty enhancement NOT artificial beauty, naturally refined skin texture NOT rendered skin, sophisticated skin treatment NOT mannequin skin, elegant beauty photography NOT fake beauty, refined natural beauty NOT plastic beauty, natural human skin NOT doll skin, authentic skin texture NOT artificial skin texture";
    
    // Only add camera specs if prompt doesn't already contain professional camera specifications
    if (!finalPrompt.toLowerCase().includes('shot') && !finalPrompt.toLowerCase().includes('captured') && !finalPrompt.toLowerCase().includes('photographed')) {
      // Add minimal professional enhancement for basic prompts
      finalPrompt = `${finalPrompt}, ${randomCameraSpec}`;
    }
    
    // Always add film texture specifications if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('matte textured skin')) {
      finalPrompt = `${finalPrompt}${filmTextureSpecs}`;
    }
    
    // FLUX doesn't support negative_prompt parameter, so we embed anti-plastic terms directly in positive prompt
    // Add explicit "NOT" statements to combat plastic/fake skin since negative prompts don't work
    const antiPlasticSpecs = ", with natural matte skin NOT plastic skin, with real skin texture NOT fake skin, with authentic human skin NOT synthetic skin, with organic skin NOT artificial skin, with natural skin NOT digital skin, with real human face NOT CGI skin, with natural texture NOT 3D rendered skin, with human skin NOT mannequin skin, with natural face NOT doll skin, with real skin NOT wax skin, with matte finish NOT glossy skin, with natural lighting NOT artificial lighting, with subtle enhancement NOT over-processed enhancement, with gentle retouching NOT beauty filter artifacts, with natural beauty NOT digital manipulation, with authentic appearance NOT computer generated face, with real makeup NOT digital makeup, with natural skin tone NOT unnatural skin, with soft skin NOT harsh skin, with natural imperfections NOT perfect skin";
    
    // Always add anti-plastic specifications since FLUX ignores negative_prompt
    finalPrompt = `${finalPrompt}${antiPlasticSpecs}`;
    
    // Handle custom negative prompts by converting them to "NOT" format
    if (finalPrompt.includes("Negative:")) {
      const parts = finalPrompt.split("Negative:");
      finalPrompt = parts[0].trim();
      if (parts[1]) {
        const customNegatives = parts[1].trim().split(',').map(term => `NOT ${term.trim()}`).join(', ');
        finalPrompt = `${finalPrompt}, ${customNegatives}`;
      }
    }

    // Build input with FLUX-compatible parameters (NO negative_prompt since FLUX doesn't support it)
    const input: any = {
      prompt: finalPrompt,        // Includes embedded "NOT plastic skin" statements
      guidance: 2.5,              // Reduced guidance to prevent over-processing toward plastic perfection
      lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
      lora_scale: 0.7,           // Further reduced LoRA strength to prevent artificial look
      num_inference_steps: 28,    // Fewer steps to prevent over-refinement
      num_outputs: 3,            // Generate 3 focused images
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      output_quality: 90,         // Reduced quality to prevent over-sharpening
      megapixels: "1",           // Approximate megapixels
      go_fast: false,             // Quality over speed - essential for beauty
      disable_safety_checker: false
    };
    
    console.log(`Using FLUX model version: ${fluxModelVersion}`);
    console.log(`Using trained LoRA: sandrasocial/${userModel.modelName}`);
    console.log(`Final prompt with trigger word and anti-plastic NOT statements: ${finalPrompt}`);
    console.log('⚙️ FLUX Parameters (NO negative_prompt - FLUX doesnt support it):', JSON.stringify({ guidance: input.guidance, lora_scale: input.lora_scale, num_inference_steps: input.num_inference_steps }, null, 2));
    
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