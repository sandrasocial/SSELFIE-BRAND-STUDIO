/**
 * TRACKER SYNC SERVICE
 * Comprehensive system to sync generation trackers with actual Replicate prediction status
 * Fixes the core issue where polling stops working and trackers get stuck
 */

import { storage } from './storage';

export class TrackerSyncService {
  private static readonly MAX_PROCESSING_HOURS = 2; // Mark as stale after 2 hours
  
  /**
   * Sync all processing trackers with Replicate API
   * This is the core fix for stuck generations
   */
  static async syncAllProcessingTrackers(): Promise<void> {
    try {
      console.log('🔄 TRACKER SYNC: Starting comprehensive sync of all processing trackers...');
      
      // Get all processing trackers
      const processingTrackers = await storage.getProcessingGenerationTrackers();
      
      if (!processingTrackers || processingTrackers.length === 0) {
        console.log('✅ TRACKER SYNC: No processing trackers found');
        return;
      }
      
      console.log(`🔍 TRACKER SYNC: Found ${processingTrackers.length} processing trackers to sync`);
      
      // Process each tracker
      for (const tracker of processingTrackers) {
        await this.syncSingleTracker(tracker);
      }
      
      console.log('✅ TRACKER SYNC: Comprehensive sync completed');
      
    } catch (error) {
      console.error('❌ TRACKER SYNC ERROR:', error);
    }
  }
  
  /**
   * Sync a single tracker with Replicate API
   */
  static async syncSingleTracker(tracker: any): Promise<void> {
    try {
      console.log(`🔍 TRACKER SYNC: Checking tracker ${tracker.id} (prediction: ${tracker.prediction_id})`);
      
      // Check if tracker is stale (stuck for too long)
      const hoursStuck = this.getHoursStuck(tracker.created_at);
      if (hoursStuck > this.MAX_PROCESSING_HOURS) {
        console.log(`⏰ TRACKER SYNC: Tracker ${tracker.id} stuck for ${hoursStuck.toFixed(1)} hours - marking as stale`);
        await storage.updateGenerationTracker(tracker.id, {
          status: 'failed',
          imageUrls: JSON.stringify(['Generation timeout - stuck for too long'])
        });
        return;
      }
      
      // Check actual Replicate status
      if (tracker.prediction_id) {
        const replicateStatus = await this.checkReplicateStatus(tracker.prediction_id);
        
        if (replicateStatus) {
          await this.updateTrackerFromReplicate(tracker.id, replicateStatus);
        } else {
          console.log(`❌ TRACKER SYNC: Could not get Replicate status for tracker ${tracker.id}`);
        }
      } else {
        console.log(`⚠️ TRACKER SYNC: Tracker ${tracker.id} has no prediction_id`);
      }
      
    } catch (error) {
      console.error(`❌ TRACKER SYNC ERROR for tracker ${tracker.id}:`, error);
    }
  }
  
  /**
   * Check actual Replicate prediction status
   */
  static async checkReplicateStatus(predictionId: string): Promise<any | null> {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!response.ok) {
        console.log(`❌ REPLICATE API ERROR: ${response.status} for prediction ${predictionId}`);
        return null;
      }
      
      const prediction = await response.json();
      console.log(`📊 REPLICATE STATUS: ${prediction.status} for prediction ${predictionId}`);
      
      return prediction;
      
    } catch (error) {
      console.error(`❌ REPLICATE API ERROR for prediction ${predictionId}:`, error);
      return null;
    }
  }
  
  /**
   * Update tracker based on Replicate prediction data
   */
  static async updateTrackerFromReplicate(trackerId: number, prediction: any): Promise<void> {
    try {
      switch (prediction.status) {
        case 'succeeded':
          if (prediction.output && Array.isArray(prediction.output) && prediction.output.length > 0) {
            console.log(`✅ TRACKER SYNC: Updating tracker ${trackerId} as completed with ${prediction.output.length} images`);
            
            await storage.updateGenerationTracker(trackerId, {
              status: 'completed',
              imageUrls: JSON.stringify(prediction.output)
            });
            
            // Try to update Maya chat with images
            try {
              await this.updateMayaChatWithImages(trackerId, prediction.output);
            } catch (error) {
              console.error(`❌ Failed to update Maya chat for tracker ${trackerId}:`, error);
            }
            
          } else {
            console.log(`⚠️ TRACKER SYNC: Tracker ${trackerId} succeeded but no output found`);
            await storage.updateGenerationTracker(trackerId, {
              status: 'failed',
              imageUrls: JSON.stringify(['Generation succeeded but no images found'])
            });
          }
          break;
          
        case 'failed':
        case 'canceled':
          console.log(`❌ TRACKER SYNC: Updating tracker ${trackerId} as failed (${prediction.status})`);
          await storage.updateGenerationTracker(trackerId, {
            status: 'failed',
            imageUrls: JSON.stringify([`Generation ${prediction.status}: ${prediction.error || 'Unknown error'}`])
          });
          break;
          
        case 'starting':
        case 'processing':
          console.log(`🔄 TRACKER SYNC: Tracker ${trackerId} still processing on Replicate`);
          // Keep as processing - this is correct
          break;
          
        default:
          console.log(`⚠️ TRACKER SYNC: Unknown status ${prediction.status} for tracker ${trackerId}`);
          break;
      }
      
    } catch (error) {
      console.error(`❌ TRACKER UPDATE ERROR for tracker ${trackerId}:`, error);
    }
  }
  
  /**
   * Update Maya chat message with generated images - AUTO PERMANENT STORAGE
   * Automatically migrates ALL images to permanent S3 storage for Maya chat preview
   */
  static async updateMayaChatWithImages(trackerId: number, imageUrls: string[]): Promise<void> {
    try {
      console.log(`🔍 Updating Maya chat for tracker ${trackerId} with ${imageUrls.length} images`);
      
      // Get the generation tracker to find the user
      const tracker = await storage.getGenerationTracker(trackerId);
      if (!tracker) {
        console.log(`❌ No tracker found for ID ${trackerId}`);
        return;
      }
      
      // 🚀 AUTOMATIC PERMANENT STORAGE: Convert ALL Maya chat images to permanent S3 URLs
      console.log(`💾 MAYA CHAT: Migrating ${imageUrls.length} images to permanent storage for user ${tracker.userId}`);
      const permanentImageUrls: string[] = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const replicateUrl = imageUrls[i];
        try {
          const { ImageStorageService } = await import('./image-storage-service');
          const permanentUrl = await ImageStorageService.ensurePermanentStorage(
            replicateUrl, 
            tracker.userId, 
            `maya_chat_${trackerId}_${i}`
          );
          permanentImageUrls.push(permanentUrl);
          console.log(`✅ MAYA PREVIEW: Image ${i + 1}/${imageUrls.length} migrated to permanent storage`);
        } catch (error) {
          console.error(`❌ MAYA PREVIEW: Failed to migrate image ${i + 1}, using original URL:`, error);
          permanentImageUrls.push(replicateUrl); // Fallback to original URL
        }
      }
      
      // Update generation tracker with permanent URLs
      try {
        await storage.updateGenerationTracker(trackerId, {
          imageUrls: JSON.stringify(permanentImageUrls)
        });
        console.log(`✅ TRACKER: Updated tracker ${trackerId} with ${permanentImageUrls.length} permanent URLs`);
      } catch (error) {
        console.error(`❌ TRACKER: Failed to update tracker with permanent URLs:`, error);
      }
      
      // Find the most recent Maya chat message that needs images
      const mayaChats = await storage.getMayaChats(tracker.userId);
      if (!mayaChats || mayaChats.length === 0) {
        console.log(`❌ No Maya chats found for user ${tracker.userId}`);
        return;
      }
      
      const recentChat = mayaChats[0];
      const chatMessages = await storage.getMayaChatMessages(recentChat.id);
      
      // Find Maya message with generated_prompt but no images
      const mayaMessageWithoutImages = chatMessages
        .filter(msg => msg.role === 'maya' && msg.generatedPrompt && !msg.imagePreview)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (mayaMessageWithoutImages) {
        await storage.updateMayaChatMessage(mayaMessageWithoutImages.id, {
          imagePreview: JSON.stringify(permanentImageUrls) // Use permanent URLs for chat preview
        });
        console.log(`✅ MAYA CHAT: Updated message ${mayaMessageWithoutImages.id} with ${permanentImageUrls.length} permanent preview images`);
      } else {
        console.log(`ℹ️ No Maya message found that needs images for tracker ${trackerId}`);
      }
      
    } catch (error) {
      console.error(`❌ updateMayaChatWithImages failed for tracker ${trackerId}:`, error);
    }
  }
  
  /**
   * Calculate how many hours a tracker has been stuck
   */
  static getHoursStuck(createdAt: string | Date): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }
  
  /**
   * Run periodic sync every 5 minutes
   */
  static startPeriodicSync(): void {
    console.log('🚀 TRACKER SYNC: Starting periodic sync service (every 5 minutes)');
    
    // Run immediately
    this.syncAllProcessingTrackers();
    
    // Then run every 5 minutes
    setInterval(() => {
      this.syncAllProcessingTrackers();
    }, 5 * 60 * 1000); // 5 minutes
  }
}