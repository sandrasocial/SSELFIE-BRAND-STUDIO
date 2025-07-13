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
    
    // Add RAW PHOTOGRAPHY specifications matching training data aesthetic
    const filmTextureSpecs = ", MOODY RAW PHOTOGRAPHY, heavy 35mm film grain, pronounced grain structure, raw photo, unretouched skin texture, visible skin imperfections, natural skin pores, authentic skin NOT plastic skin, real skin texture NOT fake skin, documentary style lighting NOT artificial lighting, unprocessed skin NOT glossy skin, raw natural beauty NOT synthetic skin, authentic human skin NOT digital skin, film grain texture NOT CGI skin, matte natural finish NOT shiny skin, unretouched raw emotion NOT artificial beauty, natural imperfections NOT rendered skin, authentic documentary feel NOT mannequin skin, raw film aesthetic NOT fake beauty, real human texture NOT plastic beauty, genuine skin NOT doll skin, natural authentic texture NOT artificial skin texture";
    
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
    
    // FLUX doesn't support negative_prompt parameter, so we embed raw photography terms directly in positive prompt
    // Add explicit "NOT" statements for raw, unretouched aesthetic matching training data
    const antiPlasticSpecs = ", with raw unretouched skin NOT plastic skin, with visible skin imperfections NOT fake skin, with natural skin pores NOT synthetic skin, with authentic human texture NOT artificial skin, with film grain skin NOT digital skin, with documentary realism NOT CGI skin, with natural texture NOT 3D rendered skin, with human skin imperfections NOT mannequin skin, with raw natural face NOT doll skin, with unprocessed skin NOT wax skin, with matte natural finish NOT glossy skin, with moody natural lighting NOT artificial lighting, with no retouching NOT over-processed enhancement, with raw photography NOT beauty filter artifacts, with authentic documentary style NOT digital manipulation, with genuine appearance NOT computer generated face, with natural makeup NOT digital makeup, with real skin tone NOT unnatural skin, with natural human flaws NOT harsh skin, with authentic imperfections NOT perfect skin";
    
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

    // Build input with SOFT RAW PHOTOGRAPHY parameters for natural, unretouched look
    const input: any = {
      prompt: finalPrompt,        // Includes embedded "NOT plastic skin" statements
      guidance: 2.0,              // REDUCED: Lower guidance for softer, less processed look
      lora_weights: `sandrasocial/${userModel.modelName}`, // User's trained LoRA weights
      lora_scale: 0.6,           // REDUCED: Lower LoRA for more natural blending with base model
      num_inference_steps: 25,    // REDUCED: Fewer steps for softer, less refined look
      num_outputs: 3,            // Generate 3 focused images
      aspect_ratio: "3:4",        // Portrait ratio better for selfies
      output_format: "png",       // PNG for highest quality
      output_quality: 85,         // REDUCED: Lower quality for more natural grain
      megapixels: "1",           // Approximate megapixels
      go_fast: false,             // Quality over speed - essential for beauty
      disable_safety_checker: false
    };
    
    console.log(`Using FLUX model version: ${fluxModelVersion}`);
    console.log(`Using trained LoRA: sandrasocial/${userModel.modelName}`);
    console.log(`Final prompt with trigger word and raw photography NOT statements: ${finalPrompt}`);
    console.log('⚙️ FLUX Parameters for RAW PHOTOGRAPHY (soft, natural, unretouched):', JSON.stringify({ guidance: input.guidance, lora_scale: input.lora_scale, num_inference_steps: input.num_inference_steps, output_quality: input.output_quality }, null, 2));
    
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