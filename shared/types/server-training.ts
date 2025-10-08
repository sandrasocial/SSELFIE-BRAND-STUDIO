/**
 * Types for Replicate API responses and training data
 */

export interface ReplicateTrainingStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: string;
  logs?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    get: string;
    cancel: string;
  };
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  metrics?: {
    predict_time?: number;
    train_time?: number;
  };
  version?: {
    id: string;
    created_at: string;
    cog_version: string;
    openapi_schema?: Record<string, unknown>;
  };
}

export interface TrainingStatusUpdate {
  userId: string;
  modelId: string;
  status: ReplicateTrainingStatus['status'];
  error?: string;
  completedAt?: string;
  modelVersion?: string;
}

export interface TrainingMonitorConfig {
  checkIntervalMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface TrainingError extends Error {
  code: string;
  userId: string;
  modelId: string;
  apiResponse?: unknown;
}