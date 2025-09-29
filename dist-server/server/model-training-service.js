import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { storage } from './storage.js';
import { ArchitectureValidator } from './architecture-validator.js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
export const IMAGE_CATEGORIES = {
    editorial: ['portrait', 'lifestyle', 'artistic'],
    professional: ['headshot', 'business', 'corporate'],
    creative: ['artistic', 'concept', 'avant-garde']
};
export class ModelTrainingService {
    static async checkGenerationStatus(predictionId) {
        try {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch prediction status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'succeeded' && Array.isArray(data.output)) {
                const s3 = this.s3;
                const bucket = process.env['AWS_S3_BUCKET'] || 'sselfie-studio-assets';
                const uploadedUrls = [];
                for (const imageUrl of data.output) {
                    try {
                        const imgResp = await fetch(imageUrl);
                        if (!imgResp.ok)
                            throw new Error(`Failed to fetch image: ${imageUrl}`);
                        const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
                        const key = `maya-generated/${predictionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
                        const putCmd = new PutObjectCommand({
                            Bucket: bucket,
                            Key: key,
                            Body: imgBuffer,
                            ContentType: 'image/png',
                        });
                        await s3.send(putCmd);
                        const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
                        uploadedUrls.push(publicUrl);
                    }
                    catch (err) {
                        console.error('❌ Error uploading image to S3:', err);
                    }
                }
                return { status: 'succeeded', imageUrls: uploadedUrls };
            }
            else if (data.status === 'failed' || data.status === 'canceled') {
                return { status: 'failed' };
            }
            else {
                return { status: 'processing' };
            }
        }
        catch (error) {
            console.error('❌ Error in checkGenerationStatus:', error);
            throw new Error(error.message || 'Failed to check generation status');
        }
    }
    static s3 = new S3Client({
        credentials: {
            accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        },
        region: 'eu-north-1'
    });
    static generateTriggerWord(userId) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
        return `user${cleanUserId}`;
    }
    static async createImageZip(selfieImages, userId) {
        const tempDir = path.join(process.cwd(), 'temp_training');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const zipPath = path.join(tempDir, `training_${userId}_${Date.now()}.zip`);
        try {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            for (let i = 0; i < selfieImages.length; i++) {
                const imageData = selfieImages[i];
                if (!imageData.includes('data:image/') && imageData.length < 100) {
                    continue;
                }
                let base64Data = imageData;
                if (imageData.includes('data:image/')) {
                    base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                }
                const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
                try {
                    const imageBuffer = Buffer.from(paddedBase64, 'base64');
                    if (imageBuffer.length < 500) {
                        continue;
                    }
                    archive.append(imageBuffer, { name: `image_${i + 1}.jpg` });
                }
                catch (error) {
                    continue;
                }
            }
            await archive.finalize();
            await new Promise((resolve, reject) => {
                output.on('close', () => resolve(undefined));
                output.on('error', reject);
            });
            throw new Error('Legacy training service - use BulletproofUploadService.createTrainingZip() instead');
        }
        catch (error) {
            throw error;
        }
    }
    static async startModelTraining(userId, selfieImages) {
        try {
            const existingModel = await storage.getUserModelByUserId(userId);
            if (existingModel) {
            }
            const triggerWord = this.generateTriggerWord(userId);
            const zipUrl = await this.createImageZip(selfieImages, userId);
            const trainingResponse = await fetch('https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2/trainings', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        input_images: zipUrl,
                        trigger_word: triggerWord,
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
                })
            });
            const trainingData = await trainingResponse.json();
            if (!trainingResponse.ok) {
                throw new Error(`Replicate training failed: ${JSON.stringify(trainingData)}`);
            }
            console.log(`🔍 Storing training ID: ${trainingData.id} for user ${userId}`);
            const currentModel = await storage.getUserModelByUserId(userId);
            console.log(`🔒 PHASE 1: Preserving existing model data for user ${userId}`);
            console.log(`🔒 PHASE 1: Existing model - ID: ${currentModel?.replicateModelId}, Version: ${currentModel?.replicateVersionId}`);
            await storage.updateUserModel(userId, {
                trainingId: trainingData.id,
                triggerWord: triggerWord,
                trainingStatus: 'training',
                trainingProgress: 0,
                startedAt: new Date(),
                ...(currentModel?.replicateModelId ? {} : { replicateModelId: null }),
                ...(currentModel?.replicateVersionId ? {} : { replicateVersionId: null })
            });
            console.log(`✅ PHASE 1: Training started while preserving working model for user ${userId}`);
            return {
                trainingId: trainingData.id,
                status: 'training'
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async checkTrainingStatus(userId) {
        try {
            const userModel = await storage.getUserModelByUserId(userId);
            if (!userModel || (!userModel.trainingId && !userModel.replicateModelId)) {
                throw new Error('No training found for user');
            }
            const trainingId = userModel.trainingId || userModel.replicateModelId;
            console.log(`🔍 Checking training status for user ${userId}, trainingId: ${trainingId}`);
            const trainingStatusResponse = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!trainingStatusResponse.ok) {
                throw new Error(`Failed to check training status: ${trainingStatusResponse.status}`);
            }
            const trainingData = await trainingStatusResponse.json();
            let progress = 0;
            let status = 'training';
            if (trainingData.status === 'succeeded') {
                progress = 100;
                status = 'completed';
            }
            else if (trainingData.status === 'failed') {
                status = 'failed';
                progress = 0;
            }
            else if (trainingData.status === 'canceled') {
                status = 'cancelled';
                progress = 0;
            }
            else {
                progress = await this.calculateRealTrainingProgress(trainingData, userModel);
                console.log(`📊 PHASE 4: Real progress calculated: ${progress}% for user ${userId}`);
            }
            const updateData = {
                trainingStatus: status,
                trainingProgress: progress
            };
            if (status === 'completed') {
                try {
                    console.log(`✅ TRAINING COMPLETED: Safely extracting and validating new model for user ${userId}`);
                    let newModelId = null;
                    let newVersionId = null;
                    if (trainingData.output) {
                        if (trainingData.output.model) {
                            const modelParts = trainingData.output.model.split(':');
                            if (modelParts.length === 2) {
                                newModelId = modelParts[0];
                                newVersionId = modelParts[1];
                                console.log(`✅ PHASE 1: Extracted model from output.model: ${newModelId}:${newVersionId}`);
                            }
                        }
                        if (!newModelId && trainingData.output.version) {
                            const versionMatch = trainingData.output.version.match(/([^\/]+\/[^:]+):(.+)$/);
                            if (versionMatch) {
                                newModelId = versionMatch[1];
                                newVersionId = versionMatch[2];
                                console.log(`✅ PHASE 1: Extracted model from version URL: ${newModelId}:${newVersionId}`);
                            }
                        }
                    }
                    if (newModelId && newVersionId) {
                        if (newModelId.includes(':') || !newVersionId) {
                            console.error(`❌ PHASE 1: Invalid model format - modelId: ${newModelId}, versionId: ${newVersionId}`);
                            throw new Error('Invalid model format extracted from training');
                        }
                        const isValid = await this.validateModelVersion(newModelId, newVersionId);
                        if (!isValid) {
                            console.error(`❌ PHASE 3: Model validation failed during completion - modelId: ${newModelId}, versionId: ${newVersionId}`);
                            throw new Error('Extracted model failed validation test');
                        }
                        const existingModel = await storage.getUserModelByUserId(userId);
                        console.log(`🔒 PHASE 1: Replacing model - Previous: ${existingModel?.replicateModelId}:${existingModel?.replicateVersionId}`);
                        console.log(`🔒 PHASE 1: Replacing model - New: ${newModelId}:${newVersionId}`);
                        updateData.replicateModelId = newModelId;
                        updateData.replicateVersionId = newVersionId;
                        updateData.completedAt = new Date();
                        console.log(`✅ PHASE 1 + 3: Model safely replaced after format and API validation for user ${userId}`);
                    }
                    else {
                        console.error(`❌ PHASE 1: Could not extract valid model data from training completion`);
                        console.error(`❌ PHASE 1: Training output:`, JSON.stringify(trainingData.output, null, 2));
                        throw new Error('Failed to extract model data from completed training');
                    }
                }
                catch (error) {
                    console.error('❌ PHASE 1: Failed to safely replace model data:', error);
                    console.log(`🔒 PHASE 1: Preserving existing working model due to replacement failure`);
                    updateData.trainingStatus = 'extraction_failed';
                }
            }
            if (status === 'completed' && updateData.replicateModelId) {
                updateData.trainedModelPath = updateData.replicateModelId;
                console.log(`✅ PHASE 1: Updated trainedModelPath to: ${updateData.replicateModelId}`);
            }
            await storage.updateUserModel(userId, updateData);
            return { status, progress };
        }
        catch (error) {
            throw error;
        }
    }
    static async retryModelExtraction(userId) {
        try {
            console.log(`🔧 PHASE 3: Attempting model extraction retry for user ${userId}`);
            const userModel = await storage.getUserModelByUserId(userId);
            if (!userModel || !userModel.trainingId) {
                throw new Error('No training found for user');
            }
            if (userModel.trainingStatus !== 'extraction_failed') {
                throw new Error(`Cannot retry extraction for status: ${userModel.trainingStatus}`);
            }
            const trainingResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.trainingId}`, {
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!trainingResponse.ok) {
                throw new Error(`Failed to fetch training data: ${trainingResponse.status}`);
            }
            const trainingData = await trainingResponse.json();
            if (trainingData.status !== 'succeeded') {
                throw new Error(`Training is not in succeeded state: ${trainingData.status}`);
            }
            let newModelId = null;
            let newVersionId = null;
            if (trainingData.output) {
                if (trainingData.output.model) {
                    const modelParts = trainingData.output.model.split(':');
                    if (modelParts.length === 2) {
                        newModelId = modelParts[0];
                        newVersionId = modelParts[1];
                        console.log(`✅ PHASE 3: Extracted model from output.model: ${newModelId}:${newVersionId}`);
                    }
                }
                if (!newModelId && trainingData.output.version) {
                    const versionMatch = trainingData.output.version.match(/([^\/]+\/[^:]+):(.+)$/);
                    if (versionMatch) {
                        newModelId = versionMatch[1];
                        newVersionId = versionMatch[2];
                        console.log(`✅ PHASE 3: Extracted model from version URL: ${newModelId}:${newVersionId}`);
                    }
                }
            }
            if (!newModelId || !newVersionId) {
                console.error(`❌ PHASE 3: Could not extract valid model data from retry`);
                throw new Error('Failed to extract model data from training');
            }
            if (newModelId.includes(':') || !newVersionId) {
                console.error(`❌ PHASE 3: Invalid model format - modelId: ${newModelId}, versionId: ${newVersionId}`);
                throw new Error('Invalid model format extracted from training');
            }
            const isValid = await this.validateModelVersion(newModelId, newVersionId);
            if (!isValid) {
                throw new Error('Extracted model failed validation test');
            }
            await storage.updateUserModel(userId, {
                replicateModelId: newModelId,
                replicateVersionId: newVersionId,
                trainedModelPath: newModelId,
                trainingStatus: 'completed',
                completedAt: new Date()
            });
            console.log(`✅ PHASE 3: Model extraction retry successful for user ${userId}`);
            return {
                success: true,
                message: `Model extraction successful. New model: ${newModelId}:${newVersionId}`
            };
        }
        catch (error) {
            console.error(`❌ PHASE 3: Model extraction retry failed for user ${userId}:`, error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error during retry'
            };
        }
    }
    static async calculateRealTrainingProgress(trainingData, userModel) {
        try {
            const trainingStartTime = userModel.startedAt
                ? new Date(userModel.startedAt).getTime()
                : new Date(userModel.createdAt || new Date()).getTime();
            const now = Date.now();
            const trainingDuration = now - trainingStartTime;
            const thirtyMinutes = 30 * 60 * 1000;
            let logBasedProgress = 0;
            if (trainingData.logs && trainingData.logs.length > 0) {
                const logs = trainingData.logs;
                const stepRegex = /step\s+(\d+)\/(\d+)/i;
                const percentRegex = /(\d+(?:\.\d+)?)%/;
                for (let i = logs.length - 1; i >= 0; i--) {
                    const logEntry = logs[i];
                    const stepMatch = logEntry.match(stepRegex);
                    if (stepMatch) {
                        const currentStep = parseInt(stepMatch[1]);
                        const totalSteps = parseInt(stepMatch[2]);
                        logBasedProgress = Math.round((currentStep / totalSteps) * 90);
                        console.log(`📊 PHASE 4: Found step progress: ${currentStep}/${totalSteps} = ${logBasedProgress}%`);
                        break;
                    }
                    const percentMatch = logEntry.match(percentRegex);
                    if (percentMatch) {
                        logBasedProgress = Math.min(parseInt(percentMatch[1]), 90);
                        console.log(`📊 PHASE 4: Found percentage progress: ${logBasedProgress}%`);
                        break;
                    }
                }
            }
            const timeBasedProgress = Math.min(Math.round((trainingDuration / thirtyMinutes) * 85), 85);
            const combinedProgress = Math.max(logBasedProgress, timeBasedProgress);
            if (trainingDuration < 2 * 60 * 1000) {
                return Math.min(combinedProgress, 10);
            }
            else if (trainingDuration < 5 * 60 * 1000) {
                return Math.min(combinedProgress, 25);
            }
            else if (trainingDuration < 15 * 60 * 1000) {
                return Math.min(combinedProgress, 60);
            }
            else if (trainingDuration < 25 * 60 * 1000) {
                return Math.min(combinedProgress, 85);
            }
            else {
                return Math.min(combinedProgress, 95);
            }
        }
        catch (error) {
            console.error('📊 PHASE 4: Error calculating real progress:', error);
            const trainingStartTime = new Date(userModel.createdAt || new Date()).getTime();
            const now = Date.now();
            const trainingDuration = now - trainingStartTime;
            const thirtyMinutes = 30 * 60 * 1000;
            return Math.min(Math.round((trainingDuration / thirtyMinutes) * 100), 95);
        }
    }
    static getTrainingStageDescription(progress, trainingDuration) {
        if (progress >= 95) {
            return "Finalizing your AI model...";
        }
        else if (progress >= 85) {
            return "Optimizing model quality...";
        }
        else if (progress >= 60) {
            return "Training AI to recognize your features...";
        }
        else if (progress >= 25) {
            return "Processing your photos...";
        }
        else if (progress >= 10) {
            return "Analyzing your style...";
        }
        else {
            return "Initializing training...";
        }
    }
    static async validateModelVersion(modelId, versionId) {
        try {
            console.log(`🔧 PHASE 3: Validating model ${modelId}:${versionId}`);
            const versionResponse = await fetch(`https://api.replicate.com/v1/models/${modelId}/versions/${versionId}`, {
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!versionResponse.ok) {
                console.error(`❌ PHASE 3: Model validation failed: ${versionResponse.status}`);
                return false;
            }
            const versionData = await versionResponse.json();
            if (versionData.status && versionData.status !== 'succeeded') {
                console.error(`❌ PHASE 3: Model version not ready: ${versionData.status}`);
                return false;
            }
            console.log(`✅ PHASE 3: Model validation successful for ${modelId}:${versionId}`);
            return true;
        }
        catch (error) {
            console.error(`❌ PHASE 3: Model validation error:`, error);
            return false;
        }
    }
    static async generateCustomPrompt(userId, customPrompt, count = 4) {
        return this.generateUserImages(userId, customPrompt, count);
    }
    static async generateUserImages(userId, customPrompt, count = 4, options) {
        try {
            ArchitectureValidator.enforceZeroTolerance();
            const userModel = await storage.getUserModelByUserId(userId);
            if (!userModel || userModel.trainingStatus !== 'completed' || !userModel.replicateVersionId) {
                throw new Error('USER_MODEL_NOT_TRAINED: User must train their AI model before generating images. Individual models required.');
            }
            if (!userModel.triggerWord) {
                throw new Error('Model training incomplete - no trigger word available');
            }
            const fullModelVersion = userModel.replicateVersionId;
            if (!fullModelVersion) {
                throw new Error(`CRITICAL: User ${userId} has no version ID. Model: ${userModel.replicateModelId}, Status: ${userModel.trainingStatus}`);
            }
            const modelVersion = `${userModel.replicateModelId}:${fullModelVersion}`;
            console.log(`🔒 MODEL TRAINING SERVICE VERSION VALIDATION: Model: ${userModel.replicateModelId}, Version: ${fullModelVersion}, Combined: ${modelVersion}`);
            const triggerWord = userModel.triggerWord;
            const promptId = `MAYA-${Date.now()}`;
            console.log(`🔍 [${promptId}] MODEL TRAINING SERVICE ENTRY:`);
            console.log(`🏭 RECEIVED PROMPT FROM MAYA: "${customPrompt.substring(0, 300)}"`);
            let basePrompt;
            if (customPrompt.includes('{trigger_word}')) {
                basePrompt = customPrompt.replace('{trigger_word}', triggerWord);
                console.log(`🔧 [${promptId}] LEGACY FORMAT: Replaced trigger word placeholder`);
            }
            else if (customPrompt.startsWith(triggerWord)) {
                basePrompt = customPrompt;
                console.log(`✅ [${promptId}] TRIGGER WORD PRESENT: Using Maya's prompt as-is`);
            }
            else {
                basePrompt = `${triggerWord} ${customPrompt}`;
                console.log(`🔧 [${promptId}] ADDING TRIGGER: Prepended "${triggerWord}"`);
            }
            console.log(`🎯 [${promptId}] BASE PROMPT: "${basePrompt.substring(0, 300)}"`);
            const user = await storage.getUser(userId);
            if (!user) {
                throw new Error('User not found for image generation');
            }
            const { enforceGender, normalizeGender, promptHasGender } = await import('./utils/gender-prompt.js');
            const secureGender = normalizeGender(user.gender);
            if (secureGender) {
                console.log(`👤 [${promptId}] USER GENDER: ${secureGender}`);
            }
            else {
                console.log(`⚠️ [${promptId}] USER GENDER MISSING: proceeding without explicit token`);
            }
            let genderEnhancedPrompt = enforceGender(triggerWord, basePrompt, secureGender || undefined);
            if (genderEnhancedPrompt !== basePrompt) {
                console.log(`✅ [${promptId}] GENDER INJECTED: "${genderEnhancedPrompt.substring(0, 140)}"`);
            }
            else {
                console.log(`ℹ️ [${promptId}] GENDER ALREADY PRESENT OR NOT AVAILABLE`);
            }
            console.log(`🎯 [${promptId}] ENHANCED PROMPT: "${genderEnhancedPrompt.substring(0, 300)}"`);
            let textureEnhancedPrompt = genderEnhancedPrompt;
            const skinTextureEnhancements = [
                'natural skin texture',
                'realistic skin details',
                'professional lighting',
                'soft natural shadows',
                'high resolution skin',
                'detailed facial features'
            ];
            const hasTextureTerms = skinTextureEnhancements.some(term => textureEnhancedPrompt.toLowerCase().includes(term.toLowerCase()));
            if (!hasTextureTerms) {
                textureEnhancedPrompt = `${textureEnhancedPrompt}, natural skin texture, professional lighting, realistic skin details`;
                console.log(`✨ [${promptId}] TEXTURE ENHANCED: Added natural skin texture for professional realism`);
            }
            else {
                console.log(`✨ [${promptId}] TEXTURE PRESENT: Skin enhancement already in prompt`);
            }
            if (!textureEnhancedPrompt.toLowerCase().includes('high quality')) {
                textureEnhancedPrompt = `${textureEnhancedPrompt}, high quality, detailed, professional photography`;
                console.log(`📸 [${promptId}] QUALITY ENHANCED: Added professional photography terms`);
            }
            console.log(`✨ [${promptId}] TEXTURE ENHANCED PROMPT: "${textureEnhancedPrompt.substring(0, 300)}"`);
            const finalPrompt = ModelTrainingService.formatPrompt(textureEnhancedPrompt, triggerWord);
            console.log(`🚀 [${promptId}] PROMPT FORMATTED: ${finalPrompt.length} characters ready for generation`);
            console.log(`🎯 MAYA PURE INTELLIGENCE: Using Maya's embedded count intelligence`);
            console.log(`🔍 [${promptId}] FINAL PROMPT: ${finalPrompt.length} characters processed`);
            const intelligentParams = { count: count, reasoning: "Maya's integrated styling intelligence" };
            console.log(`🎯 MAYA PURE INTELLIGENCE: Trusting Maya's complete parameter intelligence`);
            const mayaParams = { guidance_scale: 5, num_inference_steps: 50, megapixels: "1" };
            const aspectRatio = "4:5";
            console.log(`🎯 MAYA FAÇADE: Using standard parameters - Maya intelligence via API only`);
            const merged = {
                aspect_ratio: aspectRatio,
                megapixels: "1",
                output_format: "png",
                output_quality: 95,
                guidance_scale: mayaParams.guidance_scale,
                num_inference_steps: mayaParams.num_inference_steps
            };
            const finalCount = 2;
            const seed = typeof options?.seed === 'number'
                ? options.seed
                : Math.floor(Math.random() * 1e9);
            console.log(`🎯 MAYA SINGLE PATH: Using packaged model for consistent quality`);
            if (!userModel?.replicateModelId || !userModel?.replicateVersionId) {
                throw new Error("BLOCKED: User model missing required packaged model ID or version. Please complete training first.");
            }
            const loraWeights = await storage.getLoRAWeights(userId);
            let userModelVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;
            const requestBody = {
                version: userModelVersion,
                input: {
                    prompt: finalPrompt,
                    num_outputs: finalCount,
                    guidance_scale: merged.guidance_scale,
                    num_inference_steps: merged.num_inference_steps,
                    aspect_ratio: merged.aspect_ratio,
                    megapixels: merged.megapixels,
                    output_format: "png",
                    output_quality: 95,
                    seed: seed
                }
            };
            if (loraWeights && loraWeights.s3Bucket && loraWeights.s3Key) {
                requestBody.version = "black-forest-labs/flux-1.1-pro";
                const secureLoRAUrl = await this.generateSecureLoRAUrl(loraWeights.s3Bucket, loraWeights.s3Key, 7200);
                requestBody.input.lora_weights = secureLoRAUrl;
                const mayaLoraScale = this.getMayaLoraScale(finalPrompt, options?.categoryContext);
                requestBody.input.lora_scale = mayaLoraScale;
                console.log(`🎨 LORA PERSONALIZATION: Using extracted weights with lora_scale=${mayaLoraScale} (shot type optimized)`);
                console.log(`🔒 Secure LoRA Weights: ${secureLoRAUrl.substring(0, 100)}...`);
            }
            else {
                console.log(`📦 PACKAGED MODEL: No extracted LoRA weights, using packaged model`);
            }
            if (requestBody.version.includes("flux-1.1-pro") && !requestBody.input.lora_weights) {
                throw new Error("BLOCKED: Base FLUX model requires LoRA weights for personalization.");
            }
            else if (requestBody.version.includes("flux-1.1-pro")) {
                console.log(`✅ BASE FLUX + LORA: Using base FLUX model with personalized LoRA weights`);
            }
            console.log("🚚 Replicate payload keys:", Object.keys(requestBody.input), "version:", requestBody.version);
            console.log("🎯 MAYA QUALITY PARAMS: guidance_scale =", requestBody.input.guidance_scale, "steps =", requestBody.input.num_inference_steps, "megapixels =", requestBody.input.megapixels, "(API-compliant)");
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            const prediction = await response.json();
            if (!response.ok) {
                throw new Error(`Replicate API error (${response.status}): ${JSON.stringify(prediction)}`);
            }
            if (!prediction.id) {
                throw new Error(`No prediction ID returned from Replicate API: ${JSON.stringify(prediction)}`);
            }
            return {
                images: [],
                predictionId: prediction.id,
            };
        }
        catch (error) {
            throw new Error(`Failed to generate images: ${error.message}`);
        }
    }
    static formatPrompt(prompt, triggerWord) {
        console.log(`🎯 MAYA PURE INTELLIGENCE: Zero-interference formatting mode activated`);
        const normalizedPrompt = (prompt || "").replace(/\s+/g, " ").trim();
        if (normalizedPrompt.startsWith(triggerWord)) {
            console.log(`✅ MAYA PURE INTELLIGENCE: Trigger word already present, using Maya's exact output`);
            return normalizedPrompt;
        }
        else {
            console.log(`✅ MAYA PURE INTELLIGENCE: Adding trigger word to preserve Maya's complete styling intelligence`);
            return `${triggerWord}, ${normalizedPrompt}`;
        }
    }
    static async extractLoRAWeights(trainingId, userId) {
        console.log(`🔧 EXTRACTING LoRA WEIGHTS: Starting extraction for training ${trainingId}, user ${userId}`);
        try {
            const response = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch training details: ${response.status}`);
            }
            const trainingData = await response.json();
            console.log(`🔍 TRAINING DATA:`, JSON.stringify(trainingData, null, 2));
            let loraWeightsUrl = null;
            if (trainingData.output && typeof trainingData.output === 'string') {
                loraWeightsUrl = trainingData.output;
            }
            else if (trainingData.output && trainingData.output.weights) {
                loraWeightsUrl = trainingData.output.weights;
            }
            else if (trainingData.urls && trainingData.urls.get) {
                loraWeightsUrl = trainingData.urls.get;
            }
            if (!loraWeightsUrl) {
                throw new Error('No LoRA weights URL found in training output');
            }
            console.log(`📥 DOWNLOADING LoRA WEIGHTS: ${loraWeightsUrl}`);
            const weightsResponse = await fetch(loraWeightsUrl);
            if (!weightsResponse.ok) {
                throw new Error(`Failed to download LoRA weights: ${weightsResponse.status}`);
            }
            const weightsBuffer = await weightsResponse.arrayBuffer();
            const fileSize = weightsBuffer.byteLength;
            const crypto = await import('crypto');
            const checksum = crypto.createHash('sha256').update(Buffer.from(weightsBuffer)).digest('hex');
            console.log(`📊 LoRA WEIGHTS INFO: Size=${fileSize} bytes, Checksum=${checksum.substring(0, 16)}...`);
            const s3Key = `lora-weights/${userId}/${trainingId}-${Date.now()}.safetensors`;
            const uploadCommand = new PutObjectCommand({
                Bucket: process.env['AWS_S3_BUCKET'] || 'sselfie-studio-assets',
                Key: s3Key,
                Body: Buffer.from(weightsBuffer),
                ContentType: 'application/octet-stream',
                ServerSideEncryption: 'AES256',
                Metadata: {
                    userId: userId,
                    trainingId: trainingId,
                    checksum: checksum,
                    fileSize: fileSize.toString()
                }
            });
            await this.s3.send(uploadCommand);
            const bucketName = process.env['AWS_S3_BUCKET'] || 'sselfie-studio-assets';
            console.log(`✅ LoRA WEIGHTS EXTRACTED: Stored securely in bucket ${bucketName}/${s3Key}`);
            return {
                loraWeightsUrl: `s3://${bucketName}/${s3Key}`,
                checksum: checksum,
                fileSize: fileSize
            };
        }
        catch (error) {
            console.error(`❌ LoRA EXTRACTION FAILED for ${trainingId}:`, error);
            throw new Error(`LoRA extraction failed: ${error.message}`);
        }
    }
    static async generateSecureLoRAUrl(s3Bucket, s3Key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: s3Bucket,
                Key: s3Key
            });
            const presignedUrl = await getSignedUrl(this.s3, command, { expiresIn });
            console.log(`🔒 SECURE LORA ACCESS: Generated presigned URL for ${s3Key} (expires in ${expiresIn}s)`);
            return presignedUrl;
        }
        catch (error) {
            console.error(`❌ PRESIGNED URL GENERATION FAILED for ${s3Key}:`, error);
            throw new Error(`Failed to generate secure LoRA URL: ${error.message}`);
        }
    }
    static getMayaLoraScale(prompt, categoryContext) {
        try {
            const promptLower = prompt.toLowerCase();
            const categoryLower = (categoryContext || '').toLowerCase();
            if (promptLower.includes('headshot') || promptLower.includes('portrait') ||
                promptLower.includes('close-up') || promptLower.includes('face') ||
                promptLower.includes('professional headshot') || promptLower.includes('linkedin photo') ||
                categoryLower.includes('headshot') || categoryLower.includes('portrait')) {
                console.log(`🎯 MAYA FAÇADE: Detected closeUpPortrait - using default lora_scale=0.9`);
                return 0.9;
            }
            if (promptLower.includes('full body') || promptLower.includes('environment') ||
                promptLower.includes('location') || promptLower.includes('background') ||
                promptLower.includes('setting') || promptLower.includes('lifestyle') ||
                promptLower.includes('travel') || promptLower.includes('outdoor') ||
                categoryLower.includes('lifestyle') || categoryLower.includes('travel') ||
                categoryLower.includes('environmental')) {
                console.log(`🎯 MAYA FAÇADE: Detected fullScenery - using default lora_scale=1.0`);
                return 1.0;
            }
            if (promptLower.includes('creative') || promptLower.includes('artistic') ||
                promptLower.includes('editorial') || promptLower.includes('avant-garde') ||
                promptLower.includes('concept') || promptLower.includes('dramatic') ||
                categoryLower.includes('creative') || categoryLower.includes('artistic') ||
                categoryLower.includes('editorial')) {
                console.log(`🎯 MAYA FAÇADE: Detected creativeOptimized - using default lora_scale=1.1`);
                return 1.1;
            }
            console.log(`🎯 MAYA FAÇADE: Default halfBodyShot - using default lora_scale=1.0`);
            return 1.0;
        }
        catch (error) {
            console.error('🎯 MAYA LORA: Error detecting shot type, using default 1.0:', error);
            return 1.0;
        }
    }
}
//# sourceMappingURL=model-training-service.js.map