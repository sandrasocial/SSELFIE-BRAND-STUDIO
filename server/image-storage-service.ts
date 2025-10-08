import { S3Client, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { storage } from './storage.js';
import { AIImage, ImageStorageError, ImageUploadResult, MigrationResult } from '../shared/types/storage.js';

/**
 * Image Storage Service
 * Handles permanent storage of AI-generated images to S3
 * Ensures all user images are permanently available even when Replicate URLs expire
 */
export class ImageStorageService {
  private static s3 = new S3Client({
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
    },
    region: 'eu-north-1'  // Fixed region for bucket compatibility
  });

  private static readonly BUCKET_NAME = process.env.AWS_S3_BUCKET;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000;

  /**
   * Migrate temporary URL to permanent S3 URL
   */
  static async migrateTempUrlToS3(tempUrl: string, userId: string): Promise<MigrationResult> {
    try {
      // Extract image ID from temp URL or generate one
      const imageId = tempUrl.split('/').pop()?.split('.')[0] || `migrated-${Date.now()}`;
      const permanentUrl = await this.storeImagePermanently(tempUrl, userId, imageId);
      
      return {
        success: true,
        permanentUrl,
        originalUrl: tempUrl
      };
    } catch (error) {
      console.error('Failed to migrate temp URL to S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        originalUrl: tempUrl
      };
    }
  }

  /**
   * Downloads image from Replicate URL and uploads to S3 for permanent storage
   */
  static async storeImagePermanently(replicateUrl: string, userId: string, imageId: string): Promise<string> {
    try {
      
      if (!this.BUCKET_NAME) {
        const error: ImageStorageError = {
          type: 'configuration',
          message: 'AWS_S3_BUCKET environment variable is required'
        };
        throw error;
      }
      
      // Download image from Replicate with error handling and retries
      let response;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries <= maxRetries) {
        try {
          response = await fetch(replicateUrl, {
            headers: {
              'User-Agent': 'SSELFIE-Studio/1.0'
            }
          });
          
          if (response.ok) {
            break;
          }
          
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, (retries + 1) * 2000));
            retries++;
            continue;
          }
          
          const downloadError: ImageStorageError = {
        type: 'download',
        message: `Failed to download image after ${maxRetries} attempts: ${response.status} ${response.statusText}`,
        url: replicateUrl
      };
      throw downloadError;
          
        } catch (error) {
          if (retries >= maxRetries) {
            throw error instanceof Error ? error : new Error(String(error));
          }
          retries++;
        }
      }
      
      const arrayBuffer = await response!.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const contentType = response!.headers.get('content-type') || 'image/jpeg';
      
      // Validate image buffer
      if (imageBuffer.length === 0) {
        const validationError: ImageStorageError = {
          type: 'validation',
          message: 'Downloaded image is empty'
        };
        throw validationError;
      }
      
      if (imageBuffer.length < 1024) {
        const validationError: ImageStorageError = {
          type: 'validation',
          message: 'Downloaded image is too small (likely corrupted)'
        };
        throw validationError;
      }
      
      // Generate unique filename with better structure
      const timestamp = Date.now();
      const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
      const filename = `generated-images/${userId}/${imageId}_${timestamp}.${fileExtension}`;
      
      // Upload to S3 (without ACL since bucket doesn't support it)
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.BUCKET_NAME,
          Key: filename,
          Body: imageBuffer,
          ContentType: contentType
          // Note: Bucket must be configured with public read access at bucket level
        }
      });
      
      const uploadResult = await upload.done();
      const permanentUrl = `https://${this.BUCKET_NAME}.s3.${process.env["AWS_REGION"] || 'us-east-1'}.amazonaws.com/${filename}`;
      
      // Verify upload was successful
      if (!uploadResult || !uploadResult.Location) {
        const uploadError: ImageStorageError = {
          type: 'upload',
          message: 'Upload result missing Location field',
          key: filename
        };
        throw uploadError;
      }
      
      const result: ImageUploadResult = {
        permanentUrl,
        size: imageBuffer.length,
        contentType,
        timestamp: Date.now()
      };
      
      return permanentUrl;
      
    } catch (error) {
      console.error('Error storing image permanently:', error);
      // Return original URL as fallback
      return replicateUrl;
    }
  }

  /**
   * Batch process existing images to convert them to permanent storage
   */
  static async migrateTempImagesToS3(userId: string): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    
    try {
      
      const userImages = await storage.getAIImages(userId) as AIImage[];
      
      for (const image of userImages) {
        // Skip if already using S3 URL
        if (this.isPermanentUrl(image.imageUrl)) {
          continue;
        }
        
        // Skip if URL is broken or invalid
        if (!this.isValidImageUrl(image.imageUrl)) {
          results.push({
            success: false,
            error: new Error('Invalid image URL'),
            originalUrl: image.imageUrl
          });
          continue;
        }
        
        try {
          const permanentUrl = await this.storeImagePermanently(
            image.imageUrl, 
            userId, 
            image.id.toString()
          );
          
          // Update database with permanent URL directly
          const { db } = await import('./db.js');
          const { aiImages } = await import('../shared/schema.js');
          const { eq } = await import('drizzle-orm');
          
          await db
            .update(aiImages)
            .set({ imageUrl: permanentUrl })
            .where(eq(aiImages.id, image.id));
          
          
          results.push({
            success: true,
            permanentUrl,
            originalUrl: image.imageUrl
          });
          
          // Small delay to avoid overwhelming S3
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to migrate image ${image.id}:`, error);
          results.push({
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            originalUrl: image.imageUrl
          });
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  /**
   * Store multiple images permanently (for AI generation results)
   */
  static async storeMultipleImages(replicateUrls: string[], userId: string, baseImageId: string): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < replicateUrls.length; i++) {
      try {
        const permanentUrl = await this.storeImagePermanently(
          replicateUrls[i], 
          userId, 
          `${baseImageId}_${i}`
        );
        
        results.push({
          permanentUrl,
          size: 0, // Will be updated with actual size after upload
          contentType: 'image/jpeg', // Will be updated with actual content type
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Failed to store image ${i}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    return results;
  }

  /**
   * Check if URL is already permanent (S3)
   */
  static isPermanentUrl(url: string): boolean {
    return url.includes('amazonaws.com') || url.includes('s3.');
  }

  /**
   * Ensure image is permanently stored - converts if needed
   */
  static async ensurePermanentStorage(url: string, userId: string, imageId: string): Promise<string> {
    if (this.isPermanentUrl(url)) {
      return url; // Already permanent
    }
    
    return await this.storeImagePermanently(url, userId, imageId);
  }

  /**
   * Validate image URL format
   */
  private static isValidImageUrl(url: string): boolean {
    return url.startsWith('http') && !url.includes('test.com');
  }
}