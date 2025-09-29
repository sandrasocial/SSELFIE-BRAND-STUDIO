import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { storage } from './storage.js';
export class ImageStorageService {
    static s3 = new S3Client({
        credentials: {
            accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
            secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
        },
        region: 'eu-north-1'
    });
    static BUCKET_NAME = process.env.AWS_S3_BUCKET;
    static MAX_RETRIES = 3;
    static RETRY_DELAY = 2000;
    static async migrateTempUrlToS3(tempUrl, userId) {
        try {
            const imageId = tempUrl.split('/').pop()?.split('.')[0] || `migrated-${Date.now()}`;
            const permanentUrl = await this.storeImagePermanently(tempUrl, userId, imageId);
            return {
                success: true,
                permanentUrl,
                originalUrl: tempUrl
            };
        }
        catch (error) {
            console.error('Failed to migrate temp URL to S3:', error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                originalUrl: tempUrl
            };
        }
    }
    static async storeImagePermanently(replicateUrl, userId, imageId) {
        try {
            console.log(`Storing image permanently: ${replicateUrl}`);
            if (!this.BUCKET_NAME) {
                const error = {
                    type: 'configuration',
                    message: 'AWS_S3_BUCKET environment variable is required'
                };
                throw error;
            }
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
                        console.log(`⚠️ S3 MIGRATION: Retrying download for ${replicateUrl} (attempt ${retries + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, (retries + 1) * 2000));
                        retries++;
                        continue;
                    }
                    const downloadError = {
                        type: 'download',
                        message: `Failed to download image after ${maxRetries} attempts: ${response.status} ${response.statusText}`,
                        url: replicateUrl
                    };
                    throw downloadError;
                }
                catch (error) {
                    if (retries >= maxRetries) {
                        throw error instanceof Error ? error : new Error(String(error));
                    }
                    retries++;
                }
            }
            const arrayBuffer = await response.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            if (imageBuffer.length === 0) {
                const validationError = {
                    type: 'validation',
                    message: 'Downloaded image is empty'
                };
                throw validationError;
            }
            if (imageBuffer.length < 1024) {
                const validationError = {
                    type: 'validation',
                    message: 'Downloaded image is too small (likely corrupted)'
                };
                throw validationError;
            }
            const timestamp = Date.now();
            const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
            const filename = `generated-images/${userId}/${imageId}_${timestamp}.${fileExtension}`;
            const upload = new Upload({
                client: this.s3,
                params: {
                    Bucket: this.BUCKET_NAME,
                    Key: filename,
                    Body: imageBuffer,
                    ContentType: contentType
                }
            });
            const uploadResult = await upload.done();
            const permanentUrl = `https://${this.BUCKET_NAME}.s3.${process.env["AWS_REGION"] || 'us-east-1'}.amazonaws.com/${filename}`;
            if (!uploadResult || !uploadResult.Location) {
                const uploadError = {
                    type: 'upload',
                    message: 'Upload result missing Location field',
                    key: filename
                };
                throw uploadError;
            }
            const result = {
                permanentUrl,
                size: imageBuffer.length,
                contentType,
                timestamp: Date.now()
            };
            console.log(`✅ S3 UPLOAD SUCCESS:`, result);
            return permanentUrl;
        }
        catch (error) {
            console.error('Error storing image permanently:', error);
            return replicateUrl;
        }
    }
    static async migrateTempImagesToS3(userId) {
        const results = [];
        try {
            console.log(`Starting migration for user ${userId}...`);
            const userImages = await storage.getAIImages(userId);
            for (const image of userImages) {
                if (this.isPermanentUrl(image.imageUrl)) {
                    continue;
                }
                if (!this.isValidImageUrl(image.imageUrl)) {
                    results.push({
                        success: false,
                        error: new Error('Invalid image URL'),
                        originalUrl: image.imageUrl
                    });
                    continue;
                }
                try {
                    const permanentUrl = await this.storeImagePermanently(image.imageUrl, userId, image.id.toString());
                    const { db } = await import('./db.js');
                    const { aiImages } = await import('../shared/schema.js');
                    const { eq } = await import('drizzle-orm');
                    await db
                        .update(aiImages)
                        .set({ imageUrl: permanentUrl })
                        .where(eq(aiImages.id, image.id));
                    console.log(`Migrated image ${image.id} to permanent storage`);
                    results.push({
                        success: true,
                        permanentUrl,
                        originalUrl: image.imageUrl
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.error(`Failed to migrate image ${image.id}:`, error);
                    results.push({
                        success: false,
                        error: error instanceof Error ? error : new Error(String(error)),
                        originalUrl: image.imageUrl
                    });
                }
            }
            console.log(`Migration completed for user ${userId}`);
            return results;
        }
        catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    }
    static async storeMultipleImages(replicateUrls, userId, baseImageId) {
        const results = [];
        for (let i = 0; i < replicateUrls.length; i++) {
            try {
                const permanentUrl = await this.storeImagePermanently(replicateUrls[i], userId, `${baseImageId}_${i}`);
                results.push({
                    permanentUrl,
                    size: 0,
                    contentType: 'image/jpeg',
                    timestamp: Date.now()
                });
            }
            catch (error) {
                console.error(`Failed to store image ${i}:`, error);
            }
        }
        return results;
    }
    static isPermanentUrl(url) {
        return url.includes('amazonaws.com') || url.includes('s3.');
    }
    static async ensurePermanentStorage(url, userId, imageId) {
        if (this.isPermanentUrl(url)) {
            return url;
        }
        return await this.storeImagePermanently(url, userId, imageId);
    }
    static isValidImageUrl(url) {
        return url.startsWith('http') && !url.includes('test.com');
    }
}
//# sourceMappingURL=image-storage-service.js.map