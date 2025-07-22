import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * BULLETPROOF TRAINING SERVICE - NO S3 DEPENDENCIES
 * 
 * PERMANENT SOLUTION:
 * 1. Direct ZIP creation from uploaded base64 images
 * 2. No S3 upload/download cycle that causes permission issues
 * 3. Simple, reliable training process for all users
 * 4. Eliminates AWS IAM policy conflicts
 */
export class BulletproofTrainingService {
  
  /**
   * COMPREHENSIVE TRAINING SOLUTION
   * Takes uploaded images directly to Replicate training
   * Eliminates all S3 dependencies and permission issues
   */
  static async processTrainingImages(
    userId: string, 
    uploadedImages: string[]
  ): Promise<{ success: boolean; errors: string[]; zipUrl: string | null }> {
    console.log(`🚀 BULLETPROOF TRAINING: Starting for user ${userId} with ${uploadedImages.length} images`);
    
    const errors: string[] = [];
    
    // STEP 1: Validate images
    const validation = await this.validateImages(userId, uploadedImages);
    if (!validation.success) {
      return { success: false, errors: validation.errors, zipUrl: null };
    }
    
    // STEP 2: Create ZIP directly from validated images
    const zipResult = await this.createDirectZip(userId, validation.validImages);
    if (!zipResult.success) {
      return { success: false, errors: zipResult.errors, zipUrl: null };
    }
    
    console.log(`✅ BULLETPROOF TRAINING: Successfully created training ZIP for user ${userId}`);
    return { success: true, errors: [], zipUrl: zipResult.zipUrl };
  }
  
  /**
   * STEP 1: VALIDATE UPLOADED IMAGES
   * Check file types, sizes, and minimum count
   */
  private static async validateImages(
    userId: string, 
    imageFiles: string[]
  ): Promise<{ success: boolean; errors: string[]; validImages: string[] }> {
    console.log(`🔍 VALIDATION: Starting for user ${userId}`);
    
    const errors: string[] = [];
    const validImages: string[] = [];
    
    // Check minimum count
    if (!imageFiles || imageFiles.length === 0) {
      errors.push('No images provided. Upload at least 12 high-quality selfies before training.');
      return { success: false, errors, validImages };
    }
    
    if (imageFiles.length < 12) {
      errors.push(`Only ${imageFiles.length} images provided. Minimum 12 selfies required for quality training (12-18 recommended range).`);
      return { success: false, errors, validImages };
    }
    
    console.log(`🛡️ VALIDATION: ${imageFiles.length} images provided (meets minimum 12)`);
    
    // Validate each image
    for (let i = 0; i < imageFiles.length; i++) {
      const imageData = imageFiles[i];
      
      try {
        // Validate base64 format
        if (!imageData.includes('data:image/')) {
          errors.push(`Image ${i + 1}: Invalid format. Must be a valid image file.`);
          continue;
        }
        
        // Extract and validate base64 data
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
        
        const imageBuffer = Buffer.from(paddedBase64, 'base64');
        
        // Validate image size (minimum 10KB for valid selfie)
        if (imageBuffer.length < 10240) {
          errors.push(`Image ${i + 1}: File too small. Please use higher quality photos.`);
          continue;
        }
        
        // Validate maximum size (10MB)
        if (imageBuffer.length > 10 * 1024 * 1024) {
          errors.push(`Image ${i + 1}: File too large. Maximum 10MB per image.`);
          continue;
        }
        
        validImages.push(imageData);
        
      } catch (error) {
        errors.push(`Image ${i + 1}: Corrupted or invalid image file.`);
      }
    }
    
    // Final validation after processing
    if (validImages.length < 12) {
      errors.push(`Only ${validImages.length} valid images after processing. Need minimum 12 valid high-quality images.`);
      return { success: false, errors, validImages };
    }
    
    console.log(`✅ VALIDATION: ${validImages.length} valid images ready for training`);
    return { success: true, errors: [], validImages };
  }
  
  /**
   * STEP 2: CREATE ZIP DIRECTLY FROM IMAGES
   * No S3 upload/download - direct ZIP creation
   */
  private static async createDirectZip(
    userId: string, 
    validImages: string[]
  ): Promise<{ success: boolean; errors: string[]; zipUrl: string | null }> {
    console.log(`📦 DIRECT ZIP: Creating for user ${userId} with ${validImages.length} images`);
    
    const errors: string[] = [];
    
    const tempDir = path.join(process.cwd(), 'temp_training');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const zipPath = path.join(tempDir, `training_${userId}_${Date.now()}.zip`);
    
    try {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      let addedImages = 0;
      
      // Add each image directly to ZIP from base64 data
      for (let i = 0; i < validImages.length; i++) {
        try {
          const imageData = validImages[i];
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
          const imageBuffer = Buffer.from(paddedBase64, 'base64');
          
          archive.append(imageBuffer, { name: `image_${i + 1}.jpg` });
          addedImages++;
          console.log(`✅ ZIP: Added image ${i + 1} (${imageBuffer.length} bytes)`);
          
        } catch (error) {
          console.error(`❌ ZIP: Failed to add image ${i + 1}:`, error);
          errors.push(`Failed to add image ${i + 1} to ZIP: ${error.message}`);
        }
      }
      
      await archive.finalize();
      
      // Wait for ZIP creation to complete
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });
      
      // Verify ZIP has enough content
      const zipStats = fs.statSync(zipPath);
      const minZipSize = 80 * 1024; // At least 80KB for 12+ images (updated requirement)
      
      if (zipStats.size < minZipSize) {
        errors.push(`ZIP file too small (${zipStats.size} bytes). Expected at least ${minZipSize} bytes for 12+ images.`);
        return { success: false, errors, zipUrl: null };
      }
      
      if (addedImages < 12) {
        errors.push(`Only ${addedImages} files successfully added to ZIP. Need minimum 12.`);
        return { success: false, errors, zipUrl: null };
      }
      
      // Serve ZIP from local server
      const zipUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/training-zip/${path.basename(zipPath)}`;
      
      console.log(`✅ ZIP CREATION: Created ${zipStats.size} bytes with ${addedImages} images at ${zipUrl}`);
      
      return { success: true, errors: [], zipUrl };
      
    } catch (error) {
      console.error(`❌ ZIP CREATION: Failed for user ${userId}:`, error);
      errors.push(`ZIP creation failed: ${error.message}`);
      return { success: false, errors, zipUrl: null };
    }
  }
  
  /**
   * START REPLICATE TRAINING WITH BULLETPROOF ZIP
   */
  static async startReplicateTraining(
    userId: string, 
    zipUrl: string, 
    triggerWord: string
  ): Promise<{ success: boolean; errors: string[]; trainingId: string | null }> {
    console.log(`🚀 REPLICATE TRAINING: Starting for user ${userId}`);
    
    const errors: string[] = [];
    // Create unique model name with timestamp to avoid conflicts during retraining
    const timestamp = Date.now();
    const modelName = `${userId}-selfie-lora-${timestamp}`;
    
    try {
      // Create user-specific model first (model might already exist for retraining)
      const createModelResponse = await fetch('https://api.replicate.com/v1/models', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
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
      
      // Handle model creation response
      if (createModelResponse.ok) {
        console.log(`✅ REPLICATE MODEL: Created new model ${modelName}`);
      } else if (createModelResponse.status === 422) {
        // Model already exists - this is fine for retraining
        console.log(`✅ REPLICATE MODEL: Using existing model ${modelName} (retraining)`);
      } else {
        const errorData = await createModelResponse.json();
        console.error(`❌ REPLICATE MODEL: Failed to create/access model:`, errorData);
        errors.push(`Failed to create model: ${JSON.stringify(errorData)}`);
        return { success: false, errors, trainingId: null };
      }
      
      // Start training with optimized parameters
      console.log(`🔍 REPLICATE TRAINING: About to start training with ZIP: ${zipUrl}`);
      console.log(`🔍 REPLICATE TRAINING: Model name: ${modelName}, Trigger word: ${triggerWord}`);
      
      const trainingResponse = await fetch('https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            input_images: zipUrl,
            trigger_word: triggerWord,
            steps: 1200,                    // Optimized: 1000-1500 range for proper face learning
            lora_rank: 32,                  // Optimized: 16-32 range, 32 is best for faces per research
            resolution: "1024",             // High resolution as specified
            autocaption: true,              // Enable for better captions if none provided
            optimizer: "adamw8bit",         // Memory efficient optimizer
            cache_latents_to_disk: false,   // Faster training
            caption_dropout_rate: 0.05,     // Lower dropout for better face learning
            learning_rate: 1e-4,            // Slightly higher for better convergence
            batch_size: 1,                  // Stable for portrait training
            save_every_n_epochs: 1,        // Save checkpoints
            mixed_precision: "fp16",        // Faster training with good quality
            gradient_checkpointing: true,   // Memory optimization
            network_alpha: 32,              // Match lora_rank for stability
            clip_skip: 1,                   // Standard for FLUX
            prior_loss_weight: 1.0,         // Preserve model knowledge
            v2: false,                      // Use FLUX standard
            v_parameterization: false,      // Standard parameterization
            scale_v_pred_loss_like_noise_pred: false,
            network_dropout: 0.0,           // No network dropout for portrait training
            rank_dropout: 0.0,              // No rank dropout for stability
            module_dropout: 0.0             // No module dropout for faces
          },
          destination: `sandrasocial/${modelName}`
        })
      });
      
      if (!trainingResponse.ok) {
        const errorData = await trainingResponse.json();
        console.error(`❌ REPLICATE TRAINING ERROR: Status ${trainingResponse.status}:`, errorData);
        errors.push(`Replicate training failed (${trainingResponse.status}): ${JSON.stringify(errorData)}`);
        return { success: false, errors, trainingId: null };
      }
      
      const trainingData = await trainingResponse.json();
      
      console.log(`✅ REPLICATE TRAINING: Started successfully with ID ${trainingData.id}`);
      
      return { success: true, errors: [], trainingId: trainingData.id };
      
    } catch (error) {
      console.error(`❌ REPLICATE TRAINING: Failed for user ${userId}:`, error);
      errors.push(`Training failed: ${error.message}`);
      return { success: false, errors, trainingId: null };
    }
  }
}