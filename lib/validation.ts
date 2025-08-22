import { z } from 'zod';

export const emailSchema = z.string().email().min(5).max(255);

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const userInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100)
});