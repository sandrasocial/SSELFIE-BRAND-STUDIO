/**
 * Additional types for training completion handling
 */

import { ReplicateTrainingStatus } from './training.js';

export interface UserModel {
  userId: string;
  modelName?: string;
  replicateModelId?: string;
  replicateVersionId?: string;
  triggerWord?: string;
  trainingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  trainingProgress?: number;
  modelType?: 'flux-standard' | 'flux-lora' | 'flux-packaged';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  trainedModelPath?: string;
}

export interface LoRAWeights {
  userId: string;
  trainingId: string;
  weightsUrl: string;
  checksum: string;
  fileSize: number;
  extractedAt: Date;
}

export interface BrandStrategyContext {
  responses: {
    primaryPlatform: string;
    authorityLevel: string;
    [key: string]: string;
  };
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  trainingCoachingCompleted?: boolean;
  brandStrategyContext?: string;
}

export interface TrainingCompletionResult {
  success: boolean;
  modelId?: string;
  versionId?: string;
  error?: string;
  triggerWord?: string;
  modelType?: UserModel['modelType'];
  completedAt?: Date;
}