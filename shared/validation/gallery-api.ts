// Gallery API Validation Schemas
import { z } from 'zod';

export const imageMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1),
  size: z.number().positive(),
  createdAt: z.date(),
  prompt: z.string().optional(),
  style: z.string().optional(),
  model: z.string().optional(),
  seed: z.string().optional(),
});

export const getGalleryImagesRequestSchema = z.object({
  category: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['created_at', 'updated_at', 'category']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100).optional(),
});

export const updateImageRequestSchema = z.object({
  imageId: z.string().min(1),
  metadata: imageMetadataSchema.partial().optional(),
  isSelected: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  category: z.string().max(50).optional(),
});

export const deleteImageRequestSchema = z.object({
  imageId: z.string().min(1),
});

export const batchUpdateImagesRequestSchema = z.object({
  imageIds: z.array(z.string().min(1)).min(1).max(100),
  updates: z.object({
    isSelected: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    category: z.string().max(50).optional(),
  }),
});

export const imageResizeOptionsSchema = z.object({
  width: z.number().int().positive().max(4096).optional(),
  height: z.number().int().positive().max(4096).optional(),
  quality: z.number().min(1).max(100).optional(),
  format: z.enum(['jpeg', 'png', 'webp']).optional(),
});

export const imageFilterOptionsSchema = z.object({
  brightness: z.number().min(-100).max(100).optional(),
  contrast: z.number().min(-100).max(100).optional(),
  saturation: z.number().min(-100).max(100).optional(),
  blur: z.number().min(0).max(10).optional(),
});

export const imageProcessingRequestSchema = z.object({
  imageId: z.string().min(1),
  operations: z.object({
    resize: imageResizeOptionsSchema.optional(),
    filter: imageFilterOptionsSchema.optional(),
    crop: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }).optional(),
  }),
});

// Validation functions
export function validateGetGalleryImagesRequest(data: unknown) {
  return getGalleryImagesRequestSchema.safeParse(data);
}

export function validateUpdateImageRequest(data: unknown) {
  return updateImageRequestSchema.safeParse(data);
}

export function validateDeleteImageRequest(data: unknown) {
  return deleteImageRequestSchema.safeParse(data);
}

export function validateBatchUpdateImagesRequest(data: unknown) {
  return batchUpdateImagesRequestSchema.safeParse(data);
}

export function validateImageProcessingRequest(data: unknown) {
  return imageProcessingRequestSchema.safeParse(data);
}