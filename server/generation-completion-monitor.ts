/**
 * CRITICAL PRODUCTION FIX: Generation Completion Monitor
 * Automatically detects and updates completed generations from Replicate API
 * Saves images to Maya chat previews when generation completes
 * This service was missing - explains why Maya images weren't appearing despite successful generation
 */

import { storage } from './storage.js'
// RESTORE: Maya Chat Preview Service for proper user journey
import { MayaChatPreviewService } from './maya-chat-preview-service.js';

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
      
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ GENERATION MONITOR: Replicate API error for ${predictionId}: ${response.status}`);
        return false;
      }

      const predictionData = await response.json();

      const tracker = await storage.getGenerationTracker(trackerId);
      if (!tracker) {
        console.error(`❌ GENERATION MONITOR: Tracker ${trackerId} not found`);
        return false;
      }

      if (predictionData.status === 'succeeded' && predictionData.output) {
        
        const imageUrls = Array.isArray(predictionData.output) ? predictionData.output : [predictionData.output];
        
        // Update tracker with completed images
        await storage.updateGenerationTracker(trackerId, {
          status: 'completed',
          imageUrls: JSON.stringify(imageUrls),
          updatedAt: new Date()
        });

        // RESTORE: Save to Maya chat previews instead of direct gallery save
        try {
          // Get or create a Maya chat for this user
          let chatId: number;
          try {
            // Try to get existing chat, or create new one
            const existingChats = await storage.getMayaChats(tracker.userId);
            if (existingChats && existingChats.length > 0) {
              chatId = existingChats[0].id;
            } else {
              // Create new chat if none exists
              const chatIdStr = await storage.createMayaChat(tracker.userId, {
                userId: tracker.userId,
                chatTitle: 'Maya Creative Session',
                initialMessage: 'Welcome to your creative session! I\'m here to help you create stunning personal brand photos.'
              });
              chatId = parseInt(chatIdStr);
            }
          } catch (chatError) {
            console.error('❌ GENERATION MONITOR: Failed to get/create chat:', chatError);
            // Fallback: create a simple chat ID
            chatId = Date.now();
          }

          // Save images as chat previews using MayaChatPreviewService
          const previewMessage = await MayaChatPreviewService.saveChatPreview(
            chatId,
            imageUrls,
            tracker.prompt || 'Maya Editorial Photoshoot',
            predictionData.id,
            tracker.userId
          );
          
        } catch (previewError) {
          console.error('❌ GENERATION MONITOR: Chat preview save failed:', previewError);
          // Don't fail the whole operation if preview saving fails
        }

        return true;
        
      } else if (predictionData.status === 'failed') {
        
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

      // Get all processing generation trackers
      let processingTrackers;
      try {
        processingTrackers = await storage.getProcessingGenerationTrackers();
      } catch (dbError) {
        console.error('❌ Generation Monitor: Database connection error:', dbError instanceof Error ? dbError.message : 'Unknown error');
        return; // Skip this cycle if database is unavailable
      }
      
      if (processingTrackers.length === 0) {
        return;
      }


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
      return;
    }

    
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
    }
  }
}