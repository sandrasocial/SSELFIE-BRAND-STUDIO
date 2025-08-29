// Maya Generation Validator - Ensure FLUX 1.1 Pro Optimal Performance
// This validator ensures Maya's intelligent prompts are properly formatted for FLUX generation

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  wordCount: number;
  hasValidTriggerWord: boolean;
}

export interface PromptValidationOptions {
  triggerWord: string;
  targetWordCount?: { min: number; max: number };
  requiredElements?: string[];
  forbiddenElements?: string[];
}

/**
 * Validates Maya's generated prompts for optimal FLUX 1.1 Pro performance
 */
export function validateMayaPrompt(
  prompt: string, 
  options: PromptValidationOptions
): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Word count analysis (2025 research-optimal range)
  const wordCount = prompt.split(/\s+/).filter(word => word.length > 0).length;
  const targetRange = options.targetWordCount || { min: 100, max: 300 };
  
  if (wordCount < targetRange.min) {
    issues.push(`Prompt too short: ${wordCount} words (optimal: ${targetRange.min}-${targetRange.max})`);
    suggestions.push('Add more specific physical details, camera settings, or environmental description');
  } else if (wordCount > targetRange.max) {
    issues.push(`Prompt too long: ${wordCount} words (optimal: ${targetRange.min}-${targetRange.max})`);
    suggestions.push('Condense description while preserving core styling intelligence');
  }
  
  // Trigger word validation
  const triggerWordMatches = prompt.match(new RegExp(options.triggerWord, 'gi'));
  const triggerWordCount = triggerWordMatches?.length || 0;
  const hasValidTriggerWord = triggerWordCount === 1;
  
  if (triggerWordCount === 0) {
    issues.push(`Missing trigger word: "${options.triggerWord}"`);
    suggestions.push('Ensure trigger word appears exactly once at the start of the prompt');
  } else if (triggerWordCount > 1) {
    issues.push(`Duplicate trigger word: "${options.triggerWord}" appears ${triggerWordCount} times`);
    suggestions.push('Remove duplicate instances of trigger word');
  }
  
  // Required elements validation
  if (options.requiredElements) {
    for (const element of options.requiredElements) {
      if (!prompt.toLowerCase().includes(element.toLowerCase())) {
        issues.push(`Missing required element: "${element}"`);
        suggestions.push(`Add "${element}" to improve FLUX generation quality`);
      }
    }
  }
  
  // Forbidden elements validation
  if (options.forbiddenElements) {
    for (const element of options.forbiddenElements) {
      if (prompt.toLowerCase().includes(element.toLowerCase())) {
        issues.push(`Contains forbidden element: "${element}"`);
        suggestions.push(`Remove "${element}" - may interfere with FLUX generation`);
      }
    }
  }
  
  // Technical quality checks
  const technicalElements = [
    'camera', 'lens', 'aperture', 'lighting', 'photography'
  ];
  const hasTechnicalSpecs = technicalElements.some(element => 
    prompt.toLowerCase().includes(element)
  );
  
  if (!hasTechnicalSpecs) {
    issues.push('Missing technical photography specifications');
    suggestions.push('Add camera model, lens specs, aperture, or lighting details');
  }
  
  // Style contamination check
  const conversationalMarkers = ['**', '#', '- ', '• ', 'Maya', 'styling', 'intelligence'];
  const hasConversationalMarkers = conversationalMarkers.some(marker => 
    prompt.includes(marker)
  );
  
  if (hasConversationalMarkers) {
    issues.push('Contains conversational or formatting markers');
    suggestions.push('Clean prompt to remove conversation-style formatting');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    wordCount,
    hasValidTriggerWord
  };
}

/**
 * Enhanced prompt cleaning specifically for Maya's conversation-to-technical conversion
 */
export function cleanMayaPrompt(prompt: string): string {
  return prompt
    // Remove conversation markers that contaminate FLUX
    .replace(/\*\*[^*]+\*\*/g, '') // Remove **SECTION:** markers
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers  
    .replace(/[-•]\s+/g, '') // Remove bullet points
    .replace(/^\s*[\-\*]\s+/gm, '') // Remove line-starting bullets
    .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
    .replace(/\s+/g, ' ') // Normalize spaces
    
    // Remove conversation phrases that Maya might include
    .replace(/(?:let me create|i'm creating|here's|this is|perfect|gorgeous|stunning)/gi, '')
    .replace(/(?:trust me|chef's kiss|absolutely|incredible)/gi, '')
    .replace(/(?:generating|concept|image)/gi, '')
    
    // Enhanced cleaning for better FLUX compatibility
    .replace(/(?:maya.styled|maya.designed|maya.expert)/gi, '') // Remove Maya self-references
    .replace(/(?:intelligence|expertise|approach)/gi, '') // Remove meta-styling terms
    .replace(/(?:vision|styling)/gi, '') // Remove styling meta-language
    
    // Clean up any remaining artifacts
    .replace(/^[\s,]+/, '') // Remove leading spaces/commas
    .replace(/[\s,]+$/, '') // Remove trailing spaces/commas
    .replace(/,\s*,/g, ', ') // Fix double commas
    .trim();
}

/**
 * FLUX 1.1 Pro optimal quality tags for professional photography
 */
export const FLUX_QUALITY_TAGS = [
  'raw photo',
  'visible skin pores', 
  'film grain',
  'unretouched natural skin texture',
  'subsurface scattering',
  'photographed on film',
  'professional photography',
  'sharp focus on eyes',
  'detailed facial features',
  'photorealistic',
  'high resolution',
  'DSLR quality'
];

/**
 * Camera specifications optimized for different shot types
 */
export const CAMERA_SPECS = {
  closeUp: 'Canon EOS R5, 85mm f/1.4 lens, f/2.8 aperture, shallow depth of field, focus on eyes',
  halfBody: 'Sony A7R V, 50mm f/1.2 lens, f/2.8 aperture, natural perspective, balanced composition',
  fullBody: 'Canon EOS R5, 35mm f/1.8 lens, f/4 aperture, full scene coverage, environmental context'
};