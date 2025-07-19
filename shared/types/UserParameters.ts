export interface UserParameters {
  // FLUX Generation Parameters
  guidance: number;           // 2.5-3.2 range for natural to dramatic
  inferenceSteps: number;     // 28-50 range for speed vs quality
  loraScale: number;          // 0.7-1.0 range for personalization strength
  outputQuality: number;      // 75-98 range for file quality
  
  // Phase 2: User Analysis Data
  skinTone?: 'light' | 'medium' | 'dark' | 'fair' | 'olive' | 'tan';
  hairTexture?: 'straight' | 'wavy' | 'curly' | 'coily';
  facialStructure?: 'oval' | 'round' | 'square' | 'angular' | 'heart-shaped';
  lightingPreference?: 'natural-light' | 'studio-light' | 'golden-hour' | 'soft-diffused';
  
  // Phase 3: Quality Learning Data
  successRate?: number;       // 0-1 based on generation history
  learningConfidence?: number; // 0-1 confidence in optimization
  generationHistory?: number; // Number of generations for this user
  optimizationLevel?: 'basic' | 'adaptive' | 'advanced';
}

// Maya Phase 2: Advanced User Analysis Interface
export interface MayaAnalysis {
  skinTone: string;
  hairTexture: string;
  facialStructure: string;
  lightingPreference: string;
  optimizationRecommendations: Partial<UserParameters>;
}

// Maya Phase 3: Quality Learning Interface
export interface MayaLearning {
  successPatterns: any[];
  failurePatterns: any[];
  improvedParameters: UserParameters;
  confidenceScore: number;
}