export class DataConsolidationService {
    static async consolidateImageStorage() {
        const errors = [];
        let consolidated = 0;
        try {
            console.log('🔄 DATA CONSOLIDATION: Starting image storage consolidation...');
            const { db } = await import('./db.js');
            const { aiImages, generatedImages, generationTrackers } = await import('../shared/schema.js');
            const { eq, and, isNotNull } = await import('drizzle-orm');
            const generatedImagesData = await db
                .select()
                .from(generatedImages)
                .where(isNotNull(generatedImages.selectedUrl));
            for (const genImage of generatedImagesData) {
                try {
                    await db.insert(aiImages).values({
                        userId: genImage.userId,
                        imageUrl: genImage.selectedUrl,
                        prompt: genImage.prompt,
                        style: genImage.category || 'maya-generation',
                        isSelected: genImage.saved || false,
                        generationStatus: 'completed',
                        createdAt: genImage.createdAt
                    });
                    consolidated++;
                    console.log(`✅ Migrated generated_image ${genImage.id} to ai_images`);
                }
                catch (error) {
                    errors.push(`Failed to migrate generated_image ${genImage.id}: ${error}`);
                }
            }
            const completedTrackers = await db
                .select()
                .from(generationTrackers)
                .where(and(eq(generationTrackers.status, 'completed'), isNotNull(generationTrackers.imageUrls)));
            for (const tracker of completedTrackers) {
                try {
                    if (tracker.imageUrls) {
                        const urls = JSON.parse(tracker.imageUrls);
                        const primaryUrl = Array.isArray(urls) ? urls[0] : urls;
                        if (primaryUrl) {
                            const existing = await db
                                .select()
                                .from(aiImages)
                                .where(and(eq(aiImages.userId, tracker.userId), eq(aiImages.imageUrl, primaryUrl)))
                                .limit(1);
                            if (existing.length === 0) {
                                await db.insert(aiImages).values({
                                    userId: tracker.userId,
                                    imageUrl: primaryUrl,
                                    prompt: tracker.prompt,
                                    style: tracker.style || 'maya-generation',
                                    isSelected: true,
                                    generationStatus: 'completed',
                                    predictionId: tracker.predictionId,
                                    createdAt: tracker.createdAt
                                });
                                consolidated++;
                                console.log(`✅ Consolidated tracker ${tracker.id} to ai_images`);
                            }
                        }
                    }
                }
                catch (error) {
                    errors.push(`Failed to consolidate tracker ${tracker.id}: ${error}`);
                }
            }
            console.log(`✅ DATA CONSOLIDATION: Consolidated ${consolidated} images, ${errors.length} errors`);
            return {
                success: errors.length === 0,
                consolidated,
                errors
            };
        }
        catch (error) {
            console.error('❌ DATA CONSOLIDATION ERROR:', error);
            errors.push(`Consolidation failed: ${error}`);
            return {
                success: false,
                consolidated,
                errors
            };
        }
    }
    static async synchronizeUploadTraining() {
        const errors = [];
        let synchronized = 0;
        try {
            console.log('🔄 SYNC: Starting upload-training synchronization...');
            const { db } = await import('./db.js');
            const { userModels, selfieUploads } = await import('../shared/schema.js');
            const { eq } = await import('drizzle-orm');
            const userModelsData = await db.select().from(userModels);
            for (const model of userModelsData) {
                try {
                    const uploads = await db
                        .select()
                        .from(selfieUploads)
                        .where(eq(selfieUploads.userId, model.userId));
                    if (uploads.length === 0) {
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
                }
                catch (error) {
                    errors.push(`Failed to sync model ${model.id}: ${error}`);
                }
            }
            console.log(`✅ SYNC: Synchronized ${synchronized} upload records, ${errors.length} errors`);
            return {
                success: errors.length === 0,
                synchronized,
                errors
            };
        }
        catch (error) {
            console.error('❌ SYNC ERROR:', error);
            errors.push(`Synchronization failed: ${error}`);
            return {
                success: false,
                synchronized,
                errors
            };
        }
    }
    static async alignGenerationTracking() {
        const errors = [];
        let aligned = 0;
        try {
            console.log('🔄 ALIGN: Starting generation tracking alignment...');
            const { db } = await import('./db.js');
            const { aiImages, generationTrackers } = await import('../shared/schema.js');
            const { eq, and } = await import('drizzle-orm');
            const aiImagesData = await db.select().from(aiImages);
            for (const aiImage of aiImagesData) {
                try {
                    let shouldUpdate = false;
                    let newStatus = aiImage.generationStatus;
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
                            generationStatus: newStatus
                        })
                            .where(eq(aiImages.id, aiImage.id));
                        aligned++;
                        console.log(`✅ Aligned status for ai_image ${aiImage.id}: ${newStatus}`);
                    }
                }
                catch (error) {
                    errors.push(`Failed to align ai_image ${aiImage.id}: ${error}`);
                }
            }
            console.log(`✅ ALIGN: Aligned ${aligned} generation records, ${errors.length} errors`);
            return {
                success: errors.length === 0,
                aligned,
                errors
            };
        }
        catch (error) {
            console.error('❌ ALIGN ERROR:', error);
            errors.push(`Alignment failed: ${error}`);
            return {
                success: false,
                aligned,
                errors
            };
        }
    }
    static async runCompleteConsolidation() {
        console.log('🚀 DATA CONSOLIDATION: Starting complete data consolidation...');
        const allErrors = [];
        const imageResult = await this.consolidateImageStorage();
        allErrors.push(...imageResult.errors);
        const syncResult = await this.synchronizeUploadTraining();
        allErrors.push(...syncResult.errors);
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
//# sourceMappingURL=data-consolidation-service.js.map