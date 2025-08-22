import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || uuidv4();

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h'
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, tokenId: uuidv4() }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};