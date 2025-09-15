/**
 * Websites Routes Tests
 * Tests for the websites routes module
 */

import request from 'supertest';
import express from 'express';
import websitesRoutes from '../../routes/modules/websites';
import { errorHandler } from '../../routes/middleware/error-handler';

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

describe('Websites Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', websitesRoutes);
    app.use(errorHandler); // Add error handling middleware
    jest.clearAllMocks();
  });

  describe('GET /api/websites', () => {
    it('should return user websites', async () => {
      const response = await request(app)
        .get('/api/websites')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          websites: [],
          count: 0
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/websites', () => {
    it('should create website successfully', async () => {
      const websiteData = {
        name: 'My Website',
        url: 'https://example.com',
        description: 'A test website'
      };

      const response = await request(app)
        .post('/api/websites')
        .send(websiteData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Website created successfully',
          website: {
            id: expect.stringMatching(/^website_\d+$/),
            name: 'My Website',
            url: 'https://example.com',
            description: 'A test website',
            userId: 'test-user-123'
          }
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/websites')
        .send({ url: 'https://example.com' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Name and URL are required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .post('/api/websites')
        .send({ name: 'My Website' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Name and URL are required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('PUT /api/websites/:id', () => {
    it('should update website successfully', async () => {
      const updates = {
        name: 'Updated Website',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/websites/website123')
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Website updated successfully',
          websiteId: 'website123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('DELETE /api/websites/:id', () => {
    it('should delete website successfully', async () => {
      const response = await request(app)
        .delete('/api/websites/website123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Website deleted successfully',
          websiteId: 'website123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/websites/:id/refresh-screenshot', () => {
    it('should refresh website screenshot', async () => {
      const response = await request(app)
        .post('/api/websites/website123/refresh-screenshot')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Screenshot refresh initiated',
          websiteId: 'website123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/save-brand-assessment', () => {
    it('should save brand assessment successfully', async () => {
      const assessmentData = {
        brandName: 'Test Brand',
        industry: 'Technology',
        values: ['Innovation', 'Quality']
      };

      const response = await request(app)
        .post('/api/save-brand-assessment')
        .send(assessmentData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Brand assessment saved successfully',
          assessmentId: expect.stringMatching(/^assessment_\d+$/)
        },
        timestamp: expect.any(String)
      });
    });
  });
});
