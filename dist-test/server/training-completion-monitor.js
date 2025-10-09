/**
 * CRITICAL PRODUCTION FIX: Training Completion Monitor
 * Automatically detects and updates completed trainings from Replicate API
 * Prevents users from getting stuck in "processing" status
 */
import { storage } from './storage.js';
import { paths } from './utils/paths.js';
export class TrainingCompletionMonitor {
    static instance;
    intervalId = null;
    config = {
        checkIntervalMs: 60000, // 1 minute
        maxRetries: 3,
        retryDelayMs: 5000
    };
    static getInstance() {
        if (!TrainingCompletionMonitor.instance) {
            TrainingCompletionMonitor.instance = new TrainingCompletionMonitor();
        }
        return TrainingCompletionMonitor.instance;
    }
    /**
     * Check and update training status for a specific model
     */
    static async checkAndUpdateTraining(replicateModelId, userId) {
        const instance = TrainingCompletionMonitor.getInstance();
        return instance.checkTrainingStatus(userId, replicateModelId);
    }
    /**
     * Check training status from Replicate API
     */
    async checkTrainingStatus(userId, replicateModelId) {
        let retries = 0;
        while (retries < this.config.maxRetries) {
            try {
                const response = await fetch(`https://api.replicate.com/v1/trainings/${replicateModelId}`, {
                    headers: {
                        'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}: ${await response.text()}`);
                }
                const trainingData = (await response.json());
                // Validate response structure
                if (!trainingData || !trainingData.status) {
                    throw new Error('Invalid API response structure');
                }
                const statusUpdate = {
                    userId,
                    modelId: replicateModelId,
                    status: trainingData.status,
                    error: trainingData.error,
                    completedAt: trainingData.completed_at,
                    modelVersion: trainingData.version?.id
                };
                if (trainingData.status === 'succeeded') {
                    // Standard FLUX training completion - extract version ID
                    const versionId = trainingData.version?.id || null;
                    // ✅ RESTORED: LoRA weights extraction for personalized images
                    let extractedWeights = null;
                    try {
                        // Extract LoRA weights using restored extraction method
                        const { ModelTrainingService } = await import('./model-training-service.js');
                        extractedWeights = await ModelTrainingService.extractLoRAWeights(replicateModelId, userId);
                    }
                    catch (error) {
                        console.error(`❌ LoRA EXTRACTION FAILED for user ${userId}:`, error);
                        // Continue with packaged model as fallback
                    }
                    if (trainingData.output) {
                    }
                    else {
                    }
                    // CRITICAL: Extract and store the trigger word from existing model data
                    const existingModel = await storage.getUserModelByUserId(userId);
                    let triggerWord = existingModel?.triggerWord;
                    // If no trigger word exists, generate one following the pattern
                    if (!triggerWord) {
                        triggerWord = `user${userId}`;
                    }
                    // ✅ RESTORED: Store both packaged model and extracted LoRA weights
                    await storage.updateUserModel(userId, {
                        trainingStatus: 'completed',
                        replicateModelId: replicateModelId, // Keep training ID for reference
                        replicateVersionId: versionId, // Training version
                        triggerWord: triggerWord, // CRITICAL: Ensure trigger word is stored
                        trainedModelPath: paths.getUserModelPath(userId),
                        modelType: extractedWeights ? 'flux-lora' : 'flux-packaged', // Dynamic model type
                        completedAt: new Date()
                    });
                    // Store LoRA weights metadata in separate table
                    if (extractedWeights) {
                        try {
                            await storage.storeLoRAWeights({
                                userId: userId,
                                trainingId: replicateModelId,
                                weightsUrl: extractedWeights.loraWeightsUrl,
                                checksum: extractedWeights.checksum,
                                fileSize: extractedWeights.fileSize,
                                extractedAt: new Date()
                            });
                        }
                        catch (error) {
                            console.error(`❌ Failed to store LoRA weights metadata:`, error);
                        }
                    }
                    // Send model ready email notification
                    try {
                        const user = await storage.getUser(userId);
                        if (user?.email) {
                            const { sendTrainingCompleteEmail } = await import('./services/email-service.js');
                            const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'there';
                            await sendTrainingCompleteEmail(user.email, userName);
                        }
                    }
                    catch (emailError) {
                        console.error('❌ Failed to send model ready email:', emailError);
                        // Don't fail the completion if email fails
                    }
                    // Training completion successful - no additional brand coaching needed
                    return statusUpdate;
                }
                else if (trainingData.status === 'failed') {
                    await storage.updateUserModel(userId, {
                        trainingStatus: 'failed',
                        updatedAt: new Date()
                    });
                    return statusUpdate;
                }
                return statusUpdate;
            }
            catch (error) {
                console.error(`❌ Error checking training ${replicateModelId}:`, error);
                retries++;
                if (retries < this.config.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
                    continue;
                }
                return {
                    userId,
                    modelId: replicateModelId,
                    status: 'failed',
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        }
        // If we reach here, all retries have been exhausted
        return {
            userId,
            modelId: replicateModelId,
            status: 'failed',
            error: 'Maximum retries exceeded'
        };
    }
    /**
     * Check for completed models by directly querying Replicate API using model name pattern
     * This works even if training ID wasn't stored in database
     */
    static async checkModelByName(userId, modelName) {
        try {
            const response = await fetch(`https://api.replicate.com/v1/models/${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`, {
                headers: {
                    'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 404) {
                return {
                    userId,
                    modelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                    status: 'processing'
                };
            }
            if (!response.ok) {
                console.error(`❌ Replicate API error for model ${modelName}: ${response.status}`);
                return {
                    userId,
                    modelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                    status: 'failed',
                    error: `API error: ${response.status}`
                };
            }
            const modelData = await response.json();
            if (modelData.latest_version?.id) {
                // CRITICAL: Extract and store the trigger word from existing model data
                const existingModel = await storage.getUserModelByUserId(userId);
                let triggerWord = existingModel?.triggerWord;
                // If no trigger word exists, generate one following the pattern
                if (!triggerWord) {
                    triggerWord = `user${userId}`;
                }
                await storage.updateUserModel(userId, {
                    trainingStatus: 'completed',
                    replicateModelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                    replicateVersionId: modelData.latest_version.id,
                    triggerWord: triggerWord, // CRITICAL: Ensure trigger word is stored
                    trainingProgress: 100,
                    modelType: 'flux-standard',
                    updatedAt: new Date()
                });
                // Send model ready email notification
                try {
                    const user = await storage.getUser(userId);
                    if (user?.email) {
                        const { sendTrainingCompleteEmail } = await import('./services/email-service.js');
                        const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'there';
                        await sendTrainingCompleteEmail(user.email, userName);
                    }
                }
                catch (emailError) {
                    console.error('❌ Failed to send model ready email:', emailError);
                    // Don't fail the completion if email fails
                }
                // Training completion successful - no additional brand coaching needed
                return {
                    userId,
                    modelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                    status: 'succeeded',
                    modelVersion: modelData.latest_version.id,
                    completedAt: new Date().toISOString()
                };
            }
            return {
                userId,
                modelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                status: 'processing'
            };
        }
        catch (error) {
            console.error(`❌ Error checking model ${modelName}:`, error);
            return {
                userId,
                modelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Check all in-progress trainings - Enhanced version that works without training ID
     */
    static async checkAllInProgressTrainings() {
        try {
            // Get all users with training status that isn't completed
            let inProgressModels;
            try {
                inProgressModels = await storage.getAllInProgressTrainings();
            }
            catch (dbError) {
                console.error('❌ Training Monitor: Database connection error:', dbError instanceof Error ? dbError.message : 'Unknown error');
                return; // Skip this cycle if database is unavailable
            }
            if (inProgressModels.length === 0) {
                return;
            }
            for (const userModel of inProgressModels) {
                const timeSinceStart = Date.now() - new Date(userModel.createdAt || new Date()).getTime();
                const minutesSinceStart = timeSinceStart / (1000 * 60);
                // Only check models that have been training for at least 8 minutes (training typically takes 10+ minutes)
                if (minutesSinceStart >= 8) {
                    // Method 1: Check by training ID if available
                    if (userModel.replicateModelId && userModel.replicateModelId.startsWith('rdt_')) {
                        await this.checkAndUpdateTraining(userModel.replicateModelId, userModel.userId);
                    }
                    // Method 2: Check by model name pattern (fallback for models without stored training ID)
                    if (userModel.modelName) {
                        await this.checkModelByName(userModel.userId, userModel.modelName);
                    }
                    // Wait 1 second between API calls to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                else {
                }
            }
        }
        catch (error) {
            console.error('❌ Error in training completion monitor:', error);
        }
    }
    /**
     * Start automatic monitoring (every 2 minutes)
     */
    startMonitoring() {
        // Check immediately on start
        TrainingCompletionMonitor.checkAllInProgressTrainings();
        // Then check every 2 minutes
        this.intervalId = setInterval(() => {
            TrainingCompletionMonitor.checkAllInProgressTrainings();
        }, 2 * 60 * 1000); // 2 minutes
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
