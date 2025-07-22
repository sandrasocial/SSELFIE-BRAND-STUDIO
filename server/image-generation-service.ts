import { storage } from './storage';
import type { InsertAIImage } from '@shared/schema-simplified';
import { ArchitectureValidator } from './architecture-validator';
import { GenerationValidator } from './generation-validator';

/**
 * Enhance prompt with hair quality optimization - matches Maya's enhancement system
 */
function enhancePromptForHairQuality(prompt: string): string {
  console.log(`💇‍♀️ AI PHOTOSHOOT HAIR QUALITY ENHANCEMENT: Analyzing prompt for hair optimization`);
  
  // Hair quality enhancement keywords
  const hairEnhancements = [
    'natural hair movement',
    'detailed hair strands', 
    'realistic hair texture',
    'individual hair strand definition',
    'professional hair lighting'
  ];
  
  // Check if prompt already contains hair-related terms
  const hasHairTerms = prompt.toLowerCase().includes('hair') || 
                      prompt.toLowerCase().includes('strand') ||
                      prompt.toLowerCase().includes('texture');
  
  // If prompt mentions hair, enhance it with quality terms
  if (hasHairTerms) {
    const enhancement = hairEnhancements[Math.floor(Math.random() * hairEnhancements.length)];
    const enhancedPrompt = `${prompt}, ${enhancement}`;
    console.log(`✨ AI PHOTOSHOOT HAIR ENHANCED: Added "${enhancement}"`);
    return enhancedPrompt;
  }
  
  // For prompts without explicit hair terms, add subtle hair quality boost
  if (prompt.toLowerCase().includes('portrait') || prompt.toLowerCase().includes('face')) {
    const enhancedPrompt = `${prompt}, natural hair detail and movement`;
    console.log(`✨ AI PHOTOSHOOT PORTRAIT HAIR BOOST: Added natural hair detail`);
    return enhancedPrompt;
  }
  
  console.log(`📝 AI PHOTOSHOOT PROMPT UNCHANGED: No hair enhancement needed`);
  return prompt;
}

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
    
    // 🚀 MAYA HAIR OPTIMIZATION: Enhanced prompt with hair quality focus for AI Photoshoot
    const hairOptimizedPrompt = enhancePromptForHairQuality(cleanPrompt);
    
    // 🚀 HIGH-QUALITY STRUCTURE: Based on reference image ID 405 (professional camera equipment + film aesthetic)
    // Add professional camera equipment for high-quality results matching the reference image
    const cameraEquipment = getRandomCameraEquipment();
    const finalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${triggerWord}, ${hairOptimizedPrompt}, ${cameraEquipment}, natural daylight, professional photography`;
    
    console.log(`🚀 AI PHOTOSHOOT HIGH-QUALITY PROMPT: ${finalPrompt}`);

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
      
      // 🔧 CORE_ARCHITECTURE_IMMUTABLE_V2 PARAMETERS - PROFESSIONAL UNIFIED QUALITY
      // Both Maya Chat and AI Photoshoot use identical parameters for consistent results
      requestBody = {
        version: userTrainedVersion, // 🔒 CRITICAL: User's individual trained model version ONLY
        input: {
          prompt: finalPrompt,
          guidance_scale: 2.8,        // ✅ CORE_ARCHITECTURE_V2: Professional natural results
          num_inference_steps: 40,    // ✅ CORE_ARCHITECTURE_V2: Enhanced quality steps
          lora_scale: 0.95,          // ✅ CORE_ARCHITECTURE_V2: Optimal strength balance
          num_outputs: 4,            // ✅ More options for better selection
          aspect_ratio: "3:4", 
          output_format: "png",
          output_quality: 95,        // ✅ CORE_ARCHITECTURE_V2: Maximum clarity
          model: "dev",              // ✅ Use dev model explicitly
          disable_safety_checker: false,
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      
    } else {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    ArchitectureValidator.validateGenerationRequest(requestBody, userId, isPremium);
    ArchitectureValidator.logArchitectureCompliance(userId, 'AI Photoshoot Generation');
    
    // 📊 LOG CORE_ARCHITECTURE_V2 PARAMETERS FOR AI PHOTOSHOOT MONITORING
    console.log(`✅ AI PHOTOSHOOT CORE_ARCHITECTURE_V2 ACTIVE for user ${userId}:`, {
      guidance_scale: requestBody.input.guidance_scale,
      steps: requestBody.input.num_inference_steps,
      lora_scale: requestBody.input.lora_scale,
      quality: requestBody.input.output_quality,
      outputs: requestBody.input.num_outputs,
      camera: 'Professional equipment integrated',
      settings: 'CORE_ARCHITECTURE_IMMUTABLE_V2 Complete'
    });
      collection: 'AI Photoshoot'
    });
    

    
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

/**
 * HIGH-QUALITY CAMERA EQUIPMENT - Based on Reference Image Analysis
 * Adds professional camera specifications that produced the best quality results
 */
function getRandomCameraEquipment(): string {
  const professionalCameras = [
    'shot on Leica Q2 with 28mm f/1.7 lens',        // ✅ From reference image ID 405
    'shot on Canon EOS R5 with 85mm f/1.4 lens',    // ✅ From reference image ID 367
    'shot on Sony A7R V with 24-70mm f/2.8 lens',   // ✅ From reference image ID 373
    'shot on Canon EOS R6 with 85mm f/1.2 lens',    // ✅ From reference image ID 368
    'shot on Canon EOS R5 with 70-200mm f/2.8 lens' // ✅ From reference image ID 370
  ];
  
  return professionalCameras[Math.floor(Math.random() * professionalCameras.length)];
}