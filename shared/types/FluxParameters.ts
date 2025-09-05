/**
 * FLUX Parameter Type Definitions
 * Defines all FLUX-related parameter interfaces for consistent typing across the system
 */

export interface BASE_QUALITY_SETTINGS {
  guidance_scale: number;
  num_inference_steps: number;
  // REMOVED: lora_scale - packaged models have LoRA built-in
  aspect_ratio: string;
  megapixels: string;
  output_format: string;
  output_quality: number;
}

export interface FluxOptimizationParams {
  closeUpPortrait: {
    guidance_scale: number;
    num_inference_steps: number;
    megapixels: string;
  };
  halfBodyShot: {
    guidance_scale: number;
    num_inference_steps: number;
    megapixels: string;
  };
  fullScenery: {
    guidance_scale: number;
    num_inference_steps: number;
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