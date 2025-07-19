export interface UserParameters {
  // FLUX Generation Parameters
  guidance: number;           // 2.5-3.2 range for natural to dramatic
  inferenceSteps: number;     // 28-50 range for speed vs quality
  loraScale: number;          // 0.7-1.0 range for personalization strength
  outputQuality: number;      // 75-98 range for file quality
  
  // User Analysis Data (Phase 2)
  skinTone?: 'light' | 'medium' | 'dark';
  hairTexture?: 'straight' | 'wavy' | 'curly';
  facialStructure?: 'oval' | 'round' | 'square';
  preferredLighting?: 'natural' | 'dramatic' | 'soft';
  
  // Quality Learning (Phase 3)
  successRate?: number;       // 0-1 based on generation history
  optimizationLevel?: 'basic' | 'adaptive' | 'advanced';
}

// Example usage for optimization service
export class MayaOptimizationService {
  async generateOptimizedImage(prompt: string, userParams: UserParameters): Promise<string> {
    console.log("Using optimized parameters:", userParams);
    return "optimized-image-url";
  }
}