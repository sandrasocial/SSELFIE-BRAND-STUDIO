// Enhanced Image Processing Service
// Provides comprehensive image compression, validation, and optimization

import { 
  ImageProcessingOptions, 
  ValidationRules, 
  DEFAULT_IMAGE_PROCESSING_OPTIONS, 
  DEFAULT_VALIDATION_RULES,
  ErrorState 
} from '../../../shared/types/client-training.js';

export class ImageProcessingService {
  private static instance: ImageProcessingService;
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {}

  public static getInstance(): ImageProcessingService {
    if (!ImageProcessingService.instance) {
      ImageProcessingService.instance = new ImageProcessingService();
    }
    return ImageProcessingService.instance;
  }

  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    }
    return this.canvas;
  }

  /**
   * Comprehensive image validation
   */
  public validateImages(files: File[], rules: ValidationRules = DEFAULT_VALIDATION_RULES): ErrorState[] {
    const errors: ErrorState[] = [];

    // Check file count
    if (files.length < rules.minImages) {
      errors.push({
        type: 'validation',
        code: 'INSUFFICIENT_IMAGES',
        message: `Minimum ${rules.minImages} images required. You have ${files.length}.`,
        recoverable: true
      });
    }

    if (files.length > rules.maxImages) {
      errors.push({
        type: 'validation',
        code: 'TOO_MANY_IMAGES',
        message: `Maximum ${rules.maxImages} images allowed. You have ${files.length}.`,
        recoverable: true
      });
    }

    // Validate each file
    files.forEach((file, index) => {
      const fileErrors = this.validateSingleFile(file, rules, index);
      errors.push(...fileErrors);
    });

    return errors;
  }

  private validateSingleFile(file: File, rules: ValidationRules, index: number): ErrorState[] {
    const errors: ErrorState[] = [];

    // Check file type
    if (!rules.allowedTypes.includes(file.type)) {
      errors.push({
        type: 'validation',
        code: 'INVALID_FILE_TYPE',
        message: `Image ${index + 1}: Invalid file type ${file.type}. Allowed: ${rules.allowedTypes.join(', ')}`,
        recoverable: true
      });
    }

    // Check file size
    if (file.size < rules.minFileSize) {
      errors.push({
        type: 'validation',
        code: 'FILE_TOO_SMALL',
        message: `Image ${index + 1}: File too small (${Math.round(file.size / 1024)}KB). Minimum: ${Math.round(rules.minFileSize / 1024)}KB`,
        recoverable: true
      });
    }

    if (file.size > rules.maxFileSize) {
      errors.push({
        type: 'validation',
        code: 'FILE_TOO_LARGE',
        message: `Image ${index + 1}: File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum: ${Math.round(rules.maxFileSize / 1024 / 1024)}MB`,
        recoverable: true
      });
    }

    return errors;
  }

  /**
   * Enhanced image compression with configurable options
   */
  public async compressImage(
    file: File, 
    options: ImageProcessingOptions = DEFAULT_IMAGE_PROCESSING_OPTIONS,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = this.getCanvas();
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Unable to create canvas context'));
        return;
      }

      img.onload = () => {
        try {
          onProgress?.(25); // Loading complete

          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          
          if (width > options.maxWidth || height > options.maxHeight) {
            const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          onProgress?.(50); // Canvas prepared

          // Draw image with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          onProgress?.(75); // Drawing complete

          // Get optimal format based on browser support and options
          const outputFormat = this.getOptimalFormat(options.format);
          const mimeType = `image/${outputFormat}`;
          
          const compressedBase64 = canvas.toDataURL(mimeType, options.quality);

          onProgress?.(100); // Compression complete

          resolve(compressedBase64);
        } catch (error) {
          reject(new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Start loading
      onProgress?.(0);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Batch process multiple images with progress tracking
   */
  public async batchProcessImages(
    files: File[],
    options: ImageProcessingOptions = DEFAULT_IMAGE_PROCESSING_OPTIONS,
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i, files.length, file.name);
      
      try {
        const compressed = await this.compressImage(file, options);
        results.push(compressed);
      } catch (error) {
        throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    onProgress?.(files.length, files.length, 'Complete');
    return results;
  }

  /**
   * Create thumbnail for preview
   */
  public async createThumbnail(file: File, size: number = 150): Promise<string> {
    const thumbnailOptions: ImageProcessingOptions = {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    };

    return this.compressImage(file, thumbnailOptions);
  }

  /**
   * Get optimal format based on browser support
   */
  private getOptimalFormat(preferredFormat: 'jpeg' | 'webp' | 'png'): string {
    // Check WebP support
    if (preferredFormat === 'webp' && this.supportsWebP()) {
      return 'webp';
    }

    // Fall back to JPEG for photos, PNG for images with transparency
    return preferredFormat === 'png' ? 'png' : 'jpeg';
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = this.getCanvas();
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas = null;
    }
  }
}

// Export singleton instance
export const imageProcessingService = ImageProcessingService.getInstance();