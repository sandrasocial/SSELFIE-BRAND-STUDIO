/**
 * ENHANCED GENERATION SERVICE - EXTRA LORA SUPPORT
 * Experimental service for testing enhanced portrait quality
 * Maintains V2 architecture while adding enhancement layers
 */

import { storage } from './storage';
import { ArchitectureValidator } from './architecture-validator';

interface EnhancedGenerationRequest {
  userId: string;
  customPrompt: string;
  enhancementLevel?: 'subtle' | 'medium' | 'dramatic';
}

interface EnhancementLoRA {
  model: string;
  scale: number;
  description: string;
  triggerWords?: string;
}

export class EnhancedGenerationService {
  
  // 🔥 PROFESSIONAL ENHANCEMENT LORAS - TESTED AND OPTIMIZED
  private static readonly ENHANCEMENT_LORAS: Record<string, EnhancementLoRA> = {
    ultra_realism: {
      model: 'prithivMLmods/Canopus-LoRA-Flux-UltraRealism-2.0',
      scale: 0.8,
      description: 'Photorealistic skin textures and professional lighting',
      triggerWords: 'Ultra realistic'
    },
    face_realism: {
      model: 'prithivMLmods/Canopus-LoRA-Flux-FaceRealism',
      scale: 0.9,
      description: 'Enhanced facial features and natural details',
      triggerWords: 'face realism'
    },
    super_portrait: {
      model: 'strangerzonehf/Flux-Super-Portrait-LoRA',
      scale: 0.7,
      description: 'Professional portrait quality with bright highlights',
      triggerWords: 'Super Portrait'
    }
  };
  
  // 🎯 ENHANCEMENT PRESETS FOR DIFFERENT QUALITY LEVELS
  private static readonly ENHANCEMENT_PRESETS = {
    subtle: {
      lora: 'face_realism',
      scale: 0.6,
      description: 'Light enhancement for natural improvement'
    },
    medium: {
      lora: 'ultra_realism', 
      scale: 0.8,
      description: 'Balanced enhancement for professional quality'
    },
    dramatic: {
      lora: 'super_portrait',
      scale: 1.0,
      description: 'Maximum enhancement for WOW factor'
    }
  };
  
  /**
   * 🔥 ENHANCED GENERATION - V2 ARCHITECTURE + ENHANCEMENT LAYER
   * Combines user's individual model with professional enhancement LoRAs
   */
  static async generateEnhanced(request: EnhancedGenerationRequest) {
    const { userId, customPrompt, enhancementLevel = 'medium' } = request;
    
    // 🔒 VALIDATE USER MODEL (V2 ARCHITECTURE COMPLIANCE)
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not ready for enhanced generation. Training must be completed first.');
    }
    
    if (!userModel.replicateVersionId) {
      throw new Error('User model version not found - training may need completion');
    }
    
    // 🔒 INDIVIDUAL USER MODEL ARCHITECTURE (Fixed July 22, 2025)  
    const userModelPath = userModel.replicateVersionId;
    
    // 🔥 SELECT ENHANCEMENT BASED ON LEVEL
    const preset = this.ENHANCEMENT_PRESETS[enhancementLevel];
    const enhancement = this.ENHANCEMENT_LORAS[preset.lora];
    
    console.log(`🔥 ENHANCED GENERATION: Using ${enhancementLevel} enhancement with individual model: ${userModelPath}`);
    console.log(`🎨 Enhancement LoRA: ${enhancement.description}`);
    
    // 🎯 OPTIMIZE PROMPT FOR ENHANCEMENT
    let enhancedPrompt = customPrompt;
    
    // Clean the custom prompt first to avoid duplication
    const triggerWord = userModel.triggerWord;
    enhancedPrompt = enhancedPrompt.replace(new RegExp(triggerWord, 'gi'), '').trim();
    
    // Remove existing realism terms if present to avoid duplication
    const existingTerms = ['raw photo', 'visible skin pores', 'film grain', 'unretouched natural skin texture', 
                          'subsurface scattering', 'photographed on film'];
    existingTerms.forEach(term => {
      enhancedPrompt = enhancedPrompt.replace(new RegExp(term, 'gi'), '').trim();
    });
    
    // Clean up extra commas and spaces
    enhancedPrompt = enhancedPrompt.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
    
    // 🔧 WORKING STRUCTURE: Realism base + trigger word + clean description
    enhancedPrompt = `raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${triggerWord}, ${enhancedPrompt}`;
    
    // Add enhancement trigger words if specified
    if (enhancement.triggerWords && !enhancedPrompt.toLowerCase().includes(enhancement.triggerWords.toLowerCase())) {
      enhancedPrompt = `${enhancedPrompt}, ${enhancement.triggerWords}`;
    }
    
    console.log(`🔧 ENHANCED GENERATION WORKING PROMPT: ${enhancedPrompt}`);
    
    // 🔥 INDIVIDUAL USER MODEL REQUEST WITH ENHANCEMENT
    const enhancedRequestBody = {
      version: userModelPath, // ✅ COMPLETE individual user model path
      input: {
        prompt: enhancedPrompt,
        guidance: 2.8,               // ✅ Unified high-quality parameter
        num_inference_steps: 40,     // ✅ Unified high-quality parameter
        lora_scale: 0.95,           // ✅ Unified high-quality parameter
        num_outputs: 3,
        aspect_ratio: "3:4", // 🔒 CORE_ARCHITECTURE_IMMUTABLE_V2.md: portrait format
        output_format: "png",
        output_quality: 95,         // ✅ Unified high-quality parameter
        go_fast: false, // 🔒 CORE_ARCHITECTURE_IMMUTABLE_V2.md: quality over speed
        disable_safety_checker: false,
        // 🔥 ENHANCEMENT LAYER - NEW PARAMETERS
        extra_lora: enhancement.model,
        extra_lora_scale: preset.scale,
        seed: Math.floor(Math.random() * 1000000)
      }
    };
    
    // 🔒 VALIDATE ENHANCED REQUEST (ENSURE V2 COMPLIANCE)
    const user = await storage.getUser(userId);
    const isPremium = user?.plan === 'sselfie-studio' || user?.role === 'admin';
    ArchitectureValidator.validateGenerationRequest(enhancedRequestBody, userId, isPremium);
    ArchitectureValidator.logArchitectureCompliance(userId, `Enhanced Generation (${enhancementLevel})`);
    
    console.log('🔥 Enhanced generation parameters:', {
      userModel: userModel.replicateModelId,
      enhancement: enhancement.model,
      scale: preset.scale,
      level: enhancementLevel
    });
    
    // 🚀 MAKE ENHANCED GENERATION REQUEST
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedRequestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Enhanced FLUX API error: ${error.detail || response.statusText}`);
    }
    
    const prediction = await response.json();
    
    console.log('🔥 ENHANCED GENERATION STARTED:', {
      predictionId: prediction.id,
      enhancement: enhancement.description,
      level: enhancementLevel
    });
    
    return {
      predictionId: prediction.id,
      enhancementUsed: enhancement.description,
      enhancementLevel,
      enhancedPrompt,
      status: 'processing'
    };
  }
  
  /**
   * 🎨 GET AVAILABLE ENHANCEMENT LEVELS
   */
  static getEnhancementLevels() {
    return Object.entries(this.ENHANCEMENT_PRESETS).map(([level, preset]) => ({
      level,
      description: preset.description,
      loraUsed: this.ENHANCEMENT_LORAS[preset.lora].description
    }));
  }
  
  /**
   * 🔥 CHECK IF ENHANCED GENERATION IS AVAILABLE FOR USER
   */
  static async isEnhancedGenerationAvailable(userId: string): Promise<boolean> {
    try {
      const userModel = await storage.getUserModelByUserId(userId);
      return userModel?.trainingStatus === 'completed' && !!userModel.replicateVersionId;
    } catch {
      return false;
    }
  }
}

export { EnhancedGenerationService };