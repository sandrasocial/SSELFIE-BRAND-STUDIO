import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';

const JWT_SECRET = process.env.JWT_SECRET;

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Token validation middleware
export const validateToken = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Password validation
export const validatePassword = (password: string): boolean => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
};

// Session management
export const validateSession = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  next();
};