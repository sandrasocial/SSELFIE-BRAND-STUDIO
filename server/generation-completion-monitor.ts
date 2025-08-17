/**
 * CRITICAL PRODUCTION FIX: Generation Completion Monitor
 * Automatically detects and updates completed generations from Replicate API
 * Saves images to Maya chat previews when generation completes
 * This service was missing - explains why Maya images weren't appearing despite successful generation
 */

import { storage } from './storage';
import { MayaChatPreviewService } from './maya-chat-preview-service';

export class GenerationCompletionMonitor {
  private static instance: GenerationCompletionMonitor;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): GenerationCompletionMonitor {
    if (!GenerationCompletionMonitor.instance) {
      GenerationCompletionMonitor.instance = new GenerationCompletionMonitor();
    }
    return GenerationCompletionMonitor.instance;
  }

  /**
   * Check a specific generation status and update database + Maya chat
   */
  static async checkAndUpdateGeneration(predictionId: string, trackerId: number): Promise<boolean> {
    try {
      console.log(`🎬 GENERATION MONITOR: Checking prediction ${predictionId} for tracker ${trackerId}`);
      
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ GENERATION MONITOR: Replicate API error for ${predictionId}: ${response.status}`);
        return false;
      }

      const predictionData = await response.json();
      console.log(`📊 GENERATION MONITOR: Prediction ${predictionId} status: ${predictionData.status}`);

      const tracker = await storage.getGenerationTracker(trackerId);
      if (!tracker) {
        console.error(`❌ GENERATION MONITOR: Tracker ${trackerId} not found`);
        return false;
      }

      if (predictionData.status === 'succeeded' && predictionData.output) {
        console.log(`✅ GENERATION MONITOR: Generation completed! Updating tracker ${trackerId}`);
        
        const imageUrls = Array.isArray(predictionData.output) ? predictionData.output : [predictionData.output];
        
        // Update tracker with completed images
        await storage.updateGenerationTracker(trackerId, {
          status: 'completed',
          imageUrls: JSON.stringify(imageUrls),
          updatedAt: new Date()
        });

        // Save images to Maya chat for preview (CRITICAL: This was missing!)
        try {
          // Find the most recent Maya chat for this user
          const userChats = await storage.getMayaChats(tracker.userId);
          const activeChat = userChats[0]; // Use most recent chat
          
          if (activeChat) {
            await MayaChatPreviewService.saveChatPreview(
              activeChat.id,
              imageUrls,
              tracker.prompt || 'Maya Editorial Photoshoot',
              predictionId
            );
            console.log(`💬 GENERATION MONITOR: Saved ${imageUrls.length} images to Maya chat ${activeChat.id}`);
          } else {
            console.log(`⚠️ GENERATION MONITOR: No Maya chat found for user ${tracker.userId}, images saved to tracker only`);
          }
        } catch (chatError) {
          console.error(`❌ GENERATION MONITOR: Failed to save to Maya chat:`, chatError);
          // Don't fail the whole operation if chat saving fails
        }

        return true;
        
      } else if (predictionData.status === 'failed') {
        console.log(`❌ GENERATION MONITOR: Generation failed for tracker ${trackerId}`);
        
        const errorMessage = predictionData.error || 'Generation failed';
        
        await storage.updateGenerationTracker(trackerId, {
          status: 'failed',
          imageUrls: JSON.stringify([`Error: ${errorMessage}`]),
          updatedAt: new Date()
        });

        return true;
      }

      // Still processing
      return false;
      
    } catch (error) {
      console.error(`❌ GENERATION MONITOR: Error checking generation ${predictionId}:`, error);
      return false;
    }
  }

  /**
   * Check all in-progress generations and update them
   */
  async checkAllInProgressGenerations(): Promise<void> {
    try {
      console.log('🔍 GENERATION MONITOR: Checking all in-progress generations...');

      // Get all processing generation trackers
      const processingTrackers = await storage.getProcessingGenerationTrackers();
      
      if (processingTrackers.length === 0) {
        console.log('✅ GENERATION MONITOR: No in-progress generations found');
        return;
      }

      console.log(`📊 GENERATION MONITOR: Found ${processingTrackers.length} in-progress generations to check`);

      // Check each tracker
      for (const tracker of processingTrackers) {
        if (tracker.predictionId) {
          await GenerationCompletionMonitor.checkAndUpdateGeneration(tracker.predictionId, tracker.id);
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (error) {
      console.error('❌ GENERATION MONITOR: Error in checkAllInProgressGenerations:', error);
    }
  }

  /**
   * Start automatic monitoring of generations
   */
  startMonitoring(): void {
    if (this.intervalId) {
      console.log('⚠️ GENERATION MONITOR: Monitoring already running');
      return;
    }

    console.log('🚀 GENERATION MONITOR: Starting automatic generation monitoring...');
    
    // Check every 30 seconds (same as training monitor)
    this.intervalId = setInterval(() => {
      this.checkAllInProgressGenerations();
    }, 30000);

    // Run initial check
    this.checkAllInProgressGenerations();
  }

  /**
   * Stop automatic monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 GENERATION MONITOR: Stopped automatic monitoring');
    }
  }
}