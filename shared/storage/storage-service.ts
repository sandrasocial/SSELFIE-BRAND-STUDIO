/**
 * Comprehensive Storage Service
 * SSELFIE Platform - Main Storage Service
 */

import type {
  StorageSystemConfig,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  CDNOptions,
  StorageMetrics,
  StorageEvent,
} from './types.js';
import { S3StorageClient } from './s3-client.js';
import { CDNClient } from './cdn-client.js';
import { storageConfig } from './config.js';
import { ImageProcessor, OptimizationManager } from '../image/index.js';
import { ImageValidator } from '../image/validators.js';
import { errorReporter, StorageErrorBase } from './errors.js';

// ============================================================================
// Main Storage Service
// ============================================================================

export class StorageService {
  private s3Client: S3StorageClient;
  private cdnClient: CDNClient;
  private config: StorageSystemConfig;
  private metrics: StorageMetrics;
  private eventListeners: ((event: StorageEvent) => void)[] = [];

  constructor(config?: StorageSystemConfig) {
    this.config = config || storageConfig.loadConfig();
    this.s3Client = new S3StorageClient(this.config.s3);
    this.cdnClient = new CDNClient(this.config.cdn);
    this.metrics = this.initializeMetrics();
    this.setupEventListeners();
  }

  /**
   * Upload file with comprehensive processing pipeline
   */
  async upload(
    file: File | Buffer,
    key: string,
    options: UploadOptions & {
      optimize?: boolean;
      optimizationStrategy?: string;
      generateThumbnail?: boolean;
      validateImage?: boolean;
    } = {} as any
  ): Promise<UploadResult & { thumbnailUrl?: string; cdnUrl?: string }> {
    const startTime = Date.now();

    try {
      let uploadBuffer: Buffer;
      let originalSize: number;

      // Convert File to Buffer if needed
      if (file instanceof File) {
        uploadBuffer = Buffer.from(await file.arrayBuffer());
        originalSize = file.size;
      } else {
        uploadBuffer = file;
        originalSize = file.length;
      }

      // Image validation if requested
      if (options.validateImage && this.isImageFile(options.contentType)) {
        const validationResult = await ImageValidator.validate(uploadBuffer);
        if (!validationResult.valid) {
          throw new StorageErrorBase('validation', 'IMAGE_VALIDATION_FAILED', 
            `Image validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Image optimization if requested
      if (options.optimize && this.isImageFile(options.contentType)) {
        const strategy = options.optimizationStrategy || 'web-optimized';
        const optimizationResult = await OptimizationManager.optimize(uploadBuffer, strategy);
        uploadBuffer = optimizationResult.buffer;
        
        console.log(`Image optimized: ${originalSize} → ${optimizationResult.optimizedSize} bytes (${Math.round(optimizationResult.compressionRatio * 100) / 100}x compression)`);
      }

      // Upload to S3
      const uploadResult = await this.s3Client.upload(uploadBuffer, key, options);

      // Generate thumbnail if requested
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail && this.isImageFile(options.contentType)) {
        const thumbnailKey = this.generateThumbnailKey(key);
        const thumbnailResult = await OptimizationManager.optimize(uploadBuffer, 'thumbnail');
        
        await this.s3Client.upload(thumbnailResult.buffer, thumbnailKey, {
          ...options,
          contentType: 'image/webp',
        });
        
        thumbnailUrl = this.config.features.enableCDN 
          ? this.cdnClient.getUrl(thumbnailKey) 
          : await this.s3Client.getUrl(thumbnailKey);
      }

      // Get CDN URL if enabled
      const cdnUrl = this.config.features.enableCDN 
        ? this.cdnClient.getUrl(key)
        : undefined;

      // Update metrics
      this.updateUploadMetrics(true, uploadResult.size, Date.now() - startTime);

      // Emit success event
      this.emitEvent({
        type: 'upload',
        key,
        size: uploadResult.size,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      return {
        ...uploadResult,
        thumbnailUrl,
        cdnUrl,
      };

    } catch (error) {
      // Update metrics
      this.updateUploadMetrics(false, originalSize, Date.now() - startTime);

      // Report error
      if (error instanceof StorageErrorBase) {
        errorReporter.reportError(error);
      }

      throw error;
    }
  }

  /**
   * Download file with caching support
   */
  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    const startTime = Date.now();

    try {
      const buffer = await this.s3Client.download(key, options);

      // Update metrics
      this.updateDownloadMetrics(true, buffer.length, Date.now() - startTime);

      // Emit success event
      this.emitEvent({
        type: 'download',
        key,
        size: buffer.length,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      return buffer;

    } catch (error) {
      // Update metrics
      this.updateDownloadMetrics(false, 0, Date.now() - startTime);

      throw error;
    }
  }

  /**
   * Delete file and associated resources
   */
  async delete(key: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Delete main file
      await this.s3Client.delete(key);

      // Delete thumbnail if exists
      const thumbnailKey = this.generateThumbnailKey(key);
      if (await this.s3Client.exists(thumbnailKey)) {
        await this.s3Client.delete(thumbnailKey);
      }

      // Invalidate CDN cache if enabled
      if (this.config.features.enableCDN) {
        await this.cdnClient.invalidate([key, thumbnailKey]);
      }

      // Emit success event
      this.emitEvent({
        type: 'delete',
        key,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get optimized URL for file
   */
  getUrl(key: string, options: CDNOptions = {}): string {
    if (this.config.features.enableCDN) {
      return this.cdnClient.getUrl(key, options);
    } else {
      // Fallback to S3 URL (would need to be made async for signed URLs)
      return this.s3Client.getPublicUrl(key);
    }
  }

  /**
   * Get responsive image URLs
   */
  getResponsiveUrls(key: string, options: CDNOptions = {}) {
    if (this.config.features.enableCDN) {
      return this.cdnClient.getResponsiveUrls(key, options);
    } else {
      const baseUrl = this.s3Client.getPublicUrl(key);
      return {
        original: baseUrl,
        large: baseUrl,
        medium: baseUrl,
        small: baseUrl,
        thumbnail: baseUrl,
      };
    }
  }

  /**
   * Generate srcSet for responsive images
   */
  generateSrcSet(key: string, options: CDNOptions = {}): string {
    if (this.config.features.enableCDN) {
      return this.cdnClient.generateSrcSet(key, options);
    } else {
      return this.s3Client.getPublicUrl(key);
    }
  }

  /**
   * Bulk upload with progress tracking
   */
  async uploadBatch(
    files: Array<{
      file: File | Buffer;
      key: string;
      options?: UploadOptions;
    }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const { file, key, options = {} as UploadOptions } = files[i];
      
      try {
        const result = await this.upload(file, key, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${key}:`, error);
        // Continue with other files
      }

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    return results;
  }

  /**
   * Preload assets into CDN cache
   */
  async preloadAssets(keys: string[]): Promise<void> {
    if (this.config.features.enableCDN) {
      await this.cdnClient.preload(keys);
    }
  }

  /**
   * Invalidate CDN cache
   */
  async invalidateCache(keys: string[]) {
    if (this.config.features.enableCDN) {
      return await this.cdnClient.invalidate(keys);
    }
  }

  /**
   * Get storage metrics
   */
  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    if (this.config.features.enableCDN) {
      return await this.cdnClient.getCacheStats();
    }
    return { hitRate: 0, requests: 0, bandwidth: 0 };
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: StorageEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: StorageEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): StorageMetrics {
    return {
      uploads: {
        total: 0,
        successful: 0,
        failed: 0,
        totalSize: 0,
        averageSize: 0,
        averageTime: 0,
      },
      downloads: {
        total: 0,
        successful: 0,
        failed: 0,
        totalSize: 0,
        averageTime: 0,
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        bandwidth: 0,
      },
      errors: [],
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen to S3 client events
    this.s3Client.addEventListener((event) => {
      this.emitEvent(event);
    });
  }

  /**
   * Update upload metrics
   */
  private updateUploadMetrics(success: boolean, size: number, duration: number): void {
    this.metrics.uploads.total++;
    
    if (success) {
      this.metrics.uploads.successful++;
      this.metrics.uploads.totalSize += size;
      this.metrics.uploads.averageSize = 
        this.metrics.uploads.totalSize / this.metrics.uploads.successful;
      this.metrics.uploads.averageTime = 
        (this.metrics.uploads.averageTime * (this.metrics.uploads.successful - 1) + duration) / 
        this.metrics.uploads.successful;
    } else {
      this.metrics.uploads.failed++;
    }
  }

  /**
   * Update download metrics
   */
  private updateDownloadMetrics(success: boolean, size: number, duration: number): void {
    this.metrics.downloads.total++;
    
    if (success) {
      this.metrics.downloads.successful++;
      this.metrics.downloads.totalSize += size;
      this.metrics.downloads.averageTime = 
        (this.metrics.downloads.averageTime * (this.metrics.downloads.successful - 1) + duration) / 
        this.metrics.downloads.successful;
    } else {
      this.metrics.downloads.failed++;
    }
  }

  /**
   * Check if file is an image
   */
  private isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  /**
   * Generate thumbnail key from original key
   */
  private generateThumbnailKey(key: string): string {
    const lastDot = key.lastIndexOf('.');
    if (lastDot === -1) {
      return `${key}_thumb`;
    }
    
    const name = key.substring(0, lastDot);
    const ext = key.substring(lastDot);
    return `${name}_thumb${ext}`;
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: StorageEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in storage event listener:', error);
      }
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultStorageService: StorageService;

/**
 * Get default storage service instance
 */
export function getStorageService(): StorageService {
  if (!defaultStorageService) {
    defaultStorageService = new StorageService();
  }
  return defaultStorageService;
}

/**
 * Initialize storage service with custom config
 */
export function initializeStorageService(config: StorageSystemConfig): StorageService {
  defaultStorageService = new StorageService(config);
  return defaultStorageService;
}