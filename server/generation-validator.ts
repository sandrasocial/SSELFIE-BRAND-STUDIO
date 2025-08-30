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
  
  console.log('🎯 MAYA CONVERSATION EXTRACTION: Advanced cleaning with duplicate detection');
  
  // PHASE 1: REMOVE MAYA'S CONVERSATIONAL LEAD-INS
  // Remove Maya's energy/concept introduction phrases that contaminate prompts
  cleaned = cleaned
    // Remove Maya's concept energy introductions (major issue from research)
    .replace(/^[^.!?]*(?:major|MAJOR)\s+[""'][^""']*[""']\s+energy[^.!?]*[.!?]/gi, '')
    .replace(/^[^.!?]*(?:let me create something|I'm creating something)[^.!?]*[.!?]/gi, '')
    .replace(/^[^.!?]*(?:that shows your|showing your)[^.!?]*[.!?]/gi, '')
    
    // Remove conversational asterisk content - complete Maya responses
    .replace(/\*[^*]*\*/g, '')
    
    // Remove Maya's excited openings and personality responses
    .replace(/^[^.!?]*(?:Oh honey|honey|babe|love|girl|gorgeous|stunning|incredible|amazing|perfect|absolutely|trust me|chef's kiss|I'm getting|getting major|giving me|energy from|is giving|something that shows)[^.!?]*[.!?]/gi, '')
    .replace(/[.!?]\s*(?:your empire-building era|this look says|you're ready to|and this look|ready to own)[^.!?]*[.!?]?$/gi, '.')
    
    // Remove Maya's style commentary that creates prompt contamination
    .replace(/(?:OMG|omg|Yes|YES|Amazing|AMAZING|Perfect|PERFECT|Stunning|STUNNING|Incredible|INCREDIBLE)!?\s*/gi, '')
    .replace(/(?:this is giving me|I'm obsessing over|I can already see|we're talking about|I'm about to style|let me create)/gi, '')
    
    // Remove split image trigger language
    .replace(/(?:transformation|before and after|split|diptych|side.by.side|comparison|vs\.|versus)/gi, '')
    .replace(/(?:from .+ to .+|evolution from|journey from|transition from)/gi, '')
    
    // Remove formatting artifacts
    .replace(/\*\*[^*]+\*\*/g, '') 
    .replace(/#{1,6}\s+/g, '') 
    .replace(/[-•]\s+/g, '') 
    .replace(/^\s*[\-\*]\s+/gm, '') 
    .replace(/\n\s*\n/g, ' ') 
    .replace(/\s+/g, ' ') 
    .replace(/^[\s,]+|[\s,]+$/g, '') 
    .replace(/,\s*,+/g, ', ')
    .trim();

  console.log(`🔍 BEFORE CLEANING: ${prompt.substring(0, 150)}...`);
  console.log(`✅ AFTER CLEANING: ${cleaned.substring(0, 150)}...`);

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