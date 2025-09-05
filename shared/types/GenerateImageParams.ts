// Clean GenerateImageParams interface - packaged models only
export interface GenerateImageParams {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  // REMOVED: lora_scale - packaged models have LoRA built-in
  model_id: string;
  aspect_ratio: string;
  user_id?: string;
}