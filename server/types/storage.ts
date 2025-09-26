import { S3ClientConfig } from '@aws-sdk/client-s3';

export interface AIImage {
  id: number;
  imageUrl: string;
  userId: string;
  createdAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface ImageStorageConfig {
  s3Config: S3ClientConfig;
  bucketName: string;
  maxRetries: number;
  retryDelay: number;
}

export interface ImageUploadResult {
  permanentUrl: string;
  size: number;
  contentType: string;
  timestamp: number;
}

export interface MigrationResult {
  success: boolean;
  permanentUrl?: string;
  error?: Error;
  originalUrl: string;
}

export type ImageStorageError = 
  | { type: 'download'; message: string; url: string }
  | { type: 'upload'; message: string; key: string }
  | { type: 'validation'; message: string }
  | { type: 'configuration'; message: string };