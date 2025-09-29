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
    startMonitoring() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        console.log('🚀 MIGRATION MONITOR: Starting automatic URL migration service');
        this.intervalId = setInterval(async () => {
            await this.scanAndMigrateImages();
        }, 5 * 60 * 1000);
        this.scanAndMigrateImages();
    }
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('⏹️ MIGRATION MONITOR: Stopped');
    }
    async scanAndMigrateImages() {
        try {
            console.log('🔍 MIGRATION MONITOR: Scanning for temp URLs that need migration...');
            const recentImages = await this.getReplicateImages();
            if (recentImages === null) {
                console.log('⚠️ MIGRATION MONITOR: Database schema issue, skipping migration');
                return;
            }
            if (recentImages.length === 0) {
                console.log('✅ MIGRATION MONITOR: No temp URLs found - all images already permanent');
                return;
            }
            console.log(`🔄 MIGRATION MONITOR: Found ${recentImages.length} images with temp URLs - starting migration`);
            let successCount = 0;
            let failureCount = 0;
            for (const image of recentImages) {
                try {
                    const imageId = `migration_${image.id}_${Date.now()}`;
                    const permanentUrl = await ImageStorageService.ensurePermanentStorage(image.image_url, image.user_id, imageId);
                    await this.updateImageUrl(image.id, permanentUrl);
                    successCount++;
                    console.log(`✅ MIGRATION SUCCESS: Image ${image.id} migrated to permanent storage`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                catch (error) {
                    failureCount++;
                    console.error(`❌ MIGRATION FAILED: Image ${image.id} - ${error}`);
                }
            }
            console.log(`📊 MIGRATION MONITOR: Completed batch - ${successCount} successful, ${failureCount} failed`);
        }
        catch (error) {
            console.error('❌ MIGRATION MONITOR: Error during scan:', error);
        }
    }
    async getReplicateImages(limit = 20) {
        try {
            const sql = "SELECT id, user_id, image_url, created_at FROM ai_images WHERE image_url LIKE 'https://replicate.delivery%' AND created_at > NOW() - INTERVAL '24 hours' LIMIT $1";
            const result = await query(sql, [limit]);
            return result.rows;
        }
        catch (error) {
            if (error.message?.includes('column') && error.message?.includes('does not exist')) {
                console.log('⚠️ MIGRATION MONITOR: Database schema mismatch, migration paused until schema is updated');
                return null;
            }
            console.error('❌ MIGRATION MONITOR: Error fetching Replicate images:', error);
            return [];
        }
    }
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
    static async migrateUserImages(userId) {
        try {
            console.log(`🔄 MANUAL MIGRATION: Starting for user ${userId}`);
            const selectSql = "SELECT * FROM ai_images WHERE user_id = $1 AND image_url LIKE 'https://replicate.delivery%'";
            const result = await query(selectSql, [userId]);
            const userImages = result.rows;
            if (userImages.length === 0) {
                console.log(`✅ MANUAL MIGRATION: No temp URLs found for user ${userId}`);
                return;
            }
            console.log(`🔄 MANUAL MIGRATION: Found ${userImages.length} temp URLs for user ${userId}`);
            for (const image of userImages) {
                try {
                    const imageId = `manual_${image.id}_${Date.now()}`;
                    const permanentUrl = await ImageStorageService.ensurePermanentStorage(image.image_url, userId, imageId);
                    const updateSql = "UPDATE ai_images SET image_url = $1 WHERE id = $2";
                    await query(updateSql, [permanentUrl, image.id]);
                    console.log(`✅ MANUAL MIGRATION: Image ${image.id} migrated successfully`);
                }
                catch (error) {
                    console.error(`❌ MANUAL MIGRATION: Failed for image ${image.id}:`, error);
                }
            }
            console.log(`✅ MANUAL MIGRATION: Completed for user ${userId}`);
        }
        catch (error) {
            console.error(`❌ MANUAL MIGRATION: Error for user ${userId}:`, error);
        }
    }
}
export const migrationMonitor = MigrationMonitor.getInstance();
//# sourceMappingURL=migration-monitor.js.map