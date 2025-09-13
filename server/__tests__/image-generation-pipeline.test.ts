// Set dummy Stripe secret before any imports
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'dummy-stripe-key';

import request from 'supertest';
import { app, setupApp } from '../index.js';
import { generateTestJWT } from './generateTestJWT';
import { createTestUser } from './createTestUser';

describe('Image Generation Pipeline', () => {
  beforeAll(async () => {
    await setupApp();
    // No test user creation needed, using admin user
  });

  it('should inject userId, gender, style, LoRA, flux params, and technical prompts', async () => {
    // Use admin user for test
    const userId = '42585527'; // ADMIN_USER_ID from .env
    const payload = {
      userId,
      gender: 'woman',
      style: 'luxury',
      vision: 'A luxury workspace with gold accents',
      // Add any other required fields for the endpoint
    };
    // Generate a valid test JWT and set as stack-access-token cookie
    const jwt = generateTestJWT(userId, 'admin@sandrasocial.com', 'Admin User');
    const res = await request(app)
      .post('/api/maya/generate')
      .set('Cookie', `stack-access-token=${jwt}`)
      .send(payload)
      .expect(200);

    // Validate prompt injection
    expect(res.body.prompt).toContain(userId);
    expect(res.body.prompt).toMatch(/woman|man|non-binary/);
    expect(res.body.prompt).toMatch(/luxury|editorial|business|lifestyle/);
    expect(res.body.prompt).toMatch(/LoRA|replicateModelId|trained model/);
    expect(res.body.prompt).toMatch(/steps\s*[:=]\s*50|guidance\s*scale\s*[:=]\s*5/);
    expect(res.body.prompt).toMatch(/anatomy|technical|creative/);

    // Validate LoRA weight
    expect(res.body.loraWeight).toBeCloseTo(1.1, 1);
    // Validate S3 URL
    expect(res.body.imageUrl).toMatch(/^https:\/\/.*amazonaws\.com\//);
    // Validate gallery/favourite fields
    expect(typeof res.body.isFavorite).toBe('boolean');
    expect(typeof res.body.isInGallery).toBe('boolean');
  });
});
