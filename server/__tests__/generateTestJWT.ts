import jwt from 'jsonwebtoken';

export function generateTestJWT(payload: any = {}): string {
  const defaultPayload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    ...payload
  };

  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(defaultPayload, secret);
}
