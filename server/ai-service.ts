import { storage } from './storage';
import { UsageService, API_COSTS } from './usage-service';
import { ArchitectureValidator } from './architecture-validator';
import { GenerationValidator } from './generation-validator';

// FLUX model configuration for SSELFIE generation - SECURE VERSION
const FLUX_MODEL_CONFIG = {
  // Each user must have their own completed trained model
  apiUrl: 'https://api.replicate.com/v1/predictions'
  // ALL HARDCODED PROMPTS REMOVED - Maya AI generates authentic prompts only
};

interface ImageGenerationRequest {
  userId: string;
  imageBase64: string;
  style: 'editorial' | 'business' | 'lifestyle' | 'luxury';
  prompt?: string;
}

interface FluxResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
}

export class AIService {
  static async generateSSELFIE(request: ImageGenerationRequest): Promise<{ trackerId: number; predictionId: string; usageStatus: any }> {
    const { userId, imageBase64, style, prompt } = request;
    
    // CRITICAL: Enforce strict validation - NO FALLBACKS ALLOWED
    const userRequirements = await GenerationValidator.enforceGenerationRequirements(userId);
    console.log(`🔒 VALIDATED: User ${userId} can generate with trigger word: ${userRequirements.triggerWord}`);
    
    // 1. Check usage limits AFTER model validation
    const usageCheck = await UsageService.checkUsageLimit(userId);
    if (!usageCheck.canGenerate) {
      throw new Error(`Generation limit reached: ${usageCheck.reason}`);
    }

    // Create temporary generation tracking record (NOT in ai_images gallery table)
    // Use the actual userId passed to this function for tracker ownership
    const generationTracker = await storage.createGenerationTracker({
      userId: userId, // Direct auth ID for generation trackers
      predictionId: '', // Will be updated after API call
      prompt: prompt || 'Custom Maya AI prompt generation',
      style,
      status: 'pending',
      imageUrls: null // Will store temp URLs for preview only
    });

    try {
      // Call FLUX model API
      const fluxPrompt = await this.buildFluxPrompt(style, prompt, userId);
      const predictionId = await this.callFluxAPI(imageBase64, fluxPrompt, userId);
      
      // Update tracker with prediction ID
      await storage.updateGenerationTracker(generationTracker.id, { 
        predictionId,
        status: 'processing'
      });

      // 2. Record usage immediately when API call succeeds
      await UsageService.recordUsage(userId, {
        actionType: 'generation',
        resourceUsed: 'replicate_ai',
        cost: API_COSTS.replicate_ai,
        details: {
          style,
          prompt: fluxPrompt,
          predictionId
        },
        generationTrackerId: generationTracker.id
      });

      // Get updated usage status for frontend
      const updatedUsage = await UsageService.checkUsageLimit(userId);
      
      return {
        trackerId: generationTracker.id,
        predictionId,
        usageStatus: updatedUsage
      };
    } catch (error) {
      // Update generation tracker with error status
      await storage.updateGenerationTracker(generationTracker.id, {
        status: 'failed',
        imageUrls: JSON.stringify([`Error: ${error.message}`])
      });
      throw error;
    }
  }

  static async checkGenerationStatus(predictionId: string): Promise<FluxResponse> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    const response = await fetch(`${FLUX_MODEL_CONFIG.apiUrl}/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateImageStatus(trackerId: number, predictionId: string): Promise<void> {
    try {
      const status = await this.checkGenerationStatus(predictionId);
      
      
      switch (status.status) {
        case 'succeeded':
          if (status.output && status.output.length > 0) {
            // 🔑 KEY CHANGE: Store TEMP URLs only for preview - NO AUTO-SAVE TO GALLERY
            
            await storage.updateGenerationTracker(trackerId, {
              imageUrls: JSON.stringify(status.output), // Store TEMP Replicate URLs for preview
              status: 'completed'
            });
            
            try {
              await this.updateMayaChatWithImages(trackerId, status.output);
              console.log(`✅ Successfully updated Maya chat with images for tracker ${trackerId}`);
            } catch (error) {
              console.error(`❌ Failed to update Maya chat with images for tracker ${trackerId}:`, error);
            }
            
          }
          break;
          
        case 'failed':
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify([`Generation failed: ${status.error || 'Unknown error'}`]),
            status: 'failed'
          });
          break;
          
        case 'starting':
        case 'processing':
          await storage.updateGenerationTracker(trackerId, {
            status: 'processing'
          });
          break;
          
        case 'canceled':
          await storage.updateGenerationTracker(trackerId, {
            imageUrls: JSON.stringify(['Generation was canceled']),
            status: 'canceled'
          });
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  static async forceUpdateCompletedGeneration(aiImageId: number, predictionId: string): Promise<void> {
    // Force update a generation we know is completed - for immediate testing
    const imageUrls = [
      "https://replicate.delivery/xezq/EACv4QnHlGZmAdsgwbI0wEvF6iPQQUWfP1fMgS75YlaH17epA/out-0.png",
      "https://replicate.delivery/xezq/yD2CLzqxelQKCa7mrzA5wafQTXatRfXYGgpfP5Lxtz2cUv7TB/out-1.png",
      "https://replicate.delivery/xezq/muwUNJw71c5RHxXvHj2omavH3i0zCEr1tlqDXG9BuFzR9uPF/out-2.png",
      "https://replicate.delivery/xezq/Ud5UU61WmNqNBJ0i1OliFJTHqoB3Ratv8dBsOTmSPa2R9uPF/out-3.png"
    ];
    
    await storage.updateGeneratedImage(aiImageId, {
      image_urls: JSON.stringify(imageUrls),
      generationStatus: 'completed'
    });
    
  }

  private static async buildFluxPrompt(style: string, customPrompt?: string, userId?: string): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }
    
    // Use ONLY user's unique trigger word - NO FALLBACKS
    const triggerWord = userModel.triggerWord;
    
    if (customPrompt) {
      // 🔧 RESTORED WORKING PROMPT STRUCTURE - Based on successful generation ID 352
      // Clean the prompt from any existing realism/trigger words to avoid duplication
      let cleanPrompt = customPrompt;
      
      // Remove existing trigger word instances first
      cleanPrompt = cleanPrompt.replace(new RegExp(triggerWord, 'gi'), '').trim();
      
      // Remove existing realism base terms if already present
      const existingTerms = ['raw photo', 'visible skin pores', 'film grain', 'unretouched natural skin texture', 
                            'subsurface scattering', 'photographed on film'];
      existingTerms.forEach(term => {
        cleanPrompt = cleanPrompt.replace(new RegExp(term, 'gi'), '').trim();
      });
      
      // Clean up extra commas and spaces
      cleanPrompt = cleanPrompt.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
      
      // 🚀 MAYA HAIR OPTIMIZATION: Enhanced prompt with hair quality focus
      const hairOptimizedPrompt = this.enhancePromptForHairQuality(cleanPrompt);
      
      // 🔧 WORKING STRUCTURE: Realism base + trigger word + hair-optimized description
      const finalPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${triggerWord}, ${hairOptimizedPrompt}`;
      
      console.log(`🔧 MAYA HAIR-OPTIMIZED PROMPT: ${finalPrompt}`);
      return finalPrompt;
    }
    
    // Fallback should never be used - Maya should always provide custom prompt
    throw new Error('Custom prompt required - no hardcoded prompts allowed');
  }
  
  /**
   * Enhance prompt with hair quality optimization
   */
  private static enhancePromptForHairQuality(prompt: string): string {
    console.log(`💇‍♀️ HAIR QUALITY ENHANCEMENT: Analyzing prompt for hair optimization`);
    
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
      console.log(`✨ HAIR ENHANCED: Added "${enhancement}"`);
      return enhancedPrompt;
    }
    
    // For prompts without explicit hair terms, add subtle hair quality boost
    if (prompt.toLowerCase().includes('portrait') || prompt.toLowerCase().includes('face')) {
      const enhancedPrompt = `${prompt}, natural hair detail and movement`;
      console.log(`✨ PORTRAIT HAIR BOOST: Added natural hair detail`);
      return enhancedPrompt;
    }
    
    console.log(`📝 PROMPT UNCHANGED: No hair enhancement needed`);
    return prompt;
  }

  private static async callFluxAPI(imageBase64: string, prompt: string, userId?: string): Promise<string> {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    if (!userId) {
      throw new Error('User ID is required for image generation');
    }
    
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel) {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }

    const user = await storage.getUser(userId);
    const isPremium = user?.plan === 'sselfie-studio' || user?.role === 'admin';

    let requestBody: any;

    // 🔒 RESTORE WORKING CONFIGURATION: Use user's individual trained model
    if (userModel.trainingStatus === 'completed' && userModel.replicateVersionId) {
      console.log(`✅ Using user's individual trained FLUX model: ${userId}`);
      
      // 🔧 CRITICAL FIX: Use the specific model version that created successful images
      // Working version: b9fab7abf5819f4c99e78d84d9f049b30b5ba7c63407221604030862ae0be927
      const userTrainedVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
      
      // 🚀 MAYA OPTIMIZATION INTEGRATION: Get user-adaptive parameters
      const { MayaOptimizationService } = await import('./maya-optimization-service');
      const optimizedParams = await MayaOptimizationService.getOptimizedParameters(userId);
      
      requestBody = {
        version: userTrainedVersion,
        input: {
          prompt: prompt,
          guidance: optimizedParams.guidance || 2.8, // 🔧 OPTIMIZED: User-adaptive guidance
          num_inference_steps: optimizedParams.inferenceSteps || 40, // 🔧 OPTIMIZED: Quality-based steps
          lora_scale: optimizedParams.loraScale || 0.95, // 🚀 CRITICAL FIX: Missing LoRA scale added
          num_outputs: 3,
          aspect_ratio: "3:4", 
          output_format: "png",
          output_quality: optimizedParams.outputQuality || 95, // 🔧 OPTIMIZED: Quality setting
          go_fast: false, 
          disable_safety_checker: false,
          seed: Math.floor(Math.random() * 1000000)
        }
      };
      
    } else {
      throw new Error('User model not ready for generation. Training must be completed first.');
    }

    // 🔒 PERMANENT ARCHITECTURE VALIDATION - NEVER REMOVE
    ArchitectureValidator.validateGenerationRequest(requestBody, userId, isPremium);
    ArchitectureValidator.logArchitectureCompliance(userId, 'Maya AI Generation');
    
    // 📊 LOG OPTIMIZATION PARAMETERS FOR MONITORING
    console.log(`🚀 MAYA OPTIMIZATION ACTIVE for user ${userId}:`, {
      guidance: requestBody.input.guidance,
      steps: requestBody.input.num_inference_steps,
      loraScale: requestBody.input.lora_scale,
      quality: requestBody.input.output_quality,
      isPremium,
      userRole: user?.role
    });
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`FLUX API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    return prediction.id;
  }

  static async generateMultipleStyles(userId: string, imageBase64: string): Promise<{ [style: string]: { aiImageId: number; predictionId: string } }> {
    const styles = ['editorial', 'business', 'lifestyle', 'luxury'] as const;
    const results: { [style: string]: { aiImageId: number; predictionId: string } } = {};

    // Generate all styles in parallel
    const promises = styles.map(async (style) => {
      const result = await this.generateSSELFIE({
        userId,
        imageBase64,
        style
      });
      results[style] = result;
    });

    await Promise.all(promises);
    return results;
  }

  static async pollGenerationStatus(trackerId: number, predictionId: string, maxAttempts: number = 30): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.checkGenerationStatus(predictionId);
        
        if (status.status === 'succeeded' || status.status === 'failed' || status.status === 'canceled') {
          await this.updateImageStatus(trackerId, predictionId);
          return;
        }
        
        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        attempts++;
        
        if (attempts >= maxAttempts) {
          await storage.updateGenerationTracker(trackerId, {
            status: 'timeout',
            imageUrls: JSON.stringify(['Generation timeout - max attempts reached'])
          });
          throw new Error('Generation polling timeout');
        }
      }
    }
  }

  private static async updateMayaChatWithImages(trackerId: number, imageUrls: string[]): Promise<void> {
    try {
      console.log(`🔍 Starting updateMayaChatWithImages for tracker ${trackerId} with ${imageUrls.length} images`);
      
      // Get the generation tracker to find the user
      const tracker = await storage.getGenerationTracker(trackerId);
      if (!tracker) {
        console.log(`❌ No tracker found for ID ${trackerId}`);
        return;
      }
      console.log(`✅ Found tracker for user ${tracker.userId}`);

      // Find the most recent Maya chat message with a generated_prompt for this user
      const mayaChats = await storage.getMayaChats(tracker.userId);
      if (!mayaChats || mayaChats.length === 0) {
        console.log(`❌ No Maya chats found for user ${tracker.userId}`);
        return;
      }
      console.log(`✅ Found ${mayaChats.length} Maya chats for user ${tracker.userId}`);

      // Get the most recent chat
      const recentChat = mayaChats[0];
      const chatMessages = await storage.getMayaChatMessages(recentChat.id);
      console.log(`✅ Found ${chatMessages.length} messages in recent chat ${recentChat.id}`);
      
      // Find the most recent Maya message with a generated_prompt (the one that should get images)
      const mayaMessagesWithPrompt = chatMessages
        .filter(msg => msg.role === 'maya' && msg.generatedPrompt);
      console.log(`🔍 Found ${mayaMessagesWithPrompt.length} Maya messages with generated prompts`);
      
      const mayaMessagesWithoutImages = mayaMessagesWithPrompt
        .filter(msg => !msg.imagePreview);
      console.log(`🔍 Found ${mayaMessagesWithoutImages.length} Maya messages without image previews`);
      
      const mayaMessageWithPrompt = mayaMessagesWithoutImages
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (!mayaMessageWithPrompt) {
        console.log(`❌ No Maya message found that needs image update`);
        return;
      }
      console.log(`✅ Found Maya message ${mayaMessageWithPrompt.id} to update with images`);

      // Update the Maya message with the generated images
      const updatedMessage = await storage.updateMayaChatMessage(mayaMessageWithPrompt.id, {
        imagePreview: JSON.stringify(imageUrls)
      });
      console.log(`✅ Successfully updated Maya message ${mayaMessageWithPrompt.id} with ${imageUrls.length} images`);

    } catch (error) {
      console.error(`❌ updateMayaChatWithImages failed for tracker ${trackerId}:`, error);
      throw error;
    }
  }

  // 🔑 NEW: Check for completed generations that need to update Maya messages
  static async checkPendingMayaImageUpdates(userId: string): Promise<void> {
    try {
      console.log(`🔍 Checking pending Maya image updates for user ${userId}`);
      
      // Get all completed generation trackers for this user from the last 24 hours
      const completedTrackers = await storage.getCompletedGenerationTrackersForUser(userId, 24);
      if (!completedTrackers || completedTrackers.length === 0) {
        console.log(`ℹ️ No completed trackers found for user ${userId}`);
        return;
      }
      console.log(`✅ Found ${completedTrackers.length} completed trackers for user ${userId}`);

      // Get Maya chats for this user
      const mayaChats = await storage.getMayaChats(userId);
      if (!mayaChats || mayaChats.length === 0) {
        console.log(`ℹ️ No Maya chats found for user ${userId}`);
        return;
      }

      // Check each chat for messages that need images
      for (const chat of mayaChats) {
        const chatMessages = await storage.getMayaChatMessages(chat.id);
        const messagesNeedingImages = chatMessages
          .filter(msg => msg.role === 'maya' && msg.generatedPrompt && !msg.imagePreview);

        if (messagesNeedingImages.length > 0) {
          console.log(`🔍 Found ${messagesNeedingImages.length} Maya messages needing images in chat ${chat.id}`);
          
          // For each message needing images, try to match with a completed tracker
          for (const message of messagesNeedingImages) {
            // Find the most recent completed tracker that doesn't have a paired message yet
            const availableTracker = completedTrackers.find(tracker => {
              try {
                const trackerImages = JSON.parse(tracker.imageUrls || '[]');
                return Array.isArray(trackerImages) && trackerImages.length > 0;
              } catch {
                return false;
              }
            });

            if (availableTracker) {
              console.log(`🔗 Pairing message ${message.id} with tracker ${availableTracker.id}`);
              const imageUrls = JSON.parse(availableTracker.imageUrls);
              
              await storage.updateMayaChatMessage(message.id, {
                imagePreview: JSON.stringify(imageUrls)
              });
              console.log(`✅ Updated Maya message ${message.id} with images from tracker ${availableTracker.id}`);
              
              // Remove this tracker from available list to avoid double-pairing
              const trackerIndex = completedTrackers.indexOf(availableTracker);
              if (trackerIndex > -1) {
                completedTrackers.splice(trackerIndex, 1);
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ checkPendingMayaImageUpdates failed for user ${userId}:`, error);
    }
  }
}