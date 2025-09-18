/**
 * BRAND PLACEMENT API TESTS - P3-C Feature
 * 
 * Tests for brand asset placement functionality
 */

import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock storage service
const mockStorage = {
  getAIImage: jest.fn(),
  getBrandAsset: jest.fn(),
  saveImageVariant: jest.fn(),
  updateImageVariant: jest.fn(),
  getImageVariant: jest.fn(),
};

// Mock auth middleware
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id' };
  next();
};

jest.mock('../../storage', () => ({
  storage: mockStorage,
}));

jest.mock('../../stack-auth', () => ({
  requireStackAuth: mockAuth,
}));

describe('Brand Placement Routes', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Set feature flag
    process.env.BRAND_ASSETS_ENABLED = '1';
    
    app = express();
    app.use(express.json());
    
    // Import and setup routes
    const brandPlacementRouter = await import('../../routes/brand-placement');
    app.use('/api/brand-assets', brandPlacementRouter.default);
  });

  afterAll(() => {
    delete process.env.BRAND_ASSETS_ENABLED;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/brand-assets/place', () => {
    const mockImage = {
      id: 1,
      userId: 'test-user-id',
      imageUrl: 'https://s3.example.com/image.jpg',
    };

    const mockAsset = {
      id: 1,
      userId: 'test-user-id',
      kind: 'logo',
      url: 'https://s3.example.com/logo.png',
      filename: 'logo.png',
    };

    beforeEach(() => {
      process.env.BRAND_ASSETS_ENABLED = '1';
      mockStorage.getAIImage.mockResolvedValue(mockImage);
      mockStorage.getBrandAsset.mockResolvedValue(mockAsset);
    });

    it('should place asset with overlay mode successfully', async () => {
      const mockVariant = {
        id: 1,
        userId: 'test-user-id',
        originalImageId: 1,
        variantUrl: '',
        variantType: 'brand_placement',
        brandAssetId: 1,
        placementData: {
          mode: 'overlay',
          position: { x: 10, y: 20, width: 100, height: 50 },
          scale: 1.0,
        },
        processingStatus: 'pending',
      };

      mockStorage.saveImageVariant.mockResolvedValue(mockVariant);

      const placementRequest = {
        imageId: 1,
        assetId: 1,
        mode: 'overlay',
        position: { x: 10, y: 20, width: 100, height: 50 },
        scale: 1.0,
      };

      const response = await request(app)
        .post('/api/brand-assets/place')
        .send(placementRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.variant.processingStatus).toBe('completed');
      expect(response.body.placementData).toBeDefined();
      expect(response.body.placementData.originalImageUrl).toBe(mockImage.imageUrl);
      expect(response.body.placementData.assetUrl).toBe(mockAsset.url);
    });

    it('should place asset with inpaint mode successfully', async () => {
      const mockVariant = {
        id: 1,
        userId: 'test-user-id',
        originalImageId: 1,
        variantUrl: '',
        variantType: 'brand_placement',
        brandAssetId: 1,
        placementData: {
          mode: 'inpaint',
          scale: 1.0,
        },
        processingStatus: 'pending',
      };

      mockStorage.saveImageVariant.mockResolvedValue(mockVariant);

      const placementRequest = {
        imageId: 1,
        assetId: 1,
        mode: 'inpaint',
        scale: 1.0,
      };

      const response = await request(app)
        .post('/api/brand-assets/place')
        .send(placementRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.variant.processingStatus).toBe('pending');
      expect(response.body.message).toContain('processing started');
    });

    it('should return 404 when image not found', async () => {
      mockStorage.getAIImage.mockResolvedValue(null);

      const placementRequest = {
        imageId: 999,
        assetId: 1,
        mode: 'overlay',
      };

      const response = await request(app)
        .post('/api/brand-assets/place')
        .send(placementRequest)
        .expect(404);

      expect(response.body.error).toBe('Image not found');
    });

    it('should return 404 when asset not found', async () => {
      mockStorage.getBrandAsset.mockResolvedValue(null);

      const placementRequest = {
        imageId: 1,
        assetId: 999,
        mode: 'overlay',
      };

      const response = await request(app)
        .post('/api/brand-assets/place')
        .send(placementRequest)
        .expect(404);

      expect(response.body.error).toBe('Brand asset not found');
    });

    it('should return 400 for invalid placement data', async () => {
      const invalidRequest = {
        imageId: 'invalid',
        assetId: 1,
        mode: 'invalid-mode',
      };

      const response = await request(app)
        .post('/api/brand-assets/place')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid placement data');
    });
  });

  describe('GET /api/brand-assets/variants/:variantId/status', () => {
    beforeEach(() => {
      process.env.BRAND_ASSETS_ENABLED = '1';
    });

    it('should get variant status successfully', async () => {
      const mockVariant = {
        id: 1,
        userId: 'test-user-id',
        processingStatus: 'completed',
        variantUrl: 'https://s3.example.com/variant.jpg',
        placementData: { mode: 'overlay' },
      };

      mockStorage.getImageVariant.mockResolvedValue(mockVariant);

      const response = await request(app)
        .get('/api/brand-assets/variants/1/status')
        .expect(200);

      expect(response.body).toEqual({
        variantId: 1,
        status: 'completed',
        variantUrl: 'https://s3.example.com/variant.jpg',
        placementData: { mode: 'overlay' },
      });
    });

    it('should return 404 for non-existent variant', async () => {
      mockStorage.getImageVariant.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/brand-assets/variants/999/status')
        .expect(404);

      expect(response.body.error).toBe('Variant not found');
    });

    it('should return 400 for invalid variant ID', async () => {
      const response = await request(app)
        .get('/api/brand-assets/variants/invalid/status')
        .expect(400);

      expect(response.body.error).toBe('Invalid variant ID');
    });
  });
});