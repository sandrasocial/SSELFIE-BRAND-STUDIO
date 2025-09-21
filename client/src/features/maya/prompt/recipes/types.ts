/**
 * Aesthetic Recipes System - Type Definitions
 * Structured system for generating rich, detailed prompts based on aesthetic recipes
 */

export interface AestheticRecipe {
  id: string;
  name: string;
  description: string;
  tags: string[];
  styleKey?: string; // Maps to UI style selection (e.g., 'scandinavian-minimalist')
  
  // Gender-specific variations
  femaleLook?: RecipeLook;
  maleLook?: RecipeLook;
  nonbinaryLook?: RecipeLook;
  
  // Common elements across all looks
  atmosphere: AtmosphereDetails;
  lighting: LightingSpec;
  composition: CompositionDetails;
  qualityHints: string[];
  negativePrompts?: string[];
}

export interface RecipeLook {
  // Subject and styling
  subject: SubjectDetails;
  attire: AttireSpec;
  pose: PoseVariations;
  
  // Prose generation elements
  proseElements: ProseElements;
}

export interface SubjectDetails {
  ageRange?: string;
  bodyType?: string;
  energyLevel: string; // 'calm', 'dynamic', 'confident', 'contemplative'
  expression: string; // 'serene', 'focused', 'warm', 'mysterious'
}

export interface AttireSpec {
  category: string; // 'business', 'casual-luxury', 'artistic', 'minimalist'
  fabrics: string[]; // ['cashmere', 'silk', 'wool', 'linen']
  colors: string[]; // ['neutral', 'monochrome', 'earth-tones']
  details: string[]; // ['tailored fit', 'flowing silhouette', 'structured shoulders']
}

export interface PoseVariations {
  primary: string; // Main pose description
  alternatives: string[]; // Alternative poses for variation
  props?: string[]; // Optional props to interact with
}

export interface AtmosphereDetails {
  setting: SettingSpec;
  mood: string;
  season?: string;
  timeOfDay?: string;
  weatherElements?: string[];
}

export interface SettingSpec {
  location: string; // 'italian-cafe', 'minimalist-studio', 'coastal-home'
  environment: EnvironmentDetails;
  props: string[];
  textures: string[];
}

export interface EnvironmentDetails {
  architecture: string[]; // ['floor-to-ceiling windows', 'exposed brick', 'marble surfaces']
  furnishing: string[]; // ['vintage leather chair', 'modern glass desk', 'persian rug']
  decorative: string[]; // ['fresh flowers', 'art books', 'sculptural objects']
}

export interface LightingSpec {
  source: string; // 'natural', 'studio', 'mixed'
  quality: string; // 'soft', 'dramatic', 'bright', 'moody'
  direction: string; // 'side-lit', 'backlit', 'overhead', 'diffused'
  specifics: string[]; // ['golden hour streaming', 'soft shadows', 'warm highlights']
}

export interface CompositionDetails {
  framing: string; // 'half-body', 'full-body', 'close-up', 'environmental'
  cameraAngle: string; // 'eye-level', 'slightly-above', 'low-angle'
  lensType?: string; // '85mm portrait', '35mm environmental', '50mm natural'
  depthOfField: string; // 'shallow', 'medium', 'deep'
}

export interface ProseElements {
  // Elements for rich prose generation (150-300 words)
  settingNarratives: string[]; // Descriptive setting elements
  characterNarratives: string[]; // Subject description elements  
  atmosphereNarratives: string[]; // Mood and feeling elements
  sensoryDetails: string[]; // Touch, sound, scent elements
  storyMoments: string[]; // Action or moment descriptions
}

export interface PromptBuildRequest {
  styleKey?: string;
  userGender: 'woman' | 'man' | 'non-binary' | null;
  userTriggerToken: string;
  userIntent: string; // What the user is looking for
  maxLength?: number; // Token budget
}

export interface GeneratedPrompt {
  prose: string; // Rich 150-300 word description
  fluxPrompt: string; // Technical FLUX format
  recipe: AestheticRecipe; // Recipe used
  metadata: {
    wordCount: number;
    tokenCount: number;
    genderApplied: string | null;
    styleMatched: string | null;
  };
}

export type GenderVariant = 'woman' | 'man' | 'non-binary';
