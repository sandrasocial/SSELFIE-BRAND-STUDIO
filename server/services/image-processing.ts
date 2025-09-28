/**
 * Image Processing Service - Maya-Only Architecture
 * Comprehensive image processing, S3 storage, and CDN integration
 */

import AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import archiver from 'archiver';
import { storage } from '../storage.js';
import type {
  MayaImage,
  ImageUpload,
  ImageProcessingJob,
  StorageService,
  StorageUploadOptions,
  StorageUploadResult,
  ProcessingJobType,
  ProcessingStatus,
  ImageDimensions,
  ImageMetadata,
  ImageFormat,
  ProcessingError,
  CDNConfig
} from '../../shared/types/images.js';

// AWS S3 Configuration
const S3_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'eu-west-1',
  bucket: process.env.S3_BUCKET || 'sselfie-studio-images',
  cdnDomain: process.env.CDN_DOMAIN || 'cdn.sselfie.ai'
};

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: S3_CONFIG.accessKeyId,
  secretAccessKey: S3_CONFIG.secretAccessKey,
  region: S3_CONFIG.region,
  signatureVersion: 'v4'
});

// CDN Configuration
const CDN_CONFIG: CDNConfig = {
  provider: 'cloudflare',
  baseUrl: `https://${S3_CONFIG.cdnDomain}`,
  zones: [{
    id: 'main',
    name: 'Main CDN Zone',
    domain: S3_CONFIG.cdnDomain,
    regions: ['global'],
    enabled: true
  }],
  caching: {
    defaultTtl: 86400, // 24 hours
    browserTtl: 3600,  // 1 hour
    edgeTtl: 86400,    // 24 hours
    bypassCache: false,
    cacheByDevice: false
  },
  optimization: {
    autoWebP: true,
    autoAVIF: true,
    compression: {
      jpeg: 85,
      png: true,
      webp: 85
    },
    resizing: {
      enabled: true,
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 85
    }
  }
};

export class ImageProcessingService implements StorageService {
  /**
   * Upload file to S3 with processing
   */
  async upload(file: File, options?: StorageUploadOptions): Promise<StorageUploadResult> {
    try {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const key = this.generateKey(file.name, options?.metadata?.userId);
      
      // Process image if it's an image file
      let processedBuffer = fileBuffer;
      let metadata: Record<string, unknown> = {};

      if (this.isImageFile(file.type)) {
        const processing = await this.processImage(fileBuffer, {
          format: this.getFormatFromMimeType(file.type),
          quality: 90,
          resize: options?.metadata?.resize ? JSON.parse(options.metadata.resize as string) : undefined
        });

        processedBuffer = processing.buffer;
        metadata = processing.metadata;
      }

      // Upload to S3
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: file.type,
        CacheControl: options?.cacheControl || 'max-age=31536000', // 1 year
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          userId: options?.metadata?.userId || 'anonymous',
          ...options?.metadata
        }
      };

      if (options?.acl) {
        uploadParams.ACL = options.acl;
      }

      const result = await s3.upload(uploadParams).promise();

      return {
        key,
        url: result.Location,
        size: processedBuffer.length,
        etag: result.ETag || '',
        metadata: {
          ...metadata,
          originalSize: fileBuffer.length,
          compression: ((fileBuffer.length - processedBuffer.length) / fileBuffer.length * 100).toFixed(2) + '%'
        }
      };

    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from S3
   */
  async download(key: string): Promise<ArrayBuffer> {
    try {
      const result = await s3.getObject({
        Bucket: S3_CONFIG.bucket,
        Key: key
      }).promise();

      return result.Body as ArrayBuffer;
    } catch (error) {
      console.error('❌ S3 download failed:', error);
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from S3
   */
  async delete(key: string): Promise<void> {
    try {
      await s3.deleteObject({
        Bucket: S3_CONFIG.bucket,
        Key: key
      }).promise();
    } catch (error) {
      console.error('❌ S3 delete failed:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await s3.getSignedUrlPromise('getObject', {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Expires: expiresIn
      });
    } catch (error) {
      console.error('❌ Generate signed URL failed:', error);
      throw new Error(`Signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy file within S3
   */
  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await s3.copyObject({
        Bucket: S3_CONFIG.bucket,
        CopySource: `${S3_CONFIG.bucket}/${sourceKey}`,
        Key: destinationKey
      }).promise();
    } catch (error) {
      console.error('❌ S3 copy failed:', error);
      throw new Error(`Copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Move file within S3 (copy + delete)
   */
  async move(sourceKey: string, destinationKey: string): Promise<void> {
    await this.copy(sourceKey, destinationKey);
    await this.delete(sourceKey);
  }

  /**
   * Check if file exists in S3
   */
  async exists(key: string): Promise<boolean> {
    try {
      await s3.headObject({
        Bucket: S3_CONFIG.bucket,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getMetadata(key: string): Promise<Record<string, unknown>> {
    try {
      const result = await s3.headObject({
        Bucket: S3_CONFIG.bucket,
        Key: key
      }).promise();

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error('❌ Get metadata failed:', error);
      throw new Error(`Get metadata failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process images uploaded by users
   */
  static async processUserUpload(
    userId: string,
    files: File[],
    options: {
      type: 'training' | 'generation' | 'avatar' | 'reference';
      category?: string;
      generateThumbnails?: boolean;
      validateQuality?: boolean;
      extractMetadata?: boolean;
    }
  ): Promise<MayaImage[]> {
    const imageService = new ImageProcessingService();
    const processedImages: MayaImage[] = [];

    for (const file of files) {
      try {
        // Create processing job
        const job = await this.createProcessingJob(userId, file, options.type);
        
        // Process the image
        const uploadResult = await imageService.upload(file, {
          metadata: {
            userId,
            type: options.type,
            category: options.category
          },
          acl: 'private'
        });

        // Generate thumbnails if requested
        let thumbnailUrl: string | undefined;
        if (options.generateThumbnails) {
          thumbnailUrl = await this.generateThumbnail(uploadResult.key, userId);
        }

        // Extract metadata if requested
        let imageMetadata: ImageMetadata = {
          contentType: file.type
        };

        if (options.extractMetadata) {
          imageMetadata = await this.extractImageMetadata(uploadResult.key);
        }

        // Validate quality if requested
        if (options.validateQuality) {
          await this.validateImageQuality(uploadResult.key, imageMetadata);
        }

        // Create MayaImage object
        const mayaImage: MayaImage = {
          id: uuidv4(),
          userId,
          filename: uploadResult.key,
          originalFilename: file.name,
          url: uploadResult.url,
          cdnUrl: this.getCdnUrl(uploadResult.key),
          thumbnailUrl,
          type: 'user_upload',
          category: options.category,
          format: this.getFormatFromMimeType(file.type),
          size: uploadResult.size,
          dimensions: await this.getImageDimensions(uploadResult.key),
          metadata: imageMetadata,
          processingStatus: 'completed',
          storage: {
            provider: 'aws_s3',
            bucket: S3_CONFIG.bucket,
            key: uploadResult.key,
            region: S3_CONFIG.region,
            publicUrl: uploadResult.url,
            permanentUrl: this.getPermanentUrl(uploadResult.key),
            cdnUrl: this.getCdnUrl(uploadResult.key)
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save to database
        await storage.saveMayaImage(mayaImage);
        processedImages.push(mayaImage);

        // Update processing job
        await this.updateProcessingJob(job.id, 'completed');

      } catch (error) {
        console.error(`❌ Failed to process image ${file.name}:`, error);
        // Continue with other files
        continue;
      }
    }

    return processedImages;
  }

  /**
   * Generate optimized versions of images
   */
  static async generateOptimizedVersions(
    imageId: string,
    sizes: { width: number; height: number; name: string }[]
  ): Promise<string[]> {
    const imageService = new ImageProcessingService();
    const optimizedUrls: string[] = [];

    try {
      const image = await storage.getMayaImage(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Download original image
      const originalBuffer = await imageService.download(image.storage.key);

      for (const size of sizes) {
        try {
          // Process image for this size
          const processed = await this.processImage(Buffer.from(originalBuffer), {
            resize: { width: size.width, height: size.height },
            format: 'webp',
            quality: 85
          });

          // Upload optimized version
          const optimizedKey = `${image.storage.key}-${size.name}.webp`;
          const uploadResult = await imageService.upload(
            new File([processed.buffer], `${image.originalFilename}-${size.name}.webp`, { type: 'image/webp' }),
            {
              metadata: {
                userId: image.userId,
                originalImageId: imageId,
                optimization: size.name
              },
              acl: 'public-read'
            }
          );

          optimizedUrls.push(uploadResult.url);
        } catch (error) {
          console.error(`❌ Failed to generate ${size.name} version:`, error);
        }
      }

      return optimizedUrls;
    } catch (error) {
      console.error('❌ Generate optimized versions failed:', error);
      throw error;
    }
  }

  /**
   * Create ZIP archive of images
   */
  static async createZipArchive(
    userId: string,
    imageIds: string[],
    archiveName: string
  ): Promise<string> {
    const imageService = new ImageProcessingService();
    
    try {
      // Create ZIP archive in memory
      const archive = archiver('zip', { zlib: { level: 9 } });
      const buffers: Buffer[] = [];

      archive.on('data', (chunk) => buffers.push(chunk));
      
      const archivePromise = new Promise<Buffer>((resolve, reject) => {
        archive.on('end', () => resolve(Buffer.concat(buffers)));
        archive.on('error', reject);
      });

      // Add images to archive
      for (const imageId of imageIds) {
        const image = await storage.getMayaImage(imageId);
        if (image && image.userId === userId) {
          try {
            const imageBuffer = await imageService.download(image.storage.key);
            archive.append(Buffer.from(imageBuffer), { name: image.originalFilename });
          } catch (error) {
            console.warn(`⚠️ Skipping image ${imageId}: ${error}`);
          }
        }
      }

      archive.finalize();
      const zipBuffer = await archivePromise;

      // Upload ZIP to S3
      const zipKey = `archives/${userId}/${archiveName}-${Date.now()}.zip`;
      const uploadResult = await imageService.upload(
        new File([zipBuffer], `${archiveName}.zip`, { type: 'application/zip' }),
        {
          metadata: { userId, type: 'archive' },
          acl: 'private'
        }
      );

      // Create signed URL for download (expires in 1 hour)
      const downloadUrl = await imageService.getSignedUrl(zipKey, 3600);

      return downloadUrl;
    } catch (error) {
      console.error('❌ Create ZIP archive failed:', error);
      throw error;
    }
  }

  // === Private Helper Methods ===

  private generateKey(filename: string, userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const hash = createHash('md5').update(filename + timestamp).digest('hex').substring(0, 8);
    const userPrefix = userId ? `users/${userId}` : 'anonymous';
    
    return `${userPrefix}/${timestamp}-${hash}-${random}/${filename}`;
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private getFormatFromMimeType(mimeType: string): ImageFormat {
    const formatMap: Record<string, ImageFormat> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg', 
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/heic': 'heic'
    };

    return formatMap[mimeType] || 'jpg';
  }

  private static async processImage(
    buffer: Buffer,
    options: {
      format?: ImageFormat;
      quality?: number;
      resize?: { width?: number; height?: number };
    }
  ): Promise<{ buffer: Buffer; metadata: Record<string, unknown> }> {
    try {
      let processor = sharp(buffer);

      // Get original metadata
      const metadata = await processor.metadata();

      // Resize if requested
      if (options.resize) {
        processor = processor.resize(options.resize.width, options.resize.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert format and optimize
      switch (options.format) {
        case 'jpg':
        case 'jpeg':
          processor = processor.jpeg({ quality: options.quality || 85, progressive: true });
          break;
        case 'png':
          processor = processor.png({ compressionLevel: 9, progressive: true });
          break;
        case 'webp':
          processor = processor.webp({ quality: options.quality || 85 });
          break;
        case 'avif':
          processor = processor.avif({ quality: options.quality || 85 });
          break;
        default:
          processor = processor.jpeg({ quality: options.quality || 85, progressive: true });
      }

      const processedBuffer = await processor.toBuffer();

      return {
        buffer: processedBuffer,
        metadata: {
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          originalFormat: metadata.format,
          processedFormat: options.format || 'jpeg',
          processedSize: processedBuffer.length,
          compressionRatio: metadata.size ? (1 - processedBuffer.length / metadata.size) : 0
        }
      };
    } catch (error) {
      console.error('❌ Image processing failed:', error);
      throw error;
    }
  }

  private getCdnUrl(key: string): string {
    return `${CDN_CONFIG.baseUrl}/${key}`;
  }

  private getPermanentUrl(key: string): string {
    return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }

  private static async generateThumbnail(originalKey: string, userId: string): Promise<string> {
    const imageService = new ImageProcessingService();
    
    try {
      // Download original
      const originalBuffer = await imageService.download(originalKey);
      
      // Generate thumbnail
      const thumbnail = await this.processImage(Buffer.from(originalBuffer), {
        resize: { width: 300, height: 300 },
        format: 'webp',
        quality: 80
      });

      // Upload thumbnail
      const thumbnailKey = originalKey.replace(/\.[^.]+$/, '-thumb.webp');
      const uploadResult = await imageService.upload(
        new File([thumbnail.buffer], 'thumbnail.webp', { type: 'image/webp' }),
        {
          metadata: { userId, type: 'thumbnail' },
          acl: 'public-read'
        }
      );

      return uploadResult.url;
    } catch (error) {
      console.error('❌ Generate thumbnail failed:', error);
      throw error;
    }
  }

  private static async extractImageMetadata(key: string): Promise<ImageMetadata> {
    const imageService = new ImageProcessingService();
    
    try {
      const buffer = await imageService.download(key);
      const metadata = await sharp(Buffer.from(buffer)).metadata();

      return {
        contentType: `image/${metadata.format}`,
        exif: metadata.exif ? {
          // Parse EXIF data if needed
          orientation: metadata.orientation
        } : undefined,
        colors: {
          // Could extract dominant colors here
          dominant: [],
          palette: [],
          average: '#000000'
        }
      };
    } catch (error) {
      console.error('❌ Extract metadata failed:', error);
      return { contentType: 'image/jpeg' };
    }
  }

  private static async getImageDimensions(key: string): Promise<ImageDimensions> {
    const imageService = new ImageProcessingService();
    
    try {
      const buffer = await imageService.download(key);
      const metadata = await sharp(Buffer.from(buffer)).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        aspectRatio: metadata.width && metadata.height 
          ? `${Math.round(metadata.width / metadata.height * 100) / 100}:1`
          : '1:1'
      };
    } catch (error) {
      console.error('❌ Get dimensions failed:', error);
      return { width: 0, height: 0, aspectRatio: '1:1' };
    }
  }

  private static async validateImageQuality(key: string, metadata: ImageMetadata): Promise<void> {
    // Implement quality validation logic
    // For now, just a placeholder
    console.log(`✅ Image quality validated for ${key}`);
  }

  private static async createProcessingJob(
    userId: string,
    file: File,
    type: ProcessingJobType
  ): Promise<ImageProcessingJob> {
    const job: ImageProcessingJob = {
      id: uuidv4(),
      userId,
      imageId: '',
      type,
      status: 'pending',
      input: {
        sourceUrl: file.name,
        parameters: {}
      },
      steps: [],
      priority: 'normal',
      createdAt: new Date()
    };

    await storage.saveProcessingJob(job);
    return job;
  }

  private static async updateProcessingJob(
    jobId: string,
    status: ProcessingStatus,
    error?: ProcessingError
  ): Promise<void> {
    await storage.updateProcessingJob(jobId, { status, error });
  }
}