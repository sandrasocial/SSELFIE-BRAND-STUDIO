/**
 * Maya Routes Tests
 * Tests for the Maya AI chat routes module
 */

import request from 'supertest';
import express from 'express';
import mayaRoutes from '../../routes/modules/maya';
import { errorHandler } from '../../routes/middleware/error-handler';

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

describe('Maya Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', mayaRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('POST /api/maya/chat', () => {
    it('should handle Maya chat message successfully', async () => {
      const response = await request(app)
        .post('/api/maya/chat')
        .send({ message: 'Hello Maya' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Maya chat endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/maya/chat/:chatId', () => {
    it('should get Maya chat history', async () => {
      const response = await request(app)
        .get('/api/maya/chat/chat123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Maya chat history endpoint (placeholder)',
          chatId: 'chat123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/maya/chat/:chatId/message', () => {
    it('should send message to Maya chat', async () => {
      const response = await request(app)
        .post('/api/maya/chat/chat123/message')
        .send({ message: 'New message to Maya' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Maya message endpoint (placeholder)',
          chatId: 'chat123'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/maya/chats', () => {
    it('should get all Maya chats for user', async () => {
      const response = await request(app)
        .get('/api/maya/chats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Maya chats list endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });
});
