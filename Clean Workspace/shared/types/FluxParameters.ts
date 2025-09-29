/**
 * FLUX Parameter Type Definitions
 * Defines all FLUX-related parameter interfaces for consistent typing across the system
 */

export interface BASE_QUALITY_SETTINGS {
  guidance_scale: number;
  num_inference_steps: number;
  aspect_ratio: string;
  megapixels: string;
  output_format: string;
  output_quality: number;
  lora_scale?: number; // ✅ RESTORED: For extracted LoRA weights
}

// ✅ MAYA PURE INTELLIGENCE: No hardcoded defaults - Maya controls all parameters
// These will be determined by Maya's AI intelligence for each generation
export const MAYA_DEFAULT_QUALITY_SETTINGS: BASE_QUALITY_SETTINGS = {
  guidance_scale: 5, // Maya will override
  num_inference_steps: 50, // Maya will override
  aspect_ratio: "4:5", // Maya will override
  megapixels: "1",
  output_format: "png",
  output_quality: 95,
};

export interface FluxOptimizationParams {
  closeUpPortrait: {
    guidance_scale: number;
    num_inference_steps: number;
    megapixels: string;
    lora_scale?: number; // ✅ RESTORED: For extracted LoRA weights
  };
  halfBodyShot: {
    guidance_scale: number;
    num_inference_steps: number;
    megapixels: string;
    lora_scale?: number; // ✅ RESTORED: For extracted LoRA weights
  };
  fullScenery: {
    guidance_scale: number;
    num_inference_steps: number;
    megapixels: string;
    lora_scale?: number; // ✅ RESTORED: For extracted LoRA weights
  };
}

/**
 * Shot type detection for automatic parameter selection
 */
export type ShotType = 'closeUpPortrait' | 'halfBodyShot' | 'fullScenery';

/**
 * Model generation paths - both packaged and extracted LoRA
 */
export type GenerationPath = 'packaged' | 'base_flux_lora'; // ✅ RESTORED: Extracted LoRA weights support