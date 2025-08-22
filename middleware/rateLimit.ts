import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  headers: true,
  keyGenerator: (req) => {
    return req.headers['x-real-ip'] || req.connection.remoteAddress || '';
  },
});