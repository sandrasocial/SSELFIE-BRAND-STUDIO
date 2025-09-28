/**
 * Image Processing Types
 * SSELFIE Platform - Image Processing
 */

// ============================================================================
// Image Processing Options
// ============================================================================

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  strip?: boolean;
  preserveMetadata?: string[];
  backgroundColor?: string;
  blur?: number;
  sharpen?: number;
  progressive?: boolean;
  lossless?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top';
  background?: string;
  kernel?: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3';
  withoutEnlargement?: boolean;
  withoutReduction?: boolean;
}

export interface OptimizationOptions {
  quality?: number;
  progressive?: boolean;
  lossless?: boolean;
  effort?: number; // 1-6 for WebP, 1-9 for AVIF
  compressionLevel?: number; // 0-9 for PNG
  adaptiveFiltering?: boolean;
  palette?: boolean;
}

// ============================================================================
// Image Metadata
// ============================================================================

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  density?: number;
  hasAlpha: boolean;
  hasProfile: boolean;
  isAnimated?: boolean;
  pages?: number;
  exif?: Record<string, any>;
  icc?: {
    description: string;
    copyright: string;
    deviceClass: string;
  };
}

export interface ProcessingResult {
  buffer: Buffer;
  metadata: ImageMetadata;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  processingTime: number;
}

// ============================================================================
// Validation Options
// ============================================================================

export interface ImageValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  requireAlpha?: boolean;
  maxAnimationFrames?: number;
  allowAnimated?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: ImageMetadata;
}

// ============================================================================
// Processing Pipeline
// ============================================================================

export interface ProcessingStep {
  name: string;
  enabled: boolean;
  options: Record<string, any>;
}

export interface ProcessingPipeline {
  steps: ProcessingStep[];
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  stripMetadata?: boolean;
  preserveAnimation?: boolean;
}

// ============================================================================
// Optimization Strategies
// ============================================================================

export interface OptimizationStrategy {
  name: string;
  description: string;
  targetQuality: number;
  maxSizeReduction: number;
  preserveQuality: boolean;
  pipeline: ProcessingPipeline;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  qualityScore: number;
  processingTime: number;
  strategy: string;
  buffer: Buffer;
}

// ============================================================================
// Error Types
// ============================================================================

export type ImageProcessingErrorType =
  | 'validation'
  | 'processing'
  | 'optimization'
  | 'format_conversion'
  | 'metadata_extraction'
  | 'memory'
  | 'timeout';

export interface ImageProcessingError {
  type: ImageProcessingErrorType;
  code: string;
  message: string;
  originalError?: Error;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Processing Context
// ============================================================================

export interface ProcessingContext {
  inputFormat: string;
  outputFormat: string;
  targetSize?: number;
  quality?: number;
  timestamp: number;
  userId?: string;
  requestId?: string;
}

// ============================================================================
// Feature Detection
// ============================================================================

export interface ImageCapabilities {
  formats: {
    input: string[];
    output: string[];
  };
  features: {
    resize: boolean;
    crop: boolean;
    rotate: boolean;
    blur: boolean;
    sharpen: boolean;
    colorspace: boolean;
    animation: boolean;
    metadata: boolean;
  };
  limits: {
    maxWidth: number;
    maxHeight: number;
    maxFileSize: number;
    maxAnimationFrames: number;
  };
}