/**
 * Replicate API Service
 * Handles all Replicate API interactions for training and generation
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';

export interface ReplicateTrainingConfig {
  trainingData: string; // S3 URL to training images zip
  steps: number;
  learningRate: number;
  batchSize: number;
  triggerWord: string;
  resolution: string;
  autocaption?: boolean;
}

export interface ReplicateGenerationConfig {
  modelVersionId: string;
  prompt: string;
  numOutputs: number;
  aspectRatio: string;
  outputFormat: string;
  outputQuality: number;
  guidanceScale: number;
  numInferenceSteps: number;
  seed?: number;
}

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[] | string;
  error?: string;
  progress?: number;
  urls?: {
    get: string;
    cancel: string;
  };
}

/**
 * Service for all Replicate API operations
 */
export class ReplicateService {
  private db: IStorage;
  private apiToken: string;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    this.apiToken = process.env['REPLICATE_API_TOKEN'] || '';
    if (!this.apiToken) {
      console.error('❌ REPLICATE: API token not configured');
      throw new Error('Replicate API token is required');
    }
    
    console.log('✅ REPLICATE: Service initialized with API access');
  }

  /**
   * Start LoRA model training
   */
  async startTraining(config: ReplicateTrainingConfig): Promise<string> {
    try {
      console.log('🚀 REPLICATE: Starting LoRA training with config:', {
        steps: config.steps,
        learningRate: config.learningRate,
        batchSize: config.batchSize,
        triggerWord: config.triggerWord
      });

      const trainingPayload = {
        version: 'ostris/flux-dev-lora-trainer:e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497',
        input: {
          input_images: config.trainingData,
          steps: config.steps,
          lora_rank: 16,
          optimizer: 'adamw8bit',
          batch_size: config.batchSize,
          resolution: config.resolution,
          autocaption: config.autocaption || true,
          trigger_word: config.triggerWord,
          learning_rate: config.learningRate,
          wandb_project: 'flux_train_replicate',
          wandb_save_interval: 100,
          caption_dropout_rate: 0.05,
          cache_latents_to_disk: false,
          wandb_sample_interval: 100
        }
      };

      const response = await this.makeApiRequest('/predictions', {
        method: 'POST',
        body: JSON.stringify(trainingPayload)
      });

      if (!response.id) {
        throw new Error('No training ID returned from Replicate');
      }

      console.log(`✅ REPLICATE: Training started with ID ${response.id}`);
      return response.id;

    } catch (error) {
      console.error('❌ REPLICATE: Training start failed:', error);
      throw error;
    }
  }

  /**
   * Check training status
   */
  async checkTrainingStatus(trainingId: string): Promise<ReplicatePrediction> {
    try {
      const response = await this.makeApiRequest(`/predictions/${trainingId}`);
      
      return {
        id: response.id,
        status: response.status,
        output: response.output,
        error: response.error,
        progress: response.progress,
        urls: response.urls
      };
      
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to check training status for ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Start image generation
   */
  async startGeneration(config: ReplicateGenerationConfig): Promise<string> {
    try {
      console.log('🎨 REPLICATE: Starting image generation');

      const generationPayload = {
        version: config.modelVersionId,
        input: {
          prompt: config.prompt,
          num_outputs: config.numOutputs,
          aspect_ratio: config.aspectRatio,
          output_format: config.outputFormat,
          output_quality: config.outputQuality,
          guidance_scale: config.guidanceScale,
          num_inference_steps: config.numInferenceSteps,
          ...(config.seed && { seed: config.seed })
        }
      };

      const response = await this.makeApiRequest('/predictions', {
        method: 'POST',
        body: JSON.stringify(generationPayload)
      });

      if (!response.id) {
        throw new Error('No generation ID returned from Replicate');
      }

      console.log(`✅ REPLICATE: Generation started with ID ${response.id}`);
      return response.id;

    } catch (error) {
      console.error('❌ REPLICATE: Generation start failed:', error);
      throw error;
    }
  }

  /**
   * Check generation status
   */
  async checkGenerationStatus(generationId: string): Promise<{
    status: string;
    imageUrls?: string[];
    progress?: number;
    error?: string;
  }> {
    try {
      const response = await this.makeApiRequest(`/predictions/${generationId}`);
      
      return {
        status: response.status,
        imageUrls: response.status === 'succeeded' && Array.isArray(response.output) 
          ? response.output 
          : undefined,
        progress: response.progress,
        error: response.error
      };
      
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to check generation status for ${generationId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running prediction
   */
  async cancelPrediction(predictionId: string): Promise<boolean> {
    try {
      await this.makeApiRequest(`/predictions/${predictionId}/cancel`, {
        method: 'POST'
      });
      
      console.log(`✅ REPLICATE: Canceled prediction ${predictionId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to cancel prediction ${predictionId}:`, error);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModel(modelId: string): Promise<any> {
    try {
      return await this.makeApiRequest(`/models/${modelId}`);
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to get model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Get model version information
   */
  async getModelVersion(modelId: string, versionId: string): Promise<any> {
    try {
      return await this.makeApiRequest(`/models/${modelId}/versions/${versionId}`);
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to get model version ${modelId}/${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Validate model version exists
   */
  async validateModelVersion(modelId: string, versionId: string): Promise<boolean> {
    try {
      const version = await this.getModelVersion(modelId, versionId);
      return !!version && version.id === versionId;
    } catch (error) {
      console.warn(`⚠️ REPLICATE: Model version validation failed for ${modelId}/${versionId}`);
      return false;
    }
  }

  /**
   * Make authenticated API request to Replicate
   */
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    apiAccess: boolean;
    error?: string;
  }> {
    try {
      // Test API access by making a simple request
      await this.makeApiRequest('/predictions?limit=1');
      
      return {
        status: 'healthy',
        apiAccess: true
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        apiAccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();