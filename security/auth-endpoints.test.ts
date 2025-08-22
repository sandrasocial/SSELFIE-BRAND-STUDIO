import { describe, it, expect, beforeAll, afterAll } from 'jest';
import request from 'supertest';
import { app } from '../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../test/helpers';

describe('Authentication Endpoints Security', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Login Endpoint', () => {
    it('should validate input against SQL injection', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        });
      expect(response.status).toBe(400);
    });

    it('should rate limit excessive login attempts', async () => {
      for(let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: "test@example.com",
            password: "wrongpass"
          });
      }
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "test@example.com",
          password: "wrongpass"
        });
      expect(response.status).toBe(429);
    });
  });

  describe('Token Security', () => {
    it('should issue secure JWT tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "valid@example.com",
          password: "correctpass"
        });
      expect(response.headers['set-cookie'][0]).toMatch(/^token=.*HttpOnly.*Secure.*SameSite/);
    });

    it('should validate token expiration', async () => {
      const expiredToken = 'expired.jwt.token';
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    it('should prevent enumeration attacks', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: "nonexistent@example.com"
        });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("If an account exists, reset instructions have been sent");
    });
  });

  describe('Session Management', () => {
    it('should invalidate old sessions on password change', async () => {
      // Login and get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: "test@example.com",
          password: "oldpass"
        });
      const token = loginResponse.headers['set-cookie'][0];
      
      // Change password
      await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', token)
        .send({
          oldPassword: "oldpass",
          newPassword: "newpass"
        });
        
      // Try to use old token
      const protectedResponse = await request(app)
        .get('/api/protected')
        .set('Cookie', token);
      expect(protectedResponse.status).toBe(401);
    });
  });
});