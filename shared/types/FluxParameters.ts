/**
 * FLUX Parameter Type Definitions
 * Defines all FLUX-related parameter interfaces for consistent typing across the system
 */

export interface BASE_QUALITY_SETTINGS {
  guidance_scale: number;
  num_inference_steps: number;
  lora_scale: number; // RESTORED: Essential for LoRA model personalization
  aspect_ratio: string;
  megapixels: string;
  output_format: string;
  output_quality: number;
}

// ✅ MAYA PURE INTELLIGENCE: No hardcoded defaults - Maya controls all parameters
// These will be determined by Maya's AI intelligence for each generation
export const MAYA_DEFAULT_QUALITY_SETTINGS: BASE_QUALITY_SETTINGS = {
  guidance_scale: 5, // Maya will override
  num_inference_steps: 50, // Maya will override
  lora_scale: 1.0, // CRITICAL: Full LoRA strength for personalization
  aspect_ratio: "4:5", // Maya will override
  megapixels: "1",
  output_format: "png",
  output_quality: 95,
};

export interface FluxOptimizationParams {
  closeUpPortrait: {
    guidance_scale: number;
    num_inference_steps: number;
    lora_scale: number;
    megapixels: string;
  };
  halfBodyShot: {
    guidance_scale: number;
    num_inference_steps: number;
    lora_scale: number;
    megapixels: string;
  };
  fullScenery: {
    guidance_scale: number;
    num_inference_steps: number;
    lora_scale: number;
    megapixels: string;
  };
}

/**
 * Shot type detection for automatic parameter selection
 */
export type ShotType = 'closeUpPortrait' | 'halfBodyShot' | 'fullScenery';

/**
 * Model generation paths - packaged models only
 */
export type GenerationPath = 'packaged'; // REMOVED: 'base_flux_lora' - only packaged models supported