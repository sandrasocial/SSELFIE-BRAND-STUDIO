import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Clean test database
    await prisma.user.deleteMany();
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@luxury.com',
          password: 'SecurePass123!',
          name: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@luxury.com');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Login Flow', () => {
    it('should successfully login registered user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@luxury.com',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@luxury.com',
          password: 'WrongPassword123!'
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    it('should initiate password reset', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset')
        .send({
          email: 'test@luxury.com'
        });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      // Note: Token handling will need to be implemented
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'valid-token'
        });
      
      expect(response.status).toBe(200);
    });
  });
});