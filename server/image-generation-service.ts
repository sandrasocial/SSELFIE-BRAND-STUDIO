import { storage } from './storage';
import type { InsertAIImage } from '@shared/schema-simplified';
import { ArchitectureValidator } from './architecture-validator';
import { GenerationValidator } from './generation-validator';

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
  const { userId, category, subcategory, customPrompt } = request;
  
  // CRITICAL: Enforce strict validation - NO FALLBACKS ALLOWED
  const userRequirements = await GenerationValidator.enforceGenerationRequirements(userId);
  console.log(`🔒 VALIDATED: User ${userId} can generate with trigger word: ${userRequirements.triggerWord}`);
  
  // Use validated trigger word and model version (not from request parameters)
  const triggerWord = userRequirements.triggerWord;
  const modelVersion = userRequirements.modelVersion;
  
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
    
    // 🔧 RESTORED WORKING PROMPT STRUCTURE - Based on successful generation ID 352
    // Clean the custom prompt first
    let cleanPrompt = customPrompt;
    
    // Remove existing trigger word instances first  
    cleanPrompt = cleanPrompt.replace(new RegExp(triggerWord, 'gi'), '').trim();
    
    // Remove existing realism terms if present to avoid duplication
    const existingTerms = ['raw photo', 'film grain', 'visible skin pores', 'unretouched natural skin texture', 
                          'subsurface scattering', 'photographed on film'];
    existingTerms.forEach(term => {
      cleanPrompt = cleanPrompt.replace(new RegExp(term, 'gi'), '').trim();
    });
    
    // Clean up extra commas and spaces
    cleanPrompt = cleanPrompt.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
    
    // 🔧 WORKING STRUCTURE: Realism base + trigger word + clean description (matches successful ID 352)
    const finalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${triggerWord}, ${cleanPrompt}`;
    
    console.log(`🔧 AI PHOTOSHOOT RESTORED WORKING PROMPT: ${finalPrompt}`);

    // 🔒 IMMUTABLE CORE ARCHITECTURE - USES USER'S INDIVIDUAL TRAINED MODEL DIRECTLY
    // Each user has their own trained FLUX model version for complete isolation
    // This ensures zero cross-contamination between users
    
    // Get user's trained model version
    if (!userModel || !userModel.replicateVersionId) {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }

    const user = await storage.getUser(userId);
    const isPremium = user?.plan === 'sselfie-studio' || user?.role === 'admin';

    let requestBody: any;

    // 🔒 RESTORE WORKING CONFIGURATION: Use user's individual trained model
    if (userModel.trainingStatus === 'completed' && userModel.replicateVersionId) {
      console.log(`✅ Using user's individual trained FLUX model for AI Photoshoot: ${userId}`);
      
      const userTrainedVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
      
      requestBody = {
        version: userTrainedVersion, // 🔒 CRITICAL: User's individual trained model version ONLY
        input: {
          prompt: finalPrompt,
          guidance: 2.8, // 🔧 USER OPTIMIZED: Lower guidance for better natural results
          num_inference_steps: 40, // 🔧 USER OPTIMIZED: More steps for higher quality
          num_outputs: 4,
          aspect_ratio: "3:4", 
          output_format: "png",
          output_quality: 95, // 🔧 USER OPTIMIZED: Higher quality output
          go_fast: false, 
          disable_safety_checker: false,
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      
    } else {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    ArchitectureValidator.validateGenerationRequest(requestBody, userId, isPremium);
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