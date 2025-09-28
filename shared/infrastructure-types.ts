import { z } from 'zod';

// Base error types
export const ErrorMetadataSchema = z.object({
  timestamp: z.number(),
  component: z.string(),
  errorCode: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  recoverable: z.boolean(),
});

export type ErrorMetadata = z.infer<typeof ErrorMetadataSchema>;

// Storage types
export const StorageConfigSchema = z.object({
  region: z.string(),
  bucket: z.string(),
  cdnDomain: z.string().optional(),
  maxFileSize: z.number(),
  allowedMimeTypes: z.array(z.string()),
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

// Notification types
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['email', 'push', 'in-app']),
  template: z.string(),
  recipient: z.string(),
  payload: z.record(z.unknown()),
  status: z.enum(['pending', 'sent', 'failed']),
  createdAt: z.number(),
  sentAt: z.number().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Feature-flagged type exports
export const FeatureFlaggedExports = {
  ErrorMetadata: ErrorMetadataSchema,
  StorageConfig: StorageConfigSchema,
  Notification: NotificationSchema,
};