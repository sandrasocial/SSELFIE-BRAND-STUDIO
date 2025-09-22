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
});
