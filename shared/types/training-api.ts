// Training API Type Definitions
// Based on User Journey Doc Section 4

export interface TrainingStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;
  currentStep?: string;
  logs?: string[];
}

export interface TrainingConfiguration {
  modelName: string;
  triggerWord: string;
  learningRate: number;
  maxSteps: number;
  batchSize: number;
  resolution: number;
  mixedPrecision: boolean;
  saveEveryNSteps: number;
}

export interface TrainingData {
  images: TrainingImage[];
  totalImages: number;
  validImages: number;
  invalidImages: string[];
}

export interface TrainingImage {
  id: string;
  url: string;
  filename: string;
  caption?: string;
  width: number;
  height: number;
  size: number;
  isValid: boolean;
  validationErrors?: string[];
}

export interface TrainingError {
  code: string;
  message: string;
  step?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface TrainingMetrics {
  loss: number;
  learningRate: number;
  step: number;
  epoch: number;
  timePerStep: number;
  memoryUsage: number;
}

// Request types
export interface StartTrainingRequest {
  images: File[] | string[];
  configuration?: Partial<TrainingConfiguration>;
  modelName?: string;
  triggerWord?: string;
}

export interface UpdateTrainingRequest {
  trainingId: string;
  configuration?: Partial<TrainingConfiguration>;
}

export interface CancelTrainingRequest {
  trainingId: string;
  reason?: string;
}

export interface ValidateImagesRequest {
  images: File[] | string[];
}

// Response types
export interface TrainingResponse {
  trainingId: string;
  status: TrainingStatus;
  configuration: TrainingConfiguration;
  data: TrainingData;
  metrics?: TrainingMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingListResponse {
  trainings: TrainingResponse[];
  total: number;
  hasMore: boolean;
}

export interface ImageValidationResponse {
  validImages: TrainingImage[];
  invalidImages: Array<{
    filename: string;
    errors: string[];
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    recommendations?: string[];
  };
}

export interface TrainingProgressResponse {
  trainingId: string;
  status: TrainingStatus;
  metrics?: TrainingMetrics;
  logs: string[];
  estimatedCompletion?: Date;
}

export interface ModelResponse {
  modelId: string;
  name: string;
  triggerWord: string;
  status: 'training' | 'ready' | 'failed';
  createdAt: Date;
  downloadUrl?: string;
  previewImages?: string[];
}

// Validation types
export interface TrainingValidationResult {
  isValid: boolean;
  errors: TrainingError[];
  warnings?: string[];
  recommendations?: string[];
}

export interface ImageRequirements {
  minImages: number;
  maxImages: number;
  minResolution: number;
  maxResolution: number;
  supportedFormats: string[];
  maxFileSize: number;
  aspectRatioTolerance: number;
}