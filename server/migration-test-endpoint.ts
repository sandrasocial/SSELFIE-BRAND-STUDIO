/**
 * TEMPORARY MIGRATION TEST ENDPOINT
 * For testing the migration system manually
 */

import { Router } from 'express';
import { migrationMonitor } from './migration-monitor';
import { ImageStorageService } from './image-storage-service';

const router = Router();

// Test the migration system
router.post('/api/test-migration/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🧪 MIGRATION TEST: Starting manual test for user ${userId}`);
    
    // Trigger migration for this user
    await migrationMonitor.migrateUserImages(userId);
    
    res.json({
      success: true,
      message: `Migration test completed for user ${userId}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ MIGRATION TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Migration test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test a single URL migration
router.post('/api/test-single-migration', async (req, res) => {
  try {
    const { tempUrl, userId } = req.body;
    
    if (!tempUrl || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing tempUrl or userId'
      });
    }
    
    console.log(`🧪 SINGLE MIGRATION TEST: ${tempUrl} for user ${userId}`);
    
    const imageId = `test_${Date.now()}`;
    const permanentUrl = await ImageStorageService.ensurePermanentStorage(tempUrl, userId, imageId);
    
    res.json({
      success: true,
      originalUrl: tempUrl,
      permanentUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ SINGLE MIGRATION TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Single migration test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;