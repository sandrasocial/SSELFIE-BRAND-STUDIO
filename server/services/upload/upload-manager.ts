/**
 * Upload Manager Service
 * Handles S3 uploads, progress tracking, and file organization
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadConfig {
  bucket: string;
  region: string;
  pathPrefix: string;
  enableProgress: boolean;
  multipartThreshold: number; // bytes
  partSize: number; // bytes
}

export interface UploadRequest {
  userId: string;
  files: string[]; // File paths to upload
  metadata?: Record<string, string>;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  currentProgress: number; // 0-100
  overallProgress: number; // 0-100
  uploadedBytes: number;
  totalBytes: number;
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
}

export interface UploadResult {
  success: boolean;
  uploadedFiles: UploadedFile[];
  failedFiles: FailedFile[];
  totalSize: number;
  duration: number; // seconds
  message: string;
}

export interface UploadedFile {
  localPath: string;
  s3Url: string;
  s3Key: string;
  size: number;
  uploadTime: number; // seconds
}

export interface FailedFile {
  localPath: string;
  error: string;
  size?: number;
}

/**
 * Service for managing S3 uploads with progress tracking
 */
export class UploadManager {
  private db: IStorage;
  private s3: S3Client;
  private config: UploadConfig;

  constructor(db?: IStorage, config?: Partial<UploadConfig>) {
    this.db = db || getDatabase();
    
    // Default upload configuration
    this.config = {
      bucket: process.env['AWS_S3_BUCKET'] || 'sselfie-studio-assets',
      region: process.env['AWS_REGION'] || 'eu-west-1',
      pathPrefix: 'user-uploads',
      enableProgress: true,
      multipartThreshold: 5 * 1024 * 1024, // 5MB
      partSize: 5 * 1024 * 1024, // 5MB
      ...config
    };

    // Initialize S3 client
    this.s3 = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || ''
      }
    });

    console.log(`✅ UPLOAD MANAGER: Initialized with bucket ${this.config.bucket}`);
  }

  /**
   * Upload multiple files to S3 with progress tracking
   */
  async uploadImages(request: UploadRequest): Promise<UploadResult> {
    const startTime = Date.now();
    
    try {
      console.log(`📤 UPLOAD MANAGER: Starting upload of ${request.files.length} files for user ${request.userId}`);

      const result: UploadResult = {
        success: false,
        uploadedFiles: [],
        failedFiles: [],
        totalSize: 0,
        duration: 0,
        message: ''
      };

      // Calculate total size for progress tracking
      const totalSize = this.calculateTotalSize(request.files);
      let uploadedBytes = 0;

      // Initialize progress
      const progress: UploadProgress = {
        totalFiles: request.files.length,
        completedFiles: 0,
        currentFile: '',
        currentProgress: 0,
        overallProgress: 0,
        uploadedBytes: 0,
        totalBytes: totalSize
      };

      // Upload each file
      for (let i = 0; i < request.files.length; i++) {
        const filePath = request.files[i];
        
        try {
          progress.currentFile = path.basename(filePath);
          progress.currentProgress = 0;
          
          if (request.onProgress) {
            request.onProgress(progress);
          }

          const uploadedFile = await this.uploadSingleFile(
            filePath,
            request.userId,
            request.metadata,
            (fileProgress) => {
              progress.currentProgress = fileProgress;
              progress.uploadedBytes = uploadedBytes + (fileProgress / 100) * fs.statSync(filePath).size;
              progress.overallProgress = Math.round((progress.uploadedBytes / totalSize) * 100);
              
              if (request.onProgress) {
                request.onProgress(progress);
              }
            }
          );

          result.uploadedFiles.push(uploadedFile);
          uploadedBytes += uploadedFile.size;
          progress.completedFiles++;
          
          console.log(`✅ UPLOAD MANAGER: Uploaded ${path.basename(filePath)} (${i + 1}/${request.files.length})`);

        } catch (error) {
          console.error(`❌ UPLOAD MANAGER: Failed to upload ${filePath}:`, error);
          
          result.failedFiles.push({
            localPath: filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
            size: fs.existsSync(filePath) ? fs.statSync(filePath).size : undefined
          });
        }
      }

      // Calculate final results
      result.totalSize = uploadedBytes;
      result.duration = (Date.now() - startTime) / 1000;
      result.success = result.uploadedFiles.length > 0;

      if (result.success) {
        result.message = `Successfully uploaded ${result.uploadedFiles.length}/${request.files.length} files`;
        if (result.failedFiles.length > 0) {
          result.message += ` (${result.failedFiles.length} failed)`;
        }
      } else {
        result.message = `Upload failed: All ${request.files.length} files failed to upload`;
      }

      console.log(
        `📊 UPLOAD MANAGER: Upload complete - ` +
        `${result.uploadedFiles.length} success, ${result.failedFiles.length} failed, ` +
        `${result.duration.toFixed(1)}s duration`
      );

      return result;

    } catch (error) {
      console.error(`❌ UPLOAD MANAGER: Upload batch failed for user ${request.userId}:`, error);
      
      return {
        success: false,
        uploadedFiles: [],
        failedFiles: request.files.map(filePath => ({
          localPath: filePath,
          error: error instanceof Error ? error.message : 'Batch upload failed'
        })),
        totalSize: 0,
        duration: (Date.now() - startTime) / 1000,
        message: `Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload a single file to S3
   */
  private async uploadSingleFile(
    filePath: string,
    userId: string,
    metadata?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    const startTime = Date.now();
    
    try {
      // Generate S3 key
      const fileName = path.basename(filePath);
      const timestamp = Date.now();
      const s3Key = `${this.config.pathPrefix}/${userId}/${timestamp}-${fileName}`;

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;

      // Determine upload method based on file size
      let s3Url: string;
      
      if (fileSize > this.config.multipartThreshold) {
        s3Url = await this.multipartUpload(s3Key, fileBuffer, metadata, onProgress);
      } else {
        s3Url = await this.simpleUpload(s3Key, fileBuffer, metadata);
        if (onProgress) onProgress(100);
      }

      const uploadTime = (Date.now() - startTime) / 1000;

      return {
        localPath: filePath,
        s3Url,
        s3Key,
        size: fileSize,
        uploadTime
      };

    } catch (error) {
      console.error(`❌ UPLOAD MANAGER: Single file upload failed for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Simple upload for smaller files
   */
  private async simpleUpload(
    s3Key: string,
    buffer: Buffer,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: this.getContentType(s3Key),
      Metadata: metadata
    });

    await this.s3.send(command);
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Multipart upload for larger files with progress tracking
   */
  private async multipartUpload(
    s3Key: string,
    buffer: Buffer,
    metadata?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.config.bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: this.getContentType(s3Key),
        Metadata: metadata
      },
      partSize: this.config.partSize,
      queueSize: 4
    });

    // Track progress
    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          onProgress(percentage);
        }
      });
    }

    const result = await upload.done();
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Get MIME type for file
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Calculate total size of files
   */
  private calculateTotalSize(filePaths: string[]): number {
    let totalSize = 0;
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          totalSize += fs.statSync(filePath).size;
        }
      } catch (error) {
        console.warn(`⚠️ UPLOAD MANAGER: Could not get size for ${filePath}`);
      }
    }
    return totalSize;
  }

  /**
   * Generate unique file path for user uploads
   */
  generateUploadPath(userId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    return `${this.config.pathPrefix}/${userId}/${timestamp}-${baseName}${ext}`;
  }

  /**
   * Get upload statistics for user
   */
  async getUploadStats(userId: string): Promise<{
    totalUploads: number;
    totalSize: number;
    averageFileSize: number;
    lastUpload?: Date;
  }> {
    try {
      // This would query the database for user's upload history
      // For now, return placeholder data
      return {
        totalUploads: 0,
        totalSize: 0,
        averageFileSize: 0,
        lastUpload: undefined
      };
    } catch (error) {
      console.error(`❌ UPLOAD MANAGER: Error getting stats for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  cleanupTempFiles(filePaths: string[]): void {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath) && filePath.includes('/tmp/')) {
          fs.unlinkSync(filePath);
          console.log(`🧹 UPLOAD MANAGER: Cleaned up temp file ${filePath}`);
        }
      } catch (error) {
        console.warn(`⚠️ UPLOAD MANAGER: Failed to cleanup ${filePath}:`, error);
      }
    }
  }

  /**
   * Update upload configuration
   */
  updateConfig(newConfig: Partial<UploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 UPLOAD MANAGER: Configuration updated:', newConfig);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    s3Access: boolean;
    config: UploadConfig;
    capabilities: string[];
  }> {
    try {
      // Test S3 access
      const testKey = `health-check/${Date.now()}.txt`;
      await this.simpleUpload(testKey, Buffer.from('health-check'));
      
      return {
        status: 'healthy',
        s3Access: true,
        config: this.config,
        capabilities: [
          'Multipart upload',
          'Progress tracking',
          'Batch upload',
          'Automatic retry',
          'Metadata support'
        ]
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        s3Access: false,
        config: this.config,
        capabilities: []
      };
    }
  }
}

// Export singleton instance
export const uploadManager = new UploadManager();