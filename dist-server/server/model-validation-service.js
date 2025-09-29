import { storage } from './storage.js';
export class ModelValidationService {
    static async validateAndCorrectUserModel(userId) {
        console.log(`🔍 CRITICAL MODEL VALIDATION: Checking user ${userId}`);
        try {
            const userModel = await storage.getUserModelByUserId(userId);
            if (!userModel) {
                return {
                    isValid: false,
                    canGenerate: false,
                    modelId: null,
                    versionId: null,
                    triggerWord: null,
                    errorMessage: 'No AI model found. Please complete training first by uploading selfies.'
                };
            }
            if (userModel.trainingStatus !== 'completed') {
                return {
                    isValid: false,
                    canGenerate: false,
                    modelId: userModel.replicateModelId,
                    versionId: userModel.replicateVersionId,
                    triggerWord: userModel.triggerWord,
                    errorMessage: `Training not complete. Status: ${userModel.trainingStatus}. Please wait for training to finish.`
                };
            }
            let modelId = userModel.replicateModelId;
            let versionId = userModel.replicateVersionId;
            let needsCorrection = false;
            if (versionId && versionId.includes(':')) {
                console.log(`🚨 CORRUPTION DETECTED: User ${userId} has corrupted model data`);
                const parts = versionId.split(':');
                if (parts.length === 2) {
                    modelId = parts[0];
                    versionId = parts[1];
                    needsCorrection = true;
                    console.log(`🔧 CORRECTING: Model: ${modelId}, Version: ${versionId}`);
                    await this.correctDatabaseModel(userId, modelId, versionId);
                }
            }
            if (!modelId || !modelId.includes('/')) {
                return {
                    isValid: false,
                    canGenerate: false,
                    modelId,
                    versionId,
                    triggerWord: userModel.triggerWord,
                    errorMessage: 'Invalid model ID format. Training data may be corrupted.',
                    requiresCorrection: true
                };
            }
            if (!versionId || versionId.length < 32 || versionId.includes('/') || versionId.includes(':')) {
                return {
                    isValid: false,
                    canGenerate: false,
                    modelId,
                    versionId,
                    triggerWord: userModel.triggerWord,
                    errorMessage: 'Invalid version ID format. Training may not have completed properly.',
                    requiresCorrection: true
                };
            }
            if (!userModel.triggerWord || userModel.triggerWord.trim() === '') {
                return {
                    isValid: false,
                    canGenerate: false,
                    modelId,
                    versionId,
                    triggerWord: null,
                    errorMessage: 'Missing trigger word. Model configuration incomplete.'
                };
            }
            console.log(`✅ User ${userId} model validated${needsCorrection ? ' and corrected' : ''}:`);
            console.log(`   Model ID: ${modelId}`);
            console.log(`   Version ID: ${versionId}`);
            console.log(`   Trigger Word: ${userModel.triggerWord}`);
            console.log(`   Packaged Model: Using trained model with built-in LoRA`);
            return {
                isValid: true,
                canGenerate: true,
                modelId,
                versionId,
                triggerWord: userModel.triggerWord
            };
        }
        catch (error) {
            console.error(`❌ Model validation error for user ${userId}:`, error);
            return {
                isValid: false,
                canGenerate: false,
                modelId: null,
                versionId: null,
                triggerWord: null,
                errorMessage: 'System error during model validation. Please try again.'
            };
        }
    }
    static async correctDatabaseModel(userId, modelId, versionId) {
        try {
            console.log(`🔧 CORRECTING DATABASE: User ${userId} model data`);
            const { db } = await import('./db.js');
            const { userModels } = await import('../shared/schema.js');
            const { eq } = await import('drizzle-orm');
            await db
                .update(userModels)
                .set({
                replicateModelId: modelId,
                replicateVersionId: versionId,
                updatedAt: new Date()
            })
                .where(eq(userModels.userId, userId));
            console.log(`✅ CORRECTED: User ${userId} model data updated in database`);
        }
        catch (error) {
            console.error(`❌ Failed to correct model data for user ${userId}:`, error);
            throw error;
        }
    }
    static async enforceUserModelRequirements(userId) {
        const validation = await this.validateAndCorrectUserModel(userId);
        if (!validation.canGenerate) {
            throw new Error(validation.errorMessage || 'Cannot generate images - individual trained model required');
        }
        return {
            modelId: validation.modelId,
            versionId: validation.versionId,
            triggerWord: validation.triggerWord
        };
    }
    static async validateAllCompletedModels() {
        console.log('🔍 SYSTEM HEALTH CHECK: Validating all completed models...');
        let healthy = 0;
        let corrupted = 0;
        let corrected = 0;
        try {
            const { db } = await import('./db.js');
            const { userModels } = await import('../shared/schema.js');
            const { eq } = await import('drizzle-orm');
            const completedModels = await db
                .select()
                .from(userModels)
                .where(eq(userModels.trainingStatus, 'completed'));
            for (const model of completedModels) {
                const validation = await this.validateAndCorrectUserModel(model.userId);
                if (validation.isValid) {
                    if (validation.requiresCorrection) {
                        corrected++;
                    }
                    else {
                        healthy++;
                    }
                }
                else {
                    corrupted++;
                    console.error(`❌ User ${model.userId} has corrupted model: ${validation.errorMessage}`);
                }
            }
            console.log(`📊 VALIDATION COMPLETE: ${healthy} healthy, ${corrupted} corrupted, ${corrected} corrected`);
            return { healthy, corrupted, corrected };
        }
        catch (error) {
            console.error('❌ System validation failed:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=model-validation-service.js.map