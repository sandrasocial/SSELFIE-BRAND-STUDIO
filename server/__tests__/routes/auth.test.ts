/**
 * Auth Routes Tests
 * Tests for the authentication routes module
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/modules/auth';
import { storage } from '../../storage';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserProfile: jest.fn()
  }
}));

// Mock the auth middleware
jest.mock('../../routes/middleware/auth', () => ({
  requireStackAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', authRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/auth/user', () => {
    it('should return user data when user exists', async () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .get('/api/auth/user')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          gender: 'other',
          profileImageUrl: undefined,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 404 when user not found', async () => {
      mockStorage.getUser.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/user')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /api/auth/auto-register', () => {
    it('should create new user when email does not exist', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'new@example.com',
        displayName: 'new',
        firstName: 'New',
        lastName: 'User',
        gender: undefined,
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockStorage.getUserByEmail.mockResolvedValue(null);
      mockStorage.createUser.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/auto-register')
        .send({ email: 'new@example.com', name: 'New User' })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'User created successfully',
          userId: 'new-user-123'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return existing user when email already exists', async () => {
      const mockUser = {
        id: 'existing-user-123',
        email: 'existing@example.com',
        displayName: 'Existing User'
      };

      mockStorage.getUserByEmail.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/auto-register')
        .send({ email: 'existing@example.com', name: 'Existing User' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'User already exists',
          userId: 'existing-user-123'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/auto-register')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Email is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /api/user/update-gender', () => {
    it('should update user gender successfully', async () => {
      mockStorage.updateUserProfile.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/user/update-gender')
        .send({ gender: 'woman' })
        .expect(200);

      expect(mockStorage.updateUserProfile).toHaveBeenCalledWith('test-user-123', {
        gender: 'woman',
        updatedAt: expect.any(Date)
      });

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Gender preference updated successfully'
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 400 for invalid gender value', async () => {
      const response = await request(app)
        .post('/api/user/update-gender')
        .send({ gender: 'invalid' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Invalid gender value. Must be "man", "woman", or "other"',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });

    it('should return 400 when gender is missing', async () => {
      const response = await request(app)
        .post('/api/user/update-gender')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Gender is required',
          code: 'VALIDATION_ERROR',
          timestamp: expect.any(String)
        }
      });
    });
  });
});
