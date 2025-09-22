/**
 * AI Generation Routes Tests
 * Tests for the AI generation routes module
 */

import request from 'supertest';
import express from 'express';
import aiGenerationRoutes from '../../routes/modules/ai-generation';
import { storage } from '../../storage';
import { errorHandler } from '../../routes/middleware/error-handler';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getUserVideosByStatus: jest.fn(),
    getMayaChats: jest.fn()
  }
}));

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  },
  requireActiveSubscription: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('AI Generation Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', aiGenerationRoutes);
    app.use(errorHandler); // Add error handling middleware
    jest.clearAllMocks();
  });

  describe('POST /api/story/draft', () => {
    it('should create story draft successfully', async () => {
      const response = await request(app)
        .post('/api/story/draft')
        .send({ concept: 'A magical adventure' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Story draft generation started',
          jobId: expect.stringMatching(/^draft_\d+$/),
          concept: 'A magical adventure'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when concept is missing', async () => {
      const response = await request(app)
        .post('/api/story/draft')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Concept is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /api/story/generate', () => {
    it('should generate full story successfully', async () => {
      const response = await request(app)
        .post('/api/story/generate')
        .send({ 
          concept: 'A space adventure',
          style: 'sci-fi',
          length: 'medium'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Story generation started',
          jobId: expect.stringMatching(/^story_\d+$/),
          concept: 'A space adventure',
          style: 'sci-fi',
          length: 'medium'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when concept is missing', async () => {
      const response = await request(app)
        .post('/api/story/generate')
        .send({ style: 'sci-fi' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Concept is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('GET /api/story/status/:jobId', () => {
    it('should return story status', async () => {
      const response = await request(app)
        .get('/api/story/status/story123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          jobId: 'story123',
          status: 'processing',
          progress: 50,
          message: 'Story generation in progress'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/video/generate-story', () => {
    it('should generate video from story successfully', async () => {
      const response = await request(app)
        .post('/api/video/generate-story')
        .send({ 
          story: 'A magical tale',
          style: 'fantasy',
          duration: 30
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Video generation started',
          jobId: expect.stringMatching(/^video_\d+$/),
          story: 'A magical tale',
          style: 'fantasy',
          duration: 30
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when story is missing', async () => {
      const response = await request(app)
        .post('/api/video/generate-story')
        .send({ style: 'fantasy' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Story is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /api/video/generate', () => {
    it('should generate video from prompt successfully', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({ 
          prompt: 'A sunset over mountains',
          style: 'cinematic',
          duration: 15
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Video generation started',
          jobId: expect.stringMatching(/^video_\d+$/),
          prompt: 'A sunset over mountains',
          style: 'cinematic',
          duration: 15
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when prompt is missing', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({ style: 'cinematic' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Prompt is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('GET /api/videos', () => {
    it('should return user videos', async () => {
      const mockVideos = [
        { id: 'video1', title: 'Test Video 1' },
        { id: 'video2', title: 'Test Video 2' }
      ];

      mockStorage.getUserVideosByStatus.mockResolvedValue(mockVideos as any);

      const response = await request(app)
        .get('/api/videos')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          videos: mockVideos,
          count: 2
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/victoria/generate', () => {
    it('should generate Victoria AI content successfully', async () => {
      const response = await request(app)
        .post('/api/victoria/generate')
        .send({ 
          prompt: 'Create a modern website',
          style: 'minimalist',
          businessType: 'tech'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Victoria AI generation started',
          jobId: expect.stringMatching(/^victoria_\d+$/),
          prompt: 'Create a modern website',
          style: 'minimalist',
          businessType: 'tech'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when prompt is missing', async () => {
      const response = await request(app)
        .post('/api/victoria/generate')
        .send({ style: 'minimalist' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Prompt is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /api/ai-images', () => {
    it('should generate AI images successfully', async () => {
      const response = await request(app)
        .post('/api/ai-images')
        .send({ 
          prompt: 'A beautiful landscape',
          style: 'photorealistic',
          count: 3
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'AI image generation started',
          jobId: expect.stringMatching(/^images_\d+$/),
          prompt: 'A beautiful landscape',
          style: 'photorealistic',
          count: 3
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when prompt is missing', async () => {
      const response = await request(app)
        .post('/api/ai-images')
        .send({ style: 'photorealistic' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Prompt is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('GET /api/maya-chats', () => {
    it('should return Maya chats', async () => {
      const mockChats = [
        { id: 'chat1', title: 'Maya Chat 1' },
        { id: 'chat2', title: 'Maya Chat 2' }
      ];

      mockStorage.getMayaChats.mockResolvedValue(mockChats as any);

      const response = await request(app)
        .get('/api/maya-chats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          chats: mockChats,
          count: 2
        },
        timestamp: expect.any(String)
      });
    });
  });
});
