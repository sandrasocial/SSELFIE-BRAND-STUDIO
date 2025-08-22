import { NextApiRequest, NextApiResponse } from 'next';
import { getEnvVar } from '../utils/env';
import jwt from 'jsonwebtoken';

export interface Session {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export const createSession = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '24h' }
  );
};

export const getSession = (req: NextApiRequest): Session | null => {
  try {
    const token = req.cookies.auth || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    return jwt.verify(token, getEnvVar('JWT_SECRET')) as Session;
  } catch (error) {
    return null;
  }
};

export const clearSession = (res: NextApiResponse): void => {
  res.setHeader('Set-Cookie', 'auth=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
};