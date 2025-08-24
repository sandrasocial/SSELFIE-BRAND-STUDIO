/**
 * MANUAL LORA WEIGHTS EXTRACTION FIX
 * For user 42585527 whose training completed but LoRA weights weren't extracted
 */

import { storage } from './storage';

export class ManualLoraFix {
  /**
   * Extract LoRA weights for a specific user whose training completed but weights missing
   */
  static async extractAndUpdateLoraWeights(userId: string): Promise<boolean> {
    try {
      console.log(`🔧 MANUAL LORA FIX: Starting for user ${userId}`);
      
      const userModel = await storage.getUserModelByUserId(userId);
      if (!userModel) {
        console.log(`❌ No user model found for ${userId}`);
        return false;
      }
      
      if (userModel.trainingStatus !== 'completed') {
        console.log(`❌ Training not completed for ${userId}: ${userModel.trainingStatus}`);
        return false;
      }
      
      if (userModel.loraWeightsUrl) {
        console.log(`✅ LoRA weights already exist for ${userId}: ${userModel.loraWeightsUrl}`);
        return true;
      }
      
      console.log(`🔍 Extracting LoRA weights from training: ${userModel.replicateModelId}`);
      
      // Try multiple extraction approaches
      let loraWeightsUrl = null;
      
      // Approach 1: Check training output directly
      if (userModel.replicateModelId) {
        try {
          const trainingResponse = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (trainingResponse.ok) {
            const trainingData = await trainingResponse.json();
            console.log(`📊 Training status: ${trainingData.status}`);
            
            // Try different weight extraction paths
            if (trainingData.output?.weights) {
              loraWeightsUrl = trainingData.output.weights;
              console.log(`✅ Found weights at output.weights: ${loraWeightsUrl}`);
            } else if (trainingData.urls?.get) {
              loraWeightsUrl = trainingData.urls.get;
              console.log(`✅ Found weights at urls.get: ${loraWeightsUrl}`);
            } else if (trainingData.output?.model) {
              loraWeightsUrl = trainingData.output.model;
              console.log(`✅ Found weights at output.model: ${loraWeightsUrl}`);
            }
            
            // Log the entire output structure for debugging
            console.log(`📋 Training output structure:`, JSON.stringify(trainingData.output, null, 2));
          }
        } catch (error) {
          console.log(`⚠️ Error fetching training data: ${error.message}`);
        }
      }
      
      // Approach 2: Check the destination model version
      if (!loraWeightsUrl && userModel.replicateVersionId) {
        try {
          const modelParts = userModel.replicateModelId?.includes('/') 
            ? userModel.replicateModelId 
            : `sandrasocial/${userId}-selfie-lora-${Date.now()}`;
            
          const versionResponse = await fetch(`https://api.replicate.com/v1/models/${modelParts}/versions/${userModel.replicateVersionId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (versionResponse.ok) {
            const versionData = await versionResponse.json();
            
            if (versionData.files?.weights) {
              loraWeightsUrl = versionData.files.weights;
              console.log(`✅ Found weights at version files.weights: ${loraWeightsUrl}`);
            } else if (versionData.urls?.get) {
              loraWeightsUrl = versionData.urls.get;
              console.log(`✅ Found weights at version urls.get: ${loraWeightsUrl}`);
            }
            
            console.log(`📋 Full version data structure:`, JSON.stringify(versionData, null, 2));
          }
        } catch (error) {
          console.log(`⚠️ Error fetching version data: ${error.message}`);
        }
      }
      
      // Update the user model with extracted weights
      if (loraWeightsUrl) {
        await storage.updateUserModel(userId, {
          loraWeightsUrl: loraWeightsUrl,
          updatedAt: new Date()
        });
        
        console.log(`✅ MANUAL FIX COMPLETE: Updated user ${userId} with LoRA weights: ${loraWeightsUrl}`);
        return true;
      } else {
        console.log(`❌ Could not extract LoRA weights for user ${userId}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Manual LoRA fix failed for user ${userId}:`, error);
      return false;
    }
  }
}