// Test for Enhanced Image Processing Service
// Basic validation tests for the new training infrastructure

import { ImageProcessingService } from '../imageProcessing.js';
import { DEFAULT_VALIDATION_RULES, DEFAULT_IMAGE_PROCESSING_OPTIONS } from '../../types/training.js';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(() => {
    service = ImageProcessingService.getInstance();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('validateImages', () => {
    it('should validate file count', () => {
      const mockFiles: File[] = [];
      
      // Create mock files - fewer than minimum
      for (let i = 0; i < 5; i++) {
        const mockFile = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' });
        Object.defineProperty(mockFile, 'size', { value: 1024 * 100 }); // 100KB
        mockFiles.push(mockFile);
      }

      const errors = service.validateImages(mockFiles, DEFAULT_VALIDATION_RULES);

      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('validation');
      expect(errors[0].code).toBe('INSUFFICIENT_IMAGES');
      expect(errors[0].recoverable).toBe(true);
    });

    it('should validate file types', () => {
      const mockFiles: File[] = [];
      
      // Create valid files
      for (let i = 0; i < 10; i++) {
        const mockFile = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' });
        Object.defineProperty(mockFile, 'size', { value: 1024 * 100 }); // 100KB
        mockFiles.push(mockFile);
      }

      // Add invalid file type
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(invalidFile, 'size', { value: 1024 * 100 });
      mockFiles.push(invalidFile);

      const errors = service.validateImages(mockFiles, DEFAULT_VALIDATION_RULES);

      expect(errors.length).toBeGreaterThan(0);
      const typeError = errors.find(e => e.code === 'INVALID_FILE_TYPE');
      expect(typeError).toBeDefined();
      expect(typeError?.message).toContain('Invalid file type');
    });

    it('should validate file sizes', () => {
      const mockFiles: File[] = [];
      
      // Create files that are too large
      for (let i = 0; i < 10; i++) {
        const mockFile = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' });
        Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB - too large
        mockFiles.push(mockFile);
      }

      const errors = service.validateImages(mockFiles, DEFAULT_VALIDATION_RULES);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find(e => e.code === 'FILE_TOO_LARGE');
      expect(sizeError).toBeDefined();
      expect(sizeError?.message).toContain('File too large');
    });

    it('should pass with valid files', () => {
      const mockFiles: File[] = [];
      
      // Create valid files
      for (let i = 0; i < 12; i++) {
        const mockFile = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' });
        Object.defineProperty(mockFile, 'size', { value: 512 * 1024 }); // 512KB - valid size
        mockFiles.push(mockFile);
      }

      const errors = service.validateImages(mockFiles, DEFAULT_VALIDATION_RULES);

      expect(errors).toHaveLength(0);
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = ImageProcessingService.getInstance();
      const instance2 = ImageProcessingService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('configuration', () => {
    it('should use default options correctly', () => {
      expect(DEFAULT_IMAGE_PROCESSING_OPTIONS.maxWidth).toBe(1024);
      expect(DEFAULT_IMAGE_PROCESSING_OPTIONS.maxHeight).toBe(1024);
      expect(DEFAULT_IMAGE_PROCESSING_OPTIONS.quality).toBe(0.8);
      expect(DEFAULT_IMAGE_PROCESSING_OPTIONS.format).toBe('jpeg');
    });

    it('should use default validation rules correctly', () => {
      expect(DEFAULT_VALIDATION_RULES.minImages).toBe(10);
      expect(DEFAULT_VALIDATION_RULES.maxImages).toBe(20);
      expect(DEFAULT_VALIDATION_RULES.minFileSize).toBe(50 * 1024); // 50KB
      expect(DEFAULT_VALIDATION_RULES.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
    });
  });
});

// Mock File constructor for Node.js testing environment
if (typeof File === 'undefined') {
  global.File = class File {
    name: string;
    type: string;
    size: number;

    constructor(chunks: any[], filename: string, options: any = {}) {
      this.name = filename;
      this.type = options.type || '';
      this.size = options.size || 0;
    }
  } as any;
}