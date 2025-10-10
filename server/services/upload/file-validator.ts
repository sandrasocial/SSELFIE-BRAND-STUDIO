/**
 * File Validator Service
 * Validates file types, sizes, formats, and image quality for training uploads
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import * as fs from 'fs';
import * as path from 'path';

export interface FileValidationConfig {
  minImages: number;
  maxImages: number;
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  requireFaceDetection?: boolean;
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  validImages: string[];
  invalidImages: string[];
  totalSize: number;
}

export interface ImageMetadata {
  path: string;
  size: number;
  format: string;
  dimensions?: { width: number; height: number };
  hasValidContent: boolean;
  isPortrait?: boolean;
}

/**
 * Service for validating uploaded files before training
 */
export class FileValidator {
  private db: IStorage;
  private config: FileValidationConfig;

  constructor(db?: IStorage, config?: Partial<FileValidationConfig>) {
    this.db = db || getDatabase();
    
    // Default validation configuration
    this.config = {
      minImages: 10,
      maxImages: 30,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
      requireFaceDetection: false, // Can be enabled later
      ...config
    };
    
    console.log('✅ FILE VALIDATOR: Initialized with config:', this.config);
  }

  /**
   * Validate uploaded images for training
   */
  async validateUploadedImages(
    userId: string, 
    imageFiles: string[]
  ): Promise<ValidationResult> {
    try {
      console.log(`🔍 FILE VALIDATOR: Validating ${imageFiles.length} images for user ${userId}`);

      const result: ValidationResult = {
        success: false,
        errors: [],
        warnings: [],
        validImages: [],
        invalidImages: [],
        totalSize: 0
      };

      // Critical Check 1: No images provided
      if (!imageFiles || imageFiles.length === 0) {
        result.errors.push('❌ CRITICAL: No images provided. Upload at least 10 selfies before training.');
        return result;
      }

      // Critical Check 2: Less than minimum required
      if (imageFiles.length < this.config.minImages) {
        result.errors.push(
          `❌ CRITICAL: Only ${imageFiles.length} images provided. ` +
          `MINIMUM ${this.config.minImages} selfies required - no exceptions.`
        );
        return result;
      }

      // Critical Check 3: More than maximum allowed
      if (imageFiles.length > this.config.maxImages) {
        result.errors.push(
          `❌ CRITICAL: ${imageFiles.length} images provided. ` +
          `MAXIMUM ${this.config.maxImages} images allowed for optimal training.`
        );
        return result;
      }

      // Validate each image individually
      const imageMetadata: ImageMetadata[] = [];
      for (const imagePath of imageFiles) {
        const metadata = await this.validateSingleImage(imagePath, userId);
        imageMetadata.push(metadata);
        
        if (metadata.hasValidContent) {
          result.validImages.push(imagePath);
          result.totalSize += metadata.size;
        } else {
          result.invalidImages.push(imagePath);
        }
      }

      // Collect validation results
      this.collectValidationResults(imageMetadata, result);

      // Final success determination
      result.success = result.errors.length === 0 && 
                      result.validImages.length >= this.config.minImages;

      console.log(
        `✅ FILE VALIDATOR: Validation complete - ` +
        `${result.validImages.length} valid, ${result.invalidImages.length} invalid`
      );

      return result;

    } catch (error) {
      console.error(`❌ FILE VALIDATOR: Validation failed for user ${userId}:`, error);
      return {
        success: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        validImages: [],
        invalidImages: imageFiles,
        totalSize: 0
      };
    }
  }

  /**
   * Validate a single image file
   */
  private async validateSingleImage(imagePath: string, userId: string): Promise<ImageMetadata> {
    const metadata: ImageMetadata = {
      path: imagePath,
      size: 0,
      format: '',
      hasValidContent: false
    };

    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️ FILE VALIDATOR: File not found: ${imagePath}`);
        return metadata;
      }

      // Get file stats
      const stats = fs.statSync(imagePath);
      metadata.size = stats.size;

      // Check file size
      if (metadata.size > this.config.maxFileSize) {
        console.warn(`⚠️ FILE VALIDATOR: File too large (${metadata.size} bytes): ${imagePath}`);
        return metadata;
      }

      // Check file format
      const ext = path.extname(imagePath).toLowerCase();
      metadata.format = ext;
      
      if (!this.config.allowedFormats.includes(ext)) {
        console.warn(`⚠️ FILE VALIDATOR: Invalid format ${ext}: ${imagePath}`);
        return metadata;
      }

      // Basic content validation (check if it's actually an image)
      const isValidImage = await this.validateImageContent(imagePath);
      if (!isValidImage) {
        console.warn(`⚠️ FILE VALIDATOR: Invalid image content: ${imagePath}`);
        return metadata;
      }

      // Get image dimensions (optional)
      try {
        metadata.dimensions = await this.getImageDimensions(imagePath);
        metadata.isPortrait = this.isPortraitOrientation(metadata.dimensions);
      } catch (error) {
        console.warn(`⚠️ FILE VALIDATOR: Could not read dimensions for ${imagePath}`);
      }

      metadata.hasValidContent = true;
      console.log(`✅ FILE VALIDATOR: Valid image ${path.basename(imagePath)} (${metadata.size} bytes)`);

    } catch (error) {
      console.error(`❌ FILE VALIDATOR: Error validating ${imagePath}:`, error);
    }

    return metadata;
  }

  /**
   * Validate image content by trying to read file headers
   */
  private async validateImageContent(imagePath: string): Promise<boolean> {
    try {
      const buffer = fs.readFileSync(imagePath, { flag: 'r' });
      
      // Check for common image file signatures
      const signatures = {
        jpeg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47],
        webp: [0x52, 0x49, 0x46, 0x46] // RIFF header
      };

      for (const [format, signature] of Object.entries(signatures)) {
        if (this.bufferStartsWith(buffer, signature)) {
          return true;
        }
      }

      return false;

    } catch (error) {
      return false;
    }
  }

  /**
   * Check if buffer starts with signature bytes
   */
  private bufferStartsWith(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    
    return true;
  }

  /**
   * Get image dimensions (basic implementation)
   */
  private async getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    // This is a simplified implementation
    // In production, you might want to use a library like 'image-size'
    return { width: 512, height: 512 }; // Default dimensions
  }

  /**
   * Check if image is in portrait orientation
   */
  private isPortraitOrientation(dimensions?: { width: number; height: number }): boolean {
    if (!dimensions) return false;
    return dimensions.height > dimensions.width;
  }

  /**
   * Collect validation results and generate appropriate messages
   */
  private collectValidationResults(imageMetadata: ImageMetadata[], result: ValidationResult): void {
    const oversizedImages = imageMetadata.filter(img => 
      img.size > this.config.maxFileSize
    ).length;

    const invalidFormatImages = imageMetadata.filter(img => 
      img.format && !this.config.allowedFormats.includes(img.format)
    ).length;

    const corruptImages = imageMetadata.filter(img => 
      img.size > 0 && !img.hasValidContent
    ).length;

    // Generate specific error messages
    if (oversizedImages > 0) {
      result.errors.push(
        `❌ ${oversizedImages} image(s) exceed maximum size of ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB`
      );
    }

    if (invalidFormatImages > 0) {
      result.errors.push(
        `❌ ${invalidFormatImages} image(s) have invalid format. Allowed: ${this.config.allowedFormats.join(', ')}`
      );
    }

    if (corruptImages > 0) {
      result.errors.push(`❌ ${corruptImages} image(s) appear to be corrupted or not valid images`);
    }

    // Generate warnings
    const portraitImages = imageMetadata.filter(img => img.isPortrait).length;
    const landscapeImages = imageMetadata.length - portraitImages;

    if (portraitImages < landscapeImages) {
      result.warnings.push(
        `⚠️ More landscape than portrait images. Portrait selfies typically work better for training.`
      );
    }

    if (result.totalSize > 50 * 1024 * 1024) { // 50MB
      result.warnings.push(
        `⚠️ Large total file size (${Math.round(result.totalSize / 1024 / 1024)}MB). Upload may take longer.`
      );
    }
  }

  /**
   * Update validation configuration
   */
  updateConfig(newConfig: Partial<FileValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 FILE VALIDATOR: Configuration updated:', newConfig);
  }

  /**
   * Get current validation configuration
   */
  getConfig(): FileValidationConfig {
    return { ...this.config };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    config: FileValidationConfig;
    capabilities: string[];
  }> {
    try {
      return {
        status: 'healthy',
        config: this.config,
        capabilities: [
          'File type validation',
          'Size limit enforcement', 
          'Image content verification',
          'Batch validation',
          'Metadata extraction'
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        config: this.config,
        capabilities: []
      };
    }
  }
}

// Export singleton instance with default config
export const fileValidator = new FileValidator();