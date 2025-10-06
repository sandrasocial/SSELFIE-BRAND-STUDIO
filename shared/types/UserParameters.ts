export interface UserParameters {
  // FLUX Generation Parameters
  guidance: number;           // 2.5-3.2 range for natural to dramatic
  inferenceSteps: number;     // 28-50 range for speed vs quality
  loraScale: number;          // ✅ RESTORED: 1.1 for extracted LoRA weights
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

// Pattern analysis for successful/failed generations
export interface GenerationPattern {
  parameter: keyof UserParameters;
  value: number | string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  sampleSize: number;
}

// Maya Phase 3: Quality Learning Interface
export interface MayaLearning {
  successPatterns: GenerationPattern[];
  failurePatterns: GenerationPattern[];
  improvedParameters: UserParameters;
  confidenceScore: number;
}