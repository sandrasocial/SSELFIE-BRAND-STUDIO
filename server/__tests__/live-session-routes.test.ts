/**
 * Live Session Routes Tests
 * Tests for Stage Mode live session API endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock the database
const mockDb = {
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
};

// Mock drizzle
jest.mock('../db', () => ({
  db: mockDb
}));

// Mock the schema
jest.mock('../../shared/schema', () => ({
  liveSessions: {
    id: 'id',
    title: 'title',
    deckUrl: 'deck_url',
    mentiUrl: 'menti_url',
    ctaUrl: 'cta_url',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  insertLiveSessionSchema: {
    safeParse: jest.fn(),
  }
}));

// Mock auth middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id' };
  next();
};

// Create test app
function createTestApp(): Express {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(mockAuthMiddleware);
  
  const { liveSessionRoutes } = require('../routes/live-session');
  app.use('/api/live', liveSessionRoutes);
  
  return app;
}

describe('Live Session Routes', () => {
  let app: Express;
  const mockSessionId = uuidv4();
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  describe('POST /api/live/session', () => {
    const validSessionData = {
      title: 'Test Stage Session',
      deckUrl: 'https://example.com/deck',
      mentiUrl: 'https://mentimeter.com/poll/123',
      ctaUrl: 'https://example.com/cta'
    };

    it('should create a live session successfully', async () => {
      const mockSession = {
        id: mockSessionId,
        ...validSessionData,
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock schema validation
      const { insertLiveSessionSchema } = require('../../shared/schema');
      insertLiveSessionSchema.safeParse.mockReturnValue({
        success: true,
        data: validSessionData
      });

      // Mock database insert
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSession])
        })
      });

      const response = await request(app)
        .post('/api/live/session')
        .send(validSessionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toMatchObject({
        id: mockSessionId,
        title: validSessionData.title,
        createdBy: mockUserId
      });
    });

    it('should reject invalid session data', async () => {
      const { insertLiveSessionSchema } = require('../../shared/schema');
      insertLiveSessionSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ message: 'Title is required', path: ['title'] }]
        }
      });

      const response = await request(app)
        .post('/api/live/session')
        .send({ deckUrl: 'https://example.com/deck' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const appWithoutAuth = require('express')();
      appWithoutAuth.use(require('express').json());
      
      const { liveSessionRoutes } = require('../routes/live-session');
      appWithoutAuth.use('/api/live', liveSessionRoutes);

      const response = await request(appWithoutAuth)
        .post('/api/live/session')
        .send(validSessionData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should handle empty URLs', async () => {
      const sessionWithEmptyUrls = {
        title: 'Test Session',
        deckUrl: '',
        mentiUrl: '',
        ctaUrl: ''
      };

      const { insertLiveSessionSchema } = require('../../shared/schema');
      insertLiveSessionSchema.safeParse.mockReturnValue({
        success: true,
        data: sessionWithEmptyUrls
      });

      const mockSession = {
        id: mockSessionId,
        title: sessionWithEmptyUrls.title,
        deckUrl: null,
        mentiUrl: null,
        ctaUrl: null,
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSession])
        })
      });

      const response = await request(app)
        .post('/api/live/session')
        .send(sessionWithEmptyUrls)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session.deckUrl).toBeNull();
    });
  });

  describe('GET /api/live/session/:id', () => {
    it('should retrieve a live session', async () => {
      const mockSession = {
        id: mockSessionId,
        title: 'Test Session',
        deckUrl: 'https://example.com/deck',
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockSession])
          })
        })
      });

      const response = await request(app)
        .get(`/api/live/session/${mockSessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toMatchObject({
        id: mockSessionId,
        title: 'Test Session'
      });
    });

    it('should return 404 for non-existent session', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      const response = await request(app)
        .get('/api/live/session/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require valid session ID', async () => {
      const response = await request(app)
        .get('/api/live/session/')
        .expect(404);
    });
  });

  describe('PATCH /api/live/session/:id', () => {
    const updateData = {
      title: 'Updated Session Title',
      deckUrl: 'https://example.com/updated-deck'
    };

    it('should update a live session successfully', async () => {
      const mockExistingSession = {
        id: mockSessionId,
        title: 'Original Title',
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedSession = {
        ...mockExistingSession,
        ...updateData,
        updatedAt: new Date()
      };

      // Mock validation
      const { insertLiveSessionSchema } = require('../../shared/schema');
      insertLiveSessionSchema.safeParse.mockReturnValue({
        success: true,
        data: updateData
      });

      // Mock existing session check
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockExistingSession])
          })
        })
      });

      // Mock update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedSession])
          })
        })
      });

      const response = await request(app)
        .patch(`/api/live/session/${mockSessionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session.title).toBe(updateData.title);
    });

    it('should prevent updating sessions you do not own', async () => {
      const mockExistingSession = {
        id: mockSessionId,
        title: 'Original Title',
        createdBy: 'different-user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockExistingSession])
          })
        })
      });

      const response = await request(app)
        .patch(`/api/live/session/${mockSessionId}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent session', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      const response = await request(app)
        .patch(`/api/live/session/non-existent-id`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
