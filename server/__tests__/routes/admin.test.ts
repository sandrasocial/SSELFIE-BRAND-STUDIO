/**
 * Admin Routes Tests
 * Tests for the admin routes module
 */

import request from 'supertest';
import express from 'express';
import adminRoutes from '../../routes/modules/admin';

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireAdmin: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-user-123', email: 'admin@example.com', isAdmin: true };
    next();
  }
}));

describe('Admin Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', adminRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/validate-all-models', () => {
    it('should validate all models successfully', async () => {
      const response = await request(app)
        .get('/api/admin/validate-all-models')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Admin validate all models endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/consulting-agents/admin/consulting-chat', () => {
    it('should handle admin consulting chat', async () => {
      const response = await request(app)
        .post('/api/consulting-agents/admin/consulting-chat')
        .send({ message: 'Admin consultation request' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Admin consulting chat endpoint (placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/admin/consulting-chat', () => {
    it('should handle admin consulting chat (alternative path)', async () => {
      const response = await request(app)
        .post('/api/admin/consulting-chat')
        .send({ message: 'Admin consultation request' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Admin consulting chat endpoint (alternative path, placeholder)'
        },
        timestamp: expect.any(String)
      });
    });
  });
});
