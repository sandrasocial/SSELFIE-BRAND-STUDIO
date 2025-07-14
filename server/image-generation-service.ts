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
    
    // Ensure the prompt starts with the user's trigger word for maximum likeness
    let finalPrompt = customPrompt;
    if (!finalPrompt.includes(triggerWord)) {
      finalPrompt = `${triggerWord} ${customPrompt}`;
    } else {
      // If trigger word exists but not at start, move it to beginning
      finalPrompt = finalPrompt.replace(triggerWord, '').trim();
      finalPrompt = `${triggerWord} ${finalPrompt}`;
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
    
    // Simplified texture specs to avoid overwhelming the trigger word recognition
    const filmTextureSpecs = ", raw photo, visible skin texture, natural skin pores, film grain, matte finish NOT glossy skin, authentic texture NOT plastic skin";
    
    // Add pose variety randomization to prevent repetition (FLUX research-backed)
    const poseVariations = [
      "looking over shoulder with gentle smile",
      "hands running through hair naturally",
      "sitting with legs crossed elegantly",
      "standing with weight shifted to one hip",
      "leaning against surface casually",
      "walking with natural movement",
      "hands on hips confidently",
      "arms crossed in relaxed pose",
      "looking down then up at camera",
      "sitting with one leg up",
      "standing with arms at sides naturally",
      "hands gently touching face",
      "with natural authentic expression",
      "looking to the side thoughtfully",
      "hands clasped behind back",
      "sitting on edge of surface",
      "standing with one hand on hip",
      "leaning forward slightly",
      "hands in pockets casually",
      "sitting with chin resting on hand"
    ];
    
    const expressionVariations = [
      "with subtle confident expression",
      "with soft mysterious gaze",
      "with serene peaceful look",
      "with thoughtful contemplative expression",
      "with warm authentic presence",
      "with subtle knowing look",
      "with calm composed demeanor",
      "with genuine candid expression",
      "with soft dreamy gaze",
      "with confident self-assured look",
      "with gentle caring expression",
      "with natural relaxed demeanor",
      "with sophisticated editorial expression",
      "with understated confidence",
      "with authentic professional presence"
    ];
    
    // Randomly select pose and expression to prevent repetition
    const randomPose = poseVariations[Math.floor(Math.random() * poseVariations.length)];
    const randomExpression = expressionVariations[Math.floor(Math.random() * expressionVariations.length)];
    
    // Add pose variety to basic prompts that don't specify poses
    if (!finalPrompt.toLowerCase().includes('sitting') && 
        !finalPrompt.toLowerCase().includes('standing') && 
        !finalPrompt.toLowerCase().includes('leaning') && 
        !finalPrompt.toLowerCase().includes('walking') &&
        !finalPrompt.toLowerCase().includes('looking') &&
        !finalPrompt.toLowerCase().includes('pose')) {
      finalPrompt = `${finalPrompt}, ${randomPose} ${randomExpression}`;
    }
    
    // Only add camera specs if prompt doesn't already contain professional camera specifications
    if (!finalPrompt.toLowerCase().includes('shot') && !finalPrompt.toLowerCase().includes('captured') && !finalPrompt.toLowerCase().includes('photographed')) {
      // Add minimal professional enhancement for basic prompts
      finalPrompt = `${finalPrompt}, ${randomCameraSpec}`;
    }
    
    // Always add film texture specifications if not already present
    if (!finalPrompt.toLowerCase().includes('film grain') && !finalPrompt.toLowerCase().includes('matte textured skin')) {
      finalPrompt = `${finalPrompt}${filmTextureSpecs}`;
    }
    
    // Simplified anti-plastic specs to prioritize facial recognition over texture details
    const antiPlasticSpecs = ", natural skin NOT plastic skin, authentic face NOT fake face, real person NOT CGI";
    
    // Add minimal anti-plastic specifications to avoid prompt overcrowding
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

    // Build input with OPTIMIZED PARAMETERS for better likeness matching
    const input: any = {
      prompt: finalPrompt,        // Includes embedded "NOT plastic skin" statements
      guidance: 3.2,              // INCREASED: Higher guidance for stronger prompt adherence and likeness
      lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
      lora_scale: 1.0,           // INCREASED: Maximum LoRA application for strongest likeness
      num_inference_steps: 33,    // UPDATED: User specified steps for better quality
      num_outputs: 3,            // Generate 3 focused images
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      output_quality: 85,         // REDUCED: Lower quality for more natural grain
      megapixels: "1",           // Approximate megapixels
      go_fast: false,             // Quality over speed - essential for beauty
      disable_safety_checker: false
    };
    
    console.log(`🔍 DEBUGGING LIKENESS ISSUE:`);
    console.log(`Using FLUX model: black-forest-labs/flux-dev-lora`);
    console.log(`Using trained LoRA: sandrasocial/${userModel.modelName}`);
    console.log(`User's trigger word: "${triggerWord}"`);
    console.log(`Model training status: ${userModel.trainingStatus}`);
    console.log(`Final prompt: ${finalPrompt}`);
    console.log('⚙️ FLUX Parameters for MAXIMUM LIKENESS (steps 33, guidance 3.2, LoRA 1.0):', JSON.stringify({ guidance: input.guidance, lora_scale: input.lora_scale, num_inference_steps: input.num_inference_steps, output_quality: input.output_quality }, null, 2));
    
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