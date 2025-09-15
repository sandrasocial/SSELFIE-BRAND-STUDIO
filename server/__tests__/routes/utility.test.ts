/**
 * Utility Routes Tests
 * Tests for the utility routes module
 */

import request from 'supertest';
import express from 'express';
import utilityRoutes from '../../routes/modules/utility';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Utility Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/', utilityRoutes);
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          service: 'SSELFIE Studio',
          timestamp: expect.any(String)
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          env: process.env.NODE_ENV || 'development'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /', () => {
    it('should return API name', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('SSELFIE Studio API');
    });
  });

  describe('GET /training-zip/:filename', () => {
    it('should download file when it exists', async () => {
      const filename = 'test-training.zip';
      const filePath = path.join(process.cwd(), 'training-zips', filename);
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.createReadStream.mockReturnValue({
        pipe: jest.fn(),
        on: jest.fn()
      } as any);

      const response = await request(app)
        .get(`/training-zip/${filename}`)
        .expect(200);

      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.createReadStream).toHaveBeenCalledWith(filePath);
    });

    it('should return 404 when file does not exist', async () => {
      const filename = 'nonexistent.zip';
      
      mockFs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get(`/training-zip/${filename}`)
        .expect(404);

      expect(response.body).toEqual({});
    });
  });
});
