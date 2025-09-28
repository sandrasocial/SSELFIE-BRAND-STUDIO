/**
 * Comprehensive Type-Safe File Storage & CDN System
 * SSELFIE Platform - Storage Types
 */

// ============================================================================
// S3 Configuration & Options
// ============================================================================

export interface S3Config {
  region: string;
  bucket: string;
  endpoint?: string;
  maxRetries: number;
  timeout: number;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface UploadOptions {
  contentType: string;
  maxSizeBytes: number;
  allowedTypes: string[];
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write';
  cacheControl?: string;
  expires?: Date;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  etag: string;
  metadata: Record<string, string>;
  timestamp: number;
}

export interface DownloadOptions {
  range?: {
    start: number;
    end: number;
  };
  versionId?: string;
}

// ============================================================================
// CDN Configuration & Options
// ============================================================================

export interface CDNConfig {
  domain: string;
  distributionId?: string;
  ttl: number;
  security: {
    allowedOrigins: string[];
    signedUrls: boolean;
    privateKeyId?: string;
    privateKey?: string;
  };
  caching: {
    staticAssets: number;
    images: number;
    api: number;
  };
}

export interface CDNOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  signed?: boolean;
  expires?: number;
}

export interface CDNInvalidationResult {
  invalidationId: string;
  status: 'InProgress' | 'Completed';
  paths: string[];
  createTime: Date;
}

// ============================================================================
// Storage Client Interfaces
// ============================================================================

export interface IStorageClient {
  upload(file: File | Buffer, key: string, options: UploadOptions): Promise<UploadResult>;
  download(key: string, options?: DownloadOptions): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  list(prefix: string, maxKeys?: number): Promise<string[]>;
  getUrl(key: string, expires?: number): Promise<string>;
  getMetadata(key: string): Promise<Record<string, string>>;
  copy(sourceKey: string, destinationKey: string): Promise<void>;
}

export interface ICDNClient {
  getUrl(key: string, options?: CDNOptions): string;
  invalidate(keys: string[]): Promise<CDNInvalidationResult>;
  preload(keys: string[]): Promise<void>;
  getSignedUrl(key: string, expires: number): string;
  getCacheStats(): Promise<{
    hitRate: number;
    requests: number;
    bandwidth: number;
  }>;
}

// ============================================================================
// Error Types
// ============================================================================

export type StorageErrorType = 
  | 'upload'
  | 'download' 
  | 'delete'
  | 'validation'
  | 'configuration'
  | 'network'
  | 'permission'
  | 'quota'
  | 'timeout';

export interface StorageError {
  type: StorageErrorType;
  code: string;
  message: string;
  key?: string;
  originalError?: Error;
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Monitoring & Analytics
// ============================================================================

export interface StorageMetrics {
  uploads: {
    total: number;
    successful: number;
    failed: number;
    totalSize: number;
    averageSize: number;
    averageTime: number;
  };
  downloads: {
    total: number;
    successful: number;
    failed: number;
    totalSize: number;
    averageTime: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    bandwidth: number;
  };
  errors: Array<{
    type: StorageErrorType;
    count: number;
    lastOccurred: Date;
  }>;
}

export interface StorageEvent {
  type: 'upload' | 'download' | 'delete' | 'error';
  key: string;
  size?: number;
  duration?: number;
  error?: StorageError;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface StorageSystemConfig {
  s3: S3Config;
  cdn: CDNConfig;
  features: {
    enableImageOptimization: boolean;
    enableCDN: boolean;
    enableUploadChunking: boolean;
    enableVirusScanning: boolean;
    enableMetadataStripping: boolean;
  };
  limits: {
    maxFileSize: number;
    maxConcurrentUploads: number;
    maxRetries: number;
    timeoutMs: number;
  };
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableAlerting: boolean;
    metricsRetentionDays: number;
  };
}

// ============================================================================
// Legacy Compatibility (for existing image storage service)
// ============================================================================

export interface LegacyImageStorageConfig {
  s3Config: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  bucketName: string;
  maxRetries: number;
  retryDelay: number;
}

export interface LegacyImageUploadResult {
  permanentUrl: string;
  size: number;
  contentType: string;
  timestamp: number;
}

export interface LegacyMigrationResult {
  success: boolean;
  permanentUrl?: string;
  error?: Error;
  originalUrl: string;
}

export type LegacyImageStorageError = 
  | { type: 'download'; message: string; url: string }
  | { type: 'upload'; message: string; key: string }
  | { type: 'validation'; message: string }
  | { type: 'configuration'; message: string };