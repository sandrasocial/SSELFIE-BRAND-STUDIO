import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data', details: error });
    }
  };
};

// Common validation schemas
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  firstName: z.string().min(2),
  lastName: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});