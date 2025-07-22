// Clean GenerateImageParams interface - restored from Flux corruption
export interface GenerateImageParams {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  lora_scale: number;
  model_id: string;
  aspect_ratio: string;
  user_id?: string;
}