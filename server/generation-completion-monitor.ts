/**
 * Generation Completion Monitor
 * Automatically detects and updates completed image/video generations
 */

import { storage } from './storage.js';

interface GenerationStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: string;
  output?: {
    url?: string;
    duration?: number;
    size?: number;
  };
  logs?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export class GenerationCompletionMonitor {
  private static instance: GenerationCompletionMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly checkIntervalMs: number;

  private constructor(checkIntervalMs = 60000) { // Default 1 minute
    this.checkIntervalMs = checkIntervalMs;
  }

  static getInstance(checkIntervalMs?: number): GenerationCompletionMonitor {
    if (!GenerationCompletionMonitor.instance) {
      GenerationCompletionMonitor.instance = new GenerationCompletionMonitor(checkIntervalMs);
    }
    return GenerationCompletionMonitor.instance;
  }

  /**
   * Check all in-progress generations and update them
   */
  async checkAllInProgressGenerations(): Promise<void> {
    try {
      console.log('🔍 GENERATION MONITOR: Checking all in-progress generations...');
      
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
   * Check a specific generation status and update database
   */
  private static async checkAndUpdateGeneration(
    predictionId: string,
    trackerId: number
  ): Promise<boolean> {
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

      const predictionData: GenerationStatus = await response.json();
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

        // Save to gallery
        try {
          for (const imageUrl of imageUrls) {
            await storage.saveGeneratedImage({
              userId: tracker.userId,
              imageUrls: JSON.stringify([imageUrl]),
              prompt: tracker.prompt || 'AI Generated Image',
              category: 'Generated',
              subcategory: 'Image'
            });
          }
          console.log(`✅ GENERATION MONITOR: Saved ${imageUrls.length} images to gallery`);
        } catch (saveError) {
          console.log(`⚠️ GENERATION MONITOR: Gallery save failed for user ${tracker.userId}:`, saveError);
          // Don't fail the whole operation if gallery saving fails
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
   * Start automatic monitoring
   */
  startMonitoring(): void {
    if (this.intervalId) {
      console.log('⚠️ GENERATION MONITOR: Monitoring already running');
      return;
    }

    console.log('🚀 GENERATION MONITOR: Starting automatic generation monitoring...');
    
    // Check every 30 seconds
    this.intervalId = setInterval(
      () => this.checkAllInProgressGenerations(),
      this.checkIntervalMs
    );

    // Run initial check
    this.checkAllInProgressGenerations();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 GENERATION MONITOR: Stopped automatic monitoring');
    }
  }
}