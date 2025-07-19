// client/src/services/imageGeneration.ts - Enhanced for model-specific generation
interface GenerateImageParams {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  lora_scale: number;
  model_id: string;
  aspect_ratio: string;
  user_id?: string;
}

export async function generateImage(params: GenerateImageParams) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        // Flux-specific optimizations
        scheduler: "DPMSolverMultistepScheduler",
        safety_tolerance: 2,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

export type { GenerateImageParams };