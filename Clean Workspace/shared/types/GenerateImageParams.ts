// Clean GenerateImageParams interface - supports both packaged and extracted LoRA
export interface GenerateImageParams {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  lora_scale?: number; // ✅ RESTORED: For extracted LoRA weights (1.1 default)
  model_id: string;
  aspect_ratio: string;
  user_id?: string;
  lora_weights?: string; // ✅ RESTORED: URL to extracted .safetensors file
}