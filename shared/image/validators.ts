/**
 * Image Validation System
 * SSELFIE Platform - Image Validation
 */

import * as sharp from 'sharp';
import type {
  ImageValidationOptions,
  ValidationResult,
  ImageMetadata,
  ImageProcessingError as IImageProcessingError,
  ImageProcessingErrorType,
} from './types.js';

// ============================================================================
// Error Classes
// ============================================================================

export class ImageProcessingError extends Error implements IImageProcessingError {
  public readonly type: ImageProcessingErrorType;
  public readonly code: string;
  public readonly originalError?: Error;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    type: ImageProcessingErrorType,
    code: string,
    message: string,
    options: {
      originalError?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    
    this.name = 'ImageProcessingError';
    this.type = type;
    this.code = code;
    this.originalError = options.originalError;
    this.metadata = options.metadata;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ImageProcessingError);
    }
  }
}

// ============================================================================
// Image Validator
// ============================================================================

export class ImageValidator {
  private static readonly SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/tiff',
    'image/gif',
    'image/svg+xml',
  ];

  private static readonly DEFAULT_OPTIONS: ImageValidationOptions = {
    maxWidth: 4096,
    maxHeight: 4096,
    minWidth: 1,
    minHeight: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    allowAnimated: false,
    maxAnimationFrames: 1,
  };

  /**
   * Validate image buffer with comprehensive checks
   */
  static async validate(
    buffer: Buffer,
    options: ImageValidationOptions = {}
  ): Promise<ValidationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];
    let metadata: ImageMetadata | undefined;

    try {
      // Basic buffer validation
      if (!buffer || buffer.length === 0) {
        errors.push('Image buffer is empty');
        return { valid: false, errors, warnings };
      }

      // File size validation
      if (buffer.length > opts.maxFileSize!) {
        errors.push(`File size ${this.formatBytes(buffer.length)} exceeds maximum allowed size ${this.formatBytes(opts.maxFileSize!)}`);
      }

      // Extract metadata
      try {
        metadata = await this.extractMetadata(buffer);
      } catch (error) {
        errors.push(`Failed to read image metadata: ${error}`);
        return { valid: false, errors, warnings, metadata };
      }

      // Format validation
      if (opts.allowedFormats && !opts.allowedFormats.includes(metadata.format)) {
        errors.push(`Image format '${metadata.format}' is not allowed. Allowed formats: ${opts.allowedFormats.join(', ')}`);
      }

      // Dimension validation
      if (opts.maxWidth && metadata.width > opts.maxWidth) {
        errors.push(`Image width ${metadata.width}px exceeds maximum width ${opts.maxWidth}px`);
      }

      if (opts.maxHeight && metadata.height > opts.maxHeight) {
        errors.push(`Image height ${metadata.height}px exceeds maximum height ${opts.maxHeight}px`);
      }

      if (opts.minWidth && metadata.width < opts.minWidth) {
        errors.push(`Image width ${metadata.width}px is below minimum width ${opts.minWidth}px`);
      }

      if (opts.minHeight && metadata.height < opts.minHeight) {
        errors.push(`Image height ${metadata.height}px is below minimum height ${opts.minHeight}px`);
      }

      // Animation validation
      if (metadata.isAnimated && !opts.allowAnimated) {
        errors.push('Animated images are not allowed');
      }

      if (metadata.pages && opts.maxAnimationFrames && metadata.pages > opts.maxAnimationFrames) {
        errors.push(`Animation has ${metadata.pages} frames, maximum allowed is ${opts.maxAnimationFrames}`);
      }

      // Alpha channel validation
      if (opts.requireAlpha && !metadata.hasAlpha) {
        errors.push('Image must have an alpha channel (transparency)');
      }

      // Quality warnings
      if (metadata.width < 300 || metadata.height < 300) {
        warnings.push('Image resolution is quite low, quality may be poor when displayed');
      }

      if (buffer.length < 10 * 1024) { // Less than 10KB
        warnings.push('Image file size is very small, quality may be compromised');
      }

      if (metadata.format === 'gif' && !metadata.isAnimated) {
        warnings.push('Static GIF detected, consider using PNG or JPEG for better compression');
      }

      // Security validation
      const securityResult = await this.validateSecurity(buffer, metadata);
      errors.push(...securityResult.errors);
      warnings.push(...securityResult.warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata,
      };

    } catch (error) {
      errors.push(`Validation failed: ${error}`);
      return { valid: false, errors, warnings, metadata };
    }
  }

  /**
   * Validate file upload
   */
  static async validateFile(
    file: File,
    options: ImageValidationOptions = {}
  ): Promise<ValidationResult> {
    try {
      // Basic file validation
      if (!file) {
        return {
          valid: false,
          errors: ['No file provided'],
          warnings: [],
        };
      }

      // MIME type validation
      if (!this.SUPPORTED_MIME_TYPES.includes(file.type)) {
        return {
          valid: false,
          errors: [`File type '${file.type}' is not supported`],
          warnings: [],
        };
      }

      // Convert file to buffer
      const buffer = await this.fileToBuffer(file);
      
      // Perform buffer validation
      const result = await this.validate(buffer, options);

      // Additional file-specific validations
      if (file.name && !this.isValidFileName(file.name)) {
        result.warnings.push('File name contains potentially unsafe characters');
      }

      return result;

    } catch (error) {
      return {
        valid: false,
        errors: [`File validation failed: ${error}`],
        warnings: [],
      };
    }
  }

  /**
   * Validate multiple images
   */
  static async validateBatch(
    buffers: Buffer[],
    options: ImageValidationOptions = {}
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const buffer of buffers) {
      try {
        const result = await this.validate(buffer, options);
        results.push(result);
      } catch (error) {
        results.push({
          valid: false,
          errors: [`Batch validation failed: ${error}`],
          warnings: [],
        });
      }
    }

    return results;
  }

  /**
   * Quick format detection
   */
  static detectFormat(buffer: Buffer): string | null {
    try {
      // Check magic bytes for common formats
      if (buffer.length < 4) return null;

      // JPEG
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        return 'jpeg';
      }

      // PNG
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'png';
      }

      // WebP
      if (buffer.slice(8, 12).toString() === 'WEBP') {
        return 'webp';
      }

      // GIF
      if (buffer.slice(0, 3).toString() === 'GIF') {
        return 'gif';
      }

      // AVIF (check for ftyp box)
      if (buffer.slice(4, 8).toString() === 'ftyp' && buffer.slice(8, 12).toString() === 'avif') {
        return 'avif';
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Extract comprehensive metadata
   */
  private static async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(buffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha || false,
        hasProfile: metadata.hasProfile || false,
        isAnimated: metadata.pages ? metadata.pages > 1 : false,
        pages: metadata.pages,
        exif: metadata.exif ? this.parseBasicExif(metadata.exif) : undefined,
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
        `Failed to extract metadata: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Security validation for potential threats
   */
  private static async validateSecurity(
    buffer: Buffer,
    metadata: ImageMetadata
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for suspicious file size ratios
      const pixelCount = metadata.width * metadata.height;
      const bytesPerPixel = buffer.length / pixelCount;

      if (bytesPerPixel > 100) { // Unusually high bytes per pixel
        warnings.push('Image has unusually high compression ratio, may indicate embedded data');
      }

      // Check for embedded scripts in SVG (if supported)
      if (metadata.format === 'svg') {
        const content = buffer.toString('utf8');
        if (content.includes('<script>') || content.includes('javascript:')) {
          errors.push('SVG contains potentially malicious scripts');
        }
      }

      // Check for large EXIF data that might hide content
      if (metadata.exif && buffer.length > 1024 * 1024) { // 1MB
        const exifSize = this.estimateExifSize(buffer);
        if (exifSize > 100 * 1024) { // 100KB EXIF is suspicious
          warnings.push('Image contains unusually large EXIF data');
        }
      }

      // Check aspect ratio for potential issues
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio > 100 || aspectRatio < 0.01) {
        warnings.push('Image has extreme aspect ratio which may cause display issues');
      }

    } catch (error) {
      warnings.push(`Security validation incomplete: ${error}`);
    }

    return { errors, warnings };
  }

  /**
   * Convert File to Buffer
   */
  private static async fileToBuffer(file: File): Promise<Buffer> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new ImageProcessingError(
        'validation',
        'FILE_READ_FAILED',
        `Failed to read file: ${error}`,
        { originalError: error as Error }
      );
    }
  }

  /**
   * Validate file name for security
   */
  private static isValidFileName(filename: string): boolean {
    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) return false;

    // Check for path traversal
    if (filename.includes('..') || filename.includes('./')) return false;

    // Check for Windows reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) return false;

    return true;
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Parse basic EXIF data
   */
  private static parseBasicExif(exifBuffer: Buffer): Record<string, any> {
    try {
      // Basic EXIF parsing - in production use a proper EXIF library
      return {
        size: exifBuffer.length,
        hasData: true,
      };
    } catch (error) {
      return { hasData: false };
    }
  }

  /**
   * Estimate EXIF data size
   */
  private static estimateExifSize(buffer: Buffer): number {
    try {
      // This is a rough estimation - proper implementation would parse EXIF structure
      // Look for EXIF marker in JPEG
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        for (let i = 2; i < buffer.length - 4; i++) {
          if (buffer[i] === 0xFF && buffer[i + 1] === 0xE1) {
            // Found EXIF segment
            const segmentLength = (buffer[i + 2] << 8) | buffer[i + 3];
            return segmentLength;
          }
        }
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

// ============================================================================
// Specialized Validators
// ============================================================================

export class PortraitValidator extends ImageValidator {
  /**
   * Validate portrait images with specific requirements
   */
  static async validatePortrait(
    buffer: Buffer,
    options: Partial<ImageValidationOptions> = {}
  ): Promise<ValidationResult> {
    const portraitOptions: ImageValidationOptions = {
      ...options,
      minWidth: options.minWidth || 200,
      minHeight: options.minHeight || 200,
      maxWidth: options.maxWidth || 4096,
      maxHeight: options.maxHeight || 4096,
      allowedFormats: options.allowedFormats || ['jpeg', 'jpg', 'png'],
      allowAnimated: false,
    };

    const result = await this.validate(buffer, portraitOptions);

    // Additional portrait-specific validation
    if (result.metadata) {
      const aspectRatio = result.metadata.width / result.metadata.height;
      
      // Warn about extreme aspect ratios for portraits
      if (aspectRatio > 2 || aspectRatio < 0.5) {
        result.warnings.push('Unusual aspect ratio for portrait image');
      }
      
      // Check for minimum resolution
      if (result.metadata.width < 512 || result.metadata.height < 512) {
        result.warnings.push('Low resolution may result in poor quality when processed');
      }
    }

    return result;
  }
}

export class ProductValidator extends ImageValidator {
  /**
   * Validate product images with specific requirements
   */
  static async validateProduct(
    buffer: Buffer,
    options: Partial<ImageValidationOptions> = {}
  ): Promise<ValidationResult> {
    const productOptions: ImageValidationOptions = {
      ...options,
      minWidth: options.minWidth || 300,
      minHeight: options.minHeight || 300,
      maxWidth: options.maxWidth || 6000,
      maxHeight: options.maxHeight || 6000,
      allowedFormats: options.allowedFormats || ['jpeg', 'jpg', 'png', 'webp'],
      allowAnimated: false,
    };

    const result = await this.validate(buffer, productOptions);

    // Additional product-specific validation
    if (result.metadata) {
      // Recommend square or 4:3 aspect ratio for products
      const aspectRatio = result.metadata.width / result.metadata.height;
      if (aspectRatio < 0.7 || aspectRatio > 1.5) {
        result.warnings.push('Consider using square or 4:3 aspect ratio for better product display');
      }
      
      // High resolution recommendation
      if (result.metadata.width < 1000 || result.metadata.height < 1000) {
        result.warnings.push('Higher resolution recommended for product images (1000x1000px minimum)');
      }
    }

    return result;
  }
}