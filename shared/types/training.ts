/**
 * Training types for TrainingCompletionMonitor
 */

export type ReplicateTrainingStatus = {
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: string;
  completed_at?: string;
  version?: {
    id: string;
  };
  output?: any;
};

export interface TrainingStatusUpdate {
  success?: boolean;
  status?: string;
  error?: string;
  modelId?: string;
  versionId?: string;
  userId?: string;
  completedAt?: string;
  modelVersion?: string;
}

export interface TrainingMonitorConfig {
  checkIntervalMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface TrainingError {
  message: string;
  code?: string;
  retries: number;
  timestamp: Date;
}