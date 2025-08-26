export type FluxParams = {
  aspect_ratio: string;
  megapixels: string;
  guidance_scale: number;
  num_inference_steps: number;
  lora_scale: number;
  go_fast: boolean;
  num_outputs: number;
};

export type FluxPresetName = "Identity" | "Editorial" | "UltraPrompt" | "Fast";

export const FLUX_PRESETS: Record<FluxPresetName, FluxParams> = {
  Identity:   { aspect_ratio: "3:4", megapixels: "1.5", guidance_scale: 2.6, num_inference_steps: 44, lora_scale: 1.1, go_fast: false, num_outputs: 2 },
  Editorial:  { aspect_ratio: "3:4", megapixels: "1.7", guidance_scale: 2.9, num_inference_steps: 40, lora_scale: 1.0, go_fast: false, num_outputs: 2 },
  UltraPrompt:{ aspect_ratio: "9:16", megapixels: "1.8", guidance_scale: 3.3, num_inference_steps: 48, lora_scale: 0.9, go_fast: false, num_outputs: 2 },
  Fast:       { aspect_ratio: "3:4", megapixels: "1.0", guidance_scale: 2.6, num_inference_steps: 28, lora_scale: 0.8, go_fast: true,  num_outputs: 2 }
};

export const UNIVERSAL_DEFAULT = {
  model: "dev",
  output_format: "png",
  disable_safety_checker: false,
  guidance_scale: 2.9,
  num_inference_steps: 40,
  megapixels: "1.5",
  aspect_ratio: "3:4",
  lora_scale: 1.0,
  go_fast: false,
  num_outputs: 2
};