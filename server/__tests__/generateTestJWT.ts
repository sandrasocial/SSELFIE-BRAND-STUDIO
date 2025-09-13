// Utility to generate a valid test JWT for Stack Auth-protected endpoints
// Usage: import { generateTestJWT } from './generateTestJWT';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export function generateTestJWT(userId = '42585527', email = 'admin@sandrasocial.com', name = 'Admin User') {
  const privateKey = fs.readFileSync(path.join(__dirname, 'test-private.key'), 'utf8');
  const payload = {
    sub: userId,
    email,
    name,
    iss: 'https://api.stack-auth.com/api/v1/projects/253d7343-a0d4-43a1-be5c-822f590d40be',
    aud: '253d7343-a0d4-43a1-be5c-822f590d40be',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
  };
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}
