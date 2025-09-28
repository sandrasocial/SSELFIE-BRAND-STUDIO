// Training API Validation Schemas
import { z } from 'zod';

export const trainingStatusSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  estimatedTimeRemaining: z.number().int().min(0).optional(),
  currentStep: z.string().optional(),
  logs: z.array(z.string()).optional(),
});

export const trainingConfigurationSchema = z.object({
  modelName: z.string().min(1).max(100),
  triggerWord: z.string().min(1).max(50),
  learningRate: z.number().min(0.0001).max(0.1).default(0.001),
  maxSteps: z.number().int().min(100).max(10000).default(1500),
  batchSize: z.number().int().min(1).max(16).default(1),
  resolution: z.number().int().min(256).max(1024).default(512),
  mixedPrecision: z.boolean().default(true),
  saveEveryNSteps: z.number().int().min(50).max(1000).default(500),
});

export const trainingImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  filename: z.string().min(1),
  caption: z.string().max(500).optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  size: z.number().positive(),
  isValid: z.boolean(),
  validationErrors: z.array(z.string()).optional(),
});

export const startTrainingRequestSchema = z.object({
  images: z.array(z.string().url()).min(5).max(100),
  configuration: trainingConfigurationSchema.partial().optional(),
  modelName: z.string().min(1).max(100).optional(),
  triggerWord: z.string().min(1).max(50).optional(),
});

export const updateTrainingRequestSchema = z.object({
  trainingId: z.string().min(1),
  configuration: trainingConfigurationSchema.partial(),
});

export const cancelTrainingRequestSchema = z.object({
  trainingId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const validateImagesRequestSchema = z.object({
  images: z.array(z.string().url()).min(1).max(100),
});

// Image validation rules
export const imageRequirementsSchema = z.object({
  minImages: z.number().int().min(1).default(5),
  maxImages: z.number().int().min(1).default(100),
  minResolution: z.number().int().min(1).default(256),
  maxResolution: z.number().int().min(1).default(1024),
  supportedFormats: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'webp']),
  maxFileSize: z.number().min(1).default(10 * 1024 * 1024), // 10MB
  aspectRatioTolerance: z.number().min(0).max(1).default(0.1),
});

// Validation functions
export function validateStartTrainingRequest(data: unknown) {
  return startTrainingRequestSchema.safeParse(data);
}

export function validateUpdateTrainingRequest(data: unknown) {
  return updateTrainingRequestSchema.safeParse(data);
}

export function validateCancelTrainingRequest(data: unknown) {
  return cancelTrainingRequestSchema.safeParse(data);
}

export function validateImagesRequest(data: unknown) {
  return validateImagesRequestSchema.safeParse(data);
}

// Image validation helpers
export function validateImageFile(file: File): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const requirements = imageRequirementsSchema.parse({});

  // Check file type
  const fileType = file.type.toLowerCase();
  const isValidFormat = requirements.supportedFormats.some(format => 
    fileType.includes(format) || file.name.toLowerCase().endsWith(`.${format}`)
  );
  
  if (!isValidFormat) {
    errors.push(`Unsupported file format. Supported formats: ${requirements.supportedFormats.join(', ')}`);
  }

  // Check file size
  if (file.size > requirements.maxFileSize) {
    errors.push(`File size too large. Maximum size: ${Math.round(requirements.maxFileSize / (1024 * 1024))}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateImageDimensions(width: number, height: number): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements = imageRequirementsSchema.parse({});

  // Check minimum resolution
  if (width < requirements.minResolution || height < requirements.minResolution) {
    errors.push(`Image resolution too low. Minimum: ${requirements.minResolution}x${requirements.minResolution}px`);
  }

  // Check maximum resolution
  if (width > requirements.maxResolution || height > requirements.maxResolution) {
    errors.push(`Image resolution too high. Maximum: ${requirements.maxResolution}x${requirements.maxResolution}px`);
  }

  // Check aspect ratio (warn if not close to square)
  const aspectRatio = width / height;
  const aspectRatioDiff = Math.abs(aspectRatio - 1);
  
  if (aspectRatioDiff > requirements.aspectRatioTolerance) {
    warnings.push('Image is not square. Square images work best for training.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}