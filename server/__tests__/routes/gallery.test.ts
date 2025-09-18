/**
 * Gallery Routes Tests
 * Tests for the gallery routes module
 */

import request from 'supertest';
import express from 'express';
import galleryRoutes from '../../routes/modules/gallery';
import { errorHandler } from '../../routes/middleware/error-handler';

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getAIImageById: jest.fn(),
    getImageVariant: jest.fn(),
    createImageVariant: jest.fn(),
  }
}));

// Mock the upscale config
jest.mock('../../config/upscale', () => ({
  isUpscalingEnabled: jest.fn(),
  getUpscaleProvider: jest.fn(),
  getProviderConfig: jest.fn()
}));

// Mock the upscale services
jest.mock('../../services/upscale/real_esrgan', () => ({
  upscaleImageWithRealESRGAN: jest.fn()
}));

describe('Gallery Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', galleryRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('GET /api/gallery', () => {
    it('should get user gallery images', async () => {
      const response = await request(app)
        .get('/api/gallery')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Gallery endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/gallery/upload', () => {
    it('should upload image to gallery', async () => {
      const response = await request(app)
        .post('/api/gallery/upload')
        .send({ imageUrl: 'https://example.com/image.jpg' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Gallery upload endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('DELETE /api/gallery/:imageId', () => {
    it('should delete image from gallery', async () => {
      const response = await request(app)
        .delete('/api/gallery/image123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Gallery delete endpoint (placeholder)',
          imageId: 'image123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/gallery/:imageId', () => {
    it('should get specific gallery image', async () => {
      const response = await request(app)
        .get('/api/gallery/image123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Gallery image details endpoint (placeholder)',
          imageId: 'image123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/upscale', () => {
    const mockStorage = require('../../storage').storage;
    const mockUpscaleConfig = require('../../config/upscale');
    const mockRealESRGAN = require('../../services/upscale/real_esrgan');

    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();
    });

    it('should return 501 when upscaling is not configured', async () => {
      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(false);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(501);

      expect(response.body.error).toBe('Upscaling not configured');
    });

    it('should return 400 when imageId is missing', async () => {
      const response = await request(app)
        .post('/api/upscale')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 404 when image is not found', async () => {
      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(true);
      mockStorage.getAIImageById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(404);

      expect(response.body.error).toBe('Image not found');
    });

    it('should return existing variant if already exists', async () => {
      const mockImage = { id: 123, imageUrl: 'https://example.com/image.jpg' };
      const mockVariant = { 
        id: 1, 
        url: 'https://example.com/hd-image.jpg', 
        width: 1024, 
        height: 1024 
      };

      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(true);
      mockStorage.getAIImageById.mockResolvedValue(mockImage);
      mockStorage.getImageVariant.mockResolvedValue(mockVariant);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(200);

      expect(response.body.data.cached).toBe(true);
      expect(response.body.data.url).toBe(mockVariant.url);
    });

    it('should successfully upscale image with Real-ESRGAN', async () => {
      const mockImage = { id: 123, imageUrl: 'https://example.com/image.jpg' };
      const mockUpscaleResult = {
        url: 'https://example.com/hd-image.jpg',
        width: 1024,
        height: 1024,
        provider: 'real_esrgan',
        scale: 2
      };
      const mockVariant = { id: 1, ...mockUpscaleResult };

      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(true);
      mockUpscaleConfig.getUpscaleProvider.mockReturnValue('real_esrgan');
      mockUpscaleConfig.getProviderConfig.mockReturnValue({ defaultScale: 2 });
      mockStorage.getAIImageById.mockResolvedValue(mockImage);
      mockStorage.getImageVariant.mockResolvedValue(null);
      mockRealESRGAN.upscaleImageWithRealESRGAN.mockResolvedValue(mockUpscaleResult);
      mockStorage.createImageVariant.mockResolvedValue(mockVariant);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe(mockUpscaleResult.url);
      expect(response.body.data.provider).toBe('real_esrgan');
      expect(mockRealESRGAN.upscaleImageWithRealESRGAN).toHaveBeenCalledWith(
        mockImage.imageUrl, 
        2
      );
    });

    it('should handle upscaling service errors', async () => {
      const mockImage = { id: 123, imageUrl: 'https://example.com/image.jpg' };
      const mockError = { error: 'Upscaling failed', details: 'Service unavailable' };

      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(true);
      mockUpscaleConfig.getUpscaleProvider.mockReturnValue('real_esrgan');
      mockUpscaleConfig.getProviderConfig.mockReturnValue({ defaultScale: 2 });
      mockStorage.getAIImageById.mockResolvedValue(mockImage);
      mockStorage.getImageVariant.mockResolvedValue(null);
      mockRealESRGAN.upscaleImageWithRealESRGAN.mockResolvedValue(mockError);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(500);

      expect(response.body.error).toBe('Upscaling failed');
      expect(response.body.message).toBe(mockError.error);
    });

    it('should return 501 for unsupported provider', async () => {
      const mockImage = { id: 123, imageUrl: 'https://example.com/image.jpg' };

      mockUpscaleConfig.isUpscalingEnabled.mockReturnValue(true);
      mockUpscaleConfig.getUpscaleProvider.mockReturnValue('unsupported_provider');
      mockStorage.getAIImageById.mockResolvedValue(mockImage);
      mockStorage.getImageVariant.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/upscale')
        .send({ imageId: '123' })
        .expect(501);

      expect(response.body.error).toBe('Unsupported provider');
    });
  });
});
