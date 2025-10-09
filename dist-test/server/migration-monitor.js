/**
 * CRITICAL MIGRATION MONITOR - PREVENTS IMAGE LOSS
 * Automatically detects and migrates Replicate temp URLs to permanent S3 storage
 * Runs continuously to ensure no images are lost due to URL expiration
 */
import { query } from './db.js';
import { ImageStorageService } from './image-storage-service.js';
export class MigrationMonitor {
    static instance;
    isRunning = false;
    intervalId = null;
    static getInstance() {
        if (!MigrationMonitor.instance) {
            MigrationMonitor.instance = new MigrationMonitor();
        }
        return MigrationMonitor.instance;
    }
    /**
     * Start monitoring for images that need migration
     */
    startMonitoring() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        // Check every 5 minutes for images that need migration
        this.intervalId = setInterval(async () => {
            await this.scanAndMigrateImages();
        }, 5 * 60 * 1000); // 5 minutes
        // Run initial scan immediately
        this.scanAndMigrateImages();
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }
    /**
     * Scan database for Replicate URLs and migrate them to S3
     */
    async scanAndMigrateImages() {
        try {
            // Get all images with Replicate URLs from the last 24 hours
            const recentImages = await this.getReplicateImages();
            if (recentImages === null) {
                return;
            }
            if (recentImages.length === 0) {
                return;
            }
            let successCount = 0;
            let failureCount = 0;
            for (const image of recentImages) {
                try {
                    const imageId = `migration_${image.id}_${Date.now()}`;
                    const permanentUrl = await ImageStorageService.ensurePermanentStorage(image.image_url, image.user_id, imageId);
                    // Update database with permanent URL
                    await this.updateImageUrl(image.id, permanentUrl);
                    successCount++;
                    // Small delay to avoid overwhelming S3
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                catch (error) {
                    failureCount++;
                    console.error(`❌ MIGRATION FAILED: Image ${image.id} - ${error}`);
                }
            }
        }
        catch (error) {
            console.error('❌ MIGRATION MONITOR: Error during scan:', error);
        }
    }
    /**
     * Get images with Replicate URLs that need migration
     */
    async getReplicateImages(limit = 20) {
        try {
            const sql = "SELECT id, user_id, image_url, created_at FROM ai_images WHERE image_url LIKE 'https://replicate.delivery%' AND created_at > NOW() - INTERVAL '24 hours' LIMIT $1";
            const result = await query(sql, [limit]);
            return result.rows || result;
        }
        catch (error) {
            // Handle schema mismatches gracefully
            if (error.message?.includes('column') && error.message?.includes('does not exist')) {
                return null;
            }
            console.error('❌ MIGRATION MONITOR: Error fetching Replicate images:', error);
            return [];
        }
    }
    /**
     * Update image URL in database
     */
    async updateImageUrl(imageId, permanentUrl) {
        try {
            const sql = "UPDATE ai_images SET image_url = $1 WHERE id = $2";
            await query(sql, [permanentUrl, imageId]);
        }
        catch (error) {
            console.error(`❌ MIGRATION MONITOR: Error updating image ${imageId}:`, error);
            throw error;
        }
    }
    /**
     * Manually trigger migration for specific user
     */
    static async migrateUserImages(userId) {
        try {
            const selectSql = "SELECT * FROM ai_images WHERE user_id = $1 AND image_url LIKE 'https://replicate.delivery%'";
            const result = await query(selectSql, [userId]);
            const userImages = result.rows || result;
            if (userImages.length === 0) {
                return;
            }
            for (const image of userImages) {
                try {
                    const imageId = `manual_${image.id}_${Date.now()}`;
                    const permanentUrl = await ImageStorageService.ensurePermanentStorage(image.image_url, userId, imageId);
                    const updateSql = "UPDATE ai_images SET image_url = $1 WHERE id = $2";
                    await query(updateSql, [permanentUrl, image.id]);
                }
                catch (error) {
                    console.error(`❌ MANUAL MIGRATION: Failed for image ${image.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error(`❌ MANUAL MIGRATION: Error for user ${userId}:`, error);
        }
    }
}
// Export singleton instance
export const migrationMonitor = MigrationMonitor.getInstance();
