/**
 * BRAND ASSETS API TESTS - P3-C Feature
 * 
 * Tests for brand assets upload, list, and delete functionality
 */

import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock storage service
const mockStorage = {
  getBrandAssets: jest.fn(),
  saveBrandAsset: jest.fn(),
  deleteBrandAsset: jest.fn(),
  getBrandAsset: jest.fn(),
};

// Mock auth middleware
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id' };
  next();
};

// Mock multer
jest.mock('multer', () => {
  return jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        buffer: Buffer.from('test-image-data'),
        originalname: 'test-logo.png',
        mimetype: 'image/png',
        size: 1024,
      };
      next();
    }),
  }));
});

// Mock BulletproofUploadService
const mockUploadService = {
  uploadToS3: jest.fn(),
};

jest.mock('../../bulletproof-upload-service', () => ({
  BulletproofUploadService: mockUploadService,
}));

jest.mock('../../storage', () => ({
  storage: mockStorage,
}));

jest.mock('../../stack-auth', () => ({
  requireStackAuth: mockAuth,
}));

describe('Brand Assets Routes', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Set feature flag
    process.env.BRAND_ASSETS_ENABLED = '1';
    
    app = express();
    app.use(express.json());
    
    // Import and setup routes
    const brandAssetsRouter = await import('../../routes/brand-assets');
    app.use('/api/brand-assets', brandAssetsRouter.default);
  });

  afterAll(() => {
    delete process.env.BRAND_ASSETS_ENABLED;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/brand-assets', () => {
    it('should list user brand assets successfully', async () => {
      const mockAssets = [
        {
          id: 1,
          userId: 'test-user-id',
          kind: 'logo',
          url: 'https://s3.example.com/logo.png',
          filename: 'logo.png',
          createdAt: new Date().toISOString(),
        },
      ];

      mockStorage.getBrandAssets.mockResolvedValue(mockAssets);

      const response = await request(app)
        .get('/api/brand-assets')
        .expect(200);

      expect(response.body).toEqual({ assets: mockAssets });
      expect(mockStorage.getBrandAssets).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 404 when feature flag is disabled', async () => {
      delete process.env.BRAND_ASSETS_ENABLED;

      const response = await request(app)
        .get('/api/brand-assets')
        .expect(404);

      expect(response.body).toEqual({ error: 'Feature not available' });
    });
  });

  describe('POST /api/brand-assets', () => {
    beforeEach(() => {
      process.env.BRAND_ASSETS_ENABLED = '1';
    });

    it('should upload brand asset successfully', async () => {
      const mockS3Url = 'https://s3.example.com/brand-assets/test-user-id/1234567890-test-logo.png';
      const mockSavedAsset = {
        id: 1,
        userId: 'test-user-id',
        kind: 'logo',
        url: mockS3Url,
        filename: 'test-logo.png',
        fileSize: 1024,
        meta: { contentType: 'image/png', originalName: 'test-logo.png' },
        createdAt: new Date().toISOString(),
      };

      mockUploadService.uploadToS3.mockResolvedValue({
        success: true,
        s3Url: mockS3Url,
      });

      mockStorage.saveBrandAsset.mockResolvedValue(mockSavedAsset);

      const response = await request(app)
        .post('/api/brand-assets')
        .field('kind', 'logo')
        .attach('asset', Buffer.from('test-image-data'), 'test-logo.png')
        .expect(200);

      expect(response.body).toEqual({ asset: mockSavedAsset });
      expect(mockUploadService.uploadToS3).toHaveBeenCalled();
      expect(mockStorage.saveBrandAsset).toHaveBeenCalled();
    });

    it('should return 400 for invalid kind', async () => {
      const response = await request(app)
        .post('/api/brand-assets')
        .field('kind', 'invalid')
        .attach('asset', Buffer.from('test-image-data'), 'test.png')
        .expect(400);

      expect(response.body.error).toContain('Invalid kind');
    });

    it('should return 400 when no file is uploaded', async () => {
      // Mock no file
      jest.doMock('multer', () => {
        return jest.fn(() => ({
          single: jest.fn(() => (req: any, res: any, next: any) => {
            req.file = null;
            next();
          }),
        }));
      });

      const response = await request(app)
        .post('/api/brand-assets')
        .field('kind', 'logo')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('DELETE /api/brand-assets/:assetId', () => {
    beforeEach(() => {
      process.env.BRAND_ASSETS_ENABLED = '1';
    });

    it('should delete brand asset successfully', async () => {
      const mockAsset = {
        id: 1,
        userId: 'test-user-id',
        kind: 'logo',
        url: 'https://s3.example.com/logo.png',
        filename: 'logo.png',
      };

      mockStorage.getBrandAsset.mockResolvedValue(mockAsset);
      mockStorage.deleteBrandAsset.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/brand-assets/1')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(mockStorage.getBrandAsset).toHaveBeenCalledWith(1, 'test-user-id');
      expect(mockStorage.deleteBrandAsset).toHaveBeenCalledWith(1, 'test-user-id');
    });

    it('should return 404 for non-existent asset', async () => {
      mockStorage.getBrandAsset.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/brand-assets/999')
        .expect(404);

      expect(response.body.error).toBe('Asset not found');
    });

    it('should return 400 for invalid asset ID', async () => {
      const response = await request(app)
        .delete('/api/brand-assets/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid asset ID');
    });
  });
});