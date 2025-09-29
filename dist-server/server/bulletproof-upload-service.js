import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { storage } from './storage.js';
export class BulletproofUploadService {
    static s3 = new S3Client({
        credentials: {
            accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        },
        region: 'eu-north-1'
    });
    static async validateUploadedImages(userId, imageFiles) {
        console.log(`🔍 VALIDATION: Starting image validation for user ${userId}`);
        const errors = [];
        const validImages = [];
        if (!imageFiles || imageFiles.length === 0) {
            errors.push('❌ CRITICAL: No images provided. Upload at least 10 selfies before training.');
            return { success: false, errors, validImages };
        }
        if (imageFiles.length < 10) {
            errors.push(`❌ CRITICAL: Only ${imageFiles.length} images provided. MINIMUM 10 selfies required - no exceptions.`);
            return { success: false, errors, validImages };
        }
        console.log(`🛡️ VALIDATION GATE 1 PASSED: ${imageFiles.length} images provided (meets minimum 10)`);
        if (imageFiles.length < 15) {
            console.log(`⚠️  WARNING: Only ${imageFiles.length} images - recommend 15-20 for best results`);
        }
        for (let i = 0; i < imageFiles.length; i++) {
            const imageData = imageFiles[i];
            if (!imageData) {
                errors.push(`Image ${i + 1}: No image data provided.`);
                continue;
            }
            try {
                if (!imageData.includes('data:image/')) {
                    errors.push(`Image ${i + 1}: Invalid format. Must be a valid image file.`);
                    continue;
                }
                const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
                const imageBuffer = Buffer.from(paddedBase64, 'base64');
                if (imageBuffer.length < 10240) {
                    errors.push(`Image ${i + 1}: File too small. Please use higher quality photos.`);
                    continue;
                }
                if (imageBuffer.length > 10 * 1024 * 1024) {
                    errors.push(`Image ${i + 1}: File too large. Maximum 10MB per image.`);
                    continue;
                }
                validImages.push(imageData);
            }
            catch (error) {
                errors.push(`Image ${i + 1}: Corrupted or invalid image file.`);
            }
        }
        if (validImages.length < 10) {
            errors.push(`❌ CRITICAL: Only ${validImages.length} valid images after processing. Need minimum 10 valid images.`);
            console.log(`❌ VALIDATION FAILED: Insufficient valid images (${validImages.length}/10 minimum)`);
            return { success: false, errors, validImages };
        }
        const success = validImages.length >= 10 && errors.length === 0;
        console.log(`✅ VALIDATION GATE 2 PASSED: ${validImages.length} valid images, ${errors.length} errors`);
        return { success, errors, validImages };
    }
    static async uploadImagesToS3(userId, validImages) {
        console.log(`📤 S3 UPLOAD: Starting upload for user ${userId}`);
        const errors = [];
        const s3Urls = [];
        const bucketName = process.env['AWS_S3_BUCKET'];
        if (!bucketName) {
            errors.push('❌ CRITICAL: AWS_S3_BUCKET environment variable is required');
            return { success: false, errors, s3Urls };
        }
        for (let i = 0; i < validImages.length; i++) {
            try {
                const imageData = validImages[i];
                if (!imageData) {
                    throw new Error(`Missing image data for image ${i + 1}`);
                }
                const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const fileName = `user-${userId}/training-image-${i + 1}-${Date.now()}.jpg`;
                const upload = new Upload({
                    client: this.s3,
                    params: {
                        Bucket: bucketName,
                        Key: fileName,
                        Body: imageBuffer,
                        ContentType: 'image/jpeg'
                    }
                });
                const uploadResult = await upload.done();
                if (!uploadResult || !uploadResult.Key) {
                    errors.push(`Failed to upload image ${i + 1} to S3`);
                    continue;
                }
                const s3Url = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
                s3Urls.push(s3Url);
                console.log(`✅ S3 UPLOAD: Image ${i + 1} uploaded successfully`);
            }
            catch (error) {
                console.error(`❌ S3 UPLOAD: Failed to upload image ${i + 1}:`, error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                errors.push(`Failed to upload image ${i + 1}: ${errorMessage}`);
            }
        }
        if (s3Urls.length < 10) {
            errors.push(`❌ CRITICAL: Only ${s3Urls.length} images uploaded to S3. Need minimum 10.`);
            console.log(`❌ S3 UPLOAD FAILED: Insufficient uploads (${s3Urls.length}/10 minimum)`);
            return { success: false, errors, s3Urls };
        }
        const success = s3Urls.length >= 10 && errors.length === 0;
        console.log(`✅ S3 GATE 2 PASSED: ${s3Urls.length} images uploaded, ${errors.length} errors`);
        return { success, errors, s3Urls };
    }
    static async createTrainingZip(userId, validImages, s3Urls) {
        console.log(`📦 ZIP CREATION: Starting for user ${userId}`);
        const errors = [];
        if (!validImages || validImages.length < 10) {
            errors.push(`❌ CRITICAL: Cannot create ZIP - only ${validImages?.length || 0} images. Need minimum 10.`);
            console.log(`❌ ZIP CREATION BLOCKED: Insufficient images (${validImages?.length || 0}/10 minimum)`);
            return { success: false, errors, zipUrl: null };
        }
        console.log(`🛡️ ZIP GATE 3 PASSED: ${validImages.length} images available (meets minimum 10)`);
        const tempDir = path.join(process.cwd(), 'temp_training');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const zipPath = path.join(tempDir, `training_${userId}_${Date.now()}.zip`);
        try {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            for (let i = 0; i < validImages.length; i++) {
                try {
                    const imageData = validImages[i];
                    if (!imageData) {
                        throw new Error(`Missing image data for image ${i + 1}`);
                    }
                    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    archive.append(imageBuffer, { name: `image_${i + 1}.jpg` });
                    console.log(`✅ ZIP: Added image ${i + 1} to ZIP (${imageBuffer.length} bytes)`);
                }
                catch (error) {
                    console.error(`❌ ZIP: Failed to add image ${i + 1}:`, error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    errors.push(`Failed to add image ${i + 1} to ZIP: ${errorMessage}`);
                }
            }
            await archive.finalize();
            await new Promise((resolve, reject) => {
                output.on('close', () => resolve());
                output.on('error', reject);
            });
            const zipStats = fs.statSync(zipPath);
            const minZipSize = 50 * 1024;
            if (zipStats.size < minZipSize) {
                errors.push(`❌ CRITICAL: ZIP file too small (${zipStats.size} bytes). Expected at least ${minZipSize} bytes for 10+ images.`);
                console.log(`❌ ZIP VALIDATION FAILED: File too small (${zipStats.size}/${minZipSize} bytes minimum)`);
                return { success: false, errors, zipUrl: null };
            }
            console.log(`🛡️ ZIP GATE 4 PASSED: ZIP file ${zipStats.size} bytes (meets minimum ${minZipSize})`);
            let actualFileCount = 0;
            for (let i = 0; i < validImages.length; i++) {
                if (!errors.some(e => e.includes(`image ${i + 1}`))) {
                    actualFileCount++;
                }
            }
            if (actualFileCount < 10) {
                errors.push(`❌ CRITICAL: Only ${actualFileCount} files successfully added to ZIP. Need minimum 10.`);
                console.log(`❌ ZIP FILE COUNT FAILED: Only ${actualFileCount}/10 minimum files in ZIP`);
                return { success: false, errors, zipUrl: null };
            }
            console.log(`🛡️ ZIP GATE 5 PASSED: ${actualFileCount} files in ZIP (meets minimum 10)`);
            if (zipStats.size < 1024) {
                errors.push('ZIP file creation failed - file too small');
                return { success: false, errors, zipUrl: null };
            }
            const zipBuffer = fs.readFileSync(zipPath);
            const s3Key = `training_${userId}_${Date.now()}.zip`;
            const upload = new Upload({
                client: this.s3,
                params: {
                    Bucket: 'sselfie-training-zips',
                    Key: s3Key,
                    Body: zipBuffer,
                    ContentType: 'application/zip'
                }
            });
            const uploadResult = await upload.done();
            if (!uploadResult || !uploadResult.Key) {
                errors.push('Failed to upload ZIP file to S3');
                return { success: false, errors, zipUrl: null };
            }
            const s3ZipUrl = `https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/${s3Key}`;
            console.log(`✅ ZIP CREATION: Created ${zipStats.size} bytes and uploaded to S3: ${s3ZipUrl}`);
            try {
                fs.unlinkSync(zipPath);
            }
            catch (cleanupError) {
                console.warn(`⚠️ ZIP CLEANUP: Could not delete local file ${zipPath}`);
            }
            return { success: true, errors: [], zipUrl: s3ZipUrl };
        }
        catch (error) {
            console.error(`❌ ZIP CREATION: Failed for user ${userId}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`ZIP creation failed: ${errorMessage}`);
            return { success: false, errors, zipUrl: null };
        }
    }
    static async startReplicateTraining(userId, zipUrl, triggerWord) {
        console.log(`🚀 REPLICATE TRAINING: Starting for user ${userId}`);
        const errors = [];
        const timestamp = Date.now();
        const modelName = `${userId}-selfie-lora-${timestamp}`;
        try {
            const createModelResponse = await fetch('https://api.replicate.com/v1/models', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    owner: "sandrasocial",
                    name: modelName,
                    description: `SSELFIE AI model for user ${userId}`,
                    visibility: "private",
                    hardware: "gpu-t4"
                })
            });
            if (!createModelResponse.ok) {
                if (createModelResponse.status === 422 || createModelResponse.status === 409) {
                    console.log(`⚠️ Model ${modelName} already exists (status ${createModelResponse.status}) - will use existing model for training`);
                }
                else {
                    const errorData = await createModelResponse.json();
                    console.error(`❌ Model creation failed:`, errorData);
                    errors.push(`Failed to create model: ${JSON.stringify(errorData)}`);
                    return { success: false, errors, trainingId: null, modelName: null };
                }
            }
            else {
                console.log(`✅ Model ${modelName} created successfully`);
            }
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
                    },
                    destination: `sandrasocial/${modelName}`
                })
            });
            if (!trainingResponse.ok) {
                const errorText = await trainingResponse.text();
                console.error(`❌ REPLICATE API ERROR: Status ${trainingResponse.status}, Response: ${errorText}`);
                errors.push(`Replicate training failed (${trainingResponse.status}): ${errorText}`);
                return { success: false, errors, trainingId: null, modelName: null };
            }
            const trainingData = await trainingResponse.json();
            console.log(`✅ REPLICATE TRAINING: Started successfully with ID ${trainingData.id}`);
            return { success: true, errors: [], trainingId: trainingData.id, modelName: modelName };
        }
        catch (error) {
            console.error(`❌ REPLICATE TRAINING: Failed for user ${userId}:`, error);
            console.error(`❌ REPLICATE API TOKEN:`, process.env['REPLICATE_API_TOKEN'] ? 'Present' : 'MISSING');
            errors.push(`Training start failed: ${error.message || error}`);
            return { success: false, errors, trainingId: null, modelName: null };
        }
    }
    static async updateDatabaseWithTraining(userId, trainingId, triggerWord, modelName) {
        console.log(`💾 DATABASE UPDATE: Storing training for user ${userId}`);
        const errors = [];
        try {
            let existingModel = await storage.getUserModelByUserId(userId);
            if (!existingModel) {
                await storage.createUserModel({
                    userId: userId,
                    replicateModelId: trainingId,
                    modelName: modelName,
                    triggerWord: triggerWord,
                    trainingStatus: 'training',
                    trainingProgress: 0,
                    startedAt: new Date()
                });
            }
            else {
                await storage.updateUserModel(userId, {
                    replicateModelId: trainingId,
                    modelName: modelName,
                    triggerWord: triggerWord,
                    trainingStatus: 'training',
                    trainingProgress: 0,
                    startedAt: new Date()
                });
            }
            const updatedModel = await storage.getUserModelByUserId(userId);
            if (!updatedModel || updatedModel.replicateModelId !== trainingId) {
                errors.push('Database update verification failed');
                return { success: false, errors };
            }
            console.log(`✅ DATABASE UPDATE: Training stored successfully for user ${userId}`);
            return { success: true, errors: [] };
        }
        catch (error) {
            console.error(`❌ DATABASE UPDATE: Failed for user ${userId}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Database update failed: ${errorMessage}`);
            return { success: false, errors };
        }
    }
    static async completeBulletproofUpload(userId, imageFiles) {
        console.log(`🛡️ BULLETPROOF UPLOAD: Starting complete workflow for user ${userId}`);
        const allErrors = [];
        let trainingId = null;
        const triggerWord = `user${userId}`;
        const validation = await this.validateUploadedImages(userId, imageFiles);
        if (!validation.success) {
            allErrors.push(...validation.errors);
            return { success: false, errors: allErrors, trainingId: null, requiresRestart: true };
        }
        const s3Upload = await this.uploadImagesToS3(userId, validation.validImages);
        if (!s3Upload.success) {
            allErrors.push(...s3Upload.errors);
            return { success: false, errors: allErrors, trainingId: null, requiresRestart: true };
        }
        const zipCreation = await this.createTrainingZip(userId, validation.validImages, s3Upload.s3Urls);
        if (!zipCreation.success || !zipCreation.zipUrl) {
            allErrors.push(...zipCreation.errors);
            return { success: false, errors: allErrors, trainingId: null, requiresRestart: true };
        }
        const trainingStart = await this.startReplicateTraining(userId, zipCreation.zipUrl, triggerWord);
        if (!trainingStart.success || !trainingStart.trainingId) {
            allErrors.push(...trainingStart.errors);
            return { success: false, errors: allErrors, trainingId: null, requiresRestart: true };
        }
        const dbUpdate = await this.updateDatabaseWithTraining(userId, trainingStart.trainingId, triggerWord, trainingStart.modelName);
        setTimeout(async () => {
            try {
                const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
                console.log(`🔍 SCHEDULED CHECK: Checking training ${trainingStart.trainingId} for user ${userId}`);
                await TrainingCompletionMonitor.checkAndUpdateTraining(trainingStart.trainingId, userId);
            }
            catch (error) {
                console.error(`❌ SCHEDULED CHECK FAILED for training ${trainingStart.trainingId}:`, error);
            }
        }, 2 * 60 * 1000);
        if (!dbUpdate.success) {
            allErrors.push(...dbUpdate.errors);
            return { success: false, errors: allErrors, trainingId: null, requiresRestart: true };
        }
        console.log(`✅ BULLETPROOF UPLOAD: Complete success for user ${userId}`);
        return {
            success: true,
            errors: [],
            trainingId: trainingStart.trainingId,
            requiresRestart: false
        };
    }
}
//# sourceMappingURL=bulletproof-upload-service.js.map