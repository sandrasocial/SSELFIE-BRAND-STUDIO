/**
 * Types for AI generation service
 */

export interface BaseGenerationRequest {
  userId: string;
  style?: string;
  metadata?: Record<string, unknown>;
}

export interface StoryGenerationRequest extends BaseGenerationRequest {
  concept: string;
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
  tone?: string;
}

export interface VideoGenerationRequest extends BaseGenerationRequest {
  storyId?: string;
  prompt?: string;
  duration?: number;
  format?: 'mp4' | 'webm';
  resolution?: '720p' | '1080p' | '4k';
}

export interface ImageGenerationRequest extends BaseGenerationRequest {
  prompt: string;
  count?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  format?: 'png' | 'jpg';
}

export type GenerationType = 'story' | 'video' | 'image';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationJob<T> {
  jobId: string;
  type: GenerationType;
  status: GenerationStatus;
  progress: number;
  request: T;
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface GenerationResult {
  jobId: string;
  status: GenerationStatus;
  progress?: number;
  result?: any;
  error?: string;
}

export interface AIServiceError extends Error {
  code: string;
  type: 'validation' | 'processing' | 'service' | 'unknown';
  jobId?: string;
  request?: BaseGenerationRequest;
  context?: Record<string, unknown>;
}