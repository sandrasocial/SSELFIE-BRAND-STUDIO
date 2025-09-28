/**
 * Advanced Type-Safe S3 Client
 * SSELFIE Platform - S3 Integration
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  GetObjectCommandInput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type {
  S3Config,
  IStorageClient,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  StorageEvent,
} from './types.js';
import {
  StorageErrorBase,
  ErrorClassifier,
  RetryHandler,
  errorReporter,
  UploadError,
  DownloadError,
  ValidationError,
  ConfigurationError,
} from './errors.js';

// ============================================================================
// Advanced S3 Storage Client
// ============================================================================

export class S3StorageClient implements IStorageClient {
  private client: S3Client;
  private readonly config: S3Config;
  private readonly eventListeners: ((event: StorageEvent) => void)[] = [];

  constructor(config: S3Config) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      credentials: config.credentials,
      endpoint: config.endpoint,
      maxAttempts: config.maxRetries,
      requestHandler: {
        requestTimeout: config.timeout,
      },
    });

    this.validateConfig();
  }

  /**
   * Validate S3 configuration
   */
  private validateConfig(): void {
    if (!this.config.bucket) {
      throw new ConfigurationError('S3 bucket name is required');
    }
    if (!this.config.credentials.accessKeyId) {
      throw new ConfigurationError('AWS access key ID is required');
    }
    if (!this.config.credentials.secretAccessKey) {
      throw new ConfigurationError('AWS secret access key is required');
    }
  }

  /**
   * Upload file to S3 with advanced features
   */
  async upload(file: File | Buffer, key: string, options: UploadOptions): Promise<UploadResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateUploadInput(file, key, options);
      
      const buffer = file instanceof File ? await this.fileToBuffer(file) : file;
      const contentType = this.determineContentType(file, options);
      
      // Validate file size
      if (buffer.length > options.maxSizeBytes) {
        throw new ValidationError(
          `File size ${buffer.length} exceeds maximum allowed size ${options.maxSizeBytes}`,
          key
        );
      }
      
      // Validate file type
      if (!this.isAllowedType(contentType, options.allowedTypes)) {
        throw new ValidationError(
          `File type ${contentType} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
          key
        );
      }

      const uploadParams: PutObjectCommandInput = {
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: options.metadata || {},
        CacheControl: options.cacheControl,
        Expires: options.expires,
      };

      // Add ACL if specified (only if bucket supports it)
      if (options.acl) {
        uploadParams.ACL = options.acl;
      }

      // Use multipart upload for large files
      let result;
      if (buffer.length > 100 * 1024 * 1024) { // 100MB threshold
        result = await this.multipartUpload(uploadParams);
      } else {
        result = await this.singleUpload(uploadParams);
      }

      const uploadResult: UploadResult = {
        key,
        url: this.buildPublicUrl(key),
        size: buffer.length,
        contentType,
        etag: result.ETag || '',
        metadata: options.metadata || {},
        timestamp: Date.now(),
      };

      // Emit success event
      this.emitEvent({
        type: 'upload',
        key,
        size: buffer.length,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      return uploadResult;
      
    } catch (error) {
      const storageError = ErrorClassifier.classifyS3Error(error, key);
      errorReporter.reportError(storageError);
      
      // Emit error event
      this.emitEvent({
        type: 'error',
        key,
        error: storageError,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });
      
      throw storageError;
    }
  }

  /**
   * Download file from S3
   */
  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    const startTime = Date.now();
    
    try {
      const getParams: GetObjectCommandInput = {
        Bucket: this.config.bucket,
        Key: key,
        VersionId: options.versionId,
      };

      if (options.range) {
        getParams.Range = `bytes=${options.range.start}-${options.range.end}`;
      }

      const result = await RetryHandler.withRetry(
        () => this.client.send(new GetObjectCommand(getParams)),
        { maxRetries: this.config.maxRetries }
      );

      if (!result.Body) {
        throw new DownloadError('Empty response body', key);
      }

      const buffer = await this.streamToBuffer(result.Body as any);
      
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
      const storageError = ErrorClassifier.classifyS3Error(error, key);
      errorReporter.reportError(storageError);
      
      // Emit error event
      this.emitEvent({
        type: 'error',
        key,
        error: storageError,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });
      
      throw storageError;
    }
  }

  /**
   * Delete file from S3
   */
  async delete(key: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      await RetryHandler.withRetry(
        () => this.client.send(new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })),
        { maxRetries: this.config.maxRetries }
      );

      // Emit success event
      this.emitEvent({
        type: 'delete',
        key,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });
      
    } catch (error) {
      const storageError = ErrorClassifier.classifyS3Error(error, key);
      errorReporter.reportError(storageError);
      throw storageError;
    }
  }

  /**
   * Check if file exists in S3
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }));
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw ErrorClassifier.classifyS3Error(error, key);
    }
  }

  /**
   * List objects with prefix
   */
  async list(prefix: string, maxKeys = 1000): Promise<string[]> {
    try {
      const result = await this.client.send(new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }));

      return result.Contents?.map(obj => obj.Key || '') || [];
      
    } catch (error) {
      throw ErrorClassifier.classifyS3Error(error);
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getUrl(key: string, expires = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn: expires });
      
    } catch (error) {
      throw ErrorClassifier.classifyS3Error(error, key);
    }
  }

  /**
   * Get object metadata
   */
  async getMetadata(key: string): Promise<Record<string, string>> {
    try {
      const result = await this.client.send(new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }));

      return result.Metadata || {};
      
    } catch (error) {
      throw ErrorClassifier.classifyS3Error(error, key);
    }
  }

  /**
   * Copy object within S3
   */
  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.client.send(new CopyObjectCommand({
        Bucket: this.config.bucket,
        CopySource: `${this.config.bucket}/${sourceKey}`,
        Key: destinationKey,
      }));
      
    } catch (error) {
      throw ErrorClassifier.classifyS3Error(error, sourceKey);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate upload input parameters
   */
  private validateUploadInput(file: File | Buffer, key: string, options: UploadOptions): void {
    if (!key || typeof key !== 'string') {
      throw new ValidationError('Key must be a non-empty string');
    }
    
    if (!file) {
      throw new ValidationError('File is required');
    }
    
    if (!options.contentType) {
      throw new ValidationError('Content type is required');
    }
    
    if (!Array.isArray(options.allowedTypes) || options.allowedTypes.length === 0) {
      throw new ValidationError('Allowed types must be a non-empty array');
    }
    
    if (typeof options.maxSizeBytes !== 'number' || options.maxSizeBytes <= 0) {
      throw new ValidationError('Max size bytes must be a positive number');
    }
  }

  /**
   * Convert File to Buffer
   */
  private async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Determine content type from file or options
   */
  private determineContentType(file: File | Buffer, options: UploadOptions): string {
    if (options.contentType) {
      return options.contentType;
    }
    
    if (file instanceof File && file.type) {
      return file.type;
    }
    
    return 'application/octet-stream';
  }

  /**
   * Check if content type is allowed
   */
  private isAllowedType(contentType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(allowed => {
      // Support wildcards like "image/*"
      if (allowed.endsWith('/*')) {
        const prefix = allowed.slice(0, -2);
        return contentType.startsWith(prefix);
      }
      return contentType === allowed;
    });
  }

  /**
   * Single upload for smaller files
   */
  private async singleUpload(params: PutObjectCommandInput) {
    return await RetryHandler.withRetry(
      () => this.client.send(new PutObjectCommand(params)),
      { maxRetries: this.config.maxRetries }
    );
  }

  /**
   * Multipart upload for larger files
   */
  private async multipartUpload(params: PutObjectCommandInput) {
    const upload = new Upload({
      client: this.client,
      params,
      queueSize: 4, // concurrent parts
      partSize: 100 * 1024 * 1024, // 100MB per part
      leavePartsOnError: false,
    });

    return await upload.done();
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Get public URL for object (public method)
   */
  getPublicUrl(key: string): string {
    const endpoint = this.config.endpoint || `https://s3.${this.config.region}.amazonaws.com`;
    return `${endpoint}/${this.config.bucket}/${key}`;
  }

  /**
   * Get public URL for object (private helper)
   */
  private buildPublicUrl(key: string): string {
    const endpoint = this.config.endpoint || `https://s3.${this.config.region}.amazonaws.com`;
    return `${endpoint}/${this.config.bucket}/${key}`;
  }

  /**
   * Emit storage event to listeners
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

  // ============================================================================
  // Public Event Handling
  // ============================================================================

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

  /**
   * Get client configuration
   */
  getConfig(): S3Config {
    return { ...this.config };
  }

  /**
   * Update client configuration (creates new client instance)
   */
  updateConfig(newConfig: Partial<S3Config>): void {
    Object.assign(this.config, newConfig);
    this.client = new S3Client({
      region: this.config.region,
      credentials: this.config.credentials,
      endpoint: this.config.endpoint,
      maxAttempts: this.config.maxRetries,
      requestHandler: {
        requestTimeout: this.config.timeout,
      },
    });
    this.validateConfig();
  }
}