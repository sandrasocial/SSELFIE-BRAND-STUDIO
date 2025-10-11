/**
 * Enhanced Replicate Client Service
 * Uses official Replicate Node.js client with webhooks and best practices
 */

import Replicate, { type Prediction } from 'replicate';
import { getDatabase, type IStorage } from '../../shared/database-provider.js';

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
  webhookUrl?: string;
  webhookEvents?: ('start' | 'output' | 'logs' | 'completed')[];
  signal?: AbortSignal;
}

export interface ReplicateTrainingConfig {
  trainingData: string;
  steps: number;
  learningRate: number;
  batchSize: number;
  triggerWord: string;
  resolution: string;
  autocaption?: boolean;
  webhookUrl?: string;
  webhookEvents?: ('start' | 'output' | 'logs' | 'completed')[];
}

/**
 * Enhanced Replicate service using official client
 */
export class ReplicateClient {
  private replicate: Replicate;
  private db: IStorage;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
      // Optimize for serverless environments
      fetch: (url, options) => {
        return fetch(url, { 
          ...options, 
          cache: "no-store" // Prevent Next.js caching issues
        });
      }
    });

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN environment variable is required');
    }
  }

  /**
   * Start image generation using official Replicate client
   */
  async startGeneration(config: ReplicateGenerationConfig & {
    loraWeights?: string;
    loraScale?: number;
    megapixels?: string;
  }): Promise<{
    predictionId: string;
    prediction: Prediction;
  }> {
    try {
      console.log('🎨 REPLICATE: Starting generation with official client');

      // Build input with all parameters
      const input: any = {
        prompt: config.prompt,
        num_outputs: config.numOutputs,
        aspect_ratio: config.aspectRatio,
        output_format: config.outputFormat,
        output_quality: config.outputQuality,
        guidance_scale: config.guidanceScale,
        num_inference_steps: config.numInferenceSteps,
        ...(config.seed && { seed: config.seed }),
        ...(config.megapixels && { megapixels: config.megapixels }),
        ...(config.loraWeights && { 
          lora_weights: config.loraWeights,
          lora_scale: config.loraScale || 0.8
        })
      };

      const prediction = await this.replicate.predictions.create({
        version: config.modelVersionId,
        input,
        ...(config.webhookUrl && {
          webhook: config.webhookUrl,
          webhook_events_filter: config.webhookEvents || ['completed']
        })
      });

      console.log(`✅ REPLICATE: Generation started with ID ${prediction.id}`);
      
      return {
        predictionId: prediction.id,
        prediction
      };

    } catch (error) {
      console.error('❌ REPLICATE: Generation start failed:', error);
      throw error;
    }
  }

  /**
   * Wait for prediction to complete using official wait method
   */
  async waitForPrediction(
    predictionId: string, 
    options?: {
      interval?: number;
      onProgress?: (prediction: Prediction) => void;
    }
  ): Promise<Prediction> {
    try {
      console.log(`⏳ REPLICATE: Waiting for prediction ${predictionId}`);
      
      const prediction = await this.replicate.wait(
        { id: predictionId } as Prediction,
        { interval: options?.interval || 500 },
        options?.onProgress ? async (pred) => {
          options.onProgress!(pred);
          return false; // Don't stop waiting
        } : undefined
      );

      console.log(`✅ REPLICATE: Prediction ${predictionId} completed with status: ${prediction.status}`);
      return prediction;

    } catch (error) {
      console.error(`❌ REPLICATE: Wait failed for prediction ${predictionId}:`, error);
      throw error;
    }
  }

  /**
   * Get prediction status
   */
  async getPredictionStatus(predictionId: string): Promise<Prediction> {
    try {
      const prediction = await this.replicate.predictions.get(predictionId);
      return prediction;
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to get prediction status for ${predictionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running prediction
   */
  async cancelPrediction(predictionId: string): Promise<Prediction> {
    try {
      console.log(`🛑 REPLICATE: Canceling prediction ${predictionId}`);
      const prediction = await this.replicate.predictions.cancel(predictionId);
      console.log(`✅ REPLICATE: Prediction ${predictionId} canceled`);
      return prediction;
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to cancel prediction ${predictionId}:`, error);
      throw error;
    }
  }

  /**
   * Start model training with official client
   */
  async startTraining(config: ReplicateTrainingConfig): Promise<{
    trainingId: string;
    training: any;
  }> {
    try {
      console.log('🎯 REPLICATE: Starting training with official client');

      // Using the ostris/flux-dev-lora-trainer model
      const training = await this.replicate.trainings.create(
        'ostris',
        'flux-dev-lora-trainer',
        '72fb827efb5c082f6efe1a70b53a1376d322e7c56b31f4671f5ed64cf815e46d',
        {
          destination: `sselfie-studio/user-model-${Date.now()}`,
          input: {
            steps: config.steps,
            lora_rank: 16,
            optimizer: "adamw8bit",
            batch_size: config.batchSize,
            resolution: config.resolution,
            autocaption: config.autocaption || true,
            input_images: config.trainingData,
            trigger_word: config.triggerWord,
            learning_rate: config.learningRate,
            wandb_project: "flux_train_replicate",
            wandb_save_interval: 100,
            caption_dropout_rate: 0.05,
            cache_latents_to_disk: false,
            wandb_sample_interval: 100
          },
          ...(config.webhookUrl && {
            webhook: config.webhookUrl,
            webhook_events_filter: config.webhookEvents || ['completed']
          })
        }
      );

      console.log(`✅ REPLICATE: Training started with ID ${training.id}`);
      
      return {
        trainingId: training.id,
        training
      };

    } catch (error) {
      console.error('❌ REPLICATE: Training start failed:', error);
      throw error;
    }
  }

  /**
   * Get training status
   */
  async getTrainingStatus(trainingId: string): Promise<any> {
    try {
      const training = await this.replicate.trainings.get(trainingId);
      return training;
    } catch (error) {
      console.error(`❌ REPLICATE: Failed to get training status for ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Wait for training to complete
   */
  async waitForTraining(
    trainingId: string,
    options?: {
      onProgress?: (training: any) => void;
    }
  ): Promise<any> {
    try {
      console.log(`⏳ REPLICATE: Waiting for training ${trainingId}`);
      
      // Poll training status until completion
      let training = await this.getTrainingStatus(trainingId);
      
      while (training.status === 'starting' || training.status === 'processing') {
        if (options?.onProgress) {
          options.onProgress(training);
        }
        
        // Wait 30 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 30000));
        training = await this.getTrainingStatus(trainingId);
      }

      console.log(`✅ REPLICATE: Training ${trainingId} completed with status: ${training.status}`);
      return training;

    } catch (error) {
      console.error(`❌ REPLICATE: Training wait failed for ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Extract FileOutput URLs safely
   */
  extractImageUrls(output: any): string[] {
    if (!output) return [];
    
    if (Array.isArray(output)) {
      return output.map(item => {
        // Handle FileOutput objects
        if (item && typeof item.url === 'function') {
          return item.url();
        }
        // Handle direct URLs
        if (typeof item === 'string') {
          return item;
        }
        return '';
      }).filter(Boolean);
    }
    
    // Single output
    if (output && typeof output.url === 'function') {
      return [output.url()];
    }
    
    if (typeof output === 'string') {
      return [output];
    }
    
    return [];
  }

  /**
   * Validate webhook signature (when implementing webhooks)
   */
  static async validateWebhook(
    request: Request, 
    secret: string
  ): Promise<boolean> {
    try {
      const { validateWebhook } = await import('replicate');
      return await validateWebhook(request.clone(), secret);
    } catch (error) {
      console.error('❌ REPLICATE: Webhook validation failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const replicateClient = new ReplicateClient();