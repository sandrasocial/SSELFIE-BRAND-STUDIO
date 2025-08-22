import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration
export const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Request validation
export const validateRequest = (schema: any) => async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};