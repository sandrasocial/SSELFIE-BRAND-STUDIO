import { storage } from './storage.js';
export class ModelRetrainService {
    static async restartTraining(userId) {
        try {
            console.log(`🔄 Restarting training for user: ${userId}`);
            const existingModel = await storage.getUserModelByUserId(userId);
            if (!existingModel) {
                return {
                    success: false,
                    message: 'No existing model record found. Please use the regular training process.'
                };
            }
            if (existingModel.trainingStatus !== 'completed') {
                return {
                    success: false,
                    message: `Cannot restart training. Current status: ${existingModel.trainingStatus}. Please wait for current training to complete or use regular training.`
                };
            }
            console.log(`📋 Found existing model: ${existingModel.modelName} with trigger word: ${existingModel.triggerWord}`);
            const s3ZipUrl = `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/training_${userId}_${existingModel.modelName?.split('-').pop() || Date.now()}.zip`;
            const newModelName = `${userId}-selfie-lora-${Date.now()}`;
            const trainingData = {
                destination: `${process.env.REPLICATE_USERNAME || 'models'}/${newModelName}`,
                input: {
                    input_images: s3ZipUrl,
                    trigger_word: existingModel.triggerWord,
                    steps: 1200,
                    learning_rate: 0.0002,
                    batch_size: 1,
                    lora_rank: 32,
                    resolution: "1024",
                    optimizer: "adamw8bit",
                    autocaption: true,
                    cache_latents_to_disk: false,
                    caption_dropout_rate: 0.1
                }
            };
            console.log(`🚀 Starting Replicate training with trigger word: ${existingModel.triggerWord}`);
            const response = await fetch('https://api.replicate.com/v1/trainings', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env["REPLICATE_API_TOKEN"]}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trainingData)
            });
            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Replicate training failed:', response.status, errorData);
                return {
                    success: false,
                    message: `Training failed: ${response.status} - ${errorData}`
                };
            }
            const result = await response.json();
            const replicateModelId = result.id;
            console.log(`✅ New training started! ID: ${replicateModelId}`);
            await storage.updateUserModel(userId, {
                replicateModelId: replicateModelId,
                modelName: newModelName,
                trainingStatus: 'training',
                triggerWord: existingModel.triggerWord,
                trainedModelPath: `${process.env.REPLICATE_USERNAME || 'models'}/${newModelName}`,
                modelType: 'flux-standard',
                updatedAt: new Date()
            });
            console.log(`📝 Database updated with new training ID: ${replicateModelId}`);
            return {
                success: true,
                message: `Training restarted successfully! New training ID: ${replicateModelId}. The training will take 10-15 minutes to complete.`,
                replicateModelId: replicateModelId
            };
        }
        catch (error) {
            console.error('❌ Model retrain error:', error);
            return {
                success: false,
                message: `Failed to restart training: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
//# sourceMappingURL=retrain-model.js.map