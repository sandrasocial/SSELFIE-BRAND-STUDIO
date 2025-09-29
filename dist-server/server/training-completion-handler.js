import { storage } from './storage.js';
import { paths } from './utils/paths.js';
import { EmailService } from './email-service.js';
import { ModelTrainingService } from './model-training-service.js';
export class TrainingCompletionHandler {
    static async handleTrainingCompletion(userId, replicateModelId, versionId) {
        try {
            let extractedWeights = null;
            try {
                const { loraWeightsUrl, checksum, fileSize } = await ModelTrainingService.extractLoRAWeights(replicateModelId, userId);
                extractedWeights = {
                    userId,
                    trainingId: replicateModelId,
                    weightsUrl: loraWeightsUrl,
                    checksum,
                    fileSize,
                    extractedAt: new Date()
                };
                console.log(`✅ LoRA weights extracted: ${extractedWeights.weightsUrl}`);
            }
            catch (error) {
                console.error(`❌ LoRA extraction failed:`, error);
            }
            const triggerWord = await this.getOrCreateTriggerWord(userId);
            console.log(`ℹ️ Using trigger word '${triggerWord}' for user ${userId}`);
            const modelUpdate = {
                trainingStatus: 'completed',
                replicateModelId,
                replicateVersionId: versionId || undefined,
                triggerWord,
                trainedModelPath: paths.getUserModelPath(userId),
                modelType: extractedWeights ? 'flux-lora' : 'flux-packaged',
                completedAt: new Date(),
                updatedAt: new Date()
            };
            await storage.updateUserModel(userId, modelUpdate);
            if (extractedWeights) {
                try {
                    await storage.storeLoRAWeights(extractedWeights);
                    console.log(`✅ LoRA weights stored for user ${userId}`);
                }
                catch (error) {
                    console.error(`❌ Failed to store LoRA weights:`, error);
                }
            }
            await this.sendModelReadyEmail(userId);
            await this.processBrandStrategy(userId);
            return {
                success: true,
                modelId: replicateModelId,
                versionId: versionId || undefined,
                triggerWord,
                modelType: modelUpdate.modelType,
                completedAt: modelUpdate.completedAt
            };
        }
        catch (error) {
            console.error(`❌ Training completion failed for user ${userId}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during completion'
            };
        }
    }
    static async getOrCreateTriggerWord(userId) {
        const existingModel = await storage.getUserModelByUserId(userId);
        if (existingModel?.triggerWord) {
            return existingModel.triggerWord;
        }
        return `user${userId}`;
    }
    static async sendModelReadyEmail(userId) {
        try {
            const user = await storage.getUser(userId);
            if (user?.email) {
                const userName = this.formatUserName(user);
                await EmailService.sendModelReadyEmail(user.email, userName);
            }
        }
        catch (error) {
            console.error('Failed to send model ready email:', error);
        }
    }
    static formatUserName(user) {
        return user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || 'User';
    }
    static async processBrandStrategy(userId) {
        try {
            const user = await storage.getUser(userId);
            if (!user?.trainingCoachingCompleted || !user?.brandStrategyContext) {
                return;
            }
            const strategyData = JSON.parse(user.brandStrategyContext);
            console.log('Brand strategy processed:', {
                userId,
                primaryPlatform: strategyData.responses.primaryPlatform,
                authorityLevel: strategyData.responses.authorityLevel
            });
        }
        catch (error) {
            console.error('Failed to process brand strategy:', error);
        }
    }
}
//# sourceMappingURL=training-completion-handler.js.map