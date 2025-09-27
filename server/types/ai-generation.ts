/**
 * ype definitions for AI generation routes
 */

import type { Request } from 'express';
import type { StackAuthUser } from './auth.js';

import { AuthenticatedUser } from '../../api/_shared/auth-types.js';

/** Base authenticated request */
export interface AuthenticatedRequest extends Request {
  user: StackAuthUser;
}

/** Story concept request */
export interface StoryConceptRequest {
  concept: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
}

/** Story status response */
export interface StoryStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: {
    story: string;
    metadata: Record<string, unknown>;
  };
}

/** Video generation request */
export interface VideoGenerationRequest {
  story?: string;
  prompt?: string;
  style?: string;
  duration?: number;
}

/** Video status */
export interface VideoStatus {
  jobId: string;
  id: number;
  userId: string;
  imageId: number;
  imageSource: string;
  motionPrompt: string;
  videoUrl: string;
  status: string;
  estimatedTime: string;
  progress: number;
  errorMessage: string;
  saved: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
}

/** Victoria AI request */
export interface VictoriaGenerationRequest {
  prompt: string;
  style?: string;
  businessType?: string;
}

/** Victoria customization request */
export interface VictoriaCustomizationRequest {
  contentId: string;
  customizations: Record<string, unknown>;
}

/** Victoria deployment request */
export interface VictoriaDeploymentRequest {
  contentId: string;
  deploymentOptions: {
    platform?: string;
    domain?: string;
    settings?: Record<string, unknown>;
  };
}

/** Victoria website */
export interface VictoriaWebsite {
  id: string;
  userId: string;
  domain: string;
  status: 'active' | 'building' | 'error';
  template: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** AI image generation request */
export interface AIImageGenerationRequest {
  prompt: string;
  style?: string;
  count?: number;
  seed?: number;
}

/** AI image result */
export interface AIImage {
  id: number;
  userId: string;
  prompt: string;
  generatedPrompt: string;
  imageUrl: string;
  style: string;
  category: string;
  source: string;
  predictionId: string;
  generationStatus: string;
  isSelected: boolean;
  isFavorite: boolean;
  createdAt: Date;
}

/** Maya chat */
export interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary: string;
  chatCategory: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Success response */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

/** Error response */
export interface ErrorResponse {
  error: string;
  details?: unknown;
}