// Manual LoRA weights extraction utility
// This script helps extract LoRA weights from Replicate models when automatic extraction fails

import { db } from './db.js';
import { userModels } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface ReplicateModel {
  owner: string;
  name: string;
  description: string;
  visibility: string;
  github_url: string;
  paper_url: string;
  license_url: string;
  cover_image_url: string;
  default_example: any;
  latest_version: {
    id: string;
    created_at: string;
    cog_version: string;
    openapi_schema: any;
  };
}

interface ReplicateTraining {
  id: string;
  version: string;
  status: string;
  input: any;
  output: {
    model?: string;
    weights?: string;
    version?: string;
  };
  error: string | null;
  logs: string;
  metrics: any;
  webhooks: any[];
  urls: {
    get: string;
    cancel: string;
  };
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export class ManualLoRAExtractor {
  private replicateToken: string;

  constructor() {
    this.replicateToken = process.env.REPLICATE_API_TOKEN!;
    if (!this.replicateToken) {
      throw new Error('REPLICATE_API_TOKEN is required');
    }
  }

  async extractWeightsForUser(userId: string): Promise<string | null> {
    console.log(`🔧 MANUAL EXTRACTION: Starting for user ${userId}`);
    
    // Get user model from database
    const [userModel] = await db
      .select()
      .from(userModels)
      .where(eq(userModels.userId, userId))
      .limit(1);

    if (!userModel) {
      console.error('❌ No user model found');
      return null;
    }

    console.log(`🔍 User model:`, {
      id: userModel.id,
      modelId: userModel.replicateModelId,
      versionId: userModel.replicateVersionId,
      status: userModel.trainingStatus,
      currentWeights: userModel.loraWeightsUrl
    });

    // Try different extraction methods
    const methods = [
      () => this.extractFromModelVersions(userModel.replicateModelId!),
      () => this.extractFromTrainings(userModel.replicateModelId!),
      () => this.extractFromAllTrainings(userModel.replicateModelId!),
      () => this.extractFromSpecificTraining(userModel.replicateVersionId!)
    ];

    for (let i = 0; i < methods.length; i++) {
      console.log(`🔧 Trying extraction method ${i + 1}...`);
      try {
        const weights = await methods[i]();
        if (weights) {
          console.log(`✅ SUCCESS: Found weights via method ${i + 1}: ${weights}`);
          
          // Update database with found weights
          await db
            .update(userModels)
            .set({ loraWeightsUrl: weights })
            .where(eq(userModels.id, userModel.id));
          
          console.log(`✅ Updated database with LoRA weights`);
          return weights;
        }
      } catch (error) {
        console.error(`❌ Method ${i + 1} failed:`, error);
      }
    }

    console.error('❌ All extraction methods failed');
    return null;
  }

  private async extractFromModelVersions(modelId: string): Promise<string | null> {
    console.log(`🔍 Method 1: Checking model versions for ${modelId}`);
    
    const response = await fetch(`https://api.replicate.com/v1/models/${modelId}/versions`, {
      headers: {
        'Authorization': `Token ${this.replicateToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Model versions API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🔍 Found ${data.results?.length || 0} versions`);
    
    if (data.results && data.results.length > 0) {
      const latestVersion = data.results[0]; // Versions are usually sorted by creation date
      console.log(`🔍 Latest version:`, JSON.stringify(latestVersion, null, 2));
      
      // Look for weights in various locations
      if (latestVersion.files?.weights) {
        return latestVersion.files.weights;
      }
      
      // Check all files for safetensors
      if (latestVersion.files) {
        for (const [key, value] of Object.entries(latestVersion.files)) {
          if (typeof value === 'string' && value.includes('.safetensors')) {
            console.log(`🔍 Found safetensors file: ${key} = ${value}`);
            return value;
          }
        }
      }
    }

    return null;
  }

  private async extractFromTrainings(modelId: string): Promise<string | null> {
    console.log(`🔍 Method 2: Searching trainings by model name`);
    
    const response = await fetch(`https://api.replicate.com/v1/trainings`, {
      headers: {
        'Authorization': `Token ${this.replicateToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Trainings API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🔍 Found ${data.results?.length || 0} trainings`);
    
    if (data.results) {
      const modelName = modelId.split('/')[1];
      
      for (const training of data.results) {
        if (training.output?.model && training.output.model.includes(modelName)) {
          console.log(`🔍 Found matching training:`, JSON.stringify(training, null, 2));
          
          if (training.output.weights) {
            return training.output.weights;
          }
        }
      }
    }

    return null;
  }

  private async extractFromAllTrainings(modelId: string): Promise<string | null> {
    console.log(`🔍 Method 3: Checking all recent trainings`);
    
    const response = await fetch(`https://api.replicate.com/v1/trainings?limit=100`, {
      headers: {
        'Authorization': `Token ${this.replicateToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Trainings API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results) {
      const modelName = modelId.split('/')[1];
      const userIdFromModel = modelId.split('/')[0].replace('sandrasocial', '').replace('/', '');
      
      console.log(`🔍 Looking for model name: ${modelName} or user ID: ${userIdFromModel}`);
      
      for (const training of data.results) {
        // Check various ways the training might be connected to our model
        const matchesModel = training.output?.model && (
          training.output.model.includes(modelName) ||
          training.output.model.includes(userIdFromModel)
        );
        
        const matchesInput = training.input && (
          JSON.stringify(training.input).includes(modelName) ||
          JSON.stringify(training.input).includes(userIdFromModel)
        );

        if (matchesModel || matchesInput) {
          console.log(`🔍 Potential match found:`, JSON.stringify(training, null, 2));
          
          if (training.output?.weights) {
            return training.output.weights;
          }
        }
      }
    }

    return null;
  }

  private async extractFromSpecificTraining(versionId: string): Promise<string | null> {
    console.log(`🔍 Method 4: Trying version ID as training ID: ${versionId}`);
    
    const response = await fetch(`https://api.replicate.com/v1/trainings/${versionId}`, {
      headers: {
        'Authorization': `Token ${this.replicateToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`Training by version ID failed: ${response.status}`);
      return null;
    }

    const training = await response.json();
    console.log(`🔍 Training data:`, JSON.stringify(training, null, 2));
    
    return training.output?.weights || null;
  }

  // Method to manually set weights URL if found elsewhere
  async setWeightsManually(userId: string, weightsUrl: string): Promise<void> {
    const [userModel] = await db
      .select()
      .from(userModels)
      .where(eq(userModels.userId, userId))
      .limit(1);

    if (!userModel) {
      throw new Error('User model not found');
    }

    await db
      .update(userModels)
      .set({ loraWeightsUrl: weightsUrl })
      .where(eq(userModels.id, userModel.id));

    console.log(`✅ Manually set LoRA weights for user ${userId}: ${weightsUrl}`);
  }
}

// Export for use in routes
export const manualExtractor = new ManualLoRAExtractor();