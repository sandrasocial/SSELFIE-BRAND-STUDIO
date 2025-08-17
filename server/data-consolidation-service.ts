import { storage } from './storage';

/**
 * Data Consolidation Service
 * Fixes data consistency issues by consolidating image storage to ai_images table
 * and ensuring upload tracking matches training records
 */
export class DataConsolidationService {
  
  /**
   * Consolidate all image data to ai_images as the primary table
   */
  static async consolidateImageStorage(): Promise<{
    success: boolean;
    consolidated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let consolidated = 0;
    
    try {
      console.log('🔄 DATA CONSOLIDATION: Starting image storage consolidation...');
      
      const { db } = await import('./db');
      const { aiImages, generatedImages, generationTrackers } = await import('../shared/schema');
      const { eq, and, isNotNull } = await import('drizzle-orm');
      
      // Step 1: Migrate any data from generated_images to ai_images (if any exists)
      const generatedImagesData = await db
        .select()
        .from(generatedImages)
        .where(isNotNull(generatedImages.selectedUrl));
      
      for (const genImage of generatedImagesData) {
        try {
          await db.insert(aiImages).values({
            userId: genImage.userId,
            imageUrl: genImage.selectedUrl!,
            prompt: genImage.prompt,
            style: genImage.category || 'maya-generation',
            isSelected: genImage.saved || false,
            generationStatus: 'completed',
            createdAt: genImage.createdAt
          });
          
          consolidated++;
          console.log(`✅ Migrated generated_image ${genImage.id} to ai_images`);
        } catch (error) {
          errors.push(`Failed to migrate generated_image ${genImage.id}: ${error}`);
        }
      }
      
      // Step 2: Clean up completed generation_trackers by moving to ai_images
      const completedTrackers = await db
        .select()
        .from(generationTrackers)
        .where(and(
          eq(generationTrackers.status, 'completed'),
          isNotNull(generationTrackers.imageUrls)
        ));
      
      for (const tracker of completedTrackers) {
        try {
          if (tracker.imageUrls) {
            const urls = JSON.parse(tracker.imageUrls);
            const primaryUrl = Array.isArray(urls) ? urls[0] : urls;
            
            if (primaryUrl) {
              // Check if this image already exists in ai_images
              const existing = await db
                .select()
                .from(aiImages)
                .where(and(
                  eq(aiImages.userId, tracker.userId),
                  eq(aiImages.imageUrl, primaryUrl)
                ))
                .limit(1);
              
              if (existing.length === 0) {
                await db.insert(aiImages).values({
                  userId: tracker.userId,
                  imageUrl: primaryUrl,
                  prompt: tracker.prompt,
                  style: tracker.style || 'maya-generation',
                  isSelected: true, // Tracker means user kept it
                  generationStatus: 'completed',
                  predictionId: tracker.predictionId,
                  createdAt: tracker.createdAt
                });
                
                consolidated++;
                console.log(`✅ Consolidated tracker ${tracker.id} to ai_images`);
              }
            }
          }
        } catch (error) {
          errors.push(`Failed to consolidate tracker ${tracker.id}: ${error}`);
        }
      }
      
      console.log(`✅ DATA CONSOLIDATION: Consolidated ${consolidated} images, ${errors.length} errors`);
      
      return {
        success: errors.length === 0,
        consolidated,
        errors
      };
      
    } catch (error) {
      console.error('❌ DATA CONSOLIDATION ERROR:', error);
      errors.push(`Consolidation failed: ${error}`);
      
      return {
        success: false,
        consolidated,
        errors
      };
    }
  }
  
  /**
   * Ensure upload tracking matches training records
   */
  static async synchronizeUploadTraining(): Promise<{
    success: boolean;
    synchronized: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let synchronized = 0;
    
    try {
      console.log('🔄 SYNC: Starting upload-training synchronization...');
      
      const { db } = await import('./db');
      const { userModels, selfieUploads } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Find user models without corresponding selfie uploads
      const userModelsData = await db.select().from(userModels);
      
      for (const model of userModelsData) {
        try {
          // Check if user has selfie uploads
          const uploads = await db
            .select()
            .from(selfieUploads)
            .where(eq(selfieUploads.userId, model.userId));
          
          if (uploads.length === 0) {
            // Create a tracking record to indicate training occurred
            await db.insert(selfieUploads).values({
              userId: model.userId,
              filename: `model-${model.id}-training-data.zip`,
              originalUrl: `s3://training-data/${model.userId}/model-${model.id}.zip`,
              processedUrl: model.replicateModelId || `replicate-model-${model.id}`,
              processingStatus: model.trainingStatus || 'completed',
              aiModelOutput: {
                modelId: model.id,
                replicateModelId: model.replicateModelId,
                trainingStatus: model.trainingStatus,
                completedAt: model.completedAt,
                triggerWord: model.triggerWord,
                syncedAt: new Date().toISOString()
              },
              createdAt: model.createdAt || new Date(),
              updatedAt: new Date()
            });
            
            synchronized++;
            console.log(`✅ Created upload tracking for model ${model.id}`);
          }
        } catch (error) {
          errors.push(`Failed to sync model ${model.id}: ${error}`);
        }
      }
      
      console.log(`✅ SYNC: Synchronized ${synchronized} upload records, ${errors.length} errors`);
      
      return {
        success: errors.length === 0,
        synchronized,
        errors
      };
      
    } catch (error) {
      console.error('❌ SYNC ERROR:', error);
      errors.push(`Synchronization failed: ${error}`);
      
      return {
        success: false,
        synchronized,
        errors
      };
    }
  }
  
  /**
   * Align generation success tracking across all tables
   */
  static async alignGenerationTracking(): Promise<{
    success: boolean;
    aligned: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let aligned = 0;
    
    try {
      console.log('🔄 ALIGN: Starting generation tracking alignment...');
      
      const { db } = await import('./db');
      const { aiImages, generationTrackers } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // Update ai_images with correct generation status based on trackers
      const aiImagesData = await db.select().from(aiImages);
      
      for (const aiImage of aiImagesData) {
        try {
          let shouldUpdate = false;
          let newStatus = aiImage.generationStatus;
          
          // Find corresponding tracker if exists
          if (aiImage.predictionId) {
            const tracker = await db
              .select()
              .from(generationTrackers)
              .where(eq(generationTrackers.predictionId, aiImage.predictionId))
              .limit(1);
            
            if (tracker[0] && tracker[0].status !== aiImage.generationStatus) {
              newStatus = tracker[0].status;
              shouldUpdate = true;
            }
          }
          
          // Ensure status consistency
          if (!aiImage.generationStatus || aiImage.generationStatus === 'pending') {
            if (aiImage.imageUrl && aiImage.imageUrl.startsWith('http')) {
              newStatus = 'completed';
              shouldUpdate = true;
            }
          }
          
          if (shouldUpdate) {
            await db
              .update(aiImages)
              .set({ 
                generationStatus: newStatus,
                updatedAt: new Date()
              })
              .where(eq(aiImages.id, aiImage.id));
            
            aligned++;
            console.log(`✅ Aligned status for ai_image ${aiImage.id}: ${newStatus}`);
          }
          
        } catch (error) {
          errors.push(`Failed to align ai_image ${aiImage.id}: ${error}`);
        }
      }
      
      console.log(`✅ ALIGN: Aligned ${aligned} generation records, ${errors.length} errors`);
      
      return {
        success: errors.length === 0,
        aligned,
        errors
      };
      
    } catch (error) {
      console.error('❌ ALIGN ERROR:', error);
      errors.push(`Alignment failed: ${error}`);
      
      return {
        success: false,
        aligned,
        errors
      };
    }
  }
  
  /**
   * Run complete data consolidation process
   */
  static async runCompleteConsolidation(): Promise<{
    success: boolean;
    summary: {
      imagesConsolidated: number;
      uploadsSync: number;
      trackingAligned: number;
      totalErrors: number;
    };
    errors: string[];
  }> {
    console.log('🚀 DATA CONSOLIDATION: Starting complete data consolidation...');
    
    const allErrors: string[] = [];
    
    // Step 1: Consolidate image storage
    const imageResult = await this.consolidateImageStorage();
    allErrors.push(...imageResult.errors);
    
    // Step 2: Synchronize upload tracking
    const syncResult = await this.synchronizeUploadTraining();
    allErrors.push(...syncResult.errors);
    
    // Step 3: Align generation tracking
    const alignResult = await this.alignGenerationTracking();
    allErrors.push(...alignResult.errors);
    
    const success = allErrors.length === 0;
    
    console.log(`🎯 DATA CONSOLIDATION COMPLETE: ${success ? 'SUCCESS' : 'WITH ERRORS'}`);
    console.log(`📊 Summary: ${imageResult.consolidated} images, ${syncResult.synchronized} syncs, ${alignResult.aligned} aligned`);
    
    return {
      success,
      summary: {
        imagesConsolidated: imageResult.consolidated,
        uploadsSync: syncResult.synchronized,
        trackingAligned: alignResult.aligned,
        totalErrors: allErrors.length
      },
      errors: allErrors
    };
  }
}