import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { db } from './db';
import { sql } from 'drizzle-orm';

interface S3ImageData {
  url: string;
  key: string;
  lastModified: Date;
  size: number;
}

export class S3GalleryImporter {
  private s3Client: S3Client;
  private bucketName = 'sselfie-training-zips';

  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async importAllUserImages(userId: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
    console.log(`🔍 S3 IMPORT: Starting comprehensive import for user ${userId}`);
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      // Get all S3 images for this user
      const s3Images = await this.getAllUserS3Images(userId);
      console.log(`📦 S3 IMPORT: Found ${s3Images.length} images in S3 for user ${userId}`);

      // Get existing images from database to avoid duplicates
      const existingImages = await this.getExistingDatabaseImages(userId);
      const existingUrls = new Set(existingImages.map(img => img.image_url));
      console.log(`💾 S3 IMPORT: Found ${existingImages.length} existing images in database`);

      // Process each S3 image
      for (const s3Image of s3Images) {
        try {
          if (existingUrls.has(s3Image.url)) {
            skipped++;
            continue;
          }

          // Extract metadata from S3 key
          const metadata = this.extractImageMetadata(s3Image.key, s3Image.url);
          
          // Insert into database
          await db.execute(sql`
            INSERT INTO ai_images (
              user_id, 
              image_url, 
              prompt, 
              style, 
              is_selected, 
              created_at, 
              prediction_id, 
              generation_status, 
              is_favorite
            ) VALUES (
              ${userId},
              ${s3Image.url},
              ${metadata.prompt},
              ${metadata.style},
              false,
              ${s3Image.lastModified.toISOString()},
              ${metadata.predictionId},
              'completed',
              false
            )
          `);
          
          imported++;
          
          if (imported % 50 === 0) {
            console.log(`📈 S3 IMPORT: Imported ${imported} images so far...`);
          }
          
        } catch (error) {
          const errorMsg = `Failed to import ${s3Image.key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ S3 IMPORT: ${errorMsg}`);
        }
      }

    } catch (error) {
      const errorMsg = `Failed to complete S3 import: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`❌ S3 IMPORT: ${errorMsg}`);
    }

    console.log(`✅ S3 IMPORT COMPLETE: Imported ${imported}, Skipped ${skipped}, Errors ${errors.length}`);
    return { imported, skipped, errors };
  }

  private async getAllUserS3Images(userId: string): Promise<S3ImageData[]> {
    const images: S3ImageData[] = [];
    
    // Search multiple S3 paths where user images might be stored
    const searchPaths = [
      `images/${userId}/`,           // Main images path
      `generated-images/${userId}/`, // Generated images path
      `migrated-images/${userId}/`,  // Migrated images path
      `training-images/${userId}/`   // Training images path
    ];

    for (const prefix of searchPaths) {
      try {
        let continuationToken: string | undefined = undefined;
        
        do {
          const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
            MaxKeys: 1000
          });

          const response = await this.s3Client.send(command);
          
          if (response.Contents) {
            for (const object of response.Contents) {
              if (object.Key && this.isImageFile(object.Key)) {
                images.push({
                  url: `https://${this.bucketName}.s3.eu-north-1.amazonaws.com/${object.Key}`,
                  key: object.Key,
                  lastModified: object.LastModified || new Date(),
                  size: object.Size || 0
                });
              }
            }
          }
          
          continuationToken = response.NextContinuationToken;
          
        } while (continuationToken);
        
      } catch (error) {
        console.warn(`⚠️ S3 IMPORT: Could not search path ${prefix}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return images;
  }

  private async getExistingDatabaseImages(userId: string): Promise<{image_url: string}[]> {
    const result = await db.execute(sql`
      SELECT image_url FROM ai_images WHERE user_id = ${userId}
    `);
    return result as {image_url: string}[];
  }

  private isImageFile(key: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const lowerKey = key.toLowerCase();
    return imageExtensions.some(ext => lowerKey.endsWith(ext));
  }

  private extractImageMetadata(key: string, url: string) {
    // Extract generation info from S3 key patterns
    let predictionId = 'imported_from_s3';
    let prompt = 'AI-generated image imported from S3 storage';
    let style = 'Sandra Editorial';

    // Try to extract prediction ID from key patterns
    const trackerMatch = key.match(/tracker_(\d+)/);
    const migrationMatch = key.match(/migration_(\d+)/);
    
    if (trackerMatch) {
      predictionId = `tracker_${trackerMatch[1]}`;
    } else if (migrationMatch) {
      predictionId = `migration_${migrationMatch[1]}`;
    }

    // Determine style based on path
    if (key.includes('editorial')) {
      style = 'Sandra Editorial';
    } else if (key.includes('luxury')) {
      style = 'Luxury Collection';
    } else if (key.includes('street')) {
      style = 'Street Style';
    }

    return {
      predictionId,
      prompt,
      style
    };
  }
}