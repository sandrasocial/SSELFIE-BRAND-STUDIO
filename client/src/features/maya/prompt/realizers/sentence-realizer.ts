/**
 * Sentence Realizer
 * Builds rich, flowing prose descriptions (150-300 words) from aesthetic recipes
 */

import { AestheticRecipe, RecipeLook, GenderVariant } from '../recipes/types';

export interface ProseGenerationOptions {
  targetWordCount?: number;
  includeAtmosphere?: boolean;
  includeSensoryDetails?: boolean;
  includeStoryMoments?: boolean;
  userGender?: GenderVariant | null;
  customElements?: string[];
}

export interface GeneratedProse {
  text: string;
  wordCount: number;
  elements: {
    setting: string[];
    character: string[];
    atmosphere: string[];
    sensory: string[];
    story: string[];
  };
}

export class SentenceRealizer {
  
  /**
   * Generate rich prose from recipe and look
   */
  static generateProse(
    recipe: AestheticRecipe, 
    look: RecipeLook, 
    options: ProseGenerationOptions = {}
  ): GeneratedProse {
    const {
      targetWordCount = 200,
      includeAtmosphere = true,
      includeSensoryDetails = true,
      includeStoryMoments = true,
      userGender,
      customElements = []
    } = options;
    
    console.log('📝 Generating prose for:', recipe.name, 'Target words:', targetWordCount);
    
    const elements = {
      setting: [],
      character: [],
      atmosphere: [],
      sensory: [],
      story: []
    };
    
    // Build prose elements
    const sentences = [];
    
    // Opening: Setting and character introduction (35-50 words)
    const settingElement = this.selectRandomElement(look.proseElements.settingNarratives);
    const characterElement = this.selectRandomElement(look.proseElements.characterNarratives);
    
    if (settingElement && characterElement) {
      const openingSentence = `${this.capitalizeFirst(settingElement)}, ${characterElement.toLowerCase()}.`;
      sentences.push(openingSentence);
      elements.setting.push(settingElement);
      elements.character.push(characterElement);
    }
    
    // Character details and atmosphere (40-60 words)
    if (includeAtmosphere) {
      const atmosphereElement = this.selectRandomElement(look.proseElements.atmosphereNarratives);
      if (atmosphereElement) {
        const atmosphereSentence = `${this.capitalizeFirst(atmosphereElement)}, while the ${recipe.atmosphere.mood} perfectly complements the ${recipe.atmosphere.setting.location.replace(/-/g, ' ')} setting.`;
        sentences.push(atmosphereSentence);
        elements.atmosphere.push(atmosphereElement);
      }
    }
    
    // Detailed scene description (50-80 words)
    const sceneElements = this.buildSceneDescription(recipe, look, userGender);
    if (sceneElements.length > 0) {
      sentences.push(...sceneElements);
      elements.setting.push(...sceneElements);
    }
    
    // Sensory and story moments (40-70 words)
    if (includeSensoryDetails && includeStoryMoments) {
      const experientialElements = this.buildExperientialDescription(look);
      if (experientialElements.length > 0) {
        sentences.push(...experientialElements);
        elements.sensory.push(...experientialElements.filter(e => e.includes('feel') || e.includes('sound') || e.includes('scent')));
        elements.story.push(...experientialElements.filter(e => !elements.sensory.includes(e)));
      }
    }
    
    // Add custom elements if provided
    if (customElements.length > 0) {
      const customSentences = customElements.map(element => 
        this.capitalizeFirst(element) + (element.endsWith('.') ? '' : '.')
      );
      sentences.push(...customSentences);
    }
    
    // Combine and refine
    let proseText = sentences.join(' ');
    
    // Apply gender-appropriate language
    if (userGender) {
      proseText = this.applyGenderLanguage(proseText, userGender);
    }
    
    // Ensure target word count
    proseText = this.adjustWordCount(proseText, targetWordCount);
    
    const wordCount = proseText.split(/\s+/).length;
    
    console.log('✅ Generated prose:', { wordCount, targetWordCount });
    
    return {
      text: proseText,
      wordCount,
      elements
    };
  }
  
  /**
   * Build detailed scene description
   */
  private static buildSceneDescription(recipe: AestheticRecipe, look: RecipeLook, userGender?: GenderVariant | null): string[] {
    const sentences = [];
    
    // Environment details
    const { environment } = recipe.atmosphere.setting;
    const architecturalElement = this.selectRandomElement(environment.architecture);
    const furnishingElement = this.selectRandomElement(environment.furnishing);
    
    if (architecturalElement && furnishingElement) {
      const sceneSentence = `The space features ${architecturalElement.toLowerCase()} and ${furnishingElement.toLowerCase()}, creating an environment of sophisticated elegance.`;
      sentences.push(sceneSentence);
    }
    
    // Lighting description
    const lightingDescription = `${this.capitalizeFirst(recipe.lighting.specifics[0] || 'natural light')} ${recipe.lighting.quality === 'dramatic' ? 'creates striking contrasts' : 'bathes everything in a gentle glow'}, ${recipe.lighting.direction === 'directional' ? 'casting purposeful shadows' : 'providing even illumination'} that enhances every detail.`;
    sentences.push(lightingDescription);
    
    // Props and textures
    const props = recipe.atmosphere.setting.props.slice(0, 2);
    const textures = recipe.atmosphere.setting.textures.slice(0, 2);
    
    if (props.length > 0 && textures.length > 0) {
      const detailSentence = `Carefully chosen elements like ${props.join(' and ')} add authentic touches, while ${textures.join(' and ')} provide rich tactile interest throughout the composition.`;
      sentences.push(detailSentence);
    }
    
    return sentences;
  }
  
  /**
   * Build experiential description (sensory and story elements)
   */
  private static buildExperientialDescription(look: RecipeLook): string[] {
    const sentences = [];
    
    // Sensory details
    const sensoryElement = this.selectRandomElement(look.proseElements.sensoryDetails);
    if (sensoryElement) {
      const sensorySentence = `${this.capitalizeFirst(sensoryElement)} adds to the immersive quality of the scene.`;
      sentences.push(sensorySentence);
    }
    
    // Story moments
    const storyElement = this.selectRandomElement(look.proseElements.storyMoments);
    if (storyElement) {
      const storySentence = `The composition captures a perfect moment of ${storyElement.toLowerCase()}, creating a narrative that feels both spontaneous and intentional.`;
      sentences.push(storySentence);
    }
    
    // Pose and expression
    const poseDescription = `${this.capitalizeFirst(look.pose.primary)} while maintaining ${look.subject.expression} expression, embodying ${look.subject.energyLevel} energy.`;
    sentences.push(poseDescription);
    
    return sentences;
  }
  
  /**
   * Apply gender-appropriate pronouns and language
   */
  private static applyGenderLanguage(text: string, gender: GenderVariant): string {
    switch (gender) {
      case 'woman':
        return text
          .replace(/\bthey\b/gi, 'she')
          .replace(/\btheir\b/gi, 'her')
          .replace(/\bthem\b/gi, 'her')
          .replace(/\bperson\b/gi, 'woman')
          .replace(/\bindividual\b/gi, 'woman');
          
      case 'man':
        return text
          .replace(/\bthey\b/gi, 'he')
          .replace(/\btheir\b/gi, 'his')
          .replace(/\bthem\b/gi, 'him')
          .replace(/\bperson\b/gi, 'man')
          .replace(/\bindividual\b/gi, 'man');
          
      case 'non-binary':
        return text
          .replace(/\bshe\b/gi, 'they')
          .replace(/\bhe\b/gi, 'they')
          .replace(/\bher\b/gi, 'their')
          .replace(/\bhis\b/gi, 'their')
          .replace(/\bhim\b/gi, 'them')
          .replace(/\b(wo)?man\b/gi, 'person');
          
      default:
        return text;
    }
  }
  
  /**
   * Adjust text to target word count
   */
  private static adjustWordCount(text: string, targetWordCount: number): string {
    const words = text.split(/\s+/);
    const currentWordCount = words.length;
    
    if (currentWordCount < targetWordCount * 0.75) {
      // Too short - add descriptive elements
      const expandedText = this.expandDescription(text);
      return expandedText;
    } else if (currentWordCount > targetWordCount * 1.25) {
      // Too long - trim while preserving meaning
      return this.trimDescription(text, targetWordCount);
    }
    
    return text; // Within acceptable range
  }
  
  /**
   * Expand description with additional details
   */
  private static expandDescription(text: string): string {
    // Add transitional phrases and additional descriptors
    return text
      .replace(/\. ([A-Z])/g, '. Meanwhile, $1')
      .replace(/creating/g, 'masterfully creating')
      .replace(/light/g, 'beautiful light')
      .replace(/space/g, 'carefully curated space')
      .replace(/while/g, 'gracefully while')
      .replace(/with/g, 'thoughtfully with');
  }
  
  /**
   * Trim description while preserving key elements
   */
  private static trimDescription(text: string, targetWordCount: number): string {
    const sentences = text.split(/\.\s+/);
    let result = '';
    let wordCount = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.split(/\s+/).length;
      if (wordCount + sentenceWords <= targetWordCount) {
        result += (result ? '. ' : '') + sentence;
        wordCount += sentenceWords;
      } else {
        break;
      }
    }
    
    return result + (result.endsWith('.') ? '' : '.');
  }
  
  /**
   * Select random element from array
   */
  private static selectRandomElement<T>(array: T[]): T | null {
    return array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;
  }
  
  /**
   * Capitalize first letter of string
   */
  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  /**
   * Generate multiple prose variations
   */
  static generateVariations(
    recipe: AestheticRecipe, 
    look: RecipeLook, 
    count: number = 3,
    options: ProseGenerationOptions = {}
  ): GeneratedProse[] {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variation = this.generateProse(recipe, look, {
        ...options,
        targetWordCount: (options.targetWordCount || 200) + (i * 20) // Vary length slightly
      });
      variations.push(variation);
    }
    
    return variations;
  }
}
