import request from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
  test('health check endpoint returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  describe('Protected Routes', () => {
    test('requires authentication', async () => {
      const response = await request(app).get('/api/protected');
      expect(response.status).toBe(401);
    });
  });
});