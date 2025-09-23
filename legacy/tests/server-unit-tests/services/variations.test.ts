/**
 * Image Variations Service Tests
 */

import { ImageVariationsService } from '../../services/images/variations';

// Mock dependencies
jest.mock('../../storage');
jest.mock('../../model-training-service');

describe('ImageVariationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVariations', () => {
    it('should validate request parameters', async () => {
      const request = {
        originalImageId: 1,
        originalImageType: 'ai_image' as const,
        userId: 'user123',
        count: 3
      };

      // Mock storage to return no image
      const { storage } = require('../../storage');
      storage.getAIImages.mockResolvedValue([]);
      storage.getGeneratedImages.mockResolvedValue([]);

      const result = await ImageVariationsService.generateVariations(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Original image not found');
    });

    it('should generate variations for valid image', async () => {
      const request = {
        originalImageId: 1,
        originalImageType: 'ai_image' as const,
        userId: 'user123',
        count: 3
      };

      // Mock storage and services
      const { storage } = require('../../storage');
      const { ModelTrainingService } = require('../../model-training-service');

      storage.getAIImages.mockResolvedValue([{
        id: 1,
        userId: 'user123',
        imageUrl: 'http://example.com/image.jpg',
        prompt: 'test prompt'
      }]);

      storage.createImageVariant.mockImplementation(() => Promise.resolve(Math.floor(Math.random() * 1000)));
      storage.updateImageVariant.mockResolvedValue({});

      ModelTrainingService.generateUserImages.mockResolvedValue({
        predictionId: 'prediction123',
        images: []
      });

      const result = await ImageVariationsService.generateVariations(request);

      expect(result.success).toBe(true);
      expect(result.predictionId).toBe('prediction123');
      expect(result.variantIds).toHaveLength(3);
    });
  });

  describe('generateVariationPrompts', () => {
    it('should create diverse variation prompts', () => {
      const basePrompt = 'professional portrait';
      const count = 3;

      // Access private method for testing
      const prompts = (ImageVariationsService as any).generateVariationPrompts(basePrompt, count);

      expect(prompts).toHaveLength(count);
      expect(prompts.every(prompt => prompt.includes('professional portrait'))).toBe(true);
      expect(prompts.every(prompt => prompt.includes('lighting'))).toBe(true);
    });
  });
});
