import { storage } from './storage.js';
export class GenerationCompletionMonitor {
    static instance;
    intervalId = null;
    static getInstance() {
        if (!GenerationCompletionMonitor.instance) {
            GenerationCompletionMonitor.instance = new GenerationCompletionMonitor();
        }
        return GenerationCompletionMonitor.instance;
    }
    static async checkAndUpdateGeneration(predictionId, trackerId) {
        try {
            console.log(`🎬 GENERATION MONITOR: Checking prediction ${predictionId} for tracker ${trackerId}`);
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
            console.log(`📊 GENERATION MONITOR: Prediction ${predictionId} status: ${predictionData.status}`);
            const tracker = await storage.getGenerationTracker(trackerId);
            if (!tracker) {
                console.error(`❌ GENERATION MONITOR: Tracker ${trackerId} not found`);
                return false;
            }
            if (predictionData.status === 'succeeded' && predictionData.output) {
                console.log(`✅ GENERATION MONITOR: Generation completed! Updating tracker ${trackerId}`);
                const imageUrls = Array.isArray(predictionData.output) ? predictionData.output : [predictionData.output];
                await storage.updateGenerationTracker(trackerId, {
                    status: 'completed',
                    imageUrls: JSON.stringify(imageUrls),
                    updatedAt: new Date()
                });
                try {
                    for (const imageUrl of imageUrls) {
                        await storage.saveGeneratedImage({
                            userId: tracker.userId,
                            imageUrls: JSON.stringify([imageUrl]),
                            prompt: tracker.prompt || 'Maya Editorial Photoshoot',
                            category: 'Maya Editorial',
                            subcategory: 'Professional'
                        });
                    }
                    console.log(`✅ GENERATION MONITOR: Saved ${imageUrls.length} images to gallery via façade`);
                }
                catch (saveError) {
                    console.log(`⚠️ GENERATION MONITOR: Gallery save failed for user ${tracker.userId}:`, saveError);
                }
                return true;
            }
            else if (predictionData.status === 'failed') {
                console.log(`❌ GENERATION MONITOR: Generation failed for tracker ${trackerId}`);
                const errorMessage = predictionData.error || 'Generation failed';
                await storage.updateGenerationTracker(trackerId, {
                    status: 'failed',
                    imageUrls: JSON.stringify([`Error: ${errorMessage}`]),
                    updatedAt: new Date()
                });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`❌ GENERATION MONITOR: Error checking generation ${predictionId}:`, error);
            return false;
        }
    }
    async checkAllInProgressGenerations() {
        try {
            console.log('🔍 GENERATION MONITOR: Checking all in-progress generations...');
            const processingTrackers = await storage.getProcessingGenerationTrackers();
            if (processingTrackers.length === 0) {
                console.log('✅ GENERATION MONITOR: No in-progress generations found');
                return;
            }
            console.log(`📊 GENERATION MONITOR: Found ${processingTrackers.length} in-progress generations to check`);
            for (const tracker of processingTrackers) {
                if (tracker.predictionId) {
                    await GenerationCompletionMonitor.checkAndUpdateGeneration(tracker.predictionId, tracker.id);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        catch (error) {
            console.error('❌ GENERATION MONITOR: Error in checkAllInProgressGenerations:', error);
        }
    }
    startMonitoring() {
        if (this.intervalId) {
            console.log('⚠️ GENERATION MONITOR: Monitoring already running');
            return;
        }
        console.log('🚀 GENERATION MONITOR: Starting automatic generation monitoring...');
        this.intervalId = setInterval(() => {
            this.checkAllInProgressGenerations();
        }, 30000);
        this.checkAllInProgressGenerations();
    }
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('🛑 GENERATION MONITOR: Stopped automatic monitoring');
        }
    }
}
//# sourceMappingURL=generation-completion-monitor.js.map