// Central Validation Export
// This file exports all validation schemas and functions

// Re-export Maya API validation
export * from './maya-api.js';

// Re-export Gallery API validation (avoid conflicts)
export {
  imageMetadataSchema,
  getGalleryImagesRequestSchema,
  updateImageRequestSchema,
  deleteImageRequestSchema,
  batchUpdateImagesRequestSchema,
  imageResizeOptionsSchema,
  imageFilterOptionsSchema,
  imageProcessingRequestSchema,
  validateGetGalleryImagesRequest,
  validateUpdateImageRequest,
  validateDeleteImageRequest,
  validateBatchUpdateImagesRequest,
  validateImageProcessingRequest
} from './gallery-api.js';

// Re-export Profile API validation (avoid conflicts)
export {
  subscriptionDetailsSchema,
  updateProfileRequestSchema,
  updatePreferencesRequestSchema,
  changePasswordRequestSchema,
  updateSubscriptionRequestSchema,
  validateUpdateProfileRequest,
  validateUpdatePreferencesRequest,
  validateChangePasswordRequest,
  validateUpdateSubscriptionRequest,
  validateEmail,
  validatePasswordStrength,
  userPreferencesSchema as profileUserPreferencesSchema,
  trainingStatusSchema as profileTrainingStatusSchema
} from './profile-api.js';

// Re-export Training API validation (avoid conflicts)
export {
  trainingConfigurationSchema,
  trainingImageSchema,
  startTrainingRequestSchema,
  updateTrainingRequestSchema,
  cancelTrainingRequestSchema,
  validateImagesRequestSchema,
  imageRequirementsSchema,
  validateStartTrainingRequest,
  validateUpdateTrainingRequest,
  validateCancelTrainingRequest,
  validateImagesRequest,
  validateImageFile,
  validateImageDimensions,
  trainingStatusSchema as apiTrainingStatusSchema
} from './training-api.js';

// Common validation utilities
import { z } from 'zod';

export const baseApiRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100).optional(),
  filters: z.record(z.unknown()).optional(),
});

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
  message: z.string().optional(),
  timestamp: z.string(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  hasMore: z.boolean(),
});

// Common validation functions
export function validateBaseApiRequest(data: unknown) {
  return baseApiRequestSchema.safeParse(data);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function validateAndSanitizeInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  sanitize: boolean = true
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
    };
  }

  let sanitizedData = result.data;
  
  if (sanitize && typeof sanitizedData === 'object' && sanitizedData !== null) {
    sanitizedData = sanitizeObjectStrings(sanitizedData);
  }

  return {
    success: true,
    data: sanitizedData,
  };
}

function sanitizeObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }
  
  return obj;
}