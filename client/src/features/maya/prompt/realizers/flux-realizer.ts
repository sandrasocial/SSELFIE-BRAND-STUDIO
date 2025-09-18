/**
 * FLUX Realizer
 * Builds technical FLUX_PROMPT format: "<TRIGGER> {gender}, camera, light, setting, pose, composition, negatives"
 */

import { AestheticRecipe, RecipeLook, GenderVariant } from '../recipes/types';

export interface FluxPromptOptions {
  userTriggerToken: string;
  userGender?: GenderVariant | null;
  includeQualityHints?: boolean;
  includeNegativePrompts?: boolean;
  cameraSpecs?: string[];
  customElements?: string[];
}

export interface GeneratedFluxPrompt {
  prompt: string;
  components: {
    trigger: string;
    gender: string;
    quality: string[];
    camera: string;
    lighting: string;
    setting: string;
    subject: string;
    pose: string;
    composition: string;
    negatives: string;
  };
  wordCount: number;
  characterCount: number;
}

export class FluxRealizer {
  
  /**
   * Generate FLUX prompt from recipe and look
   */
  static generateFluxPrompt(
    recipe: AestheticRecipe, 
    look: RecipeLook, 
    options: FluxPromptOptions
  ): GeneratedFluxPrompt {
    const {
      userTriggerToken,
      userGender,
      includeQualityHints = true,
      includeNegativePrompts = true,
      cameraSpecs = [],
      customElements = []
    } = options;
    
    console.log('🔧 Generating FLUX prompt for:', recipe.name, 'Gender:', userGender);
    
    const components = {
      trigger: '',
      gender: '',
      quality: [] as string[],
      camera: '',
      lighting: '',
      setting: '',
      subject: '',
      pose: '',
      composition: '',
      negatives: ''
    };
    
    // 1. Trigger token
    components.trigger = userTriggerToken;
    
    // 2. Gender specification
    components.gender = this.getGenderToken(userGender);
    
    // 3. Quality hints (technical foundation)
    if (includeQualityHints) {
      components.quality = [...recipe.qualityHints];
    }
    
    // 4. Camera specifications
    components.camera = this.buildCameraSpecs(recipe, cameraSpecs);
    
    // 5. Lighting specification
    components.lighting = this.buildLightingSpecs(recipe);
    
    // 6. Setting and environment
    components.setting = this.buildSettingSpecs(recipe);
    
    // 7. Subject description
    components.subject = this.buildSubjectSpecs(look, userGender);
    
    // 8. Pose and action
    components.pose = this.buildPoseSpecs(look);
    
    // 9. Composition details
    components.composition = this.buildCompositionSpecs(recipe);
    
    // 10. Negative prompts
    if (includeNegativePrompts && recipe.negativePrompts) {
      components.negatives = recipe.negativePrompts.join(', ');
    }
    
    // Assemble final prompt
    const promptParts = [
      // Core identity
      components.trigger,
      components.gender,
      
      // Quality foundation
      ...(components.quality.length > 0 ? components.quality : []),
      
      // Technical specs
      components.camera,
      components.lighting,
      
      // Scene and subject
      components.setting,
      components.subject,
      components.pose,
      
      // Composition
      components.composition,
      
      // Custom additions
      ...customElements
      
    ].filter(Boolean);
    
    let prompt = promptParts.join(', ');
    
    // Add negative prompts if specified
    if (components.negatives && includeNegativePrompts) {
      prompt += ` --no ${components.negatives}`;
    }
    
    const wordCount = prompt.split(/\s+/).length;
    const characterCount = prompt.length;
    
    console.log('✅ Generated FLUX prompt:', { 
      wordCount, 
      characterCount,
      hasNegatives: !!components.negatives 
    });
    
    return {
      prompt,
      components,
      wordCount,
      characterCount
    };
  }
  
  /**
   * Get gender token for prompt
   */
  private static getGenderToken(userGender?: GenderVariant | null): string {
    switch (userGender) {
      case 'woman':
        return 'woman';
      case 'man':
        return 'man';
      case 'non-binary':
        return 'non-binary person';
      default:
        return 'person'; // Neutral fallback
    }
  }
  
  /**
   * Build camera specifications
   */
  private static buildCameraSpecs(recipe: AestheticRecipe, customSpecs: string[] = []): string {
    const specs = [];
    
    // Use custom camera specs if provided
    if (customSpecs.length > 0) {
      specs.push(...customSpecs);
    } else {
      // Build from recipe composition details
      const { composition } = recipe;
      
      if (composition.lensType) {
        specs.push(composition.lensType);
      }
      
      if (composition.depthOfField === 'shallow') {
        specs.push('shallow depth of field', 'bokeh background');
      } else if (composition.depthOfField === 'deep') {
        specs.push('deep focus', 'sharp background');
      }
      
      if (composition.cameraAngle !== 'eye-level') {
        specs.push(`${composition.cameraAngle.replace('-', ' ')} angle`);
      }
    }
    
    return specs.join(', ');
  }
  
  /**
   * Build lighting specifications
   */
  private static buildLightingSpecs(recipe: AestheticRecipe): string {
    const { lighting } = recipe;
    const specs = [];
    
    // Add lighting specifics
    specs.push(...lighting.specifics);
    
    // Add quality descriptors
    if (lighting.quality !== 'natural') {
      specs.push(`${lighting.quality} lighting`);
    }
    
    // Add directional information
    if (lighting.direction !== 'diffused') {
      specs.push(`${lighting.direction.replace('-', ' ')} lighting`);
    }
    
    // Add source information if relevant
    if (lighting.source === 'studio') {
      specs.push('studio lighting setup');
    } else if (lighting.source === 'mixed') {
      specs.push('mixed lighting sources');
    }
    
    return specs.join(', ');
  }
  
  /**
   * Build setting specifications
   */
  private static buildSettingSpecs(recipe: AestheticRecipe): string {
    const { setting } = recipe.atmosphere;
    const specs = [];
    
    // Environment architecture
    const architecturalElements = setting.environment.architecture.slice(0, 2);
    specs.push(...architecturalElements);
    
    // Key furnishing elements
    const furnishingElements = setting.environment.furnishing.slice(0, 2);
    specs.push(...furnishingElements);
    
    // Props and textures
    if (setting.props.length > 0) {
      specs.push(...setting.props.slice(0, 2));
    }
    
    // Environmental mood
    if (recipe.atmosphere.timeOfDay) {
      specs.push(`${recipe.atmosphere.timeOfDay} setting`);
    }
    
    return specs.join(', ');
  }
  
  /**
   * Build subject specifications
   */
  private static buildSubjectSpecs(look: RecipeLook, userGender?: GenderVariant | null): string {
    const specs = [];
    
    // Energy and expression
    specs.push(`${look.subject.energyLevel} energy`);
    specs.push(`${look.subject.expression} expression`);
    
    // Attire specifications
    const { attire } = look;
    
    // Fabric descriptions
    if (attire.fabrics.length > 0) {
      const fabricDesc = attire.fabrics.slice(0, 2).join(' and ');
      specs.push(`wearing ${fabricDesc}`);
    }
    
    // Color specifications
    if (attire.colors.length > 0) {
      const colorDesc = attire.colors.slice(0, 2).join(' and ');
      specs.push(`in ${colorDesc} tones`);
    }
    
    // Style details
    if (attire.details.length > 0) {
      specs.push(...attire.details.slice(0, 2));
    }
    
    return specs.join(', ');
  }
  
  /**
   * Build pose specifications
   */
  private static buildPoseSpecs(look: RecipeLook): string {
    const specs = [];
    
    // Primary pose
    specs.push(look.pose.primary);
    
    // Props interaction if specified
    if (look.pose.props && look.pose.props.length > 0) {
      const propInteraction = look.pose.props[0];
      specs.push(`interacting with ${propInteraction}`);
    }
    
    return specs.join(', ');
  }
  
  /**
   * Build composition specifications
   */
  private static buildCompositionSpecs(recipe: AestheticRecipe): string {
    const { composition } = recipe;
    const specs = [];
    
    // Framing
    specs.push(`${composition.framing.replace('-', ' ')} shot`);
    
    // Composition style based on recipe aesthetics
    if (recipe.tags.includes('minimalist')) {
      specs.push('clean composition', 'negative space');
    } else if (recipe.tags.includes('dramatic')) {
      specs.push('dynamic composition', 'strong leading lines');
    } else if (recipe.tags.includes('natural')) {
      specs.push('organic composition', 'natural framing');
    }
    
    // Environmental integration
    specs.push('professional composition', 'well-balanced elements');
    
    return specs.join(', ');
  }
  
  /**
   * Generate multiple FLUX variations
   */
  static generateVariations(
    recipe: AestheticRecipe, 
    look: RecipeLook, 
    options: FluxPromptOptions,
    count: number = 3
  ): GeneratedFluxPrompt[] {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      // Vary the elements slightly for each variation
      const variationOptions = {
        ...options,
        customElements: [
          ...options.customElements || [],
          ...(i === 1 ? ['artistic composition'] : []),
          ...(i === 2 ? ['premium quality'] : [])
        ]
      };
      
      const variation = this.generateFluxPrompt(recipe, look, variationOptions);
      variations.push(variation);
    }
    
    return variations;
  }
  
  /**
   * Optimize prompt for specific platforms
   */
  static optimizeForPlatform(
    prompt: GeneratedFluxPrompt,
    platform: 'flux' | 'midjourney' | 'stable-diffusion'
  ): string {
    let optimizedPrompt = prompt.prompt;
    
    switch (platform) {
      case 'midjourney':
        // Midjourney prefers more descriptive, artistic language
        optimizedPrompt = optimizedPrompt
          .replace(/raw photo/g, 'photorealistic')
          .replace(/editorial quality/g, 'high fashion editorial')
          .replace(/professional photography/g, 'award winning photography');
        break;
        
      case 'stable-diffusion':
        // Stable Diffusion works well with technical terms
        optimizedPrompt = optimizedPrompt
          .replace(/sharp focus/g, 'ultra sharp focus')
          .replace(/high resolution/g, '8k resolution')
          .replace(/professional/g, 'masterpiece, professional');
        break;
        
      case 'flux':
      default:
        // FLUX works well with the standard format
        break;
    }
    
    return optimizedPrompt;
  }
  
  /**
   * Validate prompt quality and completeness
   */
  static validatePrompt(prompt: GeneratedFluxPrompt): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings = [];
    const suggestions = [];
    
    // Check for essential components
    if (!prompt.components.trigger) {
      warnings.push('Missing user trigger token');
    }
    
    if (!prompt.components.gender) {
      suggestions.push('Consider adding gender specification for better results');
    }
    
    if (prompt.components.quality.length === 0) {
      suggestions.push('Add quality hints for better image fidelity');
    }
    
    if (!prompt.components.lighting) {
      warnings.push('Missing lighting specification');
    }
    
    if (!prompt.components.setting) {
      warnings.push('Missing setting description');
    }
    
    // Check prompt length
    if (prompt.characterCount > 2000) {
      warnings.push('Prompt may be too long for some platforms');
    } else if (prompt.characterCount < 100) {
      warnings.push('Prompt may be too short for detailed results');
    }
    
    const isValid = warnings.length === 0;
    
    return {
      isValid,
      warnings,
      suggestions
    };
  }
}
