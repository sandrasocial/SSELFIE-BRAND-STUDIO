/**
 * Tests for Video Storyboard API Routes
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.mock('../stack-auth.js', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test_user_123' };
    next();
  }
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateVideos: jest.fn()
    }
  })),
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    INTEGER: 'integer'
  }
}));

jest.mock('../drizzle', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue({})
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })
    })
  }
}));

jest.mock('../../shared/schema', () => ({
  videoStoryboards: {},
  generatedImages: {},
  aiImages: {}
}));

jest.mock('../storage', () => ({
  storage: {
    getUserProfile: jest.fn()
  }
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

const { GoogleGenAI } = require('@google/genai');
const mockDb = require('../drizzle').db;
const mockStorage = require('../storage').storage;

// Set environment variables for tests
process.env.STORYBOARD_ENABLED = '1';
process.env.GOOGLE_API_KEY = 'test_api_key';

describe('Video Storyboard Routes', () => {
  let app: express.Application;
  let mockAI: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Setup mock AI
    mockAI = {
      models: {
        generateVideos: jest.fn()
      }
    };
    
    (GoogleGenAI as jest.Mock).mockReturnValue(mockAI);

    // Import and setup router after mocks are established
    const storyboardRouter = (await import('../video_storyboard')).default;
    
    app = express();
    app.use(express.json());
    app.use('/api/video', storyboardRouter);
  });

  describe('POST /api/video/storyboard', () => {
    const validPayload = {
      scenes: [
        { motionPrompt: 'Slow zoom in on subject', duration: 5 },
        { motionPrompt: 'Gentle pan left revealing scene', duration: 4 }
      ],
      mode: 'sequential'
    };

    it('should create storyboard successfully', async () => {
      mockAI.models.generateVideos.mockResolvedValue({
        name: 'mock_operation_123'
      });

      mockStorage.getUserProfile.mockResolvedValue({
        replicateModelId: 'user_lora_model'
      });

      const response = await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.storyboardId).toMatch(/^storyboard_/);
      expect(response.body.sceneCount).toBe(2);
      expect(response.body.scenesStarted).toBe(2);
      expect(response.body.scenesFailed).toBe(0);
    });

    it('should reject when feature is disabled', async () => {
      process.env.STORYBOARD_ENABLED = '0';

      // Re-import to get updated env check
      delete require.cache[require.resolve('../video_storyboard')];
      const storyboardRouter = (await import('../video_storyboard')).default;
      
      app = express();
      app.use(express.json());
      app.use('/api/video', storyboardRouter);

      await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(403);

      // Reset for other tests
      process.env.STORYBOARD_ENABLED = '1';
    });

    it('should validate minimum scene count', async () => {
      const invalidPayload = {
        scenes: [
          { motionPrompt: 'Single scene', duration: 5 }
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(invalidPayload)
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('2-3 scenes');
        });
    });

    it('should validate maximum scene count', async () => {
      const invalidPayload = {
        scenes: [
          { motionPrompt: 'Scene 1', duration: 5 },
          { motionPrompt: 'Scene 2', duration: 5 },
          { motionPrompt: 'Scene 3', duration: 5 },
          { motionPrompt: 'Scene 4', duration: 5 }
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(invalidPayload)
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('2-3 scenes');
        });
    });

    it('should validate scene motion prompts', async () => {
      const invalidPayload = {
        scenes: [
          { motionPrompt: 'Short', duration: 5 }, // Too short
          { motionPrompt: 'Valid motion prompt here', duration: 5 }
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(invalidPayload)
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('too short');
        });
    });

    it('should validate scene durations', async () => {
      const invalidPayload = {
        scenes: [
          { motionPrompt: 'Valid motion prompt', duration: 0 }, // Too short
          { motionPrompt: 'Another valid prompt', duration: 15 } // Too long
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(invalidPayload)
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('1-12 seconds');
        });
    });

    it('should handle missing scenes array', async () => {
      const invalidPayload = {
        mode: 'sequential'
        // No scenes
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(invalidPayload)
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('scenes array is required');
        });
    });

    it('should handle AI service failures', async () => {
      mockAI.models.generateVideos.mockRejectedValue(new Error('API rate limit exceeded'));

      await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(500);
    });

    it('should handle partial scene failures', async () => {
      // First scene succeeds, second fails
      mockAI.models.generateVideos
        .mockResolvedValueOnce({ name: 'operation_1' })
        .mockRejectedValueOnce(new Error('Scene generation failed'));

      mockStorage.getUserProfile.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(200);

      expect(response.body.scenesStarted).toBe(1);
      expect(response.body.scenesFailed).toBe(1);
      expect(response.body.status).toBe('partial');
    });

    it('should include source image when imageId provided', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 123,
              userId: 'test_user_123',
              imageUrl: 'https://example.com/image.jpg'
            }])
          })
        })
      });

      mockAI.models.generateVideos.mockResolvedValue({
        name: 'mock_operation_123'
      });

      const payloadWithImage = {
        ...validPayload,
        imageId: 123
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(payloadWithImage)
        .expect(200);

      // Verify that generateVideos was called with image data
      expect(mockAI.models.generateVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          image: expect.objectContaining({
            imageUrl: 'https://example.com/image.jpg'
          })
        })
      );
    });

    it('should store storyboard record in database', async () => {
      mockAI.models.generateVideos.mockResolvedValue({
        name: 'mock_operation_123'
      });

      await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(200);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.insert().values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test_user_123',
          scenes: expect.any(String),
          mode: 'sequential',
          status: 'pending',
          progress: 0,
          jobId: expect.stringMatching(/^storyboard_/)
        })
      );
    });
  });

  describe('GET /api/video/storyboard/:storyboardId', () => {
    it('should return storyboard status', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              jobId: 'storyboard_123',
              userId: 'test_user_123',
              status: 'pending',
              progress: 0,
              scenes: JSON.stringify([
                { motionPrompt: 'Test motion', duration: 5 }
              ]),
              updatedAt: new Date()
            }])
          })
        })
      });

      const response = await request(app)
        .get('/api/video/storyboard/storyboard_123')
        .expect(200);

      expect(response.body.storyboardId).toBe('storyboard_123');
      expect(response.body.status).toBe('pending');
      expect(response.body.scenes).toHaveLength(1);
    });

    it('should return 404 for non-existent storyboard', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]) // No results
          })
        })
      });

      await request(app)
        .get('/api/video/storyboard/nonexistent')
        .expect(404)
        .expect(res => {
          expect(res.body.error).toBe('Storyboard not found');
        });
    });

    it('should return 403 for unauthorized access', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              jobId: 'storyboard_123',
              userId: 'different_user', // Different user
              status: 'pending'
            }])
          })
        })
      });

      await request(app)
        .get('/api/video/storyboard/storyboard_123')
        .expect(403)
        .expect(res => {
          expect(res.body.error).toBe('Access denied');
        });
    });

    it('should return completed storyboard with video URL', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              jobId: 'storyboard_123',
              userId: 'test_user_123',
              status: 'completed',
              progress: 100,
              composedVideoUrl: 'https://example.com/final_video.mp4',
              updatedAt: new Date()
            }])
          })
        })
      });

      const response = await request(app)
        .get('/api/video/storyboard/storyboard_123')
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.progress).toBe(100);
      expect(response.body.composedVideoUrl).toBe('https://example.com/final_video.mp4');
    });

    it('should return failed storyboard with error message', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              jobId: 'storyboard_123',
              userId: 'test_user_123',
              status: 'failed',
              progress: 50,
              errorMessage: 'Scene generation failed',
              updatedAt: new Date()
            }])
          })
        })
      });

      const response = await request(app)
        .get('/api/video/storyboard/storyboard_123')
        .expect(200);

      expect(response.body.status).toBe('failed');
      expect(response.body.error).toBe('Scene generation failed');
    });
  });

  describe('Environment and Security', () => {
    it('should reject requests when Google AI is not configured', async () => {
      // Temporarily remove Google API key
      const originalKey = process.env.GOOGLE_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      // Re-import to get updated AI initialization
      delete require.cache[require.resolve('../video_storyboard')];
      const storyboardRouter = (await import('../video_storyboard')).default;
      
      app = express();
      app.use(express.json());
      app.use('/api/video', storyboardRouter);

      const validPayload = {
        scenes: [
          { motionPrompt: 'Test motion', duration: 5 },
          { motionPrompt: 'Test motion 2', duration: 5 }
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(503)
        .expect(res => {
          expect(res.body.error).toBe('AI service not available');
        });

      // Restore for other tests
      process.env.GOOGLE_API_KEY = originalKey;
    });

    it('should validate user authentication', async () => {
      // Mock unauthenticated request by overriding auth middleware
      jest.doMock('../stack-auth.js', () => ({
        requireStackAuth: (req: any, res: any, next: any) => {
          res.status(401).json({ error: 'Unauthorized' });
        }
      }));

      const validPayload = {
        scenes: [
          { motionPrompt: 'Test motion', duration: 5 },
          { motionPrompt: 'Test motion 2', duration: 5 }
        ],
        mode: 'sequential'
      };

      await request(app)
        .post('/api/video/storyboard')
        .send(validPayload)
        .expect(401);

      jest.clearAllMocks();
    });
  });
});

