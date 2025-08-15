import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { storage } from './storage';

/**
 * Image Storage Service
 * Handles permanent storage of AI-generated images to S3
 * Ensures all user images are permanently available even when Replicate URLs expire
 */
export class ImageStorageService {
  private static s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION || 'us-east-1'
  });

  private static readonly BUCKET_NAME = process.env.AWS_S3_BUCKET;

  /**
   * Downloads image from Replicate URL and uploads to S3 for permanent storage
   */
  static async storeImagePermanently(replicateUrl: string, userId: string, imageId: string): Promise<string> {
    try {
      console.log(`Storing image permanently: ${replicateUrl}`);
      
      if (!this.BUCKET_NAME) {
        throw new Error('AWS_S3_BUCKET environment variable is required');
      }
      
      // Download image from Replicate with error handling
      const response = await fetch(replicateUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
      const filename = `images/${userId}/${imageId}_${timestamp}.${fileExtension}`;
      
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
      const permanentUrl = `https://${this.BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
      
      console.log(`Image stored permanently at: ${permanentUrl}`);
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
  static async migrateTempImagesToS3(userId: string): Promise<void> {
    try {
      console.log(`Starting migration for user ${userId}...`);
      
      const userImages = await storage.getAIImages(userId);
      
      for (const image of userImages) {
        // Skip if already using S3 URL
        if (image.imageUrl.includes('amazonaws.com') || image.imageUrl.includes('s3.')) {
          continue;
        }
        
        // Skip if URL is broken or invalid
        if (!image.imageUrl.startsWith('http') || image.imageUrl.includes('test.com')) {
          console.log(`Skipping invalid URL: ${image.imageUrl}`);
          continue;
        }
        
        try {
          const permanentUrl = await this.storeImagePermanently(
            image.imageUrl, 
            userId, 
            image.id.toString()
          );
          
          // Update database with permanent URL directly
          const { db } = await import('./db');
          const { aiImages } = await import('../shared/schema-simplified');
          const { eq } = await import('drizzle-orm');
          
          await db
            .update(aiImages)
            .set({ imageUrl: permanentUrl })
            .where(eq(aiImages.id, image.id));
          
          console.log(`Migrated image ${image.id} to permanent storage`);
          
          // Small delay to avoid overwhelming S3
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to migrate image ${image.id}:`, error);
        }
      }
      
      console.log(`Migration completed for user ${userId}`);
      
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }

  /**
   * Store multiple images permanently (for AI generation results)
   */
  static async storeMultipleImages(replicateUrls: string[], userId: string, baseImageId: string): Promise<string[]> {
    const permanentUrls: string[] = [];
    
    for (let i = 0; i < replicateUrls.length; i++) {
      const permanentUrl = await this.storeImagePermanently(
        replicateUrls[i], 
        userId, 
        `${baseImageId}_${i}`
      );
      permanentUrls.push(permanentUrl);
    }
    
    return permanentUrls;
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
}