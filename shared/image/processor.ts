/**
 * Image Processing Engine
 * SSELFIE Platform - Image Processing
 */

import sharp from 'sharp';
import type {
  ImageProcessingOptions,
  ResizeOptions,
  OptimizationOptions,
  ImageMetadata,
  ProcessingResult,
  ProcessingContext,
  ProcessingPipeline,
  ImageCapabilities,
} from './types.js';
import { ImageProcessingError } from './validators.js';

// ============================================================================
// Main Image Processor
// ============================================================================

export class ImageProcessor {
  private static readonly SUPPORTED_INPUT_FORMATS = [
    'jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif', 'svg'
  ];
  
  private static readonly SUPPORTED_OUTPUT_FORMATS = [
    'jpeg', 'png', 'webp', 'avif'
  ];

  private static readonly DEFAULT_OPTIONS: ImageProcessingOptions = {
    quality: 85,
    format: 'jpeg',
    strip: true,
    progressive: true,
  };

  /**
   * Optimize image with automatic format selection and quality tuning
   */
  static async optimize(
    input: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Get input metadata
      const inputMetadata = await this.getMetadata(input);
      const originalSize = input.length;

      // Create sharp instance
      let processor = sharp(input);

      // Apply transformations
      processor = await this.applyTransformations(processor, opts, inputMetadata);

      // Apply format conversion and optimization
      processor = await this.applyOptimization(processor, opts);

      // Generate output
      const outputBuffer = await processor.toBuffer();
      const outputMetadata = await this.getMetadata(outputBuffer);

      const processingTime = Date.now() - startTime;
      const compressionRatio = originalSize / outputBuffer.length;

      return {
        buffer: outputBuffer,
        metadata: outputMetadata,
        originalSize,
        processedSize: outputBuffer.length,
        compressionRatio,
        processingTime,
      };

    } catch (error) {
      throw new ImageProcessingError(
        'processing',
        'OPTIMIZATION_FAILED',
        `Image optimization failed: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Resize image with advanced options
   */
  static async resize(
    input: Buffer,
    width: number,
    height: number,
    options: ResizeOptions = {}
  ): Promise<Buffer> {
    try {
      let processor = sharp(input);

      const resizeOptions: any = {
        width: width || undefined,
        height: height || undefined,
        fit: options.fit || 'cover',
        position: options.position || 'center',
        background: options.background || { r: 255, g: 255, b: 255, alpha: 1 },
        kernel: options.kernel || 'lanczos3',
        withoutEnlargement: options.withoutEnlargement || false,
        withoutReduction: options.withoutReduction || false,
      };

      processor = processor.resize(resizeOptions);

      return await processor.toBuffer();

    } catch (error) {
      throw new ImageProcessingError(
        'processing',
        'RESIZE_FAILED',
        `Image resize failed: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Convert image format
   */
  static async convert(
    input: Buffer,
    format: 'jpeg' | 'png' | 'webp' | 'avif',
    options: OptimizationOptions = {}
  ): Promise<Buffer> {
    try {
      let processor = sharp(input);

      switch (format) {
        case 'jpeg':
          processor = processor.jpeg({
            quality: options.quality || 85,
            progressive: options.progressive || true,
            mozjpeg: true,
          });
          break;

        case 'png':
          processor = processor.png({
            quality: options.quality || 85,
            compressionLevel: options.compressionLevel || 6,
            adaptiveFiltering: options.adaptiveFiltering || true,
            palette: options.palette || false,
          });
          break;

        case 'webp':
          processor = processor.webp({
            quality: options.quality || 85,
            lossless: options.lossless || false,
            effort: options.effort || 4,
          });
          break;

        case 'avif':
          processor = processor.avif({
            quality: options.quality || 85,
            lossless: options.lossless || false,
            effort: options.effort || 4,
          });
          break;

        default:
          throw new Error(`Unsupported output format: ${format}`);
      }

      return await processor.toBuffer();

    } catch (error) {
      throw new ImageProcessingError(
        'format_conversion',
        'CONVERSION_FAILED',
        `Image format conversion failed: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Extract comprehensive image metadata
   */
  static async getMetadata(input: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(input).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: input.length,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha || false,
        hasProfile: metadata.hasProfile || false,
        isAnimated: metadata.pages && metadata.pages > 1,
        pages: metadata.pages,
        exif: metadata.exif ? this.parseExif(metadata.exif) : undefined,
        icc: metadata.icc ? {
          description: metadata.icc.description || '',
          copyright: metadata.icc.copyright || '',
          deviceClass: metadata.icc.deviceClass || '',
        } : undefined,
      };

    } catch (error) {
      throw new ImageProcessingError(
        'metadata_extraction',
        'METADATA_FAILED',
        `Metadata extraction failed: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Process image through a pipeline of operations
   */
  static async processPipeline(
    input: Buffer,
    pipeline: ProcessingPipeline,
    context: ProcessingContext
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const originalSize = input.length;

    try {
      let processor = sharp(input);
      const inputMetadata = await this.getMetadata(input);

      // Apply each step in the pipeline
      for (const step of pipeline.steps) {
        if (!step.enabled) continue;

        processor = await this.applyPipelineStep(processor, step, inputMetadata);
      }

      // Apply final output format and quality
      if (pipeline.outputFormat) {
        processor = await this.applyFormatConversion(processor, pipeline.outputFormat, {
          quality: pipeline.quality,
        });
      }

      // Strip metadata if requested
      if (pipeline.stripMetadata) {
        processor = processor.withMetadata({});
      }

      const outputBuffer = await processor.toBuffer();
      const outputMetadata = await this.getMetadata(outputBuffer);

      return {
        buffer: outputBuffer,
        metadata: outputMetadata,
        originalSize,
        processedSize: outputBuffer.length,
        compressionRatio: originalSize / outputBuffer.length,
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      throw new ImageProcessingError(
        'processing',
        'PIPELINE_FAILED',
        `Pipeline processing failed: ${error}`,
        { originalError: error as Error, metadata: { context } }
      );
    }
  }

  /**
   * Get image processing capabilities
   */
  static getCapabilities(): ImageCapabilities {
    return {
      formats: {
        input: [...this.SUPPORTED_INPUT_FORMATS],
        output: [...this.SUPPORTED_OUTPUT_FORMATS],
      },
      features: {
        resize: true,
        crop: true,
        rotate: true,
        blur: true,
        sharpen: true,
        colorspace: true,
        animation: false, // Sharp doesn't support animated output
        metadata: true,
      },
      limits: {
        maxWidth: 16383,
        maxHeight: 16383,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxAnimationFrames: 1, // Static images only
      },
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Apply image transformations
   */
  private static async applyTransformations(
    processor: sharp.Sharp,
    options: ImageProcessingOptions,
    metadata: ImageMetadata
  ): Promise<sharp.Sharp> {
    // Resize if dimensions specified
    if (options.maxWidth || options.maxHeight) {
      const resizeOptions: any = {};
      
      if (options.maxWidth) resizeOptions.width = options.maxWidth;
      if (options.maxHeight) resizeOptions.height = options.maxHeight;
      
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = true;
      
      processor = processor.resize(resizeOptions);
    }

    // Apply blur if specified
    if (options.blur && options.blur > 0) {
      processor = processor.blur(Math.min(options.blur, 1000));
    }

    // Apply sharpening if specified
    if (options.sharpen && options.sharpen > 0) {
      processor = processor.sharpen({
        sigma: Math.min(options.sharpen, 10),
      });
    }

    // Set background color for transparent images
    if (options.backgroundColor && !metadata.hasAlpha) {
      processor = processor.flatten({
        background: options.backgroundColor,
      });
    }

    return processor;
  }

  /**
   * Apply optimization settings
   */
  private static async applyOptimization(
    processor: sharp.Sharp,
    options: ImageProcessingOptions
  ): Promise<sharp.Sharp> {
    const format = options.format || 'jpeg';
    const quality = Math.min(Math.max(options.quality || 85, 1), 100);

    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({
          quality,
          progressive: options.progressive !== false,
          mozjpeg: true,
        });
        break;

      case 'png':
        processor = processor.png({
          quality,
          compressionLevel: 6,
          adaptiveFiltering: true,
        });
        break;

      case 'webp':
        processor = processor.webp({
          quality,
          lossless: options.lossless || false,
          effort: 4,
        });
        break;

      case 'avif':
        processor = processor.avif({
          quality,
          lossless: options.lossless || false,
          effort: 4,
        });
        break;
    }

    // Strip metadata if requested
    if (options.strip) {
      const preservedFields: any = {};
      
      if (options.preserveMetadata) {
        // Preserve specific metadata fields
        options.preserveMetadata.forEach(field => {
          if (field === 'icc') preservedFields.icc = true;
          if (field === 'exif') preservedFields.exif = true;
        });
      }

      processor = processor.withMetadata(preservedFields);
    }

    return processor;
  }

  /**
   * Apply individual pipeline step
   */
  private static async applyPipelineStep(
    processor: sharp.Sharp,
    step: any,
    metadata: ImageMetadata
  ): Promise<sharp.Sharp> {
    switch (step.name) {
      case 'resize':
        return processor.resize(step.options);
      
      case 'crop':
        return processor.extract(step.options);
      
      case 'rotate':
        return processor.rotate(step.options.angle);
      
      case 'flip':
        return step.options.horizontal ? processor.flop() : processor.flip();
      
      case 'blur':
        return processor.blur(step.options.sigma);
      
      case 'sharpen':
        return processor.sharpen(step.options);
      
      case 'modulate':
        return processor.modulate(step.options);
      
      case 'tint':
        return processor.tint(step.options.color);
      
      case 'grayscale':
        return processor.grayscale();
      
      case 'normalize':
        return processor.normalize();
      
      default:
        console.warn(`Unknown pipeline step: ${step.name}`);
        return processor;
    }
  }

  /**
   * Apply format conversion with options
   */
  private static async applyFormatConversion(
    processor: sharp.Sharp,
    format: string,
    options: any = {}
  ): Promise<sharp.Sharp> {
    switch (format) {
      case 'jpeg':
        return processor.jpeg(options);
      case 'png':
        return processor.png(options);
      case 'webp':
        return processor.webp(options);
      case 'avif':
        return processor.avif(options);
      default:
        return processor;
    }
  }

  /**
   * Parse EXIF data into readable format
   */
  private static parseExif(exifBuffer: Buffer): Record<string, any> {
    try {
      // This is a simplified EXIF parser
      // In production, you might want to use a dedicated EXIF library
      return {
        // Basic EXIF parsing would go here
        raw: exifBuffer.toString('base64'),
      };
    } catch (error) {
      return {};
    }
  }
}

// ============================================================================
// Specialized Processors
// ============================================================================

export class PortraitProcessor extends ImageProcessor {
  /**
   * Optimize portrait images with face-aware processing
   */
  static async optimizePortrait(
    input: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const portraitOptions: ImageProcessingOptions = {
      ...options,
      quality: options.quality || 90, // Higher quality for portraits
      format: options.format || 'jpeg',
      maxWidth: options.maxWidth || 1920,
      maxHeight: options.maxHeight || 1920,
      sharpen: options.sharpen || 0.5, // Slight sharpening for portraits
      strip: true,
    };

    return await this.optimize(input, portraitOptions);
  }
}

export class ProductProcessor extends ImageProcessor {
  /**
   * Optimize product images with emphasis on detail preservation
   */
  static async optimizeProduct(
    input: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const productOptions: ImageProcessingOptions = {
      ...options,
      quality: options.quality || 95, // High quality for products
      format: options.format || 'webp',
      backgroundColor: '#FFFFFF', // White background for products
      strip: true,
    };

    return await this.optimize(input, productOptions);
  }
}