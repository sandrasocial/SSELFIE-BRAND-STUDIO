/**
 * Inpainting Routes Tests
 */

import request from 'supertest';
import express from 'express';
import inpaintRoutes from '../../routes/inpaint';

// Mock dependencies
jest.mock('../../routes/middleware/auth');
jest.mock('../../services/inpaint/sd_inpaint');
jest.mock('../../storage');

const app = express();
app.use(express.json());
app.use('/', inpaintRoutes);

// Mock auth middleware
const { requireStackAuth } = require('../../routes/middleware/auth');
requireStackAuth.mockImplementation((req, res, next) => {
  req.user = { id: 'test-user-123' };
  next();
});

describe('Inpainting Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/inpaint', () => {
    it('should validate required parameters', async () => {
      const response = await request(app)
        .post('/api/inpaint')
        .send({
          imageId: 1,
          // Missing maskPng and prompt
        });

      expect(response.status).toBe(400);
    });

    it('should start inpainting with valid parameters', async () => {
      const { SDInpaintService } = require('../../services/inpaint/sd_inpaint');
      const { storage } = require('../../storage');

      // Mock successful flow
      storage.getAIImages.mockResolvedValue([{
        id: 1,
        userId: 'test-user-123',
        imageUrl: 'http://example.com/image.jpg'
      }]);

      SDInpaintService.startInpainting.mockResolvedValue({
        success: true,
        predictionId: 'prediction123',
        variantId: 1
      });

      const response = await request(app)
        .post('/api/inpaint')
        .send({
          imageId: 1,
          maskPng: 'base64-mask-data',
          prompt: 'fix the background'
        });

      expect(response.status).toBe(202);
      expect(response.body.data).toMatchObject({
        predictionId: 'prediction123',
        variantId: 1,
        status: 'processing'
      });
    });
  });

  describe('GET /api/inpaint/:predictionId/status', () => {
    it('should require variantId parameter', async () => {
      const response = await request(app)
        .get('/api/inpaint/prediction123/status');

      expect(response.status).toBe(400);
    });

    it('should return status for valid prediction', async () => {
      const { SDInpaintService } = require('../../services/inpaint/sd_inpaint');

      SDInpaintService.checkInpaintStatus.mockResolvedValue({
        status: 'completed',
        imageUrl: 'http://example.com/result.jpg'
      });

      const response = await request(app)
        .get('/api/inpaint/prediction123/status?variantId=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        status: 'completed',
        imageUrl: 'http://example.com/result.jpg'
      });
    });
  });
});
