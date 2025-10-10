/**
 * S3 Operations Service
 * Handles all S3 storage operations for training and images
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
const archiver = require('archiver');
import { createHash } from 'node:crypto';

export interface S3UploadConfig {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
  etag?: string;
}

/**
 * Service for all S3 storage operations
 */
export class S3OperationsService {
  private db: IStorage;
  private s3: S3Client;
  private defaultBucket: string;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    // Initialize S3 client
    this.s3 = new S3Client({
      region: process.env['AWS_REGION'] || 'eu-west-1',
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || ''
      }
    });
    
    this.defaultBucket = process.env['AWS_S3_BUCKET'] || 'sselfie-studio-assets';
    
    console.log(`✅ S3 OPERATIONS: Initialized with bucket ${this.defaultBucket}`);
  }

  /**
   * Upload file to S3
   */
  async uploadFile(config: S3UploadConfig): Promise<S3UploadResult> {
    try {
      console.log(`📁 S3 OPERATIONS: Uploading file to ${config.bucket}/${config.key}`);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: config.key,
        Body: config.body,
        ContentType: config.contentType || 'application/octet-stream',
        Metadata: config.metadata || {}
      });

      const result = await this.s3.send(command);
      
      const url = `https://${config.bucket}.s3.amazonaws.com/${config.key}`;
      
      console.log(`✅ S3 OPERATIONS: File uploaded successfully to ${url}`);
      
      return {
        url,
        key: config.key,
        bucket: config.bucket,
        etag: result.ETag
      };
      
    } catch (error) {
      console.error(`❌ S3 OPERATIONS: Upload failed for ${config.key}:`, error);
      throw error;
    }
  }

  /**
   * Create ZIP archive of images and upload to S3
   */
  async createAndUploadImageZip(
    imageUrls: string[], 
    userId: string, 
    zipName: string = 'training-images.zip'
  ): Promise<S3UploadResult> {
    try {
      console.log(`📦 S3 OPERATIONS: Creating ZIP archive for ${imageUrls.length} images`);

      // Create temporary directory for processing
      const tempDir = `/tmp/training-${userId}-${Date.now()}`;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Download images to temporary directory
      const imageFiles: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const filename = `image_${i + 1}.jpg`;
        const filepath = path.join(tempDir, filename);
        
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`⚠️ S3 OPERATIONS: Failed to download image ${imageUrl}`);
            continue;
          }
          
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(filepath, buffer);
          imageFiles.push(filepath);
          
          console.log(`📥 Downloaded image ${i + 1}/${imageUrls.length}`);
          
        } catch (error) {
          console.warn(`⚠️ S3 OPERATIONS: Error downloading image ${imageUrl}:`, error);
        }
      }

      if (imageFiles.length === 0) {
        throw new Error('No images could be downloaded for ZIP archive');
      }

      // Create ZIP archive
      const zipPath = path.join(tempDir, zipName);
      await this.createZipArchive(imageFiles, zipPath);

      // Upload ZIP to S3
      const zipBuffer = fs.readFileSync(zipPath);
      const s3Key = `training-data/${userId}/${Date.now()}-${zipName}`;
      
      const uploadResult = await this.uploadFile({
        bucket: this.defaultBucket,
        key: s3Key,
        body: zipBuffer,
        contentType: 'application/zip',
        metadata: {
          userId: userId,
          imageCount: imageFiles.length.toString(),
          createdAt: new Date().toISOString()
        }
      });

      // Cleanup temporary files
      this.cleanupTempDir(tempDir);

      console.log(`✅ S3 OPERATIONS: ZIP archive uploaded with ${imageFiles.length} images`);
      return uploadResult;

    } catch (error) {
      console.error('❌ S3 OPERATIONS: ZIP creation and upload failed:', error);
      throw error;
    }
  }

  /**
   * Create ZIP archive from file paths
   */
  private async createZipArchive(filePaths: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`📦 S3 OPERATIONS: ZIP archive created (${archive.pointer()} bytes)`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ S3 OPERATIONS: ZIP creation error:', err);
        reject(err);
      });

      archive.pipe(output);

      // Add files to archive
      filePaths.forEach((filePath, index) => {
        const filename = path.basename(filePath);
        archive.file(filePath, { name: filename });
      });

      archive.finalize();
    });
  }

  /**
   * Generate signed URL for temporary access
   */
  async generateSignedUrl(
    key: string, 
    expiresIn: number = 3600, 
    bucket?: string
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket || this.defaultBucket,
        Key: key
      });

      const url = await getSignedUrl(this.s3, command, { expiresIn });
      
      console.log(`🔗 S3 OPERATIONS: Generated signed URL for ${key} (expires in ${expiresIn}s)`);
      return url;
      
    } catch (error) {
      console.error(`❌ S3 OPERATIONS: Failed to generate signed URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Download image from Replicate and upload to S3 for permanent storage
   */
  async migrateReplicateImage(replicateUrl: string, userId: string): Promise<string> {
    try {
      console.log(`🔄 S3 OPERATIONS: Migrating Replicate image to S3`);

      // Download image from Replicate
      const response = await fetch(replicateUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Generate unique S3 key
      const hash = (createHash('md5') as any).update(buffer).digest('hex').substring(0, 8);
      const timestamp = Date.now();
      const s3Key = `generated-images/${userId}/${timestamp}-${hash}.jpg`;

      // Upload to S3
      const uploadResult = await this.uploadFile({
        bucket: this.defaultBucket,
        key: s3Key,
        body: buffer,
        contentType: 'image/jpeg',
        metadata: {
          userId: userId,
          source: 'replicate',
          originalUrl: replicateUrl,
          migratedAt: new Date().toISOString()
        }
      });

      console.log(`✅ S3 OPERATIONS: Migrated image to ${uploadResult.url}`);
      return uploadResult.url;

    } catch (error) {
      console.error('❌ S3 OPERATIONS: Image migration failed:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string, bucket?: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket || this.defaultBucket,
        Key: key
      });

      await this.s3.send(command);
      
      console.log(`✅ S3 OPERATIONS: Deleted file ${key}`);
      return true;
      
    } catch (error) {
      console.error(`❌ S3 OPERATIONS: Failed to delete file ${key}:`, error);
      return false;
    }
  }

  /**
   * Generate file hash for deduplication
   */
  generateFileHash(buffer: Buffer): string {
    return (createHash('md5') as any).update(buffer).digest('hex');
  }

  /**
   * Cleanup temporary directory
   */
  private cleanupTempDir(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`🧹 S3 OPERATIONS: Cleaned up temporary directory ${dirPath}`);
      }
    } catch (error) {
      console.warn(`⚠️ S3 OPERATIONS: Failed to cleanup temp directory ${dirPath}:`, error);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    s3Access: boolean;
    bucket: string;
    error?: string;
  }> {
    try {
      // Test S3 access by attempting to list objects (limit 1)
      const command = new GetObjectCommand({
        Bucket: this.defaultBucket,
        Key: 'health-check-test'
      });
      
      // We expect this to fail (file doesn't exist) but it tests connectivity
      try {
        await this.s3.send(command);
      } catch (error: any) {
        // NoSuchKey error means S3 is accessible but file doesn't exist (expected)
        if (error.name !== 'NoSuchKey') {
          throw error;
        }
      }

      return {
        status: 'healthy',
        s3Access: true,
        bucket: this.defaultBucket
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        s3Access: false,
        bucket: this.defaultBucket,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const s3OperationsService = new S3OperationsService();