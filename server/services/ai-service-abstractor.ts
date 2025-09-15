/**
 * AI Service Abstractor
 * Unified interface for all AI services (Claude, Google GenAI, Replicate)
 */

import { Logger } from '../utils/logger';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    model: string;
    timestamp: string;
    service: string;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  userId: string;
  model?: string;
  numOutputs?: number;
  aspectRatio?: string;
  outputFormat?: string;
  outputQuality?: number;
  seed?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  images?: string[];
  predictionId?: string;
  error?: string;
  metadata?: {
    model: string;
    timestamp: string;
    service: string;
  };
}

export abstract class AIService {
  protected logger: Logger;
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig, serviceName: string) {
    this.config = config;
    this.logger = new Logger(`AIService-${serviceName}`);
  }

  abstract generateText(prompt: string, systemPrompt?: string): Promise<AIResponse>;
  abstract generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  abstract isAvailable(): boolean;
}

export class ClaudeService extends AIService {
  constructor(config: AIServiceConfig) {
    super(config, 'Claude');
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: this.config.maxTokens || 4000,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        metadata: {
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          timestamp: new Date().toISOString(),
          service: 'Claude'
        }
      };
    } catch (error) {
      this.logger.error('Claude API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return {
      success: false,
      error: 'Claude does not support image generation'
    };
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}

export class GoogleGenAIService extends AIService {
  constructor(config: AIServiceConfig) {
    super(config, 'GoogleGenAI');
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: this.config.apiKey });
      const model = genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-pro',
        generationConfig: {
          maxOutputTokens: this.config.maxTokens || 4000,
          temperature: this.config.temperature || 0.7
        }
      });

      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text,
        metadata: {
          model: this.config.model || 'gemini-pro',
          timestamp: new Date().toISOString(),
          service: 'GoogleGenAI'
        }
      };
    } catch (error) {
      this.logger.error('Google GenAI error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: this.config.apiKey });
      const model = genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-pro-vision'
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;
      const text = response.text();

      // For now, return the text as a single "image" - in production, this would generate actual images
      return {
        success: true,
        images: [text],
        metadata: {
          model: this.config.model || 'gemini-pro-vision',
          timestamp: new Date().toISOString(),
          service: 'GoogleGenAI'
        }
      };
    } catch (error) {
      this.logger.error('Google GenAI image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}

export class ReplicateService extends AIService {
  constructor(config: AIServiceConfig) {
    super(config, 'Replicate');
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    return {
      success: false,
      error: 'Replicate does not support text generation'
    };
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: request.model || 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46e38a046e63a4b056dfd11d396f43f59d1c0b5b94d9',
          input: {
            prompt: request.prompt,
            num_outputs: request.numOutputs || 2,
            aspect_ratio: request.aspectRatio || '4:5',
            output_format: request.outputFormat || 'png',
            output_quality: request.outputQuality || 95,
            seed: request.seed || Math.floor(Math.random() * 1000000)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        predictionId: data.id,
        metadata: {
          model: request.model || 'stability-ai/stable-diffusion',
          timestamp: new Date().toISOString(),
          service: 'Replicate'
        }
      };
    } catch (error) {
      this.logger.error('Replicate API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}

export class UnifiedAIService {
  private claude: ClaudeService;
  private googleGenAI: GoogleGenAIService;
  private replicate: ReplicateService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('UnifiedAIService');
    
    this.claude = new ClaudeService({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000
    });

    this.googleGenAI = new GoogleGenAIService({
      apiKey: process.env.GOOGLE_API_KEY || '',
      model: 'gemini-pro',
      maxTokens: 4000
    });

    this.replicate = new ReplicateService({
      apiKey: process.env.REPLICATE_API_TOKEN || ''
    });
  }

  async generateText(prompt: string, systemPrompt?: string, preferredService?: 'claude' | 'google'): Promise<AIResponse> {
    // Try preferred service first, then fallback to available services
    const services = preferredService === 'google' 
      ? [this.googleGenAI, this.claude]
      : [this.claude, this.googleGenAI];

    for (const service of services) {
      if (service.isAvailable()) {
        this.logger.info(`Using ${service.constructor.name} for text generation`);
        return await service.generateText(prompt, systemPrompt);
      }
    }

    return {
      success: false,
      error: 'No AI services available for text generation'
    };
  }

  async generateImages(request: ImageGenerationRequest, preferredService?: 'replicate' | 'google'): Promise<ImageGenerationResponse> {
    // Try preferred service first, then fallback to available services
    const services = preferredService === 'google'
      ? [this.googleGenAI, this.replicate]
      : [this.replicate, this.googleGenAI];

    for (const service of services) {
      if (service.isAvailable()) {
        this.logger.info(`Using ${service.constructor.name} for image generation`);
        return await service.generateImages(request);
      }
    }

    return {
      success: false,
      error: 'No AI services available for image generation'
    };
  }

  getServiceStatus(): {
    claude: boolean;
    googleGenAI: boolean;
    replicate: boolean;
  } {
    return {
      claude: this.claude.isAvailable(),
      googleGenAI: this.googleGenAI.isAvailable(),
      replicate: this.replicate.isAvailable()
    };
  }
}

// Export singleton instance
export const unifiedAIService = new UnifiedAIService();
