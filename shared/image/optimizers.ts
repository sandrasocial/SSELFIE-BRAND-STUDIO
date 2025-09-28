/**
 * Image Optimization Strategies
 * SSELFIE Platform - Smart Image Optimization
 */

import type {
  OptimizationStrategy,
  OptimizationResult,
  ProcessingPipeline,
  ImageMetadata,
  ImageProcessingOptions,
  ProcessingResult,
} from './types.js';
import { ImageProcessor } from './processor.js';
import { ImageValidator } from './validators.js';

// ============================================================================
// Optimization Strategy Manager
// ============================================================================

export class OptimizationManager {
  private static strategies: Map<string, OptimizationStrategy> = new Map();

  static {
    // Register built-in strategies
    this.registerStrategy('web-optimized', WEB_OPTIMIZED_STRATEGY);
    this.registerStrategy('high-quality', HIGH_QUALITY_STRATEGY);
    this.registerStrategy('fast-loading', FAST_LOADING_STRATEGY);
    this.registerStrategy('portrait-optimized', PORTRAIT_OPTIMIZED_STRATEGY);
    this.registerStrategy('product-optimized', PRODUCT_OPTIMIZED_STRATEGY);
    this.registerStrategy('thumbnail', THUMBNAIL_STRATEGY);
  }

  /**
   * Register a new optimization strategy
   */
  static registerStrategy(name: string, strategy: OptimizationStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Get optimization strategy by name
   */
  static getStrategy(name: string): OptimizationStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Get all available strategies
   */
  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Auto-select best optimization strategy based on image characteristics
   */
  static async selectOptimalStrategy(
    buffer: Buffer,
    targetUse: 'web' | 'mobile' | 'print' | 'thumbnail' | 'social' = 'web'
  ): Promise<string> {
    try {
      const metadata = await ImageProcessor.getMetadata(buffer);
      
      // Size-based selection
      if (metadata.width <= 200 || metadata.height <= 200) {
        return 'thumbnail';
      }

      // Use case based selection
      switch (targetUse) {
        case 'mobile':
          return 'fast-loading';
        
        case 'print':
          return 'high-quality';
        
        case 'thumbnail':
          return 'thumbnail';
        
        case 'social':
          return this.selectSocialStrategy(metadata);
        
        case 'web':
        default:
          return this.selectWebStrategy(metadata);
      }
    } catch (error) {
      console.warn('Failed to analyze image for strategy selection:', error);
      return 'web-optimized'; // Fallback
    }
  }

  /**
   * Optimize image using specified strategy
   */
  static async optimize(
    buffer: Buffer,
    strategyName: string,
    customOptions: Partial<ImageProcessingOptions> = {}
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    const strategy = this.getStrategy(strategyName);
    if (!strategy) {
      throw new Error(`Unknown optimization strategy: ${strategyName}`);
    }

    try {
      // Get original metadata
      const originalMetadata = await ImageProcessor.getMetadata(buffer);
      const originalSize = buffer.length;

      // Apply optimization pipeline
      const result = await ImageProcessor.processPipeline(
        buffer,
        strategy.pipeline,
        {
          inputFormat: originalMetadata.format,
          outputFormat: strategy.pipeline.outputFormat || 'jpeg',
          quality: strategy.targetQuality,
          timestamp: Date.now(),
        }
      );

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(
        originalMetadata,
        result.metadata,
        strategy
      );

      return {
        originalSize,
        optimizedSize: result.processedSize,
        compressionRatio: result.compressionRatio,
        qualityScore,
        processingTime: Date.now() - startTime,
        strategy: strategyName,
        buffer: result.buffer,
      };

    } catch (error) {
      throw new Error(`Optimization with strategy '${strategyName}' failed: ${error}`);
    }
  }

  /**
   * Compare multiple optimization strategies
   */
  static async compareStrategies(
    buffer: Buffer,
    strategies: string[]
  ): Promise<{ strategy: string; result: OptimizationResult }[]> {
    const results: { strategy: string; result: OptimizationResult }[] = [];

    for (const strategyName of strategies) {
      try {
        const result = await this.optimize(buffer, strategyName);
        results.push({ strategy: strategyName, result });
      } catch (error) {
        console.warn(`Strategy ${strategyName} failed:`, error);
      }
    }

    // Sort by quality score descending
    return results.sort((a, b) => b.result.qualityScore - a.result.qualityScore);
  }

  /**
   * Find optimal strategy through testing
   */
  static async findOptimalStrategy(
    buffer: Buffer,
    constraints: {
      maxSize?: number;
      minQuality?: number;
      maxProcessingTime?: number;
    } = {}
  ): Promise<{ strategy: string; result: OptimizationResult }> {
    const candidateStrategies = this.getAvailableStrategies();
    const results = await this.compareStrategies(buffer, candidateStrategies);

    // Filter by constraints
    const validResults = results.filter(({ result }) => {
      if (constraints.maxSize && result.optimizedSize > constraints.maxSize) {
        return false;
      }
      if (constraints.minQuality && result.qualityScore < constraints.minQuality) {
        return false;
      }
      if (constraints.maxProcessingTime && result.processingTime > constraints.maxProcessingTime) {
        return false;
      }
      return true;
    });

    if (validResults.length === 0) {
      throw new Error('No optimization strategy meets the specified constraints');
    }

    // Return best valid result
    return validResults[0];
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Select best web optimization strategy
   */
  private static selectWebStrategy(metadata: ImageMetadata): string {
    const pixelCount = metadata.width * metadata.height;
    
    // Large images need aggressive optimization
    if (pixelCount > 4000000) { // > 4MP
      return 'fast-loading';
    }
    
    // Medium images can use balanced approach
    if (pixelCount > 1000000) { // > 1MP
      return 'web-optimized';
    }
    
    // Small images can retain higher quality
    return 'high-quality';
  }

  /**
   * Select best social media strategy
   */
  private static selectSocialStrategy(metadata: ImageMetadata): string {
    const aspectRatio = metadata.width / metadata.height;
    
    // Square or near-square for Instagram
    if (aspectRatio >= 0.8 && aspectRatio <= 1.25) {
      return 'portrait-optimized';
    }
    
    // Wide for Facebook/Twitter headers
    if (aspectRatio > 2) {
      return 'web-optimized';
    }
    
    // Portrait for stories
    if (aspectRatio < 0.8) {
      return 'portrait-optimized';
    }
    
    return 'web-optimized';
  }

  /**
   * Calculate quality score based on compression and visual quality
   */
  private static calculateQualityScore(
    original: ImageMetadata,
    optimized: ImageMetadata,
    strategy: OptimizationStrategy
  ): number {
    let score = 100;

    // Penalize excessive compression
    const compressionRatio = optimized.size / original.size;
    if (compressionRatio < 0.1) score -= 30; // Very aggressive compression
    else if (compressionRatio < 0.3) score -= 15; // Aggressive compression
    else if (compressionRatio < 0.5) score -= 5; // Moderate compression

    // Penalize resolution changes
    const resolutionRatio = (optimized.width * optimized.height) / (original.width * original.height);
    if (resolutionRatio < 0.5) score -= 20;
    else if (resolutionRatio < 0.8) score -= 10;

    // Bonus for achieving target quality
    if (compressionRatio >= strategy.targetQuality / 100) {
      score += 10;
    }

    // Bonus for preserving quality while achieving size reduction
    if (compressionRatio < 0.7 && score > 80) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// ============================================================================
// Built-in Optimization Strategies
// ============================================================================

const WEB_OPTIMIZED_STRATEGY: OptimizationStrategy = {
  name: 'web-optimized',
  description: 'Balanced optimization for web delivery with good quality and reasonable file size',
  targetQuality: 85,
  maxSizeReduction: 0.7,
  preserveQuality: true,
  pipeline: {
    steps: [
      {
        name: 'resize',
        enabled: true,
        options: {
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        },
      },
      {
        name: 'sharpen',
        enabled: true,
        options: { sigma: 0.5 },
      },
    ],
    outputFormat: 'webp',
    quality: 85,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

const HIGH_QUALITY_STRATEGY: OptimizationStrategy = {
  name: 'high-quality',
  description: 'Minimal compression for maximum quality retention',
  targetQuality: 95,
  maxSizeReduction: 0.9,
  preserveQuality: true,
  pipeline: {
    steps: [
      {
        name: 'sharpen',
        enabled: true,
        options: { sigma: 0.3 },
      },
    ],
    outputFormat: 'webp',
    quality: 95,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

const FAST_LOADING_STRATEGY: OptimizationStrategy = {
  name: 'fast-loading',
  description: 'Aggressive optimization for fast loading times',
  targetQuality: 70,
  maxSizeReduction: 0.4,
  preserveQuality: false,
  pipeline: {
    steps: [
      {
        name: 'resize',
        enabled: true,
        options: {
          width: 1280,
          height: 1280,
          fit: 'inside',
          withoutEnlargement: true,
        },
      },
      {
        name: 'blur',
        enabled: true,
        options: { sigma: 0.1 },
      },
    ],
    outputFormat: 'webp',
    quality: 70,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

const PORTRAIT_OPTIMIZED_STRATEGY: OptimizationStrategy = {
  name: 'portrait-optimized',
  description: 'Optimized for portrait and people photos with face-aware processing',
  targetQuality: 90,
  maxSizeReduction: 0.6,
  preserveQuality: true,
  pipeline: {
    steps: [
      {
        name: 'resize',
        enabled: true,
        options: {
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        },
      },
      {
        name: 'sharpen',
        enabled: true,
        options: { sigma: 0.7 },
      },
      {
        name: 'modulate',
        enabled: true,
        options: {
          saturation: 1.1,
          brightness: 1.02,
        },
      },
    ],
    outputFormat: 'jpeg',
    quality: 90,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

const PRODUCT_OPTIMIZED_STRATEGY: OptimizationStrategy = {
  name: 'product-optimized',
  description: 'Optimized for product photos with emphasis on detail preservation',
  targetQuality: 95,
  maxSizeReduction: 0.8,
  preserveQuality: true,
  pipeline: {
    steps: [
      {
        name: 'resize',
        enabled: true,
        options: {
          width: 2048,
          height: 2048,
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      },
      {
        name: 'sharpen',
        enabled: true,
        options: { sigma: 1.0 },
      },
      {
        name: 'normalize',
        enabled: true,
        options: {},
      },
    ],
    outputFormat: 'webp',
    quality: 95,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

const THUMBNAIL_STRATEGY: OptimizationStrategy = {
  name: 'thumbnail',
  description: 'Small thumbnails with aggressive size optimization',
  targetQuality: 75,
  maxSizeReduction: 0.3,
  preserveQuality: false,
  pipeline: {
    steps: [
      {
        name: 'resize',
        enabled: true,
        options: {
          width: 300,
          height: 300,
          fit: 'cover',
          position: 'center',
        },
      },
      {
        name: 'sharpen',
        enabled: true,
        options: { sigma: 0.5 },
      },
    ],
    outputFormat: 'webp',
    quality: 75,
    stripMetadata: true,
    preserveAnimation: false,
  },
};

// ============================================================================
// Adaptive Optimization
// ============================================================================

export class AdaptiveOptimizer {
  /**
   * Optimize based on viewport and device characteristics
   */
  static async optimizeForViewport(
    buffer: Buffer,
    viewport: {
      width: number;
      height: number;
      devicePixelRatio: number;
      connection?: 'slow-2g' | '2g' | '3g' | '4g' | '5g';
    }
  ): Promise<OptimizationResult> {
    const targetWidth = Math.min(viewport.width * viewport.devicePixelRatio, 2048);
    const targetHeight = Math.min(viewport.height * viewport.devicePixelRatio, 2048);

    // Adjust quality based on connection speed
    let quality = 85;
    switch (viewport.connection) {
      case 'slow-2g':
      case '2g':
        quality = 60;
        break;
      case '3g':
        quality = 75;
        break;
      case '4g':
      case '5g':
        quality = 90;
        break;
    }

    const adaptiveStrategy: OptimizationStrategy = {
      name: 'adaptive-viewport',
      description: 'Optimized for specific viewport and connection',
      targetQuality: quality,
      maxSizeReduction: 0.6,
      preserveQuality: viewport.connection === '4g' || viewport.connection === '5g',
      pipeline: {
        steps: [
          {
            name: 'resize',
            enabled: true,
            options: {
              width: targetWidth,
              height: targetHeight,
              fit: 'inside',
              withoutEnlargement: true,
            },
          },
        ],
        outputFormat: 'webp',
        quality,
        stripMetadata: true,
        preserveAnimation: false,
      },
    };

    OptimizationManager.registerStrategy('adaptive-viewport', adaptiveStrategy);
    return await OptimizationManager.optimize(buffer, 'adaptive-viewport');
  }

  /**
   * Progressive optimization - generate multiple quality levels
   */
  static async generateProgressiveVersions(
    buffer: Buffer
  ): Promise<{
    placeholder: Buffer;
    low: Buffer;
    medium: Buffer;
    high: Buffer;
  }> {
    const [placeholder, low, medium, high] = await Promise.all([
      OptimizationManager.optimize(buffer, 'thumbnail'),
      OptimizationManager.optimize(buffer, 'fast-loading'),
      OptimizationManager.optimize(buffer, 'web-optimized'),
      OptimizationManager.optimize(buffer, 'high-quality'),
    ]);

    return {
      placeholder: placeholder.buffer,
      low: low.buffer,
      medium: medium.buffer,
      high: high.buffer,
    };
  }
}