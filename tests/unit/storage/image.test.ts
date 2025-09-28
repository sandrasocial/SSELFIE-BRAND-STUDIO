/**
 * Image Processing Unit Tests
 * SSELFIE Platform - Image Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ImageProcessor } from '../../../shared/image/processor';
import { ImageValidator } from '../../../shared/image/validators';
import { OptimizationManager } from '../../../shared/image/optimizers';

// Mock sharp
jest.mock('sharp', () => {
  const mockSharp = {
    metadata: jest.fn(),
    resize: jest.fn(),
    jpeg: jest.fn(),
    png: jest.fn(),
    webp: jest.fn(),
    avif: jest.fn(),
    blur: jest.fn(),
    sharpen: jest.fn(),
    withMetadata: jest.fn(),
    toBuffer: jest.fn(),
  };

  // Chain methods return the instance
  Object.keys(mockSharp).forEach(key => {
    if (key !== 'metadata' && key !== 'toBuffer') {
      (mockSharp as any)[key].mockReturnValue(mockSharp);
    }
  });

  return jest.fn(() => mockSharp);
});

import sharp from 'sharp';
const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

describe('ImageProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('optimize', () => {
    it('should optimize image successfully', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const outputBuffer = Buffer.from('optimized image data');
      
      const mockMetadata = {
        width: 1920,
        height: 1080,
        format: 'jpeg',
        size: inputBuffer.length,
        hasAlpha: false,
        hasProfile: false,
      };

      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'jpeg',
        hasAlpha: false,
        hasProfile: false,
      });
      (mockSharpInstance.toBuffer as jest.Mock).mockResolvedValue(outputBuffer);

      // Act
      const result = await ImageProcessor.optimize(inputBuffer, {
        quality: 85,
        format: 'webp',
        maxWidth: 1200,
      });

      // Assert
      expect(result.buffer).toBe(outputBuffer);
      expect(result.originalSize).toBe(inputBuffer.length);
      expect(result.processedSize).toBe(outputBuffer.length);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle optimization errors', async () => {
      // Arrange
      const inputBuffer = Buffer.from('invalid image data');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockRejectedValue(new Error('Invalid image'));

      // Act & Assert
      await expect(ImageProcessor.optimize(inputBuffer))
        .rejects.toThrow('Image optimization failed');
    });
  });

  describe('resize', () => {
    it('should resize image successfully', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const outputBuffer = Buffer.from('resized image data');
      
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.toBuffer as jest.Mock).mockResolvedValue(outputBuffer);

      // Act
      const result = await ImageProcessor.resize(inputBuffer, 800, 600);

      // Assert
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 800,
        height: 600,
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        kernel: 'lanczos3',
        withoutEnlargement: false,
        withoutReduction: false,
      });
      expect(result).toBe(outputBuffer);
    });
  });

  describe('convert', () => {
    it('should convert image format successfully', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const outputBuffer = Buffer.from('converted image data');
      
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.toBuffer as jest.Mock).mockResolvedValue(outputBuffer);

      // Act
      const result = await ImageProcessor.convert(inputBuffer, 'webp', { quality: 90 });

      // Assert
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({
        quality: 90,
        lossless: false,
        effort: 4,
      });
      expect(result).toBe(outputBuffer);
    });

    it('should handle unsupported format', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');

      // Act & Assert
      await expect(ImageProcessor.convert(inputBuffer, 'bmp' as any))
        .rejects.toThrow('Unsupported output format: bmp');
    });
  });

  describe('getMetadata', () => {
    it('should extract image metadata successfully', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'jpeg',
        density: 72,
        hasAlpha: false,
        hasProfile: true,
        pages: 1,
      });

      // Act
      const result = await ImageProcessor.getMetadata(inputBuffer);

      // Assert
      expect(result).toEqual({
        width: 1920,
        height: 1080,
        format: 'jpeg',
        size: inputBuffer.length,
        density: 72,
        hasAlpha: false,
        hasProfile: true,
        isAnimated: false,
        pages: 1,
        exif: undefined,
        icc: undefined,
      });
    });
  });

  describe('getCapabilities', () => {
    it('should return correct capabilities', () => {
      // Act
      const capabilities = ImageProcessor.getCapabilities();

      // Assert
      expect(capabilities.formats.input).toContain('jpeg');
      expect(capabilities.formats.input).toContain('png');
      expect(capabilities.formats.input).toContain('webp');
      expect(capabilities.formats.output).toContain('jpeg');
      expect(capabilities.formats.output).toContain('webp');
      expect(capabilities.features.resize).toBe(true);
      expect(capabilities.features.animation).toBe(false);
    });
  });
});

describe('ImageValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should validate image successfully', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 800,
        height: 600,
        format: 'jpeg',
        hasAlpha: false,
        hasProfile: false,
        pages: 1,
      });

      const options = {
        maxWidth: 1000,
        maxHeight: 1000,
        maxFileSize: 1024 * 1024,
        allowedFormats: ['jpeg', 'png'],
      };

      // Act
      const result = await ImageValidator.validate(inputBuffer, options);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.width).toBe(800);
      expect(result.metadata!.height).toBe(600);
    });

    it('should fail validation for oversized image', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 2000,
        height: 1500,
        format: 'jpeg',
        hasAlpha: false,
        hasProfile: false,
        pages: 1,
      });

      const options = {
        maxWidth: 1000,
        maxHeight: 1000,
        allowedFormats: ['jpeg'],
      };

      // Act
      const result = await ImageValidator.validate(inputBuffer, options);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Image width 2000px exceeds maximum width 1000px');
      expect(result.errors).toContain('Image height 1500px exceeds maximum height 1000px');
    });

    it('should fail validation for disallowed format', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image data');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 800,
        height: 600,
        format: 'gif',
        hasAlpha: false,
        hasProfile: false,
        pages: 1,
      });

      const options = {
        allowedFormats: ['jpeg', 'png'],
      };

      // Act
      const result = await ImageValidator.validate(inputBuffer, options);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Image format 'gif' is not allowed. Allowed formats: jpeg, png");
    });

    it('should handle empty buffer', async () => {
      // Arrange
      const inputBuffer = Buffer.alloc(0);

      // Act
      const result = await ImageValidator.validate(inputBuffer);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Image buffer is empty');
    });
  });

  describe('detectFormat', () => {
    it('should detect JPEG format', () => {
      // Arrange
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);

      // Act
      const format = ImageValidator.detectFormat(jpegBuffer);

      // Assert
      expect(format).toBe('jpeg');
    });

    it('should detect PNG format', () => {
      // Arrange
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

      // Act
      const format = ImageValidator.detectFormat(pngBuffer);

      // Assert
      expect(format).toBe('png');
    });

    it('should return null for unknown format', () => {
      // Arrange
      const unknownBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);

      // Act
      const format = ImageValidator.detectFormat(unknownBuffer);

      // Assert
      expect(format).toBeNull();
    });
  });
});

describe('OptimizationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('selectOptimalStrategy', () => {
    it('should select thumbnail strategy for small images', async () => {
      // Arrange
      const inputBuffer = Buffer.from('small image');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 150,
        height: 100,
        format: 'jpeg',
      });

      // Act
      const strategy = await OptimizationManager.selectOptimalStrategy(inputBuffer);

      // Assert
      expect(strategy).toBe('thumbnail');
    });

    it('should select fast-loading strategy for mobile', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'jpeg',
      });

      // Act
      const strategy = await OptimizationManager.selectOptimalStrategy(inputBuffer, 'mobile');

      // Assert
      expect(strategy).toBe('fast-loading');
    });

    it('should select high-quality strategy for print', async () => {
      // Arrange
      const inputBuffer = Buffer.from('test image');
      const mockSharpInstance = mockSharp();
      (mockSharpInstance.metadata as jest.Mock).mockResolvedValue({
        width: 2000,
        height: 1500,
        format: 'jpeg',
      });

      // Act
      const strategy = await OptimizationManager.selectOptimalStrategy(inputBuffer, 'print');

      // Assert
      expect(strategy).toBe('high-quality');
    });
  });

  describe('getAvailableStrategies', () => {
    it('should return list of available strategies', () => {
      // Act
      const strategies = OptimizationManager.getAvailableStrategies();

      // Assert
      expect(strategies).toContain('web-optimized');
      expect(strategies).toContain('high-quality');
      expect(strategies).toContain('fast-loading');
      expect(strategies).toContain('portrait-optimized');
      expect(strategies).toContain('product-optimized');
      expect(strategies).toContain('thumbnail');
    });
  });
});