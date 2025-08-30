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
  let cleaned = prompt;
  
  console.log('🎯 MAYA STYLING PRESERVATION: Minimal cleaning to preserve styling intelligence');
  
  // MINIMAL CLEANING: Only remove obvious conversational markers while preserving ALL styling content
  cleaned = cleaned
    // Remove ONLY explicit Maya chat markers - preserve styling descriptions
    .replace(/\*adjusts.*?\*/gi, '') // Remove Maya's action descriptions like "*adjusts blazer*"
    .replace(/\*[^*]*love[^*]*\*/gi, '') // Remove expressions like "*chef's kiss*"
    .replace(/\*[^*]*excited[^*]*\*/gi, '') // Remove excitement expressions
    
    // Remove ONLY pure conversational openings - preserve styling adjectives
    .replace(/^(?:Oh honey,?\s*|Hey babe,?\s*|Girl,?\s*|Trust me,?\s*)/gi, '')
    .replace(/^(?:I'm getting|I can see|This is giving me)\s+/gi, '')
    
    // CRITICAL FIX: DO NOT remove concept card content - only remove empty title lines
    // Keep Maya's styling intelligence intact
    
    // Remove transformation language that triggers split images
    .replace(/(?:transformation|before and after|split|diptych|side.by.side|comparison)/gi, '')
    
    // Basic cleanup - preserve styling content
    .replace(/\n\s*\n/g, ' ') // Multiple line breaks to single space
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim();

  // CRITICAL: If cleaning removed too much content (>80%), return original to preserve Maya's styling
  if (cleaned.length < prompt.length * 0.2) {
    console.log('⚠️ MAYA STYLING RECOVERY: Cleaning removed too much content, using original');
    cleaned = prompt.trim(); // Keep original content, Maya's styling is precious
  }

  console.log(`🔍 BEFORE CLEANING: ${prompt.substring(0, 200)}...`);
  console.log(`✅ AFTER CLEANING: ${cleaned.substring(0, 200)}...`);

  return cleaned;
}

/**
 * RESEARCH-BACKED: Detect if prompt already contains technical quality tags to prevent duplication
 */
export function hasTechnicalPrefix(prompt: string): boolean {
  const technicalIndicators = [
    'raw photo', 'visible skin pores', 'film grain', 'unretouched natural skin texture',
    'subsurface scattering', 'photographed on film', 'professional photography',
    'Canon EOS', 'Sony A7', 'Nikon Z', 'shot with', 'captured with'
  ];
  
  return technicalIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * RESEARCH-BACKED: Add essential anatomy keywords for FLUX 1.1 Pro hand quality
 */
export function addAnatomyKeywords(prompt: string): string {
  // Check if anatomy keywords already present
  const hasAnatomyKeywords = /(?:beautiful hands|detailed fingers|anatomically correct|natural hand positioning)/i.test(prompt);
  
  if (!hasAnatomyKeywords) {
    // Add research-backed anatomy keywords early in prompt for FLUX optimization
    return `beautiful hands, detailed fingers, anatomically correct, ${prompt}`;
  }
  
  return prompt;
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