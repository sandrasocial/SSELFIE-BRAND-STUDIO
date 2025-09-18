/**
 * Token Budget Utility
 * Smart text trimming that preserves subject/scene content and respects token limits
 */

export interface TokenBudgetOptions {
  maxTokens: number;
  preserveSubject?: boolean;
  preserveScene?: boolean;
  preserveQuality?: boolean;
  minLength?: number;
}

export interface TokenBudgetResult {
  text: string;
  originalTokens: number;
  finalTokens: number;
  trimmed: boolean;
  preservedElements: string[];
}

export class TokenBudgetManager {
  
  // Essential keywords that should be preserved
  private static readonly SUBJECT_KEYWORDS = [
    'woman', 'man', 'person', 'individual', 'subject',
    'wearing', 'dressed', 'expression', 'pose', 'posture',
    'confidence', 'energy', 'presence', 'style', 'attire',
    'sitting', 'standing', 'leaning', 'walking', 'positioned'
  ];
  
  private static readonly SCENE_KEYWORDS = [
    'light', 'lighting', 'illumination', 'glow', 'shadows',
    'environment', 'setting', 'space', 'room', 'location',
    'windows', 'walls', 'architecture', 'furniture', 'interior',
    'atmosphere', 'mood', 'ambiance', 'composition', 'framing',
    'background', 'foreground', 'backdrop', 'scenery'
  ];
  
  private static readonly QUALITY_KEYWORDS = [
    'raw photo', 'editorial quality', 'professional photography',
    'sharp focus', 'film grain', 'visible skin pores', 'high resolution',
    'cinematic', 'dramatic', 'sophisticated', 'elegant', 'luxury'
  ];
  
  /**
   * Apply smart token budget trimming
   */
  static safeTrim(text: string, options: TokenBudgetOptions): TokenBudgetResult {
    const originalTokens = this.estimateTokenCount(text);
    
    if (originalTokens <= options.maxTokens) {
      return {
        text,
        originalTokens,
        finalTokens: originalTokens,
        trimmed: false,
        preservedElements: []
      };
    }
    
    console.log('🔧 Applying smart token budget:', {
      originalTokens,
      maxTokens: options.maxTokens,
      preserveSubject: options.preserveSubject,
      preserveScene: options.preserveScene
    });
    
    const sentences = text.split(/\.\s+/);
    const preservedElements: string[] = [];
    
    // Categorize sentences by importance
    const essentialSentences: string[] = [];
    const importantSentences: string[] = [];
    const optionalSentences: string[] = [];
    
    for (const sentence of sentences) {
      if (this.isEssential(sentence, options)) {
        essentialSentences.push(sentence);
        preservedElements.push(`Essential: ${sentence.substring(0, 50)}...`);
      } else if (this.isImportant(sentence, options)) {
        importantSentences.push(sentence);
      } else {
        optionalSentences.push(sentence);
      }
    }
    
    // Build result prioritizing essential content
    let result = this.buildWithinBudget(
      essentialSentences,
      importantSentences,
      optionalSentences,
      options
    );
    
    // Ensure minimum length if specified
    if (options.minLength && result.length < options.minLength) {
      // Add back content up to minimum length
      const remainingContent = [...importantSentences, ...optionalSentences];
      for (const sentence of remainingContent) {
        const testResult = result + (result ? '. ' : '') + sentence;
        if (testResult.length <= options.minLength * 1.5) { // Allow some flexibility
          result = testResult;
        } else {
          break;
        }
      }
    }
    
    const finalTokens = this.estimateTokenCount(result);
    
    return {
      text: result + (result.endsWith('.') ? '' : '.'),
      originalTokens,
      finalTokens,
      trimmed: true,
      preservedElements
    };
  }
  
  /**
   * Check if sentence is essential and must be preserved
   */
  private static isEssential(sentence: string, options: TokenBudgetOptions): boolean {
    const lowerSentence = sentence.toLowerCase();
    
    // Always preserve very short sentences (likely important)
    if (sentence.length < 50) {
      return true;
    }
    
    // Subject-essential content
    if (options.preserveSubject) {
      const subjectMatches = this.SUBJECT_KEYWORDS.filter(keyword => 
        lowerSentence.includes(keyword)
      ).length;
      if (subjectMatches >= 2) return true;
    }
    
    // Scene-essential content
    if (options.preserveScene) {
      const sceneMatches = this.SCENE_KEYWORDS.filter(keyword => 
        lowerSentence.includes(keyword)
      ).length;
      if (sceneMatches >= 2) return true;
    }
    
    // Quality-essential content
    if (options.preserveQuality) {
      const qualityMatches = this.QUALITY_KEYWORDS.filter(keyword => 
        lowerSentence.includes(keyword)
      ).length;
      if (qualityMatches >= 1) return true;
    }
    
    return false;
  }
  
  /**
   * Check if sentence is important (second priority)
   */
  private static isImportant(sentence: string, options: TokenBudgetOptions): boolean {
    const lowerSentence = sentence.toLowerCase();
    
    // Contains any essential keywords
    if (options.preserveSubject && this.containsAnyKeyword(lowerSentence, this.SUBJECT_KEYWORDS)) {
      return true;
    }
    
    if (options.preserveScene && this.containsAnyKeyword(lowerSentence, this.SCENE_KEYWORDS)) {
      return true;
    }
    
    if (options.preserveQuality && this.containsAnyKeyword(lowerSentence, this.QUALITY_KEYWORDS)) {
      return true;
    }
    
    // Sentences with rich descriptive content
    if (this.hasRichDescriptors(lowerSentence)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Build text within token budget, prioritizing important content
   */
  private static buildWithinBudget(
    essential: string[],
    important: string[],
    optional: string[],
    options: TokenBudgetOptions
  ): string {
    let result = essential.join('. ');
    let currentTokens = this.estimateTokenCount(result);
    
    // Add important sentences if budget allows
    for (const sentence of important) {
      const testText = result + (result ? '. ' : '') + sentence;
      const testTokens = this.estimateTokenCount(testText);
      
      if (testTokens <= options.maxTokens) {
        result = testText;
        currentTokens = testTokens;
      } else {
        break;
      }
    }
    
    // Add optional sentences if budget allows
    for (const sentence of optional) {
      const testText = result + (result ? '. ' : '') + sentence;
      const testTokens = this.estimateTokenCount(testText);
      
      if (testTokens <= options.maxTokens) {
        result = testText;
        currentTokens = testTokens;
      } else {
        break;
      }
    }
    
    return result;
  }
  
  /**
   * Check if text contains any of the specified keywords
   */
  private static containsAnyKeyword(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }
  
  /**
   * Check if sentence has rich descriptive content
   */
  private static hasRichDescriptors(text: string): boolean {
    const descriptiveWords = [
      'flowing', 'elegant', 'sophisticated', 'dramatic', 'natural',
      'beautiful', 'stunning', 'gorgeous', 'magnificent', 'luxurious',
      'texture', 'fabric', 'material', 'surface', 'detail',
      'atmosphere', 'ambiance', 'feeling', 'emotion', 'energy'
    ];
    
    const matches = descriptiveWords.filter(word => text.includes(word)).length;
    return matches >= 2;
  }
  
  /**
   * Estimate token count (rough approximation: ~0.75 tokens per word)
   */
  static estimateTokenCount(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * 0.75);
  }
  
  /**
   * Quick trim for common use cases
   */
  static quickTrim(text: string, maxTokens: number): string {
    const result = this.safeTrim(text, {
      maxTokens,
      preserveSubject: true,
      preserveScene: true,
      preserveQuality: true
    });
    
    return result.text;
  }
  
  /**
   * Smart truncation for UI display (preserves readability)
   */
  static smartDisplay(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    
    // Find the last complete sentence within the limit
    const sentences = text.split(/\.\s+/);
    let result = '';
    
    for (const sentence of sentences) {
      const testResult = result + (result ? '. ' : '') + sentence + '.';
      if (testResult.length <= maxChars) {
        result = testResult;
      } else {
        break;
      }
    }
    
    // If no complete sentences fit, truncate at word boundary
    if (!result && maxChars > 20) {
      const words = text.split(' ');
      let wordResult = '';
      
      for (const word of words) {
        const testResult = wordResult + (wordResult ? ' ' : '') + word;
        if (testResult.length <= maxChars - 3) {
          wordResult = testResult;
        } else {
          break;
        }
      }
      
      result = wordResult + '...';
    }
    
    return result || text.substring(0, Math.max(0, maxChars - 3)) + '...';
  }
  
  /**
   * Validate token budget configuration
   */
  static validateBudgetOptions(options: TokenBudgetOptions): string[] {
    const errors: string[] = [];
    
    if (options.maxTokens < 10) {
      errors.push('maxTokens too low for meaningful content');
    }
    
    if (options.minLength && options.minLength > options.maxTokens * 4) {
      errors.push('minLength incompatible with maxTokens');
    }
    
    return errors;
  }
}
