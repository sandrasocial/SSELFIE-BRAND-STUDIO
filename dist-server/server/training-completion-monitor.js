import { storage } from './storage.js';
import { paths } from './utils/paths.js';
export class TrainingCompletionMonitor {
    static instance;
    intervalId = null;
    config = {
        checkIntervalMs: 60000,
        maxRetries: 3,
        retryDelayMs: 5000
    };
    static getInstance() {
        if (!TrainingCompletionMonitor.instance) {
            TrainingCompletionMonitor.instance = new TrainingCompletionMonitor();
        }
        return TrainingCompletionMonitor.instance;
    }
    static async checkAndUpdateTraining(replicateModelId, userId) {
        const instance = TrainingCompletionMonitor.getInstance();
        return instance.checkTrainingStatus(userId, replicateModelId);
    }
    async checkTrainingStatus(userId, replicateModelId) {
        let retries = 0;
        while (retries < this.config.maxRetries) {
            try {
                console.log(`🔍 Checking training ${replicateModelId} for user ${userId} (attempt ${retries + 1})`);
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
                if (!trainingData || !trainingData.status) {
                    throw new Error('Invalid API response structure');
                }
                console.log(`📊 Training ${replicateModelId} status: ${trainingData.status}`);
                const statusUpdate = {
                    userId,
                    modelId: replicateModelId,
                    status: trainingData.status,
                    error: trainingData.error,
                    completedAt: trainingData.completed_at,
                    modelVersion: trainingData.version?.id
                };
                if (trainingData.status === 'succeeded') {
                    console.log(`✅ Training completed! Updating database for user ${userId}`);
                    const versionId = trainingData.version?.id || null;
                    console.log(`🎯 LORA EXTRACTION: Training completed, extracting LoRA weights for personalization`);
                    let extractedWeights = null;
                    try {
                        const { ModelTrainingService } = await import('./model-training-service.js');
                        extractedWeights = await ModelTrainingService.extractLoRAWeights(replicateModelId, userId);
                        console.log(`✅ LoRA WEIGHTS EXTRACTED: ${extractedWeights.loraWeightsUrl}`);
                    }
                    catch (error) {
                        console.error(`❌ LoRA EXTRACTION FAILED for user ${userId}:`, error);
                        console.log(`🔄 FALLBACK: Using packaged model approach`);
                    }
                    if (trainingData.output) {
                        console.log(`✅ Training output available for model completion`);
                    }
                    else {
                        console.log(`⚠️ No training output - may need additional processing`);
                    }
                    const existingModel = await storage.getUserModelByUserId(userId);
                    let triggerWord = existingModel?.triggerWord;
                    if (!triggerWord) {
                        triggerWord = `user${userId}`;
                        console.log(`🆔 Generated trigger word: ${triggerWord} for user ${userId}`);
                    }
                    await storage.updateUserModel(userId, {
                        trainingStatus: 'completed',
                        replicateModelId: replicateModelId,
                        replicateVersionId: versionId,
                        triggerWord: triggerWord,
                        trainedModelPath: paths.getUserModelPath(userId),
                        modelType: extractedWeights ? 'flux-lora' : 'flux-packaged',
                        completedAt: new Date()
                    });
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
                            console.log(`✅ LoRA WEIGHTS METADATA STORED for user ${userId}`);
                        }
                        catch (error) {
                            console.error(`❌ Failed to store LoRA weights metadata:`, error);
                        }
                    }
                    try {
                        const user = await storage.getUser(userId);
                        if (user?.email) {
                            const { EmailService } = await import('./email-service.js');
                            const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
                            await EmailService.sendModelReadyEmail(user.email, userName);
                            console.log('✅ Model ready email sent to:', user.email);
                        }
                    }
                    catch (emailError) {
                        console.error('❌ Failed to send model ready email:', emailError);
                    }
                    try {
                        const user = await storage.getUser(userId);
                        if (user?.trainingCoachingCompleted && user?.brandStrategyContext) {
                            console.log(`🎯 STRATEGIC TRAINING COMPLETION: User ${userId} completed brand strategy coaching`);
                            const strategyData = JSON.parse(user.brandStrategyContext);
                            const responses = strategyData.responses;
                            console.log(`✨ STRATEGIC CONCEPTS: User ${userId} ready for strategy-informed photo creation`);
                            console.log(`📊 BRAND STRATEGY: Primary platform = ${responses.primaryPlatform}, Authority = ${responses.authorityLevel}`);
                            console.log(`🎯 STRATEGIC COMPLETION: User ${userId} training complete with brand strategy context available`);
                        }
                        else {
                            console.log(`📸 STANDARD COMPLETION: User ${userId} completed training without brand strategy coaching`);
                        }
                    }
                    catch (strategyError) {
                        console.error(`⚠️ STRATEGIC CONCEPTS: Failed to process for user ${userId}:`, strategyError);
                    }
                    console.log(`🎉 Database updated! User ${userId} training completed`);
                    return statusUpdate;
                }
                else if (trainingData.status === 'failed') {
                    console.log(`❌ Training failed for user ${userId}`);
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
    }
    static async checkModelByName(userId, modelName) {
        try {
            console.log(`🔍 Checking model by name: ${process.env.REPLICATE_USERNAME || 'models'}/${modelName} for user ${userId}`);
            const response = await fetch(`https://api.replicate.com/v1/models/${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`, {
                headers: {
                    'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 404) {
                console.log(`⏳ Model ${process.env.REPLICATE_USERNAME || 'models'}/${modelName} not yet available`);
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
                console.log(`✅ Model completed! Updating database for user ${userId}`);
                console.log(`📋 Latest version: ${modelData.latest_version.id}`);
                const existingModel = await storage.getUserModelByUserId(userId);
                let triggerWord = existingModel?.triggerWord;
                if (!triggerWord) {
                    triggerWord = `user${userId}`;
                    console.log(`🆔 Generated trigger word: ${triggerWord} for user ${userId}`);
                }
                await storage.updateUserModel(userId, {
                    trainingStatus: 'completed',
                    replicateModelId: `${process.env.REPLICATE_USERNAME || 'models'}/${modelName}`,
                    replicateVersionId: modelData.latest_version.id,
                    triggerWord: triggerWord,
                    trainingProgress: 100,
                    modelType: 'flux-standard',
                    updatedAt: new Date()
                });
                try {
                    const user = await storage.getUser(userId);
                    if (user?.email) {
                        const { EmailService } = await import('./email-service.js');
                        const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
                        await EmailService.sendModelReadyEmail(user.email, userName);
                        console.log('✅ Model ready email sent to:', user.email);
                    }
                }
                catch (emailError) {
                    console.error('❌ Failed to send model ready email:', emailError);
                }
                try {
                    const user = await storage.getUser(userId);
                    if (user?.trainingCoachingCompleted && user?.brandStrategyContext) {
                        console.log(`🎯 STRATEGIC TRAINING COMPLETION: User ${userId} completed brand strategy coaching`);
                        const strategyData = JSON.parse(user.brandStrategyContext);
                        const responses = strategyData.responses;
                        console.log(`✨ STRATEGIC CONCEPTS: User ${userId} ready for strategy-informed photo creation`);
                        console.log(`📊 BRAND STRATEGY: Primary platform = ${responses.primaryPlatform}, Authority = ${responses.authorityLevel}`);
                        console.log(`🎯 STRATEGIC COMPLETION: User ${userId} training complete with brand strategy context available`);
                    }
                    else {
                        console.log(`📸 STANDARD COMPLETION: User ${userId} completed training without brand strategy coaching`);
                    }
                }
                catch (strategyError) {
                    console.error(`⚠️ STRATEGIC CONCEPTS: Failed to process for user ${userId}:`, strategyError);
                }
                console.log(`🎉 Database updated! User ${userId} training completed`);
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
    static async checkAllInProgressTrainings() {
        try {
            console.log('🔍 TRAINING COMPLETION MONITOR: Checking all in-progress trainings...');
            const inProgressModels = await storage.getAllInProgressTrainings();
            if (inProgressModels.length === 0) {
                console.log('✅ No in-progress trainings found');
                return;
            }
            console.log(`📊 Found ${inProgressModels.length} in-progress trainings to check`);
            for (const userModel of inProgressModels) {
                const timeSinceStart = Date.now() - new Date(userModel.createdAt || new Date()).getTime();
                const minutesSinceStart = timeSinceStart / (1000 * 60);
                console.log(`⏱️ User ${userModel.userId}: ${Math.round(minutesSinceStart)} minutes since training started`);
                if (minutesSinceStart >= 8) {
                    if (userModel.replicateModelId && userModel.replicateModelId.startsWith('rdt_')) {
                        console.log(`🔍 Checking by training ID: ${userModel.replicateModelId}`);
                        await this.checkAndUpdateTraining(userModel.replicateModelId, userModel.userId);
                    }
                    if (userModel.modelName) {
                        console.log(`🔍 Checking by model name: ${userModel.modelName}`);
                        await this.checkModelByName(userModel.userId, userModel.modelName);
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                else {
                    console.log(`⏳ User ${userModel.userId}: Training too recent, waiting...`);
                }
            }
        }
        catch (error) {
            console.error('❌ Error in training completion monitor:', error);
        }
    }
    startMonitoring() {
        console.log('🚀 Starting Training Completion Monitor (checks every 2 minutes)');
        TrainingCompletionMonitor.checkAllInProgressTrainings();
        this.intervalId = setInterval(() => {
            TrainingCompletionMonitor.checkAllInProgressTrainings();
        }, 2 * 60 * 1000);
    }
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Training Completion Monitor stopped');
        }
    }
}
//# sourceMappingURL=training-completion-monitor.js.map