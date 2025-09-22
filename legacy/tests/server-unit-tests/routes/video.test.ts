/**
 * Video Routes Tests
 * Tests for the VEO 3 video generation routes
 */

import request from 'supertest';
import express from 'express';
import videoRoutes from '../../routes/video';
import * as veo3Service from '../../services/video/veo3';
import { db } from '../../drizzle';
import { generatedVideos, generatedImages, aiImages } from '../../../shared/schema';

// Mock the VEO 3 service
jest.mock('../../services/video/veo3');
const mockVeo3Service = veo3Service as jest.Mocked<typeof veo3Service>;

// Mock the database
jest.mock('../../drizzle', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn()
  }
}));
const mockDb = db as jest.Mocked<typeof db>;

// Mock Stack Auth middleware
jest.mock('../../stack-auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123' };
    next();
  }
}));

describe('Video Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/video', videoRoutes);
    
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.VEO3_ENABLED = '1';
    process.env.GOOGLE_API_KEY = 'test-google-api-key';
  });

  afterEach(() => {
    delete process.env.VEO3_ENABLED;
    delete process.env.GOOGLE_API_KEY;
  });

  describe('POST /api/video/generate', () => {
    const validPayload = {
      motionPrompt: 'A person walking through a beautiful garden',
      mode: 'preview',
      aspectRatio: '9:16'
    };

    test('should generate video successfully without image', async () => {
      const mockJobResult = {
        jobId: 'operations/test-job-123',
        provider: 'google' as const,
        estimatedTime: '30-90 seconds'
      };

      const mockVideoRecord = {
        id: 1,
        userId: 'test-user-123',
        jobId: 'operations/test-job-123'
      };

      mockVeo3Service.generateVeo3Video.mockResolvedValue(mockJobResult);
      mockVeo3Service.getQualityPreset.mockReturnValue({
        maxDurationSeconds: 5,
        resolution: '720p',
        steps: 20,
        description: 'Fast preview generation'
      });

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockVideoRecord])
        })
      });

      const response = await request(app)
        .post('/api/video/generate')
        .send(validPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        jobId: 'operations/test-job-123',
        videoId: 1,
        provider: 'google',
        estimatedTime: '30-90 seconds',
        mode: 'preview',
        qualityPreset: expect.objectContaining({
          maxDurationSeconds: 5,
          resolution: '720p'
        })
      });

      expect(mockVeo3Service.generateVeo3Video).toHaveBeenCalledWith({
        motionPrompt: 'A person walking through a beautiful garden',
        mode: 'preview',
        audioScript: undefined,
        initImageUrl: undefined,
        userId: 'test-user-123',
        aspectRatio: '9:16'
      });
    });

    test('should generate video with init image', async () => {
      const payloadWithImage = {
        ...validPayload,
        imageId: '123'
      };

      const mockImageRecord = {
        id: 123,
        userId: 'test-user-123',
        selectedUrl: 'https://example.com/image.jpg'
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockImageRecord])
          })
        })
      });

      mockVeo3Service.generateVeo3Video.mockResolvedValue({
        jobId: 'operations/test-job-123',
        provider: 'google',
        estimatedTime: '30-90 seconds'
      });

      mockVeo3Service.getQualityPreset.mockReturnValue({
        maxDurationSeconds: 5,
        resolution: '720p',
        steps: 20,
        description: 'Fast preview generation'
      });

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1 }])
        })
      });

      await request(app)
        .post('/api/video/generate')
        .send(payloadWithImage)
        .expect(200);

      expect(mockVeo3Service.generateVeo3Video).toHaveBeenCalledWith(
        expect.objectContaining({
          initImageUrl: 'https://example.com/image.jpg'
        })
      );
    });

    test('should return error if VEO3 is disabled', async () => {
      delete process.env.VEO3_ENABLED;

      const response = await request(app)
        .post('/api/video/generate')
        .send(validPayload)
        .expect(503);

      expect(response.body).toMatchObject({
        error: 'VEO 3 video generation is not enabled',
        details: 'Contact support for access to video generation features'
      });
    });

    test('should return error if Google API key is missing', async () => {
      delete process.env.GOOGLE_API_KEY;

      const response = await request(app)
        .post('/api/video/generate')
        .send(validPayload)
        .expect(503);

      expect(response.body).toMatchObject({
        error: 'Video generation service not configured',
        details: 'Google API key not available'
      });
    });

    test('should validate motion prompt', async () => {
      const invalidPayload = {
        ...validPayload,
        motionPrompt: 'short'
      };

      const response = await request(app)
        .post('/api/video/generate')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toBe('motionPrompt must be at least 8 characters long');
    });

    test('should validate generation mode', async () => {
      const invalidPayload = {
        ...validPayload,
        mode: 'invalid-mode'
      };

      const response = await request(app)
        .post('/api/video/generate')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toBe('mode must be either "preview" or "production"');
    });

    test('should validate aspect ratio', async () => {
      const invalidPayload = {
        ...validPayload,
        aspectRatio: '4:3'
      };

      const response = await request(app)
        .post('/api/video/generate')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toBe('aspectRatio must be "16:9", "9:16", or "1:1"');
    });

    test('should return 404 for non-existent image', async () => {
      const payloadWithInvalidImage = {
        ...validPayload,
        imageId: '999'
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      const response = await request(app)
        .post('/api/video/generate')
        .send(payloadWithInvalidImage)
        .expect(404);

      expect(response.body.error).toBe('Image not found or access denied');
    });

    test('should handle VEO service errors', async () => {
      mockVeo3Service.generateVeo3Video.mockRejectedValue(new Error('VEO API error'));

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1 }])
        })
      });

      const response = await request(app)
        .post('/api/video/generate')
        .send(validPayload)
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Video generation failed',
        details: 'VEO API error'
      });
    });
  });

  describe('GET /api/video/status/:jobId', () => {
    test('should return job status successfully', async () => {
      const mockJobId = 'operations/test-job-123';
      const mockVideoRecord = {
        id: 1,
        jobId: mockJobId,
        userId: 'test-user-123',
        status: 'processing',
        progress: 50
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockVideoRecord])
          })
        })
      });

      mockVeo3Service.getVeo3Status.mockResolvedValue({
        status: 'processing',
        progress: 75,
        estimatedTime: '1-2 minutes remaining'
      });

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({})
        })
      });

      const response = await request(app)
        .get(`/api/video/status/${mockJobId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'processing',
        progress: 75,
        estimatedTime: '1-2 minutes remaining',
        videoId: 1,
        createdAt: mockVideoRecord.createdAt,
        imageId: mockVideoRecord.imageId
      });
    });

    test('should return 404 for non-existent job', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      const response = await request(app)
        .get('/api/video/status/non-existent-job')
        .expect(404);

      expect(response.body.error).toBe('Video job not found or access denied');
    });
  });

  describe('GET /api/video/history', () => {
    test('should return user video history', async () => {
      const mockVideos = [
        {
          id: 1,
          imageId: 123,
          motionPrompt: 'Test prompt 1',
          status: 'completed',
          progress: 100,
          videoUrl: 'https://example.com/video1.mp4',
          createdAt: new Date('2025-01-01')
        },
        {
          id: 2,
          imageId: null,
          motionPrompt: 'Test prompt 2',
          status: 'processing',
          progress: 50,
          videoUrl: null,
          createdAt: new Date('2025-01-02')
        }
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(mockVideos)
              })
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/video/history')
        .expect(200);

      expect(response.body).toMatchObject({
        videos: [
          {
            id: 1,
            imageId: 123,
            motionPrompt: 'Test prompt 1',
            status: 'completed',
            progress: 100,
            videoUrl: 'https://example.com/video1.mp4'
          },
          {
            id: 2,
            imageId: null,
            motionPrompt: 'Test prompt 2',
            status: 'processing',
            progress: 50,
            videoUrl: null
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          hasMore: false
        }
      });
    });
  });

  describe('POST /api/video/save', () => {
    test('should save video successfully', async () => {
      const mockVideoRecord = {
        id: 1,
        userId: 'test-user-123',
        status: 'completed',
        videoUrl: 'https://example.com/video.mp4'
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockVideoRecord])
          })
        })
      });

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({})
        })
      });

      const response = await request(app)
        .post('/api/video/save')
        .send({ videoId: 1 })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Video saved to your collection'
      });
    });

    test('should return error for incomplete video', async () => {
      const mockVideoRecord = {
        id: 1,
        userId: 'test-user-123',
        status: 'processing',
        videoUrl: null
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockVideoRecord])
          })
        })
      });

      const response = await request(app)
        .post('/api/video/save')
        .send({ videoId: 1 })
        .expect(400);

      expect(response.body.error).toBe('Video is not ready to be saved');
    });
  });

  describe('GET /api/video/presets', () => {
    test('should return quality presets', async () => {
      mockVeo3Service.getQualityPreset
        .mockReturnValueOnce({
          maxDurationSeconds: 5,
          resolution: '720p',
          steps: 20,
          description: 'Fast preview generation'
        })
        .mockReturnValueOnce({
          maxDurationSeconds: 30,
          resolution: '1080p',
          steps: 50,
          description: 'High-quality production video'
        });

      const response = await request(app)
        .get('/api/video/presets')
        .expect(200);

      expect(response.body).toMatchObject({
        presets: {
          preview: {
            maxDurationSeconds: 5,
            resolution: '720p',
            steps: 20,
            description: 'Fast preview generation'
          },
          production: {
            maxDurationSeconds: 30,
            resolution: '1080p',
            steps: 50,
            description: 'High-quality production video'
          }
        }
      });
    });
  });
});